import type { AccountUser } from "@/lib/ai-config";
import { buildConversationPrompt, type UpstreamMessage } from "@/lib/ai-upstream";

const ORIGIN = "https://ia.francestudent.org";
const API_BASE = "https://api.francestudent.ai";
const CLIENT_PLATFORM = "web_fs_ai";
const CLIENT_VERSION = "4005601";
const USER_AGENT =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:157.0) Gecko/20100101 Firefox/157.0";

export const SESSION_COOKIE = "next-auth.session-token";
const DEVICE_COOKIE = "francestudent-device-id";

const REQUEST_TIMEOUT_MS = 30_000;
const MAX_REDIRECTS = 15;
const MAX_PAGE_STEPS = 6;
const MAX_PAGE_CHARS = 2_000_000;
const REDIRECT_STATUSES = new Set([301, 302, 303, 307, 308]);

export type FranceStudentSession = {
  sessionToken: string;
  deviceId: string;
};

export type FranceStudentErrorCode =
  | "invalid_credentials"
  | "captcha"
  | "two_factor"
  | "blocked"
  | "network"
  | "session_expired"
  | "model_unavailable"
  | "invalid_request"
  | "upstream"
  | "unknown";

export class FranceStudentAuthError extends Error {
  status: number;
  code: FranceStudentErrorCode;

  constructor(message: string, status = 502, code: FranceStudentErrorCode = "unknown") {
    super(message);
    this.name = "FranceStudentAuthError";
    this.status = status;
    this.code = code;
  }
}

type CookieJar = Map<string, string>;

type FetchOptions = {
  method?: string;
  body?: string;
  headers?: Record<string, string>;
  referer?: string;
  jar: CookieJar;
  deviceId: string;
  signal?: AbortSignal;
};

type LocatedResponse = {
  response: Response;
  url: string;
};

function clientHeaders(deviceId: string): Record<string, string> {
  return {
    "User-Agent": USER_AGENT,
    "Accept-Language": "fr-FR,fr;q=0.9,en;q=0.8",
    Origin: ORIGIN,
    Referer: `${ORIGIN}/`,
    "francestudent-client-platform": CLIENT_PLATFORM,
    "francestudent-client-version": CLIENT_VERSION,
    "francestudent-device-id": deviceId,
  };
}

function toCookieHeader(jar: CookieJar) {
  return [...jar].map(([name, value]) => `${name}=${value}`).join("; ");
}

/**
 * Node expose `getSetCookie()`, mais certains proxys recollent les en-tÃªtes.
 * Ce repli dÃ©coupe proprement une liste `Set-Cookie` fusionnÃ©e.
 */
function splitSetCookie(raw: string | null): string[] {
  if (!raw) return [];
  return raw.split(/,(?=\s*[^;,=]+=)/g);
}

function captureCookies(response: Response, jar: CookieJar) {
  const headers = response.headers as Headers & {
    getSetCookie?: () => string[];
  };
  const list =
    typeof headers.getSetCookie === "function"
      ? headers.getSetCookie()
      : splitSetCookie(headers.get("set-cookie"));

  for (const cookie of list) {
    const [pair, ...attributes] = cookie.split(";");
    const separator = pair.indexOf("=");
    if (separator <= 0) continue;

    const name = pair.slice(0, separator).trim();
    const value = pair.slice(separator + 1).trim();
    const maxAge = attributes.find((item) => /^max-age=/i.test(item.trim()));
    const expires = attributes.find((item) => /^expires=/i.test(item.trim()));
    const expired =
      !value ||
      (maxAge !== undefined && Number(maxAge.split("=")[1]) <= 0) ||
      (expires !== undefined &&
        Date.parse(expires.slice(expires.indexOf("=") + 1)) < Date.now());

    if (expired) jar.delete(name);
    else jar.set(name, value);
  }
}

async function fsFetch(url: string, options: FetchOptions): Promise<Response> {
  const target = new URL(url);
  const isOrigin = target.host === new URL(ORIGIN).host;
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);
  const onAbort = () => controller.abort();

  if (options.signal?.aborted) controller.abort();
  else options.signal?.addEventListener("abort", onAbort, { once: true });

  const cookie = toCookieHeader(options.jar);

  try {
    const response = await fetch(target.toString(), {
      method: options.method ?? "GET",
      headers: {
        ...(isOrigin
          ? clientHeaders(options.deviceId)
          : {
              "User-Agent": USER_AGENT,
              "Accept-Language": "fr-FR,fr;q=0.9,en;q=0.8",
            }),
        Accept: "text/html,application/xhtml+xml,application/json;q=0.9,*/*;q=0.8",
        Referer: options.referer ?? `${ORIGIN}/`,
        ...(cookie ? { Cookie: cookie } : {}),
        ...(options.headers ?? {}),
      },
      body: options.body,
      redirect: "manual",
      cache: "no-store",
      signal: controller.signal,
    });

    captureCookies(response, options.jar);
    return response;
  } catch (error) {
    if (options.signal?.aborted) throw error;
    throw new FranceStudentAuthError(
      "Impossible de joindre France Student. VÃ©rifiez votre connexion rÃ©seau.",
      502,
      "network"
    );
  } finally {
    clearTimeout(timer);
    options.signal?.removeEventListener("abort", onAbort);
  }
}

async function followRedirects(
  response: Response,
  url: string,
  jar: CookieJar,
  deviceId: string,
  signal?: AbortSignal
): Promise<LocatedResponse> {
  let current = response;
  let currentUrl = url;
  let hops = 0;

  while (REDIRECT_STATUSES.has(current.status) && !jar.has(SESSION_COOKIE)) {
    const location = current.headers.get("location");
    if (!location) break;

    await current.text().catch(() => "");
    if (++hops > MAX_REDIRECTS) {
      throw new FranceStudentAuthError(
        "La connexion France Student a effectuÃ© trop de redirections.",
        502,
        "upstream"
      );
    }

    const next = new URL(location, currentUrl).toString();
    current = await fsFetch(next, {
      jar,
      deviceId,
      referer: currentUrl,
      signal,
    });
    currentUrl = next;
  }

  return { response: current, url: currentUrl };
}

function parseJson<T>(text: string): T | null {
  try {
    return JSON.parse(text) as T;
  } catch {
    return null;
  }
}

async function startOAuth(
  jar: CookieJar,
  deviceId: string,
  signal?: AbortSignal
): Promise<string> {
  let signinUrl = `${ORIGIN}/api/auth/signin/whmcs`;

  const providers = await fsFetch(`${ORIGIN}/api/auth/providers`, {
    jar,
    deviceId,
    signal,
    headers: { Accept: "application/json" },
  });

  if (providers.ok) {
    const data = parseJson<Record<string, { type?: string; signinUrl?: string }>>(
      await providers.text()
    );
    const oauth = Object.values(data ?? {}).find(
      (provider) =>
        provider?.type === "oauth" &&
        typeof provider.signinUrl === "string" &&
        provider.signinUrl.startsWith(ORIGIN)
    );
    if (oauth?.signinUrl) signinUrl = oauth.signinUrl;
  } else {
    await providers.text().catch(() => "");
  }

  const csrf = await fsFetch(`${ORIGIN}/api/auth/csrf`, {
    jar,
    deviceId,
    signal,
    headers: { Accept: "application/json" },
  });
  const csrfData = parseJson<{ csrfToken?: string }>(await csrf.text());

  if (!csrf.ok || !csrfData?.csrfToken) {
    throw new FranceStudentAuthError(
      "France Student n'a pas fourni de jeton de connexion. RÃ©essayez dans un instant.",
      csrf.status || 502,
      "upstream"
    );
  }

  const signin = await fsFetch(signinUrl, {
    method: "POST",
    jar,
    deviceId,
    signal,
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      Origin: ORIGIN,
      "X-Auth-Return-Redirect": "1",
      Accept: "application/json",
    },
    body: new URLSearchParams({
      csrfToken: csrfData.csrfToken,
      callbackUrl: "/",
    }).toString(),
  });

  const signinText = await signin.text();
  const target =
    signin.headers.get("location") ??
    parseJson<{ url?: string }>(signinText)?.url;

  if (!target) {
    throw new FranceStudentAuthError(
      `France Student a refusÃ© de dÃ©marrer la connexion (HTTP ${signin.status}).`,
      signin.status || 502,
      "upstream"
    );
  }

  return new URL(target, ORIGIN).toString();
}

/* ------------------------------------------------------------------ */
/* Analyse minimale des formulaires HTML du portail WHMCS             */
/* ------------------------------------------------------------------ */

type HtmlField = {
  name: string;
  id: string;
  type: string;
  value: string;
  checked: boolean;
  disabled: boolean;
};

type HtmlButton = {
  name: string;
  value: string;
  type: string;
  label: string;
};

type HtmlForm = {
  action: string;
  method: string;
  fields: HtmlField[];
  buttons: HtmlButton[];
};

type LoginForm = {
  form: HtmlForm;
  username: HtmlField;
  password: HtmlField;
};

type ConsentForm = {
  form: HtmlForm;
  accept: { name: string; value: string; label: string };
};

const ENTITIES: Record<string, string> = {
  amp: "&",
  lt: "<",
  gt: ">",
  quot: '"',
  apos: "'",
  nbsp: " ",
};

function decodeEntities(text: string) {
  return text.replace(/&(#x[0-9a-f]+|#\d+|[a-z]+);/gi, (match, entity: string) => {
    if (entity.startsWith("#")) {
      const hex = entity[1]?.toLowerCase() === "x";
      const code = Number.parseInt(entity.slice(hex ? 2 : 1), hex ? 16 : 10);
      try {
        return String.fromCodePoint(code);
      } catch {
        return match;
      }
    }
    return ENTITIES[entity.toLowerCase()] ?? match;
  });
}

function stripNoise(html: string) {
  return html
    .replace(/<!--[\s\S]*?-->/g, "")
    .replace(/<(script|style|template|noscript)\b[\s\S]*?<\/\1\s*>/gi, "");
}

function textOf(html: string) {
  return decodeEntities(html.replace(/<[^>]*>/g, " "))
    .replace(/\s+/g, " ")
    .trim();
}

function parseAttributes(tag: string) {
  const attrs: Record<string, string> = {};
  const body = tag.replace(/^<\s*[\w:-]+/, "").replace(/\/?>$/, "");
  const pattern = /([^\s"'<>/=]+)(?:\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s"'=<>`]+)))?/g;
  let match: RegExpExecArray | null;

  while ((match = pattern.exec(body))) {
    const name = match[1].toLowerCase();
    if (!(name in attrs)) {
      attrs[name] = decodeEntities(match[2] ?? match[3] ?? match[4] ?? "");
    }
  }

  return attrs;
}

function parseForms(html: string, baseUrl: string): HtmlForm[] {
  const source = stripNoise(html);
  const forms: HtmlForm[] = [];
  const tagBody = `(?:"[^"]*"|'[^']*'|[^'">])*`;
  const formPattern = new RegExp(`(<form\\b${tagBody}>)([\\s\\S]*?)<\\/form\\s*>`, "gi");
  const inputPattern = new RegExp(`<input\\b${tagBody}>`, "gi");
  const buttonPattern = new RegExp(
    `(<button\\b${tagBody}>)([\\s\\S]*?)<\\/button\\s*>`,
    "gi"
  );
  let match: RegExpExecArray | null;

  while ((match = formPattern.exec(source))) {
    const attrs = parseAttributes(match[1]);
    const inner = match[2];
    const fields = (inner.match(inputPattern) ?? []).map((tag): HtmlField => {
      const field = parseAttributes(tag);
      return {
        name: field.name ?? "",
        id: field.id ?? "",
        type: (field.type ?? "text").toLowerCase(),
        value: field.value ?? "",
        checked: "checked" in field,
        disabled: "disabled" in field,
      };
    });
    const buttons = [...inner.matchAll(buttonPattern)].map((button): HtmlButton => {
      const attrsButton = parseAttributes(button[1]);
      return {
        name: attrsButton.name ?? "",
        value: attrsButton.value ?? "",
        type: (attrsButton.type ?? "submit").toLowerCase(),
        label: textOf(button[2]),
      };
    });

    forms.push({
      action: new URL(attrs.action || "", baseUrl).toString(),
      method: (attrs.method ?? "get").toUpperCase(),
      fields,
      buttons,
    });
  }

  return forms;
}

function findLoginForm(forms: HtmlForm[]): LoginForm | undefined {
  for (const form of forms) {
    const password = form.fields.find((field) => field.type === "password" && field.name);
    const candidates = form.fields.filter(
      (field) =>
        ["text", "email", "tel", ""].includes(field.type) &&
        field.name &&
        !field.disabled
    );
    if (!password || candidates.length === 0) continue;

    const username =
      candidates.find((field) => /user|mail|login|ident/i.test(`${field.name} ${field.id}`)) ??
      candidates[0];

    return { form, username, password };
  }
  return undefined;
}

function addSubmitter(body: URLSearchParams, form: HtmlForm) {
  const submitInput = form.fields.find((field) => field.type === "submit" && field.name);
  const submitButton = form.buttons.find((button) => button.type === "submit" && button.name);
  const submitter = submitInput ?? submitButton;
  if (submitter) body.set(submitter.name, submitter.value);
}

function buildLoginBody(
  login: LoginForm,
  credentials: { email: string; password: string }
) {
  const { form, username, password } = login;
  const body = new URLSearchParams();

  for (const field of form.fields) {
    if (!field.name || field.disabled) continue;
    if (field === username || field === password) continue;
    if (["password", "submit", "button", "image", "file", "reset"].includes(field.type)) {
      continue;
    }
    if (["checkbox", "radio"].includes(field.type) && !field.checked) continue;
    body.append(field.name, field.type === "checkbox" && field.value === "" ? "on" : field.value);
  }

  body.set(username.name, credentials.email);
  body.set(password.name, credentials.password);
  addSubmitter(body, form);
  return body;
}

function findConsentForm(forms: HtmlForm[]): ConsentForm | undefined {
  for (const form of forms) {
    const hasInput = form.fields.some(
      (field) =>
        (["text", "email", "tel", ""].includes(field.type) && field.name && !field.disabled) ||
        field.type === "password"
    );
    if (hasInput) continue;

    const submitters = [
      ...form.fields
        .filter((field) => field.type === "submit")
        .map((field) => ({ name: field.name, value: field.value, label: field.value })),
      ...form.buttons
        .filter((button) => button.type === "submit")
        .map((button) => ({ name: button.name, value: button.value, label: button.label })),
    ];
    const accept = submitters.find((submitter) =>
      /autoris|authori[sz]e|approve|allow|accepter|accept/i.test(
        `${submitter.name} ${submitter.value} ${submitter.label}`
      )
    );

    if (accept) return { form, accept };
  }
  return undefined;
}

function buildConsentBody(consent: ConsentForm) {
  const body = new URLSearchParams();
  for (const field of consent.form.fields) {
    if (!field.name || field.disabled) continue;
    if (["submit", "button", "image", "file", "reset", "password"].includes(field.type)) {
      continue;
    }
    if (["checkbox", "radio"].includes(field.type) && !field.checked) continue;
    body.append(field.name, field.value);
  }
  if (consent.accept.name) body.set(consent.accept.name, consent.accept.value);
  return body;
}

function pageTitle(html: string) {
  const match = /<title[^>]*>([\s\S]*?)<\/title>/i.exec(html);
  return match ? textOf(match[1]).slice(0, 80) : "";
}

function extractAlert(html: string) {
  const match =
    /<div\b[^>]*class=["'][^"']*\b(?:alert-danger|alert-error|login-error|errorbox)\b[^"']*["'][^>]*>([\s\S]*?)<\/div>/i.exec(
      stripNoise(html)
    );
  return match ? textOf(match[1]).slice(0, 200) : "";
}

function hasCaptchaWidget(html: string) {
  return /class=["'][^"']*\b(?:g-recaptcha|h-captcha|cf-turnstile)\b/i.test(stripNoise(html));
}

function looksLikeTwoFactor(html: string) {
  return /double authentification|authentification (?:Ã |a) deux|two-?factor|\b2fa\b|code de v[Ã©e]rification|authenticator|totp/i.test(
    textOf(stripNoise(html))
  );
}

function looksLikeChallenge(status: number, headers: Headers, html: string) {
  if (headers.get("cf-mitigated") === "challenge") return true;
  return (
    [403, 429, 503].includes(status) &&
    /just a moment|cf-chl|attention required|cloudflare/i.test(html)
  );
}

function guardPage(response: Response, page: string, url: string) {
  if (looksLikeChallenge(response.status, response.headers, page)) {
    throw new FranceStudentAuthError(
      "Cloudflare bloque la connexion automatique. Utilisez le portail officiel ou une clÃ© API.",
      response.status || 403,
      "blocked"
    );
  }
  if (response.status >= 400) {
    throw new FranceStudentAuthError(
      `La page de connexion France Student a rÃ©pondu HTTP ${response.status} (${new URL(url).host}).`,
      response.status,
      "upstream"
    );
  }
}

function withQuery(action: string, body: URLSearchParams) {
  const url = new URL(action);
  for (const [name, value] of body) url.searchParams.set(name, value);
  return url.toString();
}

async function submitForm(
  form: HtmlForm,
  body: URLSearchParams,
  referer: string,
  jar: CookieJar,
  deviceId: string,
  signal?: AbortSignal
): Promise<LocatedResponse> {
  const isPost = form.method === "POST";
  const target = isPost ? form.action : withQuery(form.action, body);

  const response = await fsFetch(target, {
    method: isPost ? "POST" : "GET",
    body: isPost ? body.toString() : undefined,
    referer,
    jar,
    deviceId,
    signal,
    headers: isPost
      ? {
          "Content-Type": "application/x-www-form-urlencoded",
          Origin: new URL(referer).origin,
        }
      : {},
  });

  return followRedirects(response, target, jar, deviceId, signal);
}

async function completeAuthorization(
  authorizeUrl: string,
  email: string,
  password: string,
  jar: CookieJar,
  deviceId: string,
  signal?: AbortSignal
) {
  let located = await followRedirects(
    await fsFetch(authorizeUrl, {
      jar,
      deviceId,
      referer: `${ORIGIN}/`,
      signal,
    }),
    authorizeUrl,
    jar,
    deviceId,
    signal
  );
  let submitted = false;

  for (let step = 0; step < MAX_PAGE_STEPS && !jar.has(SESSION_COOKIE); step++) {
    const page = (await located.response.text()).slice(0, MAX_PAGE_CHARS);
    guardPage(located.response, page, located.url);

    const forms = parseForms(page, located.url);
    const login = findLoginForm(forms);

    if (login) {
      if (submitted) {
        const alert = extractAlert(page);
        throw new FranceStudentAuthError(
          alert
            ? "Email ou mot de passe incorrect. VÃ©rifiez vos identifiants France Student."
            : "La connexion a Ã©tÃ© refusÃ©e par France Student. VÃ©rifiez vos identifiants.",
          401,
          "invalid_credentials"
        );
      }
      if (hasCaptchaWidget(page)) {
        throw new FranceStudentAuthError(
          "France Student demande un captcha : la connexion automatique est impossible. Utilisez le portail officiel ou une clÃ© API.",
          422,
          "captcha"
        );
      }

      submitted = true;
      located = await submitForm(
        login.form,
        buildLoginBody(login, { email, password }),
        located.url,
        jar,
        deviceId,
        signal
      );
      continue;
    }

    if (submitted && looksLikeTwoFactor(page)) {
      throw new FranceStudentAuthError(
        "La double authentification est activÃ©e sur ce compte. Utilisez le portail officiel ou une clÃ© API.",
        422,
        "two_factor"
      );
    }

    const consent = findConsentForm(forms);
    if (consent) {
      located = await submitForm(
        consent.form,
        buildConsentBody(consent),
        located.url,
        jar,
        deviceId,
        signal
      );
      continue;
    }

    const title = pageTitle(page);
    throw new FranceStudentAuthError(
      `France Student a affichÃ© une page inattendue pendant la connexion${
        title ? ` (Â« ${title} Â»)` : ""
      }. RÃ©essayez ou utilisez le portail officiel.`,
      502,
      "upstream"
    );
  }

  if (!jar.has(SESSION_COOKIE)) {
    throw new FranceStudentAuthError(
      "La connexion n'a pas abouti : France Student n'a pas dÃ©livrÃ© de session. RÃ©essayez dans un instant.",
      502,
      "upstream"
    );
  }
}

/**
 * Reproduit le parcours OAuth officiel de ia.francestudent.org (NextAuth + WHMCS)
 * pour obtenir le cookie de session `next-auth.session-token`.
 *
 * Le mot de passe reste en mÃ©moire le temps de la requÃªte : il n'est ni stockÃ©
 * ni journalisÃ©. Seul le jeton de session est conservÃ©, dans un cookie HttpOnly.
 */
export async function loginWithPassword(
  email: string,
  password: string,
  signal?: AbortSignal
): Promise<FranceStudentSession> {
  if (!email.trim() || !password) {
    throw new FranceStudentAuthError(
      "Renseignez votre email et votre mot de passe France Student.",
      400,
      "invalid_request"
    );
  }

  const deviceId = crypto.randomUUID();
  const jar: CookieJar = new Map([[DEVICE_COOKIE, deviceId]]);

  try {
    const authorizeUrl = await startOAuth(jar, deviceId, signal);
    await completeAuthorization(authorizeUrl, email.trim(), password, jar, deviceId, signal);

    const sessionToken = jar.get(SESSION_COOKIE);
    if (!sessionToken) {
      throw new FranceStudentAuthError(
        "France Student n'a pas dÃ©livrÃ© de jeton de session.",
        502,
        "upstream"
      );
    }

    return { sessionToken, deviceId };
  } catch (error) {
    if (error instanceof FranceStudentAuthError) throw error;
    throw new FranceStudentAuthError(
      "La connexion Ã  France Student a Ã©chouÃ©. RÃ©essayez dans un instant.",
      502,
      "unknown"
    );
  }
}

/* ------------------------------------------------------------------ */
/* API France Student : jeton d'accÃ¨s, profil, agents et chats         */
/* ------------------------------------------------------------------ */

const tokenCache = new Map<string, { token: string; expiresAt: number }>();

function sessionExpired() {
  return new FranceStudentAuthError(
    "Votre session France Student a expirÃ©. Reconnectez-vous.",
    401,
    "session_expired"
  );
}

function extractDetail(raw: string) {
  if (!raw) return "";
  const parsed = parseJson<unknown>(raw);
  if (parsed && typeof parsed === "object" && !Array.isArray(parsed)) {
    const record = parsed as Record<string, unknown>;
    const error = record.error;
    if (error && typeof error === "object") {
      const message = (error as Record<string, unknown>).message;
      if (typeof message === "string") return message.slice(0, 300);
    }
    if (typeof record.message === "string") return record.message.slice(0, 300);
  }
  return raw
    .replace(/<[^>]*>/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, 300);
}

function friendlyAccountError(status: number, detail: string) {
  const suffix = detail ? ` DÃ©tail : ${detail}` : "";
  switch (status) {
    case 400:
      return `La requÃªte n'a pas Ã©tÃ© acceptÃ©e par France Student.${suffix}`;
    case 401:
      return "Votre session France Student a expirÃ©. Reconnectez-vous.";
    case 402:
      return "Le budget IA de votre compte France Student est Ã©puisÃ©.";
    case 403:
      return "Votre compte France Student n'a pas accÃ¨s Ã  ce modÃ¨le, ou la requÃªte a Ã©tÃ© bloquÃ©e.";
    case 404:
      return "Cette conversation est introuvable sur France Student.";
    case 429:
      return "La limite de dÃ©bit de l'Offre IA est atteinte. Patientez quelques instants avant de rÃ©essayer.";
    default:
      if (status >= 500) {
        return `France Student rencontre une erreur (${status}). RÃ©essayez dans un instant.${suffix}`;
      }
      return `France Student a rÃ©pondu avec le statut ${status}.${suffix}`;
  }
}

async function apiFetch(
  path: string,
  options: {
    method?: string;
    accessToken: string;
    deviceId: string;
    body?: string;
    accept: string;
    signal?: AbortSignal;
  }
) {
  return fetch(`${API_BASE}${path}`, {
    method: options.method ?? "GET",
    headers: {
      ...clientHeaders(options.deviceId),
      Authorization: `Bearer ${options.accessToken}`,
      Accept: options.accept,
      ...(options.method && options.method !== "GET"
        ? { "Content-Type": "application/json" }
        : {}),
    },
    body: options.body,
    cache: "no-store",
    signal: options.signal,
  });
}

export async function getAccessToken(
  session: FranceStudentSession,
  options: { force?: boolean; signal?: AbortSignal } = {}
): Promise<string> {
  const cached = tokenCache.get(session.sessionToken);
  if (!options.force && cached && cached.expiresAt > Date.now() + 30_000) {
    return cached.token;
  }

  const jar: CookieJar = new Map([
    [SESSION_COOKIE, session.sessionToken],
    [DEVICE_COOKIE, session.deviceId],
  ]);

  const response = await fsFetch(`${ORIGIN}/api/auth/api-token`, {
    jar,
    deviceId: session.deviceId,
    referer: `${ORIGIN}/`,
    signal: options.signal,
    headers: { Accept: "*/*" },
  });
  const text = await response.text();

  if (response.status === 401) {
    tokenCache.delete(session.sessionToken);
    throw sessionExpired();
  }
  if (!response.ok) {
    throw new FranceStudentAuthError(
      friendlyAccountError(response.status, extractDetail(text)),
      response.status,
      "upstream"
    );
  }

  const data = parseJson<{ accessToken?: string; expiresIn?: number }>(text);
  if (!data?.accessToken) {
    throw new FranceStudentAuthError(
      "France Student n'a pas fourni de jeton d'accÃ¨s.",
      502,
      "upstream"
    );
  }

  const expiresIn = Number(data.expiresIn) || 300;
  tokenCache.set(session.sessionToken, {
    token: data.accessToken,
    expiresAt: Date.now() + expiresIn * 1000,
  });

  return data.accessToken;
}

export async function getAccountUser(
  session: FranceStudentSession,
  signal?: AbortSignal
): Promise<AccountUser> {
  const accessToken = await getAccessToken(session, { signal });
  const response = await apiFetch("/user/me", {
    accessToken,
    deviceId: session.deviceId,
    accept: "application/json",
    signal,
  });

  if (response.status === 401) throw sessionExpired();
  if (!response.ok) {
    const detail = await response.text().catch(() => "");
    throw new FranceStudentAuthError(
      friendlyAccountError(response.status, extractDetail(detail)),
      response.status,
      "upstream"
    );
  }

  const data = (await response.json().catch(() => null)) as {
    id?: number;
    name?: string;
    email?: string;
    avatar?: string | null;
  } | null;

  return {
    id: typeof data?.id === "number" ? data.id : undefined,
    name:
      typeof data?.name === "string" && data.name.trim()
        ? data.name.trim()
        : "Compte France Student",
    email: typeof data?.email === "string" ? data.email : "",
    avatar: typeof data?.avatar === "string" ? data.avatar : null,
  };
}

type Agent = {
  id: number;
  model: string;
  name?: string;
  isActive?: boolean;
};

/**
 * Table des agents officiels France Student de ia.francestudent.org (extraits de F12).
 * Sert de repli immédiat et fiable pour le compte étudiant.
 */
const FALLBACK_AGENTS: Record<string, number> = {
  "gpt-5.6-terra": 66,
  "gpt-5.6-luna": 65,
  "gpt-5.6-sol": 64,
  "gpt-6-sol": -1001,
  "gpt-6-luna": -1002,
  "gpt-6.1-sol": -1003,
  "gpt-6.1-terra": -1005,
  "claude-opus-5-5": -2001,
  "claude-haiku-5-5": -2002,
  "claude-sonnet-5-5": -2003,
  "claude-fable-5-1": -2004,
  "gemini-pro-agent": -3001,
  "gemini-3.8-flash-tiered": -3002,
};

let agentsCache: { at: number; agents: Agent[] } | null = null;

async function listAgents(
  session: FranceStudentSession,
  accessToken: string,
  signal?: AbortSignal
): Promise<Agent[]> {
  if (agentsCache && Date.now() - agentsCache.at < 10 * 60_000) {
    return agentsCache.agents;
  }

  try {
    const response = await apiFetch("/chats/agents", {
      accessToken,
      deviceId: session.deviceId,
      accept: "application/json",
      signal,
    });

    if (response.status === 401) throw sessionExpired();
    if (!response.ok) throw new Error(`HTTP ${response.status}`);

    const data = (await response.json()) as unknown;
    if (!Array.isArray(data)) throw new Error("Liste d'agents invalide");

    const agents = data
      .map((item): Agent | null => {
        if (!item || typeof item !== "object") return null;
        const record = item as Record<string, unknown>;
        if (typeof record.id !== "number" || typeof record.model !== "string") return null;
        return {
          id: record.id,
          model: record.model,
          name: typeof record.name === "string" ? record.name : undefined,
          isActive: typeof record.isActive === "boolean" ? record.isActive : undefined,
        };
      })
      .filter((agent): agent is Agent => agent !== null);

    agentsCache = { at: Date.now(), agents };
    return agents;
  } catch (error) {
    if (error instanceof FranceStudentAuthError) throw error;
    if (agentsCache) return agentsCache.agents;
    return [];
  }
}

async function resolveAgentId(
  session: FranceStudentSession,
  model: string,
  accessToken: string,
  signal?: AbortSignal
) {
  const agents = await listAgents(session, accessToken, signal);
  const agent = agents.find(
    (item) => item.model === model || String(item.id) === model
  );

  if (agent) return agent.id;

  const fallback = FALLBACK_AGENTS[model];
  if (fallback !== undefined) return fallback;

  throw new FranceStudentAuthError(
    `Le modÃ¨le Â« ${model} Â» n'est pas disponible avec votre compte France Student. Choisissez un modÃ¨le actif dans les rÃ©glages.`,
    400,
    "model_unavailable"
  );
}

export function buildAccountFollowUpPrompt(messages: UpstreamMessage[]) {
  const last = messages[messages.length - 1];
  if (!last || last.role !== "user") {
    throw new FranceStudentAuthError(
      "La derniÃ¨re demande doit Ãªtre un message utilisateur.",
      400,
      "invalid_request"
    );
  }

  return [
    "<rappel>",
    "RÃ©ponds uniquement avec l'objet JSON conforme au schÃ©ma fourni au dÃ©but de cette conversation. Aucun texte autour.",
    "</rappel>",
    "---",
    "## Nouvelle demande de l'Ã©tudiant",
    last.content,
  ].join("\n\n");
}

async function deleteRemoteChatWithToken(
  accessToken: string,
  deviceId: string,
  chatId: string,
  signal?: AbortSignal
) {
  const response = await apiFetch(`/chats/${encodeURIComponent(chatId)}`, {
    method: "DELETE",
    accessToken,
    deviceId,
    accept: "application/json",
    signal,
  });
  return response.ok || response.status === 404;
}

export async function deleteRemoteChat(
  session: FranceStudentSession,
  chatId: string,
  signal?: AbortSignal
) {
  const accessToken = await getAccessToken(session, { signal });
  return deleteRemoteChatWithToken(accessToken, session.deviceId, chatId, signal);
}

export type AccountChatResult = {
  response: Response;
  chatId?: string;
};

/**
 * Ouvre un chat en mode compte. Un nouveau chat est crÃ©Ã© au premier message,
 * puis les messages suivants sont ajoutÃ©s Ã  la mÃªme conversation distante.
 */
export async function openAccountChat(options: {
  session: FranceStudentSession;
  model: string;
  messages: UpstreamMessage[];
  chatId?: string;
  restart?: boolean;
  signal: AbortSignal;
}): Promise<AccountChatResult> {
  let accessToken = await getAccessToken(options.session, { signal: options.signal });
  const agentId = await resolveAgentId(
    options.session,
    options.model,
    accessToken,
    options.signal
  );

  let useExisting = Boolean(options.chatId) && !options.restart;

  if (options.restart && options.chatId) {
    await deleteRemoteChatWithToken(
      accessToken,
      options.session.deviceId,
      options.chatId,
      options.signal
    ).catch(() => undefined);
  }

  const send = (existing: boolean, token: string) => {
    const prompt = existing
      ? buildAccountFollowUpPrompt(options.messages)
      : buildConversationPrompt(options.messages);
    const path = existing
      ? `/chats/${encodeURIComponent(options.chatId!)}`
      : "/chats/stream";
    const body = existing
      ? { content: prompt, agentId, enableWebSearch: false }
      : { agentId, initialContent: prompt, enableWebSearch: false };

    return apiFetch(path, {
      method: "POST",
      accessToken: token,
      deviceId: options.session.deviceId,
      body: JSON.stringify(body),
      accept: "text/event-stream",
      signal: options.signal,
    });
  };

  let response = await send(useExisting, accessToken);

  if (response.status === 401) {
    accessToken = await getAccessToken(options.session, {
      force: true,
      signal: options.signal,
    });
    response = await send(useExisting, accessToken);
  }

  if (useExisting && response.status === 404) {
    useExisting = false;
    response = await send(false, accessToken);
  }

  if (!response.ok) {
    const detail = await response.text().catch(() => "");
    if (response.status === 401) throw sessionExpired();
    throw new FranceStudentAuthError(
      friendlyAccountError(response.status, extractDetail(detail)),
      response.status,
      "upstream"
    );
  }

  return { response, chatId: useExisting ? options.chatId : undefined };
}

export type RemoteProject = {
  id: string;
  name: string;
  ownerId?: number;
  customInstructions?: string;
  flags?: number;
  createdAt?: string;
};

export async function listRemoteProjects(
  session: FranceStudentSession,
  signal?: AbortSignal
): Promise<RemoteProject[]> {
  let accessToken = await getAccessToken(session, { signal });
  let response = await apiFetch("/projects", {
    method: "GET",
    accessToken,
    deviceId: session.deviceId,
    accept: "application/json",
    signal,
  });

  if (response.status === 401) {
    accessToken = await getAccessToken(session, { force: true, signal });
    response = await apiFetch("/projects", {
      method: "GET",
      accessToken,
      deviceId: session.deviceId,
      accept: "application/json",
      signal,
    });
  }

  if (!response.ok) {
    if (response.status === 401) throw sessionExpired();
    throw new FranceStudentAuthError(
      `Impossible de récupérer les projets (${response.status})`,
      response.status,
      "upstream"
    );
  }

  const data = (await response.json()) as RemoteProject[];
  return Array.isArray(data) ? data : [];
}

export async function createRemoteProject(
  session: FranceStudentSession,
  payload: { name: string; customInstructions?: string },
  signal?: AbortSignal
): Promise<RemoteProject> {
  let accessToken = await getAccessToken(session, { signal });
  let response = await apiFetch("/projects", {
    method: "POST",
    accessToken,
    deviceId: session.deviceId,
    body: JSON.stringify(payload),
    accept: "application/json",
    signal,
  });

  if (response.status === 401) {
    accessToken = await getAccessToken(session, { force: true, signal });
    response = await apiFetch("/projects", {
      method: "POST",
      accessToken,
      deviceId: session.deviceId,
      body: JSON.stringify(payload),
      accept: "application/json",
      signal,
    });
  }

  if (!response.ok) {
    if (response.status === 401) throw sessionExpired();
    const detail = await response.text().catch(() => "");
    throw new FranceStudentAuthError(
      friendlyAccountError(response.status, extractDetail(detail)),
      response.status,
      "upstream"
    );
  }

  return (await response.json()) as RemoteProject;
}

export async function deleteRemoteProject(
  session: FranceStudentSession,
  projectId: string,
  signal?: AbortSignal
): Promise<boolean> {
  let accessToken = await getAccessToken(session, { signal });
  let response = await apiFetch(`/projects/${encodeURIComponent(projectId)}`, {
    method: "DELETE",
    accessToken,
    deviceId: session.deviceId,
    accept: "application/json",
    signal,
  });

  if (response.status === 401) {
    accessToken = await getAccessToken(session, { force: true, signal });
    response = await apiFetch(`/projects/${encodeURIComponent(projectId)}`, {
      method: "DELETE",
      accessToken,
      deviceId: session.deviceId,
      accept: "application/json",
      signal,
    });
  }

  return response.ok || response.status === 404;
}

export type RemoteUserUsage = {
  chatBudget?: {
    usedPercent?: number;
    remainingPercent?: number;
    resetAt?: string;
    accountingUncertain?: boolean;
  };
  rateLimits?: Array<{
    type?: string;
    bucket?: string;
    limit?: number;
    used?: number;
    remaining?: number;
    resetAt?: string;
    usedPercent?: number;
    remainingPercent?: number;
  }>;
  rateLimitPowerUpActive?: boolean;
};

export type RemoteRateLimitCredits = {
  availableCount: number;
  resets?: Array<{
    id?: string;
    expiresAt?: string;
  }>;
};

export async function getRemoteUserUsage(
  session: FranceStudentSession,
  signal?: AbortSignal
): Promise<RemoteUserUsage | null> {
  try {
    let accessToken = await getAccessToken(session, { signal });
    let response = await apiFetch("/user/usage", {
      method: "GET",
      accessToken,
      deviceId: session.deviceId,
      accept: "application/json",
      signal,
    });

    if (response.status === 401) {
      accessToken = await getAccessToken(session, { force: true, signal });
      response = await apiFetch("/user/usage", {
        method: "GET",
        accessToken,
        deviceId: session.deviceId,
        accept: "application/json",
        signal,
      });
    }

    if (!response.ok) return null;
    return (await response.json()) as RemoteUserUsage;
  } catch {
    return null;
  }
}

export async function getRemoteRateLimitCredits(
  session: FranceStudentSession,
  signal?: AbortSignal
): Promise<RemoteRateLimitCredits | null> {
  try {
    let accessToken = await getAccessToken(session, { signal });
    let response = await apiFetch("/user/rate-limit-credits", {
      method: "GET",
      accessToken,
      deviceId: session.deviceId,
      accept: "application/json",
      signal,
    });

    if (response.status === 401) {
      accessToken = await getAccessToken(session, { force: true, signal });
      response = await apiFetch("/user/rate-limit-credits", {
        method: "GET",
        accessToken,
        deviceId: session.deviceId,
        accept: "application/json",
        signal,
      });
    }

    if (!response.ok) return null;
    return (await response.json()) as RemoteRateLimitCredits;
  } catch {
    return null;
  }
}

export async function activateRemoteRateLimitPowerUp(
  session: FranceStudentSession,
  signal?: AbortSignal
): Promise<boolean> {
  try {
    let accessToken = await getAccessToken(session, { signal });
    let response = await apiFetch("/user/rate-limit-credits/activate", {
      method: "POST",
      accessToken,
      deviceId: session.deviceId,
      accept: "application/json",
      signal,
    });

    if (response.status === 401) {
      accessToken = await getAccessToken(session, { force: true, signal });
      response = await apiFetch("/user/rate-limit-credits/activate", {
        method: "POST",
        accessToken,
        deviceId: session.deviceId,
        accept: "application/json",
        signal,
      });
    }

    return response.ok;
  } catch {
    return false;
  }
}

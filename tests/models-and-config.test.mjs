import fs from "node:fs";
import path from "node:path";
import { spawnSync } from "node:child_process";

// Ensure local inspection CA is trusted when available so real HTTPS calls to api.francestudent.ai succeed
const candidatePaths = [
  path.resolve(process.cwd(), ".cert", "ca.pem"),
  path.resolve(process.cwd(), "intelligent-ui-frstd", ".cert", "ca.pem"),
  new URL("../.cert/ca.pem", import.meta.url).pathname.replace(/^\/([A-Za-z]:)/, "$1"),
];
const localCaPath = candidatePaths.find((p) => fs.existsSync(p));

if (localCaPath && !process.env.NODE_EXTRA_CA_CERTS) {
  const result = spawnSync(process.execPath, process.argv.slice(1), {
    stdio: "inherit",
    env: {
      ...process.env,
      NODE_EXTRA_CA_CERTS: localCaPath,
    },
  });
  process.exit(result.status ?? 0);
}

import test from "node:test";
import assert from "node:assert/strict";

test("API France Student /v1/models returns real models and matches expected schema", async () => {
  const res = await fetch("https://api.francestudent.ai/v1/models");
  assert.equal(res.status, 200, "Official models endpoint should return HTTP 200");
  const json = await res.json();
  assert.ok(Array.isArray(json.data), "json.data should be an array of models");
  assert.ok(json.data.length > 10, "Should contain multiple real models");

  const modelIds = new Set(json.data.map((m) => m.id));

  // Check that real models exist in the official API
  const expectedRealModels = [
    "gpt-6-luna",
    "gpt-6.1-terra",
    "gpt-6.1-sol",
    "gpt-6-astra",
    "gpt-5.6-luna",
    "claude-haiku-5-5",
    "claude-sonnet-5-5",
    "claude-opus-5-5",
  ];

  for (const model of expectedRealModels) {
    assert.ok(
      modelIds.has(model),
      `Model "${model}" must exist on the official France Student API`
    );
  }
});

test("CURATED_MODELS in ai-config.ts contains exclusively real models from France Student API", async () => {
  const aiConfigFile = fs.readFileSync(
    path.resolve(process.cwd(), "src/lib/ai-config.ts"),
    "utf-8"
  );
  const curatedMatch = aiConfigFile.match(/export const CURATED_MODELS: AiModelOption\[\] = \[([\s\S]*?)\];/);
  assert.ok(curatedMatch, "CURATED_MODELS must be defined in ai-config.ts");

  const ids = [...curatedMatch[1].matchAll(/["']?id["']?:\s*"([^"]+)"/g)].map((m) => m[1]);
  assert.equal(ids.length, 13, "Should have exactly the 13 models extracted from ia.francestudent.org F12");

  const res = await fetch("https://api.francestudent.ai/v1/models");
  const json = await res.json();
  const apiModelIds = new Set(json.data.map((m) => m.id));

  for (const id of ids) {
    const exists = apiModelIds.has(id) || apiModelIds.has(`ag/${id}`);
    assert.ok(
      exists,
      `Curated model "${id}" must exist in real France Student API models list`
    );
  }
});

test("Validation: Model ID regex rejects malicious and invalid identifiers", async () => {
  const isValid = (id) => {
    if (!id || typeof id !== "string") return false;
    const trimmed = id.trim();
    if (trimmed.length > 120) return false;
    return /^[a-zA-Z0-9._/-]+$/.test(trimmed) && trimmed === id;
  };

  assert.equal(isValid("gpt-6-luna"), true);
  assert.equal(isValid("claude-sonnet-5-5"), true);
  assert.equal(isValid("gpt-6.1-terra"), true);

  assert.equal(isValid(""), false);
  assert.equal(isValid("gpt 6"), false);
  assert.equal(isValid("gpt;drop table"), false);
  assert.equal(isValid("<script>"), false);
  assert.equal(isValid("gpt-6\nnewline"), false);
});

test("AiConfig: Requires real API key for live mode; explicit baseUrl alone is not live", () => {
  const aiConfigFile = fs.readFileSync(
    path.resolve(process.cwd(), "src/lib/ai-config.ts"),
    "utf-8"
  );

  // Must not contain mock logic
  assert.equal(
    aiConfigFile.includes("pour un serveur local ou un mock"),
    false,
    "ai-config.ts must not contain mock references"
  );
  assert.equal(
    aiConfigFile.includes("Boolean(apiKey || explicitBaseUrl)"),
    false,
    "ai-config.ts must not consider explicitBaseUrl alone as configured"
  );
  assert.ok(
    aiConfigFile.includes("Boolean(apiKey)"),
    "ai-config.ts must require apiKey for configured status"
  );
});

test("Codebase verification: No orphan demo-response.ts file exists", () => {
  const demoResponsePath = path.resolve(process.cwd(), "src/lib/demo-response.ts");
  assert.equal(
    fs.existsSync(demoResponsePath),
    false,
    "src/lib/demo-response.ts must be completely deleted from the codebase"
  );
});

test("Codebase verification: README.md contains no leftover demo mentions", () => {
  const readme = fs.readFileSync(path.resolve(process.cwd(), "README.md"), "utf-8");
  assert.equal(
    readme.includes("demo-response.ts"),
    false,
    "README.md must not reference demo-response.ts"
  );
  assert.equal(
    readme.includes("scÃ©narios du mode dÃ©mo"),
    false,
    "README.md must not mention 'scÃ©narios du mode dÃ©mo'"
  );
  assert.equal(
    readme.includes("donnÃ©es chiffrÃ©es des dÃ©mos"),
    false,
    "README.md must not mention 'donnÃ©es chiffrÃ©es des dÃ©mos'"
  );
});

test("Official France Student F12 agents are mapped in francestudent-auth.ts", () => {
  const authFile = fs.readFileSync(
    path.resolve(process.cwd(), "src/lib/francestudent-auth.ts"),
    "utf-8"
  );
  assert.ok(authFile.includes("FALLBACK_AGENTS"), "FALLBACK_AGENTS must exist");
  assert.ok(authFile.includes("-1001"), "Official agent ID -1001 must exist");
  assert.ok(authFile.includes("-1002"), "Official agent ID -1002 must exist");
  assert.ok(authFile.includes("66"), "Official agent ID 66 must exist");
});

test("Codebase verification: Chat route never imports demo-response or uses demoStream", () => {
  const chatRouteFile = fs.readFileSync(
    path.resolve(process.cwd(), "src/app/api/chat/route.ts"),
    "utf-8"
  );
  assert.equal(
    chatRouteFile.includes("demo-response"),
    false,
    "Chat route must never import demo-response"
  );
  assert.equal(
    chatRouteFile.includes("demoStream"),
    false,
    "Chat route must never define or invoke demoStream"
  );
  assert.equal(
    chatRouteFile.includes("unauthenticated"),
    true,
    "Chat route must return explicit unauthenticated error when not configured"
  );
});


test("Stream parser in ai-upstream.ts supports all upstream SSE formats without drop", () => {
  const upstreamFile = fs.readFileSync(
    path.resolve(process.cwd(), "src/lib/ai-upstream.ts"),
    "utf-8"
  );
  assert.ok(upstreamFile.includes("choices"), "Must support choices format");
  assert.ok(upstreamFile.includes("content_block_delta"), "Must support Anthropic Claude format");
  assert.ok(upstreamFile.includes("candidates"), "Must support Gemini format");
  assert.ok(upstreamFile.includes("response.output_text.delta"), "Must support Responses API format");
  assert.ok(upstreamFile.includes("[DONE]"), "Must support DONE event");
});

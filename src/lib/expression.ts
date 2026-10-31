/**
 * Évaluateur d'expressions arithmétiques sûr, utilisé par le bloc `calculator`.
 *
 * Aucun eval, aucun accès aux propriétés : uniquement des nombres, des
 * variables nommées fournies par l'appelant, les opérateurs + - * / % ^,
 * des parenthèses et une courte liste de fonctions mathématiques.
 */

type Token =
  | { type: "number"; value: number }
  | { type: "name"; value: string }
  | { type: "op"; value: string };

const OPERATORS = new Set(["+", "-", "*", "/", "%", "^", "(", ")", ","]);
const MAX_LENGTH = 300;

const FUNCTIONS = new Map<string, { min: number; max: number; run: (args: number[]) => number }>([
  ["min", { min: 1, max: 8, run: (args) => Math.min(...args) }],
  ["max", { min: 1, max: 8, run: (args) => Math.max(...args) }],
  ["abs", { min: 1, max: 1, run: ([a]) => Math.abs(a) }],
  ["sqrt", { min: 1, max: 1, run: ([a]) => Math.sqrt(a) }],
  [
    "round",
    {
      min: 1,
      max: 2,
      run: ([a, digits = 0]) => {
        const factor = 10 ** Math.max(0, Math.min(8, Math.trunc(digits)));
        return Math.round(a * factor) / factor;
      },
    },
  ],
  ["floor", { min: 1, max: 1, run: ([a]) => Math.floor(a) }],
  ["ceil", { min: 1, max: 1, run: ([a]) => Math.ceil(a) }],
  ["pow", { min: 2, max: 2, run: ([a, b]) => a ** b }],
]);

function tokenize(source: string): Token[] | null {
  const tokens: Token[] = [];
  let index = 0;

  while (index < source.length) {
    const char = source[index];

    if (/\s/.test(char)) {
      index += 1;
      continue;
    }

    if (/[0-9.]/.test(char)) {
      let raw = "";
      while (index < source.length && /[0-9.]/.test(source[index])) {
        raw += source[index];
        index += 1;
      }
      if (!/^(\d+\.?\d*|\.\d+)$/.test(raw)) return null;
      tokens.push({ type: "number", value: Number(raw) });
      continue;
    }

    if (/[a-zA-Z_]/.test(char)) {
      let raw = "";
      while (index < source.length && /[a-zA-Z0-9_]/.test(source[index])) {
        raw += source[index];
        index += 1;
      }
      tokens.push({ type: "name", value: raw });
      continue;
    }

    if (OPERATORS.has(char)) {
      tokens.push({ type: "op", value: char });
      index += 1;
      continue;
    }

    return null;
  }

  return tokens;
}

export function evaluateExpression(
  formula: string,
  variables: Record<string, number>
): number | null {
  if (typeof formula !== "string") return null;
  const source = formula.trim();
  if (!source || source.length > MAX_LENGTH) return null;

  const parsed = tokenize(source);
  if (!parsed || parsed.length === 0) return null;
  const tokens: Token[] = parsed;

  const scope = new Map(Object.entries(variables));
  let index = 0;

  const peekOp = () => {
    const token = tokens[index];
    return token?.type === "op" ? token.value : null;
  };

  const matchOp = (op: string) => {
    if (peekOp() === op) {
      index += 1;
      return true;
    }
    return false;
  };

  function parseExpression(): number {
    let result = parseTerm();
    for (;;) {
      if (matchOp("+")) result += parseTerm();
      else if (matchOp("-")) result -= parseTerm();
      else return result;
    }
  }

  function parseTerm(): number {
    let result = parseUnary();
    for (;;) {
      if (matchOp("*")) result *= parseUnary();
      else if (matchOp("/")) result /= parseUnary();
      else if (matchOp("%")) result %= parseUnary();
      else return result;
    }
  }

  function parseUnary(): number {
    if (matchOp("+")) return parseUnary();
    if (matchOp("-")) return -parseUnary();
    return parsePower();
  }

  function parsePower(): number {
    const base = parsePrimary();
    if (matchOp("^")) return base ** parseUnary();
    return base;
  }

  function parsePrimary(): number {
    const token = tokens[index];
    if (!token) throw new Error("Expression incomplète");

    if (token.type === "number") {
      index += 1;
      return token.value;
    }

    if (token.type === "name") {
      index += 1;
      if (peekOp() === "(") {
        const spec = FUNCTIONS.get(token.value.toLowerCase());
        if (!spec) throw new Error(`Fonction inconnue : ${token.value}`);
        index += 1;
        const args: number[] = [];
        if (!matchOp(")")) {
          do {
            args.push(parseExpression());
          } while (matchOp(","));
          if (!matchOp(")")) throw new Error("Parenthèse fermante manquante");
        }
        if (args.length < spec.min || args.length > spec.max) {
          throw new Error("Nombre d'arguments invalide");
        }
        return spec.run(args);
      }
      const value = scope.get(token.value);
      if (value === undefined) throw new Error(`Variable inconnue : ${token.value}`);
      return value;
    }

    if (token.value === "(") {
      index += 1;
      const result = parseExpression();
      if (!matchOp(")")) throw new Error("Parenthèse fermante manquante");
      return result;
    }

    throw new Error("Symbole inattendu");
  }

  try {
    const result = parseExpression();
    if (index !== tokens.length) return null;
    return Number.isFinite(result) ? result : null;
  } catch {
    return null;
  }
}

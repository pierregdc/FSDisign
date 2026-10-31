type Token =
  | { type: "number"; value: number }
  | { type: "variable" }
  | { type: "op"; value: "+" | "-" | "*" | "/" | "(" | ")" };

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
      if (!/^\d*\.?\d+$/.test(raw)) return null;
      tokens.push({ type: "number", value: Number(raw) });
      continue;
    }

    if (/[a-zA-Z_]/.test(char)) {
      let raw = "";
      while (index < source.length && /[a-zA-Z0-9_]/.test(source[index])) {
        raw += source[index];
        index += 1;
      }
      if (raw.toLowerCase() !== "value") return null;
      tokens.push({ type: "variable" });
      continue;
    }

    if (char === "+" || char === "-" || char === "*" || char === "/" || char === "(" || char === ")") {
      tokens.push({ type: "op", value: char });
      index += 1;
      continue;
    }

    return null;
  }

  return tokens;
}

/**
 * Évaluateur arithmétique volontairement minimal pour les sliders.
 * Aucun eval, aucune fonction, aucune propriété : uniquement des nombres,
 * la variable `value` et les opérateurs + - * / ( ).
 */
export function evaluateFormula(formula: string, value: number): number | null {
  if (typeof formula !== "string") return null;
  const source = formula.trim();
  if (!source || source.length > 200 || !Number.isFinite(value)) return null;

  const tokens = tokenize(source);
  if (!tokens || tokens.length === 0) return null;
  const tokenList = tokens;

  let index = 0;

  function matchOp(op: "+" | "-" | "*" | "/" | "(" | ")") {
    const token = tokenList[index];
    if (token?.type === "op" && token.value === op) {
      index += 1;
      return true;
    }
    return false;
  }

  function parseExpression(): number {
    let result = parseTerm();
    for (;;) {
      if (matchOp("+")) result += parseTerm();
      else if (matchOp("-")) result -= parseTerm();
      else break;
    }
    return result;
  }

  function parseTerm(): number {
    let result = parseFactor();
    for (;;) {
      if (matchOp("*")) result *= parseFactor();
      else if (matchOp("/")) result /= parseFactor();
      else break;
    }
    return result;
  }

  function parseFactor(): number {
    if (matchOp("+")) return parseFactor();
    if (matchOp("-")) return -parseFactor();
    if (matchOp("(")) {
      const result = parseExpression();
      if (!matchOp(")")) throw new Error("Parenthèse fermante manquante");
      return result;
    }

    const token = tokenList[index];
    if (!token) throw new Error("Expression incomplète");
    if (token.type === "number") {
      index += 1;
      return token.value;
    }
    if (token.type === "variable") {
      index += 1;
      return value;
    }
    throw new Error("Jeton inattendu");
  }

  try {
    const result = parseExpression();
    if (index !== tokenList.length) return null;
    return Number.isFinite(result) ? result : null;
  } catch {
    return null;
  }
}

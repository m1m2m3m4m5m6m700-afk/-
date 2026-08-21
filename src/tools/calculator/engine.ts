const MAX_INPUT_LENGTH = 256;

export type AngleMode = "deg" | "rad";
export type CalculatorOptions = { angleMode?: AngleMode };

type Token =
  | { kind: "number"; value: number }
  | { kind: "operator"; value: string }
  | { kind: "function"; value: string }
  | { kind: "leftParen" }
  | { kind: "rightParen" };

type OperatorToken = Extract<Token, { kind: "operator" }>;

const FUNCTIONS = new Set(["sin", "cos", "tan", "asin", "acos", "atan", "sqrt", "abs", "ln", "log", "exp"]);
const OPERATORS = new Set(["+", "-", "*", "/", "%", "^", "!"]);
const PRECEDENCE: Record<string, number> = { "!": 5, "^": 4, "u-": 3, "*": 2, "/": 2, "%": 2, "+": 1, "-": 1 };
const RIGHT_ASSOCIATIVE = new Set(["^", "u-"]);

function tokenize(input: string): Token[] {
  if (!input.trim()) throw new Error("Expression is empty");
  if (input.length > MAX_INPUT_LENGTH) throw new Error("Expression is too long");
  const tokens: Token[] = [];
  let i = 0;
  while (i < input.length) {
    const char = input[i]!;
    if (/\s/.test(char)) { i += 1; continue; }
    if (/[0-9.]/.test(char)) {
      const start = i; let dots = 0;
      while (i < input.length && /[0-9.]/.test(input[i]!)) { if (input[i] === ".") dots += 1; i += 1; }
      if (dots > 1) throw new Error("Invalid number");
      const value = Number(input.slice(start, i));
      if (!Number.isFinite(value)) throw new Error("Invalid number");
      tokens.push({ kind: "number", value }); continue;
    }
    if (/[A-Za-z]/.test(char)) {
      const start = i;
      while (i < input.length && /[A-Za-z0-9]/.test(input[i]!)) i += 1;
      const name = input.slice(start, i).toLowerCase();
      if (name === "pi") tokens.push({ kind: "number", value: Math.PI });
      else if (name === "e") tokens.push({ kind: "number", value: Math.E });
      else if (FUNCTIONS.has(name)) tokens.push({ kind: "function", value: name });
      else throw new Error(`Unknown identifier: ${name}`);
      continue;
    }
    if (OPERATORS.has(char)) tokens.push({ kind: "operator", value: char });
    else if (char === "(") tokens.push({ kind: "leftParen" });
    else if (char === ")") tokens.push({ kind: "rightParen" });
    else throw new Error(`Unsupported character: ${char}`);
    i += 1;
  }
  return tokens;
}

function toRpn(tokens: Token[]): Token[] {
  const output: Token[] = [];
  const stack: Token[] = [];
  let prev: Token | undefined;

  for (const token of tokens) {
    if (token.kind === "number") {
      output.push(token);
    } else if (token.kind === "function") {
      stack.push(token);
    } else if (token.kind === "leftParen") {
      stack.push(token);
    } else if (token.kind === "rightParen") {
      while (stack.length) {
        const top = stack.at(-1)!;
        if (top.kind === "leftParen") break;
        output.push(stack.pop()!);
      }
      const leftParen = stack.at(-1);
      if (!leftParen || leftParen.kind !== "leftParen") throw new Error("Mismatched parentheses");
      stack.pop();
      const maybeFunction = stack.at(-1);
      if (maybeFunction?.kind === "function") output.push(stack.pop()!);
    } else if (token.kind === "operator") {
      let operator = token.value;
      if (operator === "-" && (!prev || prev.kind === "operator" || prev.kind === "leftParen")) operator = "u-";
      while (stack.length) {
        const top = stack.at(-1);
        if (!top || top.kind !== "operator") break;
        const topValue = (top as OperatorToken).value;
        const operatorPrecedence = PRECEDENCE[operator];
        const topPrecedence = PRECEDENCE[topValue];
        const pop = topPrecedence! > operatorPrecedence! || (topPrecedence === operatorPrecedence && !RIGHT_ASSOCIATIVE.has(operator));
        if (!pop) break;
        output.push(stack.pop()!);
      }
      stack.push({ kind: "operator", value: operator });
    } else {
      throw new Error("Unexpected token");
    }
    prev = token;
  }

  while (stack.length) {
    const token = stack.pop()!;
    if (token.kind === "leftParen") throw new Error("Mismatched parentheses");
    output.push(token);
  }
  return output;
}

function factorial(n: number): number {
  if (!Number.isInteger(n) || n < 0 || n > 170) throw new Error("Factorial requires an integer from 0 to 170");
  let result = 1; for (let i = 2; i <= n; i += 1) result *= i; return result;
}

function applyFunction(name: string, value: number, mode: AngleMode): number {
  const angle = mode === "deg" ? (value * Math.PI) / 180 : value;
  const result = ({
    sin: Math.sin(angle), cos: Math.cos(angle), tan: Math.tan(angle),
    asin: mode === "deg" ? (Math.asin(value) * 180) / Math.PI : Math.asin(value),
    acos: mode === "deg" ? (Math.acos(value) * 180) / Math.PI : Math.acos(value),
    atan: mode === "deg" ? (Math.atan(value) * 180) / Math.PI : Math.atan(value),
    sqrt: Math.sqrt(value), abs: Math.abs(value), ln: Math.log(value), log: Math.log10(value), exp: Math.exp(value),
  } as Record<string, number>)[name];
  if (result === undefined || !Number.isFinite(result)) throw new Error("Math domain error");
  return result;
}

export function evaluateExpression(input: string, options: CalculatorOptions = {}): number {
  const stack: number[] = []; const mode = options.angleMode ?? "deg";
  for (const token of toRpn(tokenize(input))) {
    if (token.kind === "number") { stack.push(token.value); continue; }
    if (token.kind === "function") { const value = stack.pop(); if (value === undefined) throw new Error("Missing operand"); stack.push(applyFunction(token.value, value, mode)); continue; }
    if (token.kind !== "operator") continue;
    if (token.value === "u-") { const value = stack.pop(); if (value === undefined) throw new Error("Missing operand"); stack.push(-value); continue; }
    if (token.value === "!") { const value = stack.pop(); if (value === undefined) throw new Error("Missing operand"); stack.push(factorial(value)); continue; }
    const right = stack.pop(); const left = stack.pop();
    if (left === undefined || right === undefined) throw new Error("Missing operand");
    const result = ({ "+": left + right, "-": left - right, "*": left * right, "/": right === 0 ? NaN : left / right, "%": left % right, "^": left ** right } as Record<string, number>)[token.value];
    if (result === undefined || !Number.isFinite(result)) throw new Error("Invalid arithmetic result");
    stack.push(result);
  }
  if (stack.length !== 1 || !Number.isFinite(stack[0])) throw new Error("Invalid expression");
  return stack[0]!;
}

export function formatResult(value: number): string {
  if (!Number.isFinite(value)) return "Error";
  if (Object.is(value, -0)) return "0";
  return Number(value.toPrecision(12)).toString();
}

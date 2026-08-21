import { useMemo, useState } from "react";
import { evaluateExpression, formatResult, type AngleMode } from "./engine";

const keyRows = [
  ["sin(", "cos(", "tan(", "ln(", "log(", "sqrt("],
  ["7", "8", "9", "(", ")", "÷"],
  ["4", "5", "6", "×", "%", "^"],
  ["1", "2", "3", "+", "-", "!"],
  ["0", ".", "π", "e", "⌫", "C"],
];

export function CalculatorTool() {
  const [expression, setExpression] = useState("");
  const [angleMode, setAngleMode] = useState<AngleMode>("deg");
  const [memory, setMemory] = useState(0);
  const [history, setHistory] = useState<Array<{ expression: string; result: string }>>([]);
  const [error, setError] = useState("");

  const result = useMemo(() => {
    if (!expression.trim()) return "0";
    try { return formatResult(evaluateExpression(expression, { angleMode })); }
    catch { return "Error"; }
  }, [expression, angleMode]);

  const append = (value: string) => {
    setError("");
    setExpression((current) => `${current}${value}`);
  };

  const calculate = () => {
    try {
      const value = evaluateExpression(expression, { angleMode });
      const formatted = formatResult(value);
      setHistory((items) => [{ expression, result: formatted }, ...items].slice(0, 20));
      setExpression(formatted);
      setError("");
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Invalid expression");
    }
  };

  const clear = () => { setExpression(""); setError(""); };
  const backspace = () => setExpression((current) => current.slice(0, -1));

  return (
    <main className="mx-auto flex min-h-screen max-w-6xl items-center justify-center px-4 py-8 sm:px-6">
      <section className="grid w-full max-w-5xl gap-6 lg:grid-cols-[1.6fr_0.9fr]">
        <div className="rounded-3xl border border-slate-800 bg-slate-950 p-5 text-white shadow-2xl shadow-black/30 sm:p-7">
          <div className="mb-5 flex items-center justify-between gap-4">
            <div>
              <p className="text-sm font-medium text-cyan-400">FLIXO Calculator</p>
              <h1 className="mt-1 text-2xl font-semibold tracking-tight">Scientific calculator</h1>
            </div>
            <div className="flex rounded-xl border border-slate-800 bg-slate-900 p-1 text-sm">
              {(["deg", "rad"] as const).map((mode) => (
                <button key={mode} type="button" onClick={() => setAngleMode(mode)} className={`rounded-lg px-3 py-1.5 ${angleMode === mode ? "bg-cyan-400 font-semibold text-slate-950" : "text-slate-300"}`}>
                  {mode.toUpperCase()}
                </button>
              ))}
            </div>
          </div>

          <div className="rounded-2xl border border-slate-800 bg-slate-900 p-4">
            <input aria-label="calculator expression" value={expression} onChange={(event) => setExpression(event.target.value)} onKeyDown={(event) => { if (event.key === "Enter") calculate(); }} className="w-full bg-transparent text-right text-lg text-slate-400 outline-none" placeholder="Type an expression…" />
            <output aria-label="calculator result" className="mt-2 block min-h-14 w-full overflow-x-auto text-right text-4xl font-semibold tracking-tight">{result}</output>
          </div>

          {error && <p role="alert" className="mt-3 rounded-xl border border-red-900 bg-red-950/50 px-3 py-2 text-sm text-red-300">{error}</p>}

          <div className="mt-5 grid grid-cols-6 gap-2">
            {keyRows.flat().map((key) => (
              <button key={key} type="button" onClick={() => key === "C" ? clear() : key === "⌫" ? backspace() : append(key === "÷" ? "/" : key === "×" ? "*" : key === "π" ? "pi" : key)} className="rounded-2xl border border-slate-800 bg-slate-900 px-2 py-3 text-sm font-medium text-slate-100 transition hover:border-cyan-500 hover:bg-slate-800 active:scale-[0.98]">
                {key}
              </button>
            ))}
            <button type="button" onClick={() => append("-")} className="rounded-2xl border border-slate-800 bg-slate-900 px-2 py-3 text-sm font-medium text-slate-100">±</button>
            <button type="button" onClick={calculate} className="col-span-5 rounded-2xl bg-cyan-400 px-3 py-3 text-lg font-bold text-slate-950 transition hover:bg-cyan-300">=</button>
          </div>

          <div className="mt-4 flex flex-wrap gap-2 text-sm">
            <button type="button" onClick={() => setMemory((value) => value + (Number.isFinite(Number(result)) ? Number(result) : 0))} className="rounded-lg border border-slate-800 px-3 py-2 text-slate-300">M+</button>
            <button type="button" onClick={() => setMemory((value) => value - (Number.isFinite(Number(result)) ? Number(result) : 0))} className="rounded-lg border border-slate-800 px-3 py-2 text-slate-300">M−</button>
            <button type="button" onClick={() => setExpression(String(memory))} className="rounded-lg border border-slate-800 px-3 py-2 text-slate-300">MR</button>
            <button type="button" onClick={() => setMemory(0)} className="rounded-lg border border-slate-800 px-3 py-2 text-slate-300">MC</button>
            <span className="rounded-lg px-3 py-2 text-slate-500">Memory: {formatResult(memory)}</span>
          </div>
        </div>

        <aside className="rounded-3xl border border-slate-200 bg-white p-5 shadow-xl shadow-slate-200/50 sm:p-7 dark:border-slate-800 dark:bg-slate-950 dark:shadow-black/20">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-cyan-600 dark:text-cyan-400">History</p>
              <h2 className="mt-1 text-xl font-semibold text-slate-900 dark:text-white">Recent calculations</h2>
            </div>
            <button type="button" onClick={() => setHistory([])} className="rounded-lg px-2 py-1 text-xs text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-900">Clear</button>
          </div>
          <div className="mt-5 space-y-2">
            {history.length === 0 ? <p className="text-sm text-slate-500">Your verified calculations will appear here.</p> : history.map((item, index) => (
              <button key={`${item.expression}-${index}`} type="button" onClick={() => setExpression(item.expression)} className="w-full rounded-xl border border-slate-200 p-3 text-left hover:bg-slate-50 dark:border-slate-800 dark:hover:bg-slate-900">
                <span className="block truncate text-xs text-slate-500">{item.expression}</span>
                <span className="mt-1 block text-lg font-semibold text-slate-900 dark:text-white">{item.result}</span>
              </button>
            ))}
          </div>
          <div className="mt-6 rounded-2xl border border-slate-200 p-4 text-sm text-slate-600 dark:border-slate-800 dark:text-slate-300">
            <p className="font-semibold text-slate-900 dark:text-white">Supported</p>
            <p className="mt-2">Arithmetic, %, powers, factorial, π, e, parentheses, trig, inverse trig, roots, logarithms, exponentials, memory and DEG/RAD modes.</p>
          </div>
        </aside>
      </section>
    </main>
  );
}

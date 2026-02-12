import { useState } from "react";
import { Calculator, Delete } from "lucide-react";

interface CalculatorCardProps {
  expression: string;
  result: number | string;
}

const buttons = [
  ["C", "±", "%", "÷"],
  ["7", "8", "9", "×"],
  ["4", "5", "6", "−"],
  ["1", "2", "3", "+"],
  ["0", ".", "⌫", "="],
];

function evaluate(expr: string): string {
  try {
    const normalized = expr
      .replace(/×/g, "*")
      .replace(/÷/g, "/")
      .replace(/−/g, "-");
    if (!normalized || !/\d/.test(normalized)) return "0";
    // eslint-disable-next-line no-new-func
    const fn = new Function(`"use strict"; return (${normalized});`);
    const res = fn();
    if (typeof res === "number" && isFinite(res)) {
      return Number.isInteger(res) ? String(res) : parseFloat(res.toFixed(10)).toString();
    }
    return "Error";
  } catch {
    return "Error";
  }
}

const CalculatorCard = ({ expression, result }: CalculatorCardProps) => {
  const [display, setDisplay] = useState(String(result));
  const [currentExpr, setCurrentExpr] = useState(String(expression));
  const [justEvaluated, setJustEvaluated] = useState(true);

  const handleButton = (btn: string) => {
    if (btn === "C") {
      setDisplay("0");
      setCurrentExpr("");
      setJustEvaluated(false);
      return;
    }

    if (btn === "⌫") {
      if (justEvaluated) {
        setCurrentExpr(display.slice(0, -1) || "0");
        setDisplay(display.slice(0, -1) || "0");
        setJustEvaluated(false);
      } else {
        const newExpr = currentExpr.slice(0, -1) || "0";
        setCurrentExpr(newExpr);
        setDisplay(newExpr);
      }
      return;
    }

    if (btn === "±") {
      if (display.startsWith("-")) {
        setDisplay(display.slice(1));
        setCurrentExpr(currentExpr.startsWith("-") ? currentExpr.slice(1) : currentExpr);
      } else {
        setDisplay("-" + display);
        setCurrentExpr("-" + currentExpr);
      }
      return;
    }

    if (btn === "=") {
      const res = evaluate(currentExpr);
      setDisplay(res);
      setCurrentExpr(res === "Error" ? "" : res);
      setJustEvaluated(true);
      return;
    }

    const isOp = ["÷", "×", "−", "+", "%"].includes(btn);

    if (justEvaluated && !isOp) {
      setCurrentExpr(btn);
      setDisplay(btn);
      setJustEvaluated(false);
      return;
    }

    const newExpr = justEvaluated ? currentExpr + btn : (currentExpr === "0" && !isOp ? btn : currentExpr + btn);
    setCurrentExpr(newExpr);
    setJustEvaluated(false);

    if (!isOp) {
      // Show the number part being typed
      const parts = newExpr.split(/[÷×−+%]/);
      setDisplay(parts[parts.length - 1] || "0");
    } else {
      setDisplay(newExpr);
    }
  };

  const isOperator = (btn: string) => ["÷", "×", "−", "+"].includes(btn);

  return (
    <div className="bg-secondary border border-border rounded-2xl overflow-hidden max-w-[260px] animate-fade-in shadow-lg">
      {/* Header */}
      <div className="flex items-center gap-2 px-4 pt-3 pb-1">
        <Calculator size={14} className="text-muted-foreground" />
        <span className="text-xs text-muted-foreground font-medium">Calculator</span>
      </div>

      {/* Display */}
      <div className="px-4 py-3">
        <div className="text-xs text-muted-foreground font-mono truncate min-h-[1rem]">
          {currentExpr || " "}
        </div>
        <div className="text-3xl font-bold text-foreground font-mono truncate">
          {display}
        </div>
      </div>

      {/* Buttons */}
      <div className="grid grid-cols-4 gap-[1px] bg-border/50 p-[1px]">
        {buttons.flat().map((btn, i) => (
          <button
            key={i}
            onClick={() => handleButton(btn)}
            className={`
              h-12 text-base font-medium transition-colors active:scale-95 active:brightness-90
              ${btn === "=" ? "bg-primary text-primary-foreground hover:brightness-110" : ""}
              ${isOperator(btn) || btn === "%" ? "bg-accent text-foreground hover:brightness-125" : ""}
              ${btn === "C" ? "bg-accent text-destructive hover:brightness-125" : ""}
              ${btn === "⌫" ? "bg-accent text-muted-foreground hover:brightness-125" : ""}
              ${btn === "±" ? "bg-accent text-foreground hover:brightness-125" : ""}
              ${!isOperator(btn) && btn !== "%" && btn !== "C" && btn !== "⌫" && btn !== "±" && btn !== "=" ? "bg-muted text-foreground hover:brightness-125" : ""}
              ${btn === "0" ? "" : ""}
            `}
          >
            {btn}
          </button>
        ))}
      </div>
    </div>
  );
};

/**
 * Tries to detect and evaluate a math expression from user input.
 * Returns { expression, result } if found, or null.
 */
export function tryCalculate(input: string): { expression: string; result: number | string } | null {
  const cleaned = input.trim().toLowerCase();

  const prefixes = /^(?:what\s+is\s+|calculate\s+|compute\s+|solve\s+|eval\s+)?/i;
  const expr = cleaned.replace(prefixes, "").trim();

  if (!expr) return null;

  let normalized = expr
    .replace(/×/g, "*")
    .replace(/÷/g, "/")
    .replace(/x(?=\d)/gi, "*")
    .replace(/(?<=\d)x(?=\d)/gi, "*")
    .replace(/\^/g, "**")
    .replace(/sqrt\(([^)]+)\)/gi, "Math.sqrt($1)")
    .replace(/pi/gi, "Math.PI")
    .replace(/,/g, "");

  const safeExpr = normalized.replace(/Math\.(sqrt|PI|pow|abs|ceil|floor|round|log|sin|cos|tan)/g, "MATHFN");
  if (!/^[\d\s+\-*/().%MATHFN]+$/.test(safeExpr)) return null;
  if (!/\d/.test(normalized)) return null;
  if (!/[+\-*/%]/.test(normalized) && !/Math\./.test(normalized)) return null;

  try {
    // eslint-disable-next-line no-new-func
    const fn = new Function(`"use strict"; return (${normalized});`);
    const result = fn();
    if (typeof result === "number" && isFinite(result)) {
      const display = Number.isInteger(result) ? result : parseFloat(result.toFixed(10));
      return { expression: expr, result: display };
    }
  } catch {}

  return null;
}

export default CalculatorCard;

import { Calculator } from "lucide-react";

interface CalculatorCardProps {
  expression: string;
  result: number | string;
}

const CalculatorCard = ({ expression, result }: CalculatorCardProps) => {
  return (
    <div className="bg-secondary border border-border rounded-2xl p-4 max-w-xs animate-fade-in">
      <div className="flex items-center gap-2 mb-3">
        <Calculator size={18} className="text-muted-foreground" />
        <span className="text-xs text-muted-foreground font-medium">Calculator</span>
      </div>
      <div className="text-sm text-muted-foreground mb-1 font-mono">{expression}</div>
      <div className="text-2xl font-bold text-foreground font-mono">= {result}</div>
    </div>
  );
};

/**
 * Tries to detect and evaluate a math expression from user input.
 * Returns { expression, result } if found, or null.
 */
export function tryCalculate(input: string): { expression: string; result: number | string } | null {
  const cleaned = input.trim().toLowerCase();

  // Match patterns like "what is 10x10", "calculate 5+3", "10*10", "100/5", "2^8", "sqrt(16)"
  const prefixes = /^(?:what\s+is\s+|calculate\s+|compute\s+|solve\s+|eval\s+)?/i;
  const expr = cleaned.replace(prefixes, "").trim();

  if (!expr) return null;

  // Normalize math symbols
  let normalized = expr
    .replace(/×/g, "*")
    .replace(/÷/g, "/")
    .replace(/x(?=\d)/gi, "*")     // "10x10" -> "10*10"
    .replace(/(?<=\d)x(?=\d)/gi, "*")
    .replace(/\^/g, "**")          // "2^8" -> "2**8"
    .replace(/sqrt\(([^)]+)\)/gi, "Math.sqrt($1)")
    .replace(/pi/gi, "Math.PI")
    .replace(/,/g, "");            // remove commas in numbers

  // Only allow safe characters: digits, operators, parens, dots, Math.*
  const safeExpr = normalized.replace(/Math\.(sqrt|PI|pow|abs|ceil|floor|round|log|sin|cos|tan)/g, "MATHFN");
  if (!/^[\d\s+\-*/().%MATHFN]+$/.test(safeExpr)) return null;
  if (!/\d/.test(normalized)) return null;
  // Must contain at least one operator
  if (!/[+\-*/%]/.test(normalized) && !/Math\./.test(normalized)) return null;

  try {
    // eslint-disable-next-line no-new-func
    const fn = new Function(`"use strict"; return (${normalized});`);
    const result = fn();
    if (typeof result === "number" && isFinite(result)) {
      // Format nicely
      const display = Number.isInteger(result) ? result : parseFloat(result.toFixed(10));
      return { expression: expr, result: display };
    }
  } catch {
    // Not a valid expression
  }

  return null;
}

export default CalculatorCard;

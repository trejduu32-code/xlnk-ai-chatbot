import { useState, useRef, useEffect } from "react";
import { ChevronDown, Check } from "lucide-react";
import { cn } from "@/lib/utils";

interface Model {
  value: string;
  label: string;
}

interface ModelDropdownProps {
  models: Model[];
  selected: string;
  onSelect: (value: string) => void;
}

const ModelDropdown = ({ models, selected, onSelect }: ModelDropdownProps) => {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const selectedLabel = models.find(m => m.value === selected)?.label || "Model";

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen(!open)}
        className={cn(
          "flex items-center gap-1.5 text-foreground text-xs sm:text-sm px-3 sm:px-4 py-2 rounded-2xl",
          "border border-white/15 outline-none transition-all duration-300 cursor-pointer",
          "backdrop-blur-xl bg-white/5",
          "shadow-[inset_0_1px_1px_rgba(255,255,255,0.1),0_4px_24px_rgba(0,0,0,0.3)]",
          "hover:bg-white/10 hover:border-white/25 hover:shadow-[inset_0_1px_1px_rgba(255,255,255,0.15),0_8px_32px_rgba(0,0,0,0.4)]",
          open && "bg-white/10 border-white/25"
        )}
      >
        <span className="truncate max-w-[70px] sm:max-w-none">{selectedLabel}</span>
        <ChevronDown size={14} className={cn("transition-transform duration-200", open && "rotate-180")} />
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-2 z-[100] min-w-[140px] rounded-xl border border-white/15 backdrop-blur-xl bg-popover shadow-[0_8px_32px_rgba(0,0,0,0.5)] overflow-hidden animate-fade-in">
          {models.map((model) => (
            <button
              key={model.value}
              onClick={() => {
                onSelect(model.value);
                setOpen(false);
              }}
              className={cn(
                "w-full flex items-center justify-between gap-3 px-4 py-2.5 text-sm transition-colors",
                "hover:bg-accent text-foreground",
                selected === model.value && "text-foreground bg-accent/50"
              )}
            >
              <span>{model.label}</span>
              {selected === model.value && <Check size={14} className="text-foreground shrink-0" />}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default ModelDropdown;

"use client";
import { cn } from "@/lib/utils";
export function TabBar({
  values,
  value,
  onValueChange,
  label,
  prefix,
}: {
  values: string[];
  value: string;
  onValueChange: (value: string) => void;
  label: string;
  prefix: string;
}) {
  return (
    <div role="tablist" aria-label={label} className="mb-8 flex gap-6 border-b">
      {values.map((item, index) => (
        <button
          key={item}
          id={`${prefix}-tab-${item}`}
          role="tab"
          tabIndex={value === item ? 0 : -1}
          aria-selected={value === item}
          aria-controls={`${prefix}-panel`}
          onClick={() => onValueChange(item)}
          onKeyDown={(event) => {
            if (!["ArrowLeft", "ArrowRight", "Home", "End"].includes(event.key))
              return;
            event.preventDefault();
            const next =
              event.key === "Home"
                ? 0
                : event.key === "End"
                  ? values.length - 1
                  : (index +
                      (event.key === "ArrowRight" ? 1 : -1) +
                      values.length) %
                    values.length;
            onValueChange(values[next]);
            event.currentTarget.parentElement
              ?.querySelectorAll<HTMLButtonElement>('[role="tab"]')
              [next].focus();
          }}
          className={cn(
            "min-h-12 border-b-2 px-1 text-sm font-medium",
            value === item
              ? "border-primary text-primary"
              : "border-transparent text-muted-foreground hover:text-foreground"
          )}
        >
          {item}
        </button>
      ))}
    </div>
  );
}

"use client";
import { useTheme } from "next-themes";
import { useSyncExternalStore } from "react";
import { Sun, Moon, Check } from "lucide-react";
import { Dropdown, MenuContent, menuItemClass } from "@/components/ui/menu";
import { Button } from "@/components/ui/button";
const subscribe = () => () => {};
export function ThemeToggle() {
  const mounted = useSyncExternalStore(
    subscribe,
    () => true,
    () => false
  );
  const { resolvedTheme, setTheme } = useTheme();
  const activeTheme = mounted && resolvedTheme === "dark" ? "dark" : "light";
  const Icon = activeTheme === "dark" ? Moon : Sun;
  return (
    <Dropdown.Root>
      <Dropdown.Trigger asChild>
        <Button variant="ghost" size="icon" aria-label="Change theme">
          <Icon />
        </Button>
      </Dropdown.Trigger>
      <MenuContent>
        <Dropdown.Label className="px-3 py-2 text-xs font-medium text-muted-foreground">
          Appearance
        </Dropdown.Label>
        <Dropdown.RadioGroup
          value={activeTheme}
          onValueChange={(value) => {
            document.documentElement.classList.add("theme-transition");
            setTheme(value);
            window.setTimeout(
              () =>
                document.documentElement.classList.remove("theme-transition"),
              200
            );
          }}
        >
          {[
            ["light", "Light", Sun],
            ["dark", "Dark", Moon],
          ].map(([value, label, ItemIcon]) => {
            const ModeIcon = ItemIcon as typeof Sun;
            return (
              <Dropdown.RadioItem
                key={String(value)}
                value={String(value)}
                className={menuItemClass}
              >
                <ModeIcon />
                {String(label)}
                <Dropdown.ItemIndicator className="ml-auto">
                  <Check className="size-4" />
                </Dropdown.ItemIndicator>
              </Dropdown.RadioItem>
            );
          })}
        </Dropdown.RadioGroup>
      </MenuContent>
    </Dropdown.Root>
  );
}

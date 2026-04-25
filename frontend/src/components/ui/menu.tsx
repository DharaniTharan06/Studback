"use client";
import * as Dropdown from "@radix-ui/react-dropdown-menu";
import type { ReactNode } from "react";
export { Dropdown };
export function MenuContent({
  children,
  align = "end",
}: {
  children: ReactNode;
  align?: "start" | "end";
}) {
  return (
    <Dropdown.Portal>
      <Dropdown.Content
        align={align}
        sideOffset={8}
        className="z-50 min-w-48 rounded-xl border bg-surface-elevated p-1.5 shadow-[var(--shadow)]"
      >
        {children}
      </Dropdown.Content>
    </Dropdown.Portal>
  );
}
export const menuItemClass =
  "flex cursor-pointer items-center gap-2 rounded-md px-3 py-2.5 text-sm outline-none data-[highlighted]:bg-muted data-[disabled]:opacity-50 [&_svg]:size-4";

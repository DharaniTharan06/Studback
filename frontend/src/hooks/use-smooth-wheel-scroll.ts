"use client";

import { useEffect, type RefObject } from "react";

export function useSmoothWheelScroll(
  ref: RefObject<HTMLDivElement | null>,
  enabled: boolean
) {
  useEffect(() => {
    const viewport = ref.current;
    if (!enabled || !viewport) return;
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    let target: number | null = null;
    let direction = 0;

    const cancel = () => {
      if (target !== null) {
        viewport.scrollTo({ top: viewport.scrollTop, behavior: "instant" });
        target = null;
      }
    };
    const onScroll = () => {
      if (target !== null && Math.abs(viewport.scrollTop - target) < 1)
        target = null;
    };
    const onWheel = (event: WheelEvent) => {
      if (
        event.defaultPrevented ||
        !event.cancelable ||
        event.ctrlKey ||
        event.shiftKey ||
        Math.abs(event.deltaX) > Math.abs(event.deltaY)
      )
        return;
      // Small/fractional pixel deltas usually come from a trackpad, whose
      // native momentum should remain responsive rather than being animated twice.
      const stepped =
        event.deltaMode !== 0 ||
        (Math.abs(event.deltaY) >= 40 && Number.isInteger(event.deltaY));
      if (reducedMotion.matches || !stepped) {
        cancel();
        return;
      }
      const delta =
        event.deltaY *
        (event.deltaMode === 1
          ? 16
          : event.deltaMode === 2
            ? viewport.clientHeight
            : 1);
      if (!delta) return;
      const nextDirection = Math.sign(delta);
      const start =
        target === null || nextDirection !== direction
          ? viewport.scrollTop
          : target;
      const max = viewport.scrollHeight - viewport.clientHeight;
      const next = Math.max(0, Math.min(max, start + delta));
      if (next === viewport.scrollTop) return;
      event.preventDefault();
      direction = nextDirection;
      target = next;
      viewport.scrollTo({ top: next, behavior: "smooth" });
    };

    viewport.addEventListener("wheel", onWheel, { passive: false });
    viewport.addEventListener("scroll", onScroll, { passive: true });
    viewport.addEventListener("pointerdown", cancel);
    viewport.addEventListener("keydown", cancel);
    reducedMotion.addEventListener("change", cancel);
    return () => {
      cancel();
      viewport.removeEventListener("wheel", onWheel);
      viewport.removeEventListener("scroll", onScroll);
      viewport.removeEventListener("pointerdown", cancel);
      viewport.removeEventListener("keydown", cancel);
      reducedMotion.removeEventListener("change", cancel);
    };
  }, [ref, enabled]);
}

"use client";
// beui.dev/components/motion/scroll-animation

import { motion, useInView, useReducedMotion } from "motion/react";
import { type ReactNode, type RefObject, useRef } from "react";

import { EASE_OUT } from "@/lib/ease";
import { cn } from "@/lib/utils";

/* tags que a revelação pode assumir: o próprio elemento entra, sem div a mais na grade */
type Tag = "div" | "h2" | "p" | "li" | "address" | "dl";

export interface ScrollRevealProps {
  children: ReactNode;
  /** Element rendered (default div). */
  as?: Tag;
  /** Slide distance in px before reveal. */
  y?: number;
  /** Enter blur in px (kept ≤ 10 per motion conventions). */
  blur?: number;
  /** Reveal duration in seconds. */
  duration?: number;
  delay?: number;
  /** Reveal only once (default) or every time it enters view. */
  once?: boolean;
  /** Portion of the element that must be visible to trigger. */
  amount?: "some" | "all" | number;
  /** Scroll root for contained scroll areas. Defaults to the viewport. */
  root?: RefObject<Element | null>;
  className?: string;
  id?: string;
}

export function ScrollReveal({
  children,
  as = "div",
  y = 16,
  blur = 8,
  duration = 0.6,
  delay = 0,
  once = true,
  amount = 0.3,
  root,
  className,
  id,
}: ScrollRevealProps) {
  const reduce = useReducedMotion();
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { root, once, amount });
  const Component = motion[as] as typeof motion.div;

  // o estado inicial é o mesmo no servidor e no navegador (sem erro de hidratação);
  // com movimento reduzido, deslocamento e desfoque somem na hora e só a opacidade anima
  const hidden = { opacity: 0, y, filter: `blur(${blur}px)` };
  const shown = { opacity: 1, y: 0, filter: "blur(0px)" };
  const instante = { duration: 0 };

  return (
    <Component
      ref={ref}
      id={id}
      data-revela=""
      initial={hidden}
      animate={inView ? shown : hidden}
      transition={{
        duration,
        ease: EASE_OUT,
        delay,
        ...(reduce ? { y: instante, filter: instante } : {}),
      }}
      className={cn(className)}
    >
      {children}
    </Component>
  );
}

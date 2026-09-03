/**
 * Bubble Game
 * Copyright (c) 2025 Soumyadip Sarkar. All rights reserved.
 * Licensed under the MIT License.
 */

import { useEffect, useRef, type ReactNode } from "react";
import { AnimatePresence, m } from "motion/react";
import { X } from "lucide-react";
import { Button } from "./Button";

interface SheetProps {
  open: boolean;
  title: string;
  onClose: () => void;
  children: ReactNode;
}

/**
 * A panel that rises from the bottom on a phone and lands centred on a
 * desktop. Escape closes it, the backdrop closes it, and focus goes into the
 * panel on open and back to the trigger on close.
 */
export const Sheet = ({ open, title, onClose, children }: SheetProps) => {
  const panelRef = useRef<HTMLDivElement>(null);
  const restoreRef = useRef<HTMLElement | null>(null);

  // Held in a ref so the effect below depends on `open` alone. Keying it on
  // `onClose` would re-run — and so hand focus back to the trigger — on every
  // parent render while the sheet is still open.
  const closeRef = useRef(onClose);
  useEffect(() => {
    closeRef.current = onClose;
  }, [onClose]);

  useEffect(() => {
    if (!open) return;

    restoreRef.current = document.activeElement as HTMLElement | null;
    panelRef.current?.focus();

    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.stopPropagation();
        closeRef.current();
      }
    };
    document.addEventListener("keydown", onKey);

    return () => {
      document.removeEventListener("keydown", onKey);
      restoreRef.current?.focus?.();
    };
  }, [open]);

  return (
    <AnimatePresence>
      {open && (
        <m.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1, pointerEvents: "auto" }}
          // The panel stays mounted while it animates out. Without this it
          // keeps swallowing taps for the whole exit, so the screen feels
          // dead for half a second after every dismissal.
          exit={{ opacity: 0, pointerEvents: "none" }}
          transition={{ duration: 0.16 }}
          className="fixed inset-0 z-50 flex items-end justify-center bg-navy/45 p-0 sm:items-center sm:p-4"
          onClick={onClose}
        >
          <m.div
            ref={panelRef}
            tabIndex={-1}
            role="dialog"
            aria-modal="true"
            aria-label={title}
            initial={{ y: 40, opacity: 0, scale: 0.98 }}
            animate={{ y: 0, opacity: 1, scale: 1 }}
            exit={{ y: 30, opacity: 0 }}
            transition={{ type: "spring", stiffness: 320, damping: 30 }}
            onClick={(event) => event.stopPropagation()}
            className="panel max-h-[calc(var(--vh)*88)] w-full max-w-lg overflow-y-auto rounded-t-[32px] p-5 no-scrollbar focus:outline-none sm:rounded-[32px] md:p-6"
          >
            <div className="mb-4 flex items-center justify-between gap-3">
              <h2 className="font-display text-2xl font-bold text-ink">
                {title}
              </h2>
              <Button
                variant="soft"
                size="chip"
                onClick={onClose}
                aria-label="Close"
              >
                <X size={17} strokeWidth={3} />
              </Button>
            </div>
            {children}
          </m.div>
        </m.div>
      )}
    </AnimatePresence>
  );
};

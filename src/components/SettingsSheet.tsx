/**
 * Bubble Game
 * Copyright (c) 2025 Soumyadip Sarkar. All rights reserved.
 * Licensed under the MIT License.
 */

import { useState, type ReactNode } from "react";
import { Moon, Smartphone, Sun, Trash2, Volume2 } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Sheet } from "@/components/ui/Sheet";
import { Toggle } from "@/components/ui/Toggle";
import type { Theme } from "@/hooks/useTheme";

interface SettingsSheetProps {
  open: boolean;
  onClose: () => void;
  soundEnabled: boolean;
  onToggleSound: () => void;
  hapticsEnabled: boolean;
  onToggleHaptics: () => void;
  theme: Theme;
  onToggleTheme: () => void;
  onReset: () => void;
}

const Row = ({
  icon,
  label,
  hint,
  control,
}: {
  icon: ReactNode;
  label: string;
  hint: string;
  control: ReactNode;
}) => (
  <div className="flex items-center gap-3 rounded-2xl border-2 border-hairline bg-panel-sunk px-3.5 py-3">
    <span className="text-ink-soft">{icon}</span>
    <div className="min-w-0 flex-1">
      <p className="font-display text-sm font-bold text-ink">{label}</p>
      <p className="text-xs text-ink-faint">{hint}</p>
    </div>
    {control}
  </div>
);

export const SettingsSheet = ({
  open,
  onClose,
  soundEnabled,
  onToggleSound,
  hapticsEnabled,
  onToggleHaptics,
  theme,
  onToggleTheme,
  onReset,
}: SettingsSheetProps) => {
  const [confirming, setConfirming] = useState(false);

  // Every close path runs through here, so the sheet is never left armed for
  // a destructive action.
  const close = () => {
    setConfirming(false);
    onClose();
  };

  return (
    <Sheet open={open} title="Settings" onClose={close}>
      <div className="space-y-2.5">
        <Row
          icon={<Volume2 size={19} strokeWidth={2.6} />}
          label="Sound"
          hint="Pops, combo tones and fanfares."
          control={
            <Toggle on={soundEnabled} onChange={onToggleSound} label="Sound" />
          }
        />
        <Row
          icon={<Smartphone size={19} strokeWidth={2.6} />}
          label="Vibration"
          hint="Haptic nudges on supported devices."
          control={
            <Toggle
              on={hapticsEnabled}
              onChange={onToggleHaptics}
              label="Vibration"
            />
          }
        />
        <Row
          icon={
            theme === "dark" ? (
              <Moon size={19} strokeWidth={2.6} />
            ) : (
              <Sun size={19} strokeWidth={2.6} />
            )
          }
          label="Theme"
          hint={theme === "dark" ? "Night" : "Day"}
          control={
            <Toggle
              on={theme === "dark"}
              onChange={onToggleTheme}
              label="Night theme"
            />
          }
        />
      </div>

      <div className="mt-5 rounded-2xl border-2 border-dashed border-hairline p-3.5">
        <p className="font-display text-sm font-bold text-ink">
          Reset progress
        </p>
        <p className="mt-0.5 text-xs text-ink-faint">
          Clears scores, badges, stats and your daily streak. This cannot be
          undone.
        </p>
        {confirming ? (
          <div className="mt-3 flex gap-2">
            <Button
              variant="soft"
              size="sm"
              onClick={() => setConfirming(false)}
            >
              Keep it
            </Button>
            <Button
              variant="danger"
              size="sm"
              onClick={() => {
                onReset();
                setConfirming(false);
              }}
            >
              <Trash2 size={15} strokeWidth={2.8} />
              Yes, erase everything
            </Button>
          </div>
        ) : (
          <Button
            variant="soft"
            size="sm"
            className="mt-3"
            onClick={() => setConfirming(true)}
          >
            <Trash2 size={15} strokeWidth={2.8} />
            Reset progress
          </Button>
        )}
      </div>

      <p className="mt-4 text-center text-xs text-ink-faint">
        Motion follows your system's reduce-motion setting automatically.
      </p>
    </Sheet>
  );
};

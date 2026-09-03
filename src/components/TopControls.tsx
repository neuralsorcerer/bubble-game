/**
 * Bubble Game
 * Copyright (c) Soumyadip Sarkar. All rights reserved.
 * Licensed under the MIT License.
 */

import { Settings, Trophy, Volume2, VolumeX } from "lucide-react";
import { Button } from "@/components/ui/Button";

interface TopControlsProps {
  soundEnabled: boolean;
  onToggleSound: () => void;
  onOpenStats: () => void;
  onOpenSettings: () => void;
}

export const TopControls = ({
  soundEnabled,
  onToggleSound,
  onOpenStats,
  onOpenSettings,
}: TopControlsProps) => (
  <div className="fixed right-3 top-3 z-40 flex items-center gap-2 md:right-5 md:top-5">
    <Button
      variant="panel"
      size="icon"
      onClick={onToggleSound}
      aria-pressed={soundEnabled}
      aria-label={soundEnabled ? "Mute sound" : "Unmute sound"}
    >
      {soundEnabled ? <Volume2 size={18} /> : <VolumeX size={18} />}
    </Button>
    <Button
      variant="panel"
      size="icon"
      onClick={onOpenStats}
      aria-label="Stats and badges"
    >
      <Trophy size={18} />
    </Button>
    <Button
      variant="panel"
      size="icon"
      onClick={onOpenSettings}
      aria-label="Settings"
    >
      <Settings size={18} />
    </Button>
  </div>
);

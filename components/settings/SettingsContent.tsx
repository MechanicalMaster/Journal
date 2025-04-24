"use client";

import { AppearanceSettings } from "./AppearanceSettings";
import { DataSettings } from "./DataSettings";
import { AboutSettings } from "./AboutSettings";

export function SettingsContent() {
  return (
    <div className="space-y-6">
      <AppearanceSettings />
      <DataSettings />
      <AboutSettings />
    </div>
  );
} 
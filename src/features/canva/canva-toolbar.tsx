"use client";

import type { ImageFormat } from "@/lib/canva-export";

export type ViewportMode = "desktop" | "tablet" | "mobile";

export type VersionSnapshot = {
  id: string;
  name: string;
  timestamp: number;
  data: unknown;
};

/**
 * Barre d'outils Canva retirée à la demande de l'utilisateur.
 * Retourne null pour éliminer la barre flottante de manière générale dans tous les blocs visuels.
 */
export function CanvaToolbar(_props?: {
  title?: string;
  svgCode?: string;
  jsonData?: unknown;
  htmlContent?: string;
  canUndo?: boolean;
  canRedo?: boolean;
  onUndo?: () => void;
  onRedo?: () => void;
  viewport?: ViewportMode;
  onChangeViewport?: (mode: ViewportMode) => void;
  onSaveVersion?: (name: string) => void;
  versions?: VersionSnapshot[];
  onRestoreVersion?: (version: VersionSnapshot) => void;
  onExportCustomRaster?: (format: ImageFormat) => Promise<void> | void;
  className?: string;
}) {
  return null;
}

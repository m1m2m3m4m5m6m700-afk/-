import { desktopToolCatalog } from "./catalog";
import { desktopToolExtensions } from "./extensions";
import { extendedDesktopToolSpecs } from "./extended";
import { supplementalDesktopTools } from "./supplemental";

export const allDesktopTools = [
  ...desktopToolCatalog,
  ...desktopToolExtensions,
  ...extendedDesktopToolSpecs,
  ...supplementalDesktopTools,
];

export type AllDesktopTool = (typeof allDesktopTools)[number];

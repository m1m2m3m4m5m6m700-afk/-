import { desktopToolCatalog } from "./catalog";
import { desktopToolExtensions } from "./extensions";
import { extendedDesktopToolSpecs } from "./extended";

export const allDesktopTools = [
  ...desktopToolCatalog,
  ...desktopToolExtensions,
  ...extendedDesktopToolSpecs,
];

export type AllDesktopTool = (typeof allDesktopTools)[number];

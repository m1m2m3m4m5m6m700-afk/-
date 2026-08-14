import { desktopToolCatalog, type DesktopToolSpec } from "./catalog";
import { desktopToolExtensions } from "./extensions";
import { extendedDesktopToolSpecs } from "./extended";

export const allDesktopTools: DesktopToolSpec[] = [
  ...desktopToolCatalog,
  ...desktopToolExtensions,
  ...extendedDesktopToolSpecs,
];

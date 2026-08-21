/**
 * Compatibility shim only.
 *
 * Canonical tool data lives in src/lib/tool-platform and is re-exported
 * through src/lib/data/domains/tools. This file must never become a data
 * catalog again; migrate consumers to @/lib/data when touched.
 */
export * from "@/lib/data/domains/tools";

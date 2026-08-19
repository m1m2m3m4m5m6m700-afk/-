/**
 * Backwards-compatible content adapter.
 *
 * Category identity and presentation are owned by the Tool Platform. Existing
 * data-layer imports can continue using the historical names during migration.
 */
export {
  categories,
  categoryById,
  sortedCategories,
  getCategory,
} from "@/lib/tool-platform/categories";
export type {
  ToolCategoryId as CategoryId,
  ToolCategoryPresentation as Category,
} from "@/lib/tool-platform/categories";

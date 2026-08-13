/**
 * Client-safe DB public types — re-export of the DTO/result shapes only.
 *
 * This barrel lives in `src/lib/db/` (NOT under `server/`) so the client may
 * import it for typing. It re-exports ONLY the result/DTO types from
 * `server/db/types.ts`. No connection strings, SQL, pool handles, or
 * `getDb()`/`config` reach the client — those stay under `server/` and are
 * imported only inside `createServerFn` handler bodies (stubbed in client).
 */

export type {
  DbFailure,
  DbFailureKind,
  DbResult,
  AttachmentDTO,
  MessageDTO,
  InternalNoteDTO,
  UserInfoDTO,
  ConversationDTO,
  InboxAnalyticsDTO,
  GlobalAnalyticsDTO,
  ToolRequestDTO,
} from "../server/db/types";

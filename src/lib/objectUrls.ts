import type { Attachment } from "./communicationStore";

export function revokeObjectUrlSafe(url?: string): void {
  if (!url || typeof URL === "undefined") return;
  if (/^https?:/i.test(url)) return;

  try {
    URL.revokeObjectURL(url);
  } catch {
    // ignore invalid or already revoked URLs
  }
}

export function revokeAttachmentUrls(attachments: Attachment[]): void {
  attachments.forEach((attachment) => revokeObjectUrlSafe(attachment.url));
}

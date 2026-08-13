/**
 * Email notification service — SERVER-ONLY.
 *
 * Sends server-side email notifications when:
 *   - a new message arrives (new conversation or new visitor message)
 *   - a new tool request arrives
 *
 * Uses `nodemailer` over SMTP. SMTP credentials live only in env
 * (`SMTP_HOST/PORT/USER/PASS/FROM`); never logged, never serialized. The
 * client never imports this module (server-only).
 *
 * Best-effort: when SMTP is not configured (`isEmailConfigured() === false`),
 * `sendNotification` resolves to `{ sent: false, reason: "not_configured" }`
 * — the DB write still succeeds. Failures are logged server-side only.
 */

import type { Transporter } from "nodemailer";
import { getEmailConfig, isEmailConfigured } from "./config";

let transporter: Transporter | null = null;

function getTransporter(): Transporter {
  if (transporter) return transporter;
  // Imported lazily so the client bundle (which never reaches this code)
  // and SSR build never eagerly requires nodemailer until a notification fires.
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const nodemailer = require("nodemailer") as typeof import("nodemailer");
  const cfg = getEmailConfig();
  transporter = nodemailer.createTransport({
    host: cfg.host,
    port: cfg.port,
    secure: cfg.port === 465,
    auth: cfg.user && cfg.pass ? { user: cfg.user, pass: cfg.pass } : undefined,
  });
  return transporter;
}

export interface NotificationResult {
  sent: boolean;
  reason?: string;
}

async function sendMail(subject: string, text: string): Promise<NotificationResult> {
  if (!isEmailConfigured()) {
    return { sent: false, reason: "not_configured" };
  }
  try {
    const cfg = getEmailConfig();
    const t = getTransporter();
    await t.sendMail({
      from: cfg.from,
      to: cfg.notifyTo,
      subject,
      text,
    });
    return { sent: true };
  } catch (err) {
    // Never throw on notification failure — the DB write must still succeed.
    const reason = err instanceof Error ? err.message : "unknown_error";
    return { sent: false, reason };
  }
}

export async function notifyNewMessage(input: {
  visitorName: string;
  visitorEmail: string;
  category: string;
  subject: string;
  messageText: string;
}): Promise<NotificationResult> {
  const subject = `[Flixo] New message: ${input.subject}`;
  const text = [
    `A new message arrived.`,
    ``,
    `From: ${input.visitorName} <${input.visitorEmail}>`,
    `Category: ${input.category}`,
    `Subject: ${input.subject}`,
    ``,
    `Message:`,
    input.messageText,
  ].join("\n");
  return sendMail(subject, text);
}

export async function notifyNewToolRequest(input: {
  toolName: string;
  description: string;
  requester: string;
}): Promise<NotificationResult> {
  const subject = `[Flixo] New tool request: ${input.toolName}`;
  const text = [
    `A new tool request arrived.`,
    ``,
    `Tool: ${input.toolName}`,
    `Requested by: ${input.requester}`,
    ``,
    `Description:`,
    input.description,
  ].join("\n");
  return sendMail(subject, text);
}

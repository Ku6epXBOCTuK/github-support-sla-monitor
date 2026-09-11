export const CREATED = new Date("2026-07-09T20:00:00+05:00");
export const AUTHOR = "Ku6epXBOCTuK";
export const SUPPORT = "GITHUB SUPPORT";

export interface CaseEvent {
  at: Date;
  kind: "system" | "author" | "support";
  label: string;
  text: string;
}

export const EVENTS: CaseEvent[] = [
  { at: new Date("2026-07-09T20:00:05+05:00"), kind: "author", label: "TICKET CREATED", text: "Ticket #4549142 submitted." },
  { at: new Date("2026-07-09T20:00:05+05:00"), kind: "system", label: "AUTO-ACK SENT", text: "Instant automated confirmation of receipt sent by a bot." },
  { at: new Date("2026-09-07T00:54:00+05:00"), kind: "author", label: "CONTACT AGAIN", text: "Wrote to the ticket again today requesting an update." },
  { at: new Date("2026-09-07T21:03:00+05:00"), kind: "system", label: "AUTO-REPLY RECEIVED", text: "Automated follow-up: \"Are you still in need of assistance with this?\"" },
  { at: new Date("2026-09-07T21:10:00+05:00"), kind: "author", label: "STILL NEEDED", text: "Confirmed the appeal is still needed and asked for the reason of the account suspension." },
  { at: new Date("2026-09-08T21:53:00+05:00"), kind: "support", label: "SUPPORT RESOLVED", text: "GitHub engineer: restrictions cleared, full access to GitHub restored." },
];

export const CREATED_MS = CREATED.getTime();

// the monitor freezes at the SUPPORT RESOLVED event — see the last entry of EVENTS
export const RESOLVED_AT = EVENTS.find((e) => e.label === "SUPPORT RESOLVED")!.at;
export const RESOLVED_MS = RESOLVED_AT.getTime();

export const LAST_EVENT = EVENTS[EVENTS.length - 1];

export function pad2(n: number): string {
  return String(n).padStart(2, "0");
}

export function fmtDate(d: Date): string {
  return `${pad2(d.getDate())}.${pad2(d.getMonth() + 1)}.${d.getFullYear()} ${pad2(d.getHours())}:${pad2(d.getMinutes())}`;
}

export function fmtClock(d: Date): string {
  return d.toLocaleTimeString("en-GB", { hour12: false });
}

export function fmtStamp(d: Date): string {
  return d.toLocaleString("en-GB", { hour12: false, day: "2-digit", month: "short", year: "numeric" });
}

export function fmtDaysHours(now: number, ref: number): string {
  const ms = Math.max(0, now - ref);
  const d = Math.floor(ms / 86400000);
  const h = Math.floor((ms % 86400000) / 3600000);
  return `${pad2(d)}d ${pad2(h)}h`;
}

export function daysFloat(now: number, ref: number): number {
  return (now - ref) / 86400000;
}

export function daysCeil(now: number): number {
  return Math.max(1, Math.ceil((now - CREATED_MS) / 86400000));
}

export function dayIndex(atMs: number): number {
  return Math.floor((atMs - CREATED_MS) / 86400000);
}
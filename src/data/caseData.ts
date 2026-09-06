export const CREATED = new Date("2026-07-09T20:00:00+05:00");
export const AUTHOR = "Ku6epXBOCTuK";

export interface CaseEvent {
  at: Date;
  kind: "system" | "author";
  label: string;
  text: string;
}

export const EVENTS: CaseEvent[] = [
  { at: new Date("2026-07-09T20:00:05+05:00"), kind: "author", label: "TICKET CREATED", text: "Ticket #4549142 submitted." },
  { at: new Date("2026-07-09T20:00:05+05:00"), kind: "system", label: "AUTO-ACK SENT", text: "Instant automated confirmation of receipt sent by a bot." },
  { at: new Date("2026-09-07T00:54:00+05:00"), kind: "author", label: "CONTACT AGAIN", text: "Wrote to the ticket again today requesting an update." },
];

export const CREATED_MS = CREATED.getTime();
export const LAST_EVENT = EVENTS[EVENTS.length - 1];
export const LAST_EVENT_MS = LAST_EVENT.at.getTime();
export const LAST_AUTHOR_EVENT = [...EVENTS].reverse().find((e) => e.kind === "author")!;
export const LAST_AUTHOR_MS = LAST_AUTHOR_EVENT.at.getTime();

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

export function fmtElapsed(now: number): string {
  const ms = Math.max(0, now - CREATED_MS);
  const d = Math.floor(ms / 86400000);
  const h = Math.floor((ms % 86400000) / 3600000);
  const m = Math.floor((ms % 3600000) / 60000);
  return `${pad2(d)}d ${pad2(h)}h ${pad2(m)}m`;
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
import { CREATED_MS, EVENTS, daysCeil, dayIndex, daysFloat } from "../data/caseData";

const FONT = "IBM Plex Mono";
const C = {
  gold: "#b99a62",
  red: "#e74c3c",
  redP90: "#b5342a",
  redP99: "#8e2f22",
  track: "#1e1f1c",
  muted: "#4a4a45",
  axis: "#5a5952",
  grid: "rgba(255,255,255,0.05)",
  border: "rgba(255,255,255,0.08)",
  legend: "#8b8a83",
};

type ChartCtor = new (ctx: CanvasRenderingContext2D, config: object) => unknown;

function getCtor(): ChartCtor | null {
  const ChartClass = (window as unknown as { Chart?: unknown }).Chart;
  return ChartClass ? (ChartClass as ChartCtor) : null;
}

let instances: { destroy(): void }[] = [];

function dispose(): void {
  for (const instance of instances) instance.destroy();
  instances = [];
}

function tooltip(): Record<string, unknown> {
  return {
    backgroundColor: "#0d0e0e",
    borderColor: "rgba(255,255,255,0.12)",
    borderWidth: 1,
    bodyColor: "#e9e4d9",
    titleColor: C.legend,
    bodyFont: { family: FONT, size: 10 },
    titleFont: { family: FONT, size: 9 },
    padding: 8,
  };
}

function buildRate(canvas: HTMLCanvasElement): void {
  const ctor = getCtor();
  const ctx = canvas.getContext("2d");
  if (!ctor || !ctx) return;
  instances.push(
    new ctor(ctx, {
      type: "doughnut",
      data: {
        labels: ["HUMAN REPLIES"],
        datasets: [{ data: [0, 100], backgroundColor: [C.red, C.track], borderWidth: 0 }],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        cutout: "74%",
        rotation: -90,
        circumference: 180,
        plugins: { legend: { display: false }, tooltip: { enabled: false } },
      },
    }),
  );
}

function buildPercentiles(canvas: HTMLCanvasElement, now: number): void {
  const ctor = getCtor();
  const ctx = canvas.getContext("2d");
  if (!ctor || !ctx) return;
  const wait = Number(daysFloat(now, CREATED_MS).toFixed(1));
  const datasets = [
    { label: "AVG", data: [wait, wait], borderColor: C.gold, borderWidth: 1, borderDash: [10, 6], pointRadius: 0, tension: 0 },
    { label: "P50", data: [wait, wait], borderColor: C.red, borderWidth: 1.5, pointRadius: 0, tension: 0 },
    { label: "P90", data: [wait, wait], borderColor: C.redP90, borderWidth: 1.5, borderDash: [5, 4], pointRadius: 0, tension: 0 },
    { label: "P99", data: [wait, wait], borderColor: C.redP99, borderWidth: 1.5, borderDash: [2, 4], pointRadius: 0, tension: 0 },
  ];
  instances.push(
    new ctor(ctx, {
      type: "line",
      data: { labels: ["START", "TODAY"], datasets },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        interaction: { mode: "index", intersect: false },
        plugins: {
          legend: { display: true, position: "bottom", align: "start", labels: { color: C.legend, boxWidth: 12, font: { family: FONT, size: 9 } } },
          tooltip: {
            ...tooltip(),
            callbacks: {
              label: (item) => ` ${item.dataset.label || ""}: ${wait}d (SINGLE SAMPLE)`,
            },
          },
        },
        scales: {
          x: { ticks: { color: C.axis, font: { family: FONT, size: 9 }, maxRotation: 0 }, grid: { color: C.grid }, border: { color: C.border } },
          y: {
            beginAtZero: true,
            title: { display: true, text: "DAYS", color: C.axis, font: { family: FONT, size: 8 } },
            ticks: { color: C.axis, font: { family: FONT, size: 9 } },
            grid: { color: C.grid },
            border: { color: C.border },
          },
        },
      },
    }),
  );
}

function buildPerDay(canvas: HTMLCanvasElement, now: number): void {
  const ctor = getCtor();
  const ctx = canvas.getContext("2d");
  if (!ctor || !ctx) return;
  const days = daysCeil(now);
  const mine: number[] = new Array(days).fill(0);
  const bot: number[] = new Array(days).fill(0);
  const human: number[] = new Array(days).fill(0);
  for (const e of EVENTS) {
    const idx = dayIndex(e.at.getTime());
    if (idx < 0 || idx >= days) continue;
    if (e.kind === "author") mine[idx]++;
    else bot[idx]++;
  }
  const labels = Array.from({ length: days }, (_, i) => `D${i}`);
  const axis = {
    ticks: { color: C.axis, font: { family: FONT, size: 8 }, maxTicksLimit: 10, maxRotation: 0 },
    grid: { color: C.grid },
    border: { color: C.border },
  };
  instances.push(
    new ctor(ctx, {
      type: "bar",
      data: {
        labels,
        datasets: [
          { label: "MY MESSAGES", data: mine, backgroundColor: C.gold, borderColor: C.gold, borderWidth: 1 },
          { label: "BOT REACTIONS", data: bot, backgroundColor: C.muted, borderColor: C.muted, borderWidth: 1 },
          { label: "HUMAN REPLIES", data: human, backgroundColor: C.red, borderColor: C.red, borderWidth: 1 },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        interaction: { mode: "index", intersect: false },
        plugins: {
          legend: { display: true, position: "bottom", align: "start", labels: { color: C.legend, boxWidth: 12, font: { family: FONT, size: 9 } } },
          tooltip: tooltip(),
        },
        scales: {
          x: axis,
          y: {
            beginAtZero: true,
            title: { display: true, text: "REPLIES", color: C.axis, font: { family: FONT, size: 8 } },
            ticks: { color: C.axis, font: { family: FONT, size: 9 }, precision: 0 },
            grid: { color: C.grid },
            border: { color: C.border },
          },
        },
      },
    }),
  );
}

function buildWait(canvas: HTMLCanvasElement, now: number): void {
  const ctor = getCtor();
  const ctx = canvas.getContext("2d");
  if (!ctor || !ctx) return;
  const days = daysCeil(now);
  const data = Array.from({ length: days }, (_, i) => i);
  const labels = Array.from({ length: days }, (_, i) => `D${i}`);
  const grad = ctx.createLinearGradient(0, 0, 0, 200);
  grad.addColorStop(0, "rgba(231,76,60,0.28)");
  grad.addColorStop(1, "rgba(231,76,60,0)");
  instances.push(
    new ctor(ctx, {
      type: "line",
      data: {
        labels,
        datasets: [
          {
            label: "DAYS WAITED",
            data,
            borderColor: C.red,
            borderWidth: 1.5,
            backgroundColor: grad,
            fill: true,
            tension: 0,
            pointRadius: 0,
            pointBackgroundColor: C.red,
            pointHoverRadius: 3,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        interaction: { mode: "index", intersect: false },
        plugins: {
          legend: { display: true, position: "bottom", align: "start", labels: { color: C.legend, boxWidth: 12, font: { family: FONT, size: 9 } } },
          tooltip: tooltip(),
        },
        scales: {
          x: {
            ticks: { color: C.axis, font: { family: FONT, size: 8 }, maxTicksLimit: 10, maxRotation: 0 },
            grid: { color: C.grid },
            border: { color: C.border },
          },
          y: {
            beginAtZero: true,
            title: { display: true, text: "DAYS", color: C.axis, font: { family: FONT, size: 8 } },
            ticks: { color: C.axis, font: { family: FONT, size: 9 } },
            grid: { color: C.grid },
            border: { color: C.border },
          },
        },
      },
    }),
  );
}

export function renderCharts(now: number): void {
  dispose();
  const rate = document.querySelector<HTMLCanvasElement>("#chart-rate");
  const percentiles = document.querySelector<HTMLCanvasElement>("#chart-percentiles");
  const perDay = document.querySelector<HTMLCanvasElement>("#chart-per-day");
  const wait = document.querySelector<HTMLCanvasElement>("#chart-wait");
  if (rate) buildRate(rate);
  if (percentiles) buildPercentiles(percentiles, now);
  if (perDay) buildPerDay(perDay, now);
  if (wait) buildWait(wait, now);
}
import { CREATED_MS, RESOLVED_MS, EVENTS, daysCeil, dayIndex, daysFloat } from "../data/caseData";

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

type ChartCtor = new (ctx: CanvasRenderingContext2D, config: object) => ChartLike;

interface ChartLike {
  data: { labels?: unknown[]; datasets: { data: number[] }[] };
  update(mode?: string): void;
}

function getCtor(): ChartCtor | null {
  const ChartClass = (window as unknown as { Chart?: unknown }).Chart;
  return ChartClass ? (ChartClass as ChartCtor) : null;
}

let percentiles: ChartLike | null = null;
let perDay: ChartLike | null = null;
let wait: ChartLike | null = null;
let percentilesWait = 0;

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
  new ctor(ctx, {
    type: "doughnut",
    data: {
      labels: ["HUMAN REPLIES"],
      datasets: [{ data: [100, 0], backgroundColor: ["#2ecc71", C.track], borderWidth: 0 }],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      cutout: "74%",
      rotation: -90,
      circumference: 180,
      plugins: { legend: { display: false }, tooltip: { enabled: false } },
    },
  });
}

function buildPercentiles(canvas: HTMLCanvasElement, now: number): ChartLike | null {
  const ctor = getCtor();
  const ctx = canvas.getContext("2d");
  if (!ctor || !ctx) return null;
  const waitVal = Number(daysFloat(now, CREATED_MS).toFixed(1));
  percentilesWait = waitVal;
  const datasets = [
    { label: "AVG", data: [waitVal, waitVal], borderColor: C.gold, borderWidth: 1, borderDash: [10, 6], pointRadius: 0, tension: 0 },
    { label: "P50", data: [waitVal, waitVal], borderColor: C.red, borderWidth: 1.5, pointRadius: 0, tension: 0 },
    { label: "P90", data: [waitVal, waitVal], borderColor: C.redP90, borderWidth: 1.5, borderDash: [5, 4], pointRadius: 0, tension: 0 },
    { label: "P99", data: [waitVal, waitVal], borderColor: C.redP99, borderWidth: 1.5, borderDash: [2, 4], pointRadius: 0, tension: 0 },
  ];
  return new ctor(ctx, {
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
            label: (item) => ` ${item.dataset.label || ""}: ${percentilesWait}d (SINGLE SAMPLE)`,
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
  });
}

function buildPerDay(canvas: HTMLCanvasElement): ChartLike | null {
  const ctor = getCtor();
  const ctx = canvas.getContext("2d");
  if (!ctor || !ctx) return null;
  const axis = {
    ticks: { color: C.axis, font: { family: FONT, size: 8 }, maxTicksLimit: 10, maxRotation: 0 },
    grid: { color: C.grid },
    border: { color: C.border },
  };
  return new ctor(ctx, {
    type: "bar",
    data: {
      labels: [],
      datasets: [
        { label: "MY MESSAGES", data: [], backgroundColor: C.gold, borderColor: C.gold, borderWidth: 1 },
        { label: "BOT REACTIONS", data: [], backgroundColor: C.muted, borderColor: C.muted, borderWidth: 1 },
        { label: "HUMAN REPLIES", data: [], backgroundColor: C.red, borderColor: C.red, borderWidth: 1 },
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
  });
}

function buildWait(canvas: HTMLCanvasElement): ChartLike | null {
  const ctor = getCtor();
  const ctx = canvas.getContext("2d");
  if (!ctor || !ctx) return null;
  const grad = ctx.createLinearGradient(0, 0, 0, 200);
  grad.addColorStop(0, "rgba(231,76,60,0.28)");
  grad.addColorStop(1, "rgba(231,76,60,0)");
  return new ctor(ctx, {
    type: "line",
    data: {
      labels: [],
      datasets: [
        {
          label: "DAYS WAITED",
          data: [],
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
  });
}

function updatePercentiles(chart: ChartLike, now: number): void {
  const waitVal = Number(daysFloat(now, CREATED_MS).toFixed(1));
  percentilesWait = waitVal;
  for (const ds of chart.data.datasets) ds.data = [waitVal, waitVal];
  chart.update();
}

function updatePerDay(chart: ChartLike, now: number): void {
  const days = daysCeil(now);
  const mine: number[] = new Array(days).fill(0);
  const bot: number[] = new Array(days).fill(0);
  const human: number[] = new Array(days).fill(0);
  for (const e of EVENTS) {
    const idx = dayIndex(e.at.getTime());
    if (idx < 0 || idx >= days) continue;
    if (e.kind === "author") mine[idx]++;
    else if (e.kind === "support") human[idx]++;
    else bot[idx]++;
  }
  const labels = Array.from({ length: days }, (_, i) => `D${i}`);
  chart.data.labels = labels;
  for (let i = 0; i < chart.data.datasets.length; i++) {
    chart.data.datasets[i].data = [mine, bot, human][i];
  }
  chart.update();
}

function updateWait(chart: ChartLike, now: number): void {
  const days = daysCeil(now);
  chart.data.labels = Array.from({ length: days }, (_, i) => `D${i}`);
  chart.data.datasets[0].data = Array.from({ length: days }, (_, i) => i);
  chart.update();
}

export function initCharts(): void {
  const rate = document.querySelector<HTMLCanvasElement>("#chart-rate");
  const p = document.querySelector<HTMLCanvasElement>("#chart-percentiles");
  const d = document.querySelector<HTMLCanvasElement>("#chart-per-day");
  const w = document.querySelector<HTMLCanvasElement>("#chart-wait");
  if (rate) buildRate(rate);
  percentiles = p ? buildPercentiles(p, Math.min(Date.now(), RESOLVED_MS)) : null;
  perDay = d ? buildPerDay(d) : null;
  wait = w ? buildWait(w) : null;
  updateCharts(Date.now());
}

export function updateCharts(now: number): void {
  const t = Math.min(now, RESOLVED_MS);
  if (percentiles) updatePercentiles(percentiles, t);
  if (perDay) updatePerDay(perDay, t);
  if (wait) updateWait(wait, t);
}
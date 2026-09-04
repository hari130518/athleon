const CHART_HEIGHT = 160;
const BAR_WIDTH = 32;
const BAR_GAP = 20;
const LABEL_HEIGHT = 36;

function shortDate(iso: string): string {
  return new Date(iso + "T00:00:00").toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

export default function MileageChart({
  data,
}: {
  data: { weekStart: string; totalKm: number }[];
}) {
  if (data.length === 0) {
    return <p className="text-sm text-[var(--color-muted)]">No weeks logged yet.</p>;
  }

  const maxKm = Math.max(...data.map((d) => d.totalKm), 1);
  const width = data.length * (BAR_WIDTH + BAR_GAP) + BAR_GAP;
  const height = CHART_HEIGHT + LABEL_HEIGHT;

  return (
    <div className="overflow-x-auto">
      <svg width={width} height={height} className="block">
        {data.map((d, i) => {
          const barHeight = (d.totalKm / maxKm) * (CHART_HEIGHT - 24);
          const x = BAR_GAP + i * (BAR_WIDTH + BAR_GAP);
          const y = CHART_HEIGHT - barHeight;
          return (
            <g key={d.weekStart}>
              <text
                x={x + BAR_WIDTH / 2}
                y={y - 6}
                textAnchor="middle"
                fontSize="11"
                fill="var(--color-paper)"
              >
                {d.totalKm}
              </text>
              <rect
                x={x}
                y={y}
                width={BAR_WIDTH}
                height={Math.max(barHeight, 1)}
                fill="var(--color-red)"
                rx="2"
              />
              <text
                x={x + BAR_WIDTH / 2}
                y={CHART_HEIGHT + 18}
                textAnchor="middle"
                fontSize="10"
                fill="var(--color-muted)"
              >
                {shortDate(d.weekStart)}
              </text>
            </g>
          );
        })}
        <line
          x1="0"
          y1={CHART_HEIGHT}
          x2={width}
          y2={CHART_HEIGHT}
          stroke="var(--color-line)"
          strokeWidth="1"
        />
      </svg>
    </div>
  );
}

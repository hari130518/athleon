export default function BrandLogo({ label }: { label?: string }) {
  return (
    <div className="flex items-baseline gap-2">
      <span className="text-2xl font-bold tracking-tight">
        Athle<span style={{ color: "var(--color-red)" }}>On</span>
      </span>
      {label && <span className="text-sm font-normal text-[var(--color-muted)]">{label}</span>}
    </div>
  );
}

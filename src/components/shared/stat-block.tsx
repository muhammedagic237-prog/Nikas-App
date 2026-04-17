export function StatBlock({
  label,
  value,
  tone = "default"
}: {
  label: string;
  value: string;
  tone?: "default" | "accent";
}) {
  return (
    <div className={tone === "accent" ? "stat-block accent" : "stat-block"}>
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  );
}

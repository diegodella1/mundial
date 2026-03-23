export default function AdminDashboardPage() {
  const stats = [
    { label: "Usuarios activos", value: "—" },
    { label: "Reacciones totales", value: "—" },
    { label: "Partidos en vivo", value: "—" },
  ];

  return (
    <div>
      <h1 className="text-2xl font-bold text-white">Dashboard</h1>

      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {stats.map((stat) => (
          <div
            key={stat.label}
            className="rounded-xl bg-zinc-800 p-6"
          >
            <p className="text-sm text-zinc-400">{stat.label}</p>
            <p className="mt-2 text-3xl font-bold text-white">{stat.value}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function TarjetaResumen({
  label,
  value,
  color = "text-black",
}: {
  label: string;
  value: string | number;
  color?: string;
}) {
  return (
    <div className="bg-white/70 backdrop-blur p-4 rounded-xl shadow-md">
      <p className="text-sm text-gray-500">{label}</p>
      <p className={`text-2xl font-bold ${color}`}>{value}</p>
    </div>
  );
}

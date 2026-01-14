type Props = {
  title: string
  value: string
}

export default function StatCard({ title, value }: Props) {
  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
      <p className="text-slate-400 text-sm">{title}</p>
      <h3 className="text-3xl font-semibold mt-2">{value}</h3>
    </div>
  )
}

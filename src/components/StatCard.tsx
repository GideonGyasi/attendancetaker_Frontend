type Props = {
  title: string
  value: string
  icon?: string
  color?: 'blue' | 'green' | 'purple'
}

export default function StatCard({ title, value, icon, color = 'blue' }: Props) {
  const colorClasses = {
    blue: 'from-blue-500 to-blue-600',
    green: 'from-green-500 to-green-600',
    purple: 'from-purple-500 to-purple-600'
  }

  return (
    <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm hover:shadow-md transition-all duration-200 hover:-translate-y-1 relative overflow-hidden group">
      <div className={`absolute top-0 right-0 w-16 h-16 bg-gradient-to-br ${colorClasses[color]} opacity-10 rounded-full -mr-8 -mt-8 group-hover:opacity-20 transition-opacity`}></div>
      <div className="relative z-10">
        {icon && <div className="text-2xl mb-2">{icon}</div>}
        <p className="text-gray-600 text-sm font-medium">{title}</p>
        <h3 className="text-3xl font-bold mt-2 text-gray-900">{value}</h3>
      </div>
    </div>
  )
}

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
    <div className="bg-white border border-gray-200 rounded-xl p-4 sm:p-6 shadow-sm hover:shadow-md transition-all duration-200 hover:-translate-y-1 relative overflow-hidden group">
      <div className={`absolute top-0 right-0 w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-br ${colorClasses[color]} opacity-10 rounded-full -mr-6 sm:-mr-8 -mt-6 sm:-mt-8 group-hover:opacity-20 transition-opacity`}></div>
      <div className="relative z-10">
        {icon && <div className="text-xl sm:text-2xl mb-2">{icon}</div>}
        <p className="text-gray-600 text-xs sm:text-sm font-medium">{title}</p>
        <h3 className="text-2xl sm:text-3xl font-bold mt-1 sm:mt-2 text-gray-900">{value}</h3>
      </div>
    </div>
  )
}

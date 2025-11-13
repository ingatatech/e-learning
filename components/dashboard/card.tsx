import { LucideIcon } from "lucide-react"

interface StatCardProps {
  title: string
  content: string | number
  subtitle: string
  icon: LucideIcon
  index: number
}

const colorVariants = [
  "from-emerald-400 to-emerald-500",
  "from-teal-400 to-teal-500",
  "from-green-400 to-green-500",
  "from-lime-400 to-lime-500",
  "from-cyan-400 to-cyan-500",
  "from-blue-400 to-blue-500",
]

export function StatCard({ title, content, subtitle, icon: Icon, index }: StatCardProps) {
  const colorClass = colorVariants[index % colorVariants.length]

  return (
    <div className={`relative bg-gradient-to-br ${colorClass} rounded p-6 text-white shadow-lg overflow-hidden hover:-translate-y-1 cursor-pointer transition-all duration-300`}>
      {/* Decorative curves */}
      <div className="absolute -bottom-8 -right-8 w-32 h-32 bg-white/10 rounded-full"></div>
      <div className="absolute -top-8 -left-8 w-24 h-24 bg-white/10 rounded-full"></div>

      {/* Icon container */}
      <div className="absolute top-4 right-4 w-14 h-14 bg-white/20 rounded backdrop-blur-sm flex items-center justify-center">
        <Icon className="w-7 h-7 text-white" />
      </div>

      {/* Content */}
      <div className="relative z-10 mt-12">
        <h3 className="text-sm font-medium text-white/90 mb-1">{title}</h3>
        <p className="text-3xl font-bold mb-1">{content}</p>
        <p className="text-xs text-white/80">{subtitle}</p>
      </div>
    </div>
  )
}
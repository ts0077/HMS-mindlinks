import { List, Plus } from "lucide-react"

type HeadProps = {
  list: string
  add: string
  active: "left" | "right"
  onLeftClick: () => void
  onRightClick: () => void
}

export default function HeadBar({ list, add, active, onLeftClick, onRightClick }: HeadProps) {
  return (
    <div className="w-full bg-white rounded-xl p-1.5 sm:p-2 shadow-sm border border-gray-200/80">
      <div className="flex items-center gap-1 sm:gap-2">
        {/* Add New Button */}
        <button
          onClick={onLeftClick}
          className={`
            flex-1 flex items-center justify-center gap-1.5 sm:gap-2 
            px-3 sm:px-4 py-2.5 sm:py-2.5 
            rounded-lg font-medium text-xs sm:text-sm 
            transition-all duration-200 ease-out
            active:scale-[0.98] touch-manipulation
            ${
              active === "left"
                ? "bg-[#2B2C2B] text-white shadow-md shadow-black/10"
                : "bg-gray-50 text-gray-600 hover:bg-gray-100 hover:text-gray-900"
            }
          `}
        >
          <Plus size={16} className="shrink-0" strokeWidth={active === "left" ? 2.5 : 2} />
          <span className="whitespace-nowrap">{add}</span>
        </button>

        {/* Show List Button */}
        <button
          onClick={onRightClick}
          className={`
            flex-1 flex items-center justify-center gap-1.5 sm:gap-2 
            px-3 sm:px-4 py-2.5 sm:py-2.5 
            rounded-lg font-medium text-xs sm:text-sm 
            transition-all duration-200 ease-out
            active:scale-[0.98] touch-manipulation
            ${
              active === "right"
                ? "bg-[#2B2C2B] text-white shadow-md shadow-black/10"
                : "bg-gray-50 text-gray-600 hover:bg-gray-100 hover:text-gray-900"
            }
          `}
        >
          <List size={16} className="shrink-0" strokeWidth={active === "right" ? 2.5 : 2} />
          <span className="whitespace-nowrap">{list}</span>
        </button>
      </div>
    </div>
  )
}
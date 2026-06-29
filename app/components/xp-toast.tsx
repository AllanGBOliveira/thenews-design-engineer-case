import { useEffect, useState } from 'react'
import { IoCheckmarkCircle, IoFlash } from 'react-icons/io5'
import { cn } from '~/lib/utils'

type XpToastProps = {
  show: boolean
  xp?: number
  label?: string
}

export function XpToast({ show, xp = 15, label = 'Habito' }: XpToastProps) {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    if (!show) return
    const showT = setTimeout(() => setVisible(true), 0)
    const hideT = setTimeout(() => setVisible(false), 3000)
    return () => {
      clearTimeout(showT)
      clearTimeout(hideT)
    }
  }, [show])

  return (
    <div
      aria-live="assertive"
      aria-atomic="true"
      className="fixed top-0 left-0 right-0 z-50 flex justify-center pt-16 pointer-events-none"
    >
      <div
        className={cn(
          'flex items-center gap-3 bg-chrome-surface border border-chrome-divider rounded-2xl shadow-xl px-5 py-3',
          'transition-all duration-300',
          visible ? 'translate-y-0 opacity-100' : '-translate-y-4 opacity-0',
        )}
        role="status"
      >
        <span className="flex items-center justify-center w-10 h-10 rounded-full border-2 border-[#B8860B] bg-[#1A1A24]">
          <IoCheckmarkCircle size={22} className="text-[#F5C518]" aria-hidden="true" />
        </span>
        <div>
          <p className="text-[#F5C518] font-black text-[18px] leading-tight flex items-center gap-1">
            +{xp} XP <IoFlash size={16} aria-hidden="true" />
          </p>
          <p className="text-chrome-muted text-[12px] leading-tight">{label}</p>
        </div>
      </div>
    </div>
  )
}

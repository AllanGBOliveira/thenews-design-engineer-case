import { useState } from 'react'
import { IoClose, IoPlay } from 'react-icons/io5'
import { Dialog, DialogContent, DialogTitle } from '~/components/ui/dialog'

type VideoDialogProps = {
  videoId: string
  title: string
  thumbnail?: string
}

export function VideoDialog({ videoId, title, thumbnail }: VideoDialogProps) {
  const [open, setOpen] = useState(false)

  const thumbUrl = thumbnail
    ?? `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`

  return (
    <>
      {/* Play card — acts as article content block */}
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label={`Assistir: ${title}`}
        className="group relative w-full rounded-xl overflow-hidden focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand"
      >
        <img
          src={thumbUrl}
          alt=""
          aria-hidden="true"
          className="w-full aspect-video object-cover"
          loading="lazy"
        />
        {/* Overlay */}
        <div className="absolute inset-0 bg-black/40 flex items-center justify-center group-hover:bg-black/50 transition-colors">
          <span className="flex items-center justify-center w-16 h-16 rounded-full bg-[#FF0000] text-white shadow-lg">
            <IoPlay size={28} aria-hidden="true" />
          </span>
        </div>
        {/* Title bar */}
        <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/80 to-transparent px-4 py-3 text-left">
          <p className="text-white text-[13px] font-medium line-clamp-2 leading-snug">
            {title}
          </p>
        </div>
      </button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent
          className="p-0 gap-0 max-w-none w-full h-full sm:h-auto sm:max-w-2xl bg-black border-none rounded-none sm:rounded-xl overflow-hidden"
          aria-describedby={undefined}
        >
          <div className="flex items-center justify-between px-4 py-3 bg-chrome-surface">
            {/* Branded bar like in-app WebView */}
            <div className="flex items-center gap-2">
              <span className="flex items-center justify-center w-7 h-7 rounded-full bg-brand shrink-0">
                <img src="/favicon.svg" alt="" aria-hidden="true" className="w-4 h-4" />
              </span>
              <span className="text-chrome-text text-[13px] font-medium">the news</span>
              <span className="text-chrome-muted text-[12px]">youtube.com</span>
            </div>
            <button
              type="button"
              onClick={() => setOpen(false)}
              aria-label="Fechar vídeo"
              className="flex items-center justify-center w-8 h-8 rounded-full text-chrome-muted hover:text-chrome-text hover:bg-chrome-text/10 transition-colors"
            >
              <IoClose size={20} aria-hidden="true" />
            </button>
          </div>

          <DialogTitle className="sr-only">{title}</DialogTitle>

          {open && (
            <div className="relative w-full aspect-video bg-black">
              <iframe
                src={`https://www.youtube-nocookie.com/embed/${videoId}?autoplay=1&rel=0`}
                title={title}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                className="absolute inset-0 w-full h-full"
              />
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  )
}

/* ─── In-app browser (external links) ─────────────────────────── */

type InAppBrowserProps = {
  url: string
  children: React.ReactNode
}

export function InAppLink({ url, children }: InAppBrowserProps) {
  const [open, setOpen] = useState(false)
  let domain = ''
  try { domain = new URL(url).hostname.replace('www.', '') } catch { /* noop */ }

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="inline text-left"
      >
        {children}
      </button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent
          className="p-0 gap-0 max-w-none w-full h-[95dvh] bg-chrome-bg border-none rounded-t-2xl rounded-b-none sm:rounded-xl overflow-hidden flex flex-col"
          aria-describedby={undefined}
        >
          <div className="flex items-center justify-between px-4 py-3 bg-chrome-surface shrink-0">
            <div className="flex items-center gap-2">
              <span className="flex items-center justify-center w-7 h-7 rounded-full bg-brand shrink-0">
                <img src="/favicon.svg" alt="" aria-hidden="true" className="w-4 h-4" />
              </span>
              <span className="text-chrome-text text-[13px] font-medium">the news</span>
              {domain && <span className="text-chrome-muted text-[12px] truncate max-w-[120px]">{domain}</span>}
            </div>
            <button
              type="button"
              onClick={() => setOpen(false)}
              aria-label="Fechar"
              className="flex items-center justify-center w-8 h-8 rounded-full text-chrome-muted hover:text-chrome-text hover:bg-chrome-text/10 transition-colors"
            >
              <IoClose size={20} aria-hidden="true" />
            </button>
          </div>

          <DialogTitle className="sr-only">{domain}</DialogTitle>

          {open && (
            <iframe
              src={url}
              title={domain}
              className="flex-1 w-full border-none"
              sandbox="allow-scripts allow-same-origin allow-popups allow-forms"
            />
          )}
        </DialogContent>
      </Dialog>
    </>
  )
}

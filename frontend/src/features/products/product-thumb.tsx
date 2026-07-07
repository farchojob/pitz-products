import { useEffect, useState } from 'react'
import { Package } from 'lucide-react'
import { cn } from '@/lib/utils'
import { resolveImageUrl } from '@/lib/image-url'

interface Props {
  src: string | null | undefined
  alt: string
  className?: string
  iconClassName?: string
}

// Product image with a designed no-media fallback — never a broken image or empty box.
export function ProductThumb({ src, alt, className, iconClassName }: Props) {
  const url = resolveImageUrl(src)
  const [failed, setFailed] = useState(false)

  // A new src (e.g. list re-render) gets a fresh chance to load.
  useEffect(() => {
    setFailed(false)
  }, [url])

  if (!url || failed) {
    return (
      <div
        className={cn(
          'flex items-center justify-center bg-muted text-muted-foreground/40',
          className,
        )}
        aria-hidden
      >
        <Package className={cn('h-1/2 w-1/2', iconClassName)} />
      </div>
    )
  }

  return (
    <img
      src={url}
      alt={alt}
      loading="lazy"
      onError={() => setFailed(true)}
      className={cn('object-cover', className)}
    />
  )
}

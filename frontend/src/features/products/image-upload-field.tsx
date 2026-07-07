import { useEffect, useRef, useState } from 'react'
import type { ChangeEvent, DragEvent } from 'react'
import { ImageIcon, Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'
import { resolveImageUrl } from '@/lib/image-url'
import { uploadProductImage } from '@/api/products'

const ACCEPTED = ['image/jpeg', 'image/png', 'image/webp']
const MAX_BYTES = 5 * 1024 * 1024

interface Props {
  value: string | null
  onChange: (url: string | null) => void
}

// Browse-or-drop image field: previews instantly (FileReader) and uploads to the
// API's local folder, storing the returned path in the form's image_url.
export function ImageUploadField({ value, onChange }: Props) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [preview, setPreview] = useState<string | null>(() => resolveImageUrl(value))
  const [uploading, setUploading] = useState(false)
  const [dragOver, setDragOver] = useState(false)

  // Stay in sync when the field is reset externally (dialog reopen / edit vs create).
  useEffect(() => {
    setPreview(resolveImageUrl(value))
  }, [value])

  const handleFile = async (file: File) => {
    if (!ACCEPTED.includes(file.type)) {
      toast.error('Use a JPG, PNG or WEBP image.')
      return
    }
    if (file.size > MAX_BYTES) {
      toast.error('Image exceeds the 5 MB limit.')
      return
    }
    // Instant local preview; a data URL avoids jsdom's missing createObjectURL.
    const reader = new FileReader()
    reader.onload = () => setPreview(reader.result as string)
    reader.readAsDataURL(file)

    setUploading(true)
    try {
      const url = await uploadProductImage(file)
      // Cancel a not-yet-fired reader so it can't clobber the uploaded URL if the
      // upload resolved first (the effect below re-syncs preview from the value).
      reader.onload = null
      onChange(url)
    } catch {
      reader.onload = null
      toast.error('Image upload failed. Please try again.')
      setPreview(resolveImageUrl(value))
    } finally {
      setUploading(false)
    }
  }

  const onInputChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) void handleFile(file)
    event.target.value = '' // let the same file be re-selected
  }

  const onDrop = (event: DragEvent<HTMLButtonElement>) => {
    event.preventDefault()
    setDragOver(false)
    const file = event.dataTransfer.files?.[0]
    if (file) void handleFile(file)
  }

  const remove = () => {
    setPreview(null)
    onChange(null)
  }

  return (
    <div className="grid gap-2">
      <span className="text-sm font-medium">Product image</span>
      <input
        ref={inputRef}
        type="file"
        accept="image/png,image/jpeg,image/webp"
        className="sr-only"
        aria-label="Product image"
        onChange={onInputChange}
      />
      {preview ? (
        <div className="relative h-40 overflow-hidden rounded-lg border">
          <img src={preview} alt="Product preview" className="h-full w-full object-cover" />
          {uploading && (
            <div className="absolute inset-0 grid place-items-center bg-background/60">
              <Loader2 className="h-5 w-5 animate-spin text-primary" />
            </div>
          )}
          <div className="absolute right-2 bottom-2 flex gap-1.5">
            <button
              type="button"
              onClick={() => inputRef.current?.click()}
              className="rounded-md border border-white/15 bg-background/80 px-2 py-1 text-xs font-medium backdrop-blur transition-colors hover:bg-background"
            >
              Change
            </button>
            <button
              type="button"
              onClick={remove}
              className="rounded-md border border-white/15 bg-background/80 px-2 py-1 text-xs font-medium text-destructive backdrop-blur transition-colors hover:bg-background"
            >
              Remove
            </button>
          </div>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          onDragOver={(event) => {
            event.preventDefault()
            setDragOver(true)
          }}
          onDragLeave={() => setDragOver(false)}
          onDrop={onDrop}
          className={cn(
            'flex h-28 flex-col items-center justify-center gap-1 rounded-lg border-2 border-dashed border-input text-center transition-colors',
            dragOver ? 'border-primary bg-primary/5' : 'hover:border-primary/50',
          )}
        >
          <ImageIcon className="h-5 w-5 text-muted-foreground" />
          <span className="text-sm">
            <span className="font-medium text-primary">Browse</span> or drop an image
          </span>
          <span className="font-mono text-[10px] tracking-wide text-muted-foreground uppercase">
            PNG · JPG · WEBP · up to 5 MB
          </span>
        </button>
      )}
    </div>
  )
}

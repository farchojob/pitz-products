import { Package } from 'lucide-react'
import { ModeToggle } from '@/components/mode-toggle'
import { ProductsPage } from '@/features/products/products-page'

function App() {
  return (
    <div className="min-h-screen">
      {/* Navy Pitz app-bar. `dark` makes it a consistent dark island in both
          themes, so the outline mode-toggle stays legible on the navy ground. */}
      <header className="dark sticky top-0 z-40 border-b border-white/10 bg-brand-navy text-foreground">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3 sm:px-6">
          <div className="flex items-center gap-2.5">
            <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary text-primary-foreground shadow-sm shadow-primary/40">
              <Package className="h-4 w-4" />
            </span>
            <span className="text-lg font-bold tracking-tight text-white">Pitz</span>
            <span className="hidden h-3.5 w-px bg-white/25 sm:block" />
            <span className="hidden text-sm text-white/55 sm:block">Products</span>
          </div>
          <ModeToggle />
        </div>
      </header>
      <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6 sm:py-10">
        <ProductsPage />
      </main>
    </div>
  )
}

export default App

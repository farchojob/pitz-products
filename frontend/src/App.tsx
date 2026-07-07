import { Package } from 'lucide-react'
import { ModeToggle } from '@/components/mode-toggle'
import { ProductsPage } from '@/features/products/products-page'

function App() {
  return (
    <div className="min-h-screen">
      {/* Glassy navy Pitz app-bar. `dark` keeps it a consistent dark island in
          both themes so the outline mode-toggle stays legible on navy. */}
      <header className="dark sticky top-0 z-40 bg-brand-navy/90 backdrop-blur-xl">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3 sm:px-6">
          <div className="flex items-center gap-2.5">
            <span className="flex h-[30px] w-[30px] items-center justify-center rounded-[10px] bg-gradient-to-br from-primary to-primary/65 text-white shadow-lg shadow-primary/40 ring-1 ring-inset ring-white/20">
              <Package className="h-4 w-4" />
            </span>
            <span className="text-[18px] font-bold tracking-[-0.03em] text-white">Pitz</span>
            <span className="h-3.5 w-px bg-white/25" />
            <span className="font-mono text-[11px] tracking-[0.14em] text-white/55 uppercase">
              Products
            </span>
          </div>
          <ModeToggle />
        </div>
        {/* Red speed-line under the bar. */}
        <div className="h-px w-full bg-gradient-to-r from-transparent via-primary/65 to-transparent" />
      </header>

      <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6 sm:py-10">
        <ProductsPage />
      </main>
    </div>
  )
}

export default App

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
            {/* Swap this file with the official vector to update the mark, no code change. */}
            <img src="/pitz-logo.svg" alt="Pitz" className="h-5 w-auto" />
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

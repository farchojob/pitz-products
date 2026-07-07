import { Package } from 'lucide-react'
import { ModeToggle } from '@/components/mode-toggle'
import { ProductsPage } from '@/features/products/products-page'

function App() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="border-b">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary text-primary-foreground">
              <Package className="h-5 w-5" />
            </div>
            <div>
              <h1 className="text-lg leading-tight font-semibold">Product Manager</h1>
              <p className="text-sm text-muted-foreground">PITZ inventory</p>
            </div>
          </div>
          <ModeToggle />
        </div>
      </header>
      <main className="mx-auto max-w-5xl px-4 py-6">
        <ProductsPage />
      </main>
    </div>
  )
}

export default App

export default function Navbar() {
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 border-b border-[var(--border)] bg-[var(--bg)]/80 backdrop-blur-md">
      <div className="max-w-6xl mx-auto px-6 h-14 flex items-center justify-between">
        <a href="/" className="flex items-center gap-2 group">
          <div className="w-7 h-7 rounded-md bg-[var(--accent)] flex items-center justify-center">
            <span className="text-black font-bold text-sm font-mono">$</span>
          </div>
          <span className="font-bold text-[var(--text-primary)] tracking-tight"
            style={{ fontFamily: 'Syne, sans-serif' }}>
            SpendLens
          </span>
        </a>

        <div className="flex items-center gap-6">
          <a
            href="#how-it-works"
            className="text-sm text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors hidden sm:block"
          >
            How it works
          </a>
          <a
            href="/audit/new"
            className="text-sm px-4 py-1.5 rounded-full border border-[var(--accent)] text-[var(--accent)] hover:bg-[var(--accent)] hover:text-black transition-all font-medium"
          >
            Start audit →
          </a>
        </div>
      </div>
    </nav>
  )
}

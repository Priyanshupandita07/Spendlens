import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Navbar from '@/components/layout/Navbar'
import LandingPage from '@/pages/LandingPage'
import AuditPage from '@/pages/AuditPage'
import ResultsPage from '@/pages/ResultsPage'

export default function App() {
  return (
    <BrowserRouter>
      <Navbar />
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/audit" element={<AuditPage />} />
        <Route path="/results/:id" element={<ResultsPage />} />
        <Route
          path="*"
          element={
            <div
              className="min-h-screen flex items-center justify-center"
              style={{ background: 'var(--bg)' }}
            >
              <div className="text-center">
                <div
                  className="text-6xl font-extrabold mb-4"
                  style={{ fontFamily: 'Syne, sans-serif', color: 'var(--accent)' }}
                >
                  404
                </div>
                <p style={{ color: 'var(--text-secondary)' }}>
                  Page not found.{' '}
                  <a href="/" style={{ color: 'var(--accent)' }}>
                    Go home →
                  </a>
                </p>
              </div>
            </div>
          }
        />
      </Routes>
    </BrowserRouter>
  )
}

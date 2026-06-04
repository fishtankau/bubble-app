import { HashRouter, Routes, Route, Navigate } from 'react-router-dom'
import { BrandProvider } from './context/BrandContext'
import Output from './pages/Output'

// Standalone build: the app lands directly on the branded login (Output renders
// Login until you sign in, then the dashboard). HashRouter keeps deep links and
// refreshes working on GitHub Pages without server rewrites.
export default function App() {
  return (
    <BrandProvider>
      <HashRouter>
        <Routes>
          <Route path="/" element={<Output />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </HashRouter>
    </BrandProvider>
  )
}

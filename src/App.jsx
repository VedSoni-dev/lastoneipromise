import { useEffect } from 'react'
import { Routes, Route, Navigate, useLocation } from 'react-router-dom'
import NotesPage from './pages/Notes'
import NotFoundPage from './pages/NotFound'

function App() {
  const { pathname } = useLocation()
  useEffect(() => { window.scrollTo(0, 0) }, [pathname])
  return (
    <Routes>
      <Route path="/" element={<NotesPage />} />
      <Route path="/cool-stuff" element={<Navigate to="/" replace />} />
      <Route path="/coaching" element={<Navigate to="/" replace />} />
      <Route path="/consulting" element={<Navigate to="/" replace />} />
      <Route path="/portfolio" element={<Navigate to="/" replace />} />
      <Route path="/blog" element={<Navigate to="/" replace />} />
      <Route path="/articles/*" element={<Navigate to="/" replace />} />
      <Route path="/resume" element={<Navigate to="/" replace />} />
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  )
}

export default App

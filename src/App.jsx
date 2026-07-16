import { Routes, Route, Navigate } from 'react-router-dom'
import ConsultPage from './pages/Consult'
import CoachingPage from './pages/Coaching'
import NotFoundPage from './pages/NotFound'

function App() {
  return (
    <Routes>
      <Route path="/" element={<ConsultPage />} />
      <Route path="/coaching" element={<CoachingPage />} />
      <Route path="/portfolio" element={<Navigate to="/" replace />} />
      <Route path="/blog" element={<Navigate to="/" replace />} />
      <Route path="/articles/*" element={<Navigate to="/" replace />} />
      <Route path="/resume" element={<Navigate to="/" replace />} />
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  )
}

export default App

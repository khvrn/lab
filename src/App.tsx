import { Suspense } from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { Home } from './pages/Home'
import { apps } from './data/apps'

export default function App() {
  return (
    <BrowserRouter>
      <Suspense fallback={<div className="min-h-screen bg-zinc-900" />}>
        <Routes>
          <Route path="/" element={<Home />} />
          {apps.map(({ id, component: Component }) => (
            <Route key={id} path={`/apps/${id}`} element={<Component />} />
          ))}
        </Routes>
      </Suspense>
    </BrowserRouter>
  )
}

import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { Home } from './pages/Home'
import { CounterApp } from './apps/counter/CounterApp'

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/apps/counter" element={<CounterApp />} />
      </Routes>
    </BrowserRouter>
  )
}

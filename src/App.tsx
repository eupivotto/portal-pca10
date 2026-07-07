import { NavLink, Route, Routes } from 'react-router-dom'
import Dashboard from './pages/Dashboard'
import Revisao from './pages/Revisao'
import SimuladoCompleto from './pages/SimuladoCompleto'
import TreinoModulo from './pages/TreinoModulo'
import QuestoesErro from './pages/QuestoesErro'

const navItems = [
  { to: '/', label: 'Dashboard' },
  { to: '/revisao', label: 'Revisão' },
  { to: '/simulado', label: 'Simulado' },
  { to: '/treino', label: 'Treino' },
  { to: '/erros', label: 'Meus erros' },
]

function App() {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3">
          <span className="font-semibold tracking-tight">PCA-10 · Plataforma de Estudo</span>
          <nav className="flex gap-1">
            {navItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.to === '/'}
                className={({ isActive }) =>
                  `rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
                    isActive ? 'bg-slate-900 text-white' : 'text-slate-600 hover:bg-slate-100'
                  }`
                }
              >
                {item.label}
              </NavLink>
            ))}
          </nav>
        </div>
      </header>
      <main className="mx-auto max-w-5xl px-4 py-6">
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/revisao" element={<Revisao />} />
          <Route path="/simulado" element={<SimuladoCompleto />} />
          <Route path="/treino" element={<TreinoModulo />} />
          <Route path="/erros" element={<QuestoesErro />} />
        </Routes>
      </main>
    </div>
  )
}

export default App

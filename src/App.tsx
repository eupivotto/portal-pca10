import { NavLink, Route, Routes } from 'react-router-dom'
import Dashboard from './pages/Dashboard'
import Revisao from './pages/Revisao'
import SimuladoCompleto from './pages/SimuladoCompleto'
import TreinoModulo from './pages/TreinoModulo'
import QuestoesErro from './pages/QuestoesErro'
import Formulas from './pages/Formulas'
import Historico from './pages/Historico'

const navItems = [
  { to: '/', label: 'Dashboard' },
  { to: '/revisao', label: 'Revisão' },
  { to: '/formulas', label: 'Fórmulas' },
  { to: '/simulado', label: 'Simulado' },
  { to: '/treino', label: 'Treino' },
  { to: '/erros', label: 'Meus erros' },
  { to: '/historico', label: 'Histórico' },
]

function App() {
  return (
    <div className="min-h-screen bg-canvas text-ink">
      <header className="border-b border-rule bg-paper">
        <div className="mx-auto flex max-w-5xl flex-col gap-2 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
          <span className="whitespace-nowrap font-serif font-semibold tracking-tight text-ink">
            PCA-10 <span className="hidden sm:inline">· Plataforma de Estudo</span>
          </span>
          <nav className="-mx-4 flex gap-1 overflow-x-auto px-4 sm:mx-0 sm:px-0">
            {navItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.to === '/'}
                className={({ isActive }) =>
                  `shrink-0 rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
                    isActive ? 'bg-ink text-paper' : 'text-ink-soft hover:bg-accent-soft hover:text-accent-ink'
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
          <Route path="/formulas" element={<Formulas />} />
          <Route path="/simulado" element={<SimuladoCompleto />} />
          <Route path="/treino" element={<TreinoModulo />} />
          <Route path="/erros" element={<QuestoesErro />} />
          <Route path="/historico" element={<Historico />} />
        </Routes>
      </main>
    </div>
  )
}

export default App

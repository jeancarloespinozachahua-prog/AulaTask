import { Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar.jsx';
import Registro from './pages/Registro.jsx';
import Consulta from './pages/Consulta.jsx';

export default function App() {
  return (
    <div className="app-shell">
      <Navbar />
      <main className="container">
        <Routes>
          <Route path="/" element={<Registro />} />
          <Route path="/editar/:id" element={<Registro />} />
          <Route path="/usuarios" element={<Consulta />} />
          <Route path="*" element={<Registro />} />
        </Routes>
      </main>
    </div>
  );
}

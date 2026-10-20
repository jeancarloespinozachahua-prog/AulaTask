import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import FilaUsuario from '../components/FilaUsuario.jsx';
import { listarUsuarios, eliminarUsuario } from '../api.js';

export default function Consulta() {
  const [usuarios, setUsuarios] = useState([]);
  const [busqueda, setBusqueda] = useState('');
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState('');
  const [eliminando, setEliminando] = useState(null);
  const navigate = useNavigate();

  const cargar = async () => {
    setCargando(true);
    setError('');
    try {
      const datos = await listarUsuarios();
      setUsuarios(datos);
    } catch (err) {
      setError(err.message || 'No se pudo cargar el directorio.');
    } finally {
      setCargando(false);
    }
  };
  useEffect(() => { cargar(); }, []);

  const eliminar = async (id) => {
    if (!window.confirm('¿Eliminar este usuario?')) return;
    setEliminando(id);
    setError('');
    try {
      await eliminarUsuario(id);
      setUsuarios((actuales) => actuales.filter((usuario) => usuario.id !== id));
    } catch (err) {
      setError(err.message || 'No se pudo eliminar el usuario.');
    } finally {
      setEliminando(null);
    }
  };

  const termino = busqueda.trim().toLocaleLowerCase();
  const usuariosFiltrados = usuarios.filter((usuario) =>
    `${usuario.nombre} ${usuario.correo}`.toLocaleLowerCase().includes(termino)
  );

  return (
    <section>
      <div className="list-toolbar">
        <header className="page-heading">
          <p className="eyebrow">Gestión de contactos</p>
          <h1>Directorio de usuarios</h1>
          <p>Consulta, busca y administra las personas registradas.</p>
          <span className="user-count">{usuarios.length} {usuarios.length === 1 ? 'usuario' : 'usuarios'} registrados</span>
        </header>
        <div className="toolbar-actions">
          <label className="search-wrap">
            <span aria-hidden="true">⌕</span>
            <input
              className="search-input"
              type="search"
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              placeholder="Buscar por nombre o correo"
              aria-label="Buscar por nombre o correo"
            />
          </label>
          <button className="btn-primary" type="button" onClick={() => navigate('/')}>+ Registrar</button>
        </div>
      </div>

      {error && (
        <div className="notice error" role="alert">
          {error} <button className="btn-secondary" type="button" onClick={cargar}>Reintentar</button>
        </div>
      )}
      <section className="card table-card" aria-label="Usuarios registrados">
        {cargando ? (
          <div className="loading-state">Cargando el directorio...</div>
        ) : usuariosFiltrados.length === 0 ? (
          <div className="empty-state">
            <span className="empty-icon" aria-hidden="true">{termino ? '⌕' : '♙'}</span>
            <h2>{termino ? 'No encontramos coincidencias' : 'Aún no hay usuarios'}</h2>
            <p>{termino ? 'Prueba con otro nombre o correo electrónico.' : 'Cuando registres personas, aparecerán aquí.'}</p>
            {!termino && <button className="btn-primary" type="button" onClick={() => navigate('/')}>Registrar primer usuario</button>}
          </div>
        ) : (
          <div className="table-scroll">
            <table>
              <thead>
                <tr><th>ID</th><th>Nombre</th><th>Correo electrónico</th><th>Acciones</th></tr>
              </thead>
              <tbody>
                {usuariosFiltrados.map((usuario) => (
                  <FilaUsuario
                    key={usuario.id}
                    usuario={usuario}
                    eliminando={eliminando === usuario.id}
                    onEditar={(id) => navigate(`/editar/${id}`)}
                    onEliminar={eliminar}
                  />
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
      <p className="footer-note">Los cambios se guardan directamente en tu sistema de usuarios.</p>
    </section>
  );
}

import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import FormularioUsuario from '../components/FormularioUsuario.jsx';
import { crearUsuario, obtenerUsuario, actualizarUsuario } from '../api.js';

export default function Registro() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [usuario, setUsuario] = useState(null);
  const [mensaje, setMensaje] = useState('');
  const [error, setError] = useState('');
  const [cargando, setCargando] = useState(Boolean(id));

  useEffect(() => {
    if (!id) {
      setUsuario(null);
      setCargando(false);
      setError('');
      return;
    }

    setCargando(true);
    setError('');
    obtenerUsuario(id)
      .then(setUsuario)
      .catch((err) => setError(err.message || 'No se pudo cargar el usuario.'))
      .finally(() => setCargando(false));
  }, [id]);

  const guardar = async (datos) => {
    setError('');
    setMensaje('');
    try {
      const resultado = id ? await actualizarUsuario(id, datos) : await crearUsuario(datos);
      if (id) {
        navigate('/usuarios');
      } else {
        setMensaje(`${resultado.message} (ID ${resultado.id})`);
      }
      return true;
    } catch (err) {
      setError(err.message || 'No se pudo guardar el usuario.');
      return false;
    }
  };

  if (cargando) return <div className="card loading-state">Cargando los datos del usuario...</div>;
  if (id && error && !usuario) {
    return (
      <section className="page-heading">
        <p className="eyebrow">Directorio de usuarios</p>
        <h1>No se pudo abrir el registro</h1>
        <p className="notice error">{error}</p>
      </section>
    );
  }

  return (
    <section>
      <header className="page-heading">
        <p className="eyebrow">{id ? 'Actualiza la información' : 'Gestión sencilla y segura'}</p>
        <h1>{id ? 'Editar usuario' : 'Bienvenido al directorio'}</h1>
        <p>{id ? 'Modifica los datos y guarda los cambios del registro.' : 'Administra tus contactos desde un solo lugar. Registra usuarios y mantén su información organizada.'}</p>
      </header>

      <div className="content-grid">
        <section className="card form-card">
          <div className="section-heading">
            <h2>{id ? 'Información del usuario' : 'Nuevo usuario'}</h2>
            <p>Completa los campos para {id ? 'actualizar el registro.' : 'añadir una persona al directorio.'}</p>
          </div>
          <FormularioUsuario
            key={id || 'nuevo'}
            inicial={usuario || undefined}
            onGuardar={guardar}
            textoBoton={id ? 'Guardar cambios' : 'Registrar usuario'}
          />
          {mensaje && <p className="notice" role="status">{mensaje}</p>}
          {error && <p className="notice error" role="alert">{error}</p>}
        </section>

        <aside className="side-panel">
          {!id && (
            <section className="card welcome-card">
              <span className="welcome-icon" aria-hidden="true">✦</span>
              <h2>Todo en orden</h2>
              <p>Un directorio claro te ayuda a encontrar y mantener la información de cada usuario fácilmente.</p>
            </section>
          )}
          <section className="card info-card">
            <h3>{id ? 'Antes de guardar' : 'Consejos para el registro'}</h3>
            <ul className="tip-list">
              <li><span className="tip-dot">1</span><span>Escribe el nombre tal como quieres verlo en el directorio.</span></li>
              <li><span className="tip-dot">2</span><span>Usa un correo válido para mantener el contacto correctamente.</span></li>
              <li><span className="tip-dot">3</span><span>Podrás editar o eliminar el registro desde la sección Directorio.</span></li>
            </ul>
          </section>
        </aside>
      </div>
    </section>
  );
}

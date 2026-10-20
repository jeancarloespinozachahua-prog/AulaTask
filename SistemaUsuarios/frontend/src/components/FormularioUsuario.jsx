import { useState } from 'react';

export default function FormularioUsuario({ inicial = { nombre: '', correo: '' }, onGuardar, textoBoton = 'Enviar' }) {
  const [nombre, setNombre] = useState(inicial.nombre);
  const [correo, setCorreo] = useState(inicial.correo);
  const [guardando, setGuardando] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setGuardando(true);
    try {
      const guardado = await onGuardar({ nombre: nombre.trim(), correo: correo.trim() });
      if (guardado && !inicial.id) {
        setNombre('');
        setCorreo('');
      }
    } finally {
      setGuardando(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <div className="form-fields">
        <div className="field">
          <label htmlFor="nombre">Nombre completo</label>
          <input
            id="nombre"
            type="text"
            value={nombre}
            onChange={(e) => setNombre(e.target.value)}
            placeholder="Ej. María García"
            autoComplete="name"
            maxLength="120"
            required
          />
          <span className="field-hint">Ingresa el nombre que aparecerá en el directorio.</span>
        </div>
        <div className="field">
          <label htmlFor="correo">Correo electrónico</label>
          <input
            id="correo"
            type="email"
            value={correo}
            onChange={(e) => setCorreo(e.target.value)}
            placeholder="nombre@ejemplo.com"
            autoComplete="email"
            maxLength="160"
            required
          />
          <span className="field-hint">Asegúrate de que la dirección esté escrita correctamente.</span>
        </div>
      </div>
      <div className="form-actions">
        <button className="btn-primary" type="submit" disabled={guardando}>
          {guardando ? 'Guardando...' : textoBoton}
        </button>
      </div>
    </form>
  );
}

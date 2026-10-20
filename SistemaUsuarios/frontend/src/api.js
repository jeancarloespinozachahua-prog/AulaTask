// Comunicación con el backend (Express) mediante fetch
const API = 'http://localhost:3000/usuarios';

const request = async (url, options) => {
  const response = await fetch(url, options);
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.error || 'Ocurrió un error al comunicarse con el servidor.');
  }
  return data;
};

export const listarUsuarios = () => request(API);
export const obtenerUsuario = (id) => request(`${API}/${id}`);

const jsonOptions = (method, datos) => ({
  method,
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(datos),
});

export const crearUsuario = (datos) => request(API, jsonOptions('POST', datos));
export const actualizarUsuario = (id, datos) => request(`${API}/${id}`, jsonOptions('PUT', datos));
export const eliminarUsuario = (id) => request(`${API}/${id}`, { method: 'DELETE' });

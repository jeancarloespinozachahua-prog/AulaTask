export default function FilaUsuario({ usuario, onEditar, onEliminar, eliminando = false }) {
  const iniciales = usuario.nombre
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((parte) => parte.charAt(0))
    .join('');

  return (
    <tr>
      <td>{usuario.id}</td>
      <td>
        <div className="user-identity">
          <span className="avatar" aria-hidden="true">{iniciales}</span>
          <span>{usuario.nombre}</span>
        </div>
      </td>
      <td className="email-cell">{usuario.correo}</td>
      <td className="actions-cell">
        <button className="btn-edit" type="button" onClick={() => onEditar(usuario.id)}>Editar</button>
        <button className="btn-del" type="button" disabled={eliminando} onClick={() => onEliminar(usuario.id)}>
          {eliminando ? 'Eliminando...' : 'Eliminar'}
        </button>
      </td>
    </tr>
  );
}

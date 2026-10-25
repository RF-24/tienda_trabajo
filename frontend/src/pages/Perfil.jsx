
import { useEffect, useState } from 'react';
import { request } from '../api.js';

export default function Perfil({ token, alExpirar }) {
  const [perfil, setPerfil] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    let activo = true;

    request('/perfil', { token })
      .then((datos) => {
        if (activo) setPerfil(datos);
      })
      .catch((e) => {
        if (!activo) return;
        setError(e.message);
        alExpirar();
      });

    return () => {
      activo = false;
    };
  }, [token, alExpirar]);

  if (error) return <p className="error">{error}</p>;
  if (!perfil) return <p>Cargando perfil...</p>;

  return (
    <div className="detalle">
      <h1>Hola, {perfil.nombre}</h1>
      <p>Correo: {perfil.email}</p>
      <p>
        Tu sesión (token) expira:{' '}
        {(() => {
  try {
    const datos = JSON.parse(atob(token.split('.')[1]));
    return new Date(datos.exp * 1000).toLocaleString();
  } catch {
    return 'No disponible';
  }
})()}
      </p>
      <small>
        Esta información viene de /api/perfil,
        una ruta protegida con JWT.
      </small>
    </div>
  );
}

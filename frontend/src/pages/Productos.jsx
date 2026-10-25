
import { useEffect, useRef, useState } from 'react';
import Tarjeta from '../components/Tarjeta.jsx';
import { request } from '../api.js';

export default function Productos() {
  const [productos, setProductos] = useState([]);
  const [q, setQ] = useState('');
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState('');
  const campo = useRef();

  // Se ejecuta al montar y cuando cambia la búsqueda
  useEffect(() => {
    let activo = true;
    setCargando(true);

    request(`/productos?q=${encodeURIComponent(q)}`)
      .then((datos) => {
        if (activo) {
          setProductos(datos);
          setError('');
        }
      })
      .catch((e) => {
        if (activo) setError(e.message);
      })
      .finally(() => {
        if (activo) setCargando(false);
      });

    return () => {
      activo = false;
    };
  }, [q]);

  const buscar = (e) => {
    e.preventDefault();
    setQ(campo.current.value);
  };

  return (
    <>
      <h1>Productos</h1>

      <form onSubmit={buscar} className="fila">
        <input ref={campo} placeholder="Buscar producto..." />
        <button type="submit">Buscar</button>
      </form>

      {q && <p>Resultados para: {q}</p>}

      {cargando && <p>Cargando...</p>}
      {error && <p className="error">{error}</p>}

      {!cargando && !error && productos.length === 0 && (
        <p>Sin resultados.</p>
      )}

      <div className="rejilla">
        {productos.map((p) => (
          <Tarjeta
            key={p.id}
            id={p.id}
            titulo={p.nombre}
            precio={p.precio}
          />
        ))}
      </div>
    </>
  );
}

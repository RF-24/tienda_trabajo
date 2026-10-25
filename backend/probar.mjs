
const BASE = process.env.API || 'http://localhost:3000';
const ORIGEN = process.env.FRONTEND_ORIGEN || 'http://localhost:5173';

let fallos = 0;

const verificar = (nombre, condicion) => {
  console.log(`${condicion ? '✅' : '❌'} ${nombre}`);
  if (!condicion) fallos++;
};

const post = (ruta, body, token) =>
  fetch(BASE + ruta, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` })
    },
    body: JSON.stringify(body)
  });

const email = `alumno${Date.now()}@correo.com`;

console.log(`\nProbando ${BASE}\n`);

// Registro y login
let r = await post('/api/register', {
  nombre: 'Alumno Prueba',
  email,
  password: 'secreto123'
});
verificar('Registro de usuario (201)', r.status === 201);

r = await post('/api/login', {
  email,
  password: 'incorrecta'
});
verificar('Login incorrecto rechazado (401)', r.status === 401);

r = await post('/api/login', {
  email,
  password: 'secreto123'
});

const datos = await r.json();
const token = datos.token;

verificar(
  'Login correcto entrega JWT',
  r.status === 200 && token?.split('.').length === 3
);

// Rutas protegidas
r = await fetch(BASE + '/api/perfil');
verificar('Perfil sin token (401)', r.status === 401);

r = await fetch(BASE + '/api/perfil', {
  headers: { Authorization: `Bearer ${token}x` }
});
verificar('Token alterado rechazado (401)', r.status === 401);

r = await fetch(BASE + '/api/perfil', {
  headers: { Authorization: `Bearer ${token}` }
});
verificar('Perfil con token válido (200)', r.status === 200);

// SQL Injection
const inyeccion = "' OR '1'='1";

r = await post('/api/login', {
  email: inyeccion,
  password: 'x'
});
verificar(
  'SQL Injection en login bloqueada',
  r.status === 400 || r.status === 401
);

r = await fetch(
  `${BASE}/api/productos?q=${encodeURIComponent(inyeccion)}`
);

const lista = await r.json();

verificar(
  'SQL Injection en búsqueda bloqueada',
  Array.isArray(lista) && lista.length === 0
);

// XSS
r = await fetch(
  `${BASE}/buscar?q=${encodeURIComponent('<script>robarDatos()</script>')}`
);

const html = await r.text();

verificar(
  'XSS: salida HTML escapada',
  !html.includes('<script>') && html.includes('&lt;script&gt;')
);

verificar(
  'Helmet agrega cabeceras seguras',
  r.headers.get('x-content-type-options') === 'nosniff'
);

// CORS
r = await fetch(BASE + '/api/perfil', {
  method: 'OPTIONS',
  headers: {
    Origin: ORIGEN,
    'Access-Control-Request-Method': 'GET',
    'Access-Control-Request-Headers': 'authorization'
  }
});

verificar(
  'CORS permite el frontend',
  r.headers.get('access-control-allow-origin') === ORIGEN
);

r = await fetch(BASE + '/api/perfil', {
  method: 'OPTIONS',
  headers: {
    Origin: 'http://sitio-malo.com',
    'Access-Control-Request-Method': 'GET'
  }
});

verificar(
  'CORS no autoriza otro origen',
  r.headers.get('access-control-allow-origin') !== 'http://sitio-malo.com'
);

console.log(`\nResultado: ${fallos} prueba(s) fallida(s).`);

if (fallos > 0) process.exitCode = 1;

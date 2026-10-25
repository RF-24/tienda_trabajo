
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const escapeHtml = require('escape-html');

const db = require('./db');

const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const verificarToken = require('./auth');

const app = express();
const PORT = process.env.PORT || 3000;

// Configuración de seguridad
app.use(helmet());

app.use(cors({
  origin: process.env.FRONTEND_ORIGIN || 'http://localhost:5173'
}));

// Permitir recibir datos JSON
app.use(express.json());

// Validar el formato del correo
const emailValido = (e) =>
  typeof e === 'string' &&
  /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e);

// Ruta de bienvenida
app.get('/', (req, res) => {
  res.json({
    mensaje: 'Bienvenido a la API de Tienda Segura'
  });
});


// Registrar un nuevo usuario
app.post('/api/register', async (req, res) => {
  try {
    const { nombre, email, password } = req.body;

    
    // Validar los datos del registro
    if (typeof nombre !== 'string' || nombre.trim().length < 2) {
      return res.status(400).json({
        error: 'El nombre debe tener al menos 2 caracteres'
      });
    }

    if (!emailValido(email)) {
      return res.status(400).json({
        error: 'Correo inválido'
      });
    }

    if (typeof password !== 'string' || password.length < 6) {
      return res.status(400).json({
        error: 'La contraseña debe tener al menos 6 caracteres'
      });
    }


    // Comprobar si el correo ya está registrado
    const existe = db.prepare(
      'SELECT id FROM users WHERE email = ?'
    ).get(email.trim().toLowerCase());

    if (existe) {
      return res.status(409).json({
        error: 'Este correo ya está registrado'
      });
    }

    // Proteger la contraseña
    const passwordHash = await bcrypt.hash(password, 10);

    // Guardar el usuario en SQLite
    const resultado = db.prepare(
      'INSERT INTO users (nombre, email, password) VALUES (?, ?, ?)'
    ).run(
      nombre.trim(),
      email.trim().toLowerCase(),
      passwordHash
    );

    return res.status(201).json({
      mensaje: 'Usuario registrado correctamente',
      usuario: {
        id: Number(resultado.lastInsertRowid),
        nombre: nombre.trim(),
        email: email.trim().toLowerCase()
      }
    });

  } catch (error) {
    console.error('Error al registrar:', error);

    return res.status(500).json({
      error: 'Ocurrió un error al registrar el usuario'
    });
  }
});


// Iniciar sesión
app.post('/api/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Comprobar que se enviaron los datos
    if (
      typeof email !== 'string' ||
      typeof password !== 'string' ||
      !email.trim() ||
      !password
    ) {
      return res.status(400).json({
        error: 'Correo y contraseña obligatorios'
      });
    }

    // Buscar al usuario en SQLite
    const usuario = db.prepare(
      'SELECT * FROM users WHERE email = ?'
    ).get(email.trim().toLowerCase());

    if (!usuario) {
      return res.status(401).json({
        error: 'Credenciales incorrectas'
      });
    }

    // Comparar la contraseña
    const passwordCorrecta = await bcrypt.compare(
      password,
      usuario.password
    );

    if (!passwordCorrecta) {
      return res.status(401).json({
        error: 'Credenciales incorrectas'
      });
    }

    // Generar token JWT
    const token = jwt.sign(
      {
        id: usuario.id,
        email: usuario.email
      },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );

    return res.json({
      mensaje: 'Inicio de sesión correcto',
      token,
      usuario: {
        id: usuario.id,
        nombre: usuario.nombre,
        email: usuario.email
      }
    });

  } catch (error) {
    console.error('Error al iniciar sesión:', error);

    return res.status(500).json({
      error: 'Ocurrió un error al iniciar sesión'
    });
  }
});



app.get('/api/productos', (req, res) => {
  const q = String(req.query.q || '').slice(0, 50);

  const filas = db
    .prepare('SELECT * FROM productos WHERE nombre LIKE ? ORDER BY id')
    .all(`%${q}%`);

  res.json(filas);
});



// Obtener un producto por su ID
app.get('/api/productos/:id', (req, res) => {
  try {
    const id = Number(req.params.id);

    if (!Number.isInteger(id) || id <= 0) {
      return res.status(400).json({
        error: 'ID de producto inválido'
      });
    }

    const producto = db.prepare(
      'SELECT id, nombre, precio, descripcion FROM productos WHERE id = ?'
    ).get(id);

    if (!producto) {
      return res.status(404).json({
        error: 'Producto no encontrado'
      });
    }

    return res.json(producto);

  } catch (error) {
    console.error('Error al obtener producto:', error);

    return res.status(500).json({
      error: 'No se pudo obtener el producto'
    });
  }
});


app.post('/api/productos', verificarToken, (req, res) => {
  const { nombre, precio, descripcion = '' } = req.body || {};

  if (typeof nombre !== 'string' || nombre.trim().length < 2) {
    return res.status(400).json({
      error: 'Nombre inválido'
    });
  }

  if (typeof precio !== 'number' || !(precio > 0)) {
    return res.status(400).json({
      error: 'Precio inválido'
    });
  }

  const r = db
    .prepare(
      'INSERT INTO productos (nombre, precio, descripcion) VALUES (?, ?, ?)'
    )
    .run(nombre.trim(), precio, String(descripcion).slice(0, 300));

  res.status(201).json({
    id: Number(r.lastInsertRowid),
    nombre,
    precio,
    descripcion
  });
});


// Ver el perfil del usuario (requiere iniciar sesión)
app.get('/api/perfil', verificarToken, (req, res) => {
  try {
    const usuario = db.prepare(
      'SELECT id, nombre, email FROM users WHERE id = ?'
    ).get(req.usuario.id);

    if (!usuario) {
      return res.status(404).json({
        error: 'Usuario no encontrado'
      });
    }

    return res.json(usuario);

  } catch (error) {
    console.error('Error al obtener perfil:', error);

    return res.status(500).json({
      error: 'No se pudo obtener el perfil'
    });
  }
});


 // ---------- XSS: salida escapada ----------
app.get('/buscar', (req, res) => {
  const q = String(req.query.q || '');
  res.send(`<h1>Resultados para: ${escapeHtml(q)}</h1>`);
});

// ---------- DEMOSTRACIÓN DE VULNERABILIDADES ----------
// Solo para prácticas locales. Nunca activar en producción.
if (process.env.DEMO_INSEGURO === 'true') {

  // SQL Injection: consulta insegura de demostración
  app.get('/demo/usuarios-inseguro', (req, res) => {
    const email = req.query.email || '';
    const sql = `SELECT id, nombre, email FROM users WHERE email = '${email}'`;

    try {
      res.json({
        sql,
        resultado: db.prepare(sql).all()
      });
    } catch (e) {
      res.status(400).json({
        sql,
        error: e.message
      });
    }
  });

  // XSS: muestra HTML sin escapar (demostración)
  app.get('/demo/buscar-inseguro', (req, res) => {
    res.type('html').send(
      `<h1>Resultados para: ${req.query.q || ''}</h1>`
    );
  });
}

 // ---------- Manejo de errores ----------
app.use((err, req, res, next) => {
  if (err.type === 'entity.parse.failed') {
    return res.status(400).json({
      error: 'JSON inválido'
    });
  }

  console.error(err);

  res.status(500).json({
    error: 'Error del servidor'
  });
});

// Iniciar el servidor
app.listen(PORT, () => {
  console.log(`Servidor funcionando en http://localhost:${PORT}`);
});

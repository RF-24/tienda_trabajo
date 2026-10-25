
const path = require('node:path');
const { DatabaseSync } = require('node:sqlite');

// Crear o abrir la base de datos SQLite
const db = new DatabaseSync(path.join(__dirname, 'tienda.db'));

// Crear las tablas de usuarios y productos
db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id       INTEGER PRIMARY KEY AUTOINCREMENT,
    nombre   TEXT NOT NULL,
    email    TEXT NOT NULL UNIQUE,
    password TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS productos (
    id          INTEGER PRIMARY KEY AUTOINCREMENT,
    nombre      TEXT NOT NULL,
    precio      REAL NOT NULL,
    descripcion TEXT
  );
`);

// Agregar productos de ejemplo si la tabla está vacía
const { total } = db.prepare(
  'SELECT COUNT(*) AS total FROM productos'
).get();

if (total === 0) {
  const insertar = db.prepare(
    'INSERT INTO productos (nombre, precio, descripcion) VALUES (?, ?, ?)'
  );

  [
    ['Teclado mecánico', 80, 'Teclado con switches rojos y retroiluminación.'],
    ['Mouse inalámbrico', 45, 'Mouse ergonómico de 1600 DPI.'],
    ['Monitor 24"', 520, 'Monitor Full HD con panel IPS.'],
    ['Audífonos USB', 95, 'Audífonos con micrófono para videollamadas.'],
    ['Webcam HD', 110, 'Cámara 1080p con enfoque automático.'],
  ].forEach((p) => insertar.run(...p));
}

module.exports = db;

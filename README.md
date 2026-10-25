# Tienda Segura

Este proyecto lo realicé como parte del trabajo de clase, siguiendo la guía de Tienda Segura.

Utilicé Node.js y Express para el backend, SQLite para guardar los usuarios y productos, y React con Vite para el frontend.

La tienda permite ver productos, buscarlos por nombre, registrarse, iniciar sesión y entrar al perfil del usuario.

También se trabajaron algunas medidas de seguridad como JWT, CORS, Helmet y protección contra SQL Injection y XSS.

## Cómo ejecutar el proyecto

Primero hay que tener instalado Node.js.

**1. Iniciar el backend**

Abrir una terminal dentro de la carpeta `backend` y ejecutar:

```bash
npm install
```

Después crear un archivo `.env` dentro de `backend` con estos datos:

```env
PORT=3000
JWT_SECRET=colocar_una_clave_secreta_larga_y_aleatoria
FRONTEND_ORIGIN=http://localhost:5173
DEMO_INSEGURO=false
```

Luego iniciar el servidor:

```bash
npm run dev
```

El backend funciona en `http://localhost:3000`.

**2. Iniciar el frontend**

Abrir otra terminal dentro de la carpeta `frontend` y ejecutar:

```bash
npm install
npm run dev
```

Después entrar desde el navegador a:

`http://localhost:5173`

Es necesario tener encendidos el backend y el frontend para utilizar la tienda.

## Cómo probar la tienda

Al abrir la página se puede utilizar el contador de Inicio y entrar a Productos para ver los cinco artículos de ejemplo.

También se puede buscar un producto y entrar a su detalle.

Para probar el perfil, primero hay que registrarse y después iniciar sesión con la cuenta creada.

La sesión utiliza un token JWT que dura una hora. Cuando vence, es necesario iniciar sesión nuevamente para acceder a los datos protegidos.

## Pruebas del backend

Con el backend encendido, abrir otra terminal en la carpeta `backend` y ejecutar:

```bash
npm run probar
```

Este comando ejecuta las pruebas que realizamos para comprobar el login, el registro y algunas medidas de seguridad.

## Sobre el diseño

La estructura y las funciones principales se desarrollaron siguiendo el PDF de clase.

Realicé algunos cambios en los colores, botones y tarjetas para darle un estilo diferente a la tienda, pero manteniendo las funciones solicitadas.
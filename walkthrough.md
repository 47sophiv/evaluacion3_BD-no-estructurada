# Walkthrough - Proyecto de Búsqueda Avanzada con MongoDB (Evaluación N°3)

Hemos completado con éxito todas las indicaciones establecidas en la pauta de la Evaluación N°3 para las entidades **Usuario** y **Videojuego** (entidad asignada por el sistema).

---

## 1. Cambios en la Entidad Usuario

### Backend (`backend/server.js`)
- **Validación de RUT:** Implementación de la función `validarRut` que verifica el formato y calcula el dígito verificador del RUT chileno.
- **Validación de Fecha de Nacimiento:** Se restringe a una fecha válida anterior a la fecha actual.
- **Dirección Estructurada:** Se actualizó `direccion` para ser un objeto estructurado obligatorio (`comuna`, `calle`, `numero`, `departamento`) en lugar de un arreglo.
- **Seguridad (Encriptación):** Se integró `bcryptjs` en la ruta `POST /guardarUsuario` para cifrar la contraseña antes de persistirla.
- **Ruta GET /listadoUsuarios:** Retorna todos los usuarios incluyendo el lookup del gentilicio (país de origen) mediante agregación.

### Frontend (`frontend/`)
- **Formulario de Registro (`formulario.html` y `formulario.js`):**
  - Añadidos los campos **RUT**, **Correo** (renombrado de Email) y **Teléfono**.
  - Validaciones en caliente mediante jQuery para el RUT y la fecha de nacimiento.
  - El objeto de dirección se envía estructurado anidadamente (`direccion`).
- **Listado de Usuarios (`inicio.html` y `inicio.js`):**
  - Tabla adaptada con DataTables para desplegar las nuevas columnas (Nombre, RUT, Correo, Teléfono, F. Nacimiento, País, Tecnologías, Género, Dirección estructurada).

---

## 2. Implementación de la Entidad Videojuego (Relación 1:N)

### Colección y Modelo en Mongoose
- Se creó el esquema `videojuegoSchema` en `backend/server.js` que mantiene una relación de referencia `ObjectId` hacia el modelo de `Usuario`.
- Propiedades implementadas:
  - `usuario`: ObjectId, referencia obligatoria a `Usuario`.
  - `titulo`: String, obligatorio.
  - `plataforma`: String, obligatorio.
  - `genero`: String, obligatorio.
  - `horasJugadas`: Number.
  - `fechaCompra`: Date.
  - `desarrollador`: String.
  - `clasificacion`: String.
  - `estado`: String (enum: `['Pendiente', 'Jugando', 'Completado']`).
  - `puntuacion`: Number (rango del 1 al 10).

### API Endpoints
- **`POST /guardarVideojuego`**: Valida y guarda un nuevo videojuego en MongoDB.
- **`GET /listadoVideojuegos`**: Retorna el listado completo de videojuegos integrando la agregación **`$lookup`** para obtener la información de su respectivo usuario dueño (Nombre y RUT).

### Nueva Interfaz Web (`frontend/videojuegos.html` y `videojuegos.js`)
- Añadido un enlace al menú de navegación principal (**Gestión Videojuegos**) en todas las vistas.
- Formulario interactivo de registro:
  - Carga de manera dinámica el selector de usuarios (`<select>`) con el **Nombre y RUT** de todos los usuarios registrados en el sistema.
  - Valida que todos los campos requeridos estén llenos antes del envío.
- Tabla DataTables interactiva:
  - Muestra la información de todos los videojuegos guardados e incluye las columnas de **Dueño (Usuario)** y **RUT Dueño**, asociando visualmente cada registro con el usuario correcto.

---

## 3. Pruebas y Verificación

Se realizaron pruebas de integración end-to-end con los siguientes resultados exitosos:

1. **Limpieza de Colecciones:** Se vaciaron los registros antiguos para asegurar que solo existan datos ingresados a través del formulario.
2. **Validación RUT Incorrecto:** Intentar crear un usuario con RUT inválido (`20.654.321-K`) fue **rechazado** por el servidor (error `400`).
3. **Validación RUT Correcto:** Al corregir el RUT a `20.654.321-3`, el registro se guardó correctamente (`200`) y la contraseña fue encriptada (`$2b$10$...`).
4. **Registro de Videojuego:** Se asoció un videojuego ("The Legend of Zelda: Breath of the Wild") al ID del usuario creado.
5. **Agregación Lookup:** La ruta `GET /listadoVideojuegos` resolvió correctamente la relación, devolviendo el nombre de usuario `"Sophia Caro"` y su RUT `"20.654.321-3"` junto con los detalles del videojuego.

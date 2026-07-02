// Importación de dependencias para ejecutar nuestra app en backend
const express = require('express'); // Librería que permite crear servidores JS
const cors = require('cors'); // Permite la ejecución de scripts desde fuera del servidor
const mongoose = require('mongoose'); // ORM (Object Relational Mapping) automatiza y oculta la creación de scripts de DB
const bcrypt = require('bcryptjs'); // Librería para hash de contraseñas

// Iniciamos la aplicación Express
const app = express();

// Instanciamos las dependencias en nuestra aplicación
app.use(cors());
app.use(express.json());

// Conexión a DB
mongoose.connect('mongodb://localhost:27017/IEI_N3_C3', {}) // Url servidor local + nombre DB
    .then(() => console.log('Conexión Exitosa!'))
    .catch((err) => console.log('No se ha podido establecer la conexión con el servidor ', err));

// Test para ver que la app esté corriendo en el puerto indicado
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Puerto: ${PORT}`))

// Función de validación para el RUT chileno con dígito verificador
function validarRut(rut) {
    if (!rut || typeof rut !== 'string') return false;
    // Limpiar puntos, espacios y guión
    const cleaned = rut.replace(/\./g, '').replace(/ /g, '').replace(/-/g, '').toUpperCase();
    if (cleaned.length < 8) return false;
    
    const numero = cleaned.slice(0, -1);
    const dv = cleaned.slice(-1);
    
    // Verificar que la parte numérica contenga solo dígitos
    if (!/^\d+$/.test(numero)) return false;
    
    let suma = 0;
    let multiplicador = 2;
    for (let i = numero.length - 1; i >= 0; i--) {
        suma += parseInt(numero.charAt(i), 10) * multiplicador;
        multiplicador = multiplicador === 7 ? 2 : multiplicador + 1;
    }
    const resto = suma % 11;
    const dvCalculado = 11 - resto;
    let expectedDv = '';
    if (dvCalculado === 11) expectedDv = '0';
    else if (dvCalculado === 10) expectedDv = 'K';
    else expectedDv = dvCalculado.toString();
    
    return dv === expectedDv;
}

const comuna = new mongoose.Schema({
    codigo_comuna: String,
    nombre_comuna: String,
    codigo_postal: String,
    nombre_region: String
});
const Comuna = mongoose.model('Comuna', comuna, 'comunas');

const direccionSchema = new mongoose.Schema({
    comuna: { type: String, required: true },
    calle: { type: String, required: true },
    numero: { type: String, required: true },
    departamento: { type: String }
}, { _id: false });

const usuarioSchema = new mongoose.Schema({
    nombre: { type: String, required: true },
    rut: {
        type: String,
        required: true,
        validate: {
            validator: validarRut,
            message: 'El RUT ingresado no es válido o tiene formato incorrecto.'
        }
    },
    correo: { type: String, required: true },
    telefono: { type: String },
    fechaNacimiento: {
        type: Date,
        validate: {
            validator: function(v) {
                // Debe ser anterior a la fecha actual si se proporciona
                return !v || v < new Date();
            },
            message: 'La fecha de nacimiento debe ser anterior a la fecha actual.'
        }
    },
    nacionalidad: { type: String, required: true },
    genero: { type: String, enum: ['M', 'F', 'O'] },
    direccion: { type: direccionSchema, required: true },
    contrasena: { type: String, required: true },
    tecnologias: [String],
    fechaRegistro: { type: Date, default: Date.now },
    activo: { type: Boolean, default: true }
});
const Usuario = mongoose.model('Usuario', usuarioSchema, 'usuarios');

const pais = new mongoose.Schema({
    nombre: String,
    iso2: String,
    iso3: String,
    codigoPais: String,
    nacionalidad: String
});
const Pais = mongoose.model('Pais', pais, 'paises');

// ESQUEMA Y MODELO DE VIDEOJUEGO
const videojuegoSchema = new mongoose.Schema({
    usuario: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'Usuario', 
        required: true 
    },
    titulo: { type: String, required: true },
    plataforma: { type: String, required: true },
    genero: { type: String, required: true },
    horasJugadas: { type: Number, default: 0 },
    fechaCompra: { type: Date },
    desarrollador: { type: String },
    clasificacion: { type: String },
    estado: { type: String, enum: ['Pendiente', 'Jugando', 'Completado'], default: 'Pendiente' },
    puntuacion: { type: Number, min: 1, max: 10 }
});
const Videojuego = mongoose.model('Videojuego', videojuegoSchema, 'videojuegos');


// Ruta para guardar un usuario
app.post('/guardarUsuario', async (req, res) => {
    try {
        const { 
            nombre, 
            rut, 
            correo, 
            telefono, 
            fechaNacimiento, 
            nacionalidad, 
            contrasena, 
            tecnologias, 
            genero, 
            direccion 
        } = req.body;

        // Validar que la contraseña exista
        if (!contrasena || contrasena.trim() === '') {
            return res.status(400).json({ message: 'La contraseña es obligatoria.' });
        }

        // Hashear la contraseña con bcryptjs
        const salt = await bcrypt.genSalt(10);
        const hashedContrasena = await bcrypt.hash(contrasena, salt);

        const nuevoUsuario = new Usuario({ 
            nombre, 
            rut, 
            correo, 
            telefono, 
            fechaNacimiento: fechaNacimiento ? new Date(fechaNacimiento) : undefined, 
            nacionalidad, 
            contrasena: hashedContrasena, 
            tecnologias, 
            genero, 
            direccion 
        });

        await nuevoUsuario.save();
        res.status(200).json({ message: 'Datos almacenados correctamente.' });
    } catch (err) {
        console.error('Error al guardar usuario:', err);
        res.status(400).json({ message: 'No ha sido posible almacenar los datos: ' + err.message });
    }
});

// Ruta para obtener listado de países
app.get('/listadoPaises', async (req, res) => {
    try {
        const paises = await Pais.find();
        res.status(200).json(paises);
    } catch (err) {
        res.status(500).json({ message: 'No ha sido posible obtener los datos: ' + err.message });
    }
});

// Ruta para obtener listado de comunas
app.get('/listadoComunas', async (req, res) => {
    try {
        const comunas = await Comuna.find();
        res.status(200).json(comunas);
    } catch (err) {
        res.status(500).json({ message: 'No ha sido posible obtener los datos: ' + err.message });
    }
});

// Ruta para obtener el listado de usuarios con lookup de su gentilicio/país
app.get('/listadoUsuarios', async (req, res) => {
    try {
        const usuarios = await Usuario.aggregate([
            {
                $lookup: {
                    from: 'paises', // Colección que contiene la información referenciada
                    localField: 'nacionalidad', // Campo que contiene la info referenciada (iso2)
                    foreignField: 'iso2', // Campo de la colección referenciada que queremos mostrar
                    as: 'gentilicio' // Alias del resultado
                }
            },
            {
                $unwind: {
                    path: '$gentilicio',
                    preserveNullAndEmptyArrays: true
                }
            }
        ]);
        res.status(200).json(usuarios);
    } catch (err) {
        res.status(500).json({ message: 'No ha sido posible obtener los datos: ' + err.message });
    }
});

// Ruta para guardar un videojuego
app.post('/guardarVideojuego', async (req, res) => {
    try {
        const { 
            nombreUsuario, // Se recibe el nombre de usuario escrito en el formulario
            titulo, 
            plataforma, 
            genero, 
            horasJugadas, 
            fechaCompra, 
            desarrollador, 
            clasificacion, 
            estado, 
            puntuacion 
        } = req.body;

        if (!nombreUsuario || nombreUsuario.trim() === '') {
            return res.status(400).json({ message: 'El nombre del usuario es obligatorio.' });
        }

        // Buscar el usuario por su nombre (fijo, ignorando mayúsculas/minúsculas y espacios)
        const userDoc = await Usuario.findOne({ 
            nombre: { $regex: new RegExp('^' + nombreUsuario.trim() + '$', 'i') } 
        });

        if (!userDoc) {
            return res.status(400).json({ message: 'No existe ningún usuario registrado con el nombre: ' + nombreUsuario });
        }

        const nuevoVideojuego = new Videojuego({
            usuario: userDoc._id, // Relacionamos usando el _id del usuario encontrado
            titulo,
            plataforma,
            genero,
            horasJugadas: horasJugadas ? Number(horasJugadas) : 0,
            fechaCompra: fechaCompra ? new Date(fechaCompra) : undefined,
            desarrollador,
            clasificacion,
            estado,
            puntuacion: puntuacion ? Number(puntuacion) : undefined
        });

        await nuevoVideojuego.save();
        res.status(200).json({ message: 'Videojuego almacenado correctamente.' });
    } catch (err) {
        console.error('Error al guardar videojuego:', err);
        res.status(400).json({ message: 'No ha sido posible almacenar el videojuego: ' + err.message });
    }
});

// Ruta para obtener listado de videojuegos con lookup de su usuario dueño
app.get('/listadoVideojuegos', async (req, res) => {
    try {
        const videojuegos = await Videojuego.aggregate([
            {
                $lookup: {
                    from: 'usuarios', // Colección destino en MongoDB
                    localField: 'usuario', // Campo de referencia local
                    foreignField: '_id', // Campo de comparación en la colección destino
                    as: 'datosUsuario' // Alias del resultado
                }
            },
            {
                $unwind: {
                    path: '$datosUsuario',
                    preserveNullAndEmptyArrays: true
                }
            }
        ]);
        res.status(200).json(videojuegos);
    } catch (err) {
        console.error('Error al listar videojuegos:', err);
        res.status(500).json({ message: 'No ha sido posible obtener los videojuegos: ' + err.message });
    }
});

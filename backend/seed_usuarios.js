const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

// Define the schemas according to the new evaluation requirements
const direccionSchema = new mongoose.Schema({
    comuna: { type: String, required: true },
    calle: { type: String, required: true },
    numero: { type: String, required: true },
    departamento: { type: String }
}, { _id: false });

const usuarioSchema = new mongoose.Schema({
    nombre: { type: String, required: true },
    rut: { type: String, required: true },
    correo: { type: String, required: true },
    telefono: { type: String },
    fechaNacimiento: { 
        type: Date,
        validate: {
            validator: function(v) {
                return v && v < new Date();
            },
            message: 'La fecha de nacimiento debe ser anterior a la fecha actual.'
        }
    },
    nacionalidad: { type: String, required: true },
    genero: { type: String, enum: ['M', 'F', 'O'] },
    direccion: { type: direccionSchema, required: true },
    contrasena: { type: String, required: true },
    fechaRegistro: { type: Date, default: Date.now },
    activo: { type: Boolean, default: true }
});

const Usuario = mongoose.model('Usuario', usuarioSchema, 'usuarios');

// Helper to generate a valid Chilean RUT
function generarRutValido() {
    // Generate a random number between 5,000,000 and 25,000,000
    const num = Math.floor(Math.random() * (25000000 - 5000000)) + 5000000;
    
    // Calculate verification digit (DV)
    let suma = 0;
    let multiplicador = 2;
    const numStr = num.toString();
    for (let i = numStr.length - 1; i >= 0; i--) {
        suma += parseInt(numStr.charAt(i), 10) * multiplicador;
        multiplicador = multiplicador === 7 ? 2 : multiplicador + 1;
    }
    const resto = suma % 11;
    const dvCalculado = 11 - resto;
    let dv = '';
    if (dvCalculado === 11) dv = '0';
    else if (dvCalculado === 10) dv = 'K';
    else dv = dvCalculado.toString();

    // Format: 12345678-9
    return `${num}-${dv}`;
}

async function main() {
    try {
        console.log('Connecting to MongoDB...');
        await mongoose.connect('mongodb://localhost:27017/IEI_N3_C3', {});
        console.log('Connected successfully.');

        // Get available communes and countries from the database to map address/nationality realistically
        const db = mongoose.connection.db;
        const comunasCol = db.collection('comunas');
        const paisesCol = db.collection('paises');

        const comunas = await comunasCol.find({}, { projection: { nombre_comuna: 1 } }).toArray();
        const paises = await paisesCol.find({}, { projection: { iso2: 1 } }).toArray();

        if (comunas.length === 0 || paises.length === 0) {
            console.error('Lookup collections (comunas, paises) are empty. Please run node seed.js first.');
            process.exit(1);
        }

        console.log('Generating 50 users...');
        const listadoUsuarios = [];
        const generos = ['M', 'F', 'O'];
        const calles = ['Av. Providencia', 'Huérfanos', 'Alameda', 'Av. Vitacura', 'Gran Avenida', 'Las Condes', 'San Martín', 'Prat'];

        for (let i = 1; i <= 50; i++) {
            const rut = generarRutValido();
            const correo = `usuario${i}@correo.com`;
            const contrasenaHashed = await bcrypt.hash(`Password${i}@2026`, 10);
            
            const anio = Math.floor(Math.random() * (2005 - 1970)) + 1970;
            const mes = Math.floor(Math.random() * 12);
            const dia = Math.floor(Math.random() * 28) + 1;
            const fechaNacimiento = new Date(anio, mes, dia);

            const nacionalidad = paises[Math.floor(Math.random() * paises.length)].iso2;
            const genero = generos[Math.floor(Math.random() * generos.length)];
            const comunaObj = comunas[Math.floor(Math.random() * comunas.length)];
            const comuna = comunaObj.nombre_comuna;
            const calle = calles[Math.floor(Math.random() * calles.length)];
            const numero = (Math.floor(Math.random() * 5000) + 1).toString();
            const departamento = Math.random() > 0.5 ? `Depto ${(Math.floor(Math.random() * 12) + 1) * 100 + (Math.floor(Math.random() * 4) + 1)}` : undefined;

            const userDoc = {
                nombre: `Usuario ${i}`,
                rut: rut,
                correo: correo,
                telefono: `+569${Math.floor(Math.random() * 90000000) + 10000000}`,
                fechaNacimiento: fechaNacimiento,
                nacionalidad: nacionalidad,
                genero: genero,
                direccion: {
                    comuna: comuna,
                    calle: calle,
                    numero: numero,
                    departamento: departamento
                },
                contrasena: contrasenaHashed,
                fechaRegistro: new Date(Date.now() - Math.floor(Math.random() * 30) * 24 * 60 * 60 * 1000), // Random in last 30 days
                activo: true
            };
            listadoUsuarios.push(userDoc);
        }

        console.log('Clearing old users collection...');
        await Usuario.deleteMany({});
        
        console.log('Inserting 50 new schema-compliant users...');
        await Usuario.insertMany(listadoUsuarios);
        console.log('50 users inserted successfully.');

        await mongoose.disconnect();
        console.log('Disconnected from MongoDB.');
    } catch (err) {
        console.error('Error during user seeding:', err);
    }
}

main();

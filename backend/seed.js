const fs = require('fs');
const path = require('path');
const mongoose = require('mongoose');

// Define schemas to ensure collections exist and can be populated
const PaisSchema = new mongoose.Schema({
    nombre: String,
    iso2: String,
    iso3: String,
    codigoPais: String,
    nacionalidad: String
}, { collection: 'paises' });

const ComunaSchema = new mongoose.Schema({
    codigo_comuna: String,
    nombre_comuna: String,
    codigo_postal: String,
    nombre_region: String
}, { collection: 'comunas' });

const Pais = mongoose.model('Pais', PaisSchema);
const Comuna = mongoose.model('Comuna', ComunaSchema);

async function seed() {
    try {
        console.log('Connecting to MongoDB...');
        await mongoose.connect('mongodb://localhost:27017/IEI_N3_C3', {});
        console.log('Connected to MongoDB successfully.');

        // 1. Seed Paises
        console.log('Reading paises.js...');
        const paisesFilePath = path.join(__dirname, 'data', 'paises.js');
        const paisesContent = fs.readFileSync(paisesFilePath, 'utf8');
        
        // Find the array bounds
        const paisesStartIndex = paisesContent.indexOf('[');
        const paisesEndIndex = paisesContent.lastIndexOf(']') + 1;
        if (paisesStartIndex === -1 || paisesEndIndex === 0) {
            throw new Error('Could not find array in paises.js');
        }
        const paisesArrayStr = paisesContent.substring(paisesStartIndex, paisesEndIndex);
        
        // Safely evaluate the array string to a JS object
        const paisesArray = eval(paisesArrayStr);
        console.log(`Parsed ${paisesArray.length} countries.`);
        
        console.log('Clearing old countries...');
        await Pais.deleteMany({});
        console.log('Inserting countries...');
        await Pais.insertMany(paisesArray);
        console.log('Countries seeded successfully.');

        // 2. Seed Comunas
        console.log('Reading comunas_chile.js...');
        const comunasFilePath = path.join(__dirname, 'data', 'comunas_chile.js');
        const comunasContent = fs.readFileSync(comunasFilePath, 'utf8');
        
        const comunasStartIndex = comunasContent.indexOf('[');
        const comunasEndIndex = comunasContent.lastIndexOf(']') + 1;
        if (comunasStartIndex === -1 || comunasEndIndex === 0) {
            throw new Error('Could not find array in comunas_chile.js');
        }
        const comunasArrayStr = comunasContent.substring(comunasStartIndex, comunasEndIndex);
        
        const comunasArray = eval(comunasArrayStr);
        console.log(`Parsed ${comunasArray.length} communes.`);
        
        console.log('Clearing old communes...');
        await Comuna.deleteMany({});
        console.log('Inserting communes...');
        await Comuna.insertMany(comunasArray);
        console.log('Communes seeded successfully.');

        await mongoose.disconnect();
        console.log('All seeding complete.');
    } catch (err) {
        console.error('Error during seeding:', err);
    }
}

seed();

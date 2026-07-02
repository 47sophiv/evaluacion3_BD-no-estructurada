window.onload = function () {
    obtenerVideojuegos();
}

async function obtenerVideojuegos() {
    try {
        const respuesta = await fetch("http://localhost:3000/listadoVideojuegos");
        const datos = await respuesta.json();
        console.log("Videojuegos cargados:", datos);

        new DataTable('#tablaVideojuegos', {
            data: datos,
            columns: [
                { data: 'titulo' },
                { data: 'plataforma' },
                { data: 'genero' },
                { data: 'horasJugadas', defaultContent: '0' },
                { 
                    data: 'fechaCompra',
                    render: function(data) {
                        if (!data) return '-';
                        const fecha = new Date(data);
                        return fecha.toLocaleDateString('es-CL', { timeZone: 'UTC' });
                    }
                },
                { data: 'desarrollador', defaultContent: '-' },
                { data: 'clasificacion', defaultContent: '-' },
                { data: 'estado', defaultContent: 'Pendiente' },
                { data: 'puntuacion', defaultContent: '-' },
                { 
                    data: 'datosUsuario',
                    render: function(data, type, row) {
                        return row.datosUsuario ? row.datosUsuario.nombre : '<span class="text-danger">Sin dueño</span>';
                    }
                }
            ]
        });

        if (!respuesta.ok) {
            throw new Error(respuesta.status);
        }
    } catch (error) {
        console.log('Ha ocurrido el siguiente error al obtener videojuegos: ', error);
    }
}

window.onload = function () {
    obtenerUsuarios();
}

async function obtenerUsuarios() {
    try {
        const respuesta = await fetch("http://localhost:3000/listadoUsuarios");
        const datos = await respuesta.json();
        console.log(datos);

        new DataTable('#tablaUsuarios', {
            data: datos,
            columns: [
                { data: 'nombre' },
                { data: 'rut' },
                { data: 'correo' },
                { data: 'telefono', defaultContent: '-' },
                { 
                    data: 'fechaNacimiento',
                    render: function(data) {
                        if (!data) return '-';
                        const fecha = new Date(data);
                        return fecha.toLocaleDateString('es-CL', { timeZone: 'UTC' });
                    }
                },
                { data: 'gentilicio.nombre', defaultContent: '-' },
                { 
                    data: 'tecnologias',
                    render: function(data) {
                        return Array.isArray(data) ? data.join(', ') : (data || '-');
                    }
                },
                { 
                    data: 'genero',
                    render: function(data) {
                        if (data === 'M') return 'Masculino';
                        if (data === 'F') return 'Femenino';
                        if (data === 'O') return 'Otro';
                        return data || '-';
                    }
                },
                { 
                    data: 'direccion',
                    render: function(data) {
                        if (!data) return '-';
                        let dirStr = `${data.calle} ${data.numero}`;
                        if (data.departamento) {
                            dirStr += `, ${data.departamento}`;
                        }
                        if (data.comuna) {
                            dirStr += `, ${data.comuna}`;
                        }
                        return dirStr;
                    }
                }
            ]
        });

        if (!respuesta.ok) {
            throw new Error(respuesta.status);
        }
    } catch (error) {
        console.log('Ha ocurrido el siguiente error: ', error);
    }
};
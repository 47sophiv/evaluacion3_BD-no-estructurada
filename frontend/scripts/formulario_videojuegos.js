function validarInput(input) {
    if (input.val() === '' || input.val() === null) {
        input.addClass('is-invalid');
        return false;
    } else {
        input.removeClass('is-invalid');
        return true;
    }
}

function validar_y_guardar() {
    let inputUsuarioNombre = $('#inputUsuarioNombre');
    let inputTitulo = $('#inputTitulo');
    let selectPlataforma = $('#selectPlataforma');
    let inputGenero = $('#inputGenero');
    let inputHorasJugadas = $('#inputHorasJugadas');
    
    // Opcionales o con valores predeterminados
    let inputFechaCompra = $('#inputFechaCompra');
    let inputDesarrollador = $('#inputDesarrollador');
    let selectClasificacion = $('#selectClasificacion');
    let selectEstado = $('#selectEstado');
    let inputPuntuacion = $('#inputPuntuacion');

    let formularioValido = true;

    if (!validarInput(inputUsuarioNombre)) {
        formularioValido = false;
    }
    if (!validarInput(inputTitulo)) {
        formularioValido = false;
    }
    if (!validarInput(selectPlataforma)) {
        formularioValido = false;
    }
    if (!validarInput(inputGenero)) {
        formularioValido = false;
    }
    if (!validarInput(inputHorasJugadas)) {
        formularioValido = false;
    }

    // Validar rango de puntuación si se ingresa
    if (inputPuntuacion.val() !== '') {
        const punt = Number(inputPuntuacion.val());
        if (isNaN(punt) || punt < 1 || punt > 10) {
            inputPuntuacion.addClass('is-invalid');
            formularioValido = false;
            alert('La puntuación debe ser un número entre 1 y 10.');
        } else {
            inputPuntuacion.removeClass('is-invalid');
        }
    }

    if (formularioValido) {
        const datos = {
            nombreUsuario: inputUsuarioNombre.val(),
            titulo: inputTitulo.val(),
            plataforma: selectPlataforma.val(),
            genero: inputGenero.val(),
            horasJugadas: inputHorasJugadas.val(),
            fechaCompra: inputFechaCompra.val() || undefined,
            desarrollador: inputDesarrollador.val() || undefined,
            clasificacion: selectClasificacion.val() || undefined,
            estado: selectEstado.val(),
            puntuacion: inputPuntuacion.val() || undefined
        };

        alert('Formulario de Videojuego válido, enviando al servidor...');

        const guardar = async () => {
            try {
                const respuesta = await fetch("http://localhost:3000/guardarVideojuego", {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(datos)
                });

                if (respuesta.ok) {
                    alert('Videojuego registrado correctamente.');
                    window.location.href = './videojuegos.html'; // Redirect to the list view!
                } else {
                    const errData = await respuesta.json();
                    alert('Error: ' + errData.message);
                }
            } catch (error) {
                console.log('Error al guardar: ', error);
                alert('Ocurrió un error al intentar conectarse al servidor.');
            }
        }
        guardar();
    } else {
        alert('Complete todos los campos obligatorios del formulario correctamente.');
    }
}

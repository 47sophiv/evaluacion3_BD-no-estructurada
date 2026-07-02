window.onload = function () {
    cargarPaises();
    cargarComunas();
}

function validar_fomulario() {
    let inputNombre = $("#inputNombre");
    let inputRut = $('#inputRut');
    let inputCorreo = $('#inputCorreo');
    let inputTelefono = $('#inputTelefono');
    let fechaNacimiento = $('#inputFechaNac');
    let nacionalidad = $('#selectNacionalidad');
    let contrasena = $('#inputContrasena');
    let repetirContrasena = $('#inputRepetirContrasena');
    
    // Dirección
    let selectComuna = $('#selectComuna');
    let inputCalle = $('#inputCalle');
    let inputNumero = $('#inputNumero');
    let inputDepartamento = $('#inputDepartamento');

    let formularioValido = true;

    if (!validarInput(inputNombre)) {
        formularioValido = false;
    }
    if (!validarRut(inputRut)) {
        formularioValido = false;
    }
    if (!validarEmail(inputCorreo)) {
        formularioValido = false;
    }
    if (!validarInput(inputTelefono)) {
        formularioValido = false;
    }
    if (!validarFechaNacimiento(fechaNacimiento)) {
        formularioValido = false;
    }
    if (!validarInput(nacionalidad)) {
        formularioValido = false;
    }
    if (!validarContrasena(contrasena)) {
        formularioValido = false;
    }
    if (!validarRepetirContrasena(repetirContrasena, contrasena)) {
        formularioValido = false;
    }
    if (!validarInput(selectComuna)) {
        formularioValido = false;
    }
    if (!validarInput(inputCalle)) {
        formularioValido = false;
    }
    if (!validarInput(inputNumero)) {
        formularioValido = false;
    }

    if (formularioValido === true) {
        // Obtener array de tecnologías
        const tecnologíasSeleccionadas = $('input[name="tecnologias"]:checked').map(function () {
            return $(this).val();
        }).get();

        // Obtener género seleccionado
        const generoSeleccionado = $('input[name="genero"]:checked').val();

        // Estructurar el objeto de envío conforme al nuevo esquema del backend
        const datos = {
            nombre: inputNombre.val(),
            rut: inputRut.val(),
            correo: inputCorreo.val(),
            telefono: inputTelefono.val(),
            fechaNacimiento: fechaNacimiento.val(),
            nacionalidad: nacionalidad.val(),
            contrasena: contrasena.val(),
            tecnologias: tecnologíasSeleccionadas,
            genero: generoSeleccionado,
            direccion: {
                comuna: selectComuna.val(),
                calle: inputCalle.val(),
                numero: inputNumero.val(),
                departamento: inputDepartamento.val() || undefined
            }
        };

        alert('Formulario Válido, enviando datos al servidor...');

        const enviarFomulario = async () => {
            try {
                const respuesta = await fetch("http://localhost:3000/guardarUsuario", {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(datos)
                });

                if (respuesta.ok) {
                    window.location.href = './inicio.html';
                } else {
                    const errorData = await respuesta.json();
                    alert('Error en registro: ' + (errorData.message || 'Error del servidor'));
                }
            } catch (error) {
                console.log('Ha ocurrido el siguiente error: ', error);
                alert('No se pudo establecer conexión con el servidor.');
            }
        }
        enviarFomulario();
    } else {
        alert('Complete todos los campos del formulario correctamente.')
    }
};

function validarInput(input) {
    if (input.val() === '' || input.val() === null) {
        input.addClass('is-invalid');
        return false;
    } else {
        input.removeClass('is-invalid');
        return true;
    }
}

function validarRut(input) {
    const val = input.val();
    if (!val) {
        input.addClass('is-invalid');
        return false;
    }
    
    // Limpiar puntos, espacios y guión
    const cleaned = val.replace(/\./g, '').replace(/ /g, '').replace(/-/g, '').toUpperCase();
    if (cleaned.length < 8) {
        input.addClass('is-invalid');
        return false;
    }
    
    const numero = cleaned.slice(0, -1);
    const dv = cleaned.slice(-1);
    
    // Verificar que la parte numérica contenga solo dígitos
    if (!/^\d+$/.test(numero)) {
        input.addClass('is-invalid');
        return false;
    }
    
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
    
    if (dv !== expectedDv) {
        input.addClass('is-invalid');
        return false;
    } else {
        input.removeClass('is-invalid');
        return true;
    }
}

function validarEmail(input) {
    if (validarInput(input)) {
        const regexEmail = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,5}$/
        if (regexEmail.test(input.val())) {
            input.removeClass('is-invalid');
            return true;
        } else {
            input.addClass('is-invalid');
            return false;
        }
    }
    return false;
}

function validarFechaNacimiento(input) {
    if (!validarInput(input)) return false;
    const valDate = new Date(input.val());
    const today = new Date();
    // Debe ser una fecha válida y anterior a hoy
    if (isNaN(valDate.getTime()) || valDate >= today) {
        input.addClass('is-invalid');
        return false;
    } else {
        input.removeClass('is-invalid');
        return true;
    }
}

function validarContrasena(input) {
    if (validarInput(input)) {
        const regexContrasena = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[$@$!%*?&])([A-Za-z\d$@$!%*?&]|[^ ]){8,15}$/;
        if (regexContrasena.test(input.val())) {
            input.removeClass('is-invalid');
            return true;
        } else {
            input.addClass('is-invalid');
            return false;
        }
    }
    return false;
}

function validarRepetirContrasena(input, input2) {
    if (validarInput(input)) {
        if (input.val() === input2.val()) {
            input.removeClass('is-invalid');
            return true;
        } else {
            input.addClass('is-invalid');
            return false;
        }
    }
    return false;
}

async function cargarPaises() {
    try {
        const respuesta = await fetch("http://localhost:3000/listadoPaises");
        const datos = await respuesta.json();

        const select = $('#selectNacionalidad');
        datos.forEach(pais => {
            const option = $("<option></option>",{
                'text':pais.nombre,
                'value':pais.iso2
            });
            select.append(option.css("text-transform", "capitalize"));            
        });

        if (!respuesta.ok) {
            throw new Error(respuesta.status);
        }
    } catch (error) {
        console.log('Ha ocurrido el siguiente error: ', error)
    }
}

async function cargarComunas() {
    try {
        const respuesta = await fetch("http://localhost:3000/listadoComunas");
        const datos = await respuesta.json();

        const select = $('#selectComuna');
        datos.forEach(comuna => {
            const option = $("<option></option>",{
                'text':comuna.nombre_comuna,
                'value':comuna.nombre_comuna // We store the name in the database directly
            });
            select.append(option.css("text-transform", "capitalize"));            
        });

        if (!respuesta.ok) {
            throw new Error(respuesta.status);
        }
    } catch (error) {
        console.log('Ha ocurrido el siguiente error: ', error)
    }
}
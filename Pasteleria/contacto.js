// ============================================
// FORMULARIO DE CONTACTO
// ============================================
// Reglas del enunciado:
//   Nombre     → obligatorio, máximo 100
//   Correo     → opcional, máximo 100, solo dominios permitidos
//   Comentario → obligatorio, máximo 500
//
// No hay servidor de correo: el mensaje se guarda en localStorage
// (clave "mensajesContacto") para simular que se envió.


document.addEventListener("DOMContentLoaded", function () {
    const formulario = document.querySelector("#form-contacto");

    if (!formulario) {
        return;
    }

    formulario.addEventListener("submit", function (evento) {
        evento.preventDefault();

        const nombre = document.querySelector("#nombre").value;
        const correo = document.querySelector("#correo").value;
        const comentario = document.querySelector("#comentario").value.trim();

        const errorNombre = validarNombre(nombre, 100, "El nombre");
        const errorCorreo = validarCorreo(correo, false);
        let errorComentario = "";

        if (!comentario) {
            errorComentario = "El comentario es obligatorio.";
        } else if (comentario.length > 500) {
            errorComentario = "El comentario no puede superar los 500 caracteres.";
        }

        mostrarError("nombre", errorNombre);
        mostrarError("correo", errorCorreo);
        mostrarError("comentario", errorComentario);

        if (errorNombre || errorCorreo || errorComentario) {
            return;
        }

        const mensajes = JSON.parse(localStorage.getItem("mensajesContacto") || "[]");

        mensajes.push({
            nombre: nombre.trim(),
            correo: correo.trim(),
            comentario: comentario,
            fecha: new Date().toISOString()
        });

        localStorage.setItem("mensajesContacto", JSON.stringify(mensajes));

        formulario.reset();
        document.querySelector("#contador-comentario").textContent = "0 / 500";
        mostrarAviso("Mensaje enviado. Te contactaremos pronto.", "ok");
    });

    // Contador en vivo: "123 / 500" mientras la persona escribe.
    const comentario = document.querySelector("#comentario");
    const contador = document.querySelector("#contador-comentario");

    if (comentario && contador) {
        comentario.addEventListener("input", function () {
            contador.textContent = comentario.value.length + " / 500";
        });
    }
});

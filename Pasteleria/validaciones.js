// ============================================
// VALIDACIONES COMPARTIDAS
// ============================================
// Este archivo se usa en login, registro, contacto y admin.
// Idea clave: cada función devuelve "" si el dato está bien,
// o un texto de error si está mal. Así el HTML solo muestra el mensaje.
//
// Recuerda: esto NO es una base de datos. Solo revisamos el formato
// de lo que la persona escribió.


// Dominios que el enunciado permite. Si el correo no termina en uno
// de estos, se rechaza.
const DOMINIOS_PERMITIDOS = [
    "@duoc.cl",
    "@profesor.duoc.cl",
    "@gmail.com"
];


// ============================================
// AYUDAS PEQUEÑAS (se reutilizan en varias validaciones)
// ============================================

// true si el usuario escribió algo (no sirve un espacio en blanco).
function textoObligatorio(valor) {
    return valor !== undefined && valor !== null && String(valor).trim() !== "";
}


// true si el texto no se pasa del máximo pedido (ej: 100 caracteres).
function largoMaximo(valor, maximo) {
    return String(valor).trim().length <= maximo;
}


// true si el largo está entre un mínimo y un máximo (ej: contraseña 4 a 10).
function largoEntre(valor, minimo, maximo) {
    const largo = String(valor).length;
    return largo >= minimo && largo <= maximo;
}


// ============================================
// CORREO
// ============================================
// Reglas del enunciado:
// - máximo 100 caracteres
// - solo @duoc.cl, @profesor.duoc.cl y @gmail.com
//
// La expresión regular (regex) es un "filtro" de texto:
//  ^          = desde el inicio
//  [^\s@]+    = uno o más caracteres que no sean espacio ni @
//  @(duoc...) = luego un @ y uno de los 3 dominios
//  $          = hasta el final
//  i          = no importa mayúsculas o minúsculas

function correoPermitido(correo) {
    const valor = String(correo).trim().toLowerCase();

    if (!valor) {
        return false;
    }

    if (valor.length > 100) {
        return false;
    }

    const patron = /^[^\s@]+@(duoc\.cl|profesor\.duoc\.cl|gmail\.com)$/i;

    return patron.test(valor);
}


// obligatorio = true  → login y registro (el correo SÍ hay que llenarlo)
// obligatorio = false → contacto (el correo puede ir vacío)
function validarCorreo(correo, obligatorio) {
    const valor = String(correo || "").trim();

    if (!valor) {
        if (obligatorio) {
            return "El correo es obligatorio.";
        }
        return "";
    }

    if (!largoMaximo(valor, 100)) {
        return "El correo no puede superar los 100 caracteres.";
    }

    if (!correoPermitido(valor)) {
        return "Solo se permiten correos @duoc.cl, @profesor.duoc.cl y @gmail.com.";
    }

    return "";
}


// ============================================
// CONTRASEÑA
// ============================================
// Regla: obligatoria y entre 4 y 10 caracteres.

function validarPassword(password) {
    const valor = String(password || "");

    if (!valor) {
        return "La contraseña es obligatoria.";
    }

    if (!largoEntre(valor, 4, 10)) {
        return "La contraseña debe tener entre 4 y 10 caracteres.";
    }

    return "";
}


// ============================================
// NOMBRE / APELLIDOS / DIRECCIÓN / COMENTARIO
// ============================================
// Misma lógica, distinto máximo:
// nombre de usuario = 50, apellidos = 100, dirección = 300, contacto = 100.

function validarNombre(nombre, maximo, etiqueta) {
    const valor = String(nombre || "").trim();
    const titulo = etiqueta || "El nombre";

    if (!valor) {
        return titulo + " es obligatorio.";
    }

    if (!largoMaximo(valor, maximo)) {
        return titulo + " no puede superar los " + maximo + " caracteres.";
    }

    return "";
}


// ============================================
// RUN CHILENO
// ============================================
// El RUN se puede escribir con puntos y guión (12.345.678-5)
// o pegado (123456785). Primero lo "limpiamos" y después
// comprobamos el dígito verificador (el número o K del final).

function limpiarRUN(run) {
    return String(run || "")
        .replace(/\./g, "")
        .replace(/-/g, "")
        .trim()
        .toUpperCase();
}


// Lo deja bonito para guardarlo: 123456785 → 12.345.678-5
function formatearRUN(run) {
    const limpio = limpiarRUN(run);

    if (limpio.length < 2) {
        return run;
    }

    const cuerpo = limpio.slice(0, -1);
    const dv = limpio.slice(-1);
    const conPuntos = cuerpo.replace(/\B(?=(\d{3})+(?!\d))/g, ".");

    return conPuntos + "-" + dv;
}


// Algoritmo oficial del RUN:
// se recorre el número de derecha a izquierda multiplicando 2,3,4,5,6,7,2,3...
// con el resto se obtiene el dígito verificador.
function runValido(run) {
    const limpio = limpiarRUN(run);

    if (!/^\d{7,8}[0-9K]$/.test(limpio)) {
        return false;
    }

    const cuerpo = limpio.slice(0, -1);
    const dv = limpio.slice(-1);

    let suma = 0;
    let multiplo = 2;

    for (let i = cuerpo.length - 1; i >= 0; i--) {
        suma += Number(cuerpo[i]) * multiplo;
        multiplo = multiplo === 7 ? 2 : multiplo + 1;
    }

    const resto = 11 - (suma % 11);
    const dvEsperado = resto === 11 ? "0" : resto === 10 ? "K" : String(resto);

    return dv === dvEsperado;
}


function validarRUN(run) {
    const valor = String(run || "").trim();

    if (!valor) {
        return "El RUN es obligatorio.";
    }

    if (!runValido(valor)) {
        return "Ingresa un RUN chileno válido, por ejemplo 12.345.678-5.";
    }

    return "";
}


// ============================================
// CÓMO SE MUESTRA EL ERROR EN PANTALLA
// ============================================
// En el HTML cada input tiene un hermano:
//   <input id="correo">
//   <span id="error-correo"></span>
// Esta función escribe el mensaje ahí y pinta el borde rojo.

function mostrarError(idCampo, mensaje) {
    const error = document.querySelector("#error-" + idCampo);
    const campo = document.querySelector("#" + idCampo);

    if (error) {
        error.textContent = mensaje || "";
    }

    if (campo) {
        if (mensaje) {
            campo.classList.add("campo-invalido");
        } else {
            campo.classList.remove("campo-invalido");
        }
    }
}


function limpiarErrores(ids) {
    ids.forEach(function (id) {
        mostrarError(id, "");
    });
}


// Aviso flotante (esquina inferior). Sirve para "Producto agregado",
// "Compra realizada", etc. Se esconde solo a los 2.8 segundos.
function mostrarAviso(texto, tipo) {
    let aviso = document.querySelector("#aviso-sistema");

    if (!aviso) {
        aviso = document.createElement("div");
        aviso.id = "aviso-sistema";
        document.body.appendChild(aviso);
    }

    aviso.className = "aviso-sistema " + (tipo || "ok");
    aviso.textContent = texto;
    aviso.classList.add("visible");

    setTimeout(function () {
        aviso.classList.remove("visible");
    }, 2800);
}

// ============================================
// USUARIOS Y SESIÓN (simulación sin base de datos)
// ============================================
// En un sistema real esto viviría en un servidor + base de datos.
// Aquí el "servidor" es el navegador: localStorage.
//
// Hay 2 "cajones":
//   "usuarios" → lista de todas las cuentas
//   "sesion"   → quién está logueado ahora (o nada)
//
// El registro público usa LOS MISMOS CAMPOS que "Crear usuario"
// en el administrador. La diferencia: el registro siempre guarda
// tipo "Cliente". El admin puede elegir Administrador / Cliente / Vendedor.


const CLAVE_USUARIOS = "usuarios";
const CLAVE_SESION = "sesion";


// ============================================
// USUARIOS DE PRUEBA
// ============================================
// Si es la primera vez que se abre el sitio, se crean estas cuentas
// para poder probar login, descuentos y el panel admin.

function usuariosIniciales() {
    return [
        {
            run: "11.111.111-1",
            nombre: "Ana",
            apellidos: "Administradora",
            correo: "admin@gmail.com",
            fechaNacimiento: "1985-03-12",
            tipoUsuario: "Administrador",
            region: "Metropolitana de Santiago",
            comuna: "Santiago",
            direccion: "Av. Providencia 1000",
            password: "admin1"
        },
        {
            run: "22.222.222-2",
            nombre: "Carlos",
            apellidos: "Cliente",
            correo: "cliente@gmail.com",
            fechaNacimiento: "1992-07-20",
            tipoUsuario: "Cliente",
            region: "Metropolitana de Santiago",
            comuna: "Ñuñoa",
            direccion: "Irarrázaval 2500",
            password: "1234"
        },
        {
            run: "33.333.333-3",
            nombre: "Daniela",
            apellidos: "Estudiante",
            correo: "alumno@duoc.cl",
            fechaNacimiento: "2003-11-05",
            tipoUsuario: "Cliente",
            region: "Valparaíso",
            comuna: "Viña del Mar",
            direccion: "Av. Libertad 400",
            password: "duoc1"
        },
        {
            run: "44.444.444-4",
            nombre: "Elena",
            apellidos: "Mayor",
            correo: "mayor@gmail.com",
            fechaNacimiento: "1968-01-30",
            tipoUsuario: "Cliente",
            region: "Metropolitana de Santiago",
            comuna: "Maipú",
            direccion: "Pajaritos 2100",
            password: "1234"
        }
    ];
}


// ============================================
// LEER Y GUARDAR EN LOCALSTORAGE
// ============================================
// localStorage solo guarda TEXTO. Por eso:
//   JSON.stringify(objeto) → lo convierte en texto para guardar
//   JSON.parse(texto)      → lo vuelve a convertir en objeto/arreglo

function obtenerUsuarios() {
    const guardados = localStorage.getItem(CLAVE_USUARIOS);

    if (guardados) {
        return JSON.parse(guardados);
    }

    const iniciales = usuariosIniciales();
    localStorage.setItem(CLAVE_USUARIOS, JSON.stringify(iniciales));
    return iniciales;
}


function guardarUsuarios(usuarios) {
    localStorage.setItem(CLAVE_USUARIOS, JSON.stringify(usuarios));
}


function obtenerSesion() {
    const sesion = localStorage.getItem(CLAVE_SESION);
    return sesion ? JSON.parse(sesion) : null;
}


// No guardamos la contraseña en la sesión: no hace falta para mostrar
// el nombre, aplicar descuentos o saber si es administrador.
function guardarSesion(usuario) {
    const sesion = {
        run: usuario.run,
        nombre: usuario.nombre,
        apellidos: usuario.apellidos,
        correo: usuario.correo,
        fechaNacimiento: usuario.fechaNacimiento,
        tipoUsuario: usuario.tipoUsuario
    };

    localStorage.setItem(CLAVE_SESION, JSON.stringify(sesion));
}


function cerrarSesion() {
    localStorage.removeItem(CLAVE_SESION);
}


// ============================================
// EDAD (para el descuento FELICES50 del carrito)
// ============================================

function calcularEdad(fechaNacimiento) {
    if (!fechaNacimiento) {
        return null;
    }

    const hoy = new Date();
    const nacimiento = new Date(fechaNacimiento + "T00:00:00");
    let edad = hoy.getFullYear() - nacimiento.getFullYear();
    const mes = hoy.getMonth() - nacimiento.getMonth();

    if (mes < 0 || (mes === 0 && hoy.getDate() < nacimiento.getDate())) {
        edad--;
    }

    return edad;
}


// ============================================
// LEER EL FORMULARIO (registro y admin son casi iguales)
// ============================================
// esAdmin = true  → se lee el select "tipo de usuario"
// esAdmin = false → se fuerza tipo "Cliente"

function leerUsuarioDesdeFormulario(esAdmin) {
    return {
        run: formatearRUN(document.querySelector("#run").value),
        nombre: document.querySelector("#nombre").value.trim(),
        apellidos: document.querySelector("#apellidos").value.trim(),
        correo: document.querySelector("#correo").value.trim().toLowerCase(),
        fechaNacimiento: document.querySelector("#fechaNacimiento").value,
        tipoUsuario: esAdmin
            ? document.querySelector("#tipoUsuario").value
            : "Cliente",
        region: document.querySelector("#region").value,
        comuna: document.querySelector("#comuna").value,
        direccion: document.querySelector("#direccion").value.trim(),
        password: document.querySelector("#password").value
    };
}


function validarUsuarioFormulario(usuario, esEdicion) {
    const errores = {
        run: validarRUN(usuario.run),
        nombre: validarNombre(usuario.nombre, 50, "El nombre"),
        apellidos: validarNombre(usuario.apellidos, 100, "Los apellidos"),
        correo: validarCorreo(usuario.correo, true),
        region: usuario.region ? "" : "La región es obligatoria.",
        comuna: usuario.comuna ? "" : "La comuna es obligatoria.",
        direccion: validarNombre(usuario.direccion, 300, "La dirección"),
        password: ""
    };

    // Al editar, si dejan la contraseña vacía, se mantiene la anterior.
    if (!esEdicion || usuario.password) {
        errores.password = validarPassword(usuario.password);
    }

    if (document.querySelector("#tipoUsuario") && !usuario.tipoUsuario) {
        errores.tipoUsuario = "El tipo de usuario es obligatorio.";
    }

    return errores;
}


function formularioUsuarioEsValido(errores) {
    let valido = true;

    Object.keys(errores).forEach(function (campo) {
        if (errores[campo]) {
            valido = false;
        }

        mostrarError(campo, errores[campo]);
    });

    return valido;
}


// Evita dos cuentas con el mismo correo o el mismo RUN.
// runOriginal se usa al EDITAR: no queremos que el usuario "choque" consigo mismo.
function usuarioDuplicado(usuario, runOriginal) {
    const usuarios = obtenerUsuarios();

    const mismoCorreo = usuarios.some(function (item) {
        return item.correo === usuario.correo && item.run !== runOriginal;
    });

    if (mismoCorreo) {
        return "Ya existe un usuario con ese correo.";
    }

    const mismoRun = usuarios.some(function (item) {
        return limpiarRUN(item.run) === limpiarRUN(usuario.run) && item.run !== runOriginal;
    });

    if (mismoRun) {
        return "Ya existe un usuario con ese RUN.";
    }

    return "";
}


function guardarUsuarioNuevo(usuario) {
    const usuarios = obtenerUsuarios();
    usuarios.push(usuario);
    guardarUsuarios(usuarios);
}


// ============================================
// MENÚ: cambiar "Iniciar sesión" por "Cerrar sesión"
// ============================================
// Se llama en TODAS las páginas. Si hay sesión, muestra el saludo
// y el link Admin (solo si el tipo es Administrador).

function actualizarNavAuth() {
    const linkSesion = document.querySelector("#nav-sesion");
    const linkRegistro = document.querySelector("#nav-registro");
    const linkAdmin = document.querySelector("#nav-admin");
    const sesion = obtenerSesion();

    if (linkSesion) {
        if (sesion) {
            linkSesion.textContent = "Cerrar sesión";
            linkSesion.href = "#";
            linkSesion.onclick = function (evento) {
                evento.preventDefault();
                cerrarSesion();
                window.location.href = "index.html";
            };
        } else {
            linkSesion.textContent = "Iniciar sesión";
            linkSesion.href = "login.html";
            linkSesion.onclick = null;
        }
    }

    if (linkRegistro) {
        linkRegistro.style.display = sesion ? "none" : "";
    }

    if (linkAdmin) {
        if (sesion && sesion.tipoUsuario === "Administrador") {
            linkAdmin.style.display = "";
        } else {
            linkAdmin.style.display = "none";
        }
    }

    const saludo = document.querySelector("#saludo-usuario");

    if (saludo && sesion) {
        saludo.textContent = "Hola, " + sesion.nombre;
        saludo.style.display = "";
    } else if (saludo) {
        saludo.style.display = "none";
    }
}


// Si alguien entra a admin.html sin ser administrador, lo mandamos al login.
function exigirAdministrador() {
    const sesion = obtenerSesion();

    if (!sesion || sesion.tipoUsuario !== "Administrador") {
        window.location.href = "login.html";
        return false;
    }

    return true;
}


// ============================================
// LOGIN
// ============================================
// 1) Evitar que la página se recargue (preventDefault)
// 2) Validar formato de correo y contraseña
// 3) Buscar si existe esa combinación en localStorage
// 4) Guardar la sesión y redirigir

function iniciarLogin() {
    const formulario = document.querySelector("#form-login");

    if (!formulario) {
        return;
    }

    formulario.addEventListener("submit", function (evento) {
        evento.preventDefault();

        const correo = document.querySelector("#correo").value.trim();
        const password = document.querySelector("#password").value;

        const errorCorreo = validarCorreo(correo, true);
        const errorPassword = validarPassword(password);

        mostrarError("correo", errorCorreo);
        mostrarError("password", errorPassword);

        if (errorCorreo || errorPassword) {
            return;
        }

        const usuario = obtenerUsuarios().find(function (item) {
            return item.correo === correo.toLowerCase() && item.password === password;
        });

        if (!usuario) {
            mostrarError("password", "Correo o contraseña incorrectos.");
            return;
        }

        guardarSesion(usuario);

        if (usuario.tipoUsuario === "Administrador") {
            window.location.href = "admin.html";
        } else {
            window.location.href = "index.html";
        }
    });
}


// ============================================
// REGISTRO PÚBLICO
// ============================================
// Misma ficha que el admin, pero el tipo queda fijo en Cliente
// y después inicia sesión automáticamente.

function iniciarRegistro() {
    const formulario = document.querySelector("#form-registro");

    if (!formulario) {
        return;
    }

    cargarRegiones(
        document.querySelector("#region"),
        document.querySelector("#comuna")
    );

    formulario.addEventListener("submit", function (evento) {
        evento.preventDefault();

        const usuario = leerUsuarioDesdeFormulario(false);
        const errores = validarUsuarioFormulario(usuario, false);

        if (!formularioUsuarioEsValido(errores)) {
            return;
        }

        const duplicado = usuarioDuplicado(usuario, "");

        if (duplicado) {
            mostrarError("correo", duplicado);
            return;
        }

        guardarUsuarioNuevo(usuario);
        guardarSesion(usuario);
        window.location.href = "index.html";
    });
}


// ============================================
// PANEL ADMIN: listar / crear / editar / eliminar
// ============================================

function renderizarTablaUsuarios() {
    const cuerpo = document.querySelector("#tabla-usuarios tbody");

    if (!cuerpo) {
        return;
    }

    const usuarios = obtenerUsuarios();

    cuerpo.innerHTML = usuarios.map(function (usuario) {
        return `
            <tr>
                <td>${usuario.run}</td>
                <td>${usuario.nombre} ${usuario.apellidos}</td>
                <td>${usuario.correo}</td>
                <td>${usuario.tipoUsuario}</td>
                <td>${usuario.comuna}</td>
                <td>
                    <button class="btn btn-pequeno" data-editar="${usuario.run}">Editar</button>
                    <button class="btn btn-pequeno btn-eliminar" data-eliminar="${usuario.run}">Eliminar</button>
                </td>
            </tr>
        `;
    }).join("");
}


function cargarUsuarioEnFormulario(usuario) {
    document.querySelector("#run").value = usuario.run;
    document.querySelector("#nombre").value = usuario.nombre;
    document.querySelector("#apellidos").value = usuario.apellidos;
    document.querySelector("#correo").value = usuario.correo;
    document.querySelector("#fechaNacimiento").value = usuario.fechaNacimiento || "";
    document.querySelector("#tipoUsuario").value = usuario.tipoUsuario;
    document.querySelector("#direccion").value = usuario.direccion;
    document.querySelector("#password").value = "";
    document.querySelector("#run-original").value = usuario.run;

    cargarRegiones(
        document.querySelector("#region"),
        document.querySelector("#comuna"),
        usuario.region,
        usuario.comuna
    );

    document.querySelector("#titulo-form-usuario").textContent = "Editar usuario";
    document.querySelector("#btn-guardar-usuario").textContent = "Actualizar usuario";
}


function limpiarFormularioAdmin() {
    const formulario = document.querySelector("#form-usuario-admin");

    if (!formulario) {
        return;
    }

    formulario.reset();
    document.querySelector("#run-original").value = "";
    document.querySelector("#titulo-form-usuario").textContent = "Crear usuario";
    document.querySelector("#btn-guardar-usuario").textContent = "Crear usuario";

    cargarRegiones(
        document.querySelector("#region"),
        document.querySelector("#comuna")
    );

    limpiarErrores([
        "run",
        "nombre",
        "apellidos",
        "correo",
        "region",
        "comuna",
        "direccion",
        "password",
        "tipoUsuario"
    ]);
}


function iniciarAdminUsuarios() {
    const formulario = document.querySelector("#form-usuario-admin");

    if (!formulario) {
        return;
    }

    if (!exigirAdministrador()) {
        return;
    }

    cargarRegiones(
        document.querySelector("#region"),
        document.querySelector("#comuna")
    );

    renderizarTablaUsuarios();

    formulario.addEventListener("submit", function (evento) {
        evento.preventDefault();

        const runOriginal = document.querySelector("#run-original").value;
        const esEdicion = Boolean(runOriginal);
        const usuario = leerUsuarioDesdeFormulario(true);
        const errores = validarUsuarioFormulario(usuario, esEdicion);

        if (!formularioUsuarioEsValido(errores)) {
            return;
        }

        const duplicado = usuarioDuplicado(usuario, runOriginal);

        if (duplicado) {
            mostrarError("correo", duplicado);
            return;
        }

        const usuarios = obtenerUsuarios();

        if (esEdicion) {
            const indice = usuarios.findIndex(function (item) {
                return item.run === runOriginal;
            });

            if (indice === -1) {
                return;
            }

            if (!usuario.password) {
                usuario.password = usuarios[indice].password;
            }

            usuarios[indice] = usuario;
        } else {
            usuarios.push(usuario);
        }

        guardarUsuarios(usuarios);
        renderizarTablaUsuarios();
        limpiarFormularioAdmin();
        mostrarAviso(esEdicion ? "Usuario actualizado." : "Usuario creado.", "ok");
    });

    // Un solo listener para toda la tabla: detecta si se hizo clic
    // en Editar o en Eliminar (delegación de eventos).
    document.querySelector("#tabla-usuarios").addEventListener("click", function (evento) {
        const botonEditar = evento.target.closest("[data-editar]");
        const botonEliminar = evento.target.closest("[data-eliminar]");

        if (botonEditar) {
            const usuario = obtenerUsuarios().find(function (item) {
                return item.run === botonEditar.getAttribute("data-editar");
            });

            if (usuario) {
                cargarUsuarioEnFormulario(usuario);
                window.scrollTo({ top: 0, behavior: "smooth" });
            }
        }

        if (botonEliminar) {
            const run = botonEliminar.getAttribute("data-eliminar");
            const sesion = obtenerSesion();

            if (sesion && sesion.run === run) {
                mostrarAviso("No puedes eliminar tu propio usuario.", "error");
                return;
            }

            const usuarios = obtenerUsuarios().filter(function (item) {
                return item.run !== run;
            });

            guardarUsuarios(usuarios);
            renderizarTablaUsuarios();
            mostrarAviso("Usuario eliminado.", "ok");
        }
    });

    const btnCancelar = document.querySelector("#btn-cancelar-usuario");

    if (btnCancelar) {
        btnCancelar.addEventListener("click", function () {
            limpiarFormularioAdmin();
        });
    }
}


// ============================================
// ARRANQUE
// ============================================
// DOMContentLoaded = "el HTML ya está listo".
// Cada iniciar...() mira si existe SU formulario.
// Si no está (ej: en index.html no hay login), no hace nada.

document.addEventListener("DOMContentLoaded", function () {
    actualizarNavAuth();
    iniciarLogin();
    iniciarRegistro();
    iniciarAdminUsuarios();
});

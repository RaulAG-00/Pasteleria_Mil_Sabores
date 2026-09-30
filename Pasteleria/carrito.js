// ============================================
// CARRITO DE COMPRAS
// ============================================
// El carrito es un ARREGLO de objetos. Cada objeto se ve así:
//   { codigo, nombre, precio, imagen, cantidad }
//
// Se guarda en localStorage con la clave "carrito".
// Si recargas la página o cambias de HTML, el carrito sigue ahí.
//
// REGLAS (lógica de negocio):
// 1. Persistencia: se mantiene entre páginas y recargas.
// 2. Unicidad: si el producto ya está, se suma 1 a la cantidad (no se duplica).
// 3. Stock: no se puede pedir más unidades que las disponibles.
// 4. Agotado: stock 0 → no se puede agregar.
// 5. Mínimo: la cantidad no baja de 1. Para sacarlo se usa Eliminar.
// 6. FELICES50: 50% si el usuario logueado tiene 50 años o más.
// 7. DUOC: 20% si el correo termina en @duoc.cl (no aplica a @profesor.duoc.cl).
// 8. Si aplican ambos descuentos, se usa el MAYOR (no se suman).
// 9. Comprar exige sesión iniciada y descuenta stock del catálogo.


const CLAVE_CARRITO = "carrito";

// Si no hay nada guardado, empezamos con un arreglo vacío.
let carrito = JSON.parse(localStorage.getItem(CLAVE_CARRITO)) || [];


function guardarCarrito() {
    localStorage.setItem(CLAVE_CARRITO, JSON.stringify(carrito));
}


// Suma las cantidades de todos los productos (para el número del navbar).
function cantidadTotalCarrito() {
    return carrito.reduce(function (total, producto) {
        return total + producto.cantidad;
    }, 0);
}


function actualizarCantidadCarrito() {
    const cantidadCarrito = document.querySelector("#cantidad-carrito");

    if (cantidadCarrito) {
        cantidadCarrito.textContent = cantidadTotalCarrito();
    }
}


// Esta función vive en productos.js. Si esa página no lo cargó,
// devolvemos Infinity para no bloquear el carrito.
function stockDisponible(codigo) {
    if (typeof obtenerProductoPorCodigo !== "function") {
        return Infinity;
    }

    const producto = obtenerProductoPorCodigo(codigo);
    return producto ? producto.stock : 0;
}


// ============================================
// AGREGAR UN PRODUCTO
// ============================================

function agregarAlCarrito(codigo) {
    const catalogo = typeof obtenerProductoPorCodigo === "function"
        ? obtenerProductoPorCodigo(codigo)
        : null;

    if (!catalogo) {
        mostrarAviso("No se encontró el producto.", "error");
        return;
    }

    if (catalogo.stock <= 0) {
        mostrarAviso("Este producto está agotado.", "error");
        return;
    }

    const existente = carrito.find(function (producto) {
        return producto.codigo === codigo;
    });

    const cantidadActual = existente ? existente.cantidad : 0;

    if (cantidadActual + 1 > catalogo.stock) {
        mostrarAviso("No hay más stock disponible de este producto.", "error");
        return;
    }

    if (existente) {
        existente.cantidad++;
    } else {
        carrito.push({
            codigo: catalogo.codigo,
            nombre: catalogo.nombre,
            precio: catalogo.precio,
            imagen: catalogo.imagen,
            cantidad: 1
        });
    }

    guardarCarrito();
    actualizarCantidadCarrito();
    mostrarAviso(catalogo.nombre + " se agregó al carrito.", "ok");
}


// Delegación de eventos: un solo click en el documento atiende
// TODOS los botones ".btn-agregar", aunque se creen después con JavaScript.
function conectarBotonesAgregar() {
    document.addEventListener("click", function (evento) {
        const boton = evento.target.closest(".btn-agregar");

        if (!boton || boton.disabled) {
            return;
        }

        const codigo = boton.getAttribute("data-codigo");

        if (codigo) {
            agregarAlCarrito(codigo);
            return;
        }

        const tarjeta = boton.closest(".producto");

        if (!tarjeta) {
            return;
        }

        const codigoTexto = tarjeta.querySelector(".codigo");

        if (codigoTexto) {
            agregarAlCarrito(codigoTexto.textContent.trim());
        }
    });
}


// ============================================
// DESCUENTOS
// ============================================
// Solo se aplican si hay sesión. Sin login, el total es el precio normal.

function obtenerDescuento() {
    const sesion = typeof obtenerSesion === "function" ? obtenerSesion() : null;

    if (!sesion) {
        return { porcentaje: 0, nombre: "" };
    }

    const edad = typeof calcularEdad === "function"
        ? calcularEdad(sesion.fechaNacimiento)
        : null;

    const esDuoc = /@duoc\.cl$/i.test(sesion.correo) &&
        !/@profesor\.duoc\.cl$/i.test(sesion.correo);

    const felices50 = edad !== null && edad >= 50;

    if (felices50) {
        return { porcentaje: 50, nombre: "FELICES50 (50 años o más)" };
    }

    if (esDuoc) {
        return { porcentaje: 20, nombre: "Descuento estudiante DUOC" };
    }

    return { porcentaje: 0, nombre: "" };
}


function calcularTotales() {
    const subtotal = carrito.reduce(function (total, producto) {
        return total + producto.precio * producto.cantidad;
    }, 0);

    const descuento = obtenerDescuento();
    const montoDescuento = Math.round(subtotal * (descuento.porcentaje / 100));
    const total = subtotal - montoDescuento;

    return {
        subtotal: subtotal,
        descuento: descuento,
        montoDescuento: montoDescuento,
        total: total
    };
}


// ============================================
// DIBUJAR EL CARRITO EN carrito.html
// ============================================
// Si esta página no tiene #productos-carrito (ej: index.html),
// la función se sale y no rompe nada.

function mostrarCarrito() {
    const contenedor = document.querySelector("#productos-carrito");

    if (!contenedor) {
        return;
    }

    contenedor.innerHTML = "";

    if (carrito.length === 0) {
        contenedor.innerHTML = "<p>Tu carrito está vacío.</p>";
        actualizarResumen();
        return;
    }

    carrito.forEach(function (producto) {
        const productoHTML = document.createElement("div");
        productoHTML.classList.add("producto-carrito");

        productoHTML.innerHTML = `
            <img
                src="${producto.imagen}"
                alt="${producto.nombre}"
                class="imagen-carrito"
            >
            <div class="info-carrito">
                <h3>${producto.nombre}</h3>
                <p>Código: ${producto.codigo}</p>
                <p>Precio: $${producto.precio.toLocaleString("es-CL")}</p>
                <div class="cantidad-producto">
                    <button
                        class="btn btn-cantidad"
                        type="button"
                        onclick="disminuirCantidad('${producto.codigo}')"
                    >−</button>
                    <span>${producto.cantidad}</span>
                    <button
                        class="btn btn-cantidad"
                        type="button"
                        onclick="aumentarCantidad('${producto.codigo}')"
                    >+</button>
                </div>
                <p class="subtotal">
                    Subtotal: $${(producto.precio * producto.cantidad).toLocaleString("es-CL")}
                </p>
                <button
                    class="btn btn-eliminar"
                    type="button"
                    onclick="eliminarProducto('${producto.codigo}')"
                >
                    Eliminar
                </button>
            </div>
        `;

        contenedor.appendChild(productoHTML);
    });

    actualizarResumen();
}


function aumentarCantidad(codigo) {
    const producto = carrito.find(function (item) {
        return item.codigo === codigo;
    });

    if (!producto) {
        return;
    }

    const stock = stockDisponible(codigo);

    if (producto.cantidad + 1 > stock) {
        mostrarAviso("Alcanzaste el stock máximo de este producto.", "error");
        return;
    }

    producto.cantidad++;
    guardarCarrito();
    mostrarCarrito();
    actualizarCantidadCarrito();
}


function disminuirCantidad(codigo) {
    const producto = carrito.find(function (item) {
        return item.codigo === codigo;
    });

    if (producto && producto.cantidad > 1) {
        producto.cantidad--;
        guardarCarrito();
        mostrarCarrito();
        actualizarCantidadCarrito();
    }
}


function eliminarProducto(codigo) {
    carrito = carrito.filter(function (producto) {
        return producto.codigo !== codigo;
    });

    guardarCarrito();
    mostrarCarrito();
    actualizarCantidadCarrito();
}


function actualizarResumen() {
    const totalCarrito = document.querySelector("#total-carrito");
    const subtotalCarrito = document.querySelector("#subtotal-carrito");
    const descuentoCarrito = document.querySelector("#descuento-carrito");
    const nombreDescuento = document.querySelector("#nombre-descuento");

    if (!totalCarrito) {
        return;
    }

    const totales = calcularTotales();

    if (subtotalCarrito) {
        subtotalCarrito.textContent = "$" + totales.subtotal.toLocaleString("es-CL");
    }

    if (descuentoCarrito) {
        descuentoCarrito.textContent = totales.montoDescuento
            ? "-$" + totales.montoDescuento.toLocaleString("es-CL")
            : "$0";
    }

    if (nombreDescuento) {
        nombreDescuento.textContent = totales.descuento.nombre
            ? totales.descuento.nombre
            : "Sin descuento";
    }

    totalCarrito.textContent = "$" + totales.total.toLocaleString("es-CL");
}


function actualizarTotal() {
    actualizarResumen();
}


// ============================================
// COMPRAR
// ============================================
// Pasos: carrito con cosas → usuario logueado → stock suficiente
// → descontar stock → vaciar carrito → aviso de éxito.

function iniciarCompra() {
    const botonComprar = document.querySelector("#btn-comprar");

    if (!botonComprar) {
        return;
    }

    botonComprar.addEventListener("click", function () {
        if (carrito.length === 0) {
            mostrarAviso("Tu carrito está vacío.", "error");
            return;
        }

        const sesion = typeof obtenerSesion === "function" ? obtenerSesion() : null;

        if (!sesion) {
            mostrarAviso("Inicia sesión para completar la compra.", "error");
            window.location.href = "login.html";
            return;
        }

        for (let i = 0; i < carrito.length; i++) {
            const item = carrito[i];
            const stock = stockDisponible(item.codigo);

            if (item.cantidad > stock) {
                mostrarAviso("No hay stock suficiente de " + item.nombre + ".", "error");
                return;
            }
        }

        carrito.forEach(function (item) {
            if (typeof actualizarStockProducto === "function") {
                actualizarStockProducto(item.codigo, item.cantidad);
            }
        });

        const totales = calcularTotales();

        carrito = [];
        guardarCarrito();
        mostrarCarrito();
        actualizarCantidadCarrito();

        mostrarAviso(
            "Compra realizada por $" + totales.total.toLocaleString("es-CL") + ".",
            "ok"
        );
    });
}


// ============================================
// ARRANQUE (se ejecuta en todas las páginas que cargan este archivo)
// ============================================

conectarBotonesAgregar();
actualizarCantidadCarrito();
mostrarCarrito();
iniciarCompra();

// ============================================
// CATÁLOGO DE PRODUCTOS (arreglo JavaScript)
// ============================================
// El enunciado pide: crear un arreglo y mostrar esos productos en pantalla.
// Ya no están "duros" en productos.html: JavaScript los dibuja.
//
// Cada producto tiene:
//   codigo, nombre, categoria, precio, stock, imagen, descripcion
//
// El stock también se guarda en localStorage para que, al comprar,
// las unidades bajen y se recuerden al recargar.

const PRODUCTOS_INICIALES = [
    {
        codigo: "TC001",
        nombre: "Torta Cuadrada de Chocolate",
        categoria: "Tortas Cuadradas",
        precio: 45000,
        stock: 12,
        imagen: "./images/torta_cuadrada_chocolate.jpg",
        descripcion: "Bizcocho de chocolate húmedo, relleno de ganache y cubierto con frosting de cacao. Ideal para celebraciones familiares."
    },
    {
        codigo: "TC002",
        nombre: "Torta Cuadrada de Frutas",
        categoria: "Tortas Cuadradas",
        precio: 50000,
        stock: 10,
        imagen: "./images/torta_cuadrada_frutas.jpg",
        descripcion: "Torta de vainilla con crema pastelera y frutas de estación. Fresca, colorida y perfecta para meriendas."
    },
    {
        codigo: "TT001",
        nombre: "Torta Circular de Vainilla",
        categoria: "Tortas Circulares",
        precio: 40000,
        stock: 14,
        imagen: "./images/torta_circular_vainilla.jpg",
        descripcion: "Clásica torta circular de vainilla con manjar y merengue. Receta tradicional de la casa."
    },
    {
        codigo: "TT002",
        nombre: "Torta Circular de Manjar",
        categoria: "Tortas Circulares",
        precio: 42000,
        stock: 11,
        imagen: "./images/Torta_Circular_manjar.jpg",
        descripcion: "Elaborada con manjar casero y nueces de la zona central, siguiendo la receta artesanal chilena."
    },
    {
        codigo: "PI001",
        nombre: "Mousse de Chocolate",
        categoria: "Postres Individuales",
        precio: 5000,
        stock: 30,
        imagen: "./images/mousse_chocolate.jpg",
        descripcion: "Postre individual aireado de chocolate belga. Porción lista para servir."
    },
    {
        codigo: "PI002",
        nombre: "Tiramisú Clásico",
        categoria: "Postres Individuales",
        precio: 5500,
        stock: 24,
        imagen: "./images/Tiramisú_Clásico.jpg",
        descripcion: "Tiramisú en vaso con café, cacao y crema de mascarpone. Receta italiana adaptada en la pastelería."
    },
    {
        codigo: "PSA001",
        nombre: "Torta Sin Azúcar de Naranja",
        categoria: "Productos Sin Azúcar",
        precio: 48000,
        stock: 8,
        imagen: "./images/Torta_SinAzúcar_Naranja.jpg",
        descripcion: "Torta de naranja endulzada con sucralosa. Pensada para quienes cuidan el consumo de azúcar."
    },
    {
        codigo: "PSA002",
        nombre: "Cheesecake Sin Azúcar",
        categoria: "Productos Sin Azúcar",
        precio: 47000,
        stock: 9,
        imagen: "./images/Cheesecake_SinAzúcar.jpg",
        descripcion: "Cheesecake cremoso sin azúcar añadida, con base de galleta y cobertura de berries."
    },
    {
        codigo: "PT001",
        nombre: "Empanada de Manzana",
        categoria: "Pastelería Tradicional",
        precio: 3000,
        stock: 40,
        imagen: "./images/Empanada_manzana.jpg",
        descripcion: "Empanada hojaldrada rellena de manzana especiada con canela. Receta criolla chilena."
    },
    {
        codigo: "PT002",
        nombre: "Tarta de Santiago",
        categoria: "Pastelería Tradicional",
        precio: 6000,
        stock: 18,
        imagen: "./images/Tarta_Santiago.jpg",
        descripcion: "Tarta de almendras inspirada en la repostería española, coronada con la Cruz de Santiago."
    },
    {
        codigo: "PG001",
        nombre: "Brownie Sin Gluten",
        categoria: "Productos Sin Gluten",
        precio: 4000,
        stock: 22,
        imagen: "./images/Brownie_Gluten_free.jpg",
        descripcion: "Brownie húmedo elaborado con harina de almendras. Sin gluten y con intenso sabor a cacao."
    },
    {
        codigo: "PG002",
        nombre: "Pan Sin Gluten",
        categoria: "Productos Sin Gluten",
        precio: 3500,
        stock: 16,
        imagen: "./images/Pan_Gluten_free.jpg",
        descripcion: "Pan de molde sin gluten, suave y listo para acompañar meriendas o desayunos."
    },
    {
        codigo: "PV001",
        nombre: "Torta Vegana de Chocolate",
        categoria: "Productos Veganos",
        precio: 50000,
        stock: 7,
        imagen: "./images/Torta_Chocolate_Vegana.jpg",
        descripcion: "Torta de chocolate sin ingredientes de origen animal. Esponjosa y con cobertura de cacao."
    },
    {
        codigo: "PV002",
        nombre: "Galletas Veganas de Avena",
        categoria: "Productos Veganos",
        precio: 4500,
        stock: 28,
        imagen: "./images/Galletas_Avena_vegana.jpg",
        descripcion: "Galletas crocantes de avena, pasas y chía. Envase de 6 unidades."
    },
    {
        codigo: "TE001",
        nombre: "Torta Especial de Cumpleaños",
        categoria: "Tortas Especiales",
        precio: 55000,
        stock: 6,
        imagen: "./images/Torta_Especial_Cumpleaños.jpg",
        descripcion: "Torta decorada para cumpleaños, con relleno a elección y diseño personalizado al encargar."
    },
    {
        codigo: "TE002",
        nombre: "Torta Especial de Boda",
        categoria: "Tortas Especiales",
        precio: 60000,
        stock: 4,
        imagen: "./images/Torta_Especial_Boda.jpg",
        descripcion: "Torta de dos pisos para matrimonios, con flores de azúcar y relleno de frutas o manjar."
    }
];


// ============================================
// GUARDAR / LEER PRODUCTOS
// ============================================
// Primera visita: se copia el arreglo inicial a localStorage.
// Visitas siguientes: se lee lo guardado (incluye el stock actualizado).

function obtenerProductos() {
    const guardados = localStorage.getItem("productos");

    if (guardados) {
        return JSON.parse(guardados);
    }

    localStorage.setItem("productos", JSON.stringify(PRODUCTOS_INICIALES));
    return PRODUCTOS_INICIALES.slice();
}


function guardarProductos(productos) {
    localStorage.setItem("productos", JSON.stringify(productos));
}


// Busca un producto por su código (TC001, PI002, etc.).
function obtenerProductoPorCodigo(codigo) {
    return obtenerProductos().find(function (producto) {
        return producto.codigo === codigo;
    });
}


// Lo llama el carrito al presionar "Comprar".
function actualizarStockProducto(codigo, cantidadVendida) {
    const productos = obtenerProductos();
    const producto = productos.find(function (item) {
        return item.codigo === codigo;
    });

    if (!producto) {
        return;
    }

    producto.stock = Math.max(0, producto.stock - cantidadVendida);
    guardarProductos(productos);
}


// 45000 → "$45.000 CLP"
function formatearPrecio(valor) {
    return "$" + Number(valor).toLocaleString("es-CL") + " CLP";
}


// Agrupa el arreglo plano en: { "Tortas Cuadradas": [...], "Veganos": [...] }
function agruparPorCategoria(productos) {
    const grupos = {};

    productos.forEach(function (producto) {
        if (!grupos[producto.categoria]) {
            grupos[producto.categoria] = [];
        }

        grupos[producto.categoria].push(producto);
    });

    return grupos;
}


// Plantilla HTML de UNA tarjeta. El enlace lleva al detalle:
// producto-detalle.html?codigo=TC001
function tarjetaProductoHTML(producto) {
    const agotado = producto.stock <= 0;

    return `
        <div class="producto ${agotado ? "agotado" : ""}">
            <a href="producto-detalle.html?codigo=${encodeURIComponent(producto.codigo)}">
                <img src="${producto.imagen}" alt="${producto.nombre}">
                <h3>${producto.nombre}</h3>
            </a>
            <span class="codigo">${producto.codigo}</span>
            <span class="precio">${formatearPrecio(producto.precio)}</span>
            <span class="stock">${agotado ? "Agotado" : "Stock: " + producto.stock}</span>
            <button
                class="btn btn-agregar"
                data-codigo="${producto.codigo}"
                ${agotado ? "disabled" : ""}
            >
                ${agotado ? "Sin stock" : "Agregar al carrito"}
            </button>
        </div>
    `;
}


// Dibuja todo el catálogo dentro de #catalogo-productos (productos.html).
function mostrarCatalogo() {
    const contenedor = document.querySelector("#catalogo-productos");

    if (!contenedor) {
        return;
    }

    const productos = obtenerProductos();
    const grupos = agruparPorCategoria(productos);
    let html = "";

    Object.keys(grupos).forEach(function (categoria) {
        html += `
            <section class="categoria-productos">
                <h2>${categoria}</h2>
                <div class="productos-container">
                    ${grupos[categoria].map(tarjetaProductoHTML).join("")}
                </div>
            </section>
        `;
    });

    contenedor.innerHTML = html;
}


// Lee ?codigo=TC001 de la URL y pinta el detalle.
// Si esta página no tiene #detalle-producto, no hace nada.
function mostrarDetalleProducto() {
    const contenedor = document.querySelector("#detalle-producto");

    if (!contenedor) {
        return;
    }

    const params = new URLSearchParams(window.location.search);
    const codigo = params.get("codigo");
    const producto = obtenerProductoPorCodigo(codigo);

    if (!producto) {
        contenedor.innerHTML = `
            <p>No encontramos este producto.</p>
            <a class="btn" href="productos.html">Volver al catálogo</a>
        `;
        return;
    }

    const agotado = producto.stock <= 0;

    contenedor.innerHTML = `
        <img src="${producto.imagen}" alt="${producto.nombre}">
        <div class="detalle-info">
            <p class="detalle-categoria">${producto.categoria}</p>
            <h1>${producto.nombre}</h1>
            <span class="codigo">${producto.codigo}</span>
            <p class="detalle-descripcion">${producto.descripcion}</p>
            <p class="precio">${formatearPrecio(producto.precio)}</p>
            <p class="stock">${agotado ? "Producto agotado" : "Unidades disponibles: " + producto.stock}</p>
            <button
                class="btn btn-agregar"
                data-codigo="${producto.codigo}"
                ${agotado ? "disabled" : ""}
            >
                ${agotado ? "Sin stock" : "Agregar al carrito"}
            </button>
            <a class="btn btn-secundario" href="productos.html">Seguir comprando</a>
        </div>
    `;
}


// Se llama a las dos: cada una se auto-omite si su contenedor no existe.
document.addEventListener("DOMContentLoaded", function () {
    mostrarCatalogo();
    mostrarDetalleProducto();
});

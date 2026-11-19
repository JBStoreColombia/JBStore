"use strict";

const WA_NUMERO = "573146376355";
const NOMBRE_TIENDA = "JB STORE";
const CLAVE_CARRITO = "jbstore_carrito_v1";

const norm = (t) => String(t).toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");

const PLACEHOLDER_SVG = "data:image/svg+xml," + encodeURIComponent(
  '<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100" viewBox="0 0 24 24" fill="none" stroke="#8f6d1e" stroke-width="1.5"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><path d="M21 15l-5-5-5 5-4-4-3 3"/></svg>'
);

// Utilidades
const escaparHTML = (t) => String(t).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
const precioNum = (t) => parseInt(String(t).replace(/\D/g, ""), 10) || 0;
const fmtCOP = (n) => "$" + n.toLocaleString("es-CO");
const tieneVariantes = (p) => Array.isArray(p.variantes) && p.variantes.length > 0;
const urlWhatsApp = (mensaje) => `https://wa.me/${WA_NUMERO}?text=${encodeURIComponent(mensaje)}`;

function fotosDe(prod) {
  const lista = Array.isArray(prod.imagenes) ? prod.imagenes.filter(Boolean) : [];
  if (!lista.length && prod.img) lista.push(prod.img);
  return lista.length ? lista : [PLACEHOLDER_SVG];
}

function listaPorCategoria(categoria) {
  if (categoria === "todos") {
    const todos = [];
    Object.keys(productos).forEach((cat) => {
      (productos[cat] || []).forEach((prod, idxOriginal) => todos.push({ categoria: cat, idxOriginal, prod }));
    });
    return todos;
  }
  return (productos[categoria] || []).map((prod, idxOriginal) => ({ categoria, idxOriginal, prod }));
}

// Estado global
let categoriaActual = "todos";
let marcaActual = "todos";
let carrito = [];
let productoModalActual = null;
let varianteSeleccionada = 0;
let ultimoFoco = null;
let galeria = { fotos: [], i: 0, nombre: "" };

// Tarjetas
function crearTarjetaHTML(categoria, idxOriginal, prod) {
  const conVariantes = tieneVariantes(prod);
  const nombre = escaparHTML(prod.nombre);
  const fotos = fotosDe(prod);

  let precioHTML;
  if (conVariantes) {
    const precios = prod.variantes.map((v) => precioNum(v.precio));
    const min = Math.min(...precios), max = Math.max(...precios);
    precioHTML = `<span class="precio-actual">${min === max ? fmtCOP(min) : "Desde " + fmtCOP(min)}</span>`;
  } else {
    precioHTML = `${prod.precioAnterior ? `<s class="precio-tachado">${escaparHTML(prod.precioAnterior)}</s>` : ""}<span class="precio-actual">${escaparHTML(prod.precioPromocion || "")}</span>`;
  }

  const avisoFotos = fotos.length > 1 ? `, ${fotos.length} fotos` : "";
  const textoBoton = conVariantes ? "Elegir" : "Agregar";
  const labelBoton = conVariantes ? `Elegir opción de ${nombre}` : `Agregar ${nombre} al carrito`;

  return `
    <article class="producto" data-index="${idxOriginal}" data-categoria="${categoria}">
      ${prod.destacado ? `<span class="badge-destacado">★ Destacado</span>` : ""}
      <button type="button" class="producto-img" onclick="abrirDetalle('${categoria}', ${idxOriginal})" aria-label="Ver detalle de ${nombre}${avisoFotos}">
        <img src="${escaparHTML(fotos[0])}" alt="${nombre}" loading="lazy" width="400" height="400" onerror="this.onerror=null;this.src=PLACEHOLDER_SVG">
        ${fotos.length > 1 ? `<span class="contador-fotos" aria-hidden="true">1/${fotos.length}</span>` : ""}
      </button>
      <div class="producto-info">
        ${prod.marca ? `<span class="producto-marca">${escaparHTML(prod.marca)}</span>` : ""}
        <h3 class="producto-nombre">${nombre}</h3>
        <div class="producto-precio">${precioHTML}</div>
      </div>
      <div class="producto-acciones">
        <button type="button" class="boton-ver" onclick="abrirDetalle('${categoria}', ${idxOriginal})" aria-label="Ver detalle de ${nombre}">Detalle</button>
        <button type="button" class="boton-agregar" onclick="agregarAlCarrito('${categoria}', ${idxOriginal})" aria-label="${labelBoton}">${textoBoton}</button>
      </div>
    </article>`;
}

// Filtro por calidad / marca
function generarFiltrosMarca(categoria) {
  const cont = document.getElementById("filtros-marca");
  if (!cont) return;
  const items = listaPorCategoria(categoria);
  const marcas = [...new Set(items.map((it) => it.prod.marca).filter(Boolean))];
  if (marcas.length < 2) {
    cont.innerHTML = "";
    marcaActual = "todos";
    return;
  }
  const boton = (valor, texto, activo) =>
    `<button type="button" class="filtro-opcion${activo ? " activo" : ""}" data-marca="${escaparHTML(valor)}" onclick="aplicarFiltroMarca(this.dataset.marca, this)" aria-pressed="${activo}">${escaparHTML(texto)}</button>`;
  cont.innerHTML = boton("todos", "Todas", true) + marcas.map((m) => boton(m, m, false)).join("");
  marcaActual = "todos";
}

function aplicarFiltroMarca(marca, boton) {
  marcaActual = marca;
  document.querySelectorAll("#filtros-marca .filtro-opcion").forEach((btn) => { btn.classList.remove("activo"); btn.setAttribute("aria-pressed", "false"); });
  boton.classList.add("activo");
  boton.setAttribute("aria-pressed", "true");
  renderizarCatalogo(categoriaActual, marca);
}

// Renderizado
function renderizarCatalogo(categoria, marca) {
  const contenedor = document.getElementById("contenedor-catalogo");
  let items = listaPorCategoria(categoria);
  if (marca && marca !== "todos") items = items.filter((it) => it.prod.marca === marca);

  if (!items.length) {
    contenedor.innerHTML = `<div class="sin-resultados"><p class="sin-resultados-subtexto">No hay productos que coincidan con este filtro.</p></div>`;
    return;
  }
  contenedor.innerHTML = items.map(({ categoria: cat, idxOriginal, prod }) => crearTarjetaHTML(cat, idxOriginal, prod)).join("");
}

function renderizarDestacados() {
  const cont = document.getElementById("contenedor-destacados");
  if (!cont) return;
  const todos = listaPorCategoria("todos");
  let items = todos.filter((it) => it.prod.destacado);
  if (!items.length) items = todos.slice(0, 4);
  cont.innerHTML = items.map(({ categoria, idxOriginal, prod }) => crearTarjetaHTML(categoria, idxOriginal, prod)).join("");
}

// Buscador
let temporizadorBusqueda = null;

function buscarProducto(textoCrudo) {
  clearTimeout(temporizadorBusqueda);
  temporizadorBusqueda = setTimeout(() => ejecutarBusqueda(textoCrudo), 150);
}

function ejecutarBusqueda(textoCrudo) {
  const texto = textoCrudo.trim();
  const btnLimpiar = document.getElementById("boton-limpiar-busqueda");
  if (btnLimpiar) btnLimpiar.hidden = !texto;

  const contMarcas = document.getElementById("filtros-marca");
  if (!texto) {
    if (contMarcas) contMarcas.hidden = false;
    renderizarCatalogo(categoriaActual, marcaActual);
    return;
  }
  if (contMarcas) contMarcas.hidden = true;

  const q = norm(texto);
  const resultados = listaPorCategoria("todos").filter(({ prod }) =>
    norm(prod.nombre).includes(q) ||
    (prod.desc && norm(prod.desc).includes(q)) ||
    (prod.marca && norm(prod.marca).includes(q)) ||
    (tieneVariantes(prod) && prod.variantes.some((v) => norm(v.etiqueta).includes(q)))
  );

  const contenedor = document.getElementById("contenedor-catalogo");
  if (!resultados.length) {
    const mensaje = `Hola ${NOMBRE_TIENDA}, estoy buscando el producto "${texto}". ¿Lo manejan?`;
    contenedor.innerHTML = `
      <div class="sin-resultados">
        <p class="sin-resultados-texto">No encontramos "<strong>${escaparHTML(texto)}</strong>" en nuestro catálogo.</p>
        <p class="sin-resultados-subtexto">Puede que lo tengamos disponible aunque no aparezca aquí. Pregúntanos directamente y te confirmamos.</p>
        <a href="${urlWhatsApp(mensaje)}" target="_blank" rel="noopener noreferrer" class="boton-primario">Preguntar por WhatsApp</a>
      </div>`;
    return;
  }
  contenedor.innerHTML = resultados.map(({ categoria, idxOriginal, prod }) => crearTarjetaHTML(categoria, idxOriginal, prod)).join("");
}

function limpiarBusqueda() {
  const input = document.getElementById("buscador-producto");
  input.value = "";
  input.focus();
  ejecutarBusqueda("");
}

// Categorias
function mostrarCatalogo(categoria, boton) {
  categoriaActual = categoria;
  document.querySelectorAll(".boton-categoria").forEach((btn) => { btn.classList.remove("activa"); btn.setAttribute("aria-pressed", "false"); });
  boton.classList.add("activa");
  boton.setAttribute("aria-pressed", "true");

  const buscador = document.getElementById("buscador-producto");
  if (buscador && buscador.value) {
    buscador.value = "";
    const btnLimpiar = document.getElementById("boton-limpiar-busqueda");
    if (btnLimpiar) btnLimpiar.hidden = true;
  }

  generarFiltrosMarca(categoria);
  renderizarCatalogo(categoria, "todos");
}

// Modal detalle y galeria
function abrirDetalle(categoria, index) {
  const prod = productos[categoria] && productos[categoria][index];
  if (!prod) return;
  ultimoFoco = document.activeElement;
  productoModalActual = { categoria, index };
  varianteSeleccionada = 0;

  document.getElementById("modal-marca").textContent = prod.marca || "";
  document.getElementById("modal-nombre").textContent = prod.nombre;
  document.getElementById("modal-descripcion").textContent = prod.desc || "";

  const conVariantes = tieneVariantes(prod);
  document.getElementById("modal-precios").hidden = conVariantes;
  document.getElementById("modal-variantes-wrapper").hidden = !conVariantes;

  if (conVariantes) {
    document.getElementById("modal-tipo-variante").textContent = prod.tipoVariante ? `Elige ${prod.tipoVariante}:` : "Elige una opción:";
    document.getElementById("modal-selector-variante").innerHTML = prod.variantes
      .map((v, i) => `<button type="button" data-i="${i}" class="${i === 0 ? "activo" : ""}" aria-pressed="${i === 0}" onclick="seleccionarVariante(${i}, this)">${escaparHTML(v.etiqueta)}</button>`)
      .join("");
    document.getElementById("modal-precio-variante").textContent = prod.variantes[0].precio;
  } else {
    document.getElementById("modal-precio-anterior").textContent = prod.precioAnterior || "";
    document.getElementById("modal-precio-promocion").textContent = prod.precioPromocion || "";
  }

  renderizarGaleria(prod);
  actualizarBotonWhatsApp(prod);

  const overlay = document.getElementById("modal-overlay");
  overlay.classList.add("activo");
  overlay.querySelector(".modal-contenido").scrollTop = 0;
  document.body.classList.add("sin-scroll");
  overlay.querySelector(".modal-cerrar").focus();
}

function renderizarGaleria(prod) {
  galeria = { fotos: fotosDe(prod), i: 0, nombre: prod.nombre };
  const n = galeria.fotos.length;
  const varias = n > 1;

  document.getElementById("galeria-prev").hidden = !varias;
  document.getElementById("galeria-next").hidden = !varias;
  document.getElementById("galeria-contador").hidden = !varias;

  const mini = document.getElementById("galeria-miniaturas");
  mini.hidden = !varias;
  mini.innerHTML = varias
    ? galeria.fotos.map((src, i) =>
        `<button type="button" class="miniatura" onclick="irAImagen(${i})" aria-label="Ver foto ${i + 1} de ${n}"><img src="${escaparHTML(src)}" alt="" width="64" height="64" onerror="this.onerror=null;this.src=PLACEHOLDER_SVG"></button>`).join("")
    : "";
  irAImagen(0);
}

function irAImagen(i) {
  const n = galeria.fotos.length;
  if (!n) return;
  galeria.i = ((i % n) + n) % n;

  const img = document.getElementById("modal-imagen");
  const spinner = document.getElementById("modal-spinner");
  spinner.hidden = false;
  img.onload = () => { spinner.hidden = true; };
  img.onerror = () => { spinner.hidden = true; img.onerror = null; img.src = PLACEHOLDER_SVG; };
  img.alt = n > 1 ? `${galeria.nombre} — foto ${galeria.i + 1} de ${n}` : galeria.nombre;
  img.src = galeria.fotos[galeria.i];
  if (img.complete && img.naturalWidth) spinner.hidden = true;

  if (n > 1) {
    document.getElementById("galeria-contador").textContent = `${galeria.i + 1}/${n}`;
    const mini = document.getElementById("galeria-miniaturas");
    mini.querySelectorAll(".miniatura").forEach((b, k) => b.classList.toggle("activo", k === galeria.i));
    new Image().src = galeria.fotos[(galeria.i + 1) % n];
  }
}
function cambiarImagen(delta) { irAImagen(galeria.i + delta); }

function actualizarBotonWhatsApp(prod) {
  let mensaje = `Hola ${NOMBRE_TIENDA}, estoy interesado en ${prod.nombre}`;
  if (tieneVariantes(prod)) {
    const v = prod.variantes[varianteSeleccionada];
    mensaje += ` (${v.etiqueta}: ${v.precio})`;
  } else {
    mensaje += ` (${prod.precioPromocion || ""})`;
  }
  document.getElementById("modal-whatsapp").href = urlWhatsApp(mensaje);
}

function seleccionarVariante(i, boton) {
  varianteSeleccionada = i;
  document.querySelectorAll("#modal-selector-variante button").forEach((btn) => { btn.classList.remove("activo"); btn.setAttribute("aria-pressed", "false"); });
  boton.classList.add("activo");
  boton.setAttribute("aria-pressed", "true");
  if (productoModalActual) {
    const prod = productos[productoModalActual.categoria][productoModalActual.index];
    document.getElementById("modal-precio-variante").textContent = prod.variantes[i].precio;
    actualizarBotonWhatsApp(prod);
  }
}

function restaurarFoco() {
  if (ultimoFoco && typeof ultimoFoco.focus === "function") ultimoFoco.focus();
  ultimoFoco = null;
}

function cerrarDetalle() {
  const overlay = document.getElementById("modal-overlay");
  if (!overlay.classList.contains("activo")) return;
  overlay.classList.remove("activo");
  document.body.classList.remove("sin-scroll");
  productoModalActual = null;
  restaurarFoco();
}
function cerrarDetalleSiEsFondo(event) { if (event.target.id === "modal-overlay") cerrarDetalle(); }

// Carrito
const totalCarrito = () => carrito.reduce((s, i) => s + precioNum(i.precio) * i.cantidad, 0);
function guardarCarrito() { try { localStorage.setItem(CLAVE_CARRITO, JSON.stringify(carrito)); } catch (e) {} }

function cargarCarrito() {
  let data;
  try { data = JSON.parse(localStorage.getItem(CLAVE_CARRITO)); } catch (e) { return []; }
  if (!Array.isArray(data)) return [];
  const limpio = [];
  data.forEach((it) => {
    const lista = it && productos[it.categoria];
    if (!lista) return;
    const idx = lista.findIndex((p) => p.nombre === it.nombre);
    if (idx < 0) return;
    const prod = lista[idx];
    let precio = prod.precioPromocion, variante = null;
    if (tieneVariantes(prod)) {
      const v = prod.variantes.find((x) => x.etiqueta === it.variante);
      if (!v) return;
      precio = v.precio; variante = v.etiqueta;
    }
    limpio.push({ nombre: prod.nombre, categoria: it.categoria, index: idx, variante, precio, cantidad: Math.min(99, Math.max(1, parseInt(it.cantidad, 10) || 1)) });
  });
  return limpio;
}
carrito = cargarCarrito();

function meterAlCarrito(categoria, index, varianteIdx) {
  const prod = productos[categoria][index];
  const v = tieneVariantes(prod) ? prod.variantes[varianteIdx] : null;
  const etiqueta = v ? v.etiqueta : null;
  const precio = v ? v.precio : prod.precioPromocion;
  const ya = carrito.find((i) => i.categoria === categoria && i.index === index && i.variante === etiqueta);
  if (ya) ya.cantidad = Math.min(99, ya.cantidad + 1);
  else carrito.push({ nombre: prod.nombre, categoria, index, variante: etiqueta, precio, cantidad: 1 });
  guardarCarrito();
  actualizarContadorCarrito();
  mostrarToast(`"${prod.nombre}${etiqueta ? ` (${etiqueta})` : ""}" agregado al carrito.`);
}

function agregarAlCarrito(categoria, index) {
  const prod = productos[categoria][index];
  if (tieneVariantes(prod)) {
    abrirDetalle(categoria, index);
    mostrarToast(prod.tipoVariante ? `Elige ${prod.tipoVariante} para agregarlo.` : "Elige una opción para agregarlo.");
    return;
  }
  meterAlCarrito(categoria, index, 0);
}
function agregarAlCarritoDesdeModal() {
  if (productoModalActual) meterAlCarrito(productoModalActual.categoria, productoModalActual.index, varianteSeleccionada);
}

function actualizarContadorCarrito() {
  const n = carrito.reduce((s, i) => s + i.cantidad, 0);
  const c = document.getElementById("carrito-contador");
  if (c) {
    c.textContent = n;
    c.hidden = n === 0;
  }
}

function abrirCarrito() {
  ultimoFoco = document.activeElement;
  const overlay = document.getElementById("modal-carrito-overlay");
  overlay.classList.add("activo");
  document.body.classList.add("sin-scroll");
  renderizarCarrito();
  overlay.querySelector(".modal-cerrar").focus();
}
function cerrarCarrito() {
  const overlay = document.getElementById("modal-carrito-overlay");
  if (!overlay.classList.contains("activo")) return;
  overlay.classList.remove("activo");
  document.body.classList.remove("sin-scroll");
  restaurarFoco();
}
function cerrarCarritoSiEsFondo(event) { if (event.target.id === "modal-carrito-overlay") cerrarCarrito(); }

function renderizarCarrito() {
  const lista = document.getElementById("lista-carrito");
  document.getElementById("carrito-total").textContent = "Total: " + fmtCOP(totalCarrito());
  if (!carrito.length) { lista.innerHTML = `<div class="carrito-vacio">Tu carrito está vacío</div>`; return; }
  lista.innerHTML = carrito.map((it, i) => `
    <div class="item-carrito">
      <div class="item-carrito-info">
        <span class="item-carrito-nombre">${escaparHTML(it.nombre)}</span>
        <span class="item-carrito-precio">${fmtCOP(precioNum(it.precio) * it.cantidad)}</span>
        ${it.variante ? `<span class="item-carrito-talla">${escaparHTML(it.variante)}</span>` : ""}
      </div>
      <div class="cantidad">
        <button type="button" onclick="cambiarCantidad(${i}, -1)" aria-label="Quitar una unidad de ${escaparHTML(it.nombre)}">−</button>
        <span aria-live="polite">${it.cantidad}</span>
        <button type="button" onclick="cambiarCantidad(${i}, 1)" aria-label="Agregar una unidad de ${escaparHTML(it.nombre)}">+</button>
      </div>
      <button type="button" class="boton-eliminar-item" onclick="eliminarDelCarrito(${i})" aria-label="Eliminar ${escaparHTML(it.nombre)}">Eliminar</button>
    </div>`).join("");
}
function cambiarCantidad(i, d) {
  carrito[i].cantidad = Math.min(99, carrito[i].cantidad + d);
  if (carrito[i].cantidad < 1) carrito.splice(i, 1);
  guardarCarrito(); actualizarContadorCarrito(); renderizarCarrito();
}
function eliminarDelCarrito(i) { carrito.splice(i, 1); guardarCarrito(); actualizarContadorCarrito(); renderizarCarrito(); }
function vaciarCarrito() {
  if (!carrito.length) return;
  if (confirm("¿Estás seguro de que quieres vaciar todo el carrito?")) { carrito = []; guardarCarrito(); actualizarContadorCarrito(); renderizarCarrito(); }
}

function lineasPedido() {
  return carrito.map((it, i) => `${i + 1}. ${it.nombre}${it.variante ? ` (${it.variante})` : ""} x${it.cantidad} — ${fmtCOP(precioNum(it.precio) * it.cantidad)}`).join("\n");
}
function abrirWhatsAppPedido(intro, cierre) {
  if (!carrito.length) { mostrarToast("Tu carrito está vacío. Agrega productos primero."); return; }
  const mensaje = `${intro}\n\n${lineasPedido()}\n\nTotal: ${fmtCOP(totalCarrito())}${cierre}`;
  window.open(urlWhatsApp(mensaje), "_blank", "noopener,noreferrer");
  cerrarCarrito();
}
function enviarCarritoPorWhatsApp() {
  abrirWhatsAppPedido(`Hola ${NOMBRE_TIENDA}, me gustaría pedir los siguientes productos:`, "\n\nEl envío sería por Interrapidísimo. ¿Me confirman disponibilidad y el costo del envío?");
}
function pagarConNequi() {
  abrirWhatsAppPedido(`Hola ${NOMBRE_TIENDA}, quiero hacer este pedido:`, "\n\nQuiero pagar por Nequi. ¿Me envían los datos de pago y el costo del envío?");
}

// Menu movil y toast
function toggleMenu() {
  const nav = document.getElementById("nav-principal");
  const btn = document.getElementById("menu-hamburguesa");
  const abierto = nav.classList.toggle("abierto");
  btn.setAttribute("aria-expanded", abierto);
  btn.setAttribute("aria-label", abierto ? "Cerrar menú" : "Abrir menú");
  document.body.classList.toggle("sin-scroll", abierto);
}
function cerrarMenu() {
  const nav = document.getElementById("nav-principal");
  const btn = document.getElementById("menu-hamburguesa");
  if (!nav.classList.contains("abierto")) return;
  nav.classList.remove("abierto");
  btn.setAttribute("aria-expanded", "false");
  btn.setAttribute("aria-label", "Abrir menú");
  document.body.classList.remove("sin-scroll");
}

function mostrarToast(mensaje) {
  const toast = document.getElementById("toast-mg");
  if (!toast) return;
  toast.textContent = mensaje;
  toast.classList.add("visible");
  clearTimeout(toast._timer);
  toast._timer = setTimeout(() => toast.classList.remove("visible"), 2800);
}

// Teclado e inicio
document.addEventListener("keydown", (e) => {
  if (e.key === "Escape") { cerrarDetalle(); cerrarCarrito(); cerrarMenu(); return; }
  const detalleAbierto = document.getElementById("modal-overlay").classList.contains("activo");
  if (detalleAbierto && galeria.fotos.length > 1 && (e.key === "ArrowLeft" || e.key === "ArrowRight")) {
    e.preventDefault();
    cambiarImagen(e.key === "ArrowRight" ? 1 : -1);
  }
});

document.addEventListener("DOMContentLoaded", () => {
  generarFiltrosMarca(categoriaActual);
  renderizarCatalogo(categoriaActual, "todos");
  renderizarDestacados();
  actualizarContadorCarrito();

  const zona = document.getElementById("galeria-principal");
  let x0 = null;
  zona.addEventListener("touchstart", (e) => { x0 = e.changedTouches[0].clientX; }, { passive: true });
  zona.addEventListener("touchend", (e) => {
    if (x0 === null) return;
    const dx = e.changedTouches[0].clientX - x0;
    x0 = null;
    if (Math.abs(dx) > 40 && galeria.fotos.length > 1) cambiarImagen(dx < 0 ? 1 : -1);
  }, { passive: true });

  window.matchMedia("(min-width: 901px)").addEventListener("change", (m) => { if (m.matches) cerrarMenu(); });
});
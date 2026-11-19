// Catalogo de productos JB STORE

const MODELOS_IPHONE = [
  "iPhone 12",
  "iPhone 12 Pro",
  "iPhone 12 Pro Max",
  "iPhone 13",
  "iPhone 13 Pro",
  "iPhone 13 Pro Max",
  "iPhone 14",
  "iPhone 14 Plus",
  "iPhone 14 Pro",
  "iPhone 14 Pro Max",
  "iPhone 15",
  "iPhone 15 Plus",
  "iPhone 15 Pro",
  "iPhone 15 Pro Max",
  "iPhone 16",
  "iPhone 16 Plus",
  "iPhone 16 Pro",
  "iPhone 16 Pro Max",
  "iPhone 17",
  "iPhone 17 Pro",
  "iPhone 17 Pro Max",
];
const PRECIO_ESTUCHE = "$19.990 c/u";

const CABLES_CARGADOR_20W = [
  "Tipo C a Tipo C",
  "Tipo C a Lightning",
];
const PRECIO_CARGADOR_20W = "$39.990";

const productos = {
  audifonos: [
    {
      nombre: "AirPods Pro 2",
      marca: "Calidad 1.1",
      desc: "Calidad de sonido con cancelación de ruido y almohadillas intercambiables.",
      precioPromocion: "$69.990",
      destacado: true,
      imagenes: [
        "imagenes/productos/airpods-pro-2-1.jpg",
      ],
    },
    {
      nombre: "AirPods Pro 3",
      marca: "Calidad 1.1",
      desc: "Sonido increíble con cancelación de ruido, alta definición y función de traducción de idiomas.",
      precioPromocion: "$89.990",
      destacado: true,
      imagenes: [
        "imagenes/productos/airpods-pro-3-1.jpg",
        "imagenes/productos/airpods-pro-3-2.jpg",
        "imagenes/productos/airpods-pro-3-3.jpg",
      ],
    },
  ],

  smartwatches: [
    {
      nombre: "Apple Watch Serie 11 46mm",
      marca: "Calidad 1.1",
      desc: "Calidad 1.1, diseño premium, pantalla increíble y múltiples funciones como monitoreo de salud, recibir notificaciones y llamadas.",
      precioPromocion: "$149.990",
      destacado: true,
      imagenes: [
        "imagenes/productos/apple-watch-s11-46mm-1.jpg",
      ],
    },
  ],

  cargadores: [
    {
      nombre: "Cargador Completo 20W",
      marca: "Calidad 1.1",
      desc: "Cargador de 20 W de carga rápida, con cable de 1 m Tipo C a Tipo C o Tipo C a Lightning.",
      tipoVariante: "el tipo de cable",
      variantes: CABLES_CARGADOR_20W.map((c) => ({ etiqueta: c, precio: PRECIO_CARGADOR_20W })),
      destacado: true,
      imagenes: [
        "imagenes/productos/cargador-completo-20w-1.jpg",
        "imagenes/productos/cargador-completo-20w-2.jpg",
      ],
    },
    {
      nombre: "Cubo de Carga 40W Original Apple",
      marca: "Original Apple",
      desc: "Cubo de carga rápida de 40 W: segura y eficiente. ¡Potencia y calidad para tu dispositivo!",
      precioPromocion: "$89.990",
      destacado: true,
      img: "imagenes/productos/cubo-40w-apple.jpg",
    },
  ],

  estuches: [
    {
      nombre: "Estuches en Silicona para iPhone (Todos los modelos)",
      marca: "Calidad 1.1",
      desc: "Protege tu celular con una buena funda antigolpes en silicona. Elige el modelo de tu iPhone.",
      tipoVariante: "tu modelo de iPhone",
      variantes: MODELOS_IPHONE.map((m) => ({ etiqueta: m, precio: PRECIO_ESTUCHE })),
      imagenes: [
        "imagenes/productos/estuche-silicona-iphone-1.jpg",
      ],
    },
  ],
};

/*
 * Textos de la mudanza a la dirección definitiva y del respaldo de los grupos (v3.2). Para el maestro; no
 * se narran. Van aparte de textosApp.ts: solo los cargan pantallas que se descargan cuando hacen falta, así
 * no pesan en la primera pantalla.
 */

/** Plan B de la mudanza: pasar los grupos de un aparato o dirección a otro con un archivo. */
export const TEXTOS_RESPALDO = {
  titulo: 'Respaldo de los grupos',
  ayuda: 'Guarda todos los grupos de este aparato en un archivo, para pasarlos a otro aparato o a otra dirección del juego. Funciona sin internet.',
  exportar: 'Exportar grupos',
  exportados: (n: number) => (n === 1 ? 'Se descargó el archivo con 1 grupo.' : `Se descargó el archivo con ${n} grupos.`),
  sinGrupos: 'No hay grupos en este aparato.',
  importar: 'Importar grupos',
  revisando: 'Revisando el archivo…',
  invalido: 'Ese archivo no es un respaldo de Mixtle al rescate, o está dañado. No se cambió nada.',
  confirmar: (n: number) => (n === 1 ? 'Se va a agregar 1 grupo:' : `Se van a agregar ${n} grupos:`),
  confirmarSi: 'Agregarlos',
  confirmarNo: 'Cancelar',
  importados: (n: number) => (n === 1 ? 'Listo: se agregó 1 grupo.' : `Listo: se agregaron ${n} grupos.`),
  yaEstaban: 'Los que ya estaban en este aparato se quedaron con el avance más grande.',
  renombrado: (antes: string, despues: string) => `Ya había un grupo "${antes}": el que llegó se llama "${despues}".`,
  gestoGrupos: 'Mantén presionado el título 3 segundos para respaldar o pasar grupos.',
};

/** Mudanza a la dirección definitiva del juego. */
export const TEXTOS_MUDANZA = {
  titulo: (direccion: string) => `El juego se cambió a ${direccion}`,
  explicacion: 'Vamos a llevar sus grupos con todo su avance. No se pierde nada.',
  grupos: (n: number) => (n === 1 ? 'Se va a llevar este grupo:' : `Se van a llevar estos ${n} grupos:`),
  llevar: 'Llevar los grupos',
  cuenta: (s: number) => `Empieza solo en ${s} s`,
  llevando: 'Llevando sus grupos…',
  falloTitulo: 'No se pudieron llevar los grupos',
  falloTexto: 'No se perdió nada: sus grupos siguen aquí, con todo su avance.',
  reintentar: 'Intentar otra vez',
  ahoraNo: 'Ahora no',
  falloPlanB: 'Si vuelve a fallar: en el modo facilitador, "Exportar grupos" los guarda en un archivo.',
  llegaronTitulo: (n: number) => (n === 1 ? '¡Listo! Su grupo ya está aquí' : n > 1 ? `¡Listo! Sus ${n} grupos ya están aquí` : 'El juego ahora está aquí'),
  llegaronTexto: (direccion: string) => `De ahora en adelante, abran el juego en ${direccion}.`,
  instalarTitulo: 'Para tenerlo otra vez como app',
  instalarPasos: [
    'Toquen "Instalar" (abajo) o, en el menú del navegador (⋮), "Instalar app" o "Agregar a la pantalla de inicio".',
    'Abran el juego con el ícono nuevo.',
    'El ícono viejo ya no hace falta: lo pueden borrar.',
  ],
  instalar: 'Instalar',
  entendido: '¡A jugar!',
  yaMudados: (direccion: string) => `Sus grupos se cambiaron a ${direccion}. Ábranlo ahí.`,
  irAlla: (direccion: string) => `Ir a ${direccion}`,
};

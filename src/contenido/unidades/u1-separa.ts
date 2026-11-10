import type { Unidad } from '../tipos';

/*
 * Unidad 1 — Separa tu basura.
 * TODO(Eco Urban): validar consignas, pistas y clasificación con las educadoras y educadores.
 * Las categorías siguen src/data/categorias.ts (orgánico / reciclable / no reciclable).
 * Fuentes de cada dato: docs/fuentes-contenido.md (D4–D12 y la tabla de residuos).
 */
export const U1: Unidad = {
  id: 'u1',
  numero: 1,
  titulo: 'Separa tu basura',
  tema: 'Aprendemos a separar la basura en orgánica, reciclable y no reciclable.',
  color: '#1F6B4A',
  cofreTrasLeccion: 1,
  estampa: {
    id: 'cacomixtle',
    arte: 'mixtle-entero',
    nombre: 'El cacomixtle',
    // A1, A3
    dato: 'El cacomixtle sale sobre todo de noche y tiene una cola larga con anillos negros y blancos.',
  },
  aventura: { id: 'u1-aventura', titulo: 'Limpia el parque', arte: 'bolsa' },
  lecciones: [
    {
      id: 'u1-l1',
      titulo: 'Los tres botes',
      arte: 'bote-organico',
      bienvenida: '¡Vamos a conocer los tres botes!',
      ejercicios: [
        {
          tipo: 'escucha-toca',
          id: 'u1-l1-e1',
          consigna: 'Toca la cáscara de plátano.',
          pista: 'Es amarilla y viene de una fruta.',
          opciones: [
            { id: 'platano', arte: 'residuo-platano', nombre: 'la cáscara de plátano' },
            { id: 'lata', arte: 'residuo-lata', nombre: 'la lata' },
            { id: 'popote', arte: 'residuo-popote', nombre: 'el popote' },
          ],
          correcta: 'platano',
        },
        {
          tipo: 'elige-imagen',
          id: 'u1-l1-e2',
          consigna: '¿Cuál va en el bote verde de orgánico?',
          pista: 'En el bote verde de orgánico va lo que viene de plantas o animales.',
          bote: 'organico',
          opciones: [
            { id: 'manzana', arte: 'residuo-manzana', nombre: 'el corazón de manzana' },
            { id: 'botella', arte: 'residuo-botella', nombre: 'la botella' },
            { id: 'frituras', arte: 'residuo-frituras', nombre: 'la envoltura de frituras' },
          ],
          correcta: 'manzana',
          conTexto: true,
        },
        {
          tipo: 'al-bote',
          id: 'u1-l1-e3',
          consigna: 'Lleva cada basura a su bote.',
          pista: 'Fíjate en el dibujo de cada bote.',
          residuos: ['hojas', 'lata', 'servilleta'],
        },
        {
          tipo: 'si-no',
          id: 'u1-l1-e4',
          consigna: '¿Está bien tirar la lata en el bote azul de reciclable?',
          pista: 'La lata se puede convertir en una lata nueva.',
          arte: 'residuo-lata',
          junto: 'bote-reciclable',
          respuesta: true,
          porque: 'La lata se recicla en el bote azul de reciclable.',
        },
        {
          tipo: 'parejas',
          id: 'u1-l1-e5',
          consigna: 'Une cada basura con su bote.',
          pista: 'Busca el bote con el mismo dibujo que le toca.',
          conTexto: true,
          pares: [
            { izquierda: { id: 'huevo', arte: 'residuo-huevo', nombre: 'la cáscara de huevo' }, derecha: { id: 'organico', arte: 'bote-organico', nombre: 'Orgánico' } },
            { izquierda: { id: 'periodico', arte: 'residuo-periodico', nombre: 'el periódico' }, derecha: { id: 'reciclable', arte: 'bote-reciclable', nombre: 'Reciclable' } },
            { izquierda: { id: 'popote', arte: 'residuo-popote', nombre: 'el popote' }, derecha: { id: 'no-reciclable', arte: 'bote-no-reciclable', nombre: 'No reciclable' } },
          ],
        },
        {
          tipo: 'elige-imagen',
          id: 'u1-l1-e6',
          consigna: '¿Cuál va en el bote azul de reciclable?',
          pista: 'En el bote azul de reciclable va lo que se puede convertir en algo nuevo.',
          bote: 'reciclable',
          opciones: [
            { id: 'carton', arte: 'residuo-carton', nombre: 'la caja de cartón' },
            { id: 'hojas', arte: 'residuo-hojas', nombre: 'las hojas secas' },
            { id: 'servilleta', arte: 'residuo-servilleta', nombre: 'la servilleta usada' },
          ],
          correcta: 'carton',
          conTexto: true,
        },
      ],
    },
    {
      id: 'u1-l2',
      titulo: 'Basura en su lugar',
      arte: 'bote-reciclable',
      bienvenida: '¡A buscar la basura que está fuera de su lugar!',
      ejercicios: [
        {
          tipo: 'encuentra-error',
          id: 'u1-l2-e1',
          consigna: 'Toca la basura que está tirada en el parque.',
          pista: 'Busca cosas que no deberían estar en el pasto.',
          escena: 'parque',
          objetos: [
            { id: 'lata', arte: 'residuo-lata', nombre: 'la lata', x: 30, y: 78, ancho: 9, mal: true },
            { id: 'frituras', arte: 'residuo-frituras', nombre: 'la envoltura', x: 72, y: 84, ancho: 9, mal: true },
            { id: 'arbusto', arte: 'arbusto', nombre: 'el arbusto', x: 55, y: 68, ancho: 16, mal: false },
            { id: 'flores', arte: 'flores-morada', nombre: 'las flores', x: 88, y: 76, ancho: 10, mal: false },
          ],
        },
        {
          // D4: lo orgánico se vuelve composta, que alimenta a las plantas.
          tipo: 'ordena',
          id: 'u1-l2-e2',
          consigna: 'Ordena qué le pasa a la cáscara de plátano.',
          pista: 'Primero va la cáscara y al final, la planta.',
          pasos: [
            { id: 'cascara', arte: 'residuo-platano', nombre: 'la cáscara' },
            { id: 'bote-verde', arte: 'bote-organico', nombre: 'el bote verde de orgánico' },
            { id: 'composta', arte: 'composta', nombre: 'la composta' },
            { id: 'planta', arte: 'brote', nombre: 'la planta nueva' },
          ],
        },
        {
          tipo: 'si-no',
          id: 'u1-l2-e3',
          consigna: '¿Está bien tirar la envoltura de frituras en el pasto?',
          pista: 'La basura en el pasto lastima a los animales.',
          arte: 'residuo-frituras',
          respuesta: false,
          porque: 'La basura va en su bote, no en el pasto.',
        },
        {
          tipo: 'escucha-toca',
          id: 'u1-l2-e4',
          consigna: 'Toca el bote azul de reciclable.',
          pista: 'Es el bote con las flechas.',
          opciones: [
            { id: 'organico', arte: 'bote-organico', nombre: 'el bote verde de orgánico' },
            { id: 'reciclable', arte: 'bote-reciclable', nombre: 'el bote azul de reciclable' },
            { id: 'no-reciclable', arte: 'bote-no-reciclable', nombre: 'el bote naranja de no reciclable' },
          ],
          correcta: 'reciclable',
        },
        {
          tipo: 'al-bote',
          id: 'u1-l2-e5',
          consigna: 'Ayuda a Mixtle a separar esta basura.',
          pista: 'Mira el dibujo de cada bote.',
          residuos: ['botella', 'platano', 'frituras'],
        },
        {
          tipo: 'elige-imagen',
          id: 'u1-l2-e6',
          consigna: '¿Cuál va en el bote naranja de no reciclable?',
          pista: 'En el bote naranja de no reciclable va lo que casi nunca se recicla.',
          bote: 'no-reciclable',
          opciones: [
            { id: 'servilleta', arte: 'residuo-servilleta', nombre: 'la servilleta usada' },
            { id: 'lata', arte: 'residuo-lata', nombre: 'la lata' },
            { id: 'manzana', arte: 'residuo-manzana', nombre: 'el corazón de manzana' },
          ],
          correcta: 'servilleta',
          conTexto: true,
        },
      ],
    },
    {
      id: 'u1-l3',
      titulo: 'Una segunda vida',
      arte: 'composta',
      bienvenida: '¡Vamos a ver en qué se convierte la basura bien separada!',
      ejercicios: [
        {
          // D6, D7, D4
          tipo: 'parejas',
          id: 'u1-l3-e1',
          consigna: 'Une cada basura con lo que puede llegar a ser.',
          pista: 'Piensa de qué está hecha cada cosa.',
          pares: [
            { izquierda: { id: 'botella', arte: 'residuo-botella', nombre: 'la botella' }, derecha: { id: 'playera', arte: 'playera', nombre: 'la playera' } },
            { izquierda: { id: 'periodico', arte: 'residuo-periodico', nombre: 'el periódico' }, derecha: { id: 'cuaderno', arte: 'cuaderno', nombre: 'el cuaderno' } },
            { izquierda: { id: 'platano', arte: 'residuo-platano', nombre: 'la cáscara de plátano' }, derecha: { id: 'composta', arte: 'composta', nombre: 'la composta' } },
          ],
        },
        {
          // D6
          tipo: 'elige-imagen',
          id: 'u1-l3-e2',
          consigna: '¿Con cuál se pueden hacer playeras?',
          pista: 'Es de plástico y va en el bote azul de reciclable.',
          opciones: [
            { id: 'botella', arte: 'residuo-botella', nombre: 'la botella' },
            { id: 'servilleta', arte: 'residuo-servilleta', nombre: 'la servilleta usada' },
            { id: 'popote', arte: 'residuo-popote', nombre: 'el popote' },
          ],
          correcta: 'botella',
          conTexto: true,
        },
        {
          // D5
          tipo: 'si-no',
          id: 'u1-l3-e3',
          consigna: '¿Una lata se puede reciclar para hacer otra lata?',
          pista: 'Piensa en el bote azul de reciclable.',
          arte: 'residuo-lata',
          respuesta: true,
          porque: 'Las latas se pueden reciclar muchas veces.',
        },
        {
          tipo: 'escucha-toca',
          id: 'u1-l3-e4',
          consigna: 'Toca la composta.',
          pista: 'Es tierra oscura con cáscaras y hojas.',
          opciones: [
            { id: 'composta', arte: 'composta', nombre: 'la composta' },
            { id: 'revuelto', arte: 'bote-revuelto', nombre: 'el bote revuelto' },
            { id: 'cuaderno', arte: 'cuaderno', nombre: 'el cuaderno' },
          ],
          correcta: 'composta',
        },
        {
          // D7
          tipo: 'si-no',
          id: 'u1-l3-e5',
          consigna: '¿Reciclar papel ayuda a cuidar los árboles?',
          pista: 'El papel se hace con árboles.',
          arte: 'cuaderno',
          junto: 'arbol',
          respuesta: true,
          porque: 'Con papel reciclado se cortan menos árboles.',
        },
        {
          tipo: 'al-bote',
          id: 'u1-l3-e6',
          consigna: 'Lleva cada basura a su bote.',
          pista: 'Mira el dibujo de cada bote.',
          residuos: ['periodico', 'huevo', 'popote'],
        },
        {
          tipo: 'ordena',
          id: 'u1-l3-e7',
          consigna: 'Ordena el viaje de la botella.',
          pista: 'Primero va la botella y al final, la playera.',
          pasos: [
            { id: 'botella', arte: 'residuo-botella', nombre: 'la botella' },
            { id: 'bote-azul', arte: 'bote-reciclable', nombre: 'el bote azul de reciclable' },
            { id: 'playera', arte: 'playera', nombre: 'la playera' },
          ],
        },
      ],
    },
    {
      id: 'u1-l4',
      titulo: '¿Y si se revuelve?',
      arte: 'bote-revuelto',
      bienvenida: '¿Qué pasa si echamos todo junto? ¡Vamos a ver!',
      ejercicios: [
        {
          // D12
          tipo: 'si-no',
          id: 'u1-l4-e1',
          consigna: '¿Está bien echar toda la basura revuelta en un solo bote?',
          pista: 'Piensa en los tres botes.',
          arte: 'bote-revuelto',
          respuesta: false,
          porque: 'Revuelta, la basura se ensucia y muchas veces ya no se puede reciclar.',
        },
        {
          // D12
          tipo: 'elige-imagen',
          id: 'u1-l4-e2',
          consigna: '¿Cuál se echa a perder si lo revuelves con comida?',
          pista: 'El papel sucio de comida ya no se recicla.',
          opciones: [
            { id: 'periodico', arte: 'residuo-periodico', nombre: 'el periódico' },
            { id: 'platano', arte: 'residuo-platano', nombre: 'la cáscara de plátano' },
            { id: 'hojas', arte: 'residuo-hojas', nombre: 'las hojas secas' },
          ],
          correcta: 'periodico',
          conTexto: true,
        },
        {
          tipo: 'encuentra-error',
          id: 'u1-l4-e3',
          consigna: 'Toca la basura que cayó en el bote equivocado.',
          pista: 'Mira el dibujo de cada bote y lo que tiene encima.',
          escena: 'parque',
          objetos: [
            { id: 'bote-verde', arte: 'bote-organico', nombre: 'el bote verde de orgánico', x: 24, y: 74, ancho: 13, mal: false },
            { id: 'lata-en-verde', arte: 'residuo-lata', nombre: 'la lata', x: 24, y: 48, ancho: 8, mal: true },
            { id: 'bote-azul', arte: 'bote-reciclable', nombre: 'el bote azul de reciclable', x: 50, y: 74, ancho: 13, mal: false },
            { id: 'botella-en-azul', arte: 'residuo-botella', nombre: 'la botella', x: 50, y: 48, ancho: 8, mal: false },
            { id: 'bote-naranja', arte: 'bote-no-reciclable', nombre: 'el bote naranja de no reciclable', x: 76, y: 74, ancho: 13, mal: false },
            { id: 'platano-en-naranja', arte: 'residuo-platano', nombre: 'la cáscara de plátano', x: 76, y: 48, ancho: 8, mal: true },
          ],
        },
        {
          tipo: 'al-bote',
          id: 'u1-l4-e4',
          consigna: 'Ahora sepáralas tú, sin revolver.',
          pista: 'Cada basura tiene su bote.',
          residuos: ['jugo', 'manzana', 'servilleta'],
        },
        {
          tipo: 'escucha-toca',
          id: 'u1-l4-e5',
          consigna: 'Toca el bote revuelto.',
          pista: 'Es el bote gris que tiene de todo.',
          opciones: [
            { id: 'organico', arte: 'bote-organico', nombre: 'el bote verde de orgánico' },
            { id: 'revuelto', arte: 'bote-revuelto', nombre: 'el bote revuelto' },
            { id: 'reciclable', arte: 'bote-reciclable', nombre: 'el bote azul de reciclable' },
          ],
          correcta: 'revuelto',
        },
        {
          // D12: lo que se recicla va vacío y limpio.
          tipo: 'si-no',
          id: 'u1-l4-e6',
          consigna: '¿Está bien tirar una botella llena de jugo en el bote azul de reciclable?',
          pista: 'Lo que se recicla va vacío y limpio.',
          // La botella se dibuja llena (antes salía la botella vacía y el dibujo contradecía la pregunta).
          arte: 'botella-llena',
          junto: 'bote-reciclable',
          respuesta: false,
          porque: 'Primero se vacía; lo que se recicla va limpio.',
        },
        {
          tipo: 'elige-imagen',
          id: 'u1-l4-e7',
          consigna: '¿Cuál va en el bote verde de orgánico?',
          pista: 'En el bote verde de orgánico va lo que viene de plantas o animales.',
          bote: 'organico',
          opciones: [
            { id: 'hojas', arte: 'residuo-hojas', nombre: 'las hojas secas' },
            { id: 'lata', arte: 'residuo-lata', nombre: 'la lata' },
            { id: 'popote', arte: 'residuo-popote', nombre: 'el popote' },
          ],
          correcta: 'hojas',
          conTexto: true,
        },
      ],
    },
  ],
};

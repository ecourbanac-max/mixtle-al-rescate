import type { Unidad } from '../tipos';

/*
 * Unidad 4 — Aire limpio.
 * TODO(Eco Urban): validar consignas, pistas y datos con las educadoras y educadores.
 * Fuentes de cada dato: docs/fuentes-contenido.md (C1–C4, B2, A14, A15). Los comentarios dicen qué fila respalda cada dato.
 */
export const U4: Unidad = {
  id: 'u4',
  numero: 4,
  titulo: 'Aire limpio',
  tema: 'Aprendemos qué ensucia el aire y cómo cuidarlo: caminar, usar la bici y no quemar basura.',
  color: '#2459A6',
  cofreTrasLeccion: 1,
  estampa: {
    id: 'ajolote',
    arte: 'ajolote',
    nombre: 'El ajolote de montaña',
    // A14, A15
    dato: 'El ajolote de montaña vive en los arroyos del Nevado de Toluca y solo existe en México.',
  },
  aventura: { id: 'u4-aventura', titulo: 'En bici a la escuela', arte: 'bici' },
  lecciones: [
    {
      id: 'u4-l1',
      titulo: 'A pie o en bici',
      arte: 'bici',
      bienvenida: '¿Cómo podemos llegar a la escuela sin ensuciar el aire?',
      ejercicios: [
        {
          tipo: 'escucha-toca',
          id: 'u4-l1-e1',
          consigna: 'Toca la bici.',
          pista: 'Tiene dos ruedas y pedales.',
          opciones: [
            { id: 'bici', arte: 'bici', nombre: 'la bici' },
            { id: 'coche', arte: 'coche', nombre: 'el coche' },
            { id: 'tenis', arte: 'tenis', nombre: 'los tenis' },
          ],
          correcta: 'bici',
        },
        {
          // C1
          tipo: 'elige-imagen',
          id: 'u4-l1-e2',
          consigna: '¿Cuál no echa humo?',
          pista: 'Se mueve con la fuerza de tus piernas.',
          opciones: [
            { id: 'bici', arte: 'bici', nombre: 'la bici' },
            { id: 'coche', arte: 'coche', nombre: 'el coche' },
          ],
          correcta: 'bici',
          conTexto: true,
        },
        {
          // C1
          tipo: 'si-no',
          id: 'u4-l1-e3',
          consigna: '¿Caminar a la escuela echa humo?',
          pista: 'Piensa en tus pies.',
          arte: 'tenis',
          respuesta: false,
          porque: 'Caminar no echa humo; el aire se queda limpio.',
        },
        {
          // C1
          tipo: 'parejas',
          id: 'u4-l1-e4',
          consigna: 'Une cada uno con lo que deja en el aire.',
          pista: 'El coche echa humo.',
          pares: [
            { izquierda: { id: 'coche', arte: 'coche', nombre: 'el coche' }, derecha: { id: 'humo', arte: 'humo', nombre: 'el humo' } },
            { izquierda: { id: 'bici', arte: 'bici', nombre: 'la bici' }, derecha: { id: 'aire-limpio', arte: 'aire-limpio', nombre: 'el aire limpio' } },
          ],
        },
        {
          tipo: 'ordena',
          id: 'u4-l1-e5',
          consigna: 'Ordena el camino a la escuela.',
          pista: 'Sales de tu casa y llegas a la escuela.',
          pasos: [
            { id: 'casa', arte: 'casa', nombre: 'la casa' },
            { id: 'bici', arte: 'bici', nombre: 'la bici' },
            { id: 'escuela', arte: 'escuela', nombre: 'la escuela' },
          ],
        },
        {
          tipo: 'si-no',
          id: 'u4-l1-e6',
          consigna: '¿Está bien ir en bici por la ciclovía?',
          pista: 'La ciclovía es el camino de las bicis.',
          arte: 'bici',
          respuesta: true,
          porque: 'La ciclovía es un camino hecho para las bicis.',
        },
      ],
    },
    {
      id: 'u4-l2',
      titulo: '¿Qué es el humo?',
      arte: 'humo',
      bienvenida: 'Vamos a conocer al humo y por qué nos hace toser.',
      ejercicios: [
        {
          tipo: 'escucha-toca',
          id: 'u4-l2-e1',
          consigna: 'Toca el humo.',
          pista: 'Es una nube gris.',
          opciones: [
            { id: 'humo', arte: 'humo', nombre: 'el humo' },
            { id: 'sol', arte: 'sol', nombre: 'el sol' },
            { id: 'pelota', arte: 'pelota', nombre: 'la pelota' },
          ],
          correcta: 'humo',
        },
        {
          // C3
          tipo: 'si-no',
          id: 'u4-l2-e2',
          consigna: '¿El humo nos puede hacer toser?',
          pista: 'Piensa en tus pulmones.',
          arte: 'humo',
          respuesta: true,
          porque: 'El humo lastima los pulmones, sobre todo de niñas y niños.',
        },
        {
          // C2
          tipo: 'si-no',
          id: 'u4-l2-e3',
          consigna: '¿Está bien quemar basura?',
          pista: 'Mira cuánto humo sale.',
          arte: 'quemar-basura',
          respuesta: false,
          porque: 'Quemar basura llena el aire de humo dañino.',
        },
        {
          // C1, C2
          tipo: 'encuentra-error',
          id: 'u4-l2-e4',
          consigna: 'Toca lo que ensucia el aire.',
          pista: 'Busca de dónde sale humo.',
          escena: 'calle',
          objetos: [
            { id: 'quemar', arte: 'quemar-basura', nombre: 'la basura quemándose', x: 22, y: 50, ancho: 11, mal: true },
            { id: 'coche', arte: 'coche', nombre: 'el coche echando humo', x: 62, y: 72, ancho: 14, mal: true },
            { id: 'bici', arte: 'bici', nombre: 'la bici', x: 40, y: 82, ancho: 11, mal: false },
            { id: 'arbol', arte: 'arbol', nombre: 'el árbol', x: 82, y: 44, ancho: 12, mal: false },
          ],
        },
        {
          // C2
          tipo: 'elige-imagen',
          id: 'u4-l2-e5',
          consigna: '¿Qué hacemos con la basura en lugar de quemarla?',
          pista: 'Cada basura tiene su bote.',
          opciones: [
            { id: 'separar', arte: 'bote-reciclable', nombre: 'separarla en sus botes' },
            { id: 'quemar', arte: 'quemar-basura', nombre: 'quemarla' },
            { id: 'tirar', arte: 'residuo-frituras', nombre: 'tirarla en la calle' },
          ],
          correcta: 'separar',
          conTexto: true,
        },
        {
          tipo: 'al-bote',
          id: 'u4-l2-e6',
          consigna: 'En lugar de quemarla, sepárala.',
          pista: 'Mira el dibujo de cada bote.',
          residuos: ['periodico', 'platano', 'popote'],
        },
      ],
    },
    {
      id: 'u4-l3',
      titulo: 'Días de contingencia',
      arte: 'aire-sucio',
      bienvenida: 'A veces el aire está muy sucio. ¿Qué hacemos?',
      ejercicios: [
        {
          tipo: 'elige-imagen',
          id: 'u4-l3-e1',
          consigna: '¿Cuál aire está limpio?',
          pista: 'El cielo limpio es azul.',
          opciones: [
            { id: 'limpio', arte: 'aire-limpio', nombre: 'el cielo azul' },
            { id: 'sucio', arte: 'aire-sucio', nombre: 'el cielo gris' },
          ],
          correcta: 'limpio',
          conTexto: true,
        },
        {
          // C4
          tipo: 'si-no',
          id: 'u4-l3-e2',
          consigna: 'Si el aire está muy sucio, ¿es buena idea correr y jugar afuera?',
          pista: 'Hay que cuidar los pulmones.',
          arte: 'aire-sucio',
          junto: 'pelota',
          respuesta: false,
          porque: 'Es mejor jugar adentro hasta que el aire mejore.',
        },
        {
          // C4
          tipo: 'elige-imagen',
          id: 'u4-l3-e3',
          consigna: 'Hoy hay contingencia ambiental. ¿Dónde jugamos?',
          pista: 'Hoy el aire de afuera está sucio.',
          opciones: [
            { id: 'adentro', arte: 'casa', nombre: 'adentro' },
            { id: 'afuera', arte: 'pelota', nombre: 'afuera, en el parque' },
          ],
          correcta: 'adentro',
          conTexto: true,
        },
        {
          tipo: 'escucha-toca',
          id: 'u4-l3-e4',
          consigna: 'Toca el cielo gris.',
          pista: 'Es el que se ve sucio.',
          opciones: [
            { id: 'sucio', arte: 'aire-sucio', nombre: 'el cielo gris' },
            { id: 'limpio', arte: 'aire-limpio', nombre: 'el cielo azul' },
            // Antes la tercera opción era el humo, que también es gris y se confundía con "el cielo gris".
            { id: 'sol', arte: 'sol', nombre: 'el sol' },
          ],
          correcta: 'sucio',
        },
        {
          // C1
          tipo: 'si-no',
          id: 'u4-l3-e5',
          consigna: 'Si dejamos el coche y caminamos, ¿el aire se ensucia menos?',
          pista: 'Caminar no echa humo.',
          arte: 'tenis',
          junto: 'aire-limpio',
          respuesta: true,
          porque: 'Caminar no echa humo.',
        },
        {
          // C4
          tipo: 'parejas',
          id: 'u4-l3-e6',
          consigna: 'Une cada cielo con lo que hacemos.',
          pista: 'Con el cielo gris, mejor adentro.',
          pares: [
            { izquierda: { id: 'limpio', arte: 'aire-limpio', nombre: 'el cielo azul' }, derecha: { id: 'afuera', arte: 'pelota', nombre: 'jugar afuera' } },
            { izquierda: { id: 'sucio', arte: 'aire-sucio', nombre: 'el cielo gris' }, derecha: { id: 'adentro', arte: 'casa', nombre: 'jugar adentro' } },
          ],
        },
      ],
    },
    {
      id: 'u4-l4',
      titulo: 'Cuidamos el aire',
      arte: 'aire-limpio',
      bienvenida: '¡Vamos a repasar todo lo que ayuda al aire!',
      ejercicios: [
        {
          // B2
          tipo: 'si-no',
          id: 'u4-l4-e1',
          consigna: '¿Los árboles toman dióxido de carbono del aire?',
          pista: 'Piensa en lo que aprendimos de los árboles.',
          arte: 'arbol',
          junto: 'aire-limpio',
          respuesta: true,
          porque: 'Toman dióxido de carbono y sueltan oxígeno.',
        },
        {
          // C2
          tipo: 'elige-imagen',
          id: 'u4-l4-e2',
          consigna: '¿Cuál ensucia el aire?',
          pista: 'Busca el fuego.',
          opciones: [
            { id: 'quemar', arte: 'quemar-basura', nombre: 'quemar basura' },
            { id: 'bici', arte: 'bici', nombre: 'andar en bici' },
            { id: 'arbol', arte: 'arbol', nombre: 'plantar un árbol' },
          ],
          correcta: 'quemar',
          conTexto: true,
        },
        {
          // C2
          tipo: 'ordena',
          id: 'u4-l4-e3',
          consigna: 'Ordena qué pasa si quemamos basura.',
          pista: 'Al final, el aire queda sucio.',
          pasos: [
            { id: 'basura', arte: 'bote-revuelto', nombre: 'la basura' },
            { id: 'fuego', arte: 'quemar-basura', nombre: 'el fuego' },
            { id: 'humo', arte: 'humo', nombre: 'el humo' },
            { id: 'aire-sucio', arte: 'aire-sucio', nombre: 'el aire sucio' },
          ],
        },
        {
          tipo: 'escucha-toca',
          id: 'u4-l4-e4',
          consigna: 'Toca los tenis.',
          pista: 'Te los pones para caminar.',
          opciones: [
            { id: 'tenis', arte: 'tenis', nombre: 'los tenis' },
            { id: 'coche', arte: 'coche', nombre: 'el coche' },
            { id: 'bici', arte: 'bici', nombre: 'la bici' },
          ],
          correcta: 'tenis',
        },
        {
          // C1
          tipo: 'si-no',
          id: 'u4-l4-e5',
          consigna: '¿Los coches echan humo?',
          pista: 'Mira lo que sale por detrás.',
          arte: 'coche',
          respuesta: true,
          porque: 'Por eso, cuando se puede, es mejor caminar o ir en bici.',
        },
        {
          // C2, B2
          tipo: 'parejas',
          id: 'u4-l4-e6',
          consigna: 'Une cada cosa con lo que deja en el aire.',
          pista: 'El fuego hace humo.',
          pares: [
            { izquierda: { id: 'quemar', arte: 'quemar-basura', nombre: 'quemar basura' }, derecha: { id: 'humo', arte: 'humo', nombre: 'el humo' } },
            { izquierda: { id: 'arbol', arte: 'arbol', nombre: 'el árbol' }, derecha: { id: 'oxigeno', arte: 'aire-limpio', nombre: 'el oxígeno' } },
          ],
        },
      ],
    },
  ],
};

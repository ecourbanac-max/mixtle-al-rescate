import type { Unidad } from '../tipos';

/*
 * Unidad 3 — Árboles y áreas verdes.
 * TODO(Eco Urban): validar consignas, pistas y datos con las educadoras y educadores.
 * Fuentes de cada dato: docs/fuentes-contenido.md (B1–B5, A10, A19). Los comentarios dicen qué fila respalda cada dato.
 */
export const U3: Unidad = {
  id: 'u3',
  numero: 3,
  titulo: 'Árboles y áreas verdes',
  tema: 'Descubrimos para qué sirven los árboles, cómo se planta uno y cómo se cuida.',
  color: '#3B6E22',
  cofreTrasLeccion: 1,
  estampa: {
    id: 'colibri',
    arte: 'colibri-feliz',
    nombre: 'El colibrí',
    // A10
    dato: 'Cuando el colibrí toma néctar, lleva polen de flor en flor y así ayuda a las plantas.',
  },
  aventura: { id: 'u3-aventura', titulo: 'Siembra un bosquecito', arte: 'arbolito' },
  lecciones: [
    {
      id: 'u3-l1',
      titulo: '¿Para qué sirven?',
      arte: 'arbol',
      bienvenida: '¡Vamos a descubrir todo lo que hacen los árboles!',
      ejercicios: [
        {
          // B1
          tipo: 'elige-imagen',
          id: 'u3-l1-e1',
          consigna: 'En un día de sol, ¿dónde hace más fresco?',
          pista: 'Los árboles dan sombra.',
          opciones: [
            { id: 'sombra', arte: 'arbol-sombra', nombre: 'bajo el árbol' },
            { id: 'sol', arte: 'sol', nombre: 'bajo el sol' },
          ],
          correcta: 'sombra',
          conTexto: true,
        },
        {
          // B2
          tipo: 'si-no',
          id: 'u3-l1-e2',
          consigna: '¿Los árboles sueltan oxígeno, el aire que respiramos?',
          pista: 'Piensa en el aire que respiramos.',
          arte: 'arbol',
          junto: 'aire-limpio',
          respuesta: true,
          porque: 'Toman dióxido de carbono del aire y sueltan oxígeno.',
        },
        {
          tipo: 'escucha-toca',
          id: 'u3-l1-e3',
          consigna: 'Toca el nido.',
          pista: 'Es la casita de los pájaros, con huevitos.',
          opciones: [
            { id: 'nido', arte: 'nido', nombre: 'el nido' },
            { id: 'bellota', arte: 'bellota', nombre: 'la bellota' },
            { id: 'pina', arte: 'pina', nombre: 'la piña de pino' },
          ],
          correcta: 'nido',
        },
        {
          // B3
          tipo: 'elige-imagen',
          id: 'u3-l1-e4',
          consigna: '¿Quién puede vivir en un árbol?',
          pista: 'Tiene cola esponjada y sube por las ramas.',
          opciones: [
            { id: 'ardilla', arte: 'ardilla-feliz', nombre: 'la ardilla' },
            { id: 'ajolote', arte: 'ajolote', nombre: 'el ajolote' },
            { id: 'coche', arte: 'coche', nombre: 'el coche' },
          ],
          correcta: 'ardilla',
          conTexto: true,
        },
        {
          tipo: 'encuentra-error',
          id: 'u3-l1-e5',
          consigna: 'Toca lo que lastima al árbol.',
          pista: 'Busca una rama rota y basura.',
          escena: 'parque',
          // Todo en el árbol del parque (v3.1.1): la rama rota cuelga de su tronco, la lata está tirada al pie,
          // el nido y la ardilla viven en su copa. Lugares medidos para que nada se encime ni en un celular.
          objetos: [
            { id: 'rama', arte: 'rama-colgando', nombre: 'la rama rota', x: 32.8, y: 58.6, ancho: 13, mal: true },
            { id: 'lata', arte: 'lata-tirada', nombre: 'la lata', x: 17, y: 76, ancho: 11, mal: true },
            { id: 'nido', arte: 'nido', nombre: 'el nido', x: 36, y: 22, ancho: 9, mal: false },
            { id: 'ardilla', arte: 'ardilla-feliz', nombre: 'la ardilla', x: 17, y: 33, ancho: 9, mal: false },
          ],
        },
        {
          tipo: 'escucha-toca',
          id: 'u3-l1-e6',
          consigna: 'Toca el árbol grande.',
          pista: 'Es el más alto de todos.',
          opciones: [
            { id: 'brote', arte: 'brote', nombre: 'el brote' },
            { id: 'arbolito', arte: 'arbolito', nombre: 'el arbolito' },
            { id: 'arbol', arte: 'arbol', nombre: 'el árbol grande' },
          ],
          correcta: 'arbol',
        },
      ],
    },
    {
      id: 'u3-l2',
      titulo: 'Plantamos un árbol',
      arte: 'pala',
      bienvenida: '¡Vamos a plantar un arbolito, paso a paso!',
      ejercicios: [
        {
          // B4
          tipo: 'ordena',
          id: 'u3-l2-e1',
          consigna: 'Ordena cómo se planta un arbolito.',
          pista: 'Primero se hace el hoyo y al final se riega.',
          pasos: [
            { id: 'hoyo', arte: 'hoyo', nombre: 'hacer el hoyo' },
            { id: 'arbolito-bolsa', arte: 'arbolito-bolsa', nombre: 'sacar el arbolito de su bolsa' },
            { id: 'plantado', arte: 'arbolito', nombre: 'cubrir las raíces con tierra' },
            { id: 'regar', arte: 'regadera', nombre: 'regarlo' },
          ],
        },
        {
          tipo: 'escucha-toca',
          id: 'u3-l2-e2',
          consigna: 'Toca la pala.',
          pista: 'Sirve para hacer el hoyo.',
          opciones: [
            { id: 'pala', arte: 'pala', nombre: 'la pala' },
            { id: 'regadera', arte: 'regadera', nombre: 'la regadera' },
            { id: 'cuchara', arte: 'cuchara', nombre: 'la cuchara' },
          ],
          correcta: 'pala',
        },
        {
          // B4
          tipo: 'si-no',
          id: 'u3-l2-e3',
          consigna: '¿Se planta el arbolito con todo y su bolsa de plástico?',
          pista: 'La bolsa se quita antes de plantar.',
          arte: 'arbolito-bolsa',
          respuesta: false,
          porque: 'Primero se le quita la bolsa con cuidado.',
        },
        {
          tipo: 'elige-imagen',
          id: 'u3-l2-e4',
          consigna: '¿Con cuál regamos el arbolito?',
          pista: 'Lleva agua adentro.',
          opciones: [
            { id: 'regadera', arte: 'regadera', nombre: 'la regadera' },
            { id: 'pala', arte: 'pala', nombre: 'la pala' },
            { id: 'cuchara', arte: 'cuchara', nombre: 'la cuchara' },
          ],
          correcta: 'regadera',
          conTexto: true,
        },
        {
          // B4
          tipo: 'si-no',
          id: 'u3-l2-e5',
          consigna: '¿Hay que tapar con tierra todo el tronco?',
          pista: 'La tierra va sobre las raíces.',
          arte: 'arbolito',
          respuesta: false,
          porque: 'La tierra cubre las raíces, no el tronco.',
        },
        {
          tipo: 'escucha-toca',
          id: 'u3-l2-e6',
          consigna: 'Toca el hoyo.',
          pista: 'Es donde va el arbolito.',
          opciones: [
            { id: 'hoyo', arte: 'hoyo', nombre: 'el hoyo' },
            { id: 'composta', arte: 'composta', nombre: 'la composta' },
            { id: 'nido', arte: 'nido', nombre: 'el nido' },
          ],
          correcta: 'hoyo',
        },
      ],
    },
    {
      id: 'u3-l3',
      titulo: 'Lo cuidamos',
      arte: 'regadera',
      bienvenida: 'Un árbol necesita cuidados. ¡Vamos a cuidarlo!',
      ejercicios: [
        {
          // B5
          tipo: 'si-no',
          id: 'u3-l3-e1',
          consigna: '¿Un árbol recién plantado necesita que lo rieguen seguido?',
          pista: 'Al principio necesita mucha ayuda.',
          arte: 'arbolito',
          junto: 'regadera',
          respuesta: true,
          porque: 'Sobre todo al principio, necesita agua seguido.',
        },
        {
          tipo: 'encuentra-error',
          id: 'u3-l3-e2',
          consigna: 'Toca lo que está mal en el parque.',
          pista: 'Busca agua que se tira, una rama rota y basura.',
          // Lugares medidos (v3.1.1): en un celular, cada objeto se toca en 48 px y ninguno se encima (e2e/encuentra.spec.ts).
          escena: 'parque',
          objetos: [
            { id: 'llave', arte: 'llave-goteando', nombre: 'la llave goteando', x: 12, y: 72, ancho: 11, mal: true },
            { id: 'rama', arte: 'rama-colgando', nombre: 'la rama rota', x: 32.8, y: 58.6, ancho: 13, mal: true },
            { id: 'frituras', arte: 'residuo-frituras', nombre: 'la envoltura', x: 67, y: 86, ancho: 8, mal: true },
            { id: 'arbolito', arte: 'arbolito', nombre: 'el arbolito', x: 86, y: 72, ancho: 11, mal: false },
            { id: 'flores', arte: 'flores-morada', nombre: 'las flores', x: 50, y: 86, ancho: 9, mal: false },
          ],
        },
        {
          tipo: 'elige-imagen',
          id: 'u3-l3-e3',
          consigna: '¿Qué le ayuda al arbolito?',
          pista: 'Los árboles necesitan agua.',
          opciones: [
            { id: 'agua', arte: 'regadera', nombre: 'el agua' },
            { id: 'basura', arte: 'residuo-lata', nombre: 'la basura' },
            { id: 'rama', arte: 'rama-rota', nombre: 'romper ramas' },
          ],
          correcta: 'agua',
          conTexto: true,
        },
        {
          tipo: 'si-no',
          id: 'u3-l3-e4',
          consigna: '¿Está bien tirar basura al pie de un árbol?',
          pista: 'La basura tiene su bote.',
          arte: 'arbol',
          junto: 'residuo-lata',
          respuesta: false,
          porque: 'La basura va en su bote, no junto al árbol.',
        },
        {
          tipo: 'si-no',
          id: 'u3-l3-e5',
          consigna: '¿Hay que cerrar bien la llave cuando no usamos el agua?',
          pista: 'El agua no se debe tirar.',
          arte: 'llave-goteando',
          respuesta: true,
          porque: 'Así no se desperdicia el agua.',
        },
        {
          tipo: 'al-bote',
          id: 'u3-l3-e6',
          consigna: 'Recoge la basura del pie del árbol.',
          pista: 'Mira el dibujo de cada bote.',
          residuos: ['hojas', 'popote', 'lata'],
        },
        {
          tipo: 'escucha-toca',
          id: 'u3-l3-e7',
          consigna: 'Toca la regadera.',
          pista: 'Tiene un pico largo para echar agua.',
          opciones: [
            { id: 'regadera', arte: 'regadera', nombre: 'la regadera' },
            { id: 'pala', arte: 'pala', nombre: 'la pala' },
            { id: 'frasco', arte: 'frasco', nombre: 'el frasco' },
          ],
          correcta: 'regadera',
        },
      ],
    },
    {
      id: 'u3-l4',
      titulo: 'Casa de animales',
      arte: 'nido',
      bienvenida: 'En los árboles y las flores viven muchos animales. ¡Vamos a verlos!',
      ejercicios: [
        {
          // A10
          tipo: 'si-no',
          id: 'u3-l4-e1',
          consigna: '¿El colibrí lleva polen de flor en flor?',
          pista: 'El colibrí visita muchas flores.',
          arte: 'colibri-feliz',
          junto: 'flores-naranja',
          respuesta: true,
          porque: 'Al tomar néctar, lleva polen y así ayuda a las plantas.',
        },
        {
          // A7, A8, A12
          tipo: 'parejas',
          id: 'u3-l4-e2',
          consigna: 'Une a cada animal con lo que busca en las plantas.',
          pista: 'Piensa qué come cada uno.',
          pares: [
            { izquierda: { id: 'ardilla', arte: 'ardilla-feliz', nombre: 'la ardilla' }, derecha: { id: 'bellota', arte: 'bellota', nombre: 'la bellota' } },
            { izquierda: { id: 'colibri', arte: 'colibri-feliz', nombre: 'el colibrí' }, derecha: { id: 'flores', arte: 'flores-naranja', nombre: 'las flores' } },
            { izquierda: { id: 'oruga', arte: 'oruga', nombre: 'la oruga' }, derecha: { id: 'algodoncillo', arte: 'algodoncillo', nombre: 'el algodoncillo' } },
          ],
        },
        {
          // A19
          tipo: 'elige-imagen',
          id: 'u3-l4-e3',
          consigna: '¿Dónde hace su nido el colibrí?',
          pista: 'Busca ramas altas.',
          opciones: [
            { id: 'arbol', arte: 'arbol', nombre: 'en el árbol' },
            { id: 'coche', arte: 'coche', nombre: 'en el coche' },
            { id: 'bote', arte: 'bote-revuelto', nombre: 'en el bote' },
          ],
          correcta: 'arbol',
          conTexto: true,
        },
        {
          tipo: 'escucha-toca',
          id: 'u3-l4-e4',
          consigna: 'Toca a la oruga.',
          pista: 'Tiene rayas amarillas, blancas y negras.',
          opciones: [
            { id: 'oruga', arte: 'oruga', nombre: 'la oruga' },
            { id: 'colibri', arte: 'colibri-feliz', nombre: 'el colibrí' },
            { id: 'bellota', arte: 'bellota', nombre: 'la bellota' },
          ],
          correcta: 'oruga',
        },
        {
          // B3
          tipo: 'si-no',
          id: 'u3-l4-e5',
          consigna: '¿Los árboles son casa de pájaros, ardillas e insectos?',
          pista: 'Mira el nido en las ramas.',
          arte: 'nido',
          junto: 'ardilla-feliz',
          respuesta: true,
          porque: 'Por eso, cuidar un árbol es cuidar a muchos animales.',
        },
        {
          tipo: 'ordena',
          id: 'u3-l4-e6',
          consigna: 'Ordena cómo crece un árbol.',
          pista: 'Empieza muy pequeñito.',
          pasos: [
            { id: 'brote', arte: 'brote', nombre: 'el brote' },
            { id: 'arbolito', arte: 'arbolito', nombre: 'el arbolito' },
            { id: 'arbol', arte: 'arbol', nombre: 'el árbol grande' },
          ],
        },
      ],
    },
  ],
};

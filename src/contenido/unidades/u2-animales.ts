import type { Unidad } from '../tipos';

/*
 * Unidad 2 — Los animales del parque.
 * TODO(Eco Urban): validar consignas, pistas y datos con las educadoras y educadores.
 * Fuentes de cada dato: docs/fuentes-contenido.md (A1–A20). Los comentarios dicen qué fila respalda cada dato.
 */
export const U2: Unidad = {
  id: 'u2',
  numero: 2,
  titulo: 'Los animales del parque',
  tema: 'Conocemos a los animales del parque y cómo cuidarlos de la basura.',
  color: '#6345A8',
  cofreTrasLeccion: 1,
  estampa: {
    id: 'monarca',
    arte: 'mariposa-feliz',
    nombre: 'La mariposa monarca',
    // A11
    dato: 'Muchas mariposas monarca vuelan miles de kilómetros para pasar el invierno en los bosques del Estado de México y Michoacán.',
  },
  aventura: { id: 'u2-aventura', titulo: 'Rescate en el parque', arte: 'tlacuache' },
  lecciones: [
    {
      id: 'u2-l1',
      titulo: '¿Quién vive aquí?',
      arte: 'ardilla-feliz',
      bienvenida: '¡Vamos a conocer a los animales del parque!',
      ejercicios: [
        {
          tipo: 'escucha-toca',
          id: 'u2-l1-e1',
          consigna: 'Toca a la ardilla.',
          pista: 'Tiene la cola esponjada.',
          opciones: [
            { id: 'ardilla', arte: 'ardilla-feliz', nombre: 'la ardilla' },
            { id: 'colibri', arte: 'colibri-feliz', nombre: 'el colibrí' },
            { id: 'mariposa', arte: 'mariposa-feliz', nombre: 'la mariposa' },
          ],
          correcta: 'ardilla',
        },
        {
          // A3
          tipo: 'elige-imagen',
          id: 'u2-l1-e2',
          consigna: '¿Quién tiene una cola larga con anillos negros y blancos?',
          pista: 'Es nuestro amigo Mixtle.',
          opciones: [
            { id: 'cacomixtle', arte: 'mixtle-entero', nombre: 'el cacomixtle' },
            { id: 'tlacuache', arte: 'tlacuache', nombre: 'el tlacuache' },
            { id: 'ardilla', arte: 'ardilla-feliz', nombre: 'la ardilla' },
          ],
          correcta: 'cacomixtle',
          conTexto: true,
        },
        {
          // A1
          tipo: 'si-no',
          id: 'u2-l1-e3',
          consigna: '¿El cacomixtle sale sobre todo de noche?',
          pista: 'Mixtle duerme de día.',
          arte: 'mixtle-entero',
          respuesta: true,
          porque: 'De día duerme y de noche busca su comida.',
        },
        {
          // A7, A8, A12
          tipo: 'parejas',
          id: 'u2-l1-e4',
          consigna: 'Une a cada animal con lo que come.',
          pista: 'Piensa qué come cada uno en el parque.',
          pares: [
            { izquierda: { id: 'ardilla', arte: 'ardilla-feliz', nombre: 'la ardilla' }, derecha: { id: 'bellota', arte: 'bellota', nombre: 'la bellota' } },
            { izquierda: { id: 'colibri', arte: 'colibri-feliz', nombre: 'el colibrí' }, derecha: { id: 'flores', arte: 'flores-naranja', nombre: 'las flores' } },
            { izquierda: { id: 'oruga', arte: 'oruga', nombre: 'la oruga de la monarca' }, derecha: { id: 'algodoncillo', arte: 'algodoncillo', nombre: 'el algodoncillo' } },
          ],
        },
        {
          // A9
          tipo: 'escucha-toca',
          id: 'u2-l1-e5',
          consigna: 'Toca al colibrí.',
          pista: 'Es un pájaro pequeñito que mueve sus alas muy rápido.',
          opciones: [
            { id: 'colibri', arte: 'colibri-feliz', nombre: 'el colibrí' },
            { id: 'mariposa', arte: 'mariposa-feliz', nombre: 'la mariposa' },
            { id: 'ajolote', arte: 'ajolote', nombre: 'el ajolote' },
          ],
          correcta: 'colibri',
        },
        {
          // A12
          tipo: 'elige-imagen',
          id: 'u2-l1-e6',
          consigna: '¿Qué come la oruga de la mariposa monarca?',
          pista: 'Solo come una planta: el algodoncillo.',
          opciones: [
            { id: 'algodoncillo', arte: 'algodoncillo', nombre: 'el algodoncillo' },
            { id: 'bellota', arte: 'bellota', nombre: 'la bellota' },
            { id: 'dulce', arte: 'dulce', nombre: 'el dulce' },
          ],
          correcta: 'algodoncillo',
          conTexto: true,
        },
      ],
    },
    {
      id: 'u2-l2',
      titulo: 'La basura los lastima',
      arte: 'anillos',
      bienvenida: 'La basura puede lastimar a los animales. ¡Vamos a ayudarlos!',
      ejercicios: [
        {
          // A17
          tipo: 'si-no',
          id: 'u2-l2-e1',
          consigna: '¿Está bien dejar una bolsa de plástico en el pasto?',
          pista: 'Un animal se puede atorar en ella.',
          arte: 'bolsa-plastico',
          respuesta: false,
          porque: 'Una bolsa puede atorar a un animal, o se la puede tragar.',
        },
        {
          // A17
          tipo: 'elige-imagen',
          id: 'u2-l2-e2',
          consigna: '¿Cuál puede atorar a un animal?',
          pista: 'Es de plástico y tiene hoyos.',
          opciones: [
            { id: 'anillos', arte: 'anillos', nombre: 'los anillos de plástico' },
            { id: 'hojas', arte: 'residuo-hojas', nombre: 'las hojas secas' },
            { id: 'bellota', arte: 'bellota', nombre: 'la bellota' },
          ],
          correcta: 'anillos',
          conTexto: true,
        },
        {
          tipo: 'encuentra-error',
          id: 'u2-l2-e3',
          consigna: 'Toca la basura que puede lastimar a los animales.',
          pista: 'Busca cosas de plástico y metal en el pasto.',
          // Lugares medidos (v3.1.1): en un celular, cada objeto se toca en 48 px y ninguno se encima (e2e/encuentra.spec.ts).
          escena: 'parque',
          objetos: [
            { id: 'anillos', arte: 'anillos', nombre: 'los anillos de plástico', x: 26, y: 82, ancho: 10, mal: true },
            { id: 'bolsa', arte: 'bolsa-plastico', nombre: 'la bolsa de plástico', x: 61, y: 84, ancho: 9, mal: true },
            { id: 'lata', arte: 'lata-tirada', nombre: 'la lata', x: 43, y: 85, ancho: 10, mal: true },
            { id: 'ardilla', arte: 'ardilla-feliz', nombre: 'la ardilla', x: 78, y: 84, ancho: 10, mal: false },
            { id: 'flores', arte: 'flores-amarilla', nombre: 'las flores', x: 9, y: 84, ancho: 10, mal: false },
          ],
        },
        {
          tipo: 'ordena',
          id: 'u2-l2-e4',
          consigna: 'Ordena cómo ayudamos a la ardilla.',
          pista: 'Al final, la ardilla está feliz.',
          pasos: [
            { id: 'basura', arte: 'residuo-frituras', nombre: 'la basura en el pasto' },
            { id: 'bolsa', arte: 'bolsa', nombre: 'la bolsa para recoger' },
            { id: 'bote', arte: 'bote-no-reciclable', nombre: 'el bote naranja de no reciclable' },
            { id: 'feliz', arte: 'ardilla-feliz', nombre: 'la ardilla feliz' },
          ],
        },
        {
          tipo: 'al-bote',
          id: 'u2-l2-e5',
          consigna: 'Lleva al bote la basura que lastimaba a los animales.',
          pista: 'Mira el dibujo de cada bote.',
          residuos: ['lata', 'frituras', 'botella'],
        },
        {
          tipo: 'si-no',
          id: 'u2-l2-e6',
          consigna: '¿Está bien recoger la basura del parque?',
          pista: 'Así ayudamos a los animales.',
          arte: 'bolsa',
          junto: 'ardilla-feliz',
          respuesta: true,
          porque: 'Sin basura, los animales no se lastiman.',
        },
        {
          tipo: 'escucha-toca',
          id: 'u2-l2-e7',
          consigna: 'Toca los anillos de plástico.',
          pista: 'Tienen muchos hoyos redondos.',
          opciones: [
            { id: 'anillos', arte: 'anillos', nombre: 'los anillos de plástico' },
            { id: 'nido', arte: 'nido', nombre: 'el nido' },
            { id: 'pina', arte: 'pina', nombre: 'la piña de pino' },
          ],
          correcta: 'anillos',
        },
      ],
    },
    {
      id: 'u2-l3',
      titulo: 'Nada de comida chatarra',
      arte: 'dulce',
      bienvenida: '¿Qué comen los animales del parque? ¡Vamos a descubrirlo!',
      ejercicios: [
        {
          // A16
          tipo: 'si-no',
          id: 'u2-l3-e1',
          consigna: '¿Está bien darle papitas a la ardilla?',
          pista: 'Las papitas no son comida de ardilla.',
          arte: 'ardilla-feliz',
          junto: 'residuo-frituras',
          respuesta: false,
          porque: 'La comida de las personas puede enfermar a los animales.',
        },
        {
          // A7
          tipo: 'elige-imagen',
          id: 'u2-l3-e2',
          consigna: '¿Qué come la ardilla en el bosque?',
          pista: 'Viene de un árbol.',
          opciones: [
            { id: 'bellota', arte: 'bellota', nombre: 'la bellota' },
            { id: 'dulce', arte: 'dulce', nombre: 'el dulce' },
            { id: 'papitas', arte: 'residuo-frituras', nombre: 'las papitas' },
          ],
          correcta: 'bellota',
          conTexto: true,
        },
        {
          // A2, A7, A8, A12
          tipo: 'parejas',
          id: 'u2-l3-e3',
          consigna: 'Une a cada animal con su comida.',
          pista: 'Ninguno come dulces ni papitas.',
          pares: [
            { izquierda: { id: 'ardilla', arte: 'ardilla-feliz', nombre: 'la ardilla' }, derecha: { id: 'pina', arte: 'pina', nombre: 'las semillas de pino' } },
            { izquierda: { id: 'colibri', arte: 'colibri-feliz', nombre: 'el colibrí' }, derecha: { id: 'flores', arte: 'flores-morada', nombre: 'las flores' } },
            { izquierda: { id: 'cacomixtle', arte: 'mixtle-entero', nombre: 'el cacomixtle' }, derecha: { id: 'fruta', arte: 'fruta', nombre: 'la fruta' } },
            { izquierda: { id: 'oruga', arte: 'oruga', nombre: 'la oruga' }, derecha: { id: 'algodoncillo', arte: 'algodoncillo', nombre: 'el algodoncillo' } },
          ],
        },
        {
          // A8, A16
          tipo: 'si-no',
          id: 'u2-l3-e4',
          consigna: '¿Está bien darle dulces al colibrí?',
          pista: 'El colibrí busca flores.',
          arte: 'colibri-feliz',
          junto: 'dulce',
          respuesta: false,
          porque: 'El colibrí toma néctar de las flores y come insectos pequeños.',
        },
        {
          tipo: 'escucha-toca',
          id: 'u2-l3-e5',
          consigna: 'Toca la bellota.',
          pista: 'Tiene un gorrito café.',
          opciones: [
            { id: 'bellota', arte: 'bellota', nombre: 'la bellota' },
            { id: 'pina', arte: 'pina', nombre: 'la piña de pino' },
            { id: 'dulce', arte: 'dulce', nombre: 'el dulce' },
          ],
          correcta: 'bellota',
        },
        {
          // A16
          tipo: 'encuentra-error',
          id: 'u2-l3-e6',
          consigna: 'Toca la comida que no es para los animales.',
          pista: 'Busca lo que viene en envoltura.',
          // Lugares medidos (v3.1.1): en un celular, cada objeto se toca en 48 px y ninguno se encima (e2e/encuentra.spec.ts).
          escena: 'parque',
          objetos: [
            { id: 'dulce', arte: 'dulce', nombre: 'el dulce', x: 27, y: 85, ancho: 9, mal: true },
            { id: 'papitas', arte: 'residuo-frituras', nombre: 'las papitas', x: 44, y: 85, ancho: 8, mal: true },
            { id: 'bellota', arte: 'bellota', nombre: 'la bellota', x: 61, y: 86, ancho: 7, mal: false },
            { id: 'ardilla', arte: 'ardilla-feliz', nombre: 'la ardilla', x: 78, y: 84, ancho: 10, mal: false },
            { id: 'flores', arte: 'flores-naranja', nombre: 'las flores', x: 10, y: 82, ancho: 10, mal: false },
          ],
        },
      ],
    },
    {
      id: 'u2-l4',
      titulo: 'Vecinos de Toluca',
      arte: 'mariposa-feliz',
      bienvenida: 'Los animales de Toluca son nuestros vecinos. ¡Vamos a cuidarlos!',
      ejercicios: [
        {
          tipo: 'escucha-toca',
          id: 'u2-l4-e1',
          consigna: 'Toca a la mariposa monarca.',
          pista: 'Tiene alas naranjas con líneas negras.',
          opciones: [
            { id: 'monarca', arte: 'mariposa-feliz', nombre: 'la mariposa monarca' },
            { id: 'oruga', arte: 'oruga', nombre: 'la oruga' },
            { id: 'colibri', arte: 'colibri-feliz', nombre: 'el colibrí' },
          ],
          correcta: 'monarca',
        },
        {
          // A11, A13
          tipo: 'si-no',
          id: 'u2-l4-e2',
          consigna: '¿Las mariposas monarca vienen a pasar el invierno a los bosques del Estado de México?',
          pista: 'Vienen desde muy lejos.',
          arte: 'mariposa-feliz',
          respuesta: true,
          porque: 'Muchas vuelan miles de kilómetros desde Canadá y Estados Unidos.',
        },
        {
          // A14
          tipo: 'elige-imagen',
          id: 'u2-l4-e3',
          consigna: '¿Quién vive en los arroyos del Nevado de Toluca?',
          pista: 'Tiene branquias rosas, como plumitas.',
          opciones: [
            { id: 'ajolote', arte: 'ajolote', nombre: 'el ajolote de montaña' },
            { id: 'ardilla', arte: 'ardilla-feliz', nombre: 'la ardilla' },
            { id: 'colibri', arte: 'colibri-feliz', nombre: 'el colibrí' },
          ],
          correcta: 'ajolote',
          conTexto: true,
        },
        {
          // A5
          tipo: 'si-no',
          id: 'u2-l4-e4',
          consigna: '¿La mamá tlacuache lleva a sus bebés en una bolsa de su panza?',
          pista: 'Tiene una bolsa, como el canguro.',
          arte: 'tlacuache',
          respuesta: true,
          porque: 'Y cuando crecen, los carga en la espalda.',
        },
        {
          // A18
          tipo: 'si-no',
          id: 'u2-l4-e5',
          consigna: '¿Está bien perseguir a los animales para tocarlos?',
          pista: 'Los animales del parque son silvestres.',
          arte: 'ardilla-feliz',
          respuesta: false,
          porque: 'Es mejor mirarlos con calma, desde lejos.',
        },
        {
          // B3, A19, A20
          tipo: 'parejas',
          id: 'u2-l4-e6',
          consigna: 'Une a cada animal con el lugar donde vive.',
          pista: 'Piensa dónde lo has visto.',
          pares: [
            { izquierda: { id: 'ardilla', arte: 'ardilla-feliz', nombre: 'la ardilla' }, derecha: { id: 'arbol', arte: 'arbol', nombre: 'el árbol' } },
            { izquierda: { id: 'colibri', arte: 'colibri-feliz', nombre: 'el colibrí' }, derecha: { id: 'nido', arte: 'nido', nombre: 'el nido' } },
            { izquierda: { id: 'oruga', arte: 'oruga', nombre: 'la oruga' }, derecha: { id: 'algodoncillo', arte: 'algodoncillo', nombre: 'el algodoncillo' } },
          ],
        },
      ],
    },
  ],
};

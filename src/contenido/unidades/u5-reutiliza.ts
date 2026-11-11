import type { Unidad } from '../tipos';

/*
 * Unidad 5 — Reduce y reutiliza.
 * TODO(Eco Urban): validar consignas, pistas y datos con las educadoras y educadores.
 * Fuentes de cada dato: docs/fuentes-contenido.md (D1–D4, D9, A5). Los comentarios dicen qué fila respalda cada dato.
 */
export const U5: Unidad = {
  id: 'u5',
  numero: 5,
  titulo: 'Reduce y reutiliza',
  tema: 'Hacemos menos basura: botella y lonchera reutilizables, y una segunda vida para las cosas.',
  color: '#B84A14',
  cofreTrasLeccion: 1,
  estampa: {
    id: 'tlacuache',
    arte: 'tlacuache',
    nombre: 'El tlacuache',
    // A5
    dato: 'La mamá tlacuache lleva a sus bebés en una bolsa de su panza y, cuando crecen, en la espalda.',
  },
  aventura: { id: 'u5-aventura', titulo: 'Mi lonchera sin basura', arte: 'lonchera' },
  lecciones: [
    {
      id: 'u5-l1',
      titulo: 'Mi botella y mi lonchera',
      arte: 'lonchera',
      bienvenida: '¡Vamos a armar una lonchera que no deja basura!',
      ejercicios: [
        {
          tipo: 'escucha-toca',
          id: 'u5-l1-e1',
          consigna: 'Toca la botella que se usa muchas veces.',
          pista: 'Es verde y tiene tapa.',
          opciones: [
            { id: 'reutilizable', arte: 'botella-reutilizable', nombre: 'la botella que se rellena' },
            { id: 'desechable', arte: 'residuo-botella', nombre: 'la botella desechable' },
            { id: 'vaso', arte: 'vaso-desechable', nombre: 'el vaso desechable' },
          ],
          correcta: 'reutilizable',
        },
        {
          // D1
          tipo: 'si-no',
          id: 'u5-l1-e2',
          consigna: 'Si usas tu propia botella, ¿tiras menos botellas de plástico?',
          pista: 'Tu botella se rellena muchas veces.',
          arte: 'botella-reutilizable',
          respuesta: true,
          porque: 'La rellenas muchas veces y no se vuelve basura.',
        },
        {
          tipo: 'elige-imagen',
          id: 'u5-l1-e3',
          consigna: '¿Cuál va en una lonchera sin basura?',
          pista: 'Se lava y se usa otra vez.',
          opciones: [
            { id: 'recipiente', arte: 'recipiente', nombre: 'el recipiente con fruta' },
            { id: 'papitas', arte: 'residuo-frituras', nombre: 'las papitas en bolsita' },
            { id: 'bolsa', arte: 'bolsa-plastico', nombre: 'la bolsa de plástico' },
          ],
          correcta: 'recipiente',
          conTexto: true,
        },
        {
          tipo: 'parejas',
          id: 'u5-l1-e4',
          consigna: 'Une cada desechable con lo que se usa muchas veces.',
          pista: 'Busca el que hace lo mismo y se lava.',
          pares: [
            { izquierda: { id: 'botella', arte: 'residuo-botella', nombre: 'la botella desechable' }, derecha: { id: 'botella-reutilizable', arte: 'botella-reutilizable', nombre: 'la botella que se rellena' } },
            { izquierda: { id: 'vaso', arte: 'vaso-desechable', nombre: 'el vaso desechable' }, derecha: { id: 'taza', arte: 'taza', nombre: 'la taza' } },
            { izquierda: { id: 'tenedor', arte: 'tenedor-plastico', nombre: 'el tenedor de plástico' }, derecha: { id: 'cuchara', arte: 'cuchara', nombre: 'la cuchara de metal' } },
            { izquierda: { id: 'bolsa', arte: 'bolsa-plastico', nombre: 'la bolsa de plástico' }, derecha: { id: 'lonchera', arte: 'lonchera', nombre: 'la lonchera' } },
          ],
        },
        {
          tipo: 'escucha-toca',
          id: 'u5-l1-e5',
          consigna: 'Toca la servilleta de tela.',
          pista: 'Tiene cuadritos y se lava.',
          opciones: [
            { id: 'tela', arte: 'servilleta-tela', nombre: 'la servilleta de tela' },
            { id: 'papel', arte: 'residuo-servilleta', nombre: 'la servilleta de papel' },
            { id: 'playera', arte: 'playera', nombre: 'la playera' },
          ],
          correcta: 'tela',
        },
        {
          tipo: 'si-no',
          id: 'u5-l1-e6',
          consigna: '¿La servilleta de tela se puede lavar y usar otra vez?',
          pista: 'La tela se lava.',
          arte: 'servilleta-tela',
          respuesta: true,
          porque: 'Así no se vuelve basura.',
        },
      ],
    },
    {
      id: 'u5-l2',
      titulo: 'Menos desechables',
      arte: 'vaso-desechable',
      bienvenida: 'En la escuela también podemos hacer menos basura.',
      ejercicios: [
        {
          // D2
          tipo: 'si-no',
          id: 'u5-l2-e1',
          consigna: 'Un popote se usa unos minutos. ¿Su plástico dura muchísimos años?',
          pista: 'El plástico tarda mucho en desaparecer.',
          arte: 'residuo-popote',
          respuesta: true,
          porque: 'Por eso es mejor tomar sin popote.',
        },
        {
          tipo: 'elige-imagen',
          id: 'u5-l2-e2',
          consigna: '¿Con cuál tomas agua sin hacer basura?',
          pista: 'Se lava y se usa otra vez.',
          opciones: [
            { id: 'taza', arte: 'taza', nombre: 'la taza' },
            { id: 'vaso', arte: 'vaso-desechable', nombre: 'el vaso desechable' },
            { id: 'jugo', arte: 'residuo-jugo', nombre: 'la cajita de jugo' },
          ],
          correcta: 'taza',
          conTexto: true,
        },
        {
          tipo: 'encuentra-error',
          id: 'u5-l2-e3',
          consigna: 'Toca lo que se usa una vez y se tira.',
          pista: 'Busca el vaso, el tenedor y la bolsa.',
          // Lugares medidos (v3.1.1): en un celular, cada objeto se toca en 48 px y ninguno se encima (e2e/encuentra.spec.ts).
          escena: 'parque',
          objetos: [
            { id: 'vaso', arte: 'vaso-desechable', nombre: 'el vaso desechable', x: 10, y: 84, ancho: 8, mal: true },
            { id: 'tenedor', arte: 'tenedor-plastico', nombre: 'el tenedor de plástico', x: 44, y: 86, ancho: 7, mal: true },
            { id: 'bolsa', arte: 'bolsa-plastico', nombre: 'la bolsa de plástico', x: 61, y: 84, ancho: 9, mal: true },
            { id: 'lonchera', arte: 'lonchera', nombre: 'la lonchera', x: 27, y: 80, ancho: 10, mal: false },
            { id: 'botella', arte: 'botella-reutilizable', nombre: 'la botella que se rellena', x: 78, y: 82, ancho: 7, mal: false },
          ],
        },
        {
          tipo: 'al-bote',
          id: 'u5-l2-e4',
          consigna: 'Separa la basura del recreo.',
          pista: 'Mira el dibujo de cada bote.',
          residuos: ['jugo', 'frituras', 'manzana'],
        },
        {
          tipo: 'escucha-toca',
          id: 'u5-l2-e5',
          consigna: 'Toca la cuchara de metal.',
          pista: 'Es gris y brilla.',
          opciones: [
            { id: 'cuchara', arte: 'cuchara', nombre: 'la cuchara de metal' },
            { id: 'tenedor', arte: 'tenedor-plastico', nombre: 'el tenedor de plástico' },
            { id: 'frasco', arte: 'frasco', nombre: 'el frasco' },
          ],
          correcta: 'cuchara',
        },
        {
          // D2
          tipo: 'si-no',
          id: 'u5-l2-e6',
          consigna: '¿Está bien pedir una bolsa de plástico para todo?',
          pista: 'La bolsa se usa una vez y se tira.',
          arte: 'bolsa-plastico',
          respuesta: false,
          porque: 'Mejor llevar una bolsa o mochila que se use muchas veces.',
        },
      ],
    },
    {
      id: 'u5-l3',
      titulo: 'Una segunda vida',
      arte: 'frasco',
      bienvenida: 'Antes de tirar algo, ¡piensa si le puedes dar otra vida!',
      ejercicios: [
        {
          // D3, D4
          tipo: 'parejas',
          id: 'u5-l3-e1',
          consigna: 'Une cada cosa con su segunda vida.',
          pista: 'Piensa para qué más puede servir.',
          pares: [
            { izquierda: { id: 'frasco', arte: 'frasco', nombre: 'el frasco' }, derecha: { id: 'lapicero', arte: 'frasco-lapices', nombre: 'el lapicero' } },
            { izquierda: { id: 'lata', arte: 'residuo-lata', nombre: 'la lata' }, derecha: { id: 'maceta', arte: 'lata-maceta', nombre: 'la maceta' } },
            { izquierda: { id: 'platano', arte: 'residuo-platano', nombre: 'la cáscara de plátano' }, derecha: { id: 'composta', arte: 'composta', nombre: 'la composta' } },
          ],
        },
        {
          // D3
          tipo: 'si-no',
          id: 'u5-l3-e2',
          consigna: '¿Un frasco vacío puede servir para guardar lápices?',
          pista: 'Mira el lapicero.',
          arte: 'frasco-lapices',
          respuesta: true,
          porque: 'Así le das una segunda vida y hay menos basura.',
        },
        {
          tipo: 'elige-imagen',
          id: 'u5-l3-e3',
          consigna: '¿Cuál puedes volver a usar como maceta?',
          pista: 'Es de metal y tiene forma de vaso.',
          opciones: [
            { id: 'lata', arte: 'residuo-lata', nombre: 'la lata' },
            { id: 'servilleta', arte: 'residuo-servilleta', nombre: 'la servilleta usada' },
            { id: 'frituras', arte: 'residuo-frituras', nombre: 'la envoltura de frituras' },
          ],
          correcta: 'lata',
          conTexto: true,
        },
        {
          tipo: 'ordena',
          id: 'u5-l3-e4',
          consigna: 'Ordena cómo la lata se vuelve maceta.',
          pista: 'Al final, la planta crece en la lata.',
          pasos: [
            { id: 'lata', arte: 'residuo-lata', nombre: 'la lata vacía' },
            { id: 'tierra', arte: 'composta', nombre: 'la tierra' },
            { id: 'maceta', arte: 'lata-maceta', nombre: 'la maceta con su planta' },
          ],
        },
        {
          tipo: 'escucha-toca',
          id: 'u5-l3-e5',
          consigna: 'Toca el frasco.',
          pista: 'Es de vidrio y tiene tapa.',
          opciones: [
            { id: 'frasco', arte: 'frasco', nombre: 'el frasco' },
            { id: 'botella', arte: 'residuo-botella', nombre: 'la botella' },
            { id: 'taza', arte: 'taza', nombre: 'la taza' },
          ],
          correcta: 'frasco',
        },
        {
          // D3
          tipo: 'si-no',
          id: 'u5-l3-e6',
          consigna: 'Antes de tirar algo, ¿hay que pensar si se puede usar otra vez?',
          pista: 'Muchas cosas tienen otra vida.',
          arte: 'frasco',
          respuesta: true,
          porque: 'Reutilizar es darle una segunda vida.',
        },
      ],
    },
    {
      id: 'u5-l4',
      titulo: 'Menos basura',
      arte: 'botella-reutilizable',
      bienvenida: '¡Vamos a repasar todo lo que aprendimos!',
      ejercicios: [
        {
          // D1
          tipo: 'elige-imagen',
          id: 'u5-l4-e1',
          consigna: '¿Qué hace menos basura?',
          pista: 'La que se rellena.',
          opciones: [
            { id: 'mi-botella', arte: 'botella-reutilizable', nombre: 'llevar mi botella' },
            { id: 'comprar', arte: 'residuo-botella', nombre: 'comprar una botella cada día' },
          ],
          correcta: 'mi-botella',
          conTexto: true,
        },
        {
          tipo: 'al-bote',
          id: 'u5-l4-e2',
          consigna: 'Lo que no se pudo reutilizar, sepáralo.',
          pista: 'Mira el dibujo de cada bote.',
          residuos: ['botella', 'huevo', 'servilleta'],
        },
        {
          tipo: 'si-no',
          id: 'u5-l4-e3',
          consigna: '¿Usar los dos lados de la hoja ayuda a hacer menos basura?',
          pista: 'Así la hoja dura el doble.',
          arte: 'cuaderno',
          respuesta: true,
          porque: 'Así usamos menos papel.',
        },
        {
          // D3, D4, D5
          tipo: 'parejas',
          id: 'u5-l4-e4',
          consigna: 'Une cada cosa con lo que hacemos con ella.',
          pista: 'Cada una tiene su camino.',
          pares: [
            { izquierda: { id: 'platano', arte: 'residuo-platano', nombre: 'la cáscara' }, derecha: { id: 'composta', arte: 'composta', nombre: 'hacer composta' } },
            { izquierda: { id: 'lata', arte: 'residuo-lata', nombre: 'la lata' }, derecha: { id: 'reciclar', arte: 'bote-reciclable', nombre: 'reciclarla' } },
            { izquierda: { id: 'frasco', arte: 'frasco', nombre: 'el frasco' }, derecha: { id: 'reutilizar', arte: 'frasco-lapices', nombre: 'reutilizarlo' } },
          ],
        },
        {
          tipo: 'escucha-toca',
          id: 'u5-l4-e5',
          consigna: 'Toca la lonchera.',
          pista: 'Es morada y tiene asa.',
          opciones: [
            { id: 'lonchera', arte: 'lonchera', nombre: 'la lonchera' },
            { id: 'recipiente', arte: 'recipiente', nombre: 'el recipiente' },
            { id: 'bolsa', arte: 'bolsa-plastico', nombre: 'la bolsa' },
          ],
          correcta: 'lonchera',
        },
        {
          tipo: 'encuentra-error',
          id: 'u5-l4-e6',
          consigna: 'Toca lo que se vuelve basura en un solo uso.',
          pista: 'Busca lo que se usa una vez y se tira.',
          // Lugares medidos (v3.1.1): en un celular, cada objeto se toca en 48 px y ninguno se encima (e2e/encuentra.spec.ts).
          escena: 'parque',
          objetos: [
            { id: 'vaso', arte: 'vaso-desechable', nombre: 'el vaso desechable', x: 10, y: 84, ancho: 8, mal: true },
            { id: 'popote', arte: 'residuo-popote', nombre: 'el popote', x: 44, y: 86, ancho: 7, mal: true },
            { id: 'frituras', arte: 'residuo-frituras', nombre: 'la envoltura de frituras', x: 61, y: 85, ancho: 8, mal: true },
            { id: 'lonchera', arte: 'lonchera', nombre: 'la lonchera', x: 27, y: 80, ancho: 10, mal: false },
            { id: 'taza', arte: 'taza', nombre: 'la taza', x: 78, y: 82, ancho: 8, mal: false },
          ],
        },
      ],
    },
  ],
};

import type { Locucion } from '../voz/locucion';

/*
 * Lo que dice Mixtle (y lo que se lee) en las pantallas de la app: grupos, camino, lecciones,
 * cofres y álbum. Todo se narra; npm run voz:generar lo junta solo.
 * TODO(Eco Urban): revisar redacción con las educadoras y educadores.
 */
export const TEXTOS_APP = {
  inicio: {
    /** La frase de Mixtle (marca): la dice al tocar "¡Jugar!". */
    /** Indicio mientras el navegador aún no deja sonar nada (no se narra: no hay audio todavía). */
    tocaParaEmpezar: 'Toca la pantalla para escuchar',
    /** Aviso cuando hay una versión nueva y la página no se recargó sola (no se narra). */
    versionNueva: 'Hay una versión nueva. Toca para actualizar',
    alRescate: '¡Al rescate!',
  },
  grupos: {
    titulo: '¿Quién va a jugar?',
    bienvenida: '¿Quién va a jugar? Elijan su grupo o creen uno nuevo.',
    nuevo: 'Nuevo grupo',
    crear: 'Elijan un animal y un color para su grupo.',
    etiqueta: 'Etiqueta (opcional), por ejemplo 1°A',
    aviso: 'No escriban nombres de niñas ni niños.',
    listo: '¡Listo!',
    cancelar: 'Cancelar',
    soloAqui: 'El avance de cada grupo se guarda solo en este aparato.',
    sinGuardar: 'Este aparato no deja guardar: el avance se perderá al cerrar.',
  },
  camino: {
    hola: (mascota: string) => `¡Hola, grupo ${mascota}! Toquen la lección que señalo.`,
    terminaron: '¡Terminaron todo el camino! El parque está lleno de vida.',
    unidad: 'Unidad',
    encabezadoUnidad: (numero: number, titulo: string) => `Unidad ${numero}: ${titulo}.`,
    hojitas: 'Hojitas',
    /** Título del parque del grupo, arriba del camino. */
    suParque: (grupo: string) => `El parque de ${grupo}`,
    dias: 'Días jugados',
    album: 'Álbum',
    cambiarGrupo: 'Cambiar de grupo',
    bloqueada: 'Primero terminen la lección anterior.',
    aventura: (titulo: string) => `¡Aventura! ${titulo}.`,
  },
  cofre: {
    // Lo que trae el cofre se dice desde antes: la sorpresa está en la animación, no en el premio.
    llegaron: (hojitas: number): Locucion => ['¡Un cofre! Trae', { numero: hojitas, antesDeSustantivo: true }, 'hojitas. Tóquenlo para abrirlo.'],
    abierto: (hojitas: number): Locucion => ['¡Ganaron', { numero: hojitas, antesDeSustantivo: true }, 'hojitas!'],
    trae: 'Trae',
    titulo: '¡Un cofre!',
    abrir: 'Abrir',
    seguir: '¡Sigamos!',
  },
  leccion: {
    animos: ['¡Muy bien!', '¡Excelente!', '¡Eso es!', '¡Bravo!', '¡Así se hace!', '¡Lo lograron!'],
    intentar: 'Intentar otra vez',
    seguir: '¡Sigamos!',
    salir: 'Salir',
    salirPregunta: '¿Quieren salir de la lección? Pueden volver cuando quieran.',
    salirSi: 'Sí, salir',
    salirNo: 'No, seguir jugando',
    repaso: 'Vamos a repasar uno que costó trabajo.',
    terminada: (hojitas: number, aLaPrimera: number, total: number): Locucion =>
      // Sin "cero de seis": si nada salió a la primera, Mixtle anima en lugar de contar.
      aLaPrimera === 0
        ? ['¡Lección terminada! Ganaron', { numero: hojitas, antesDeSustantivo: true }, 'hojitas. ¡Practicando, cada vez les sale mejor!']
        : [
            '¡Lección terminada! Ganaron',
            { numero: hojitas, antesDeSustantivo: true },
            'hojitas, y',
            { numero: aLaPrimera },
            'de',
            { numero: total, antesDeSustantivo: true },
            aLaPrimera === 1 ? 'ejercicios salió a la primera.' : 'ejercicios salieron a la primera.',
          ],
    parqueCrece: '¡Miren cómo crece su parque!',
    /** Racha dentro de la lección (en pantalla con número; Mixtle lo dice con palabras). */
    racha: (n: number) => `¡${n} seguidas!`,
    rachaDicha: { 3: '¡Tres seguidas!', 5: '¡Cinco seguidas!', 7: '¡Siete seguidas!', 10: '¡Diez seguidas!' } as Record<number, string>,
    mitad: '¡Ya van a la mitad! ¡Vamos!',
    antes: 'Antes',
    ahora: '¡Ahora!',
    hojitas: 'Hojitas del grupo',
    tituloFin: '¡Lección terminada!',
    aLaPrimera: (n: number, total: number) => `${n} de ${total} a la primera`,
    alCamino: 'Volver al camino',
    escucharOtraVez: 'Escuchar otra vez',
    siEstaBien: 'Sí, está bien',
    noEstaBien: 'No está bien',
  },
  vestidor: {
    titulo: 'Vestidor',
    hola: (mascota: string) => `¿Qué le ponemos a su ${mascota.toLowerCase()}? Cada cosa cuesta hojitas.`,
    comprada: '¡Le queda muy bien!',
    faltan: 'Junten más hojitas en las lecciones para comprarla.',
    comprar: 'Comprar',
    /** Antes de gastar (narrado): qué se compra y cuánto cuesta, para decidirlo juntos. */
    confirmar: (cosa: string, precio: number): Locucion => [`¿Compran ${cosa} por`, { numero: precio }, 'hojitas?'],
    confirmarSi: 'Sí, comprar',
    confirmarNo: 'No, todavía no',
    ponerse: 'Ponérsela',
    quitarse: 'Quitársela',
    faltanCuantas: (n: number) => `¡Junten ${n} más!`,
    disponibles: 'Hojitas para gastar',
    cerrar: '¡Listo!',
  },
  unidad: {
    /** Fin de unidad (narrado): el número va en palabras para que Mixtle lo diga de corrido. */
    terminada: (numero: number) => `¡Terminaron la unidad ${['', 'uno', 'dos', 'tres', 'cuatro', 'cinco'][numero] ?? numero}! Aquí está su diploma.`,
    titulo: (numero: number) => `¡Unidad ${numero} terminada!`,
    verDiploma: 'Ver su diploma',
  },
  diploma: {
    titulo: 'Diploma',
    para: 'Para todo el grupo',
    porque: 'por terminar la unidad',
    lecciones: (n: number) => (n === 1 ? 'lección' : 'lecciones'),
    hojitas: 'hojitas',
    aLaPrimera: 'a la primera',
    firma: 'Mixtle, guardián del parque',
    imprimir: 'Imprimir',
    cerrar: 'Cerrar',
  },
  album: {
    titulo: 'Álbum de animales de Toluca',
    bienvenida: 'Cada unidad que terminen les da una estampa nueva.',
    bloqueada: 'Terminen una unidad para ganar esta estampa.',
    nueva: (nombre: string) => `¡Ganaron una estampa nueva: ${nombre}!`,
    diploma: 'Diploma',
  },
  facilitador: {
    titulo: 'Modo facilitador',
    reiniciar: 'Reiniciar este grupo',
    reiniciarConfirmar: '¿Seguro? Se borra todo el avance de este grupo en este aparato.',
    desbloquear: 'Desbloquear todas las lecciones',
    proyector: 'Modo proyector (todo más grande)',
    suave: 'Animaciones suaves (menos movimiento)',
    cerrar: 'Cerrar',
    ayuda: 'Mantén presionado el logo 3 segundos para abrir este panel.',
    recorrido: 'Ver otra vez el recorrido por el juego',
    demo: 'Crear grupo de demostración',
    demoAyuda: 'Un grupo "Demo" con las 5 unidades terminadas, para enseñar el juego. No toca a los demás grupos.',
    borrar: 'Borrar este grupo',
    borrarConfirmar: '¿Seguro? Se borra el grupo con todo su avance de este aparato.',
    /** Estado de la descarga para usar sin internet (voces, música y efectos). */
    sinInternet: {
      listo: 'Listo para usar sin internet',
      descargando: (n: number) => `Descargando para usar sin internet: ${n} %`,
      esperando: 'La descarga para usar sin internet empieza en un momento',
      sinConexion: (n: number) => `Sin conexión: va en ${n} % la descarga para usar sin internet (sigue al volver la conexión)`,
      noDisponible: 'Este navegador no permite guardar el juego para usar sin internet',
    },
  },
  recorrido: {
    etiqueta: 'Recorrido por el juego',
    saltar: 'Saltar',
    siguiente: 'Siguiente',
    atras: 'Atrás',
    listo: '¡A jugar!',
    paso: (n: number, total: number) => `${n} de ${total}`,
    /** Lo que dice Mixtle en cada paso (narrado). */
    dice: {
      hola: '¡Hola! Les enseño para qué sirve cada cosa del juego. Si ya lo saben, toquen «Saltar».',
      siguienteLeccion: 'Este es su camino. Lo que brilla es su siguiente parada. ¡Tóquenla para jugar!',
      parque: 'Este es su parque. Cada lección que terminan lo llena de vida.',
      hojitas: 'Aquí se juntan sus hojitas. Las ganan al jugar.',
      dias: 'Aquí se cuentan los días que han jugado.',
      album: 'En el álbum están las estampas de animales que ganan al terminar cada unidad.',
      vestidor: 'En el vestidor le compran cosas a su mascota con sus hojitas.',
      cambiarGrupo: 'Con la casita regresan a elegir su grupo.',
      sistema: 'Con estos botones ponen la pantalla completa y apagan o encienden la música y mi voz.',
      fin: '¡Listo! Ya saben cómo funciona. ¡A jugar!',
    },
    /** Sin pantalla completa (algunas tablets no la permiten), el paso de los botones no la menciona. */
    sistemaSinPantalla: 'Con estos botones apagan o encienden la música y mi voz.',
  },
} as const;

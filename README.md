# Mixtle al rescate

Videojuego educativo para **Eco Urban A.C.** (Toluca, Estado de México), hecho para el programa *Escuelas Comprometidas con el Medio Ambiente*.

Mixtle, un cacomixtle que vive en los árboles del parque, guía a cada grupo de salón por un **camino de aprendizaje** con cinco unidades: *Separa tu basura*, *Los animales del parque*, *Árboles y áreas verdes*, *Aire limpio* y *Reduce y reutiliza*. Son 20 lecciones (4 por unidad) de unos 3 minutos y cada unidad termina con una **aventura** (un minijuego) y una **estampa** para el álbum.

- **Para quién:** niñas y niños de 1º a 3º de primaria (6 a 8 años). Mixtle narra todo en voz alta; el texto acompaña, pero no hace falta saber leer.
- **Dónde se juega:** en la laptop de Eco Urban proyectada en el salón (todo el grupo participa) o en tablets táctiles. Después de la primera visita funciona **sin internet**.
- **Dónde jugarlo:** <https://mixtle.org>, la dirección oficial de Eco Urban. Mientras se termina de conectar, el juego sigue en su dirección anterior, que pasa sola los grupos de cada aparato a mixtle.org en cuanto esa dirección esté lista (ver [`docs/traspaso.md`](docs/traspaso.md)).
- **Qué es:** un prototipo jugable, completo de principio a fin, listo para probarse con un grupo real. No tiene servidor, cuentas ni analítica: el avance de cada grupo se guarda solo en el aparato donde juega.
- **Versión entregada:** la etiqueta de git `v3-demo` es la versión que Eco Urban vio y aprobó el 30 de octubre de 2026; lo que vino después son cierres menores (ver [`CHANGELOG.md`](CHANGELOG.md)).

![Inicio de Mixtle al rescate](docs/capturas/proyector-1920x1080-v3-1-inicio.png)

**Tráiler (39 s):** [`docs/trailer/mixtle-al-rescate.mp4`](docs/trailer/mixtle-al-rescate.mp4). Se grabó con la voz anterior de Mixtle; la voz del juego publicado es la de Alejo (ver *Límites conocidos*).

---

## Para usarlo en el salón

**Manual de la persona facilitadora:** [`docs/Manual_del_facilitador_Mixtle_al_Rescate.docx`](docs/Manual_del_facilitador_Mixtle_al_Rescate.docx). Ahí está, paso a paso, cómo preparar la laptop o las tablets, cómo llevar una sesión y qué hacer si algo falla.

En corto:

1. **Antes del taller, con buena señal,** abre <https://mixtle.org> una vez en cada aparato y espera a que el modo facilitador diga **"Listo para usar sin internet"** (unos 28 MB; 3.8 minutos con una red lenta). Desde entonces el juego funciona sin conexión.
2. **Crea el grupo** en "¿Quién va a jugar?": un animal, un color y, si quieren, una etiqueta corta como "2°B". **Nunca se piden nombres** de niñas ni niños.
3. **El camino.** Arriba está el parque del grupo, que se llena de vida conforme avanzan; abajo, las lecciones por unidad, un cofre a la mitad y la aventura al final. La primera vez, Mixtle hace un **recorrido guiado** de la pantalla (se puede saltar).
4. **Modo facilitador:** mantén presionado el logo de Mixtle (arriba a la izquierda) 3 segundos. Ahí se puede abrir todas las lecciones para saltar a una, poner el **modo proyector** (todo más grande), las **animaciones suaves**, crear un **grupo de demostración** con todo terminado (para enseñar el juego en una reunión), reiniciar o borrar el grupo, y ver si ya está listo para usar sin internet.
5. **Al terminar una unidad** hay un **diploma imprimible** (cabe en una hoja carta o A4) y una estampa de un animal de Toluca para el álbum. Con las hojitas que ganan, el grupo le compra accesorios a su mascota en el **vestidor**.

### Las cinco unidades

| Unidad | Aventura | Estampa |
|---|---|---|
| 1. Separa tu basura | **Limpia el parque**: recoger la basura, llevar cada residuo a su bote, sembrar donde quedó limpio, y la "lluvia de basura" | Cacomixtle |
| 2. Los animales del parque | **Rescate en el parque**: liberar a los animales atrapados y separar su basura | Mariposa monarca |
| 3. Árboles y áreas verdes | **Siembra un bosquecito**: plantar seis arbolitos y regarlos hasta que crezcan | Colibrí |
| 4. Aire limpio | **En bici a la escuela**: cambiar de carril y esquivar el humo | Ajolote de montaña |
| 5. Reduce y reutiliza | **Mi lonchera sin basura**: cada cosa a la lonchera o a "Mejor no" | Tlacuache |

Cada unidad tiene 4 lecciones (20 en total) de 6 a 7 ejercicios, con siete tipos de ejercicio: **Elige la imagen**, **Al bote**, **Parejas**, **¿Sí o no?**, **Ordena los pasos**, **Encuentra el error** y **Escucha y toca** (sin texto, para quienes todavía no leen). Un error nunca castiga: Mixtle dice "¡Casi!", da una pista y el ejercicio vuelve al final para repasar.

| Camino | Acierto en una lección |
|---|---|
| ![Camino](docs/capturas/proyector-1920x1080-v3-3-camino.png) | ![Acierto](docs/capturas/proyector-1920x1080-v3-4-acierto.png) |
| **Aventura de la unidad 2** | **Diploma de unidad** |
| ![Rescate](docs/capturas/proyector-1920x1080-aventura-u2-rescate.png) | ![Diploma](docs/capturas/proyector-1920x1080-v3-7-diploma.png) |
| **Vestidor** | **El camino en la tablet** |
| ![Vestidor](docs/capturas/proyector-1920x1080-v3-8-vestidor.png) | ![Camino en tablet](docs/capturas/tablet-1024x768-v3-3-camino.png) |

---

## Lo que el juego cuida

### Privacidad y datos

- **No se guarda nada de las niñas y los niños.** Los grupos se identifican con un animal, un color y una etiqueta de hasta 8 caracteres; la pantalla pide no escribir nombres.
- El avance de cada grupo se guarda **solo en ese aparato** (IndexedDB del navegador). No viaja a ningún servidor; no hay cuentas ni analítica.
- El juego **solo descarga** (peticiones GET). Las pruebas automáticas verifican que ninguna petición envíe datos.
- **No usa la cámara ni el micrófono**, y la configuración del sitio los bloquea (`Permissions-Policy`).
- Las únicas preferencias que se recuerdan en el aparato son los botones de voz y música, el modo proyector y las animaciones suaves.

### IA responsable

- **Dónde sí hay IA: en la voz, y solo al preparar el juego.** La voz de Mixtle se genera con Azure AI Speech (voz Alejo, español de México) en la computadora de quien prepara el juego, se revisa y se guarda como mp3 en el repositorio. Es una voz sintética y así se dice; el juego no la hace pasar por una persona. Si Eco Urban prefiere una voz humana, se graba y reemplaza a la generada (ver *Cambiar la voz*).
- **Dónde no hay IA: en el juego publicado.** El sitio es estático: mientras se juega no llama a Azure ni a ningún modelo o servicio de IA. Las respuestas, pistas y recompensas son reglas escritas y probadas.
- **Sin datos de niñas y niños**, ni para jugar ni para entrenar nada (ver *Privacidad*).
- **Cómo se hizo.** El código, el arte y los textos se desarrollaron con ayuda de herramientas de inteligencia artificial para programar, bajo la dirección y revisión del equipo; el contenido educativo lo valida el equipo de Eco Urban (marcado `TODO(Eco Urban)` en los archivos).

### Diseño persuasivo responsable

El juego usa técnicas de diseño de juegos para atraer y motivar, todas orientadas a que el grupo **practique y se sienta capaz**, no a que pase más tiempo en la pantalla:

| Técnica | Dónde | Por qué es apropiada para 6 a 8 años |
|---|---|---|
| **Personaje guía** con personalidad y frase propia ("¡Al rescate!") | Mixtle en todo el juego | A esta edad aprenden mejor con un modelo cercano. Mixtle acompaña, explica y anima; nunca vende nada ni pide que vuelvan. |
| **Respuesta inmediata** a cada toque | Botones, tarjetas, aciertos | Necesitan ver que su acción tuvo efecto. Se refuerza la acción, no la repetición compulsiva; no hay sonidos de "fallo". |
| **Meta visible y avance** | El parque del grupo, la barra de la lección | Hace concreto el resultado de su esfuerzo ("estamos salvando nuestro parque") y es un logro de todo el grupo. |
| **Recompensa por esfuerzo** | Hojitas por terminar y por acertar a la primera, diploma | Se gana por practicar. Un error no quita nada; lo que costó trabajo vuelve para repasar. |
| **Racha dentro de la lección** | "¡3 seguidas!" | Celebra la concentración del momento. Si hay un error, deja de verse sin decir nada; no cruza lecciones ni días. |
| **Anticipación sin azar** | El cofre se sacude, brilla y estalla | La emoción está en la animación. Lo que trae se dice y se ve desde antes. |
| **Coleccionar** | Álbum de animales de Toluca | Completar el álbum da orgullo y enseña fauna local. Las estampas no se compran: se ganan terminando unidades. |
| **Personalización** | Vestidor de la mascota del grupo | Da sentido de pertenencia y uso a las hojitas. El precio es fijo y está a la vista, nada se pierde y no hay dinero real. |
| **Identidad local** | Ambientes con el Nevado de Toluca, portales y vitrales | Reconocer su ciudad genera orgullo y hace relevante lo que aprenden. |

**Lo que no se usa:** anuncios ni compras; premios aleatorios (el cofre siempre trae lo mismo y lo dice antes); rachas diarias que se pierdan o mensajes de culpa; temporizadores que presionen, vidas o notificaciones; tablas de posiciones o comparaciones entre grupos. Hay pruebas automáticas para varias de estas reglas.

---

## Lo que Eco Urban puede cambiar

Todo el contenido vive en archivos de datos separados de la lógica, marcados con `TODO(Eco Urban)`. Cada dato que Mixtle dice tiene su fuente en [`docs/fuentes-contenido.md`](docs/fuentes-contenido.md) (CONABIO, CONANP, SEMARNAT, CONAFOR, UNAM, UAEMéx, DOF y, para reciclaje, ECOCE y la industria responsable). El detalle completo está en [`docs/notas-tecnicas.md`](docs/notas-tecnicas.md); en corto:

- **Contenido** (textos, las 20 lecciones y sus ejercicios, datos de las estampas): `src/contenido/unidades/u1-separa.ts` … `u5-reutiliza.ts`, `src/contenido/aventuras.ts` y `src/contenido/textosApp.ts`. Los residuos y los botes (de 2 a 4 categorías) están en `src/data/`. Las pruebas automáticas revisan que el contenido siga siendo válido después de un cambio.
- **Cambiar la voz.** Hay dos caminos: (a) **otra voz de Azure** con `npm run voz:usar -- azure` y los ajustes de `voz.config.json`, y después `npm run voz:generar` (el plan gratuito de Azure alcanza para regenerar todo más de 10 veces al mes; se necesita una llave propia en `.env.local`, nunca en el repositorio); (b) **una voz humana**: `npm run voz:lista` genera `docs/frases-mixtle.csv` con todas las frases; se graban en `voz-grabaciones/` con el nombre indicado y `npm run voz:generar` las toma en lugar de la voz generada. La pronunciación de palabras sueltas ("Mixtle" suena "miks-tle") se ajusta en el diccionario de `voz.config.json` sin tocar el texto en pantalla.
- **Cambiar la música.** Las tres pistas son CC0 y están en `public/musica/`. `npm run musica:muestras` genera una página para escuchar candidatas; se elige en `scripts/musica/elegidas.json` y se instala con `npm run musica:instalar`. Hay que anotarla en `CREDITOS.md`.
- **Marca.** El logo, el ícono y la hoja de personaje de Mixtle están en `docs/marca/` y la guía en [`docs/marca.md`](docs/marca.md).

### Cómo se publica

**Traspaso a Eco Urban:** la guía paso a paso (sin conocimientos técnicos) para recibir el repositorio, publicarlo en una cuenta de Vercel de Eco Urban, conectar mixtle.org y qué pasa con los grupos de las direcciones viejas está en [`docs/traspaso.md`](docs/traspaso.md). La dirección del juego se cambia en un solo lugar: `src/sitio.ts`.

El juego es un sitio estático desplegado en **Vercel** desde este repositorio: **cada cambio que llega a la rama `main` se publica solo en producción** (<https://mixtle.org>) en uno o dos minutos; cada rama o *pull request* genera una versión de prueba con su propia dirección. Las laptops y tablets que ya tienen el juego reciben la versión nueva sin perder los grupos: se actualizan solas al volver a una pantalla segura (nunca a media lección), y si no, el inicio muestra "Hay una versión nueva. Toca para actualizar". **Nunca "Borrar datos del sitio"** desde el navegador: eso borra los grupos y su avance.

Para volver a una versión anterior hay dos formas: *Instant Rollback* en el panel de Vercel, o con git `git revert --no-commit v3-demo..main && git commit && git push`. La integración continua (`.github/workflows/ci.yml`) revisa tipos, lint, pruebas y build en Ubuntu y Windows, y después los recorridos en el navegador.

---

## Resultados medidos y pruebas

Medido entre el 27 y el 30 de octubre de 2026 en una laptop de 8 GB (Intel Core i5-10210U) y en el sitio publicado. Los archivos completos están en [`docs/mediciones/`](docs/mediciones/) y el método, en [`docs/notas-tecnicas.md`](docs/notas-tecnicas.md).

| Qué | Resultado |
|---|---|
| Lo que se descarga antes de la primera pantalla | **240.4 KB** comprimidos (límite 250 KB, vigilado por `npm run presupuesto`) |
| Cuadros por segundo con tarjeta de video | **59–60 fps** en los momentos más pesados, a 1920×1080 y 1024×768 |
| Equipos sin aceleración por tarjeta de video | 11–33 fps con todo; el juego lo detecta y pasa solo a las **animaciones suaves: 57–60 fps** |
| "¡Jugar!" → "¿Quién va a jugar?" con red lenta (Slow 4G), primera visita | **0.35–0.38 s** (antes de optimizar: 5.2 s) |
| "Listo para usar sin internet" con Slow 4G, en producción | **3.8 min** (845 archivos, 28 MB, en segundo plano sin estorbar) |
| Voz | 798 frases con audio grabado, 25 MB; el silencio dentro de los audios bajó de 30 % a 16 % |
| Diploma | Se imprime en una sola hoja, carta y A4 |
| Pruebas unitarias (Vitest) | **1499 pruebas en 43 archivos, todas pasan** (contenido válido, voz completa, camino y grupos, arte de Mixtle, música, aventuras, privacidad de la llave) |
| Recorridos en el navegador (Playwright) | **58 de 58 pasan contra producción** (30 de octubre de 2026): aventuras completas, lección con error, parque que crece, avance guardado, botones de 64 px, vestidor, modo facilitador, ninguna petición que envíe datos, en 1920×1080 y 1024×768 táctil |

`npm run verificar` corre tipos, lint, pruebas unitarias, build y presupuesto de golpe; `npm run test:e2e` corre los recorridos en el navegador (contra producción: `$env:BASE_URL="https://mixtle.org"; npm run test:e2e`). `npm run mudanza:probar` prueba en el navegador la mudanza de una dirección vieja a la definitiva, con dos direcciones locales.

---

## Límites conocidos

- **El contenido lo debe revisar el equipo educativo de Eco Urban.** Los datos tienen fuente verificada, pero la redacción para cada grado, las **categorías de separación de Toluca** y la ley citada sobre quemar basura necesitan su visto bueno (todo marcado `TODO(Eco Urban)`).
- **No se ha probado con niñas y niños** ni en un iPad real con Safari. Se probó con Chrome en Windows, también con emulación táctil a 1024×768.
- **El avance vive en un solo aparato.** Si se borran los datos del navegador o se cambia de laptop, el grupo empieza de nuevo. Es a propósito (no hay servidor ni cuentas).
- **La voz es sintética** (Alejo, de Azure). Suena natural, pero alguna palabra puede sonar rara; se corrige con el diccionario de pronunciación o grabando una voz humana. Falta que Eco Urban confirme que le gusta esta voz.
- **El tráiler tiene la voz anterior de Mixtle**; no se volvió a grabar.
- **La primera visita necesita internet** (unos 28 MB en segundo plano). Conviene abrir el juego una vez con buena señal antes del taller.
- **Por confirmar con Eco Urban:** los precios de los accesorios del vestidor, que los ambientes de cada unidad se sientan "de Toluca" y la frase de Mixtle ("¡Al rescate!").

## Siguiente paso recomendado

**Un piloto con un grupo real** de 1º a 3º en una escuela del programa, con la laptop proyectada y, si se puede, una tablet por equipo: una sesión completa de la unidad 1 (lección, cofre, aventura, diploma). Qué observar: si entienden las consignas solo con la voz, si los toques bastan en la tablet, cuánto dura de verdad una lección (se estimó en ~3 min), qué palabras de Alejo suenan raras y si la persona facilitadora encuentra sola el modo facilitador. Con eso, el equipo educativo ajusta la redacción y se decide si se graba una voz humana.

---

## Licencia y créditos

**Eco Urban puede usar, copiar, modificar, mejorar y compartir este juego como quiera**, con o sin cambios, con o sin cobrar, sin pedir permiso: el trabajo se hizo para Eco Urban. Lo único que pide la licencia es conservar el aviso de autoría. Formalmente es la **licencia MIT**, para todo el proyecto (código, textos y arte originales), a nombre de Valentina Jaymes Juárez, Mary Jose Galán Gordillo, Ana Sofía Luna Gómez, René Emiliano Cano Fuentes y Sophie Alejandra Mendoza Guadarrama, estudiantes del Tecnológico de Monterrey, Campus Toluca, para Eco Urban A.C. El texto completo está en [`LICENSE`](LICENSE).

Los recursos de terceros conservan su propia licencia y están listados con autor, fuente y enlace en [`CREDITOS.md`](CREDITOS.md): la música es CC0, las tipografías Nunito y Baloo 2 son OFL-1.1, las bibliotecas son MIT o Apache-2.0 y la voz generada con Azure AI Speech se rige por los términos de ese servicio. El arte es original de este proyecto (ilustraciones SVG hechas en código), los efectos de sonido se sintetizan con scripts propios, la voz se genera con Azure AI Speech y la música es CC0. La tipografía es Nunito y Baloo 2 (OFL-1.1). Las bibliotecas son React, Phaser, Motion, Zustand, Tailwind CSS y Howler (MIT) e idb-keyval (Apache-2.0).

---

## Para quien programe

Requisitos: [Node.js](https://nodejs.org) 22.12 o más nuevo y Chrome o Edge. Funciona en Windows, sin bash.

```powershell
npm install
npm run dev        # http://localhost:5173
npm run verificar  # tipos + lint + pruebas + build + presupuesto
```

| Comando | Qué hace |
|---|---|
| `npm run dev` / `npm run build` / `npm run preview` | Desarrollo con recarga, build en `dist/`, servir el build |
| `npm test` / `npm run test:e2e` | Pruebas unitarias (Vitest) / recorridos en el navegador (Playwright, un navegador a la vez) |
| `npm run verificar` | Tipos, lint, pruebas, build y presupuesto de la primera pantalla |
| `npm run voz:generar` / `voz:lista` / `voz:usar` / `voz:muestras` | Voces de Mixtle: generar, lista para grabar, cambiar de proveedor, muestras para elegir |
| `npm run musica:muestras` / `musica:instalar` / `sonidos:generar` | Música y efectos |
| `npm run capturas` | Capturas de `docs/capturas/` jugando un recorrido |
| `npm run actualizacion:probar -- --antes=… --despues=…` | Reproduce el paso de una versión guardada a una nueva |
| `node scripts/medir-carga.mjs`, `medir-fps.mjs`, `medir-transicion.mjs` | Mediciones (red lenta, cuadros por segundo, transición) |

Atajos para revisar (en desarrollo o con `?e2e` en la dirección): `?galeria` muestra todo el arte, `?mixtle` todas las apariciones de Mixtle y los accesorios en las seis mascotas, `?escena=Rescate&unidad=u2` entra directo a una aventura, y `?depurar-audio` (siempre disponible) registra lo que pasa con la música y la voz.

```
src/
  app/         interfaz en React: pantallas, componentes, los 7 tipos de ejercicio y estado (Zustand)
  contenido/   lo que se enseña: unidades y lecciones, textos de la app y de las aventuras
  aventuras/   una entrada por unidad; monta Phaser solo al entrar a la aventura
  scenes/      escenas de Phaser: los niveles de la unidad 1, Rescate, Bosque, Bici, Lonchera y el diploma
  logica/      reglas puras y probadas: lección, camino, grupos, clasificación, diplomas, accesorios
  servicios/   voz, música y efectos, almacenamiento (IndexedDB), actualización, sin internet, rendimiento
  voz/         frases narradas, hash de audios y encadenado de piezas
  arte/        ilustraciones originales en SVG (como código): personajes, escenario, ambientes, accesorios y marca
  ui/          piezas de Phaser: Mixtle, botones, globo, botes, animales
tests/         pruebas unitarias (Vitest)
e2e/           recorridos en el navegador (Playwright)
scripts/       voces (Kokoro y Azure), música, efectos, marca, capturas, presupuesto, mediciones, tráiler
public/        voz, música, efectos, íconos y logo
docs/          manual del facilitador, fuentes del contenido, lista de frases, capturas, marca, mediciones,
               notas técnicas y tráiler
```

Más detalle (cómo se generan las voces, el recorte de silencio, la carga con red lenta, cómo llegan las versiones nuevas, los tipos de ejercicio) en [`docs/notas-tecnicas.md`](docs/notas-tecnicas.md). El historial de versiones está en [`CHANGELOG.md`](CHANGELOG.md).

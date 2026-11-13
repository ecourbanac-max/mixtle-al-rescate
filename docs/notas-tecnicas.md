# Notas técnicas de Mixtle al rescate

Detalle técnico para quien mantenga o extienda el juego. El resumen está en el README; las mediciones completas, en docs/mediciones/.

## Cómo se juega

1. **Inicio → ¿Quién va a jugar?** Se elige el grupo o se crea uno: un animal (colibrí, ardilla, monarca, ajolote, tlacuache o cacomixtle), un color y, si se quiere, una etiqueta corta como "1°A". **Nunca se piden nombres de niñas ni niños**, y la pantalla lo recuerda.
2. **El camino.** Arriba está el **parque del grupo**: empieza gris y con basura, y se limpia y llena de árboles, flores y animales conforme el grupo avanza. Abajo, el camino en zigzag, por tramos: cada unidad con su postal y su paleta. En cada tramo están sus lecciones, un **cofre** a la mitad y la **aventura** al final. Mixtle se para junto a la siguiente lección y la señala, y la mascota del grupo (vestida) brinca a su lado. Las lecciones se abren en orden y las terminadas se pueden repetir.
   - **Recorrido guiado (la primera vez de cada grupo).** La primera vez que un grupo llega al camino, Mixtle enseña para qué sirve cada cosa, una a la vez y en voz alta: la siguiente parada, el parque, las hojitas, los días jugados, el álbum, el vestidor, la casita para cambiar de grupo y los botones de pantalla completa, música y voz. Lo señalado se ilumina con un marco dorado y lo demás se oscurece. **«Saltar» está a la vista desde el primer paso** (también Escape), y hay «Atrás» y «Siguiente» (o las flechas del teclado). Se recuerda **en el avance del grupo, no en el aparato** (muchos maestros usan su propio dispositivo con niños distintos en cada grupo): ya visto o saltado por ese grupo, no vuelve a salir; los grupos que ya existían antes de esta marca no lo ven otra vez; para verlo otra vez está **«Ver otra vez el recorrido por el juego»** en el modo facilitador. Con `?e2e` no sale (pruebas, capturas y tráiler), salvo con `?recorrido-guiado`. Se revisó en el juego a 1920×1080 y 1024×768: en los 20 pasos, la tarjeta nunca tapa lo señalado y nada se sale de la pantalla.
3. **Una lección** (6 a 7 ejercicios, unos 3 minutos). Barra de avance arriba, botón para salir con confirmación amable, y Mixtle narra cada consigna.
   - **Bien:** banner verde, lluvia de hojitas, Mixtle celebra (distinto cada vez) y dice una frase de ánimo. Si salió a la primera, la hojita ganada vuela al contador. Con 3, 5, 7 o 10 seguidas a la primera, "¡3 seguidas!".
   - **Casi:** banner naranja con una pista y "Intentar otra vez". No hay vidas ni castigos; lo que salió mal vuelve al final para repasar.
   - **A la mitad:** destello en la barra y "¡Ya van a la mitad! ¡Vamos!".
   - **Al terminar:** las hojitas de terminarla vuelan al contador, cuántos ejercicios salieron a la primera, el parque "Antes → ¡Ahora!" y el jingle.
4. **Recompensas.** Hojitas por lección y por cofre (el cofre dice desde antes cuántas trae); una **estampa del álbum** por cada unidad terminada (cacomixtle, mariposa monarca, colibrí, ajolote de montaña y tlacuache, cada una con un dato narrado) y su **diploma imprimible**; los **días jugados**, que solo suben, sin culpa ni presión si un día no se juega.
5. **Vestidor.** Con las hojitas se compran accesorios para la mascota del grupo, a precio fijo y a la vista. Antes de gastar, Mixtle pregunta en voz alta ("¿Compran la gorra por 30 hojitas?"). La ventana muestra la mascota ya con el accesorio, el precio y dos botones iguales, "Sí, comprar" y "No, todavía no" (también se cierra con Escape). Ninguno late, para no empujar a comprar, y un toque por accidente no se lleva las hojitas. Si no alcanza, no pregunta: se ve cuántas faltan. Lo comprado nunca se pierde.

| Acierto en una lección (tablet) | Fin de unidad (tablet) |
|---|---|
| ![Acierto](docs/capturas/tablet-1024x768-v3-4-acierto.png) | ![Fin de unidad](docs/capturas/tablet-1024x768-v3-6-unidad-terminada.png) |
| **Aventura de la unidad 2** | **Diploma de unidad** |
| ![Rescate](docs/capturas/proyector-1920x1080-aventura-u2-rescate.png) | ![Diploma](docs/capturas/proyector-1920x1080-aventura-u2-diploma.png) |

### Las cinco unidades

| Unidad | Lecciones | Aventura | Estampa |
|---|---|---|---|
| 1. Separa tu basura | Los tres botes · Basura en su lugar · Una segunda vida · ¿Y si se revuelve? | **Limpia el parque**: los 3 niveles de la v1 y el bonus "Lluvia de basura" (cae una basura a la vez y se toca su bote; si llega al suelo, vuelve a caer) | Cacomixtle |
| 2. Los animales del parque | ¿Quién vive aquí? · La basura los lastima · Nada de comida chatarra · Vecinos de Toluca | **Rescate en el parque**: liberar animales atrapados en basura y separarla | Mariposa monarca |
| 3. Árboles y áreas verdes | ¿Para qué sirven? · Plantamos un árbol · Lo cuidamos · Casa de animales | **Siembra un bosquecito**: plantar seis arbolitos y regarlos hasta que crezcan (amplía el nivel 3 de la v1) | Colibrí |
| 4. Aire limpio | A pie o en bici · ¿Qué es el humo? · Días de contingencia · Cuidamos el aire | **En bici a la escuela**: cambiar de carril para esquivar el humo y juntar hojitas | Ajolote de montaña |
| 5. Reduce y reutiliza | Mi botella y mi lonchera · Menos desechables · Una segunda vida · Menos basura | **Mi lonchera sin basura**: cada cosa a la lonchera o a "Mejor no" | Tlacuache |

### Los 7 tipos de ejercicio

Todos funcionan con toque y con mouse, con zonas de toque de 64 px o más.

1. **Elige la imagen:** Mixtle pregunta y se toca una de 2 a 4 tarjetas.
2. **Al bote:** se arrastra cada residuo a su bote (o se toca el bote). Usa la lógica de la v1.
3. **Parejas:** se toca una tarjeta y luego su pareja (residuo y bote, animal y su comida, animal y su casa).
4. **¿Sí o no?:** una acción ilustrada y dos caritas propias (feliz y triste), que se distinguen por la boca y no solo por el color.
5. **Ordena los pasos:** se tocan 3 o 4 tarjetas en orden (cómo se planta un árbol).
6. **Encuentra el error:** una escena con 1 a 3 cosas mal (basura en el pasto, una llave goteando, basura quemándose).
7. **Escucha y toca:** Mixtle nombra algo y se toca su dibujo, sin texto. Es para quienes todavía no leen.

### Modo facilitador

Para la persona que facilita: **mantén presionado el logo de Mixtle (arriba a la izquierda) 3 segundos.** Ahí se puede reiniciar el avance del grupo, **borrar el grupo** (con confirmación; antes no había forma de borrar uno), abrir todas las lecciones para saltar directo a una, activar el **modo proyector** (todo más grande) y las **animaciones suaves** (menos movimiento, para quien se marea o se distrae; el juego también las enciende solo si el equipo no sostiene las animaciones), ver otra vez el recorrido guiado y revisar si el juego ya está **listo para usar sin internet**.

- **Grupo de demostración.** El botón **"Crear grupo de demostración"** crea un grupo "Demo" (un cacomixtle) como si hubiera terminado las 5 unidades: todas las lecciones (cada ejercicio a la primera), los cofres y las aventuras, las 5 estampas, el parque lleno, los 5 diplomas y hojitas para comprar todos los accesorios. Sirve para enseñar el juego completo en una reunión sin jugarlo. Queda elegido, no toca el avance de los grupos reales y se borra como cualquier otro. Pruebas en `tests/grupoDemo.test.ts` y `tests/panelFacilitador.test.tsx`.

## Nombre y dirección anteriores

Hasta la v2, el personaje se llamaba **Caco** y el juego, "Caco al rescate" (la versión que vio Eco Urban está en la etiqueta de git `v2-eco-urban`). Desde la v3 se llama **Mixtle**, y el juego, **"Mixtle al rescate"**, con el lema **"Guardianes del parque"**. La palabra "cacomixtle" se queda donde nombra al animal.

- **Dirección:** desde la v3.2 la dirección oficial es <https://mixtle.org> (de Eco Urban) y se define en un solo lugar, `src/sitio.ts`, junto con la lista de direcciones viejas (`mixtle-al-rescate.vercel.app`, `caco-al-rescate.vercel.app` y sus direcciones de prueba `*.vercel.app`). En la v3, `caco-al-rescate.vercel.app` mudaba los grupos a `mixtle-al-rescate.vercel.app`; ese paquete (v1) se sigue entendiendo. Ver *Mudanza a la dirección definitiva*.
- **Datos guardados con el nombre anterior** (IndexedDB `caco-al-rescate` y las claves `caco-al-rescate:*` de `localStorage`) pasan solos a `mixtle-al-rescate` al abrir el juego (`src/servicios/migracion.ts`, con pruebas en `tests/migracion.test.ts`).

## Mudanza a la dirección definitiva (v3.2)

Los grupos viven solo en el navegador de cada aparato (IndexedDB), y cada dirección tiene su propio almacén: si el juego cambia de dirección, los grupos no se ven en la nueva. Por eso, desde la v3.2, una dirección vieja se muda **sola** a la definitiva, sin perder el avance de ningún grupo. Todo está en `src/sitio.ts` (las direcciones), `src/servicios/mudanzaDefinitiva.ts` (el acuerdo), `src/servicios/mudanza.ts` (el paquete) y `src/app/componentes/PantallaMudanza.tsx` (las pantallas).

**Cuándo se activa.** Solo en una dirección de la lista de viejas. Un segundo y medio después de abrir, pide `https://mixtle.org/salud.json` (sin caché, con un límite de 6 s). Ese archivo lo genera el build (`{"app":"mixtle-al-rescate","version":"3.2.0","mudanza":2}`) y `vercel.json` le pone `Access-Control-Allow-Origin: *` (solo a ese archivo) para que otra dirección lo pueda leer. Si mixtle.org no responde, responde otra cosa (un aviso de dominio, otro sitio) o no hay internet, **no pasa nada**: el juego sigue normal donde está y vuelve a revisar la próxima vez que se abra o cuando regrese la conexión. En mixtle.org, en `localhost` y en cualquier dirección que no esté en la lista, nunca intenta mudarse. Por eso hoy, sin el juego en mixtle.org, la mudanza está dormida.

**Cómo se muda** (solo en una pantalla segura: inicio, grupos, camino o álbum; nunca a media lección ni aventura):

1. **Sin grupos** en ese aparato: abre mixtle.org directo.
2. **Con grupos:** el aviso "El juego se cambió a mixtle.org. Vamos a llevar sus grupos" con la lista de grupos, un botón "Llevar los grupos" y una cuenta regresiva de 8 s. La vieja guarda una *mudanza pendiente* (id, firma de los grupos y firma de cada grupo) y abre `mixtle.org/#mudanza=…` con todos los grupos y las preferencias en el fragmento de la URL (el fragmento nunca se envía a ningún servidor).
3. **mixtle.org** revisa la firma, junta los grupos con los que ya tuviera, guarda, **vuelve a leer** para comprobar que quedaron todos, y regresa a la vieja con `#paso=recibida&id&firma` (o `#paso=fallida`). Solo regresa a una dirección de la lista de viejas (nunca a cualquier sitio).
4. **La vieja**, con `recibida` y el id y la firma de su mudanza pendiente, guarda primero un respaldo de los grupos mudados (`grupos-mudados`) y después los quita de su lista; solo quita los que no cambiaron desde que salieron (si alguien siguió jugando en otra pestaña, ese grupo se muda la próxima vez). Luego abre `mixtle.org/#paso=lista`, que da la bienvenida.

**Si algo falla a la mitad**, la vieja no borró nada: si mixtle.org no pudo guardar, regresa con `fallida` y la vieja ofrece "Intentar otra vez" (o "Ahora no"); si mixtle.org se cae o la vuelta no llega, la vieja conserva sus grupos y su mudanza pendiente, y al reintentar los grupos se juntan por id en mixtle.org (no se duplican).

**Grupos repetidos.** El mismo grupo (mismo id) que llega otra vez: se queda la copia con más avance. Otro grupo con el mismo nombre (mismo animal y etiqueta): se conservan los dos y el que llega se llama "(2)", "(3)"…; la bienvenida lo avisa (`juntarGrupos` en `src/logica/grupos.ts`).

**App instalada.** Si el juego estaba instalado como app desde la dirección vieja, la bienvenida en mixtle.org explica cómo instalarlo otra vez (y ofrece el botón "Instalar" si el navegador lo permite); el ícono viejo se puede borrar.

**Plan B: respaldo en archivo.** En el modo facilitador (y manteniendo presionado 3 s el título de "¿Quién va a jugar?", aunque no haya grupos): "Exportar grupos" descarga `mixtle-grupos-AAAA-MM-DD.json` con todos los grupos del aparato (también los ya mudados); "Importar grupos" lo valida por completo (que sea de este juego, el formato, cada grupo y la firma) antes de tocar nada, enseña qué se va a agregar y lo junta igual que la mudanza. Funciona sin internet (`src/servicios/respaldo.ts`).

**Cómo se prueba.** `tests/mudanzaDefinitiva.test.ts` (el acuerdo completo con almacenes de prueba) y `npm run mudanza:probar` (`scripts/probar-mudanza.mjs`): construye el juego con la definitiva en `http://127.0.0.1:4312` y la vieja en `localhost:4311` (`VITE_DIRECCION_DEFINITIVA`, `VITE_DIRECCIONES_VIEJAS`, solo para esa prueba) y recorre en Chrome sin ventana: definitiva no disponible, mudanza completa, fallas a la mitad, nombre repetido y respaldo en archivo.

**Para cambiar de dirección otra vez** (por ejemplo, si un día el juego se va de mixtle.org): en `src/sitio.ts`, `DIRECCION_DEFINITIVA` pasa a ser la nueva y la anterior entra a `DIRECCIONES_VIEJAS`; la vieja tiene que seguir sirviendo el juego (con esa lista) hasta que los aparatos se hayan mudado.

## Correrlo en Windows

Requisitos: [Node.js](https://nodejs.org) 22.12 o más nuevo (la versión LTS sirve) y Chrome o Edge.

```powershell
npm install
npm run dev
```

Abre <http://localhost:5173> en Chrome o Edge. Para proyectar, usa el botón de pantalla completa del juego (o F11).

Todos los comandos son scripts de npm; ninguno necesita bash. Funcionan en PowerShell o en el símbolo del sistema.

| Comando | Qué hace |
|---|---|
| `npm run dev` | Juego en modo desarrollo, con recarga automática |
| `npm run build` | Genera el sitio estático en `dist/` (con su *service worker* para jugar sin internet) |
| `npm run preview` | Sirve `dist/` para probar la versión final |
| `npm test` | Pruebas unitarias (Vitest) |
| `npm run test:e2e` | Recorridos completos en el navegador (Playwright) |
| `npm run verificar` | Tipos + lint + pruebas + build, todo junto |
| `npm run voz:generar` / `voz:lista` | Voces de Mixtle y lista de frases para grabar (ver abajo) |
| `npm run voz:silencio` | Mide cuánto silencio tienen los audios de la voz (duración, silencio, hablado, fuerte, MB) |
| `npm run actualizacion:probar -- --antes=… --despues=…` | Reproduce el paso de una versión guardada a una nueva (ver *Cuando se publica una versión nueva*) |
| `npm run capturas` | Regenera las capturas de `docs/capturas/` jugando un recorrido (con `npm run preview` abierto) |

Atajos para revisar (solo en desarrollo o con `?e2e` en la dirección): `?galeria` muestra todo el arte; `?mixtle` (siempre disponible) muestra todas las apariciones de Mixtle lado a lado y los accesorios en las seis mascotas; `?escena=Rescate&unidad=u2` entra directo a una aventura (`Bosque`/`u3`, `Bici`/`u4`, `Lonchera`/`u5`, o una escena de la v1 como `Nivel2`).

## Desplegar en Vercel

El proyecto es un sitio estático y ya incluye `vercel.json` (Vite, `npm run build`, carpeta `dist`, cabeceras de seguridad y caché; el *service worker* nunca se guarda en caché para que las actualizaciones lleguen).

**Versiones etiquetadas y cómo volver a una.** La etiqueta `v3-estable` (commit `cb13f92`, 29 de octubre de 2026) marca la versión con la voz de Alejo recortada y la actualización automática; `v3-demo` (commit `0f56540`, 30 de octubre de 2026) es la que se presentó a Eco Urban y aprobaron. Si una versión posterior sale mal, hay dos formas de volver (los mismos comandos sirven con `v3-demo` en lugar de `v3-estable`):
- **Instant Rollback en Vercel:** en el proyecto → *Deployments* → el despliegue de `cb13f92` → ⋯ → *Instant Rollback* (o *Promote to Production*). Es inmediato y no toca el repositorio; las laptops lo reciben como cualquier versión nueva (ver *Cuando se publica una versión nueva*).
- **Con git:** `git revert --no-commit v3-estable..main && git commit -m "Volver a v3-estable"` y `git push`. Deshace los commits posteriores sin reescribir la historia; Vercel publica el resultado.

**Hoy:** mientras Eco Urban recibe el proyecto, el proyecto de Vercel `mixtle-al-rescate` (de quien lo desarrolló) sigue conectado a este repositorio y publica cada *push* a `main` en la dirección vieja. Cuando Eco Urban lo importe en su cuenta de Vercel y conecte mixtle.org (ver [`docs/traspaso.md`](traspaso.md)), **cada *push* a `main` se publicará solo en <https://mixtle.org>**. El proyecto de Eco Urban **no debe llamarse `mixtle-al-rescate`** (sugerencia: `mixtle`): las direcciones `mixtle-al-rescate*.vercel.app` están en la lista de direcciones viejas.

**Con GitHub (recomendado):** en [vercel.com](https://vercel.com), *Add New → Project* e importa el repositorio. Cada rama o *pull request* genera una **versión de prueba** (*preview*) con su propia dirección; lo que llega a `main` se publica en **producción**. Así Eco Urban puede revisar cambios antes de que lleguen a los salones.

**Desde la terminal:**

```powershell
npx vercel          # versión de prueba
npx vercel --prod   # producción
```

**Integración continua:** `.github/workflows/ci.yml` corre en cada *push* y *pull request*. Revisa tipos, lint, pruebas y build en Ubuntu **y en Windows**, y después los recorridos en el navegador.

## Editar el contenido

Todo el contenido vive en archivos de datos, separado de la lógica, para que el equipo educativo lo revise y lo cambie. Cada archivo está marcado con `TODO(Eco Urban)`.

- **`src/contenido/unidades/u1-separa.ts` … `u5-reutiliza.ts`:** una unidad por archivo, con su título, tema, color, cofre, estampa (con su dato), aventura y lecciones. Cada lección es una lista de ejercicios; cada ejercicio tiene `tipo`, `consigna`, `pista` y sus datos. Los tipos están documentados en `src/contenido/tipos.ts`. Los dibujos se nombran por su clave; para verlos todos, abre `?galeria`.
- **`src/contenido/aventuras.ts`:** lo que dice Mixtle en las aventuras 2 a 5 y en su diploma.
- **`src/contenido/textosApp.ts`:** lo que dice Mixtle en las pantallas (grupos, camino, cofre, lección, álbum).
- **`src/data/residuos.ts` y `src/data/categorias.ts`:** los residuos y los botes, configurables como en la v1 (de 2 a 4 botes cambiando solo `categorias.ts`; los ejemplos están al final del archivo).

Las pruebas revisan que el contenido sea válido: de 4 a 5 lecciones por unidad (hoy son 4, 20 en total), de 6 a 8 ejercicios por lección (hoy de 6 a 7) con al menos 3 tipos distintos, respuestas correctas que existen, dibujos que existen, ningún ejercicio imposible y todos los residuos con exactamente un bote.

**Datos verdaderos.** Cada dato que dice Mixtle tiene su fuente en [`docs/fuentes-contenido.md`](docs/fuentes-contenido.md) (CONABIO, CONANP, SEMARNAT, CONAFOR, UNAM, OMS, EPA, entre otras). Ahí también está lo que **no** se usa por no tener fuente confiable (por ejemplo, "un popote tarda 500 años en degradarse"). Si se agrega un dato, hay que anotar su fuente.

Después de cambiar cualquier texto, corre `npm run voz:generar` para que Mixtle lo diga con su voz.

## Voz de Mixtle y música

### Cómo se generan las voces

Mixtle habla con audios **pregenerados** que están en el repositorio (`public/voz/`). El juego solo los reproduce: no sintetiza voz en el navegador ni llama a ningún servicio. La voz es **Alejo** de Azure AI Speech (`es-MX-Alejo:MAI-Voice-2-Flash`, español de México, estilo «excited»), elegida entre las muestras de 12 voces (`npm run voz:muestras -- --proveedor=azure`). Azure se usa solo al **generar** los audios, en el plan gratuito. Kokoro `em_alex` queda como alterno (`npm run voz:usar -- kokoro`).

Para regenerarlas, en PowerShell:

```powershell
npm run voz:preparar   # solo la primera vez: crea .venv-voz (Python 3.10–3.12) y descarga los modelos (~250 MB)
npm run voz:generar    # genera solo las frases nuevas o cambiadas
```

- **Qué necesita.** `voz:preparar` busca un Python 3.10–3.12; si no lo encuentra, dice cuál instalar. ffmpeg y espeak-ng vienen dentro de los paquetes de Python.
- **Qué hace `voz:generar`:**
  - junta automáticamente todo lo que dice Mixtle desde los archivos de contenido (`src/voz/frases.ts`), incluidas las unidades, las lecciones y las aventuras;
  - aplica `voz.config.json` (proveedor, voz, velocidad y diccionario de pronunciación);
  - guarda `public/voz/<hash-del-texto>.mp3` (mono, 64 kbps, volumen normalizado) y `public/voz/manifiesto.json`;
  - solo regenera las frases cuyo texto o configuración cambiaron, y borra los audios que ya no se usan.
- **Pronunciación.** El diccionario de `voz.config.json` cambia cómo se lee una palabra solo en el audio ("Mixtle" → "Míkstle" y "cacomixtle" → "cacomíkstle": las dos con "ks", como en "mix"). El texto en pantalla no cambia.
- **Números.** Las frases con números que de verdad pueden salir (el resumen de cada lección para cada resultado, el cofre y los diplomas) se graban **completas**, para que Mixtle las diga de corrido: encadenar piezas sonaba entrecortado. Como respaldo, para cualquier otro número se pregeneran del 0 al 100 (con "un" y "veintiún" antes de sustantivo) y se encadenan, cargando todas las piezas antes de empezar a hablar. La lista está en `narracionesCompletas()` de `src/voz/frases.ts`.
- **Respaldo.** Si una frase no tiene audio, el juego usa la voz del navegador y, en desarrollo, lo avisa en la consola. Una prueba unitaria revisa que **toda** frase narrada tenga su audio en el manifiesto.
- **En una máquina lenta** se puede generar por partes: `npm run voz:generar -- --max=50`. Cada corrida sigue donde se quedó la anterior.

### Voz con Azure AI Speech

La v3 deja listo **Azure AI Speech** como proveedor (`scripts/voz/azure.mjs`: API REST con `fetch` y SSML, sin SDK). Kokoro sigue como alterno, y las grabaciones humanas siguen teniendo prioridad sobre las dos.

- **La llave.** En `.env.local` (ya está en `.gitignore`), **sin** el prefijo `VITE_`, para que Vite nunca la mande al navegador:

  ```
  AZURE_SPEECH_KEY=…
  AZURE_SPEECH_REGION=francecentral
  ```

  La llave solo se usa al **generar** los audios en la computadora de quien prepara el juego. El juego publicado sigue reproduciendo mp3 pregenerados y nunca llama a Azure. `tests/llave.test.ts` revisa que `.env.local` esté ignorado, que el código del juego no lea la llave y que ni el repositorio ni `dist/` contengan su valor (se comprobó plantando una llave falsa en `dist/`: la prueba falla).
- **Elegir la voz.** `npm run voz:muestras -- --proveedor=azure` consulta las voces es-MX y es-US de la región y genera las mismas frases (saludo, acierto, pista amable, dato curioso) con cada una: normal, con estilo alegre si la voz lo tiene, tono +5 % y +10 % y un poco más lenta, más cómo dice "Mixtle" y "cacomixtle". Genera la página `docs/muestras-voz/azure.html` (no va en el repositorio) con la voz actual para comparar. Gasta como máximo ~20,000 caracteres.

  **Muestras generadas (29 de octubre de 2026, región francecentral).** La región tiene 33 voces es-MX/es-US, 11 de ellas con estilos. Entraron 12 voces con 241 audios y se gastaron 19,107 caracteres. Las 12 son Alejo y Valeria (MAI-Voice 2 y 2.1), Harper (MAI-Voice 2.1), Jorge, Beatriz, Candela, Carlota, Cecilio, Dalia y Dalia Multilingual. Las voces nuevas **MAI-Voice** traen `:` en el nombre (`es-MX-Alejo:MAI-Voice-2-Flash`). En Windows, eso escondía el audio en un flujo alterno en lugar de crear el archivo, así que ahora el nombre del archivo cambia `:` por `_` (con una prueba en `tests/azure.test.ts`). Los 241 audios se revisaron decodificándolos con ffmpeg: ninguno tiene errores.
- **Cambiar la voz.** `npm run voz:usar -- azure` (o `kokoro`) cambia el proveedor activo; la voz y los ajustes de cada uno (`voz`, `idioma`, `estilo`, `tono`, `velocidad`) están en `voz.config.json`. Después, `npm run voz:generar`. La firma de cada audio incluye proveedor, voz, estilo, ajustes, normalización y texto, así que un cambio regenera lo necesario y nada más.
- **El nombre de cada mp3 lleva la voz.** Se publica como `voz/<hash-del-texto>.<hash-de-la-configuración>.mp3` (o `.h<huella>` si es una grabación humana). Antes era solo el hash del texto, así que al cambiar de voz el archivo conservaba el nombre con otro contenido y cualquier caché (el navegador, el *service worker*, la descarga sin internet) podía servir la copia vieja. Ahora un cambio de voz o de normalización es una URL nueva en todas partes; el manifiesto sigue buscando cada frase por el hash de su texto (`archivo` dice el mp3 real), y las grabaciones humanas se siguen nombrando por ese hash. `tests/vozArchivos.test.ts` revisa que cada entrada nombre su archivo con su configuración, que exista, que no haya dos iguales ni mp3 sueltos.
- **Costo.** El plan gratuito (F0) da 500,000 caracteres al mes. Todas las frases del juego suman 38,902 (las 785 de hoy): regenerar todo cabe más de 10 veces al mes. Generar la voz de Alejo costó 38,902 caracteres; con las muestras, el mes va en 58,009. Si una corrida se corta, la siguiente reusa los audios ya pedidos con la misma firma (voz, estilo, ajustes y texto), sin volver a pagarlos. Antes de cada corrida se cuentan los caracteres y el uso del mes se lleva en `.voz-uso.json` (local, ignorado por git); si el mes pasaría de **400,000**, se detiene, salvo con `--forzar`. Entre peticiones espera ~3 s y reintenta los 429 con espera creciente.
- **Pruebas.** `tests/azure.test.ts` corre todo contra un servidor falso (SSML, lista de voces, reintento de 429, presupuesto, página de muestras). También se probó `voz:generar` completo contra un servidor falso: SSML con estilo y tono, reintento, normalización y registro de uso.

### El silencio de la voz (recorte)

Al revisar a oído la voz de Alejo, en 16 audios al azar el 32 % del tiempo era silencio. Por ejemplo, el diploma de la unidad 4 ("…Hojitas que juntaron: cero. Nubes de humo que esquivaron: siete…") duraba 17.2 s con 9.8 s de silencio, y "desechables." traía 0.9 s. Medido en todos los audios con `npm run voz:silencio` (silencio = pausas de 0.1 s o más por debajo de −50 dB), antes era el **30.1 %** (29 de octubre de 2026).

**Qué se hizo.**
1. **Recorte al normalizar** (`voz.config.json` → `normalizacion`, aplicado en `scripts/voz/sintesis.py` a todo audio, venga de Azure, de Kokoro o de una grabación humana): se quita el silencio del inicio y del final dejando 80 ms, y las pausas internas de más de 0.5 s se acortan a 0.35 s (`silenceremove` de ffmpeg, antes de `loudnorm`). Cambiar esos parámetros vuelve a convertir todos los audios desde los originales guardados **sin pedir nada nuevo a Azure**: la firma con la que se reusa el original no incluye la normalización (`scripts/voz/firmas.mjs`).
2. **Las frases con dos puntos se reescribieron de corrido.** El diploma de la unidad 4 ahora dice "¡Felicidades, guardianes del aire! Juntaron diez hojitas y esquivaron siete nubes de humo. ¡Bravo!" (8.4 s, 1.2 s de silencio), con "una hojita" y "una nube de humo" en singular (los números femeninos existen ahora como piezas: "una", "veintiuna"…). Si juntaron cero hojitas o esquivaron cero nubes, no dice "cero": anima para la próxima vez, como el resumen de lección. También se reescribieron "…su siguiente parada. ¡Tóquenla para jugar!" y "No pasa nada, ahí viene otra vez". Los títulos y temas de las unidades ("Unidad 2: Los animales del parque") y "¡Ganaron una estampa nueva: El tlacuache!" se dejaron como están: son texto en pantalla, y el recorte ya acorta su pausa.
3. **Los sonidos sueltos vienen del estilo «excited».** 22 audios traían un sonido corto después de una pausa larga (en "tres", "once", "sesenta y un"…). Se pidieron esas frases con y sin estilo: sin el estilo no pasa nunca; con él, cambia de una toma a otra (dos de tres tomas de "tres" salieron limpias). Así que no se corta nada: para las frases cortas (hasta tres palabras, donde un sonido tras una pausa larga no puede ser texto), el generador pide hasta tres tomas y se queda con la más limpia (`scripts/voz/sonidoSuelto.mjs`). Quedó una con sonido suelto tras tres tomas: la pieza "hojitas, y", que solo se usa de respaldo (los resúmenes de lección están grabados completos). No se probó `<break>` en SSML: el recorte y las retomas bastaron.

**Medido antes y después** (`docs/mediciones/voz-silencio-antes.json`, `-despues.json`, `-comparacion.json`):

| | Antes (785 audios) | Después (798 audios) |
|---|---|---|
| Duración total | 3,840.6 s | **3,125.3 s** |
| Silencio | 1,154.2 s, **30.1 %** | 488.9 s, **15.6 %** |
| `public/voz` | 30.91 MB | **25.19 MB** |
| El diploma del ejemplo | 17.2 s, 9.8 s de silencio | 8.4 s, 1.2 s |
| "desechables." | 1.9 s, 0.9 s de silencio | 1.1 s, 0.0 s |

**Que no se cortaran sílabas.** En los 673 audios cuyo texto no cambió, el tiempo por encima de −35 dB (las sílabas) suma 1,606.2 s antes y 1,611.7 s después; el silencio en ellos bajó de 25.2 % a 13.3 %. Por archivo, los únicos que perdieron más de 50 ms de ese tiempo fueron tres tomas nuevas de Azure ("once", "tres", "sesenta y un": el sonido suelto ya no está) y "Es de metal y tiene forma de vaso." (87 ms): se revisaron sus tramos fuertes uno por uno y todos siguen ahí con la misma duración, con diferencias de hasta 20 ms en los bordes por la nueva ganancia de `loudnorm`. Los 798 se decodificaron con ffmpeg sin errores. Lo que queda de silencio son las pausas de hasta 0.5 s y los respiros del estilo, que están por encima de −50 dB.

**Lo que gastó en Azure:** 10,992 caracteres (131 frases nuevas: las 125 del diploma de la unidad 4, las 2 reescritas y las piezas femeninas, más 6 retomas por sonido suelto). El mes va en 69,265 de 400,000. Los 667 audios cuyo texto no cambió se reusaron de los originales guardados.

### Música y voz en el inicio

Los navegadores no dejan sonar nada hasta el primer toque (y está bien). Lo que cambió (29 de octubre de 2026):

- **Cualquier toque en el inicio arranca la música y desbloquea la voz**, no solo "¡Jugar!": el toque se escucha en toda la pantalla de inicio.
- **El botón de música la enciende con UN solo toque cuando el navegador aún la bloquea.** Antes había que tocarlo dos veces: el `pointerdown` del toque desbloqueaba el audio y arrancaba la música, y el `click` del mismo toque la apagaba. Ahora la música sabe cuánto hace que empezó a sonar (`musica.empezoHace`): si fue ese mismo toque (menos de 1 s), el botón no la apaga. Con la música ya sonando, el botón la apaga y la enciende como siempre.
- **Mientras esté bloqueada, un indicio sutil** abajo a la izquierda del inicio ("Toca la pantalla para escuchar") que desaparece con el primer toque. No sale si el navegador ya deja sonar (visita de regreso).
- **Si el navegador rechazó el primer intento de sonar, cada toque lo vuelve a pedir** (`musica.asegurar`). La primera comprobación falló justo por esto: la música se desbloqueaba una sola vez y nunca se reintentaba.

**Probado en Chrome con el autoplay bloqueado** (headless, con la política real de Chrome, `document-user-activation-required`): al abrir no suena y se ve el indicio; un toque en el fondo la arranca y quita el indicio; en una visita nueva, un solo toque en el botón la arranca sin apagarla; y ya sonando, el botón la apaga y la vuelve a encender (9 de 9). No se probó en un iPad real.

**La música que se callaba sola en Chrome (29 de octubre de 2026, por la tarde).** Se vio en una laptop con Windows con el sitio publicado: al recargar, "Toca la pantalla para escuchar" aparecía y se iba sin tocar nada, y la música a veces sonaba y se detenía "de la nada"; volvía al tocar el botón de música. En Edge no pasaba. Se reprodujo en Chrome real con ventana (`scripts/revisar-musica-chrome.mjs`, con `?depurar-audio`) y tenía dos causas, las dos en el `AudioContext` de Howler, por el que pasaba también la música (un `<audio>` conectado a una ganancia de Web Audio, para el *ducking* en iPad):

1. **Howler cierra su `AudioContext` y crea otro al crear el primer efecto** si la tarjeta de sonido no va a 44.1 kHz (las laptops con Windows van a 48 kHz; `_unlockAudio` → `unload`). Cuando Chrome ya dejaba sonar sin tocar (por el historial de uso del sitio), la música se creaba al abrir, enganchada al primer contexto; 150 ms después, al pedirse el efecto del toque, ese contexto se cerraba y la música quedaba muda para siempre: `play()` "aceptado", `playing`, y el tiempo de reproducción en 0. Por eso el indicio se iba (`play()` había resuelto) y no sonaba nada. En Edge el contexto nace suspendido hasta el primer toque, y para entonces Howler ya había hecho el cambio: la música se creaba en el contexto bueno.
2. **Howler suspende su contexto 30 s después del último efecto** (ahorro de energía) y lo reanuda solo cuando suena un efecto suyo; la música, que él no ve, se callaba con él. Cualquier toque reanuda el contexto (`pointerdown`): por eso "volvía al tocar el botón de música" (el primer toque la devolvía, y de paso la apagaba; el segundo la encendía).

Lo que cambió: **la música tiene su propio `AudioContext`** (`contextoMusica()` en `motor.ts`), que no se cierra ni se suspende solo; el toque reanuda los dos contextos. **El indicio solo se va cuando de verdad se oye** (`musica.seOye`: el tiempo de reproducción avanza; que `play()` resolviera no basta). **Si algo la detiene sin que nadie lo pidiera** (pausa, streaming atorado, error), **el siguiente toque la reanuda** (`asegurar`, sin abortar una petición recién hecha) y, si no hay toque, **una vigilancia cada 5 s** la vuelve a pedir (`vigilar`; nunca si la apagó su botón). Con `?depurar-audio` se ve todo esto anotado (sección siguiente).

Medido en Chrome real con ventana, laptop a 48 kHz, 120 s por corrida. Autoplay permitido (`--autoplay-policy=no-user-gesture-required`, como con historial de uso): antes, el tiempo de reproducción en 0 los 210 s, el contexto cerrado a los 150 ms y suspendido a los 30 s; después, suena desde el primer segundo sin tocar, da la vuelta a los 39.5 s y sigue tras esconder la pestaña 20 s. Autoplay bloqueado (política real): el indicio hasta el toque; un toque la arranca con un solo `play()` aceptado, el indicio se va cuando avanza, y sigue tras esconder la pestaña. Pruebas en `tests/musica.test.ts` (se oye solo si avanza; el toque reanuda; la vigilancia; no se aborta una petición recién hecha). Lo de la bandera antigua `--autoplay-policy=user-gesture-required` (el `<audio>` "sonando" sin avanzar) era este mismo problema.

### Depurar el audio (`?depurar-audio`)

Si la música se detiene sola o no arranca, se puede ver qué pasó: abre el juego con **`?depurar-audio`** al final de la dirección (<https://mixtle.org/?depurar-audio>). Aparece un recuadro negro abajo a la izquierda que anota, con hora, cada intento de `play()` y si el navegador lo aceptó o lo rechazó, las pausas (y si las pidió el juego), los tropiezos del streaming (`stalled`, `waiting`, `error`), cuándo la pista vuelve a empezar, el *ducking* (agachar y levantar mientras habla Mixtle), el estado del `AudioContext`, cuándo se esconde o se muestra la pestaña, la descarga para jugar sin internet y las recargas por versión nueva. Cada ~5 s anota "avanza" con el tiempo de reproducción: si deja de avanzar sin un `stop()` del juego, ahí está el problema. Lo mismo sale en la consola (F12) con el prefijo `[audio …]`.

**Para mandar el registro:** reproduce el problema con `?depurar-audio` y toca **"Copiar registro"** en el recuadro; pega el texto en un mensaje. Si el botón no copia, selecciona el texto del recuadro, o en la consola escribe `copy(__registroAudio())` y pega. Sin `?depurar-audio` el registro no existe y no cuesta nada.

### Grabar una voz humana

1. Corre `npm run voz:lista`. Genera `docs/frases-mixtle.csv` con columnas `id`, `archivo`, `texto`, `unidad` y `lección`; se abre bien en Excel.
2. Graba cada frase (por ejemplo, una persona de Eco Urban, o con Canva) y guarda el audio en `voz-grabaciones/` con el **mismo nombre de archivo** de la columna `archivo` (mp3, wav, m4a u ogg).
3. Corre `npm run voz:generar`. Las grabaciones reemplazan a la voz generada: se normalizan al mismo volumen y quedan marcadas como humanas en el manifiesto. Las frases sin grabar conservan la voz generada.

### Cambiar la música

Las tres pistas (tranquila, lecciones y celebración) son CC0 y están en `public/musica/`. Para cambiar una:

1. Agrega la candidata a `scripts/musica/candidatas.json` (solo CC0, con su página) y corre `npm run musica:muestras` para escucharla junto a las demás.
2. Pon su `id` en `scripts/musica/elegidas.json` y corre `npm run musica:instalar`.
3. Anótala en `CREDITOS.md`.

En el juego la música va baja (≈25 %), baja a ≈8 % mientras habla Mixtle y sube suave al terminar. Entre pistas hay un fundido, y solo empieza después del primer toque. Música y voz tienen botones separados, y cada uno se recuerda en el aparato.

Los efectos de sonido se generan con `npm run sonidos:generar`.

## Pruebas y evidencia medida

**Mediciones de la v3** (28 de octubre de 2026, en la laptop de desarrollo: Intel Core i5-10210U, 8 GB):

| Qué | Resultado |
|---|---|
| Lo que se descarga antes de la primera pantalla | **240.4 KB** comprimidos, contando todas las fuentes (límite de la v3: 250 KB; medido el 30 de octubre de 2026 con `npm run presupuesto`). `npm run presupuesto` lo mide en cada `verificar` y falla si se pasa. Las demás pantallas, el arte de los ambientes y los accesorios, Phaser, la voz y la música bajan después. |
| Cuadros por segundo, Chrome con tarjeta de video (`node scripts/medir-fps.mjs --con-ventana`) | **59–60 fps** en el inicio (entrada y paralaje), la lección con hojitas y chispas, el cofre que estalla y el camino. Hasta 0.7 % de cuadros lentos, a 1920×1080 y a 1024×768 (`docs/mediciones/rendimiento-v3.json`). |
| Sin tarjeta de video (peor caso: Chromium sin ventana) | Con todas las animaciones, **11–14 fps** a 1920×1080 y 26–33 fps a 1024×768 (`docs/mediciones/rendimiento-v3-sin-ventana.json`). Con las **animaciones suaves**, **57–60 fps** (`docs/mediciones/rendimiento-v3-sin-ventana-suave.json`). Por eso el juego **las enciende solo** si mide menos de 35 fps (comprobado: de 11 a 60 fps). |
| Decoraciones de los lados del camino | Comparación en las mismas condiciones y en el peor caso (sin tarjeta de video): **con decoraciones 55/60 fps, sin ellas 56/60** (proyector/tablet), mediana 60 (`docs/mediciones/rendimiento-v3-sin-ventana-camino.json`). Ninguna se cruza con botones, etiquetas, la mascota ni Mixtle en 18 casos medidos. |
| Contador de hojitas | En una lección real jugada en el navegador, el contador terminó en exactamente lo ganado (6 a la primera + 10 por terminarla). |
| Diploma | Se imprime en **una sola hoja** horizontal, carta y A4 (medido con el PDF de Chrome). |
| La transición al tocar «¡Jugar!» (Edge se trababa en una laptop modesta) | Con la **CPU 4× más lenta** (Chrome, 1280×800, 1.6 s desde el toque, mediana de 3; `scripts/medir-transicion.mjs`, `docs/mediciones/transicion-jugar-4x.json`): **antes 42.9 fps, peor cuadro 200 ms, 394 ms de tareas largas (4); después 50.8 fps, 167 ms, 166 ms (1)**. En el hilo principal no había audio que decodificar, ni la descarga para jugar sin internet (se pausa 3 s al cambiar de pantalla; solo terminan las ≤4 peticiones en vuelo, ≈15 ms), ni el código de Grupos (precargado): era el render. El layout de Grupos (≈90 ms a 4×) caía en el mismo cuadro en que empezaba el destape del panel, y a media transición se pedía la Nunito 900 (la estrena el título de Grupos) y el efecto del barrido (se bajaba y decodificaba justo al tocar). Ahora el destape espera a que la pantalla nueva esté pintada (dos cuadros, 150 ms de tope: `TransicionMarca.tsx`), y el inicio adelanta el barrido y la letra gruesa. Lo que queda es el commit de React del toque mismo (la salida del inicio con Motion y el panel, ≈150 ms a 4×, unos 40 ms reales). |



**Pruebas unitarias (Vitest)**, en `tests/`: **1499 pruebas en 43 archivos, todas pasan** (30 de octubre de 2026, `npm run verificar` en verde: tipos, lint, pruebas, build y presupuesto). Además de las de la v2, la v3 agrega pruebas de marca (logo al día con las fuentes, 8 poses, presupuesto de la primera pantalla), migración y mudanza de datos, nombre (ningún "Caco" en código ni voz), Azure contra un servidor falso, protección de la llave, vitrina y transición, racha y mitad de lección, recompensas, diplomas, accesorios y vestidor, y el ajuste automático por rendimiento. Entre ellas:

- **Contenido válido:** cada unidad tiene de 4 a 5 lecciones (hoy 4, 20 en total); cada lección tiene de 6 a 8 ejercicios (hoy de 6 a 7) con al menos 3 tipos; las respuestas correctas existen, los dibujos existen, no hay ejercicios imposibles (parejas sin repetir, "encuentra el error" con 1 a 3 errores dentro de la escena). Cuando una pregunta habla de un bote, dice su color **y su nombre** ("el bote naranja de no reciclable") y el bote se ve en pantalla. Cada archivo de contenido está marcado con `TODO(Eco Urban)`.
- **Voz:** **toda frase narrada (785) tiene su audio en el manifiesto** y su mp3 existe, y **las 175 frases con números** (fin de lección, cofre, diplomas y la pregunta de cada accesorio) suenan como **un solo audio**, sin piezas encadenadas.
- **Camino y grupos:** las lecciones se desbloquean en orden; el cofre y la aventura se abren a su tiempo; el avance de cada grupo se guarda y se recupera por separado, y **la app no falla si IndexedDB está bloqueado**.
- **Arte de Mixtle:** todas las poses del catálogo, el logo, el colgado del inicio y el cuerpo en línea usan la misma paleta, la misma cabeza y ojos y la cola con los mismos anillos; y cada Mixtle en línea define sus propios degradados (dos en la misma página no comparten id, y el logo de la app no comparte id con el de la pantalla de carga): `tests/paletaMixtle.test.ts` y `tests/mixtleFigura.test.tsx`.
- **Música:** el *ducking* baja la música mientras habla Mixtle y la sube al terminar (también si dos cosas la agachan a la vez); fundido entre pistas, jingle y nada antes del primer toque.
- **Aventuras y diploma:** el recorrido en bici nunca pone humo en los dos carriles a la vez; la lonchera tiene cosas de los dos tipos, sin patrón para adivinar; la concordancia de los números ("1 animal", "2 animales").
- Las de la v1 siguen: cada residuo va a exactamente un bote (con 2, 3 o 4 botes), pistas amables que nombran el color, el nombre y el dibujo de cada bote, y contraste AA.

**Recorridos en el navegador (Playwright)**, en `e2e/`, a **1920×1080 (proyector)** y **1024×768 (tablet táctil)**:

- Crear un grupo, completar una lección **con un error**, ver la pantalla final, ver **crecer el parque**, recargar y encontrar el avance guardado, y abrir el álbum.
- Jugar las **cinco aventuras** de principio a fin (la de la unidad 1, con el facilitador y la estampa ganada).
- Cada botón mide **al menos 64 px reales** en el camino, la lección y el inicio.
- **Ninguna petición envía datos** (solo GET) y no hay errores en la consola.
- **Vestidor:** la mascota cabe en su recuadro y no tapa las tarjetas, con las seis mascotas, cada accesorio y seis tamaños de pantalla (`e2e/vestidor.spec.ts`, con los ganchos `grupoVestido` y `ponerse` de `?e2e`).
- **Modo facilitador:** cabe en pantalla y "Cerrar" se ve sin desplazar nada, a 1920×1080, 1366×768, 1280×650 y 1024×768, también con la confirmación de borrar abierta (`e2e/facilitador.spec.ts`).

Para correrlos contra un sitio ya publicado, sin construir nada en local: `$env:BASE_URL="https://…"; npm run test:e2e`. En una laptop de 8 GB usan **un solo navegador a la vez**; con varios, la memoria se agotó y el sistema cerró las pruebas.

**Última corrida contra producción** (30 de octubre de 2026, mixtle-al-rescate.vercel.app con los cierres sobre `v3-demo`, un navegador a la vez, en cinco partes de menos de 10 min, 24.5 min en total): **58 de 58 pasan** (`docs/mediciones/e2e-produccion-30oct.json`, con la duración y las anotaciones de cada prueba). Las dos aventuras completas de la unidad 1 dicen `conAudio 60, conNavegador 0` (Mixtle siempre con su voz grabada) y 58/57 fps en el nivel 1; el modo facilitador pasa en los cuatro tamaños. La corrida del 29 de octubre había dado 55 de 56: la que fallaba, "aventura de la unidad 1 completa" a 1024×768, se quedaba en el modo facilitador porque "Cerrar" estaba fuera de la vista (el ayudante de las pruebas ahora trae el botón a la vista, `e2e/ayudas.ts`, y el panel ya cabe; ver *Cierre del proyecto*). Las cuatro fallas del 27 de octubre ya no están: la lluvia de basura se arregló ese mismo día (y ahora tiene prueba, `tests/lluvia.test.ts`), la prueba del botón de sonido se actualizó, la de 64 px del camino salta los botones que se van, y la de 64 px del inicio espera a que termine la entrada animada.

En dos corridas del 29 de octubre, la prueba de la aventura a 1920×1080 falló con "Received: 0"; se anotó como "contador de voces en 0", pero no era eso (ver *Cierre del proyecto*: era la comprobación del nombre de los mp3, desactualizada tras renombrar los audios).

**Mediciones** (27 de octubre de 2026, build de producción):

| Qué | Resultado |
|---|---|
| Lo que se descarga al abrir el juego | **≈ 158 KB** comprimidos (React 44 KB + app 107 KB + estilos 7 KB) y 48 KB de la fuente Nunito |
| Phaser (solo al entrar a una aventura) | ≈ 310 KB comprimidos, más 2 a 7 KB por aventura |

| Voces de Mixtle | 798 frases con Alejo (Azure), **25.2 MB** en total (mono, 64 kbps, silencio recortado), incluidas las frases con números grabadas completas. Las 798 se decodificaron con ffmpeg sin errores. |
| Música y efectos | 1.3 MB (3 pistas) y 78 KB (12 efectos) |
| Juego sin internet (PWA) | Al instalarse, el *service worker* guarda lo esencial (25 archivos, 744 KB). Después, en segundo plano, se bajan 844 archivos más (**26.9 MB**: el resto del código, imágenes, efectos, voces y música); el modo facilitador muestra el porcentaje y "Listo para usar sin internet" (ver *Carga en una red lenta*) |

**En el sitio publicado** (27 de octubre de 2026, en la dirección de entonces, caco-al-rescate.vercel.app, Chrome en Windows 11, conexión doméstica):

| Qué | Resultado |
|---|---|
| Pantalla de inicio lista (primera visita, sin caché) | **0.61 s**, 170 KB transferidos |
| Voz y música | Mixtle habla con su voz grabada (0 frases con la voz del navegador) y suena la música de fondo |
| El *service worker* termina de guardar el juego | 675 archivos en **79 s**, con conexión doméstica (con el *service worker* de entonces, que lo guardaba todo al instalarse) |
| Sin internet, después de eso | El juego abre, Mixtle habla y suena la música |

### Carga en una red lenta (Slow 4G)

Alguien abrió el link por primera vez y tardó en pasar de "¡Jugar!" a "¿Quién va a jugar?". Se midió antes y después de corregirlo con `scripts/medir-carga.mjs`, con la red del perfil "Slow 4G" de Chrome (562.5 ms de ida y vuelta, 1.44 Mbps de bajada y 675 kbps de subida), en primera visita (sin caché, con *service worker*) y con Chrome headless, uno a la vez.

**Cómo se midió.** El throttling de DevTools (CDP) no se usó porque solo frena a la página: lo que descarga el *service worker*, que era justo lo que llenaba la red, pasa sin límite. En su lugar, todo el tráfico de Chrome, página y *service worker*, pasa por un proxy que retrasa cada byte y reparte el ancho de banda entre todas las conexiones.

- **Calibración:** un archivo de 475 KB tardó 3,511 a 3,549 ms desde la página, contra un mínimo de 3,201 ms según la red.
- **Prueba de que el *service worker* también pasa por el límite:** el anterior tardó ~18 min en bajar sus 22.7 MB.
- **Al calibrar se encontraron y corrigieron tres errores de medición:**
  - el tráfico a `localhost` se saltaba el proxy;
  - las respuestas llegaban cortadas porque el proxy cerraba antes del último trozo;
  - `waitForFunction` con una función `async` no esperaba.

El "antes" es el código anterior (`c62556e`, ya con la voz de Alejo) construido aparte. Los resultados están en `docs/mediciones/carga-antes.json` y `docs/mediciones/carga-despues.json`.

| Qué (Slow 4G) | Antes | Después |
|---|---|---|
| "¡Jugar!" → "¿Quién va a jugar?" en pantalla, primera visita | **5.09 / 5.16 / 5.20 s** (mediana 5.16 s) | **0.34 / 0.35 / 0.35 / 0.37 s** (mediana 0.35 s; meta < 1.5 s) |
| Lo mismo, con la transición ya terminada | 5.16 s | 0.71 a 0.73 s |
| Visita de regreso | No se midió: el *service worker* anterior no se activó en 19 min (ver abajo) | **0.35 y 0.37 s** (meta < 0.5 s); 0.72 s con la transición terminada |
| Inicio listo (primera visita) | 5.6 s | 5.9 s |
| *Service worker* activo, desde que se abre la página | **No se activó en 19 min.** Bajaba 862 archivos uno por uno (~18 min para 22.7 MB) | **26.8 s** en local y **27.2 s** en producción (25 archivos) |
| "Listo para usar sin internet" | — (era parte de la instalación del *service worker*) | **4.8 min** en local y **4.1 min** en producción (831 archivos, 33.9 MB, en segundo plano). Con la voz recortada (**844 archivos, 26.9 MB**; ver *El silencio de la voz*): **3.8 min** en producción (225.9 s, 28.2 MB pasaron por el proxy contando cabeceras y el precache; 30 de octubre de 2026, `docs/mediciones/carga-voz-recortada.json`). Los dos intentos anteriores se detuvieron solos por memoria baja |

**En producción** (<https://mixtle-al-rescate.vercel.app>, 29 de octubre de 2026, por el mismo proxy con Slow 4G; `docs/mediciones/carga-produccion.json`):
- "¡Jugar!" → "¿Quién va a jugar?": **0.35 s** en primera visita y **0.36 s** en la de regreso.
- *Service worker* activo a los **27.2 s**.
- "Listo para usar sin internet" a los **4.1 min**.
- La calibración por el túnel HTTPS dio 4,304 ms para 475 KB: cifrar suma tiempo, pero el límite es el mismo.

**En producción, con la voz recortada** (30 de octubre de 2026, versión `v3-demo` más los cierres, mismo proxy con Slow 4G, una corrida; `docs/mediciones/carga-voz-recortada.json`):
- Inicio listo a los **6.3 s** en primera visita y **2.5 s** en la de regreso.
- "¡Jugar!" → "¿Quién va a jugar?": **0.38 s** en primera visita y **0.36 s** en la de regreso (0.76 / 0.77 s con la transición terminada); la música empezó a los 13 y 9 ms del toque.
- *Service worker* activo a los **11.2 s** (antes 27.2 s: ahora la primera pantalla está lista antes y el precache es el mismo; una corrida, así que la diferencia puede ser en parte ruido).
- "Listo para usar sin internet" a los **3.8 min** (antes 4.1 min con 33.9 MB): 28.2 MB por el proxy a ~1.44 Mbps, es decir, la red va casi al tope todo el tiempo.

**Abrir la primera lección** (29 de octubre de 2026). En un aparato recién actualizado, tocar la primera lección tardó mucho; al reiniciar ya fue rápido. Se midió con `node scripts/medir-carga.mjs --leccion` (un grupo recién creado sembrado por la URL; del camino se toca la primera lección y se mide hasta que el primer ejercicio está en pantalla y hasta que Mixtle se oye, con el gancho `__mixtle.narrando()` que solo existe con `?e2e`), en primera visita con Slow 4G, en dos situaciones: en cuanto se llega al camino, y **con la descarga para jugar sin internet en curso** (`--con-descarga`: el caso del aparato recién actualizado). Una corrida de cada una (`docs/mediciones/carga-leccion-*.json`):

| Tocar la lección → | Antes | Después |
|---|---|---|
| Primer ejercicio en pantalla, en cuanto se llega al camino | 1,242 ms | 1,000 ms |
| Mixtle narrando, en cuanto se llega al camino | 1,242 ms | 1,216 ms |
| Primer ejercicio en pantalla, con la descarga en curso | 71 ms (la descarga ya había bajado el código de la lección) | 358 ms |
| Mixtle narrando, con la descarga en curso | 1,253 ms | **1,091 ms** |

Qué cambió: mientras se ve el camino se adelanta el código de la lección (con sus ejercicios); al tocar una lección se adelanta lo primero que dice Mixtle (la bienvenida y la consigna del primer ejercicio, que van en orden) y la descarga en segundo plano se retiene hasta que el primer ejercicio está en pantalla y Mixtle se oye (`src/app/pantallas/precargaLeccion.ts`, como mucho 15 s). **Lo honesto:** en estas mediciones la mejora es pequeña (Mixtle se oye ~10 % antes; la pantalla llega en 0.4 a 1 s) y la lentitud que se vio en el aparato no se reprodujo: en las cuatro situaciones abrir la lección tomó ~1.2 s. Lo más probable es que aquel aparato aún tuviera el *service worker* anterior instalándose (862 archivos uno por uno, ver arriba), o una red peor que Slow 4G. Son corridas únicas: diferencias de unos cientos de ms entre ellas son ruido de la red simulada.

**Qué cambió:**
- **Mientras se ve el inicio se adelanta:**
  - el código de Grupos y Camino;
  - el audio de "¡Al rescate!" y de la bienvenida de Grupos;
  - los efectos del toque y del remate.
- **"¡Jugar!" no espera a la voz:** la transición empieza de inmediato y Mixtle habla encima. Si su audio no llega en 800 ms, no se dice tarde. La bienvenida de Grupos espera a que termine "¡Al rescate!", como mucho 800 ms.
- **Los efectos se piden uno por uno, cuando suenan,** en vez de los 22 de golpe al primer toque.
- **La música va en streaming:** un `<audio>` conectado a una ganancia de Web Audio, así empieza sin bajarse completa y el *ducking* sigue funcionando en iPad.
- **El *service worker* se registra cuando la primera pantalla ya está lista.** Al instalarse guarda solo lo esencial (25 archivos, 744 KB): `index.html`, el código del inicio, Grupos y Camino, el CSS y las fuentes.
- **El resto se baja en segundo plano a la caché `mixtle-sin-internet`.** Primero el resto del código, luego imágenes, efectos, voces y música (`src/servicios/sinInternet.ts`). Va de 4 en 4, con prioridad baja y una pausa de 3 s en cada cambio de pantalla. Solo baja lo nuevo o lo que cambió, según la revisión de cada archivo en `sin-internet.json`.
- **El modo facilitador muestra el estado:** "Listo para usar sin internet" o el porcentaje.

**Probado sin conexión** (en local, sin limitar la red):
- el *service worker* se activó a los 3.3 s;
- los 831 archivos quedaron guardados a los 6.5 s;
- ya sin red, el juego recargó, la voz y un efecto salieron de lo guardado (200), la música por partes (206, como la pide el `<audio>`), y se llegó a "¿Quién va a jugar?" sin errores.

**Lo que no se pudo medir, o hay que leer con cuidado:**
- **La visita de regreso de la versión anterior.** Su *service worker* no se activó en 19 minutos con Slow 4G, así que una segunda visita no habría sido más rápida. No se averiguó por qué no se activó.
- **La música en la primera visita a través del proxy.** No avanza nunca: se queda en el segundo 0 con todos sus datos, incluso con el proxy sin limitar la red. Sin el proxy suena 0.6 s después del toque, así que es un efecto de esta forma de medir. En la visita de regreso, a través del proxy, empezó a los 40 ms del toque.
- **El *service worker* tarda ~27 s en activarse, no "unos segundos".** Así salió en local y en producción.
  - **Cómo se reparte:** empieza a registrarse cuando el inicio está listo (~7 s). Luego Workbox guarda sus 25 archivos uno por uno, y cada uno cuesta una ida y vuelta (~0.6 s con Slow 4G).
  - **Lo que no se averiguó:** según el registro del proxy, vuelve a bajar de la red archivos que la página ya había bajado, aunque `/assets/` va con `Cache-Control: immutable`.
  - **Mientras no se activa, no estorba:** el juego ya funciona y "¡Jugar!" no lo espera. Solo retrasa el momento en que se puede jugar sin internet.
  - **Para que se active antes:** dejar en el precache solo `index.html` y pasar el resto a la descarga en segundo plano. No se hizo: lo pedido era precachear el código, las fuentes y el arte.

### Cuando se publica una versión nueva

Se abrió el juego en una laptop que tenía la versión anterior guardada por su *service worker* y siguió viendo la versión vieja (con la voz anterior), aunque producción ya servía la nueva. Se reprodujo y se corrigió (29 de octubre de 2026).

**Qué pasaba.** El *service worker* nuevo se instalaba pero se quedaba **"esperando"**: no se activaba hasta que se cerraran todas las pestañas del juego, y mientras tanto el anterior seguía sirviendo la versión vieja que tenía guardada. La causa: el plugin de la PWA solo pone las banderas `skipWaiting` y `clientsClaim` cuando el registro es automático (`injectRegister: "auto"`), y desde que el *service worker* se registra desde el código del juego no lo era; en la práctica, **ningún build anterior las tuvo**, así que cada versión nueva requería cerrar todas las pestañas.

**Qué se corrigió.**
- El build pide `skipWaiting` y `clientsClaim` explícitamente (`vite.config.ts`): la versión nueva se activa en cuanto se instala y toma las pestañas abiertas. Con eso, el juego se recarga solo al volver al inicio (como ya hacía `src/servicios/actualizacion.ts`).
- Al registrar, el juego le pide a cualquier *service worker* que ya esté esperando que se active (`activarLaQueEspera`, en `src/servicios/arranque.ts`): cubre a las laptops que se quedaron con un build anterior en espera.
- Los grupos y su avance viven en IndexedDB y no se tocan: siguen ahí después de la actualización.

**Cómo se probó** (`npm run actualizacion:probar -- --antes=<build anterior> --despues=<build nuevo>`, `scripts/probar-actualizacion.mjs`). Un servidor local sirve el build anterior; Chrome lo abre, deja que su *service worker* se active y guarde todo (856 archivos), se siembra un grupo con 2 paradas hechas y se cierra la pestaña. Luego el servidor pasa a servir el build nuevo en la misma dirección y se vuelve a abrir el link:

| | Build anterior → build de hoy sin el arreglo | Build anterior → build con el arreglo |
|---|---|---|
| Al abrir el link | Se ve la versión anterior (la sirve su *service worker*) | Se ve la versión anterior |
| El *service worker* nuevo | Instalado y **esperando**; en 60 s no toma el control | Se activa, toma la pestaña y **el juego se recarga solo a los 6.2 s** de abrir |
| Lo que queda | **La versión vieja**, hasta cerrar la pestaña y volver a abrir | La versión nueva (precache de 24 archivos), con el grupo y sus 2 paradas intactos |

La prueba termina con error si la nueva no toma el control sola o si el avance cambia. Las dos piezas del arreglo tienen pruebas unitarias en `tests/actualizacion.test.ts`. En producción, con Slow 4G, el *service worker* nuevo tarda más en instalarse (~27 s, ver *Carga en una red lenta*), así que la recarga llega más tarde que en local.

**Segunda vez (29 de octubre, noche): una laptop seguía con la versión de las 18:28** aunque producción ya servía la nueva. Se reprodujo con dos builds de hoy (`56fe9d8`, 18:28 → el actual). **Lo que pasaba:** la pestaña ya estaba abierta cuando se publicó la nueva, y una pestaña abierta solo busca versiones nuevas cuando navega (al recargar o abrir el link) o cuando el juego llama a `registration.update()`, cosa que el build de las 18:28 no hacía nunca. Al volver a abrir el link sí se actualizaba (6.8 s, como antes). Además, Vercel sirve `sw.js` desde su CDN (`x-vercel-cache: HIT`, `age` de minutos) aunque lleve `max-age=0`: justo después de un despliegue, una laptop puede recibir el `sw.js` anterior y no volver a preguntar hasta la siguiente navegación.

**Qué se corrigió (segunda vez):**
- Con la pestaña abierta, el juego busca versiones nuevas **al volver a la pestaña** (como mucho una vez por minuto) y **cada 15 minutos** (`programarRevisiones`, en `src/servicios/actualizacion.ts`).
- `sw.js` se registra con `updateViaCache: 'none'` y, en Vercel, `sw.js` y el archivo de workbox van con `Cache-Control: no-store`: ninguna caché intermedia debe esconder una versión nueva.
- La recarga automática ocurre en cualquier **pantalla segura** (inicio, elegir grupo, camino, álbum), no solo en el inicio; **nunca a media lección ni aventura**: ahí espera a que se salga.
- **Aviso visible en el inicio** por si la recarga no ocurre: "Hay una versión nueva. Toca para actualizar" (`actualizarAhora`: le pide activarse a un *service worker* en espera y recarga; los grupos no se tocan).

**El flujo completo de actualización, de principio a fin:**
1. Se hace *push* a `main`; Vercel publica el build nuevo (nuevo `sw.js`, nuevo `index.html` con sus archivos).
2. En la laptop, el juego pide `sw.js` a la red al cargar, al volver a la pestaña (≥ 1 min después) y cada 15 min. Si cambió, el navegador instala el *service worker* nuevo (25 archivos esenciales).
3. El nuevo se activa sin esperar (`skipWaiting`) y toma las pestañas abiertas (`clientsClaim`); si uno se quedara esperando, el juego le pide activarse (`SKIP_WAITING`).
4. Al tomar el control, el juego recarga la lista de audios y recarga la página en cuanto está en una pantalla segura; el `index.html` nuevo lo sirve ya el *service worker* nuevo.
5. Los grupos y su avance siguen en IndexedDB; la descarga para jugar sin internet baja solo lo que cambió.

**Medido con la pestaña ya abierta cuando se publica** (`npm run actualizacion:probar -- --antes=… --despues=… --abierta --pantalla=inicio|camino|leccion`; se espera un minuto y se simula volver a la pestaña; el "siguiente" es un build real del mismo código con un cambio de una línea, es decir, otro bundle y otro `sw.js`, como en cualquier despliegue):

| Pestaña abierta en | Build de las 18:28 → cualquiera | Build actual → siguiente |
|---|---|---|
| Inicio | No se actualiza (no vuelve a preguntar) | Se recarga sola a la nueva **2.0 s** después de volver a la pestaña |
| Camino | No se actualiza | **1.9 s** |
| A media lección | No se actualiza | No recarga a media lección; al salir al camino se recarga **de inmediato** (0 s) |
| Volver a abrir el link | 6.8 s | 5.8 s |

En todos los casos el grupo sigue con sus 2 paradas hechas. (Un intento anterior de "siguiente build" renombrando archivos a mano falló por mi culpa: los demás *chunks* importan el principal por su nombre; un build real los renombra todos juntos.)

Las laptops que hoy tienen un build anterior a este arreglo abierto necesitan una navegación (recargar o volver a abrir el link) para recibirlo; a partir de este build, la pestaña abierta se actualiza sola.

**Si una laptop se queda con una versión vieja** (por ejemplo, una que no abrió el juego desde antes de este arreglo):
1. Si en el inicio se ve **"Hay una versión nueva. Toca para actualizar"**, tocarlo basta.
2. Si no, **cerrar todas las pestañas del juego** y volver a abrir el link. Con eso el *service worker* nuevo toma el control.
3. Si sigue igual, en la pestaña del juego: **Ctrl+Shift+R** (recarga sin caché).
4. **Nunca "Borrar datos del sitio"** desde la configuración del navegador: eso borra los grupos y su avance, que solo viven en esa laptop. Cerrar pestañas y recargar no los tocan.
- **La primera visita necesita internet:** para que después funcione sin conexión se bajan unos 28 MB (sobre todo las voces), en segundo plano y sin estorbar el juego. Con Slow 4G, los 34 MB de antes del recorte de la voz tardaban ~4.1 min en producción; con 27 MB son **3.8 min**, medidos en producción el 30 de octubre (ver *Carga en una red lenta*). Conviene abrir el juego una vez con buena señal antes del taller y revisar en el modo facilitador que diga "Listo para usar sin internet".

- **Las aventuras son minijuegos cortos** (2 a 4 minutos). Las del bosquecito y la lonchera siempre tienen el mismo número de cosas: los diplomas muestran el esfuerzo, no un puntaje para comparar grupos.
- El diploma de la unidad 1 cuenta los residuos separados en el nivel 2 y en la lluvia de basura (12 + 5) y los animales ayudados.
- **v3: la voz de Azure ya se eligió (Alejo, «excited»), pero falta que Eco Urban la escuche.** Si prefieren otra, se cambia en `voz.config.json` y se corre `npm run voz:generar`. Las otras 21 voces en español de la región no cupieron en el límite de ~20,000 caracteres de las muestras; se pueden pedir.
- **v3: las mediciones de cuadros por segundo dependen de que la computadora esté libre.** Con la ventana de Chrome tapada o la laptop ocupada en otra cosa, Chrome deja de dibujar y las cifras no sirven. `scripts/medir-fps.mjs` lo detecta y lo avisa, y el tráiler se niega a grabarse así. Las cifras de este README se tomaron con la laptop libre, o comparando en las mismas condiciones.
- **v3: equipos sin aceleración por tarjeta de video.** Ahí las animaciones completas van a 11–33 fps. El juego lo detecta y se calma solo; con las animaciones suaves va a 57–60 fps.
- **v3: lo que falta confirmar con Eco Urban.** Los precios de los accesorios, que los ambientes de cada unidad se sientan "de Toluca" y la frase de Mixtle ("¡Al rescate!").

## Estructura

```
src/
  app/         interfaz en React: pantallas (inicio, grupos, camino, lección, álbum, aventura),
               componentes, ejercicios (los 7 tipos) y estado (Zustand)
  contenido/   lo que se enseña: unidades y lecciones, textos de la app y de las aventuras
  aventuras/   una entrada por unidad; monta Phaser solo al entrar a la aventura
  scenes/      escenas de Phaser: niveles de la v1, Rescate, Bosque, Bici, Lonchera y el diploma
  logica/      reglas puras y probadas: lección, camino, grupos, clasificación, diplomas, accesorios
  servicios/   voz, música y efectos, almacenamiento (IndexedDB), migración y mudanza, rendimiento
  voz/         frases narradas, hash de audios y encadenado de piezas
  arte/        ilustraciones originales en SVG (como código): personajes, escenario, inicio en capas,
               ambientes de las unidades, accesorios y la marca (logo e ícono)
  ui/          piezas de Phaser: Mixtle, botones, globo, botes, animales, clasificador
tests/         pruebas unitarias (Vitest)
e2e/           recorridos en el navegador (Playwright)
scripts/       voces (Kokoro y Azure), música, efectos, marca, capturas (y capturas-revision.mjs), presupuesto, cuadros por segundo,
               carga con Slow 4G, prueba de actualización, tráiler
               y demo/ (juega como un grupo y siembra grupos de ejemplo)
docs/          fuentes del contenido, lista de frases, capturas (y capturas-revision-*/ de cada revisión), muestras, marca,
               direcciones visuales y mediciones (rendimiento, carga, actualización)
```


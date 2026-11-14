# Historial de versiones

Fechas de octubre y noviembre de 2026. Las etiquetas de git marcan las versiones que vio Eco Urban.

## v3.2.1 (14 de noviembre) — Mixtle dice la consigna correcta y en las aventuras todo se ve completo

La versión anterior queda en la etiqueta `v3.2-antes-correcciones`. Es la primera versión que se publica desde la cuenta de Eco Urban: **mixtle.org quedó activo el 13 de noviembre de 2026** (el repositorio está en `github.com/ecourbanac-max/mixtle-al-rescate`; cada cambio a `main` se publica ahí). Desde ese día la mudanza de las direcciones viejas está activa.

### 1. Mixtle decía frases de otra pantalla y se saltaba la consigna

- **Lo que se veía:** al empezar una lección, el globo de Mixtle cambiaba la consigna del ejercicio por "¡Miren cómo crece su parque!" (la frase del final de la lección anterior), y el botón de repetir la repetía. A veces sí y a veces no; y los diálogos "se adelantaban".
- **La causa (reproducida):** la pantalla final de una lección dice "¡Lo lograron!" y, al terminar, la frase del parque. Si el adulto sale antes de que Mixtle acabe, la voz se corta y ya no avisa que terminó; pero el temporizador de respaldo del narrador (la duración de la frase más 1.2 s) seguía vivo, y al cumplirse decía la frase del parque en la pantalla en la que estuvieran entonces: la consigna de la lección siguiente. Las aventuras tenían el mismo error. "Se adelantan" venía del respaldo de la voz, que se contaba desde que se pedía la frase y no desde que empezaba a sonar: con la red lenta, cortaba frases que aún no terminaban.
- **Cómo se reprodujo:** `e2e/dialogo.spec.ts` termina una lección, sale de la pantalla final a los 1.5 s, entra a la siguiente y vigila el globo 9 s, en 7 condiciones: normal, red lenta (cada audio tarda 2.5 s), computadora 4 veces más lenta, voz apagada, audio bloqueado por el navegador, audios que no cargan y cambiar de pestaña. Antes del cambio fallaba en las **7** (también en la normal); después, pasa en las 7.
- **El cambio:** un solo narrador para todo el juego (`src/servicios/dialogo.ts`), que usan las pantallas y las aventuras; nunca suenan dos a la vez.
  - Cada pantalla, ejercicio y escena es dueña de sus frases. Al cambiar se descarta lo pendiente y se corta lo que suena; los avisos tardíos de audios viejos se ignoran (cada frase lleva su número de turno). Lo que una frase pidió hacer "al terminar" solo se hace si sigue en la misma pantalla. El globo tampoco se queda con el texto de la pantalla anterior.
  - En un ejercicio la consigna manda: se dice al empezar, se queda en el globo hasta que contestan (el festejo y la pista se dicen y se leen en el aviso de abajo) y el botón de repetir dice la consigna.
  - Las frases de una misma pantalla van en orden: una nueva espera a que termine la que suena. Las respuestas a un toque (salir, una lección cerrada, una estampa) sí se dicen en seguida.
  - Si el audio no suena por cualquier motivo, el globo se queda al menos 3 s más 0.5 s por palabra. Los ejercicios nunca avanzan solos por tiempos de audio.
- **Pruebas que se quedan:** `tests/dialogo.test.ts` (18), `e2e/dialogo.spec.ts` (7 condiciones) y `e2e/consignas.spec.ts`: la unidad 1 completa con la voz encendida y la unidad 2 con la voz apagada; en sus 48 ejercicios el globo muestra la consigna de ese ejercicio.

### 2. En la aventura de los botes, en el celular, la basura no se veía

- **Lo que se veía:** en un celular acostado (1346×644), en "¿A qué bote va el envase de jugo?", el envase salía cortado arriba; solo se veía una orilla.
- **La causa:** en la ronda extra de la aventura 1, la basura empezaba a caer desde FUERA del juego (arriba) con una caída que arranca muy despacio: durante 4 a 5 s, justo mientras Mixtle pregunta, solo se veía su orilla de abajo.
- **Revisadas las 5 aventuras** con una prueba nueva (`e2e/aventurasPantalla.spec.ts`): cada escena en celular acostado, tablet, compu, proyector y laptop con zoom de 125 % y 150 %. Lo que se toca o arrastra tiene que quedar completo, a 24 px de la orilla y sin que lo tape un botón de la página; la colita del globo tiene que apuntar a Mixtle. Antes fallaban 4 de 8 escenas; ahora pasan las 8:
  - Ronda extra: la basura aparece ya dentro de lo que se ve y cae desde ahí.
  - Nivel 1 (recoger basura en el parque): algunas piezas salían cortadas abajo o pegadas a la orilla derecha; las zonas donde se reparten dejan ahora lugar para la pieza completa (`tests/layoutParque.test.ts` lo revisa con 200 repartos al azar).
  - Nivel 3: un hoyo para plantar quedaba casi en la orilla.
  - Bici: la colita del globo apuntaba por encima de la cabeza de Mixtle.

### 3. Otras correcciones de la v3.2

- **Modo facilitador:** el respaldo de los grupos (exportar / importar) hacía crecer el panel y, en una laptop de 1366×768 o una tablet de 1024×768, "Borrar este grupo" quedaba debajo de lo que se ve. Ahora es un botón al lado del estado de "usar sin internet" que abre su propia ventana; el panel vuelve a caber.
- **Mudanza:** en una dirección vieja, la revisión de si mixtle.org ya sirve el juego se hace una vez por sesión; si falla, no se repite al recargar (solo al volver la conexión).

### 4. Documentos

- Manual del facilitador, README, `docs/traspaso.md` y notas técnicas: la dirección es mixtle.org, activa desde el 13 de noviembre de 2026. La guía explica qué hacer si el filtro de internet de una escuela bloquea mixtle.org (pasa en la red del Tec de Monterrey): en esa red no se muda nada y nadie pierde grupos.

### Verificado (14 de noviembre, contra el build de producción en local)

- Pruebas unitarias: **1647 de 1647**.
- Pruebas en el navegador, un solo navegador sin ventana: diálogo 7 de 7; aventuras en 6 pantallas 8 de 8; consignas de dos unidades enteras 2 de 2; grupos, camino, ficha, vestidor, recorrido completo de la aventura 1, árboles, encuentra el error, aventuras de las unidades 2 a 5 y modo facilitador: todas pasan, en proyector y en tablet.
- Mudanza con dos direcciones locales (`npm run mudanza:probar`): 43 de 43.

## v3.2 (13 de noviembre) — Traspaso a Eco Urban y mudanza a mixtle.org

La versión anterior queda en la etiqueta `v3.1.3-antes-traspaso`. Guía para Eco Urban: [`docs/traspaso.md`](docs/traspaso.md).

### 1. Mudanza automática a mixtle.org

- **La dirección del juego, en un solo lugar** (`src/sitio.ts`): la definitiva es **https://mixtle.org**; las viejas son `mixtle-al-rescate.vercel.app`, `caco-al-rescate.vercel.app` y sus direcciones de prueba `*.vercel.app`.
- **Se activa sola.** En una dirección vieja, el juego revisa en segundo plano si mixtle.org ya sirve **este** juego (`/salud.json`, con el nombre de la app y la versión; `vercel.json` le pone CORS solo a ese archivo). Si no responde, responde otra cosa o no hay internet, no pasa nada. Hoy mixtle.org no tiene el juego, así que la mudanza está dormida.
- **Cuando mixtle.org responde:** sin grupos, abre mixtle.org directo; con grupos, el aviso "El juego se cambió a mixtle.org. Vamos a llevar sus grupos" (solo en una pantalla segura, con botón y cuenta regresiva de 8 s), lleva todos los grupos con su avance y abre mixtle.org con la bienvenida.
- **No se pierde ningún grupo:** la dirección vieja solo quita sus grupos cuando mixtle.org confirma que los guardó y los volvió a leer (con firma). Si algo falla a la mitad, no se borra nada y se puede reintentar; al reintentar, el mismo grupo no se duplica. Los grupos mudados quedan además en un respaldo en la vieja.
- **Nombres repetidos:** el mismo grupo que llega dos veces se queda con el avance más grande; otro grupo con el mismo nombre se conserva como "(2)" y la bienvenida lo avisa.
- **App instalada** desde la dirección vieja: la bienvenida explica cómo instalarla otra vez desde mixtle.org.
- **Plan B a mano:** "Respaldo de los grupos" en el modo facilitador (y con 3 s sobre el título de "¿Quién va a jugar?", aunque no haya grupos): **Exportar grupos** descarga un archivo; **Importar grupos** lo valida por completo (juego, formato, cada grupo y la firma) y enseña qué se va a agregar antes de tocar nada. Funciona sin internet.
- La lógica y las pantallas de la mudanza se descargan solo cuando hacen falta: lo que se descarga antes de la primera pantalla bajó de 249.7 a **247.7 KB**.

### 2. El repositorio ya no depende de la cuenta de quien lo desarrolló

- README y notas técnicas apuntan a mixtle.org; las direcciones viejas solo quedan en la lista de `src/sitio.ts` y en la historia (este archivo y las mediciones con fecha). `index.html` lleva la url canónica y los metadatos para compartir desde `src/sitio.ts`.
- **Sin secretos:** no hay llaves, tokens, `.env` ni `.vercel/` en el repositorio ni en su historia, y la integración continua no usa secretos. La única llave del proyecto es la de Azure Speech, que solo sirve para generar voces nuevas: Eco Urban tendría que crear la suya (plan gratuito) y ponerla en `.env.local`, que nunca se sube.
- **Comprobado en un proyecto nuevo de Vercel sin variables de entorno** (13 de noviembre): una copia limpia del repositorio, sin `.env.local`, se construyó y publicó sola; el juego, `/salud.json` (con su CORS), el manifiesto, el service worker, las voces y la lista para usar sin internet respondieron 200. El proyecto de prueba se borró después.

### 3. Guía de traspaso

- [`docs/traspaso.md`](docs/traspaso.md), en español sencillo: recibir el repositorio en GitHub, publicar en Vercel, conectar mixtle.org y www.mixtle.org, qué pasa con los grupos, cuándo se puede borrar el proyecto puente, cómo volver a una versión anterior y cómo cambiar lo que dice Mixtle.

### Verificado (13 de noviembre)

- Pruebas unitarias: **1622 de 1622** (25 nuevas de la mudanza y el respaldo en `tests/mudanzaDefinitiva.test.ts`).
- Prueba en el navegador con dos direcciones locales (`npm run mudanza:probar`: la vieja en `localhost:4311`, la definitiva en `127.0.0.1:4312`; un Chrome sin ventana, uno nuevo por caso): **42 de 42**.
  - a) Con la definitiva apagada, sirviendo otra página o sin CORS, y sin internet: no aparece ningún aviso y los grupos siguen intactos; al volver la conexión revisa otra vez y aparece el aviso.
  - b) Dos grupos con avance (lecciones, cofre, estampa, accesorios puestos) llegan idénticos a la definitiva, que da la bienvenida; la vieja queda sin grupos, con su respaldo, sin mudanza pendiente, avisa a dónde se fueron y después manda directo a la definitiva.
  - c) La definitiva no puede guardar, se cae justo antes, o la confirmación de vuelta no llega: la vieja conserva todo; al reintentar (con el botón o con la cuenta regresiva) los grupos llegan completos y sin duplicados.
  - d) En la definitiva ya había otro "Ardilla 2°B": se conservan los dos, el que llegó se llama "Ardilla 2°B (2)" con todo su avance y la bienvenida lo dice.
  - e) Sin internet, "Exportar grupos" descarga el archivo y en otro aparato "Importar grupos" los agrega; un archivo ajeno o alterado se rechaza sin cambiar nada, e importar dos veces el mismo no duplica.
- Lo que encontró la prueba: al importar dos veces el mismo archivo, el aviso decía "se agregaron 2 grupos"; ahora dice cuántos ya estaban. Y el build de la prueba salía en modo de desarrollo (sin service worker) por una variable que dejaba otra herramienta; solo afectaba a la prueba, no al juego publicado.

## v3.1.3 (11 de noviembre) — Ajuste final

La versión anterior queda en la etiqueta `v3.1.2`.

### 1. "¿Quién va a jugar?": el globo de Mixtle ya no tapa las tarjetas

- En el celular acostado, el globo de texto de Mixtle tapaba la parte de abajo de las tarjetas de grupo y la mitad de "Nuevo grupo". La prueba de la v3.1.2 solo medía a Mixtle, no a su globo, y por eso no lo vio.
- **La pantalla ahora tiene dos zonas que no se enciman.** La lista de grupos se desplaza en su propia área. En pantallas bajas (celular acostado, laptop con zoom al 150 %), Mixtle va en una columna a la izquierda con el globo arriba y más angosto (271 px), y la lista empieza debajo de los botones de sonido. En las demás pantallas, Mixtle y su globo van en un renglón propio abajo. Las tarjetas de los grupos no cambian de tamaño.
- **Medido** con 2, 4 y 7 grupos, arriba de la lista y desplazada hasta abajo: nada tapa ninguna tarjeta en compu, laptop con zoom al 125 y 150 %, celular acostado, tablet y tablet parada. En el celular parado y en la tablet chica parada el juego pide girar el aparato.
- **Prueba nueva:** `e2e/grupos.spec.ts` revisa a Mixtle, su globo mientras habla y la marca de Eco Urban. Se comprobó que falla si el globo vuelve a tapar las tarjetas.

### 2. La banda de guardián, verde

- `BANDA = 'verde'`: verde Eco Urban (#009345) con el logotipo en blanco. Logo de la pantalla de carga, hoja de personaje y `docs/marca/banda-variantes.png` regenerados. Los íconos de la app no cambian.

### Verificado (11 de noviembre)

- Pruebas unitarias: 1599 de 1599. Pruebas de navegador contra producción, con un solo navegador sin ventana: selección de grupo 8, camino 4, ficha 18, vestidor 12, recorrido completo 14 y aventuras 8. Todas pasaron.
- La actualización llega sola a un equipo que tenía la v3.1.2: la versión nueva toma el control a los 5.7 s y el grupo conserva su avance.

## v3.1.2 (11 de noviembre) — Ajustes de marca Eco Urban

La versión anterior queda en la etiqueta `v3.1.1-estable`.

### 1. La banda de guardián de Mixtle

- **La banda:** Mixtle trae una banda cruzada del hombro a la cadera, como la de un guardaparques, con "eco urban" escrito a lo largo. El pin va prendido encima (`src/arte/bandaEcoUrban.ts`). Es de tela con su pliegue, su sombra y su orilla, y se recorta con la silueta del torso.
- **El texto:** el logotipo va a todo color y sin deformar, siguiendo la inclinación de la banda. Queda libre de brazos, cabeza y pin en 11 de las 12 poses; en "celebrando" el brazo levantado la cruza y va sin texto.
- **Solo donde se lee:** el texto aparece cuando Mixtle es grande (cuerpo de 250 px o más): inicio y vestidor en una laptop de 1366×768, proyector y vitrina. Más chico, va solo la tela con el pin.
- **Más espacio en el vestidor:** la vista previa creció para que Mixtle mida 277 px en una laptop de 1366×768, sin tocar las tarjetas.
- **Variantes:** blanca (en uso), verde, o ninguna, en `docs/marca/banda-variantes.png`. Se cambia con un solo valor, `BANDA`.
- **Revisado:** convive con los 6 accesorios del vestidor y aparece en la galería `?mixtle`. Los ids son únicos por cada Mixtle. El ícono de la app no cambia.
- **Pruebas:** `tests/bandaEcoUrban.test.tsx`.

### 2. Mixtle más grande en "¿Quién va a jugar?"

- Mixtle guía, abajo a la izquierda, mide ahora lo que su globo de texto o un poco más: 146 px en una laptop de 1366×768 (antes 85), 117 px con zoom al 125 %, y 104 px con zoom al 150 % y en celular. Se ven su pin y su banda.
- No tapa ninguna tarjeta de grupo ni "Nuevo grupo", con 2, 4 o 7 grupos, arriba o desplazado hasta abajo, en compu, laptop con zoom al 125 y 150 %, celular y tablet. La lista deja abajo el espacio de Mixtle y, en pantallas bajas, también las franjas de los lados.
- El Mixtle de la tarjeta "Cacomixtle" lleva su banda y su pin. El texto de la banda no va ahí: la tarjeta es chica.

### 3. La marca de Eco Urban: pequeña, en la esquina y solo el logo

- **Un solo componente**, `MarcaEcoUrban`: solo el logotipo, sin "Un proyecto de" ni "Con el apoyo de", a todo color sobre una pastilla blanca semitransparente. Mide de 14 px (celular) a 22 px de alto (20 px en 1366×768). No se puede tocar ni es un enlace.
- **Dónde va:**
  - Pantalla de carga: abajo a la derecha.
  - Inicio: arriba a la izquierda, sobre la copa del árbol. Abajo a la derecha estorbaba la ardilla, y abajo a la izquierda está el aviso de "Toca la pantalla".
  - "¿Quién va a jugar?": abajo a la derecha.
  - Camino de unidades: abajo a la izquierda, fija, sin tapar las paradas.
  - Diploma: al centro del pie, y sale al imprimir.
  - No va en las lecciones.
- **Primera pantalla:** 249.7 KB, dentro del límite de 250 KB.

### 4. El árbol del parque del grupo, completo

- En "El parque de [grupo]" la copa del árbol grande salía cortada por el borde de arriba: el marco es más ancho que 16:9 y el dibujo del parque se recortaba arriba. Ahora el parque del grupo usa un dibujo a lo ancho (`parque-ancho`, 1920×720), con el árbol grande un poco más chico y el sol más abajo. Cabe completo con cualquier avance, en el camino, al terminar una lección y en la vitrina, en compu y en celular (`tests/parqueGrupo.test.ts`).

## v3.1.1 (10 de noviembre) — Ajustes finales para Eco Urban

La versión anterior queda en las etiquetas `v3.1-pin-chico` y `v3.1-antes-ajustes`.

### 1. El pin de Mixtle se ve

- **Lugar nuevo:** en el pecho, arriba y al centro, sobre la parte clara, justo debajo de la barbilla. Antes iba en un costado del vientre.
- **Tamaño:** 16 % del alto del cuerpo ("destacado"). Antes medía 8 %. Hay tres opciones, "visible" (14 %), "destacado" (16 %) y "grande" (18 %), en `docs/marca/pin-variantes.png`.
- **En pantalla:** nunca mide menos de 16 px. En React, el pin va aparte del dibujo, entre el cuerpo y los brazos (`MixtleFigura`).
- **Legible:** en el inicio y en el vestidor se lee "eco urban" en una compu de 1366×768. El juego usa el acomodo apilado, cuyas letras miden 1.6 veces las de una línea. La vista previa del vestidor creció, de 200 a 353 px de alto en 1366×768.
- **Siempre encima de los accesorios:** queda por arriba del paliacate y de lo que se ponga en el cuello, como prendido a la tela. Se revisaron los 6 accesorios uno por uno. La mochila volvió a su lugar original, porque ya no tapa nada.
- **En las 12 poses:** los brazos que cruzan el pecho le tapan, cuando mucho, una orilla. Siempre se ve al menos el 70 % (lo menos, "pensando": 74.5 %), y colgado de la rama se ve completo.
- **Borde:** uno gris muy claro, para que no se pierda sobre la panza.
- **Sin cambios:** el ícono de la app y el de la pestaña se ven igual que antes.
- **Presupuesto:** el trazo del logotipo se aligeró de 3.9 a 2.3 KB comprimido, con píxeles enteros y menos puntos. Coincide en 98.4 a 98.6 % con el original. La primera pantalla quedó en 246.8 KB, dentro del límite de 250 KB.
- **Pruebas:** `tests/pinEcoUrban.test.tsx` mide lo que se ve del pin en cada pose y revisa que vaya encima de cada accesorio y que nunca mida menos de 16 px.

### 2. "Toca lo que lastima al árbol" y las demás escenas de "encuentra el error"

- **La escena cabe completa y la barra no tapa nada.** La escena usa todo el espacio que le deja la lección. Abajo se aparta el alto de la barra de respuesta. En pantallas bajas (laptop, laptop con zoom al 125 y 150 %, celular), Mixtle y su globo van a un lado y no arriba. El marcador de lo encontrado va sobre el cielo.
- **Dibujos nuevos:** una rama gruesa del mismo árbol, quebrada con su astilla clara, colgando de una tira de corteza y con las hojas marchitas (`rama-colgando` en la escena, `rama-rota` con un pedazo de tronco en la tarjeta). Una lata de refresco roja, tirada de lado y abollada (`lata-tirada`).
- **u3-l1-e5:** todo está en el árbol del parque. La rama cuelga del tronco, la lata está al pie, y el nido y la ardilla en la copa, fuera del camino.
- **Las 9 escenas de las 5 unidades revisadas:** u1-l2-e1, u1-l4-e3, u2-l2-e3, u2-l3-e6, u3-l1-e5, u3-l3-e2, u4-l2-e4, u5-l2-e3 y u5-l4-e6. Cada objeto se toca en al menos 48 px y ninguno se encima ni en un celular. Se reacomodaron 8 de ellas: las ardillas salieron del camino, los botes crecieron con su basura encima, el árbol de la calle ya no tapa la casa y la lata en el pasto ahora es la lata tirada.
- **Pruebas:** `e2e/encuentra.spec.ts` revisa las 9 escenas en 1366×768, en laptop con zoom al 125 y 150 %, en celular y en proyector: todo dentro de la pantalla, en 48 px, sin encimarse y sin quedar bajo la barra. `tests/encuentraError.test.ts` hace la misma cuenta en papel.

### 3. Eco Urban en las pantallas

- **El logotipo** va a todo color y sin deformar, sobre una pastilla blanca con sombra suave. No es un enlace. Aparece en cuatro lugares:
  - **Pantalla de carga:** "Un proyecto de [eco urban]", debajo del logo.
  - **Inicio:** debajo de "¡Jugar!". En pantallas bajas, el botón sube un poco para dejarle aire.
  - **"¿Quién va a jugar?":** junto al aviso de dónde se guarda el avance.
  - **Diploma:** "Con el apoyo de [eco urban]" en el pie. Se ve también al imprimir.
- **Sin pesar de más:** el logotipo es el mismo trazo del pin. En la pantalla de carga se reutiliza con `<use>`. La rama y la lata nuevas se cargan con las lecciones, no en la primera pantalla. Primera pantalla: 248.1 KB, dentro del límite de 250 KB.
- **El diploma:** el Mixtle del grupo y su firma crecieron un poco, para que el pin se vea en papel.

## v3.1 (9 de noviembre) — Correcciones solicitadas por Eco Urban

Eco Urban aprobó el juego y pidió dos correcciones. La versión anterior queda en la etiqueta `v3-antes-correcciones`.

### 1. El ejercicio "Toca el árbol grande"

- **El problema:** cada dibujo llenaba su tarjeta, así que el arbolito (tres copas con frutas) se veía más alto que el árbol grande (en producción: 175 px contra 134 px) y el juego marcaba mal a quien tocaba el que se veía más grande.
- **Las tres etapas se redibujaron** en las mismas unidades (`src/arte/arboles.ts`): el brote, pegado al suelo; el arbolito, joven, de tronco delgado y sin frutas, de la mitad de alto que el árbol grande; y el árbol grande, de tronco grueso y copa frondosa.
- **El motor ya no agranda cada dibujo por separado cuando se comparan:** si dos o más dibujos de la misma familia aparecen juntos (elegir, ordenar o unir parejas), se pintan en un lienzo común, con la misma escala y la misma línea de suelo (`src/arte/escala.ts`). Solos, siguen llenando su tarjeta.
- El árbol con frutas no se perdió: queda como `arbol-frutal`, para usarse solo donde el contenido hable de frutos. Hoy ninguna lección ni aventura lo hace, así que se ve solo en la galería. Donde antes aparecía, ahora va el dibujo que corresponde: el arbolito joven en las lecciones de plantar y al sembrar en la aventura de la unidad 1, y el árbol grande en el parque del grupo. La aventura "Siembra un bosquecito" crece con las tres etapas en proporción.
- **Revisión de las 5 unidades** (124 ejercicios) buscando la misma clase de confusión. Se corrigieron cuatro más: la "botella llena de jugo" se dibujaba vacía; el "cielo gris" era beige y competía con el humo, que sí es gris; la botella desechable traía una etiqueta verde frente a la pista "es verde y tiene tapa"; y la pista de "Ordena el viaje de la botella" invitaba a tocar primero el bote (se cambió el texto y se regeneró solo esa frase de voz). El arbolito en su bolsa de vivero es ahora el mismo arbolito de las lecciones.
- **Pruebas nuevas:** `e2e/arboles.spec.ts` mide en pantalla, en píxeles reales, que brote < arbolito < árbol grande con margen (cada etapa, como mucho dos tercios de la siguiente) y resuelve el ejercicio tocando el dibujo que se ve más alto; `tests/escalaArte.test.tsx` cuida las proporciones y que el motor use la versión en escala.

### 2. El pin de Eco Urban en Mixtle

- **El logotipo "eco urban"** se calcó en trazos del archivo de Eco Urban (`scripts/marca/trazar-eco-urban.py`): coincide en 99.3 % de los píxeles y conserva los colores del original (verde #009345 y azul petróleo #1E4959), sin fuentes del sistema, sin deformarlo y sin efectos encima.
- **El pin:** un botón blanco abombado, con contorno fino, brillo en la orilla y sombra sobre el pelaje (`src/arte/pinEcoUrban.ts`). Tiene dos versiones: la **grande** lleva el logotipo completo (inicio, diploma, vestidor, pantalla de carga, festejos) y la **chica** pone "eco" sobre "urban" (lección, globo, camino, aventuras e ícono de la app).
- **Mixtle lo trae siempre** en el pecho, del lado izquierdo de él: en las 12 poses y en todas sus apariciones (logo, pantalla de carga, inicio, globo, lección, recorrido guiado, diploma, transición, vestidor, vitrina y aventuras). Sigue al cuerpo al respirar, brincar y saludar. En espejo se sigue leyendo derecho y cada Mixtle trae sus propios degradados.
- **Convive con los brazos y los accesorios:** ningún brazo lo toca en ninguna pose y el paliacate queda arriba. En Mixtle, la mochila del vestidor va a la espalda (antes tapaba ese lugar).
- **Tres tamaños** para que Eco Urban elija (`docs/marca/pin-variantes.png`). Queda "medio"; se cambia con un solo valor, `TAMANO_PIN`.
- **Dónde más:** sección "Pin Eco Urban" en la página `?mixtle`; logo, íconos y hoja de personaje regenerados (el favicon de la pestaña queda sin pin: a 16 px sería una mancha); `docs/marca.md` y `CREDITOS.md`. El logotipo es de Eco Urban A.C. y se usa con su autorización.
- **Pruebas nuevas:** `tests/pinEcoUrban.test.ts`, con 24 casos: presencia en cada aparición, colores, choques con brazos y accesorios, espejo e ids.

### Verificado en producción (10 de noviembre)

- Pruebas unitarias: 1546 de 1546. Pruebas de navegador contra https://mixtle-al-rescate.vercel.app, con un solo navegador sin ventana: 64 de 64, en proyector (1920×1080) y tablet (1024×768).
- "Toca el árbol grande" se resuelve tocando el árbol que se ve más alto (árbol 182 px, arbolito 96 px y brote 49 px en una compu de 1366×768). En "Ordena cómo crece un árbol", ya ordenado, el crecimiento es progresivo y sobre el mismo suelo.
- Mixtle trae el pin en el inicio, la lección, el vestidor, el diploma, las aventuras y la galería `?mixtle`.
- La actualización llega sola a un equipo que ya tenía la versión anterior: toma el control a los 5.9 s y el grupo conserva su avance.
- Capturas de antes y después para Eco Urban en `docs/capturas/correcciones/`.

## Entrega (30 de octubre)

- Repositorio limpio para compartirlo con Eco Urban: se quitó el material de trabajo interno, las mediciones pasaron a `docs/mediciones/`, el README se reescribió como documento de entrega y se agregó la licencia MIT.
- Cierres sobre la versión aprobada: el modo facilitador cabe en la tablet (1024×768) con "Cerrar" siempre a la vista; el paliacate se nota puesto en la mariposa monarca; la prueba de la aventura que una vez marcó "0 frases con audio" se explicó (era la comprobación de nombres de archivo, no la voz); se midió "Listo para usar sin internet" con red lenta en producción (3.8 min) y la corrida completa de recorridos contra producción (58 de 58).

## v3-demo (29 de octubre, noche) — la versión que Eco Urban aprobó el 30 de octubre

- Mixtle se ve igual en todas sus apariciones (los degradados del SVG en línea ya no se mezclan entre instancias); página `?mixtle` para revisarlo.
- Paliacate rediseñado como un paliacate mexicano anudado al cuello.
- El vestidor muestra a la mascota siempre dentro de su recuadro, con las seis mascotas y todos los accesorios, en seis tamaños de pantalla.
- Mixtle saluda al grupo nuevo si cambia el grupo con el camino en pantalla.

## v3-estable (29 de octubre)

- Voz de Mixtle con **Azure AI Speech** (Alejo, español de México, estilo «excited»), elegida entre muestras de 12 voces. Recorte del silencio de los audios (de 30 % a 16 %) y frases con números dichas de corrido.
- Carga rápida con red lenta: "¡Jugar!" → "¿Quién va a jugar?" de 5.2 s a 0.35 s (Slow 4G). El *service worker* guarda primero lo esencial y el resto baja en segundo plano; el modo facilitador muestra "Listo para usar sin internet".
- Las versiones nuevas se activan solas (también con la pestaña abierta) y la página se recarga en una pantalla segura, nunca a media lección; aviso en el inicio por si acaso.
- Recorrido guiado del camino la primera vez de cada grupo; vestidor que pregunta antes de comprar; grupo de demostración y borrar grupo en el modo facilitador.
- La música suena desde el primer toque en cualquier parte del inicio y ya no se calla sola en Chrome (contexto de audio propio); `?depurar-audio` para diagnosticar.

## v3 (28 de octubre)

- **Nuevo nombre y marca:** "Mixtle al rescate", lema "Guardianes del parque", logo en SVG, ícono de la app, pantalla de carga y hoja de personaje con 8 poses. Dirección visual "Parque de día", elegida entre tres propuestas.
- Inicio animado (parque en capas con el Nevado de Toluca, Mixtle que llega columpiándose), transición de marca entre pantallas y modo vitrina para ferias.
- Cada toque responde (botones que se aplastan, chispas, sonidos); lluvia de hojitas al acertar; racha dentro de la lección; cofre, estampa, parque "Antes → ¡Ahora!" y fin de unidad con celebración; diploma imprimible por unidad.
- Un ambiente y una paleta por unidad (parque, humedal, bosque del Nevado, calles de Toluca, escuela) que decora los lados del camino; el parque del grupo como protagonista.
- Vestidor: accesorios para la mascota del grupo a precio fijo en hojitas.
- Se quitó la racha de días y la comparación de hojitas entre grupos.
- Medido: 59–60 fps con tarjeta de video; en equipos sin ella el juego pasa solo a animaciones suaves. Primera pantalla por debajo de 250 KB.
- Revisión del 28 de octubre: cola anillada de Mixtle en todas sus poses, la mascota del grupo no tapa nada en el camino, el encabezado del camino cabe en una línea en la tablet.

## v2-eco-urban (27 de octubre) — primera versión que vio Eco Urban

- Arquitectura nueva: React para las pantallas y Phaser solo para las aventuras.
- Camino de aprendizaje con 5 unidades, 20 lecciones de 6 a 7 ejercicios con 7 tipos de ejercicio dirigidos por datos, cofres y una aventura por unidad.
- Grupos de salón (animal, color y etiqueta), avance guardado en el aparato, álbum de estampas con animales de Toluca.
- Voz pregenerada del personaje, igual en todos los equipos, y música CC0 con *ducking*.
- Se quitó el módulo de cámara de la v1.
- Primeras mediciones en producción y recorridos automáticos en el navegador.

## v1 (26 de octubre)

- Prototipo "Caco al rescate" en Phaser: intro, tres niveles (limpiar el parque, ¿a qué bote va?, un hogar para los animales), bonus y diploma "Guardianes del parque". Arte original en SVG, voz del navegador, contenido configurable en archivos de datos.

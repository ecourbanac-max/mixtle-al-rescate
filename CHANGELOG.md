# Historial de versiones

Fechas de octubre y noviembre de 2026. Las etiquetas de git marcan las versiones que vio Eco Urban.

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

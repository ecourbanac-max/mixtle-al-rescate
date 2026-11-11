# Historial de versiones

Fechas de octubre y noviembre de 2026. Las etiquetas de git marcan las versiones que vio Eco Urban.

## v3.1 (9 de noviembre) — Correcciones solicitadas por Eco Urban

Eco Urban aprobó el juego y pidió dos correcciones. La versión anterior queda en la etiqueta `v3-antes-correcciones`.

### 1. El ejercicio "Toca el árbol grande"

- **El problema:** cada dibujo llenaba su tarjeta, así que el arbolito (tres copas con frutas) se veía más alto que el árbol grande (en producción: 175 px contra 134 px) y el juego marcaba mal a quien tocaba el que se veía más grande.
- **Las tres etapas se redibujaron** en las mismas unidades (`src/arte/arboles.ts`): el brote, pegado al suelo; el arbolito, joven, de tronco delgado y sin frutas, de la mitad de alto que el árbol grande; y el árbol grande, de tronco grueso y copa frondosa.
- **El motor ya no agranda cada dibujo por separado cuando se comparan:** si dos o más dibujos de la misma familia aparecen juntos (elegir, ordenar o unir parejas), se pintan en un lienzo común, con la misma escala y la misma línea de suelo (`src/arte/escala.ts`). Solos, siguen llenando su tarjeta.
- El árbol con frutas no se perdió: es `arbol-frutal`, el árbol del parque del grupo y de la aventura de la unidad 1. La aventura "Siembra un bosquecito" crece ahora con las tres etapas en proporción.
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

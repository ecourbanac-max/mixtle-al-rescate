# Créditos y licencias

El proyecto completo (código, textos y arte originales) está bajo la **licencia MIT** (ver `LICENSE`): Eco Urban A.C. puede usarlo, modificarlo y distribuirlo libremente. Esta página lista los recursos de terceros, que conservan su propia licencia.

## Arte (original de este proyecto)

| Recurso | Dónde está | Fuente | Licencia |
|---|---|---|---|
| Mixtle el cacomixtle (cuerpo, expresiones y cola) y el botón de su pin | `src/arte/personajes.ts`, `src/arte/pinEcoUrban.ts` | Dibujado en código SVG para este proyecto | Original, sin recursos de terceros. MIT (ver `LICENSE`) |
| Ardilla gris mexicana, colibrí y mariposa monarca | `src/arte/personajes.ts` | Dibujado en código SVG para este proyecto | Igual que arriba |
| Parque con el Nevado de Toluca, nubes, arbusto, árboles, flores, brote, tierra, bolsa; las etapas del árbol (brote, arbolito, árbol grande) | `src/arte/escenario.ts`, `src/arte/arboles.ts` | Dibujado en código SVG para este proyecto | Igual que arriba |
| 12 residuos | `src/arte/residuos.ts` | Dibujado en código SVG para este proyecto | Igual que arriba |
| Botes, tapas e íconos de categoría | `src/arte/botes.ts` | Dibujado en código SVG para este proyecto | Igual que arriba |
| Íconos de interfaz (voz, música, repetir, etc.) y de la app | `src/arte/iconos.ts`, `public/favicon.svg`, `public/iconos/` | Dibujado en código SVG para este proyecto | Igual que arriba |

Mixtle es un personaje original: se dibujó a partir de rasgos reales del cacomixtle (*Bassariscus astutus*): cuerpo esbelto gris-pardo, orejas grandes, anillos claros alrededor de los ojos y cola larga con anillos blancos y negros.

## Logotipo de Eco Urban

El logotipo "eco urban" que Mixtle trae en su pin (`src/arte/ecoUrban.generado.ts`, calcado del archivo que entregó Eco Urban; ver `src/arte/pinEcoUrban.ts` y `docs/marca.md`) **es propiedad de Eco Urban A.C. y se usa con su autorización.** No está cubierto por la licencia MIT de este proyecto: quien reutilice el juego fuera de Eco Urban debe quitarlo o pedir permiso a Eco Urban A.C. El botón del pin (forma, brillo y sombra) sí es original de este proyecto (MIT).

## Música (solo CC0)

Elegida por el equipo entre candidatas CC0 verificadas en su página (`npm run musica:muestras` las genera en `docs/muestras-musica/`, que no va en el repositorio). Los archivos del juego están en `public/musica/` (normalizados y recomprimidos con `npm run musica:instalar`).

| Pista del juego | Obra | Autor | Fuente | Licencia |
|---|---|---|---|---|
| `tranquila.mp3` (menú y camino) | Happy Lullaby (song17) | cynicmusic | <https://opengameart.org/content/happy-lullaby-song17> | CC0 |
| `lecciones.mp3` (lecciones y aventuras) | Children's March Theme | CleytonKauffman | <https://opengameart.org/content/childrens-march-theme> | CC0 |
| `celebracion.mp3` (al terminar) | Cozy Puzzle Jingle & Result — Clear (Jingle) | MintoDog | <https://opengameart.org/content/cozy-puzzle-jingle-result> | CC0 |

Las demás candidatas también son CC0; sus fuentes están en `scripts/musica/candidatas.json`.

## Voz de Mixtle

| Qué | Detalle | Licencia |
|---|---|---|
| Audios de las frases (`public/voz/*.mp3`) | Generados con **Azure AI Speech** de Microsoft, plan gratuito (voz `es-MX-Alejo:MAI-Voice-2-Flash`, estilo «excited»), ver `voz.config.json` | Su uso se rige por los términos del servicio Azure AI Speech |
| Voz alterna | **Kokoro** (voz `em_alex`, español latinoamericano), generada en la laptop del equipo | El modelo Kokoro-82M y sus voces son Apache-2.0 |
| Modelo [Kokoro-82M](https://huggingface.co/hexgrad/Kokoro-82M) (versión ONNX de [kokoro-onnx](https://github.com/thewh1teagle/kokoro-onnx)) | Solo se usa para generar; no se incluye en el juego | Apache-2.0 (modelo y voces), MIT (kokoro-onnx) |
| espeak-ng (vía `espeakng-loader`) | Convierte texto a fonemas al generar; no se incluye en el juego | GPL-3.0 (herramienta de desarrollo) |
| Respaldo | Si a una frase le falta su audio, se usa la voz del navegador (Web Speech API) | Según el navegador |

Muestras que se compararon al elegir la voz (se generan con `npm run voz:muestras`; no están en el repositorio ni se usan en el juego):

- Piper `es_MX-ald-medium`: datos [Ald Mexican Spanish](https://huggingface.co/datasets/rmcpantoja/Ald_Mexican_Spanish_speech_dataset) (Unlicense), afinado desde `es_ES-davefx` (datos CC0).
- Piper `es_MX-claude-high`: datos de [HirCoir/Piper-TTS-Spanish](https://huggingface.co/spaces/HirCoir/Piper-TTS-Spanish) (Apache-2.0).
- edge-tts (`es-MX-DaliaNeural`, `es-MX-JorgeNeural`): voces neuronales de Microsoft a través de un servicio no oficial.

Si Eco Urban graba la voz de una persona (ver README), sus grabaciones reemplazan a estas y se registran aquí.

## Efectos de sonido (originales de este proyecto)

`public/sonidos/*.mp3` se generan a partir de las recetas de `src/servicios/recetasSonido.ts` con un sintetizador propio (`npm run sonidos:generar`): osciladores, envolventes y ruido filtrado. No hay sonidos de terceros.

Los de la v3 también son propios: el remate musical del logo (`remate`), la transición entre pantallas (`barrido`), la hojita que llega al contador (`hojita`), la racha dentro de la lección (`racha`) y la mitad de la lección (`mitad`).

## Tipografía

[Nunito](https://fonts.google.com/specimen/Nunito) de Vernon Adams y colaboradores, **SIL Open Font License 1.1**, autoalojada con [@fontsource/nunito](https://fontsource.org/fonts/nunito) (solo el subconjunto latino). El juego no pide nada a Google Fonts.

[Baloo 2](https://fonts.google.com/specimen/Baloo+2) de Ek Type, **SIL Open Font License 1.1**, autoalojada con [@fontsource/baloo-2](https://fontsource.org/fonts/baloo-2) (ExtraBold, subconjunto latino): títulos y botones. Las letras del logo están convertidas en trazos a partir de Baloo 2 y Nunito con [opentype.js](https://opentype.js.org) (MIT, solo al generar la marca).

## Bibliotecas de código (incluidas en el juego)

| Biblioteca | Uso | Licencia |
|---|---|---|
| [React](https://react.dev) 18 | Pantallas de la app | MIT |
| [Phaser 3](https://phaser.io) 3.90 | Motor de las aventuras | MIT |
| [Howler.js](https://howlerjs.com) 2.2 | Música, voz y efectos | MIT |
| [Motion](https://motion.dev) 14 | Animaciones de la interfaz | MIT |
| [Zustand](https://zustand.docs.pmnd.rs) 5 | Estado de la app | MIT |
| [Tailwind CSS](https://tailwindcss.com) 4 | Estilos | MIT |
| Workbox (vía vite-plugin-pwa) | Funcionar sin internet | MIT |

Herramientas de desarrollo (no se incluyen en el juego publicado): Vite (MIT), TypeScript (Apache-2.0), Vitest (MIT), Testing Library (MIT), happy-dom (MIT), Playwright (Apache-2.0), ESLint y typescript-eslint (MIT), vite-plugin-pwa (MIT), Piper (GPL-3.0), edge-tts (LGPL-3.0), imageio-ffmpeg/ffmpeg (BSD-2/LGPL), soundfile (BSD-3).

## Contenido educativo

Los datos curiosos de `src/data/residuos.ts` y la clasificación de residuos siguen el criterio común en México (orgánico / reciclable / no reciclable). Deben revisarlos las educadoras y educadores de Eco Urban A.C. antes de usar el juego con grupos (ver `TODO` en `src/data/categorias.ts`).

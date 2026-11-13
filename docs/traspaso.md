# Traspaso de Mixtle al rescate a Eco Urban

Esta guía es para la persona de Eco Urban que va a quedarse con el juego. No hace falta saber programar: son pasos en páginas web (GitHub, Vercel y el sitio donde compraron el dominio `mixtle.org`). Calculen **una hora** para todo, más el tiempo que tarde en activarse el dominio.

Al terminar:

- El **código** del juego estará en la cuenta de GitHub de Eco Urban.
- El **juego** estará publicado en la cuenta de Vercel de Eco Urban, en **<https://mixtle.org>**.
- Las laptops y tablets que hoy usan la dirección vieja (`mixtle-al-rescate.vercel.app` o `caco-al-rescate.vercel.app`) **pasarán solas sus grupos a mixtle.org**, sin perder el avance.
- René quedará como colaborador, para ayudar si algo falla.

> **Estado (13 de noviembre de 2026):** los pasos 1, 2 y 3 ya están hechos. El repositorio es de Eco Urban (`github.com/ecourbanac-max/mixtle-al-rescate`, con René como colaborador), el juego se publica desde la cuenta de Vercel de Eco Urban y **<https://mixtle.org> está activo desde el 13 de noviembre de 2026** (`www.mixtle.org` lleva a `mixtle.org`). Desde entonces la mudanza de las direcciones viejas está **activa** (paso 4). Lo que sigue: pedir a los facilitadores que abran una vez el juego en cada aparato (paso 4) y, cuando se cumpla el paso 5, que René borre su proyecto.

> **Importante para todos los salones:** el avance de cada grupo se guarda **solo en el navegador** de cada laptop o tablet. **Nunca usen "Borrar datos del sitio" o "Borrar historial y datos"** en el navegador: eso borra los grupos.

---

## Paso 1. Recibir el repositorio en GitHub

El **repositorio** es la carpeta con todo el código, los dibujos y las voces del juego. Vive en GitHub.

1. Si Eco Urban todavía no tiene cuenta en GitHub, créenla en <https://github.com/signup> con un correo de Eco Urban (no uno personal: así no depende de una sola persona). Guarden la contraseña donde guardan las demás de la organización y activen la verificación en dos pasos cuando GitHub la pida.
2. Pásenle a René el **nombre de usuario** de esa cuenta. Él hace la transferencia.
3. Llegará un correo de GitHub: **"…wants to transfer the repository mixtle-al-rescate to you"**. Ábranlo y toquen el botón para **aceptar** (el enlace dura **un día**; si se vence, René lo vuelve a mandar).
4. Comprueben: en GitHub, arriba a la derecha, su foto → **Your repositories** → debe aparecer **mixtle-al-rescate**.
5. **Agreguen a René como colaborador:** en el repositorio → **Settings** (engrane, arriba) → **Collaborators** (menú de la izquierda) → **Add people** → escriban `renecano` → elijan su usuario → **Add to repository**. René recibirá un correo para aceptar.

Listo: el código ya es de Eco Urban.

---

## Paso 2. Publicar el juego en Vercel

**Vercel** es el servicio que pone el juego en internet. Cada vez que algo cambia en el repositorio, Vercel publica la versión nueva sola en uno o dos minutos.

1. Entren a <https://vercel.com/signup>.
   - Si les pregunta el tipo de plan, elijan **Hobby** (gratis).
   - Elijan **Continue with GitHub** y entren con la cuenta de GitHub de Eco Urban del paso 1. Si GitHub pregunta si Vercel puede ver sus repositorios, acepten (pueden elegir "Only select repositories" y marcar solo **mixtle-al-rescate**).
2. En Vercel: **Add New…** → **Project**.
3. En la lista **Import Git Repository** aparece **mixtle-al-rescate** → **Import**.
4. En la pantalla de configuración:
   - **Project Name:** escriban **`mixtle`**. ⚠️ **No** lo llamen `mixtle-al-rescate`: ese nombre es el de la dirección vieja, y el juego lo trata como "dirección de antes".
   - **Framework Preset:** debe decir **Vite** (lo detecta solo).
   - **Root Directory:** déjenlo como está (`./`).
   - **Build and Output Settings** y **Environment Variables:** **no toquen nada**. El juego **no necesita variables de entorno** ni llaves; todo lo que Vercel necesita ya está en el archivo `vercel.json` del repositorio.
5. Toquen **Deploy** y esperen unos 2 o 3 minutos. Al final sale confeti y una vista previa del juego.
6. Comprueben: toquen la vista previa (o **Visit**). Se abre el juego en una dirección como `mixtle-xxxx.vercel.app`. Debe verse la pantalla de inicio con Mixtle y el botón **¡Jugar!**.

> **Sobre el plan gratuito.** El plan Hobby de Vercel es para uso no comercial. El juego es gratuito y educativo, pero conviene que alguien de Eco Urban lea las condiciones. Si un día Vercel les pide cambiar de plan, el plan Pro cuesta unos 20 dólares al mes; el juego no cambia.

---

## Paso 3. Conectar mixtle.org

Ahora el juego tiene que abrirse en **mixtle.org** (y **www.mixtle.org** debe llevar ahí mismo).

### 3.1 En Vercel

1. En el proyecto **mixtle** → **Settings** → **Domains** (menú de la izquierda).
2. Escriban **`mixtle.org`** → **Add**.
3. Si Vercel pregunta, elijan la opción recomendada: **agregar también `www.mixtle.org` y redirigirlo a `mixtle.org`**. Así, `mixtle.org` es la **principal** y `www.mixtle.org` lleva a ella. (Si no pregunta: agreguen también `www.mixtle.org` y, en ese renglón, **Edit** → **Redirect to** → `mixtle.org` → **Save**.)
4. Al lado de cada dominio saldrá **Invalid Configuration** en rojo y, abajo, una tablita con los **registros DNS** que hay que poner. **Copien exactamente lo que diga ahí.** Suele verse así (los valores de ustedes pueden ser distintos; manda lo que diga Vercel):

   | Tipo (Type) | Nombre (Name / Host) | Valor (Value / Points to) |
   |---|---|---|
   | `A` | `@` (o vacío) | una dirección IP, por ejemplo `76.76.21.21` |
   | `CNAME` | `www` | algo como `cname.vercel-dns.com` |

### 3.2 En el sitio donde compraron el dominio

Es la página donde se pagó `mixtle.org` (GoDaddy, Namecheap, Hostinger, Squarespace, Cloudflare u otro). Si no saben cuál es, busquen el correo de la compra o de la renovación del dominio.

1. Entren a su cuenta y busquen el dominio **mixtle.org** → la sección **DNS**, **Zona DNS**, **Administrar DNS** o **DNS Records**.
2. **Registro A de `@`:** si ya hay uno (o varios) con nombre `@`, **edítenlo** para que tenga el valor que dio Vercel; si hay más de uno, dejen solo el de Vercel. Si no hay, agréguenlo.
3. **Registro CNAME de `www`:** igual: si ya existe, cámbienle el valor al que dio Vercel; si no, agréguenlo. (Si hay un registro A con nombre `www`, bórrenlo: no puede haber A y CNAME con el mismo nombre.)
4. **No borren nada más.** En especial, **no toquen los registros `MX` ni `TXT`**: son los del correo de Eco Urban.
5. Guarden.

### 3.3 Cuánto tarda y cómo saber que ya quedó

- Normalmente tarda **entre 10 minutos y una hora**; a veces hasta **48 horas**. No hay que hacer nada mientras: Vercel lo revisa solo y pide el certificado de seguridad (el candado) por su cuenta.
- **Ya quedó cuando:**
  1. En Vercel → **Settings** → **Domains**, los dos dominios dicen **Valid Configuration** con una palomita azul.
  2. Al abrir **<https://mixtle.org>** se ve el juego, con el candado en la barra de dirección.
  3. Al abrir **<https://www.mixtle.org>**, la barra cambia sola a `mixtle.org`.
  4. Al abrir **<https://mixtle.org/salud.json>** se ve un texto corto como `{"app":"mixtle-al-rescate","version":"3.2.0","mudanza":2}`. Esa es la señal que usan las direcciones viejas para saber que ya pueden mandar los grupos.
- Si después de 48 horas sigue en rojo: revisen que copiaron los valores exactos (sin espacios ni un punto de más) y que no quedó otro registro A con `@`. Si no se resuelve, pásenle a René una captura de la tablita de Vercel y de la zona DNS.

---

## Paso 4. Qué pasa con los grupos que ya existen (la mudanza)

En cuanto **mixtle.org** muestra el juego (paso 3.3), la mudanza se activa **sola**. No hay que configurar nada.

- La próxima vez que alguien abra el juego en una **dirección vieja** (`mixtle-al-rescate.vercel.app` o `caco-al-rescate.vercel.app`) con internet, el juego revisa si mixtle.org ya lo tiene.
- **Si ese aparato tiene grupos**, aparece una pantalla para la persona facilitadora: **"El juego se cambió a mixtle.org. Vamos a llevar sus grupos"**, con la lista de grupos. Con el botón **Llevar los grupos** (o sola, a los 8 segundos) se pasan todos los grupos con todo su avance, y se abre mixtle.org con un **"¡Listo! Sus grupos ya están aquí"**. Nunca pasa a media lección: espera a que estén en el inicio, en "¿Quién va a jugar?", en el camino o en el álbum.
- **Si no tiene grupos**, abre mixtle.org directo.
- **No se pierde nada aunque algo falle:** la dirección vieja **solo quita sus grupos cuando mixtle.org confirma que ya los guardó**. Si se cae el internet a la mitad, los grupos siguen en la dirección vieja y aparece **"Intentar otra vez"**.
- **Si en mixtle.org ya había un grupo con el mismo nombre** (por ejemplo, "Ardilla 2°B"), no se sobrescribe: se quedan los dos y el que llegó se llama **"Ardilla 2°B (2)"**. El aviso de bienvenida lo dice.
- **Si el juego estaba instalado como app** (con su ícono en el escritorio o en la tablet), la bienvenida explica cómo instalarlo otra vez desde mixtle.org. El ícono viejo se puede borrar.
- **Plan B, a mano:** en el modo facilitador (mantener presionado el logo de Mixtle 3 segundos), o manteniendo presionado 3 segundos el título **"¿Quién va a jugar?"**, está **Respaldo de los grupos**: **Exportar grupos** descarga un archivo con todos los grupos de ese aparato y **Importar grupos** los agrega en otro aparato o en otra dirección. Funciona sin internet. Sirve también para pasar grupos de una laptop a otra.

**Qué pedirle a los facilitadores** cuando mixtle.org ya funcione: *"Abran una vez el juego como siempre (con el enlace o el ícono de antes) en cada laptop y tablet, con internet, y toquen **Llevar los grupos**. Desde entonces, usen **mixtle.org**."*

---

## Paso 5. Cuándo puede René borrar su proyecto

Mientras tanto, las direcciones viejas siguen funcionando desde la cuenta de René (sirven de **puente**). Ya no reciben cambios: solo hacen falta para mudar los grupos.

René puede borrar su proyecto de Vercel cuando se cumpla **todo** esto:

1. **mixtle.org** funciona (paso 3.3: palomitas azules y el juego abre).
2. Los facilitadores ya abrieron el juego **en cada laptop y tablet** que usaban, y vieron el aviso de la mudanza (o pasaron sus grupos con **Exportar / Importar**).
3. Pasaron **al menos 4 semanas** desde que mixtle.org funciona, con talleres en medio. Si hay vacaciones, mejor esperar a que pase el primer mes de clases después.

Cuando René borre su proyecto, `mixtle-al-rescate.vercel.app` y `caco-al-rescate.vercel.app` **dejan de funcionar**, y los grupos de un aparato que nunca se mudó quedan en ese navegador sin forma de abrirlos. Por eso conviene no tener prisa. René avisará antes de borrarlo.

---

## Recomendaciones para después

### Guardar las versiones anteriores (Deployment Retention)

Vercel guarda cada versión publicada (*deployment*). Para poder regresar a una versión anterior, esas versiones tienen que seguir guardadas.

- En el proyecto **mixtle** → **Settings** → busquen **Deployment Retention** (suele estar en la sección **Security**; si no, usen el buscador de Settings).
- Recomendado: **Production deployments: 1 year** (o lo más largo que permita) y **Preview deployments: 1 month**. Así se puede regresar a versiones de producción de hace meses, sin llenar el espacio de la cuenta con versiones de prueba.

### Volver a una versión anterior si algo sale mal

- **Lo más rápido: Instant Rollback.** En el proyecto → **Deployments** → la versión anterior que funcionaba (dice **Production** y la fecha) → botón **⋯** → **Instant Rollback** → confirmar. En segundos, mixtle.org vuelve a esa versión. Las laptops y tablets la reciben como cualquier versión nueva, **sin perder grupos**. En el plan gratuito, Vercel solo deja regresar a la versión de producción **inmediatamente anterior**.
- **Más atrás, con las etiquetas:** el repositorio tiene etiquetas (*tags*) con las versiones importantes: `v3-demo` (la que Eco Urban aprobó el 30 de octubre de 2026), `v3.1.3-antes-traspaso` y `v3.2` (la de este traspaso). Quien mantenga el código puede volver a cualquiera sin borrar la historia: `git revert --no-commit v3.2..main`, `git commit -m "Volver a v3.2"` y `git push` (cambiando `v3.2` por la etiqueta que quieran). Vercel publica el resultado solo.

### Si algo se ve mal

1. **No borren los datos del navegador.** Los grupos están ahí.
2. Tomen una captura de pantalla y anoten: qué aparato, qué navegador, qué dirección (mixtle.org u otra) y qué estaban haciendo.
3. Si empezó después de un cambio reciente, hagan **Instant Rollback** (arriba).
4. Si hace falta, **Exportar grupos** en el modo facilitador guarda los grupos en un archivo, por si acaso.
5. Escríbanle a René o a quien mantenga el código, con la captura y los datos del punto 2.

**Si en una escuela mixtle.org no abre** (sale una página de "Acceso denegado" o "sitio bloqueado", o el navegador dice que no se puede conectar): es el filtro de internet de esa escuela, que a veces bloquea los dominios nuevos. No es un error del juego. Pídanle al área de sistemas de la escuela que permita `mixtle.org`. Mientras tanto, en esa red el juego de la dirección vieja sigue funcionando normal y **no se muda** (solo se muda cuando de verdad puede abrir mixtle.org), así que nadie pierde sus grupos. (Le pasó a René en la red del Tec de Monterrey el 13 de noviembre de 2026.)

### Cambiar lo que dice Mixtle (la voz)

Las voces de Mixtle **ya están grabadas** dentro del repositorio (carpeta `public/voz/`): el juego no necesita ninguna cuenta ni llave para hablar. Solo hace falta lo siguiente si quieren **cambiar o agregar frases**. Es trabajo para alguien con algo de experiencia en computadoras (o para René):

1. **Una cuenta propia de Azure Speech, en el plan gratuito.** En <https://portal.azure.com>, creen un recurso **Speech** con el plan de precios **Free F0** (da 500,000 caracteres al mes; todas las frases del juego juntas son unos 39,000). De ese recurso, copien la **Key 1** y la **Region** (por ejemplo, `francecentral`). La llave es como una contraseña: no la manden por correo ni la pongan en ningún documento.
2. **En la computadora donde se va a trabajar:** instalar **Node.js 24**, **Python 3.11 o más nuevo** y **Git**; descargar el repositorio (`git clone`), y dentro de la carpeta correr una vez `npm ci` y `npm run voz:preparar`.
3. **La llave va en un archivo `.env.local`** en la carpeta del repositorio, con estas dos líneas:

   ```
   AZURE_SPEECH_KEY=la-llave-que-copiaron
   AZURE_SPEECH_REGION=francecentral
   ```

   Ese archivo **nunca se sube** a GitHub: el repositorio ya está configurado para ignorarlo, y una prueba automática revisa que la llave no aparezca en ningún archivo del juego.
4. **Cambiar el texto** de la frase en el archivo de contenido que corresponda (en `src/contenido/`; las unidades están en `src/contenido/unidades/`).
5. Correr **`npm run voz:generar`**: genera solo las frases nuevas o que cambiaron, con la misma voz (Alejo).
6. Correr **`npm test`** (revisa, entre otras cosas, que cada frase tenga su audio) y subir el cambio a GitHub (`git add`, `git commit`, `git push`). Vercel publica la versión nueva sola.

Los detalles técnicos (otra voz, voces humanas grabadas, la pronunciación de "Mixtle") están en [`notas-tecnicas.md`](notas-tecnicas.md), en *Voz de Mixtle y música*.

---

## Resumen para René (lo que hace él)

- Transferir el repositorio a la cuenta de GitHub de Eco Urban (paso 1) y aceptar la invitación de colaborador.
- Mantener su proyecto de Vercel `mixtle-al-rescate` (direcciones viejas) como puente, **sin cambios**, hasta que se cumpla el paso 5; avisar a Eco Urban antes de borrarlo.
- Antes de borrarlo, abrir `https://mixtle-al-rescate.vercel.app` y comprobar que lleva a mixtle.org.

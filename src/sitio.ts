/*
 * Dónde vive el juego. ÚNICO lugar donde se configura la dirección de producción (v3.2).
 *
 * - DIRECCION_DEFINITIVA: la dirección oficial del juego, en el Vercel de Eco Urban. Todo lo que apunta
 *   a producción (metadatos de index.html, la mudanza automática) sale de aquí.
 * - DIRECCIONES_VIEJAS: donde estuvo el juego antes. Si el juego se abre en una de ellas, revisa en segundo
 *   plano si la dirección definitiva ya sirve ESTE juego (su /salud.json) y, si sí, se muda con los grupos
 *   (src/servicios/mudanzaDefinitiva.ts). En cualquier otra dirección (la definitiva, localhost, las
 *   versiones de prueba de Vercel de Eco Urban) el juego nunca intenta mudarse.
 *
 * Solo para las pruebas de la mudanza (npm run probar:mudanza) se pueden cambiar con variables al construir:
 * VITE_DIRECCION_DEFINITIVA y VITE_DIRECCIONES_VIEJAS (hosts separados por comas). En Vercel no hace
 * falta ninguna variable: se usan los valores de abajo.
 */

/** Nombre de la app en /salud.json: así la mudanza sabe que la dirección definitiva sirve este juego. */
export const APP_ID = 'mixtle-al-rescate';

/**
 * Versión del protocolo de mudanza que entiende este código (en /salud.json). La dirección vieja solo
 * se muda si la definitiva entiende al menos esta versión. No se debe quitar el código que recibe la
 * mudanza mientras exista alguna dirección vieja.
 */
export const PROTOCOLO_MUDANZA = 2;

const ENV: Record<string, string | undefined> = (import.meta as { env?: Record<string, string | undefined> }).env ?? {};

/** La dirección oficial del juego (sin "/" al final). */
export const DIRECCION_DEFINITIVA = (ENV.VITE_DIRECCION_DEFINITIVA || 'https://mixtle.org').replace(/\/+$/, '');

/**
 * Dirección puente: mientras la definitiva todavía no sirve el juego, caco-al-rescate sigue mudándose
 * aquí, como lo hacía desde la v3 (si no, una laptop que ya se mudó vería la copia vieja de sus grupos que
 * quedó en la dirección anterior). En cuanto la definitiva responde, caco-al-rescate va directo a ella.
 */
export const DIRECCION_PUENTE = 'https://mixtle-al-rescate.vercel.app';

export interface DireccionVieja {
  /** Patrón del nombre del host, sin puerto (también las direcciones de cada publicación de Vercel del proyecto). */
  host: RegExp;
  /** A dónde mudarse, en orden: la primera que sirva este juego. */
  destinos: string[];
}

/**
 * Las direcciones viejas. Incluye las de cada publicación del proyecto anterior en Vercel
 * (mixtle-al-rescate-xxxx-….vercel.app). Por eso el proyecto de Eco Urban NO debe llamarse
 * "mixtle-al-rescate" en Vercel (docs/traspaso.md recomienda "mixtle"): si no, sus versiones de prueba
 * también se mudarían a mixtle.org.
 */
export const DIRECCIONES_VIEJAS: readonly DireccionVieja[] = ENV.VITE_DIRECCIONES_VIEJAS
  ? ENV.VITE_DIRECCIONES_VIEJAS.split(',')
      .map((h) => h.trim())
      .filter(Boolean)
      .map((h) => ({ host: new RegExp(`^${h.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`), destinos: [DIRECCION_DEFINITIVA] }))
  : [
      { host: /^mixtle-al-rescate(-[a-z0-9-]+)?\.vercel\.app$/, destinos: [DIRECCION_DEFINITIVA] },
      { host: /^caco-al-rescate(-[a-z0-9-]+)?\.vercel\.app$/, destinos: [DIRECCION_DEFINITIVA, DIRECCION_PUENTE] },
    ];

/** Si el juego está en una dirección vieja, a dónde puede mudarse (en orden); si no, ninguna. */
export function destinosDeMudanza(host: string): string[] {
  const vieja = DIRECCIONES_VIEJAS.find((d) => d.host.test(host));
  if (!vieja) return [];
  // Nunca "mudarse" a la misma dirección.
  return vieja.destinos.filter((d) => new URL(d).hostname !== host);
}

/** ¿Este origen es una dirección vieja? (A dónde puede regresar la confirmación de una mudanza.) */
export function esOrigenViejo(origen: string): boolean {
  try {
    const u = new URL(origen);
    return u.origin === origen.replace(/\/+$/, '') && DIRECCIONES_VIEJAS.some((d) => d.host.test(u.hostname));
  } catch {
    return false;
  }
}

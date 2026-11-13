import { create } from 'zustand';

/*
 * El estado de la mudanza a la dirección definitiva (v3.2), sin su lógica: así la primera pantalla no carga
 * la mudanza (que solo sirve en una dirección vieja o cuando llega una). La lógica está en
 * src/servicios/mudanzaDefinitiva.ts y se descarga solo cuando hace falta.
 */
export type EstadoMudanza =
  | { fase: 'dormida' }
  | { fase: 'disponible'; destino: string; grupos: string[] }
  | { fase: 'mudando'; destino: string }
  | { fase: 'fallo'; destino: string }
  | { fase: 'llegaron'; cuantos: number; renombrados: { antes: string; despues: string }[]; instalada: boolean };

interface Store {
  estado: EstadoMudanza;
  /** En la dirección vieja: los grupos ya se mudaron a esta dirección (aviso en "¿Quién va a jugar?"). */
  mudadosA: string | null;
  /** El maestro dijo "Ahora no" a un reintento: no se vuelve a ofrecer hasta abrir otra vez el juego. */
  pospuesta: boolean;
}

export const useMudanza = create<Store>(() => ({ estado: { fase: 'dormida' }, mudadosA: null, pospuesta: false }));

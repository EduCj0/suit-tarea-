import type { APIResponse } from '@playwright/test';

/** Umbral de tiempo de respuesta (SLA) en milisegundos; se puede ajustar con la variable MAX_RESPONSE_MS. */
export const SLA_MS = Number(process.env.MAX_RESPONSE_MS ?? 1500);

/** Ejecuta una petición y devuelve la respuesta junto con su duración en ms. */
export async function medir(peticion: () => Promise<APIResponse>): Promise<{ res: APIResponse; ms: number }> {
  const inicio = performance.now();
  const res = await peticion();
  await res.body();                       // incluye la descarga del cuerpo en la medición
  return { res, ms: Math.round(performance.now() - inicio) };
}

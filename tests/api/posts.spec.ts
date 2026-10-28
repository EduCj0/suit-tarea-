import { test, expect } from '@playwright/test';
import { validarEsquema } from '../../utils/schema';
import { medir, SLA_MS } from '../../utils/tiempo';

/**
 * Pruebas de API REST sobre el recurso /posts de JSONPlaceholder.
 * Nota: JSONPlaceholder simula las escrituras (POST, PUT, PATCH, DELETE): responde como si
 * guardara, pero no persiste los cambios. Por eso cada prueba de escritura valida la respuesta,
 * no un GET posterior.
 */
test.describe('API /posts', () => {
  test('API-01 GET /posts devuelve 100 posts con esquema válido @smoke', async ({ request }) => {
    const { res, ms } = await medir(() => request.get('/posts'));
    expect(res.status()).toBe(200);
    expect(res.headers()['content-type']).toContain('application/json');
    const body = await res.json();
    expect(body).toHaveLength(100);
    expect(validarEsquema('post-list', body)).toEqual([]);
    expect(ms, `tiempo de respuesta ${ms} ms`).toBeLessThan(SLA_MS);
  });

  test('API-02 GET /posts/1 devuelve el post solicitado', async ({ request }) => {
    const { res, ms } = await medir(() => request.get('/posts/1'));
    expect(res.status()).toBe(200);
    const post = await res.json();
    expect(validarEsquema('post', post)).toEqual([]);
    expect(post).toMatchObject({ id: 1, userId: 1 });
    expect(ms).toBeLessThan(SLA_MS);
  });

  test('API-03 GET /posts?userId=3 filtra por usuario', async ({ request }) => {
    const res = await request.get('/posts', { params: { userId: 3 } });
    expect(res.status()).toBe(200);
    const posts: Array<{ userId: number }> = await res.json();
    expect(posts.length).toBeGreaterThan(0);
    expect(posts.every(p => p.userId === 3)).toBe(true);
  });

  test('API-04 GET /posts/9999 responde 404 para un recurso inexistente', async ({ request }) => {
    const res = await request.get('/posts/9999');
    expect(res.status()).toBe(404);
    expect(await res.json()).toEqual({});
  });

  test('API-05 POST /posts crea un post y devuelve 201 con id asignado @smoke', async ({ request }) => {
    const nuevo = { title: 'Reporte de pruebas', body: 'Ejecución automatizada con Playwright', userId: 7 };
    const { res, ms } = await medir(() => request.post('/posts', { data: nuevo }));
    expect(res.status()).toBe(201);
    const creado = await res.json();
    expect(creado).toMatchObject(nuevo);
    expect(creado.id).toBe(101);                     // JSONPlaceholder asigna el siguiente id (101)
    expect(validarEsquema('post', creado)).toEqual([]);
    expect(ms).toBeLessThan(SLA_MS);
  });

  test('API-06 PUT /posts/1 reemplaza el recurso completo', async ({ request }) => {
    const reemplazo = { id: 1, title: 'Título actualizado', body: 'Cuerpo actualizado', userId: 1 };
    const { res, ms } = await medir(() => request.put('/posts/1', { data: reemplazo }));
    expect(res.status()).toBe(200);
    expect(await res.json()).toEqual(reemplazo);
    expect(ms).toBeLessThan(SLA_MS);
  });

  test('API-07 PATCH /posts/1 modifica solo el título', async ({ request }) => {
    const res = await request.patch('/posts/1', { data: { title: 'Solo el título' } });
    expect(res.status()).toBe(200);
    const post = await res.json();
    expect(post.title).toBe('Solo el título');
    expect(post.body.length).toBeGreaterThan(0);    // el resto de campos se conserva
    expect(validarEsquema('post', post)).toEqual([]);
  });

  test('API-08 DELETE /posts/1 responde 200 con cuerpo vacío @smoke', async ({ request }) => {
    const { res, ms } = await medir(() => request.delete('/posts/1'));
    expect(res.status()).toBe(200);
    expect(await res.json()).toEqual({});
    expect(ms).toBeLessThan(SLA_MS);
  });
});

test.describe('API /users', () => {
  test('API-09 GET /users/1 cumple el esquema de usuario (incluye email con formato válido)', async ({ request }) => {
    const res = await request.get('/users/1');
    expect(res.status()).toBe(200);
    expect(validarEsquema('user', await res.json())).toEqual([]);
  });

  test('API-10 GET /users/1/posts devuelve solo posts de ese usuario (recurso anidado)', async ({ request }) => {
    const res = await request.get('/users/1/posts');
    expect(res.status()).toBe(200);
    const posts: Array<{ userId: number }> = await res.json();
    expect(posts).toHaveLength(10);
    expect(new Set(posts.map(p => p.userId))).toEqual(new Set([1]));
  });
});

test.describe('API - rendimiento', () => {
  test('API-11 10 peticiones GET concurrentes responden 200 y el percentil 90 está bajo el SLA', async ({ request }) => {
    const resultados = await Promise.all(
      Array.from({ length: 10 }, (_, i) => medir(() => request.get(`/posts/${i + 1}`))),
    );
    expect(resultados.every(r => r.res.status() === 200)).toBe(true);
    const tiempos = resultados.map(r => r.ms).sort((a, b) => a - b);
    const p90 = tiempos[Math.ceil(0.9 * tiempos.length) - 1];
    test.info().annotations.push({ type: 'p90_ms', description: String(p90) });
    expect(p90, `p90 = ${p90} ms`).toBeLessThan(SLA_MS);
  });
});

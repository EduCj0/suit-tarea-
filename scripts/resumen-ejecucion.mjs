// Genera el reporte de ejecución (Markdown) a partir de test-results/resultados.json de Playwright.
// Escribe reporte-ejecucion.md y, dentro de GitHub Actions, también el resumen del job ($GITHUB_STEP_SUMMARY).
// Además deja resumen.json con los totales para el paso de notificación.
import fs from 'node:fs';

const datos = JSON.parse(fs.readFileSync('test-results/resultados.json', 'utf8'));
const filas = [];
const recorrer = (suite, ruta = []) => {
  const nombre = suite.title && !suite.title.endsWith('.ts') ? [...ruta, suite.title] : ruta;
  for (const spec of suite.specs ?? []) {
    for (const t of spec.tests) {
      const ult = t.results.at(-1) ?? {};
      filas.push({
        proyecto: t.projectName, suite: nombre.join(' › '), prueba: spec.title,
        estado: t.status === 'flaky' ? 'inestable' : (ult.status ?? 'skipped'),
        ms: ult.duration ?? 0, reintentos: Math.max(0, t.results.length - 1),
        error: ult.error?.message?.split('\n')[0]?.replace(/\u001b\[[0-9;]*m/g, '') ?? '',
      });
    }
  }
  for (const s of suite.suites ?? []) recorrer(s, nombre);
};
datos.suites.forEach(s => recorrer(s));

const cuenta = e => filas.filter(f => f.estado === e).length;
const total = filas.length, ok = cuenta('passed'), fallo = cuenta('failed') + cuenta('timedOut');
const inestable = cuenta('inestable'), omitida = cuenta('skipped');
const pct = total ? ((ok + inestable) / total * 100).toFixed(1) : '0';
const dur = (datos.stats?.duration ?? 0) / 1000;
const icono = { passed: '✅', failed: '❌', timedOut: '⏱️', inestable: '⚠️', skipped: '⏭️' };

const porProyecto = {};
for (const f of filas) {
  porProyecto[f.proyecto] ??= { total: 0, ok: 0, ms: 0 };
  porProyecto[f.proyecto].total++; porProyecto[f.proyecto].ms += f.ms;
  if (f.estado === 'passed' || f.estado === 'inestable') porProyecto[f.proyecto].ok++;
}

const contexto = process.env.GITHUB_ACTIONS
  ? `Commit \`${process.env.GITHUB_SHA?.slice(0, 7)}\` en \`${process.env.GITHUB_REF_NAME}\` · ejecución #${process.env.GITHUB_RUN_NUMBER}`
  : 'Ejecución local';
let md = `# Reporte de ejecución de pruebas\n\n${contexto} · ${new Date(datos.stats?.startTime ?? Date.now()).toLocaleString('es-MX', { timeZone: 'America/Mexico_City' })}\n\n`;
md += `**Resultado: ${fallo === 0 ? 'APROBADO ✅' : 'CON FALLOS ❌'}** — ${ok + inestable}/${total} pruebas pasaron (${pct} %) en ${dur.toFixed(1)} s.\n\n`;
md += `| Total | Pasaron | Fallaron | Inestables | Omitidas |\n|---|---|---|---|---|\n| ${total} | ${ok} | ${fallo} | ${inestable} | ${omitida} |\n\n`;
md += `## Por proyecto\n\n| Proyecto | Pasaron | Tiempo promedio por prueba |\n|---|---|---|\n`;
for (const [p, v] of Object.entries(porProyecto)) md += `| ${p} | ${v.ok}/${v.total} | ${(v.ms / v.total / 1000).toFixed(2)} s |\n`;
md += `\n## Detalle\n\n| Proyecto | Prueba | Estado | Duración | Reintentos |\n|---|---|---|---|---|\n`;
for (const f of filas) md += `| ${f.proyecto} | ${f.prueba} | ${icono[f.estado] ?? ''} ${f.estado} | ${(f.ms / 1000).toFixed(2)} s | ${f.reintentos} |\n`;
const fallos = filas.filter(f => f.error && f.estado !== 'passed');
if (fallos.length) {
  md += `\n## Fallos\n\n`;
  for (const f of fallos) md += `- **${f.prueba}** (${f.proyecto}): ${f.error}\n`;
}
fs.writeFileSync('reporte-ejecucion.md', md);
if (process.env.GITHUB_STEP_SUMMARY) fs.appendFileSync(process.env.GITHUB_STEP_SUMMARY, md);
fs.writeFileSync('resumen.json', JSON.stringify({ total, ok, fallo, inestable, omitida, pct, dur }));
console.log(md);

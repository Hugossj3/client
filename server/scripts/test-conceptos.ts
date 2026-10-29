const baseUrl = process.env.API_URL ?? 'http://localhost:3000';
const url = `${baseUrl}/api/conceptos-retributivos`;

console.log(`GET ${url}\n`);

const response = await fetch(url);

if (!response.ok) {
  const body = await response.text();
  console.error(`Error ${response.status}: ${body}`);
  process.exit(1);
}

const conceptos = await response.json();

if (!Array.isArray(conceptos) || conceptos.length === 0) {
  console.log('La tabla conceptos_retributivos está vacía.');
  process.exit(0);
}

console.log(`Encontrados ${conceptos.length} conceptos:\n`);
console.table(
  conceptos.map((c: Record<string, unknown>) => ({
    id: c.id_concepto,
    nombre: c.nombre,
    tipo: c.tipo,
    salarial: c.es_salarial,
    cotiza_ss: c.cotiza_ss,
    tributa_irpf: c.tributa_irpf,
  })),
);

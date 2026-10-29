import 'dotenv/config';
import app from './app.js';
import { pool } from './db.js';
import { seedCalculoData } from './seed.js';

const port = Number(process.env.PORT ?? 3000);

async function start() {
  await pool.query('SELECT 1');
  await seedCalculoData();
  app.listen(port, () => {
    console.log(`API salarioapp escuchando en http://localhost:${port}`);
  });
}

start().catch((error) => {
  console.error('No se pudo iniciar la API. Revisa la conexión a MySQL.', error);
  process.exit(1);
});

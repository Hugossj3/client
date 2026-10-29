import cors from 'cors';
import express from 'express';
import authRouter from './auth.js';
import calcularRouter from './calcular.js';
import { createCrudRouter } from './crud.js';
import nestedRouter from './nested.js';
import { resources } from './resources.js';

const app = express();

app.use(cors());
app.use(express.json());

app.get('/health', (_req, res) => {
  res.json({ ok: true, service: 'salarioapp-api' });
});

app.use('/api/auth', authRouter);
app.use('/api/calcular', calcularRouter);
app.use('/api', nestedRouter);

app.use('/api/usuarios', createCrudRouter(resources.usuarios));
app.use('/api/perfiles-fiscales', createCrudRouter(resources.perfilesFiscales));
app.use('/api/descendientes', createCrudRouter(resources.descendientes));
app.use('/api/tipos-contrato', createCrudRouter(resources.tiposContrato));
app.use('/api/tipos-jornada', createCrudRouter(resources.tiposJornada));
app.use('/api/grupos-cotizacion', createCrudRouter(resources.gruposCotizacion));
app.use('/api/contratos', createCrudRouter(resources.contratos));
app.use('/api/conceptos-retributivos', createCrudRouter(resources.conceptosRetributivos));
app.use('/api/nominas', createCrudRouter(resources.nominas));
app.use('/api/nomina-conceptos', createCrudRouter(resources.nominaConceptos));
app.use('/api/deducciones', createCrudRouter(resources.deducciones));
app.use('/api/tipos-base', createCrudRouter(resources.tiposBase));
app.use('/api/bases-cotizacion', createCrudRouter(resources.basesCotizacion));
app.use('/api/tipos-cotizacion', createCrudRouter(resources.tiposCotizacion));
app.use('/api/parametros-cotizacion', createCrudRouter(resources.parametrosCotizacion));
app.use('/api/configuracion-irpf', createCrudRouter(resources.configuracionIrpf));
app.use('/api/tramos-irpf', createCrudRouter(resources.tramosIrpf));

app.use((err: unknown, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error(err);
  const mysqlError = err as { sqlMessage?: string; message?: string; code?: string };
  res.status(500).json({
    error: mysqlError.sqlMessage ?? mysqlError.message ?? 'Error interno',
    code: mysqlError.code,
  });
});

export default app;

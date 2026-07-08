import { Router } from 'express';
import { prisma } from '../../prisma';
import { authenticate, requireAdmin } from '../../middlewares/auth';
import { logUserActivity } from '../../utils/logger';
import { duckDbService } from '../../services/duckdb.service';

const router = Router();

router.use(authenticate);

// GET /api/admin/etl/jobs
router.get('/jobs', async (req: any, res) => {
  try {
    const jobs = await prisma.etlJob.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        connection: { select: { id: true, name: true, sourceType: true } },
        dataset: { select: { id: true, name: true } },
        creator: { select: { id: true, username: true, full_name: true } },
        runs: { orderBy: { createdAt: 'desc' }, take: 1 },
      },
    });
    res.json(jobs);
  } catch (error: any) {
    res.status(500).json({ message: 'Erro ao listar jobs' });
  }
});

// GET /api/admin/etl/runs
router.get('/runs', async (req: any, res) => {
  try {
    const { status, limit } = req.query;
    const where: any = {};
    if (status) where.status = status;

    const runs = await prisma.etlJobRun.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      take: Number(limit) || 50,
      include: {
        job: { select: { id: true, name: true } },
        connection: { select: { id: true, name: true, sourceType: true } },
        triggerer: { select: { id: true, username: true, full_name: true } },
      },
    });
    res.json(runs);
  } catch (error: any) {
    res.status(500).json({ message: 'Erro ao listar execuções' });
  }
});

// GET /api/admin/etl/runs/:id
router.get('/runs/:id', async (req: any, res) => {
  try {
    const id = Number(req.params.id);
    const run = await prisma.etlJobRun.findUnique({
      where: { id },
      include: {
        job: true,
        connection: true,
        dataset: true,
        triggerer: { select: { id: true, username: true, full_name: true } },
        steps: { orderBy: { startedAt: 'asc' } },
        snapshots: true,
      },
    });
    if (!run) return res.status(404).json({ message: 'Execução não encontrada' });
    res.json(run);
  } catch (error: any) {
    res.status(500).json({ message: 'Erro ao buscar execução' });
  }
});

// GET /api/admin/etl/runs/:id/logs
router.get('/runs/:id/logs', async (req: any, res) => {
  try {
    const id = Number(req.params.id);
    const logs = await prisma.etlRunLog.findMany({
      where: { runId: id },
      orderBy: { createdAt: 'asc' },
    });
    res.json(logs);
  } catch (error: any) {
    res.status(500).json({ message: 'Erro ao buscar logs' });
  }
});

// POST /api/admin/etl/runs/:id/retry
router.post('/runs/:id/retry', requireAdmin, async (req: any, res) => {
  try {
    const id = Number(req.params.id);
    const existingRun = await prisma.etlJobRun.findUnique({ where: { id } });
    if (!existingRun) return res.status(404).json({ message: 'Execução não encontrada' });

    const newRun = await prisma.etlJobRun.create({
      data: {
        jobId: existingRun.jobId,
        connectionId: existingRun.connectionId,
        datasetId: existingRun.datasetId,
        runType: 'retry',
        status: 'pending',
        triggeredBy: req.user.id,
      },
    });

    await logUserActivity(req.user.id, 'retry_etl_run', `Reexecutou job ${existingRun.jobId}`, req, 'EtlJobRun', String(newRun.id));
    res.status(201).json(newRun);
  } catch (error: any) {
    res.status(500).json({ message: 'Erro ao reexecutar' });
  }
});

async function addLog(runId: number, stepId: number | null, level: string, message: string, details?: any) {
  await prisma.etlRunLog.create({
    data: { runId, stepId, level, message, detailsJson: details || null },
  }).catch(() => {});
}

async function createStep(runId: number, stepName: string): Promise<number> {
  const step = await prisma.etlJobRunStep.create({
    data: { runId, stepName, status: 'running', startedAt: new Date() },
  });
  return step.id;
}

async function completeStep(stepId: number, status: string, result?: any, error?: string) {
  await prisma.etlJobRunStep.update({
    where: { id: stepId },
    data: {
      status,
      finishedAt: new Date(),
      durationMs: undefined,
      resultJson: result || null,
      errorMessage: error || null,
    },
  });
}

async function updateRunProgress(runId: number, status: string, step: string, pct: number, extra?: any) {
  const data: any = { status, currentStep: step, progressPct: pct };
  if (status === 'running' || status === 'pending') {
    if (!extra?.startedAt) data.startedAt = new Date();
  }
  if (status === 'failed') {
    data.finishedAt = new Date();
    data.errorMessage = extra?.error || null;
  }
  if (status === 'ready' || status === 'published') {
    data.finishedAt = new Date();
  }
  if (extra) {
    if (extra.rowsRead !== undefined) data.rowsRead = extra.rowsRead;
    if (extra.rowsValid !== undefined) data.rowsValid = extra.rowsValid;
    if (extra.rowsInvalid !== undefined) data.rowsInvalid = extra.rowsInvalid;
    if (extra.rowsNew !== undefined) data.rowsNew = extra.rowsNew;
    if (extra.rowsChanged !== undefined) data.rowsChanged = extra.rowsChanged;
    if (extra.rowsRemoved !== undefined) data.rowsRemoved = extra.rowsRemoved;
    if (extra.rowsDiscarded !== undefined) data.rowsDiscarded = extra.rowsDiscarded;
    if (extra.rowsDeduplicated !== undefined) data.rowsDeduplicated = extra.rowsDeduplicated;
  }

  await prisma.etlJobRun.update({ where: { id: runId }, data }).catch(() => {});
}

const VALID_UF = new Set([
  'AC','AL','AP','AM','BA','CE','DF','ES','GO','MA','MT','MS','MG','PA','PB','PR','PE','PI','RJ','RN','RS','RO','RR','SC','SP','SE','TO',
]);

function validateClientRow(row: any, keyField: string, rules: any[]): { valid: boolean; errors: string[] } {
  const errors: string[] = [];
  const key = String(row[keyField] || '').trim();

  if (!key) {
    errors.push(`Chave primária (${keyField}) vazia`);
    return { valid: false, errors };
  }

  for (const rule of rules || []) {
    if (!rule.enabled) continue;
    const val = row[rule.field];

    switch (rule.ruleType) {
      case 'required':
        if (val === undefined || val === null || String(val).trim() === '') {
          errors.push(rule.errorMessage || `Campo "${rule.field}" obrigatório`);
        }
        break;
      case 'unique':
        break;
      case 'uf_valid':
        if (val && !VALID_UF.has(String(val).toUpperCase().trim())) {
          errors.push(rule.errorMessage || `UF "${val}" inválida`);
        }
        break;
      case 'cep_valid':
        if (val) {
          const cep = String(val).replace(/\D/g, '');
          if (cep.length !== 8) errors.push(rule.errorMessage || `CEP "${val}" inválido (8 dígitos)`);
        }
        break;
      case 'lat_valid':
        if (val !== undefined && val !== null && val !== '') {
          const lat = Number(val);
          if (isNaN(lat) || lat < -90 || lat > 90) errors.push(rule.errorMessage || `Latitude "${val}" inválida`);
        }
        break;
      case 'lng_valid':
        if (val !== undefined && val !== null && val !== '') {
          const lng = Number(val);
          if (isNaN(lng) || lng < -180 || lng > 180) errors.push(rule.errorMessage || `Longitude "${val}" inválida`);
        }
        break;
      case 'cnpj_valid':
        if (val) {
          const cnpj = String(val).replace(/\D/g, '');
          if (cnpj.length !== 14) errors.push(rule.errorMessage || `CNPJ "${val}" inválido (14 dígitos)`);
        }
        break;
    }
  }

  return { valid: errors.length === 0, errors };
}

function normalizeRow(row: any, columns: any[]): Record<string, unknown> {
  const normalized: Record<string, unknown> = {};
  for (const col of columns || []) {
    let val = row[col.sourceColumn];
    if (val === undefined) val = col.defaultValue || null;
    if (val !== null && val !== undefined) {
      const opts = (col.transformOptions || {}) as Record<string, unknown>;
      let strVal = String(val);
      if (opts.trim) strVal = strVal.trim();
      if (opts.uppercase) strVal = strVal.toUpperCase();
      if (opts.lowercase) strVal = strVal.toLowerCase();
      if (opts.remove_accents) {
        strVal = strVal.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
      }
      val = strVal;
    }
    normalized[col.targetField] = val;
  }
  return normalized;
}

async function processDatasetMapping(runId: number, dataset: any, rows: Record<string, unknown>[]) {
  const keyField = dataset.columns?.find((c: any) => c.isKey)?.targetField || 'codigocliente';
  const rules = dataset.rules || [];
  const validRows: any[] = [];
  const invalidRows: any[] = [];
  const seenKeys = new Set<string>();
  let dedupCount = 0;

  for (const row of rows) {
    const normalized = normalizeRow(row as any, dataset.columns || []);
    const validation = validateClientRow(normalized, keyField, rules);
    const key = String(normalized[keyField] || '').trim().toLowerCase();

    if (!validation.valid) {
      invalidRows.push({ ...normalized, validationErrors: validation.errors, isValid: false });
      await addLog(runId, null, 'warn', `Registro inválido: ${key} - ${validation.errors.join('; ')}`, { row: normalized, errors: validation.errors });
      continue;
    }

    if (seenKeys.has(key)) {
      dedupCount++;
      await addLog(runId, null, 'warn', `Duplicata ignorada: ${key}`, { row: normalized });
      continue;
    }
    seenKeys.add(key);
    validRows.push(normalized);
  }

  return { validRows, invalidRows, dedupCount };
}

// POST /api/admin/etl/runs/:id/process
router.post('/runs/:id/process', async (req: any, res) => {
  try {
    const runId = Number(req.params.id);
    const run = await prisma.etlJobRun.findUnique({
      where: { id: runId },
      include: {
        connection: true,
        dataset: { include: { columns: { orderBy: { sortOrder: 'asc' } }, rules: true } },
      },
    });
    if (!run) return res.status(404).json({ message: 'Run não encontrada' });

    const conn = run.connection;
    if (!conn || !conn.sourceType || !conn.filePath) return res.status(400).json({ message: 'Conexão sem tipo ou path definido' });

    await duckDbService.initialize();
    const readSql = duckDbService.buildReadSql(conn.sourceType, conn.filePath, (conn.optionsJson || {}) as Record<string, unknown>);
    const allRows = await duckDbService.query(readSql);
    await addLog(runId, null, 'info', `Leitura concluída: ${allRows.length} linhas`);

    await updateRunProgress(runId, 'reading', 'read_source', 20, { rowsRead: allRows.length });

    let processingResult;
    if (run.dataset) {
      processingResult = await processDatasetMapping(runId, run.dataset, allRows);
    } else {
      processingResult = { validRows: allRows, invalidRows: [], dedupCount: 0 };
    }

    await updateRunProgress(runId, 'validating', 'validate', 50, {
      rowsRead: allRows.length,
      rowsValid: processingResult.validRows.length,
      rowsInvalid: processingResult.invalidRows.length,
      rowsDeduplicated: processingResult.dedupCount,
    });

    const snapshot = await prisma.clientesSnapshot.create({
      data: {
        etlRunId: runId,
        datasetId: run.datasetId,
        versionLabel: `v${Date.now()}`,
        sourceDescription: conn.name,
        totalRows: allRows.length,
        validRows: processingResult.validRows.length,
        invalidRows: processingResult.invalidRows.length,
        duplicatesRemoved: processingResult.dedupCount,
        status: 'staged',
        createdBy: run.triggeredBy,
      },
    });

    const BATCH_SIZE = 500;
    for (let i = 0; i < processingResult.validRows.length; i += BATCH_SIZE) {
      const batch = processingResult.validRows.slice(i, i + BATCH_SIZE);
      const items = batch.map((row: any) => ({
        snapshotId: snapshot.id,
        codigoCliente: String(row.codigocliente || row.codigo_cliente || ''),
        nomeCliente: String(row.nomecliente || row.nome_cliente || ''),
        nomeAbreviado: row.nomeabreviado || row.nome_abreviado || null,
        regiao: row.regiao || null,
        uf: row.uf || null,
        cidade: row.cidade || null,
        bairro: row.bairro || null,
        cep: row.cep || null,
        enderecoCompleto: row.enderecocompleto || row.endereco_completo || null,
        numero: row.numero || null,
        cnpj: row.cnpj || null,
        documento: row.documento || null,
        telefone: row.telefone || null,
        email: row.email || null,
        latitude: row.latitude !== undefined ? Number(row.latitude) : null,
        longitude: row.longitude !== undefined ? Number(row.longitude) : null,
        vendedor: row.vendedor || null,
        representante: row.representante || null,
        status: row.status || 'ativo',
        segmento: row.segmento || null,
        canal: row.canal || null,
        dataCadastro: row.data_cadastro || row.datacadastro || null,
        dataUltimaCompra: row.data_ultima_compra || row.dataultimacompra || null,
        limiteCredito: row.limite_credito || row.limitecredito || null,
        faturamento: row.faturamento || null,
        observacoes: row.observacoes || null,
        isValid: true,
        validationErrors: [],
        sourceRawJson: row,
      }));
      await prisma.clientesSnapshotItem.createMany({ data: items });
    }

    await updateRunProgress(runId, 'ready', 'stage', 80, {
      rowsRead: allRows.length,
      rowsValid: processingResult.validRows.length,
      rowsInvalid: processingResult.invalidRows.length,
      rowsDeduplicated: processingResult.dedupCount,
    });

    await addLog(runId, null, 'info', `Staging concluído: ${processingResult.validRows.length} válidos, ${processingResult.invalidRows.length} inválidos, ${processingResult.dedupCount} duplicatas`);

    await prisma.etlJobRun.update({
      where: { id: runId },
      data: {
        status: 'ready',
        currentStep: 'stage',
        progressPct: 100,
        finishedAt: new Date(),
        rowsRead: allRows.length,
        rowsValid: processingResult.validRows.length,
        rowsInvalid: processingResult.invalidRows.length,
        rowsDeduplicated: processingResult.dedupCount,
        resultJson: { snapshotId: snapshot.id },
      },
    });

    await logUserActivity(run.triggeredBy, 'etl_stage_complete', `ETL staging concluído: ${processingResult.validRows.length} registros`, req, 'ClientesSnapshot', String(snapshot.id));

    res.json({
      message: 'Processamento concluído',
      snapshotId: snapshot.id,
      rowsRead: allRows.length,
      rowsValid: processingResult.validRows.length,
      rowsInvalid: processingResult.invalidRows.length,
      rowsDeduplicated: processingResult.dedupCount,
    });
  } catch (error: any) {
    console.error('[ETL] Process error:', error);
    await updateRunProgress(Number(req.params.id), 'failed', 'error', 0, { error: error.message }).catch(() => {});
    res.status(500).json({ message: 'Erro no processamento', error: error.message });
  }
});

export default router;

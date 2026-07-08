import { Router } from 'express';
import { prisma } from '../../prisma';
import { authenticate, requireAdmin } from '../../middlewares/auth';
import { logUserActivity } from '../../utils/logger';
import { duckDbService } from '../../services/duckdb.service';

const router = Router();

router.use(authenticate);

function parseConnectionForResponse(conn: any) {
  const { deletedAt, creator, updater, ...rest } = conn;
  return rest;
}

// GET /api/admin/data-connections
router.get('/', async (req: any, res) => {
  try {
    const connections = await prisma.externalConnection.findMany({
      where: { deletedAt: null },
      orderBy: { createdAt: 'desc' },
      include: {
        datasets: { select: { id: true, name: true, status: true } },
        creator: { select: { id: true, username: true, full_name: true } },
      },
    });
    res.json(connections.map(parseConnectionForResponse));
  } catch (error: any) {
    console.error('[DATA-CONNECTIONS] List error:', error);
    res.status(500).json({ message: 'Erro ao listar conexões' });
  }
});

// GET /api/admin/data-connections/:id
router.get('/:id', async (req: any, res) => {
  try {
    const id = Number(req.params.id);
    const conn = await prisma.externalConnection.findUnique({
      where: { id },
      include: {
        datasets: {
          include: {
            columns: { orderBy: { sortOrder: 'asc' } },
            rules: true,
          },
        },
        creator: { select: { id: true, username: true, full_name: true } },
        jobs: { select: { id: true, name: true, status: true } },
      },
    });
    if (!conn || conn.deletedAt) {
      return res.status(404).json({ message: 'Conexão não encontrada' });
    }
    res.json(parseConnectionForResponse(conn));
  } catch (error: any) {
    console.error('[DATA-CONNECTIONS] Get error:', error);
    res.status(500).json({ message: 'Erro ao buscar conexão' });
  }
});

// POST /api/admin/data-connections
router.post('/', requireAdmin, async (req: any, res) => {
  try {
    const { name, description, sourceType, filePath, filePattern, optionsJson, datasetTarget, tags } = req.body;
    if (!name) return res.status(400).json({ message: 'Nome é obrigatório' });
    if (!sourceType) return res.status(400).json({ message: 'Tipo de fonte é obrigatório' });

    const conn = await prisma.externalConnection.create({
      data: {
        name,
        description,
        sourceType,
        filePath,
        filePattern,
        optionsJson: optionsJson || {},
        datasetTarget,
        tags: tags || [],
        status: 'inactive',
        createdBy: req.user.id,
      },
    });

    await logUserActivity(req.user.id, 'create_data_connection', `Criou conexão: ${name} (${sourceType})`, req, 'ExternalConnection', String(conn.id));
    res.status(201).json(parseConnectionForResponse(conn));
  } catch (error: any) {
    console.error('[DATA-CONNECTIONS] Create error:', error);
    res.status(500).json({ message: 'Erro ao criar conexão' });
  }
});

// PUT /api/admin/data-connections/:id
router.put('/:id', requireAdmin, async (req: any, res) => {
  try {
    const id = Number(req.params.id);
    const existing = await prisma.externalConnection.findUnique({ where: { id } });
    if (!existing || existing.deletedAt) return res.status(404).json({ message: 'Conexão não encontrada' });

    const { name, description, sourceType, filePath, filePattern, optionsJson, datasetTarget, tags, status } = req.body;
    const conn = await prisma.externalConnection.update({
      where: { id },
      data: {
        ...(name !== undefined && { name }),
        ...(description !== undefined && { description }),
        ...(sourceType !== undefined && { sourceType }),
        ...(filePath !== undefined && { filePath }),
        ...(filePattern !== undefined && { filePattern }),
        ...(optionsJson !== undefined && { optionsJson }),
        ...(datasetTarget !== undefined && { datasetTarget }),
        ...(tags !== undefined && { tags }),
        ...(status !== undefined && { status }),
        updatedBy: req.user.id,
      },
    });

    await logUserActivity(req.user.id, 'update_data_connection', `Editou conexão: ${conn.name}`, req, 'ExternalConnection', String(id));
    res.json(parseConnectionForResponse(conn));
  } catch (error: any) {
    console.error('[DATA-CONNECTIONS] Update error:', error);
    res.status(500).json({ message: 'Erro ao atualizar conexão' });
  }
});

// DELETE /api/admin/data-connections/:id
router.delete('/:id', requireAdmin, async (req: any, res) => {
  try {
    const id = Number(req.params.id);
    const existing = await prisma.externalConnection.findUnique({ where: { id } });
    if (!existing) return res.status(404).json({ message: 'Conexão não encontrada' });

    await prisma.externalConnection.update({
      where: { id },
      data: { deletedAt: new Date(), updatedBy: req.user.id },
    });

    await logUserActivity(req.user.id, 'delete_data_connection', `Removeu conexão: ${existing.name}`, req, 'ExternalConnection', String(id));
    res.json({ message: 'Conexão removida com sucesso' });
  } catch (error: any) {
    console.error('[DATA-CONNECTIONS] Delete error:', error);
    res.status(500).json({ message: 'Erro ao remover conexão' });
  }
});

// POST /api/admin/data-connections/:id/test
router.post('/:id/test', async (req: any, res) => {
  try {
    const id = Number(req.params.id);
    const conn = await prisma.externalConnection.findUnique({ where: { id } });
    if (!conn || conn.deletedAt) return res.status(404).json({ message: 'Conexão não encontrada' });
    if (!conn.sourceType || !conn.filePath) return res.status(400).json({ message: 'Conexão sem tipo ou path definido' });

    const startTime = Date.now();
    let result: any;

    try {
      await duckDbService.initialize();
      const schema = await duckDbService.inspectSchema(conn.sourceType, conn.filePath, (conn.optionsJson as Record<string, unknown>) || {});
      const elapsed = Date.now() - startTime;

      await prisma.externalConnection.update({
        where: { id },
        data: {
          lastValidatedAt: new Date(),
          lastError: null,
          validationResult: { success: true, columns: schema.columns.length, rows: schema.totalEstimate, elapsed_ms: elapsed },
          status: 'active',
        },
      });

      await logUserActivity(req.user.id, 'test_data_connection', `Testou conexão: ${conn.name} - OK (${elapsed}ms, ${schema.columns.length} colunas)`, req, 'ExternalConnection', String(id));
      result = { success: true, ...schema, elapsed_ms: elapsed };
    } catch (err: any) {
      const elapsed = Date.now() - startTime;
      await prisma.externalConnection.update({
        where: { id },
        data: {
          lastError: err.message,
          lastValidatedAt: new Date(),
          validationResult: { success: false, error: err.message, elapsed_ms: elapsed },
          status: 'error',
        },
      });

      await logUserActivity(req.user.id, 'test_data_connection_failed', `Teste de conexão falhou: ${conn.name} - ${err.message}`, req, 'ExternalConnection', String(id));
      result = { success: false, error: err.message, elapsed_ms: elapsed };
    }

    res.json(result);
  } catch (error: any) {
    console.error('[DATA-CONNECTIONS] Test error:', error);
    res.status(500).json({ message: 'Erro ao testar conexão' });
  }
});

// POST /api/admin/data-connections/:id/preview
router.post('/:id/preview', async (req: any, res) => {
  try {
    const id = Number(req.params.id);
    const { limit } = req.body;
    const conn = await prisma.externalConnection.findUnique({ where: { id } });
    if (!conn || conn.deletedAt) return res.status(404).json({ message: 'Conexão não encontrada' });

    if (!conn.sourceType || !conn.filePath) return res.status(400).json({ message: 'Conexão sem tipo ou path definido' });
    await duckDbService.initialize();
    const previewResult = await duckDbService.preview(
      conn.sourceType,
      conn.filePath,
      (conn.optionsJson as Record<string, unknown>) || {},
      limit || 50
    );

    res.json(previewResult);
  } catch (error: any) {
    console.error('[DATA-CONNECTIONS] Preview error:', error);
    res.status(500).json({ message: 'Erro ao gerar preview', error: error.message });
  }
});

// POST /api/admin/data-connections/:id/run (create ETL job run)
router.post('/:id/run', requireAdmin, async (req: any, res) => {
  try {
    const id = Number(req.params.id);
    const conn = await prisma.externalConnection.findUnique({ where: { id } });
    if (!conn || conn.deletedAt) return res.status(404).json({ message: 'Conexão não encontrada' });

    let job = await prisma.etlJob.findFirst({ where: { connectionId: id, status: { not: 'inactive' } } });
    if (!job) {
      job = await prisma.etlJob.create({
        data: {
          connectionId: id,
          name: `Run ${conn.name}`,
          mode: 'full',
          status: 'active',
          createdBy: req.user.id,
        },
      });
    }

    const run = await prisma.etlJobRun.create({
      data: {
        jobId: job.id,
        connectionId: id,
        runType: 'manual',
        status: 'pending',
        triggeredBy: req.user.id,
      },
    });

    await logUserActivity(req.user.id, 'run_etl_job', `Iniciou execução ETL para conexão: ${conn.name}`, req, 'EtlJobRun', String(run.id));

    res.status(201).json({ runId: run.id, message: 'Execução iniciada em background' });
  } catch (error: any) {
    console.error('[DATA-CONNECTIONS] Run error:', error);
    res.status(500).json({ message: 'Erro ao iniciar execução' });
  }
});

export default router;

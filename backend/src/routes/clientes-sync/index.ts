import { Router } from 'express';
import { prisma } from '../../prisma';
import { authenticate, requireAdmin } from '../../middlewares/auth';
import { logUserActivity } from '../../utils/logger';

const router = Router();

router.use(authenticate);

// POST /api/admin/clientes-sync/publish
router.post('/publish', requireAdmin, async (req: any, res) => {
  try {
    const { snapshotId, versionLabel } = req.body;
    if (!snapshotId) return res.status(400).json({ message: 'snapshotId é obrigatório' });

    const snapshot = await prisma.clientesSnapshot.findUnique({
      where: { id: snapshotId },
      include: {
        items: { where: { isValid: true, isActive: true } },
      },
    });
    if (!snapshot) return res.status(404).json({ message: 'Snapshot não encontrado' });
    if (snapshot.status !== 'staged') return res.status(400).json({ message: 'Snapshot já foi processado' });

    const activeVersion = await prisma.clientesPublishedVersion.findFirst({
      where: { isActive: true },
      include: {
        snapshot: {
          include: { items: { where: { isValid: true, isActive: true } } },
        },
      },
    });

    const activeMap = new Map<string, any>();
    if (activeVersion) {
      for (const item of activeVersion.snapshot.items) {
        activeMap.set(item.codigoCliente.toLowerCase(), item);
      }
    }

    const newItems = snapshot.items;
    const newMap = new Map<string, any>();
    for (const item of newItems) {
      newMap.set(item.codigoCliente.toLowerCase(), item);
    }

    let newCount = 0;
    let changedCount = 0;
    let removedCount = 0;
    let unchangedCount = 0;

    const CHANGE_FIELDS = [
      'nomeCliente', 'nomeAbreviado', 'uf', 'cidade', 'bairro', 'cep', 'enderecoCompleto',
      'numero', 'cnpj', 'documento', 'telefone', 'email', 'latitude', 'longitude',
      'vendedor', 'representante', 'status', 'segmento', 'canal',
    ];

    const batchUpdates: { id: number; changeType: string; changeDetails: any }[] = [];

    for (const [key, newItem] of newMap) {
      const activeItem = activeMap.get(key);
      if (!activeItem) {
        newCount++;
        batchUpdates.push({ id: newItem.id, changeType: 'new', changeDetails: null });
      } else {
        const changes: Record<string, { from: any; to: any }> = {};
        for (const field of CHANGE_FIELDS) {
          const newVal = (newItem as any)[field];
          const oldVal = (activeItem as any)[field];
          if (String(newVal ?? '') !== String(oldVal ?? '')) {
            changes[field] = { from: oldVal, to: newVal };
          }
        }
        if (Object.keys(changes).length > 0) {
          changedCount++;
          batchUpdates.push({ id: newItem.id, changeType: 'changed', changeDetails: changes });
        } else {
          unchangedCount++;
          batchUpdates.push({ id: newItem.id, changeType: 'unchanged', changeDetails: null });
        }
      }
    }

    for (const [key, _activeItem] of activeMap) {
      if (!newMap.has(key)) {
        removedCount++;
      }
    }

    for (const update of batchUpdates) {
      await prisma.clientesSnapshotItem.update({
        where: { id: update.id },
        data: {
          changeType: update.changeType,
          changeDetails: update.changeDetails || undefined,
        },
      });
    }

    await prisma.clientesSnapshot.update({
      where: { id: snapshotId },
      data: {
        newClients: newCount,
        changedClients: changedCount,
        removedClients: removedCount,
        status: 'approved',
      },
    });

    const lastVersion = await prisma.clientesPublishedVersion.findFirst({
      orderBy: { versionNumber: 'desc' },
    });
    const nextVersion = (lastVersion?.versionNumber || 0) + 1;
    const label = versionLabel || `v${nextVersion} - ${new Date().toISOString().split('T')[0]}`;

    if (activeVersion) {
      await prisma.clientesPublishedVersion.update({
        where: { id: activeVersion.id },
        data: { isActive: false },
      });
    }

    const published = await prisma.clientesPublishedVersion.create({
      data: {
        snapshotId,
        versionNumber: nextVersion,
        versionLabel: label,
        isActive: true,
        totalClients: newItems.length,
        newClients: newCount,
        changedClients: changedCount,
        removedClients: removedCount,
        publishedBy: req.user.id,
      },
    });

    await prisma.clientesSnapshot.update({
      where: { id: snapshotId },
      data: { status: 'published', publishedAt: new Date() },
    });

    await logUserActivity(req.user.id, 'publish_clientes', `Publicou versão ${nextVersion} da base de clientes (${newItems.length} clientes, ${newCount} novos, ${changedCount} alterados, ${removedCount} removidos)`, req, 'ClientesPublishedVersion', String(published.id));

    res.json({
      message: 'Versão publicada com sucesso',
      version: published,
      diff: { new: newCount, changed: changedCount, removed: removedCount, unchanged: unchangedCount, total: newItems.length },
      previousVersion: activeVersion ? { id: activeVersion.id, versionNumber: activeVersion.versionNumber } : null,
    });
  } catch (error: any) {
    console.error('[CLIENTES-SYNC] Publish error:', error);
    res.status(500).json({ message: 'Erro ao publicar versão' });
  }
});

// POST /api/admin/clientes-sync/rollback/:versionId
router.post('/rollback/:versionId', requireAdmin, async (req: any, res) => {
  try {
    const versionId = Number(req.params.versionId);
    const { reason } = req.body;

    const version = await prisma.clientesPublishedVersion.findUnique({ where: { id: versionId } });
    if (!version) return res.status(404).json({ message: 'Versão não encontrada' });

    if (!version.isActive) {
      const previousVersion = await prisma.clientesPublishedVersion.findFirst({
        where: { versionNumber: version.versionNumber - 1 },
      });
      if (!previousVersion) return res.status(400).json({ message: 'Não há versão anterior para rollback' });

      await prisma.clientesPublishedVersion.update({
        where: { id: previousVersion.id },
        data: { isActive: true },
      });
    }

    await prisma.clientesPublishedVersion.update({
      where: { id: versionId },
      data: {
        isActive: false,
        rolledBackAt: new Date(),
        rolledBackBy: req.user.id,
        rollbackReason: reason || 'Rollback solicitado pelo administrador',
      },
    });

    await logUserActivity(req.user.id, 'rollback_clientes', `Rollback da versão ${version.versionNumber}`, req, 'ClientesPublishedVersion', String(versionId));

    res.json({ message: `Rollback da versão ${version.versionNumber} concluído` });
  } catch (error: any) {
    console.error('[CLIENTES-SYNC] Rollback error:', error);
    res.status(500).json({ message: 'Erro ao realizar rollback' });
  }
});

// GET /api/admin/clientes-sync/versions
router.get('/versions', async (req: any, res) => {
  try {
    const versions = await prisma.clientesPublishedVersion.findMany({
      orderBy: { versionNumber: 'desc' },
      include: {
        snapshot: { select: { id: true, versionLabel: true, totalRows: true, validRows: true, invalidRows: true } },
        publisher: { select: { id: true, username: true, full_name: true } },
        rollbacker: { select: { id: true, username: true, full_name: true } },
      },
    });
    res.json(versions);
  } catch (error: any) {
    res.status(500).json({ message: 'Erro ao listar versões' });
  }
});

// GET /api/admin/clientes-sync/active
router.get('/active', async (req: any, res) => {
  try {
    const active = await prisma.clientesPublishedVersion.findFirst({
      where: { isActive: true },
      include: {
        snapshot: {
          include: {
            items: {
              where: { isValid: true, isActive: true },
              select: {
                id: true,
                codigoCliente: true,
                nomeCliente: true,
                nomeAbreviado: true,
                regiao: true,
                uf: true,
                cidade: true,
                bairro: true,
                cep: true,
                enderecoCompleto: true,
                numero: true,
                cnpj: true,
                documento: true,
                telefone: true,
                email: true,
                latitude: true,
                longitude: true,
                vendedor: true,
                representante: true,
                status: true,
                segmento: true,
                canal: true,
                dataCadastro: true,
                dataUltimaCompra: true,
                limiteCredito: true,
                faturamento: true,
                observacoes: true,
                changeType: true,
              },
            },
          },
        },
        publisher: { select: { id: true, username: true, full_name: true } },
      },
    });
    if (!active) return res.json({ version: null, clients: [] });
    res.json({
      version: {
        id: active.id,
        versionNumber: active.versionNumber,
        versionLabel: active.versionLabel,
        publishedAt: active.publishedAt,
        publishedBy: active.publisher,
        totalClients: active.totalClients,
        newClients: active.newClients,
        changedClients: active.changedClients,
        removedClients: active.removedClients,
      },
      clients: active.snapshot.items,
    });
  } catch (error: any) {
    res.status(500).json({ message: 'Erro ao buscar versão ativa' });
  }
});

// GET /api/admin/clientes-sync/diff/:runId
router.get('/diff/:runId', async (req: any, res) => {
  try {
    const runId = Number(req.params.runId);
    const run = await prisma.etlJobRun.findUnique({ where: { id: runId } });
    if (!run) return res.status(404).json({ message: 'Execução não encontrada' });

    const snapshot = await prisma.clientesSnapshot.findFirst({
      where: { etlRunId: runId },
    });
    if (!snapshot) return res.status(404).json({ message: 'Snapshot não encontrado para esta execução' });

    const items = await prisma.clientesSnapshotItem.findMany({
      where: { snapshotId: snapshot.id },
    });

    const activeVersion = await prisma.clientesPublishedVersion.findFirst({
      where: { isActive: true },
      include: {
        snapshot: {
          include: { items: { where: { isValid: true, isActive: true } } },
        },
      },
    });

    const newItems = items.filter(i => i.changeType === 'new' || (i.changeType === null && !activeVersion));
    const changedItems = items.filter(i => i.changeType === 'changed');
    const removedItems = activeVersion
      ? activeVersion.snapshot.items.filter(
          (ai) => !items.some((ni) => ni.codigoCliente.toLowerCase() === ai.codigoCliente.toLowerCase())
        )
      : [];
    const invalidItems = items.filter(i => !i.isValid);
    const validItems = items.filter(i => i.isValid);

    const diff = {
      snapshotId: snapshot.id,
      runId,
      total: items.length,
      valid: validItems.length,
      invalid: invalidItems.length,
      new: newItems.length,
      changed: changedItems.length,
      removed: removedItems.length,
      newClients: newItems,
      changedClients: changedItems,
      removedClients: removedItems.map(i => ({
        codigoCliente: i.codigoCliente,
        nomeCliente: i.nomeCliente,
      })),
      invalidClients: invalidItems,
      aproveitamento: items.length > 0 ? Math.round((validItems.length / items.length) * 100) : 0,
    };

    res.json(diff);
  } catch (error: any) {
    console.error('[CLIENTES-SYNC] Diff error:', error);
    res.status(500).json({ message: 'Erro ao calcular diff' });
  }
});

export default router;

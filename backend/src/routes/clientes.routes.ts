/**
 * @file clientes.routes.ts
 * @description Aqui é onde a mágica dos clientes acontece. 
 * É o balcão de atendimento: tu pede pra listar, criar ou mudar algo e a gente desenrola aqui.
 * 
 * Papo reto: Se o cliente não carregar no mapa, confere se as coordenadas (lat/lng) foram geradas.
 * Se o endereço for muito 'vago', o GPS do sistema se perde e o cliente fica num 'limbo' sem aparecer no mapa.
 * 
 * @author Cria de Nova Iguaçu
 */

import { Router } from 'express';
import { prisma } from '../prisma';
import { authenticate, requirePermission } from '../middlewares/auth';
import { logUserActivity } from '../utils/logger';
import { geocodeAddress } from '../utils/geocoding';
import { validateBody, createClienteSchema } from '../utils/validation';
import { getActivePublishedVersion } from '../utils/clientes-published';

const router = Router();

// Só entra quem tem o crachá (autenticado)
router.use(authenticate);

// ---------------------------------------------------------
// GET /api/clientes - Traz a lista da rapaziada (clientes)
// Suporta source=published para usar base publicada
// ---------------------------------------------------------
router.get('/', async (req, res) => {
  try {
    const { userId, source } = req.query;
    const user = (req as any).user;

    // Se source=published, retorna da base publicada
    if (source === 'published') {
      const { version, clients } = await getActivePublishedVersion();
      res.json({
        source: 'published',
        version: version ? {
          versionNumber: version.versionNumber,
          versionLabel: version.versionLabel,
          publishedAt: version.publishedAt,
          totalClients: version.totalClients,
        } : null,
        clientes: clients.map(c => ({
          id_cliente: 0,
          codigo_cliente: c.codigoCliente,
          nome_cliente: c.nomeCliente,
          nome_abreviado: c.nomeAbreviado,
          uf: c.uf,
          cidade: c.cidade,
          bairro: c.bairro,
          latitude: c.latitude,
          longitude: c.longitude,
          status_ativo: true,
          userId: null,
        })),
      });
      return;
    }

    const where: any = {};
    
    // Cada um no seu quadrado: 
    const hasSettingsPerm = user.permissions?.some((p: any) => (p.moduleId === 'settings' || p.module?.id === 'settings') && p.canEdit);
    const isAdmin = user.role === 'admin' || hasSettingsPerm;

    if (isAdmin) {
      if (user.subordinateIds && user.subordinateIds.length > 0) {
        where.userId = { in: [user.id, ...user.subordinateIds] };
      }
      if (userId) {
        const ids = String(userId).split(',').map(id => Number(id.trim())).filter(id => !isNaN(id));
        if (ids.length > 1) where.userId = { in: ids };
        else if (ids.length === 1) where.userId = ids[0];
      }
    } else if (user && (user.role === 'user' || user.role === 'supervisor')) {
      const subordinateIds = user.subordinateIds || [];
      where.userId = { in: [user.id, ...subordinateIds] };
    }

    let clientes: any[] = [];
    try {
      const prismaPromise = prisma.cliente.findMany({
        where,
        orderBy: { nome_cliente: 'asc' },
        select: {
          id_cliente: true,
          codigo_cliente: true,
          nome_cliente: true,
          nome_abreviado: true,
          uf: true,
          cidade: true,
          bairro: true,
          latitude: true,
          longitude: true,
          userId: true,
          status_ativo: true,
          semana: true,
          prioridade: true,
          user: { select: { id: true, full_name: true, username: true } }
        }
      });
      const timeoutPromise = new Promise((_, reject) => setTimeout(() => reject(new Error('Prisma Timeout')), 10000));
      clientes = await Promise.race([prismaPromise, timeoutPromise]) as any[];
      console.log(`[CLIENTES] Encontrados ${clientes.length} clientes via Prisma`);
    } catch (e) {
      console.warn(`[CLIENTES] Prisma falhou ou deu timeout, tentando via Supabase HTTP...`);
      let query = (req as any).supabaseAdmin.from('clientes').select('*, user:users(id, full_name, username)');
      
      if (where.userId) {
        if (where.userId.in) query = query.in('userId', where.userId.in);
        else query = query.eq('userId', where.userId);
      }
      
      const { data, error } = await query.order('nome_cliente', { ascending: true });
      if (error) throw error;
      clientes = data || [];
      console.log(`[CLIENTES] Encontrados ${clientes.length} clientes via HTTP Fallback`);
    }

    if (user) {
      logUserActivity(user.id, 'query', 'Usuário consultou a base de clientes', req, 'Cliente').catch(() => {});
    }

    res.json(clientes);
  } catch (error: any) {
    console.error('Deu ruim ao buscar clientes:', error);
    res.status(500).json({ 
      message: 'Erro ao buscar clientes',
      details: error.message
    });
  }
});

// ---------------------------------------------------------
// POST /api/clientes - Bota mais um cliente no jogo
// ---------------------------------------------------------
router.post('/', requirePermission('clientes', 'edit'), async (req, res) => {
  try {
    const validation = validateBody(createClienteSchema, req.body);
    if (!validation.success) {
      return res.status(400).json({ message: 'Dados inválidos', details: validation.error });
    }

    const user = (req as any).user;
    let { 
      codigo_cliente, 
      nome_cliente, 
      nome_abreviado, 
      cnpj, 
      regiao, 
      uf, 
      cidade, 
      bairro, 
      cep, 
      endereco_completo,
      numero,
      latitude,
      longitude,
      userId
    } = req.body;

    // --- Validação de Hierarquia para Cadastro ---
    // Se não for admin, ele só pode cadastrar clientes para SI MESMO ou para seus SUBORDINADOS.
    if (user && user.role !== 'admin') {
      const targetUserId = userId ? Number(userId) : user.id;
      const subordinateIds = user.subordinateIds || [];
      const allowedIds = [user.id, ...subordinateIds];

      if (!allowedIds.includes(targetUserId)) {
        console.warn(`[CLIENTES] Usuário ${user.id} tentou cadastrar cliente para usuário não autorizado: ${targetUserId}`);
        return res.status(403).json({ 
          message: 'Você só pode cadastrar clientes para você mesmo ou para sua equipe gerenciada.' 
        });
      }
      // Garante que o userId final seja o validado
      userId = targetUserId;
    }

    // Se o usuário não mandou a latitude ou longitude, a gente tenta achar no Google/Nominatim.
    if ((!latitude || !longitude) && (endereco_completo || (cidade && uf))) {
      const searchAddress = `${endereco_completo || ""}${numero ? ", " + numero : ""}${bairro ? ", " + bairro : ""}, ${cidade || ""}, ${uf || ""}`;
      const coords = await geocodeAddress(searchAddress.trim());
      
      if (coords) {
        latitude = coords.lat;
        longitude = coords.lng;
        console.log(`[Geocode] Achamos o lugar! "${searchAddress}": ${latitude}, ${longitude}`);
      } else {
        // Se cair aqui, o endereço tá muito zoado e o cliente vai ficar sem pino no mapa.
        console.warn(`[Geocode] Ih, rapaz! Não achei o endereço "${searchAddress}". O cliente vai ficar sem localização.`);
      }
    }

    if (!nome_cliente) {
      return res.status(400).json({ message: 'Qual é o nome do cliente? Não pode deixar em branco, pô.' });
    }

    // Se mandou um código, a gente checa se já não tem outro cliente 'clonado' com esse código.
    if (codigo_cliente) {
      const existing = await prisma.cliente.findUnique({
        where: { codigo_cliente }
      });

      if (existing) {
        return res.status(409).json({ message: 'Já tem um cliente com esse código aí, mexe nisso.' });
      }
    }

    const novoCliente = await prisma.cliente.create({
      data: {
        codigo_cliente,
        nome_cliente,
        nome_abreviado,
        cnpj,
        regiao,
        uf,
        cidade,
        bairro,
        cep,
        endereco_completo,
        numero: numero ? numero.toString() : null,
        latitude: latitude ? parseFloat(latitude.toString()) : null,
        longitude: longitude ? parseFloat(longitude.toString()) : null,
        userId: req.body.userId ? Number(req.body.userId) : null,
        semana: req.body.semana || null,
        prioridade: req.body.prioridade || null,
        status_ativo: true
      }
    });

    res.status(201).json({ message: 'Cliente cadastrado com sucesso! Já tá na conta.', cliente: novoCliente });
  } catch (error) {
    console.error('Deu erro ao criar cliente, mó vacilo:', error);
    res.status(500).json({ message: 'Erro ao cadastrar o cliente.' });
  }
});

// ---------------------------------------------------------
// PUT /api/clientes/:id - Atualiza os dados do cliente
// ---------------------------------------------------------
router.put('/:id', requirePermission('clientes', 'edit'), async (req, res) => {
  try {
    const validation = validateBody(createClienteSchema.partial(), req.body);
    if (!validation.success) {
      return res.status(400).json({ message: 'Dados inválidos', details: validation.error });
    }

    const user = (req as any).user;
    const id = parseInt(req.params.id as string);
    let { 
      codigo_cliente, nome_cliente, nome_abreviado, cnpj, regiao, uf, cidade, bairro, cep, 
      endereco_completo, numero, latitude, longitude, userId, 
      semana, prioridade, status_ativo 
    } = req.body;

    const existingClient = await prisma.cliente.findUnique({ where: { id_cliente: id } });
    if (!existingClient) return res.status(404).json({ message: 'Cliente não encontrado.' });

    // --- Validação de Hierarquia para Edição ---
    if (user && user.role !== 'admin') {
      const subordinateIds = user.subordinateIds || [];
      const allowedIds = [user.id, ...subordinateIds];

      // 1. Validar se o cliente atual pertence a alguém da equipe
      if (existingClient.userId && !allowedIds.includes(existingClient.userId)) {
        return res.status(403).json({ message: 'Você não tem permissão para editar este cliente.' });
      }

      // 2. Se estiver tentando transferir o cliente para outro usuário, validar o novo dono
      if (userId && !allowedIds.includes(Number(userId))) {
        return res.status(403).json({ message: 'Você só pode atribuir clientes para você mesmo ou sua equipe.' });
      }
    }

    // Se mudar o endereço, a gente recalcula o lugar pra não ficar com o pino no lugar errado.
    if (endereco_completo || numero || cidade || uf || bairro) {
      const searchAddress = `${endereco_completo || ""}${numero ? ", " + numero : ""}${bairro ? ", " + bairro : ""}, ${cidade || ""}, ${uf || ""}, Brasil`;
      console.log(`[Geocode Update] Recalculando GPS para: ${searchAddress.trim()}`);
      const coords = await geocodeAddress(searchAddress.trim());
      if (coords) {
        latitude = coords.lat;
        longitude = coords.lng;
        console.log(`[Geocode Update] Novas coordenadas pegas: ${latitude}, ${longitude}`);
      }
    }

    const clienteAtualizado = await prisma.cliente.update({
      where: { id_cliente: id },
      data: {
        codigo_cliente,
        nome_cliente,
        nome_abreviado,
        cnpj,
        regiao,
        uf,
        cidade,
        bairro,
        cep,
        endereco_completo,
        numero: numero ? numero.toString() : undefined,
        latitude: latitude ? parseFloat(latitude.toString()) : undefined,
        longitude: longitude ? parseFloat(longitude.toString()) : undefined,
        userId: userId ? Number(userId) : undefined,
        semana,
        prioridade,
        status_ativo: status_ativo !== undefined ? !!status_ativo : undefined
      }
    });

    res.json({ message: 'Cliente atualizado! Tudo nos conformes.', cliente: clienteAtualizado });
  } catch (error) {
    console.error('Erro ao atualizar cliente, mó furada:', error);
    res.status(500).json({ message: 'Erro ao atualizar o cliente.' });
  }
});

// ---------------------------------------------------------
// DELETE /api/clientes/:id - Manda o cliente pra conta do Papa
// ---------------------------------------------------------
router.delete('/:id', requirePermission('clientes', 'edit'), async (req, res) => {
  try {
    const user = (req as any).user;
    const id = parseInt(req.params.id as string);

    const existingClient = await prisma.cliente.findUnique({ where: { id_cliente: id } });
    if (!existingClient) return res.status(404).json({ message: 'Cliente não encontrado.' });

    // --- Validação de Hierarquia para Exclusão ---
    if (user && user.role !== 'admin') {
      const subordinateIds = user.subordinateIds || [];
      const allowedIds = [user.id, ...subordinateIds];

      if (existingClient.userId && !allowedIds.includes(existingClient.userId)) {
        return res.status(403).json({ message: 'Você não tem permissão para remover este cliente.' });
      }
    }

    await prisma.cliente.delete({ where: { id_cliente: id } });
    res.json({ message: 'Cliente removido! Sumiu do mapa.' });
  } catch (error) {
    console.error('Erro ao deletar cliente, que fase:', error);
    res.status(500).json({ message: 'Erro ao remover o cliente.' });
  }
});

export default router;

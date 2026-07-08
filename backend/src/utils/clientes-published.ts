import { prisma } from '../prisma';

export interface PublishedClient {
  codigoCliente: string;
  nomeCliente: string;
  nomeAbreviado: string | null;
  regiao: string | null;
  uf: string | null;
  cidade: string | null;
  bairro: string | null;
  cep: string | null;
  enderecoCompleto: string | null;
  numero: string | null;
  cnpj: string | null;
  documento: string | null;
  telefone: string | null;
  email: string | null;
  latitude: number | null;
  longitude: number | null;
  vendedor: string | null;
  representante: string | null;
  status: string | null;
  segmento: string | null;
  canal: string | null;
  dataCadastro: Date | null;
  dataUltimaCompra: Date | null;
  limiteCredito: number | null;
  faturamento: number | null;
  observacoes: string | null;
}

export interface PublishedVersion {
  id: number;
  versionNumber: number;
  versionLabel: string;
  publishedAt: Date | null;
  totalClients: number;
}

export async function getActivePublishedVersion(): Promise<{ version: PublishedVersion | null; clients: PublishedClient[] }> {
  const active = await prisma.clientesPublishedVersion.findFirst({
    where: { isActive: true },
    include: {
      snapshot: {
        include: {
          items: {
            where: { isValid: true, isActive: true },
            select: {
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
            },
          },
        },
      },
    },
  });

  if (!active) return { version: null, clients: [] };

  return {
    version: {
      id: active.id,
      versionNumber: active.versionNumber,
      versionLabel: active.versionLabel,
      publishedAt: active.publishedAt,
      totalClients: active.totalClients,
    },
    clients: active.snapshot.items as unknown as PublishedClient[],
  };
}

export async function getPublishedClientByCode(codigo: string): Promise<PublishedClient | null> {
  const version = await prisma.clientesPublishedVersion.findFirst({
    where: { isActive: true },
    select: { id: true },
  });
  if (!version) return null;

  const item = await prisma.clientesSnapshotItem.findFirst({
    where: {
      snapshot: { publishedVersions: { some: { id: version.id } } },
      codigoCliente: { equals: codigo, mode: 'insensitive' },
      isValid: true,
      isActive: true,
    },
    select: {
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
    },
  });

  return item as unknown as PublishedClient | null;
}

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from '@/components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { toast } from 'sonner';
import { API_BASE_URL } from '@/lib/api-base';
import {
  Database, Plus, Search, RefreshCw, Play, Eye, FileSpreadsheet, FileType,
  CheckCircle2, XCircle, AlertCircle, Loader2, Clock, ChevronRight, Download,
  History, ArrowUpDown, Ban, Trash2, Settings2, Upload, Activity, BarChart3,
  HardDrive, Table2, ListChecks, GitCompare, Send, Undo2, FileDown, Network,
  Workflow, FileBadge, Fingerprint, Users, AlertTriangle, Boxes, FileCheck,
  FolderOpen, Globe,
} from 'lucide-react';

const API = API_BASE_URL;

interface ExternalConnection {
  id: number;
  name: string;
  description: string | null;
  sourceType: string;
  filePath: string | null;
  filePattern: string | null;
  optionsJson: Record<string, unknown>;
  datasetTarget: string | null;
  tags: string[];
  status: string;
  lastValidatedAt: string | null;
  lastRunAt: string | null;
  lastPublishedAt: string | null;
  lastError: string | null;
  validationResult: { success?: boolean; columns?: number; rows?: number; error?: string } | null;
  createdBy: number;
  createdAt: string;
  datasets?: { id: number; name: string; status: string }[];
}

interface PreviewData {
  columns: { name: string; type: string }[];
  rows: Record<string, unknown>[];
  totalEstimate: number;
  warnings: string[];
}

interface EtlRun {
  id: number;
  jobId: number;
  connectionId: number;
  runType: string;
  status: string;
  rowsRead: number;
  rowsValid: number;
  rowsInvalid: number;
  rowsNew: number;
  rowsChanged: number;
  rowsRemoved: number;
  progressPct: number;
  startedAt: string | null;
  finishedAt: string | null;
  errorMessage: string | null;
  createdAt: string;
  connection?: { id: number; name: string; sourceType: string };
  triggerer?: { id: number; username: string; full_name: string };
}

interface PublishedVersion {
  id: number;
  versionNumber: number;
  versionLabel: string;
  isActive: boolean;
  totalClients: number;
  newClients: number;
  changedClients: number;
  removedClients: number;
  publishedAt: string;
  publishedBy?: number;
  publisher?: { id: number; username: string; full_name: string };
}

interface DiffResult {
  snapshotId: number;
  runId: number;
  total: number;
  valid: number;
  invalid: number;
  new: number;
  changed: number;
  removed: number;
  newClients: any[];
  changedClients: any[];
  removedClients: { codigoCliente: string; nomeCliente: string }[];
  invalidClients: any[];
  aproveitamento: number;
}

const SOURCE_TYPE_OPTIONS = [
  { value: 'parquet', label: 'Arquivo Parquet', icon: FileType },
  { value: 'parquet_folder', label: 'Pasta de Parquets', icon: FolderOpen },
  { value: 'xlsx', label: 'Planilha Excel (.xlsx)', icon: FileSpreadsheet },
];

const SOURCE_TYPE_LABELS: Record<string, string> = {
  parquet: 'Parquet',
  parquet_folder: 'Pasta Parquet',
  xlsx: 'Excel',
};

const STATUS_CONFIG: Record<string, { label: string; class: string }> = {
  active: { label: 'Ativo', class: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20' },
  inactive: { label: 'Inativo', class: 'bg-gray-500/10 text-gray-600 dark:text-gray-400 border-gray-500/20' },
  error: { label: 'Erro', class: 'bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/20' },
  testing: { label: 'Testando', class: 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20' },
};

interface DataConnectionsPanelProps {
  token: string;
  userId: number;
}

export function DataConnectionsPanel({ token, userId }: DataConnectionsPanelProps) {
  const authHeaders = useMemo(() => ({
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`,
  }), [token]);

  const [connections, setConnections] = useState<ExternalConnection[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showPreviewDialog, setShowPreviewDialog] = useState(false);
  const [showRunDialog, setShowRunDialog] = useState(false);
  const [showDiffDialog, setShowDiffDialog] = useState(false);
  const [showPublishDialog, setShowPublishDialog] = useState(false);
  const [showVersionsDialog, setShowVersionsDialog] = useState(false);
  const [selectedConn, setSelectedConn] = useState<ExternalConnection | null>(null);

  const [activeTab, setActiveTab] = useState('dashboard');

  const [runs, setRuns] = useState<EtlRun[]>([]);
  const [versions, setVersions] = useState<PublishedVersion[]>([]);
  const [activeVersion, setActiveVersion] = useState<PublishedVersion | null>(null);
  const [diffResult, setDiffResult] = useState<DiffResult | null>(null);

  const [runningJobs, setRunningJobs] = useState<Set<number>>(new Set());

  const [formData, setFormData] = useState({
    name: '', description: '', sourceType: 'parquet', filePath: '',
    filePattern: '', datasetTarget: '',
    options: { union_by_name: true, hive_partitioning: false, sheet: 'Sheet1', header: true },
  });

  const [previewData, setPreviewData] = useState<PreviewData | null>(null);
  const [previewLoading, setPreviewLoading] = useState(false);

  const fetchConnections = useCallback(async () => {
    try {
      const res = await fetch(`${API}/api/admin/data-connections`, { headers: authHeaders });
      if (res.ok) setConnections(await res.json());
    } catch (e) {
      toast.error('Erro ao carregar conexões');
    } finally {
      setLoading(false);
    }
  }, [authHeaders]);

  const fetchRuns = useCallback(async () => {
    try {
      const res = await fetch(`${API}/api/admin/etl/runs?limit=20`, { headers: authHeaders });
      if (res.ok) setRuns(await res.json());
    } catch { }
  }, [authHeaders]);

  const fetchVersions = useCallback(async () => {
    try {
      const res = await fetch(`${API}/api/admin/clientes-sync/versions`, { headers: authHeaders });
      if (res.ok) setVersions(await res.json());
      const activeRes = await fetch(`${API}/api/admin/clientes-sync/active`, { headers: authHeaders });
      if (activeRes.ok) {
        const data = await activeRes.json();
        setActiveVersion(data.version);
      }
    } catch { }
  }, [authHeaders]);

  useEffect(() => { fetchConnections(); fetchRuns(); fetchVersions(); }, [fetchConnections, fetchRuns, fetchVersions]);

  const filteredConnections = useMemo(() => {
    if (!searchQuery) return connections;
    const q = searchQuery.toLowerCase();
    return connections.filter(c =>
      c.name.toLowerCase().includes(q) ||
      c.sourceType.toLowerCase().includes(q) ||
      c.description?.toLowerCase().includes(q)
    );
  }, [connections, searchQuery]);

  const dashboardStats = useMemo(() => {
    const total = connections.length;
    const active = connections.filter(c => c.status === 'active').length;
    const erro = connections.filter(c => c.status === 'error').length;
    const datasets = connections.filter(c => c.datasets && c.datasets.length > 0).length;
    const lastSync = connections.reduce((latest, c) => {
      if (c.lastRunAt && (!latest || c.lastRunAt > latest)) return c.lastRunAt;
      return latest;
    }, null as string | null);
    return { total, active, erro, datasets, lastSync };
  }, [connections]);

  const recentAlerts = useMemo(() => {
    return connections.filter(c => c.status === 'error').slice(0, 5);
  }, [connections]);

  const handleCreate = async () => {
    if (!formData.name) { toast.error('Nome é obrigatório'); return; }
    try {
      const res = await fetch(`${API}/api/admin/data-connections`, {
        method: 'POST',
        headers: authHeaders,
        body: JSON.stringify({
          name: formData.name,
          description: formData.description,
          sourceType: formData.sourceType,
          filePath: formData.filePath,
          filePattern: formData.filePattern || undefined,
          datasetTarget: formData.datasetTarget || undefined,
          optionsJson: formData.options,
        }),
      });
      if (res.ok) {
        toast.success('Conexão criada!');
        setShowCreateDialog(false);
        resetForm();
        fetchConnections();
      } else {
        const err = await res.json();
        toast.error(err.message || 'Erro ao criar');
      }
    } catch {
      toast.error('Erro de conexão');
    }
  };

  const handleTest = async (conn: ExternalConnection) => {
    try {
      const res = await fetch(`${API}/api/admin/data-connections/${conn.id}/test`, {
        method: 'POST',
        headers: authHeaders,
      });
      const result = await res.json();
      if (result.success) {
        toast.success(`Conexão OK! ${result.columns} colunas, ~${result.rows} registros (${result.elapsed_ms}ms)`);
      } else {
        toast.error(`Falha: ${result.error}`);
      }
      fetchConnections();
    } catch {
      toast.error('Erro ao testar conexão');
    }
  };

  const handlePreview = async (conn: ExternalConnection) => {
    setSelectedConn(conn);
    setShowPreviewDialog(true);
    setPreviewLoading(true);
    setPreviewData(null);
    try {
      const res = await fetch(`${API}/api/admin/data-connections/${conn.id}/preview`, {
        method: 'POST',
        headers: authHeaders,
        body: JSON.stringify({ limit: 30 }),
      });
      if (res.ok) setPreviewData(await res.json());
      else toast.error('Erro ao gerar preview');
    } catch {
      toast.error('Erro de conexão');
    } finally {
      setPreviewLoading(false);
    }
  };

  const handleRun = async (conn: ExternalConnection) => {
    setRunningJobs(prev => new Set(prev).add(conn.id));
    try {
      const res = await fetch(`${API}/api/admin/data-connections/${conn.id}/run`, {
        method: 'POST',
        headers: authHeaders,
      });
      if (res.ok) {
        const data = await res.json();
        toast.success('Execução iniciada em background');
        setShowRunDialog(true);
        setSelectedConn(conn);
        setTimeout(() => { fetchRuns(); }, 2000);
      } else {
        const err = await res.json();
        toast.error(err.message || 'Erro ao iniciar execução');
      }
    } catch {
      toast.error('Erro de conexão');
    } finally {
      setRunningJobs(prev => { const next = new Set(prev); next.delete(conn.id); return next; });
    }
  };

  const handleProcessRun = async (runId: number) => {
    try {
      const res = await fetch(`${API}/api/admin/etl/runs/${runId}/process`, {
        method: 'POST',
        headers: authHeaders,
      });
      if (res.ok) {
        const data = await res.json();
        toast.success(`Processamento concluído: ${data.rowsValid} registros válidos`);
        fetchRuns();
        if (data.snapshotId) {
          fetchDiff(runId);
        }
      } else {
        const err = await res.json();
        toast.error(err.message || 'Erro no processamento');
      }
    } catch {
      toast.error('Erro ao processar');
    }
  };

  const fetchDiff = async (runId: number) => {
    try {
      const res = await fetch(`${API}/api/admin/clientes-sync/diff/${runId}`, {
        headers: authHeaders,
      });
      if (res.ok) {
        setDiffResult(await res.json());
        setShowDiffDialog(true);
      }
    } catch {
      toast.error('Erro ao carregar diff');
    }
  };

  const handlePublish = async (snapshotId: number) => {
    try {
      const res = await fetch(`${API}/api/admin/clientes-sync/publish`, {
        method: 'POST',
        headers: authHeaders,
        body: JSON.stringify({ snapshotId }),
      });
      if (res.ok) {
        const data = await res.json();
        toast.success(`Versão ${data.version.versionNumber} publicada!`);
        setShowPublishDialog(false);
        fetchVersions();
      } else {
        const err = await res.json();
        toast.error(err.message || 'Erro ao publicar');
      }
    } catch {
      toast.error('Erro ao publicar');
    }
  };

  const handleRollback = async (versionId: number) => {
    if (!confirm('Tem certeza que deseja reverter para esta versão?')) return;
    try {
      const res = await fetch(`${API}/api/admin/clientes-sync/rollback/${versionId}`, {
        method: 'POST',
        headers: authHeaders,
        body: JSON.stringify({ reason: 'Rollback manual pelo administrador' }),
      });
      if (res.ok) {
        toast.success('Rollback realizado');
        fetchVersions();
      } else {
        toast.error('Erro ao fazer rollback');
      }
    } catch {
      toast.error('Erro ao fazer rollback');
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Remover esta conexão? Os dados históricos serão preservados.')) return;
    try {
      const res = await fetch(`${API}/api/admin/data-connections/${id}`, {
        method: 'DELETE',
        headers: authHeaders,
      });
      if (res.ok) {
        toast.success('Conexão removida');
        fetchConnections();
      }
    } catch {
      toast.error('Erro ao remover');
    }
  };

  const resetForm = () => {
    setFormData({
      name: '', description: '', sourceType: 'parquet', filePath: '',
      filePattern: '', datasetTarget: '',
      options: { union_by_name: true, hive_partitioning: false, sheet: 'Sheet1', header: true },
    });
  };

  const statusBadge = (status: string) => {
    const cfg = STATUS_CONFIG[status] || STATUS_CONFIG.inactive;
    return <Badge variant="outline" className={cfg.class}>{cfg.label}</Badge>;
  };

  const runStatusBadge = (status: string) => {
    const colors: Record<string, string> = {
      pending: 'bg-yellow-500/10 text-yellow-600 dark:text-yellow-400',
      running: 'bg-blue-500/10 text-blue-600 dark:text-blue-400',
      reading: 'bg-blue-500/10 text-blue-600 dark:text-blue-400',
      validating: 'bg-purple-500/10 text-purple-600 dark:text-purple-400',
      ready: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400',
      published: 'bg-green-500/10 text-green-600 dark:text-green-400',
      failed: 'bg-red-500/10 text-red-600 dark:text-red-400',
      cancelled: 'bg-gray-500/10 text-gray-600 dark:text-gray-400',
    };
    return <Badge variant="outline" className={colors[status] || 'bg-gray-500/10 text-gray-600 dark:text-gray-400'}>{status}</Badge>;
  };

  const sourceIcon = (type: string) => {
    const opt = SOURCE_TYPE_OPTIONS.find(o => o.value === type);
    const Icon = opt?.icon || Database;
    return <Icon className="w-4 h-4" />;
  };

  return (
    <div className="space-y-6">
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <div className="flex items-center justify-between">
          <TabsList>
            <TabsTrigger value="dashboard" className="gap-2"><Activity className="w-4 h-4" />Dashboard</TabsTrigger>
            <TabsTrigger value="connections" className="gap-2"><Database className="w-4 h-4" />Conexões</TabsTrigger>
            <TabsTrigger value="runs" className="gap-2"><Play className="w-4 h-4" />Execuções</TabsTrigger>
            <TabsTrigger value="versions" className="gap-2"><History className="w-4 h-4" />Versões</TabsTrigger>
          </TabsList>
        </div>

        {/* ─── DASHBOARD TAB ───────────────────────────────────────── */}
        <TabsContent value="dashboard" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Conexões</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{dashboardStats.total}</div>
                <p className="text-xs text-muted-foreground mt-1">
                  {dashboardStats.active} ativas · {dashboardStats.erro} com erro
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Datasets</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{dashboardStats.datasets}</div>
                <p className="text-xs text-muted-foreground mt-1">configurados</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Base Ativa</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{activeVersion?.totalClients || 0}</div>
                <p className="text-xs text-muted-foreground mt-1">
                  {activeVersion ? `v${activeVersion.versionNumber}` : 'Nenhuma versão publicada'}
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Última Sincronização</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-lg font-bold">{dashboardStats.lastSync ? new Date(dashboardStats.lastSync).toLocaleString('pt-BR') : 'Nunca'}</div>
              </CardContent>
            </Card>
          </div>

          {recentAlerts.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2"><AlertTriangle className="w-4 h-4 text-red-500" />Alertas Recentes</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {recentAlerts.map(conn => (
                    <div key={conn.id} className="flex items-center justify-between p-3 bg-red-500/5 border border-red-500/10 rounded-lg">
                      <div>
                        <p className="font-medium text-sm">{conn.name}</p>
                        <p className="text-xs text-muted-foreground">{conn.lastError}</p>
                      </div>
                      <Badge variant="outline" className="bg-red-500/10 text-red-600">Erro</Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><Activity className="w-4 h-4" />Últimas Execuções</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Job</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Registros</TableHead>
                    <TableHead>Data</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {runs.slice(0, 5).map(run => (
                    <TableRow key={run.id}>
                      <TableCell className="font-medium">{run.connection?.name || `Run #${run.id}`}</TableCell>
                      <TableCell>{runStatusBadge(run.status)}</TableCell>
                      <TableCell>{run.rowsValid}/{run.rowsRead}</TableCell>
                      <TableCell className="text-muted-foreground">{new Date(run.createdAt).toLocaleString('pt-BR')}</TableCell>
                    </TableRow>
                  ))}
                  {runs.length === 0 && (
                    <TableRow><TableCell colSpan={4} className="text-center py-8 text-muted-foreground">Nenhuma execução ainda</TableCell></TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ─── CONNECTIONS TAB ──────────────────────────────────────── */}
        <TabsContent value="connections" className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="relative w-72">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Buscar conexões..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={fetchConnections}><RefreshCw className="w-4 h-4 mr-1" />Atualizar</Button>
              <Button size="sm" onClick={() => { resetForm(); setShowCreateDialog(true); }}><Plus className="w-4 h-4 mr-1" />Nova Conexão</Button>
            </div>
          </div>

          <Card>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[250px]">Nome</TableHead>
                    <TableHead>Tipo</TableHead>
                    <TableHead>Path</TableHead>
                    <TableHead>Dataset</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Última Execução</TableHead>
                    <TableHead className="text-right">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {loading ? (
                    <TableRow><TableCell colSpan={7} className="text-center py-8"><Loader2 className="w-6 h-6 animate-spin mx-auto" /></TableCell></TableRow>
                  ) : filteredConnections.length === 0 ? (
                    <TableRow><TableCell colSpan={7} className="text-center py-12 text-muted-foreground">
                      <Database className="w-12 h-12 mx-auto mb-3 opacity-30" />
                      <p>Nenhuma conexão encontrada</p>
                      <Button variant="outline" size="sm" className="mt-3" onClick={() => { resetForm(); setShowCreateDialog(true); }}>
                        <Plus className="w-4 h-4 mr-1" />Criar primeira conexão
                      </Button>
                    </TableCell></TableRow>
                  ) : filteredConnections.map(conn => (
                    <TableRow key={conn.id}>
                      <TableCell>
                        <div className="font-medium">{conn.name}</div>
                        {conn.description && <div className="text-xs text-muted-foreground truncate max-w-[200px]">{conn.description}</div>}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1.5">
                          {sourceIcon(conn.sourceType)}
                          <span className="text-sm">{SOURCE_TYPE_LABELS[conn.sourceType] || conn.sourceType}</span>
                        </div>
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground max-w-[200px] truncate">{conn.filePath}</TableCell>
                      <TableCell>{conn.datasetTarget ? <Badge variant="outline" className="text-xs">{conn.datasetTarget}</Badge> : <span className="text-muted-foreground text-sm">—</span>}</TableCell>
                      <TableCell>{statusBadge(conn.status)}</TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {conn.lastRunAt ? new Date(conn.lastRunAt).toLocaleString('pt-BR') : '—'}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center justify-end gap-1">
                          <Button variant="ghost" size="icon" className="w-8 h-8" onClick={() => handleTest(conn)} title="Testar"><Play className="w-3.5 h-3.5" /></Button>
                          <Button variant="ghost" size="icon" className="w-8 h-8" onClick={() => handlePreview(conn)} title="Preview"><Eye className="w-3.5 h-3.5" /></Button>
                          <Button variant="ghost" size="icon" className="w-8 h-8" onClick={() => handleRun(conn)} title="Executar" disabled={runningJobs.has(conn.id)}>
                            {runningJobs.has(conn.id) ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Upload className="w-3.5 h-3.5" />}
                          </Button>
                          <Button variant="ghost" size="icon" className="w-8 h-8 text-red-500 hover:text-red-600" onClick={() => handleDelete(conn.id)} title="Remover"><Trash2 className="w-3.5 h-3.5" /></Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ─── RUNS TAB ─────────────────────────────────────────────── */}
        <TabsContent value="runs" className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">Histórico de Execuções</h3>
            <Button variant="outline" size="sm" onClick={fetchRuns}><RefreshCw className="w-4 h-4 mr-1" />Atualizar</Button>
          </div>
          <Card>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Conexão</TableHead>
                    <TableHead>Tipo</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Progresso</TableHead>
                    <TableHead>Válidos/Total</TableHead>
                    <TableHead>Disparado por</TableHead>
                    <TableHead>Início</TableHead>
                    <TableHead className="text-right">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {runs.length === 0 ? (
                    <TableRow><TableCell colSpan={8} className="text-center py-8 text-muted-foreground">Nenhuma execução encontrada</TableCell></TableRow>
                  ) : runs.map(run => (
                    <TableRow key={run.id}>
                      <TableCell className="font-medium">{run.connection?.name || `#${run.connectionId}`}</TableCell>
                      <TableCell><Badge variant="outline" className="text-xs">{run.runType}</Badge></TableCell>
                      <TableCell>{runStatusBadge(run.status)}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <div className="w-24 h-2 bg-secondary rounded-full overflow-hidden">
                            <div className={`h-full rounded-full transition-all ${run.status === 'failed' ? 'bg-red-500' : 'bg-primary'}`} style={{ width: `${run.progressPct || 0}%` }} />
                          </div>
                          <span className="text-xs text-muted-foreground">{run.progressPct || 0}%</span>
                        </div>
                      </TableCell>
                      <TableCell>{run.rowsValid}/{run.rowsRead}</TableCell>
                      <TableCell className="text-sm">{run.triggerer?.full_name || run.triggerer?.username || '—'}</TableCell>
                      <TableCell className="text-sm text-muted-foreground">{run.startedAt ? new Date(run.startedAt).toLocaleString('pt-BR') : new Date(run.createdAt).toLocaleString('pt-BR')}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-1">
                          {run.status === 'pending' && (
                            <Button variant="ghost" size="sm" className="h-7 text-xs" onClick={() => handleProcessRun(run.id)}>
                              Processar
                            </Button>
                          )}
                          {run.status === 'ready' && run.resultJson && typeof run.resultJson === 'object' && 'snapshotId' in (run.resultJson as any) && (
                            <Button variant="ghost" size="sm" className="h-7 text-xs text-emerald-500" onClick={() => {
                              setShowPublishDialog(true);
                              setSelectedConn(conn => conn);
                              setDiffResult(d => d);
                              const snapshotId = (run.resultJson as any).snapshotId;
                              if (snapshotId) handlePublish(snapshotId);
                            }}>
                              Publicar
                            </Button>
                          )}
                          {run.status === 'failed' && (
                            <Button variant="ghost" size="sm" className="h-7 text-xs" onClick={async () => {
                              const res = await fetch(`${API}/api/admin/etl/runs/${run.id}/retry`, { method: 'POST', headers: authHeaders });
                              if (res.ok) { toast.success('Reexecução criada'); fetchRuns(); }
                            }}>
                              Reexecutar
                            </Button>
                          )}
                          {run.rowsNew > 0 || run.rowsChanged > 0 ? (
                            <Button variant="ghost" size="sm" className="h-7 text-xs" onClick={() => fetchDiff(run.id)}>
                              <GitCompare className="w-3 h-3 mr-1" />Diff
                            </Button>
                          ) : null}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ─── VERSIONS TAB ─────────────────────────────────────────── */}
        <TabsContent value="versions" className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">Versões Publicadas</h3>
            <Button variant="outline" size="sm" onClick={fetchVersions}><RefreshCw className="w-4 h-4 mr-1" />Atualizar</Button>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            <Card className="lg:col-span-2">
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Versão</TableHead>
                      <TableHead>Label</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Total</TableHead>
                      <TableHead>Novos</TableHead>
                      <TableHead>Alterados</TableHead>
                      <TableHead>Removidos</TableHead>
                      <TableHead>Publicado por</TableHead>
                      <TableHead>Data</TableHead>
                      <TableHead className="text-right">Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {versions.length === 0 ? (
                      <TableRow><TableCell colSpan={10} className="text-center py-8 text-muted-foreground">Nenhuma versão publicada</TableCell></TableRow>
                    ) : versions.map(v => (
                      <TableRow key={v.id}>
                        <TableCell className="font-mono font-bold">v{v.versionNumber}</TableCell>
                        <TableCell className="text-sm">{v.versionLabel}</TableCell>
                        <TableCell>
                          {v.isActive ?
                            <Badge className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20">Ativa</Badge> :
                            v.rolledBackAt ?
                              <Badge variant="outline" className="bg-orange-500/10 text-orange-600">Revertida</Badge> :
                              <Badge variant="outline" className="bg-gray-500/10 text-gray-600">Inativa</Badge>
                          }
                        </TableCell>
                        <TableCell>{v.totalClients}</TableCell>
                        <TableCell className="text-emerald-500">{v.newClients}</TableCell>
                        <TableCell className="text-amber-500">{v.changedClients}</TableCell>
                        <TableCell className="text-red-500">{v.removedClients}</TableCell>
                        <TableCell className="text-sm">{v.publisher?.full_name || v.publisher?.username || '—'}</TableCell>
                        <TableCell className="text-xs text-muted-foreground">{new Date(v.publishedAt).toLocaleString('pt-BR')}</TableCell>
                        <TableCell className="text-right">
                          {!v.isActive && v.rolledBackAt === null && (
                            <Button variant="ghost" size="sm" className="h-7 text-xs" onClick={() => handleRollback(v.id)}>
                              <Undo2 className="w-3 h-3 mr-1" />Ativar
                            </Button>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle className="text-sm font-medium">Resumo</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {activeVersion ? (
                  <>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Versão Ativa</span>
                      <Badge className="font-mono">v{activeVersion.versionNumber}</Badge>
                    </div>
                    <Separator />
                    <div className="flex items-center justify-between"><span className="text-sm text-muted-foreground">Total Clientes</span><span className="font-bold">{activeVersion.totalClients}</span></div>
                    <div className="flex items-center justify-between"><span className="text-sm text-muted-foreground">Publicada em</span><span className="text-sm">{new Date(activeVersion.publishedAt).toLocaleDateString('pt-BR')}</span></div>
                    {activeVersion.newClients > 0 && (
                      <div className="flex items-center justify-between"><span className="text-sm text-emerald-500">Novos</span><span className="font-bold text-emerald-500">+{activeVersion.newClients}</span></div>
                    )}
                    {activeVersion.changedClients > 0 && (
                      <div className="flex items-center justify-between"><span className="text-sm text-amber-500">Alterados</span><span className="font-bold text-amber-500">~{activeVersion.changedClients}</span></div>
                    )}
                    {activeVersion.removedClients > 0 && (
                      <div className="flex items-center justify-between"><span className="text-sm text-red-500">Removidos</span><span className="font-bold text-red-500">-{activeVersion.removedClients}</span></div>
                    )}
                  </>
                ) : (
                  <p className="text-sm text-muted-foreground text-center py-4">Nenhuma versão ativa</p>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      {/* ─── CREATE DIALOG ────────────────────────────────────────── */}
      <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
        <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2"><Plus className="w-5 h-5" />Nova Conexão Externa</DialogTitle>
            <DialogDescription>Configure uma nova fonte de dados externa</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Nome da Conexão *</Label>
              <Input value={formData.name} onChange={e => setFormData(p => ({ ...p, name: e.target.value }))} placeholder="Ex: Base Oficial de Clientes" />
            </div>
            <div className="space-y-2">
              <Label>Descrição</Label>
              <Textarea value={formData.description} onChange={e => setFormData(p => ({ ...p, description: e.target.value }))} placeholder="Descrição opcional da fonte" />
            </div>
            <div className="space-y-2">
              <Label>Tipo de Fonte *</Label>
              <Select value={formData.sourceType} onValueChange={v => setFormData(p => ({ ...p, sourceType: v }))}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o tipo" />
                </SelectTrigger>
                <SelectContent>
                  {SOURCE_TYPE_OPTIONS.map(opt => (
                    <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Path do Arquivo *</Label>
              <Input value={formData.filePath} onChange={e => setFormData(p => ({ ...p, filePath: e.target.value }))}
                placeholder={formData.sourceType === 'xlsx' ? 'C:/dados/clientes.xlsx' : formData.sourceType === 'parquet_folder' ? 'C:/dados/parquets/' : 'C:/dados/clientes.parquet'} />
            </div>
            {formData.sourceType === 'parquet_folder' && (
              <div className="space-y-2">
                <Label>Glob Pattern</Label>
                <Input value={formData.filePattern} onChange={e => setFormData(p => ({ ...p, filePattern: e.target.value }))} placeholder="*.parquet" />
              </div>
            )}
            <div className="space-y-2">
              <Label>Dataset Alvo</Label>
              <Input value={formData.datasetTarget} onChange={e => setFormData(p => ({ ...p, datasetTarget: e.target.value }))} placeholder="Ex: Base Oficial de Clientes" />
            </div>

            {formData.sourceType === 'parquet' || formData.sourceType === 'parquet_folder' ? (
              <div className="flex items-center gap-4 p-3 bg-secondary/30 rounded-lg">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" checked={formData.options.union_by_name} onChange={e => setFormData(p => ({ ...p, options: { ...p.options, union_by_name: e.target.checked } }))} className="rounded" />
                  <span className="text-sm">union_by_name</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" checked={formData.options.hive_partitioning} onChange={e => setFormData(p => ({ ...p, options: { ...p.options, hive_partitioning: e.target.checked } }))} className="rounded" />
                  <span className="text-sm">hive_partitioning</span>
                </label>
              </div>
            ) : (
              <div className="flex flex-wrap items-center gap-4 p-3 bg-secondary/30 rounded-lg">
                <div className="space-y-1">
                  <Label className="text-xs">Sheet</Label>
                  <Input value={formData.options.sheet} onChange={e => setFormData(p => ({ ...p, options: { ...p.options, sheet: e.target.value } }))} className="w-28 h-8 text-sm" placeholder="Sheet1" />
                </div>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" checked={formData.options.header} onChange={e => setFormData(p => ({ ...p, options: { ...p.options, header: e.target.checked } }))} className="rounded" />
                  <span className="text-sm">Com cabeçalho</span>
                </label>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCreateDialog(false)}>Cancelar</Button>
            <Button onClick={handleCreate}><Plus className="w-4 h-4 mr-1" />Criar Conexão</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ─── PREVIEW DIALOG ───────────────────────────────────────── */}
      <Dialog open={showPreviewDialog} onOpenChange={setShowPreviewDialog}>
        <DialogContent className="max-w-4xl max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Eye className="w-5 h-5" />Preview: {selectedConn?.name}
            </DialogTitle>
          </DialogHeader>
          {previewLoading ? (
            <div className="flex items-center justify-center py-12"><Loader2 className="w-8 h-8 animate-spin" /></div>
          ) : previewData ? (
            <div className="space-y-4">
              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                <span>~{previewData.totalEstimate} registros</span>
                <span>{previewData.columns.length} colunas</span>
                {previewData.warnings.length > 0 && (
                  <div className="flex items-center gap-1 text-amber-500">
                    <AlertTriangle className="w-3.5 h-3.5" />
                    <span>{previewData.warnings.length} avisos</span>
                  </div>
                )}
              </div>
              <ScrollArea className="max-h-96 border rounded-md">
                <Table>
                  <TableHeader>
                    <TableRow>
                      {previewData.columns.map(col => (
                        <TableHead key={col.name} className="text-xs whitespace-nowrap">
                          <div className="flex flex-col">
                            <span>{col.name}</span>
                            <span className="text-[10px] text-muted-foreground font-mono">{col.type}</span>
                          </div>
                        </TableHead>
                      ))}
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {previewData.rows.map((row, i) => (
                      <TableRow key={i}>
                        {previewData.columns.map(col => (
                          <TableCell key={col.name} className="text-xs max-w-[200px] truncate">
                            {String(row[col.name] ?? '')}
                          </TableCell>
                        ))}
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </ScrollArea>
            </div>
          ) : (
            <p className="text-center py-8 text-muted-foreground">Nenhum dado disponível</p>
          )}
        </DialogContent>
      </Dialog>

      {/* ─── DIFF DIALOG ──────────────────────────────────────────── */}
      <Dialog open={showDiffDialog} onOpenChange={setShowDiffDialog}>
        <DialogContent className="max-w-4xl max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2"><GitCompare className="w-5 h-5" />Comparação de Carga</DialogTitle>
          </DialogHeader>
          {diffResult && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <Card><CardContent className="p-4 text-center"><div className="text-2xl font-bold text-emerald-500">{diffResult.new}</div><div className="text-xs text-muted-foreground">Novos</div></CardContent></Card>
                <Card><CardContent className="p-4 text-center"><div className="text-2xl font-bold text-amber-500">{diffResult.changed}</div><div className="text-xs text-muted-foreground">Alterados</div></CardContent></Card>
                <Card><CardContent className="p-4 text-center"><div className="text-2xl font-bold text-red-500">{diffResult.removed}</div><div className="text-xs text-muted-foreground">Removidos</div></CardContent></Card>
                <Card><CardContent className="p-4 text-center"><div className="text-2xl font-bold">{diffResult.invalid}</div><div className="text-xs text-muted-foreground">Inválidos</div></CardContent></Card>
              </div>
              <div className="flex items-center gap-4 text-sm">
                <span>Total lido: <strong>{diffResult.total}</strong></span>
                <span>Válidos: <strong>{diffResult.valid}</strong></span>
                <span>Aproveitamento: <strong>{diffResult.aproveitamento}%</strong></span>
              </div>

              {diffResult.changedClients.length > 0 && (
                <div>
                  <h4 className="text-sm font-medium mb-2 flex items-center gap-1"><ArrowUpDown className="w-3.5 h-3.5 text-amber-500" />Clientes Alterados ({diffResult.changedClients.length})</h4>
                  <ScrollArea className="max-h-48 border rounded-md">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead className="text-xs">Código</TableHead>
                          <TableHead className="text-xs">Nome</TableHead>
                          <TableHead className="text-xs">Campos Alterados</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {diffResult.changedClients.slice(0, 50).map((c: any) => (
                          <TableRow key={c.id}>
                            <TableCell className="text-xs font-mono">{c.codigoCliente}</TableCell>
                            <TableCell className="text-xs">{c.nomeCliente}</TableCell>
                            <TableCell className="text-xs">
                              {c.changeDetails ? Object.keys(c.changeDetails).join(', ') : '—'}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </ScrollArea>
                </div>
              )}

              {diffResult.newClients.length > 0 && (
                <div>
                  <h4 className="text-sm font-medium mb-2 flex items-center gap-1"><Plus className="w-3.5 h-3.5 text-emerald-500" />Novos Clientes ({diffResult.newClients.length})</h4>
                  <ScrollArea className="max-h-48 border rounded-md">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead className="text-xs">Código</TableHead>
                          <TableHead className="text-xs">Nome</TableHead>
                          <TableHead className="text-xs">UF</TableHead>
                          <TableHead className="text-xs">Cidade</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {diffResult.newClients.slice(0, 50).map((c: any) => (
                          <TableRow key={c.id}>
                            <TableCell className="text-xs font-mono">{c.codigoCliente}</TableCell>
                            <TableCell className="text-xs">{c.nomeCliente}</TableCell>
                            <TableCell className="text-xs">{c.uf}</TableCell>
                            <TableCell className="text-xs">{c.cidade}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </ScrollArea>
                </div>
              )}

              {diffResult.invalidClients.length > 0 && (
                <div>
                  <h4 className="text-sm font-medium mb-2 flex items-center gap-1"><XCircle className="w-3.5 h-3.5 text-red-500" />Registros Inválidos ({diffResult.invalidClients.length})</h4>
                  <ScrollArea className="max-h-48 border rounded-md">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead className="text-xs">Código</TableHead>
                          <TableHead className="text-xs">Nome</TableHead>
                          <TableHead className="text-xs">Erros</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {diffResult.invalidClients.slice(0, 30).map((c: any) => (
                          <TableRow key={c.id}>
                            <TableCell className="text-xs font-mono">{c.codigoCliente}</TableCell>
                            <TableCell className="text-xs">{c.nomeCliente}</TableCell>
                            <TableCell className="text-xs text-red-500">
                              {Array.isArray(c.validationErrors) ? c.validationErrors.join('; ') : '—'}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </ScrollArea>
                </div>
              )}

              {diffResult.removedClients.length > 0 && (
                <div>
                  <h4 className="text-sm font-medium mb-2 flex items-center gap-1"><Ban className="w-3.5 h-3.5 text-red-500" />Removidos ({diffResult.removedClients.length})</h4>
                  <ScrollArea className="max-h-32 border rounded-md">
                    <Table>
                      <TableHeader>
                        <TableRow><TableHead className="text-xs">Código</TableHead><TableHead className="text-xs">Nome</TableHead></TableRow>
                      </TableHeader>
                      <TableBody>
                        {diffResult.removedClients.slice(0, 30).map((c, i) => (
                          <TableRow key={i}>
                            <TableCell className="text-xs font-mono">{c.codigoCliente}</TableCell>
                            <TableCell className="text-xs">{c.nomeCliente}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </ScrollArea>
                </div>
              )}

              <DialogFooter>
                <Button variant="outline" onClick={() => setShowDiffDialog(false)}>Fechar</Button>
                {diffResult.snapshotId && (
                  <Button onClick={() => handlePublish(diffResult.snapshotId)}>
                    <Send className="w-4 h-4 mr-1" />Publicar Versão
                  </Button>
                )}
              </DialogFooter>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

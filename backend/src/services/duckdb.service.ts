import duckdb from 'duckdb';

type DuckDbConnection = duckdb.Connection;
type DuckDbDatabase = duckdb.Database;

interface PreviewResult {
  columns: { name: string; type: string }[];
  rows: Record<string, unknown>[];
  totalEstimate: number;
  warnings: string[];
}

interface SchemaResult {
  name: string;
  type: string;
  nullable: boolean;
}

export class DuckDbService {
  private db: DuckDbDatabase | null = null;
  private conn: DuckDbConnection | null = null;
  private initialized = false;

  async initialize(): Promise<void> {
    if (this.initialized) return;
    this.db = new duckdb.Database(':memory:');
    this.conn = this.db.connect();
    this.initialized = true;
  }

  async query(sql: string): Promise<Record<string, unknown>[]> {
    await this.initialize();
    return new Promise((resolve, reject) => {
      this.conn!.all(sql, (err, rows) => {
        if (err) reject(new Error(err.message));
        else resolve(rows as Record<string, unknown>[]);
      });
    });
  }

  async getSchema(sql: string): Promise<SchemaResult[]> {
    const descSQL = `DESCRIBE (${sql})`;
    const rows = await this.query(descSQL);
    return rows.map((r: any) => ({
      name: r.column_name || r.ColumnName || r.name || '',
      type: r.column_type || r.ColumnType || r.type || '',
      nullable: r.null === 'YES' || r.null === true,
    }));
  }

  async getRowCount(sql: string): Promise<number> {
    const rows = await this.query(`SELECT COUNT(*) as cnt FROM (${sql}) _sub`);
    return Number(rows[0]?.cnt || 0);
  }

  async preview(
    sourceType: string,
    filePath: string,
    options: Record<string, unknown> = {},
    limit = 50
  ): Promise<PreviewResult> {
    const readSql = this.buildReadSql(sourceType, filePath, options);
    const fullSql = `SELECT * FROM (${readSql}) _src LIMIT ${limit}`;
    const rows = await this.query(fullSql);
    const schema = await this.getSchema(readSql);
    const totalEstimate = await this.getRowCount(readSql);

    const warnings: string[] = [];
    schema.forEach((col) => {
      if (col.type === 'UNKNOWN') warnings.push(`Coluna "${col.name}" com tipo desconhecido`);
    });

    const columns = schema.map((s) => ({ name: s.name, type: s.type }));

    return { columns, rows, totalEstimate, warnings };
  }

  async inspectSchema(
    sourceType: string,
    filePath: string,
    options: Record<string, unknown> = {}
  ): Promise<{ columns: SchemaResult[]; totalEstimate: number; warnings: string[] }> {
    const readSql = this.buildReadSql(sourceType, filePath, options);
    const schema = await this.getSchema(readSql);
    const totalEstimate = await this.getRowCount(readSql);
    const warnings: string[] = [];
    schema.forEach((col) => {
      if (col.type === 'UNKNOWN') warnings.push(`Coluna "${col.name}" com tipo desconhecido`);
    });
    return { columns: schema, totalEstimate, warnings };
  }

  async readAll(sourceType: string, filePath: string, options: Record<string, unknown> = {}): Promise<Record<string, unknown>[]> {
    const readSql = this.buildReadSql(sourceType, filePath, options);
    return this.query(readSql);
  }

  buildReadSql(sourceType: string, filePath: string, options: Record<string, unknown> = {}): string {
    switch (sourceType) {
      case 'parquet':
        return this.buildParquetReadSql(filePath, options);
      case 'parquet_folder':
        return this.buildParquetFolderReadSql(filePath, options);
      case 'xlsx':
        return this.buildXlsxReadSql(filePath, options);
      default:
        throw new Error(`Tipo de fonte não suportado: ${sourceType}`);
    }
  }

  private buildParquetReadSql(path: string, options: Record<string, unknown>): string {
    const params: string[] = [];
    if (options.union_by_name) params.push("union_by_name = true");
    if (options.hive_partitioning) params.push("hive_partitioning = true");
    if (options.filename) params.push(`filename = ${!!options.filename}`);
    const paramStr = params.length > 0 ? `, ${params.join(', ')}` : '';
    return `SELECT * FROM read_parquet('${this.escapePath(path)}'${paramStr})`;
  }

  private buildParquetFolderReadSql(path: string, options: Record<string, unknown>): string {
    const pattern = options.file_pattern || '*.parquet';
    const fullPath = path.endsWith('/') || path.endsWith('\\') ? `${path}${pattern}` : `${path}/${pattern}`;
    const params: string[] = [];
    if (options.union_by_name !== false) params.push("union_by_name = true");
    if (options.hive_partitioning) params.push("hive_partitioning = true");
    const paramStr = params.length > 0 ? `, ${params.join(', ')}` : '';
    return `SELECT * FROM read_parquet('${this.escapePath(fullPath)}'${paramStr})`;
  }

  private buildXlsxReadSql(path: string, options: Record<string, unknown>): string {
    const sheet = options.sheet || 'Sheet1';
    const header = options.header !== false;
    const allVarchar = options.all_varchar || false;
    const ignoreErrors = options.ignore_errors || false;
    const range = options.range || '';
    const params: string[] = [];
    params.push(`header = ${header}`);
    if (allVarchar) params.push('all_varchar = true');
    if (ignoreErrors) params.push('ignore_errors = true');
    if (range) params.push(`range = '${range}'`);
    const paramStr = params.length > 0 ? `, ${params.join(', ')}` : '';
    return `SELECT * FROM st_read('${this.escapePath(path)}', sheet = '${sheet}'${paramStr})`;
  }

  private escapePath(path: string): string {
    return path.replace(/\\/g, '/').replace(/'/g, "''");
  }

  close(): void {
    if (this.conn) { try { this.conn.close(); } catch { } }
    if (this.db) { try { this.db.close(); } catch { } }
    this.initialized = false;
    this.conn = null;
    this.db = null;
  }
}

export const duckDbService = new DuckDbService();

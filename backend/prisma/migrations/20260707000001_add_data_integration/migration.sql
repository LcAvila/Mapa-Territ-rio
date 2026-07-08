-- Migration: Add Data Integration Module
-- External connections, ETL pipeline, Client snapshots, Published versions

-- ─── EXTERNAL CONNECTIONS ────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS "external_connections" (
    "id" SERIAL PRIMARY KEY,
    "name" VARCHAR(255) NOT NULL,
    "description" TEXT,
    "source_type" VARCHAR(50) NOT NULL DEFAULT 'parquet',
    "file_path" TEXT,
    "file_pattern" VARCHAR(500),
    "options_json" JSONB DEFAULT '{}',
    "dataset_target" VARCHAR(255),
    "tags" JSONB DEFAULT '[]',
    "status" VARCHAR(20) NOT NULL DEFAULT 'inactive',
    "last_validated_at" TIMESTAMP(3),
    "last_run_at" TIMESTAMP(3),
    "last_published_at" TIMESTAMP(3),
    "last_error" TEXT,
    "validation_result" JSONB,
    "created_by" INTEGER NOT NULL REFERENCES "users"("id") ON DELETE RESTRICT,
    "updated_by" INTEGER REFERENCES "users"("id") ON DELETE SET NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "deleted_at" TIMESTAMP(3)
);

CREATE INDEX IF NOT EXISTS idx_external_connections_status ON "external_connections"("status");
CREATE INDEX IF NOT EXISTS idx_external_connections_source_type ON "external_connections"("source_type");
CREATE INDEX IF NOT EXISTS idx_external_connections_created_by ON "external_connections"("created_by");
CREATE INDEX IF NOT EXISTS idx_external_connections_deleted_at ON "external_connections"("deleted_at");

-- ─── EXTERNAL DATASETS ───────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS "external_datasets" (
    "id" SERIAL PRIMARY KEY,
    "connection_id" INTEGER NOT NULL REFERENCES "external_connections"("id") ON DELETE CASCADE,
    "name" VARCHAR(255) NOT NULL,
    "description" TEXT,
    "internal_schema" JSONB DEFAULT '{}',
    "source_schema" JSONB,
    "column_mapping" JSONB DEFAULT '[]',
    "validation_rules" JSONB DEFAULT '[]',
    "row_count_estimate" INTEGER,
    "status" VARCHAR(20) NOT NULL DEFAULT 'draft',
    "version" INTEGER NOT NULL DEFAULT 1,
    "created_by" INTEGER NOT NULL REFERENCES "users"("id") ON DELETE RESTRICT,
    "updated_by" INTEGER REFERENCES "users"("id") ON DELETE SET NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_external_datasets_connection ON "external_datasets"("connection_id");
CREATE INDEX IF NOT EXISTS idx_external_datasets_status ON "external_datasets"("status");
CREATE INDEX IF NOT EXISTS idx_external_datasets_created_by ON "external_datasets"("created_by");

-- ─── EXTERNAL DATASET COLUMNS ────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS "external_dataset_columns" (
    "id" SERIAL PRIMARY KEY,
    "dataset_id" INTEGER NOT NULL REFERENCES "external_datasets"("id") ON DELETE CASCADE,
    "source_column" VARCHAR(255) NOT NULL,
    "target_field" VARCHAR(255) NOT NULL,
    "inferred_type" VARCHAR(50),
    "target_type" VARCHAR(50) NOT NULL DEFAULT 'string',
    "is_required" BOOLEAN NOT NULL DEFAULT false,
    "is_key" BOOLEAN NOT NULL DEFAULT false,
    "default_value" TEXT,
    "transform_rule" TEXT,
    "transform_options" JSONB DEFAULT '{}',
    "sort_order" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_external_dataset_columns_dataset ON "external_dataset_columns"("dataset_id");

-- ─── EXTERNAL DATASET RULES ──────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS "external_dataset_rules" (
    "id" SERIAL PRIMARY KEY,
    "dataset_id" INTEGER NOT NULL REFERENCES "external_datasets"("id") ON DELETE CASCADE,
    "field" VARCHAR(255) NOT NULL,
    "rule_type" VARCHAR(50) NOT NULL,
    "severity" VARCHAR(20) NOT NULL DEFAULT 'error',
    "params_json" JSONB DEFAULT '{}',
    "error_message" TEXT,
    "is_blocking" BOOLEAN NOT NULL DEFAULT true,
    "enabled" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_external_dataset_rules_dataset ON "external_dataset_rules"("dataset_id");

-- ─── ETL JOBS ────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS "etl_jobs" (
    "id" SERIAL PRIMARY KEY,
    "connection_id" INTEGER NOT NULL REFERENCES "external_connections"("id") ON DELETE CASCADE,
    "dataset_id" INTEGER REFERENCES "external_datasets"("id") ON DELETE SET NULL,
    "name" VARCHAR(255) NOT NULL,
    "description" TEXT,
    "cron_expression" VARCHAR(100),
    "config_json" JSONB DEFAULT '{}',
    "mode" VARCHAR(20) NOT NULL DEFAULT 'full',
    "max_errors" INTEGER NOT NULL DEFAULT 100,
    "status" VARCHAR(20) NOT NULL DEFAULT 'inactive',
    "last_run_id" INTEGER,
    "last_run_status" VARCHAR(20),
    "last_run_at" TIMESTAMP(3),
    "created_by" INTEGER NOT NULL REFERENCES "users"("id") ON DELETE RESTRICT,
    "updated_by" INTEGER REFERENCES "users"("id") ON DELETE SET NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_etl_jobs_connection ON "etl_jobs"("connection_id");
CREATE INDEX IF NOT EXISTS idx_etl_jobs_status ON "etl_jobs"("status");
CREATE INDEX IF NOT EXISTS idx_etl_jobs_created_by ON "etl_jobs"("created_by");

-- ─── ETL JOB RUNS ────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS "etl_job_runs" (
    "id" SERIAL PRIMARY KEY,
    "job_id" INTEGER NOT NULL REFERENCES "etl_jobs"("id") ON DELETE CASCADE,
    "connection_id" INTEGER NOT NULL REFERENCES "external_connections"("id") ON DELETE CASCADE,
    "dataset_id" INTEGER REFERENCES "external_datasets"("id") ON DELETE SET NULL,
    "run_type" VARCHAR(20) NOT NULL DEFAULT 'manual',
    "status" VARCHAR(20) NOT NULL DEFAULT 'pending',
    "current_step" VARCHAR(50),
    "progress_pct" INTEGER DEFAULT 0,
    "rows_read" INTEGER DEFAULT 0,
    "rows_valid" INTEGER DEFAULT 0,
    "rows_invalid" INTEGER DEFAULT 0,
    "rows_discarded" INTEGER DEFAULT 0,
    "rows_deduplicated" INTEGER DEFAULT 0,
    "rows_new" INTEGER DEFAULT 0,
    "rows_changed" INTEGER DEFAULT 0,
    "rows_removed" INTEGER DEFAULT 0,
    "error_count" INTEGER DEFAULT 0,
    "warning_count" INTEGER DEFAULT 0,
    "started_at" TIMESTAMP(3),
    "finished_at" TIMESTAMP(3),
    "error_message" TEXT,
    "result_json" JSONB,
    "triggered_by" INTEGER NOT NULL REFERENCES "users"("id") ON DELETE RESTRICT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_etl_job_runs_job ON "etl_job_runs"("job_id");
CREATE INDEX IF NOT EXISTS idx_etl_job_runs_status ON "etl_job_runs"("status");
CREATE INDEX IF NOT EXISTS idx_etl_job_runs_triggered_by ON "etl_job_runs"("triggered_by");
CREATE INDEX IF NOT EXISTS idx_etl_job_runs_started_at ON "etl_job_runs"("started_at" DESC);

-- ─── ETL JOB RUN STEPS ────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS "etl_job_run_steps" (
    "id" SERIAL PRIMARY KEY,
    "run_id" INTEGER NOT NULL REFERENCES "etl_job_runs"("id") ON DELETE CASCADE,
    "step_name" VARCHAR(50) NOT NULL,
    "status" VARCHAR(20) NOT NULL DEFAULT 'pending',
    "started_at" TIMESTAMP(3),
    "finished_at" TIMESTAMP(3),
    "duration_ms" INTEGER,
    "result_json" JSONB,
    "error_message" TEXT
);

CREATE INDEX IF NOT EXISTS idx_etl_job_run_steps_run ON "etl_job_run_steps"("run_id");

-- ─── ETL RUN LOGS ────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS "etl_run_logs" (
    "id" SERIAL PRIMARY KEY,
    "run_id" INTEGER NOT NULL REFERENCES "etl_job_runs"("id") ON DELETE CASCADE,
    "step_id" INTEGER REFERENCES "etl_job_run_steps"("id") ON DELETE SET NULL,
    "level" VARCHAR(10) NOT NULL DEFAULT 'info',
    "message" TEXT NOT NULL,
    "details_json" JSONB,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_etl_run_logs_run ON "etl_run_logs"("run_id");
CREATE INDEX IF NOT EXISTS idx_etl_run_logs_step ON "etl_run_logs"("step_id");
CREATE INDEX IF NOT EXISTS idx_etl_run_logs_level ON "etl_run_logs"("level");

-- ─── CLIENTES SNAPSHOT (staging) ────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS "clientes_snapshots" (
    "id" SERIAL PRIMARY KEY,
    "etl_run_id" INTEGER REFERENCES "etl_job_runs"("id") ON DELETE SET NULL,
    "dataset_id" INTEGER REFERENCES "external_datasets"("id") ON DELETE SET NULL,
    "version_label" VARCHAR(100) NOT NULL,
    "source_description" TEXT,
    "total_rows" INTEGER NOT NULL DEFAULT 0,
    "valid_rows" INTEGER NOT NULL DEFAULT 0,
    "invalid_rows" INTEGER NOT NULL DEFAULT 0,
    "duplicates_removed" INTEGER NOT NULL DEFAULT 0,
    "new_clients" INTEGER NOT NULL DEFAULT 0,
    "changed_clients" INTEGER NOT NULL DEFAULT 0,
    "removed_clients" INTEGER NOT NULL DEFAULT 0,
    "status" VARCHAR(20) NOT NULL DEFAULT 'staged',
    "created_by" INTEGER NOT NULL REFERENCES "users"("id") ON DELETE RESTRICT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "published_at" TIMESTAMP(3)
);

CREATE INDEX IF NOT EXISTS idx_clientes_snapshots_status ON "clientes_snapshots"("status");
CREATE INDEX IF NOT EXISTS idx_clientes_snapshots_etl_run ON "clientes_snapshots"("etl_run_id");
CREATE INDEX IF NOT EXISTS idx_clientes_snapshots_created_by ON "clientes_snapshots"("created_by");

-- ─── CLIENTES SNAPSHOT ITEMS ────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS "clientes_snapshot_items" (
    "id" SERIAL PRIMARY KEY,
    "snapshot_id" INTEGER NOT NULL REFERENCES "clientes_snapshots"("id") ON DELETE CASCADE,
    "codigo_cliente" VARCHAR(100) NOT NULL,
    "nome_cliente" VARCHAR(500) NOT NULL,
    "nome_abreviado" VARCHAR(200),
    "regiao" VARCHAR(100),
    "uf" VARCHAR(5),
    "cidade" VARCHAR(200),
    "bairro" VARCHAR(200),
    "cep" VARCHAR(20),
    "endereco_completo" TEXT,
    "numero" VARCHAR(20),
    "cnpj" VARCHAR(20),
    "documento" VARCHAR(50),
    "telefone" VARCHAR(50),
    "email" VARCHAR(255),
    "latitude" DOUBLE PRECISION,
    "longitude" DOUBLE PRECISION,
    "vendedor" VARCHAR(255),
    "representante" VARCHAR(255),
    "status" VARCHAR(50) DEFAULT 'ativo',
    "segmento" VARCHAR(100),
    "canal" VARCHAR(100),
    "data_cadastro" TIMESTAMP(3),
    "data_ultima_compra" TIMESTAMP(3),
    "limite_credito" DOUBLE PRECISION,
    "faturamento" DOUBLE PRECISION,
    "observacoes" TEXT,
    "change_type" VARCHAR(20),
    "change_details" JSONB,
    "is_valid" BOOLEAN NOT NULL DEFAULT true,
    "validation_errors" JSONB DEFAULT '[]',
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "source_raw_json" JSONB,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_snapshot_items_snapshot ON "clientes_snapshot_items"("snapshot_id");
CREATE INDEX IF NOT EXISTS idx_snapshot_items_codigo ON "clientes_snapshot_items"("codigo_cliente");
CREATE INDEX IF NOT EXISTS idx_snapshot_items_change_type ON "clientes_snapshot_items"("change_type");
CREATE INDEX IF NOT EXISTS idx_snapshot_items_is_valid ON "clientes_snapshot_items"("is_valid");
CREATE INDEX IF NOT EXISTS idx_snapshot_items_uf ON "clientes_snapshot_items"("uf");

-- ─── CLIENTES PUBLISHED VERSIONS ────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS "clientes_published_versions" (
    "id" SERIAL PRIMARY KEY,
    "snapshot_id" INTEGER NOT NULL REFERENCES "clientes_snapshots"("id") ON DELETE RESTRICT,
    "version_number" INTEGER NOT NULL,
    "version_label" VARCHAR(100) NOT NULL,
    "is_active" BOOLEAN NOT NULL DEFAULT false,
    "total_clients" INTEGER NOT NULL DEFAULT 0,
    "new_clients" INTEGER NOT NULL DEFAULT 0,
    "changed_clients" INTEGER NOT NULL DEFAULT 0,
    "removed_clients" INTEGER NOT NULL DEFAULT 0,
    "published_by" INTEGER NOT NULL REFERENCES "users"("id") ON DELETE RESTRICT,
    "published_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "rolled_back_at" TIMESTAMP(3),
    "rolled_back_by" INTEGER REFERENCES "users"("id") ON DELETE SET NULL,
    "rollback_reason" TEXT,
    "metadata_json" JSONB DEFAULT '{}'
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_published_versions_active ON "clientes_published_versions"("is_active") WHERE "is_active" = true;
CREATE INDEX IF NOT EXISTS idx_published_versions_version ON "clientes_published_versions"("version_number" DESC);
CREATE INDEX IF NOT EXISTS idx_published_versions_snapshot ON "clientes_published_versions"("snapshot_id");
CREATE INDEX IF NOT EXISTS idx_published_versions_published_by ON "clientes_published_versions"("published_by");

-- ─── CLIENTES SOURCE OVERRIDES ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS "clientes_source_overrides" (
    "id" SERIAL PRIMARY KEY,
    "codigo_cliente" VARCHAR(100) NOT NULL,
    "field_name" VARCHAR(100) NOT NULL,
    "original_value" TEXT,
    "overridden_value" TEXT NOT NULL,
    "override_reason" TEXT,
    "applied_in_version" INTEGER REFERENCES "clientes_published_versions"("id") ON DELETE SET NULL,
    "created_by" INTEGER NOT NULL REFERENCES "users"("id") ON DELETE RESTRICT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_source_overrides_codigo ON "clientes_source_overrides"("codigo_cliente");
CREATE INDEX IF NOT EXISTS idx_source_overrides_version ON "clientes_source_overrides"("applied_in_version");
CREATE UNIQUE INDEX IF NOT EXISTS idx_source_overrides_unique ON "clientes_source_overrides"("codigo_cliente", "field_name");

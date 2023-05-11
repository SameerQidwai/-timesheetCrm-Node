export const IGNORE_COLUMNS: Array<string> = [
  'id',
  'created_at',
  'updated_at',
  'deleted_at',
];

export const IGNORE_TABLES: Array<string> = [
  '_view',
  '_metadata',
  'typeorm',
  'db_',
  'system_',
  'migrations',
  'financial_years',
  'query-result-cache',
];

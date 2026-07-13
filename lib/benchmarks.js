import { getTursoClient } from './turso';

const clean = (value, max = 120) => String(value || '').replace(/[^\p{L}\p{N}\s'-]/gu, ' ').replace(/\s+/g, ' ').trim().slice(0, max);
const scoreValue = (value) => Math.min(100, Math.max(0, Math.round(Number(value) || 0)));

async function ensureTable(db) {
  await db.execute(`CREATE TABLE IF NOT EXISTS result_stats (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    occupation TEXT NOT NULL,
    country TEXT NOT NULL,
    score INTEGER NOT NULL,
    created_at TEXT NOT NULL
  )`);
  await db.execute('CREATE INDEX IF NOT EXISTS result_stats_cohort ON result_stats (occupation, country, created_at)');
}

export async function addAnonymousStat(input) {
  const db = getTursoClient();
  await ensureTable(db);
  const occupation = clean(input.occupation);
  if (!occupation) throw new Error('Occupation is required.');
  await db.execute({
    sql: 'INSERT INTO result_stats (occupation, country, score, created_at) VALUES (?, ?, ?, ?)',
    args: [occupation.toLowerCase(), clean(input.country, 60).toLowerCase(), scoreValue(input.score), new Date().toISOString()],
  });
}

async function cohort(db, occupation, country, score) {
  const countryClause = country ? 'AND country = ?' : '';
  const args = country ? [occupation, country] : [occupation];
  const total = await db.execute({ sql: `SELECT COUNT(*) AS count FROM result_stats WHERE occupation = ? ${countryClause}`, args });
  const count = Number(total.rows[0]?.count || 0);
  if (count < 30) return { available: false, count, required: 30 };
  const lower = await db.execute({ sql: `SELECT COUNT(*) AS count FROM result_stats WHERE occupation = ? ${countryClause} AND score >= ?`, args: [...args, score] });
  return { available: true, count, percentileSafer: Math.min(99, Math.max(1, Math.round(Number(lower.rows[0]?.count || 0) / count * 100))) };
}

export async function getBenchmark(input) {
  const db = getTursoClient();
  await ensureTable(db);
  const occupation = clean(input.occupation).toLowerCase();
  const country = clean(input.country, 60).toLowerCase();
  const score = scoreValue(input.score);
  const regional = await cohort(db, occupation, country, score);
  if (regional.available || !country) return { ...regional, scope: country ? 'country' : 'global' };
  const global = await cohort(db, occupation, '', score);
  return global.available ? { ...global, scope: 'global' } : regional;
}

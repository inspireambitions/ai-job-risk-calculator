import { randomBytes } from 'node:crypto';
import { getTursoClient } from './turso';

const TTL_DAYS = 90;
const cleanText = (value, max = 120) => String(value || '').replace(/[\u0000-\u001f\u007f]/g, ' ').replace(/\s+/g, ' ').trim().slice(0, max);
const bounded = (value, min, max) => Math.min(max, Math.max(min, Math.round(Number(value) || 0)));

export function sanitiseSnapshot(input) {
  const year = bounded(input.displacementYear, 2026, 2060);
  return {
    jobTitle: cleanText(input.jobTitle),
    country: cleanText(input.country, 60),
    risk: bounded(input.overallRiskScore, 0, 100),
    protection: bounded(input.protectionScore, 0, 100),
    leverage: bounded(input.leverageScore, 0, 100),
    riskLevel: ['LOW', 'MEDIUM', 'HIGH', 'VERY HIGH'].includes(input.riskLevel) ? input.riskLevel : 'MEDIUM',
    year,
    earliest: bounded(input.displacementRange?.earliest, 2026, year),
    latest: bounded(input.displacementRange?.latest, year, 2065),
    libraryVersion: cleanText(input.libraryVersion, 30),
  };
}

async function ensureTable(db) {
  await db.execute(`CREATE TABLE IF NOT EXISTS result_snapshots (
    id TEXT PRIMARY KEY,
    payload TEXT NOT NULL,
    created_at TEXT NOT NULL,
    expires_at TEXT NOT NULL
  )`);
}

export async function createSnapshot(input, now = new Date()) {
  const db = getTursoClient();
  await ensureTable(db);
  const id = randomBytes(18).toString('base64url');
  const expiresAt = new Date(now.getTime() + TTL_DAYS * 24 * 60 * 60 * 1000);
  await db.execute({
    sql: 'INSERT INTO result_snapshots (id, payload, created_at, expires_at) VALUES (?, ?, ?, ?)',
    args: [id, JSON.stringify(sanitiseSnapshot(input)), now.toISOString(), expiresAt.toISOString()],
  });
  return { id, expiresAt: expiresAt.toISOString() };
}

export async function readSnapshot(id) {
  if (!/^[A-Za-z0-9_-]{24}$/.test(id)) return null;
  const db = getTursoClient();
  await ensureTable(db);
  await db.execute({ sql: 'DELETE FROM result_snapshots WHERE expires_at <= ?', args: [new Date().toISOString()] });
  const result = await db.execute({ sql: 'SELECT payload, expires_at FROM result_snapshots WHERE id = ? LIMIT 1', args: [id] });
  if (!result.rows[0]) return null;
  return { ...JSON.parse(String(result.rows[0].payload)), expiresAt: String(result.rows[0].expires_at) };
}

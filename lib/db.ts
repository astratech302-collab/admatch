import { DatabaseSync } from 'node:sqlite';
import { mkdirSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
const path = resolve(process.env.ADMATCH_DB || 'data/admatch.sqlite');
mkdirSync(dirname(path), { recursive: true });
export const db = new DatabaseSync(path);
db.exec(`PRAGMA journal_mode=WAL; PRAGMA foreign_keys=ON;
CREATE TABLE IF NOT EXISTS ads (id TEXT PRIMARY KEY, reference TEXT NOT NULL, name TEXT NOT NULL, primaryText TEXT NOT NULL, headline TEXT NOT NULL, libraryUrl TEXT NOT NULL DEFAULT '', destinationUrl TEXT NOT NULL DEFAULT '/p/roam-backpack', notes TEXT NOT NULL DEFAULT '', sample INTEGER DEFAULT 0);
CREATE TABLE IF NOT EXISTS variations (id TEXT PRIMARY KEY, adId TEXT NOT NULL REFERENCES ads(id) ON DELETE CASCADE, headline TEXT NOT NULL, description TEXT NOT NULL, angle TEXT NOT NULL, explanation TEXT NOT NULL, publishedHeadline TEXT, publishedDescription TEXT, publishedAt TEXT);
CREATE TABLE IF NOT EXISTS experiments (id TEXT PRIMARY KEY, name TEXT NOT NULL, adId TEXT NOT NULL, adReference TEXT NOT NULL, variantId TEXT NOT NULL, headline TEXT NOT NULL, description TEXT NOT NULL, createdAt TEXT NOT NULL);
CREATE TABLE IF NOT EXISTS assignments (experimentId TEXT NOT NULL REFERENCES experiments(id) ON DELETE CASCADE, visitorId TEXT NOT NULL, arm TEXT NOT NULL CHECK(arm IN ('original','matching')), PRIMARY KEY(experimentId,visitorId));
CREATE TABLE IF NOT EXISTS sessions (id TEXT PRIMARY KEY, visitorId TEXT NOT NULL, adReference TEXT, variantId TEXT, experimentId TEXT, arm TEXT NOT NULL, preview INTEGER NOT NULL, createdAt TEXT NOT NULL);
CREATE TABLE IF NOT EXISTS events (id TEXT PRIMARY KEY, timestamp TEXT NOT NULL, visitorId TEXT NOT NULL, adReference TEXT, variantId TEXT, experimentId TEXT, arm TEXT NOT NULL, type TEXT NOT NULL, value INTEGER NOT NULL DEFAULT 0, sessionId TEXT NOT NULL REFERENCES sessions(id) ON DELETE CASCADE, UNIQUE(sessionId,type));
CREATE TABLE IF NOT EXISTS meta (key TEXT PRIMARY KEY, value TEXT NOT NULL);`);
export const all = <T>(sql: string, ...args: (string|number|null)[]) => db.prepare(sql).all(...args) as T[];
export const one = <T>(sql: string, ...args: (string|number|null)[]) => db.prepare(sql).get(...args) as T | undefined;
export const run = (sql: string, ...args: (string|number|null)[]) => db.prepare(sql).run(...args);
export function transaction<T>(fn:()=>T):T { db.exec('BEGIN IMMEDIATE'); try { const result=fn(); db.exec('COMMIT'); return result; } catch(e) { db.exec('ROLLBACK'); throw e; } }

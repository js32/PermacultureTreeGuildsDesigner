import { getAllPlants, getAllGuilds } from './db';
import { loadSettings } from './settings';

const GIST_FILENAME = 'perma-guild-forge-backup.json';

export function isAutoSyncEnabled(): boolean {
  try { return localStorage.getItem('auto-sync-enabled') === 'true'; } catch { return false; }
}

export function rememberSyncAt(provider: string) {
  const now = new Date().toISOString();
  try {
    localStorage.setItem('last-backup-at', now);
    localStorage.setItem('last-auto-sync-at', now);
    localStorage.setItem('last-auto-sync-provider', provider);
  } catch {}
}

export async function buildBackupJson(): Promise<string> {
  const [plants, guilds] = await Promise.all([getAllPlants(), getAllGuilds()]);
  const settings = loadSettings();
  return JSON.stringify({ version: 1, exportedAt: new Date().toISOString(), settings, plants, guilds }, null, 2);
}

export type SyncResult = { ok: boolean; provider: 'webdav' | 'gist' | null; error?: string };

export async function autoSyncIfConfigured(): Promise<SyncResult> {
  if (!isAutoSyncEnabled()) return { ok: true, provider: null };

  const webdavUrl = (localStorage.getItem('webdav-url') || '').trim();
  const webdavUser = (localStorage.getItem('webdav-user') || '').trim();
  const webdavPass = localStorage.getItem('webdav-pass') || '';

  if (webdavUrl && webdavUser) {
    try {
      const content = await buildBackupJson();
      const auth = 'Basic ' + btoa(unescape(encodeURIComponent(`${webdavUser}:${webdavPass}`)));
      const res = await fetch(webdavUrl, {
        method: 'PUT',
        headers: { 'Authorization': auth, 'Content-Type': 'application/json' },
        body: content,
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      rememberSyncAt('webdav');
      return { ok: true, provider: 'webdav' };
    } catch (e) {
      return { ok: false, provider: 'webdav', error: (e as Error).message };
    }
  }

  const gistToken = (localStorage.getItem('gist-token') || '').trim();
  const gistId = (localStorage.getItem('gist-id') || '').trim();

  if (gistToken && gistId) {
    try {
      const content = await buildBackupJson();
      const res = await fetch(`https://api.github.com/gists/${gistId}`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${gistToken}`,
          'Content-Type': 'application/json',
          'X-GitHub-Api-Version': '2022-11-28',
        },
        body: JSON.stringify({ files: { [GIST_FILENAME]: { content } } }),
      });
      if (!res.ok) throw new Error(`GitHub API ${res.status}`);
      rememberSyncAt('gist');
      return { ok: true, provider: 'gist' };
    } catch (e) {
      return { ok: false, provider: 'gist', error: (e as Error).message };
    }
  }

  return { ok: true, provider: null };
}

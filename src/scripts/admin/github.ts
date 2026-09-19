// Minimal GitHub REST client for the admin panel: read files from a branch and publish all pending
// changes as ONE commit through the Git Data API (blobs -> tree -> commit -> ref).
import { admin } from '../../data/admin';

const API = 'https://api.github.com';
export class GhError extends Error {
  constructor(public status: number, message: string) { super(message); }
}

export interface RepoFile { text: string; sha: string }
export interface FileChange { path: string; text?: string; base64?: string; remove?: boolean }

export class GitHub {
  constructor(private token: string, public branch: string) {}
  private get repo() { return `${API}/repos/${admin.owner}/${admin.repo}`; }

  async req<T = any>(url: string, init: RequestInit = {}): Promise<T> {
    const r = await fetch(url.startsWith('http') ? url : `${this.repo}${url}`, {
      ...init,
      headers: {
        Accept: 'application/vnd.github+json',
        Authorization: `Bearer ${this.token}`,
        'X-GitHub-Api-Version': '2022-11-28',
        ...(init.body ? { 'Content-Type': 'application/json' } : {}),
        ...(init.headers ?? {}),
      },
    });
    if (!r.ok) {
      let msg = `${r.status} ${r.statusText}`;
      try { const j = await r.json(); if (j?.message) msg = j.message; } catch {}
      if (r.status === 401) msg = 'The access token was rejected (expired or revoked). Reconnect with a new token.';
      throw new GhError(r.status, msg);
    }
    return r.status === 204 ? (undefined as T) : r.json();
  }

  /** Checks the token can push to the repo; returns the login when readable. */
  async whoAmI(): Promise<{ login: string; canPush: boolean }> {
    const repo = await this.req<{ permissions?: { push?: boolean } }>('');
    let login = '';
    try { login = (await this.req<{ login: string }>(`${API}/user`)).login; } catch {}
    return { login, canPush: !!repo.permissions?.push };
  }

  async readFile(path: string): Promise<RepoFile> {
    const f = await this.req<{ content: string; sha: string; encoding: string }>(`/contents/${path}?ref=${encodeURIComponent(this.branch)}&t=${Date.now()}`, { cache: 'no-store' });
    const bytes = Uint8Array.from(atob(f.content.replace(/\n/g, '')), (c) => c.charCodeAt(0));
    return { text: new TextDecoder().decode(bytes), sha: f.sha };
  }

  /** Current blob sha of a file on the branch (undefined when it does not exist). */
  async fileSha(path: string): Promise<string | undefined> {
    try {
      const f = await this.req<{ sha: string }>(`/contents/${path}?ref=${encodeURIComponent(this.branch)}&t=${Date.now()}`, { cache: 'no-store' });
      return f.sha;
    } catch (e) {
      if (e instanceof GhError && e.status === 404) return undefined;
      throw e;
    }
  }

  /** One atomic commit with every change. Returns the new commit sha and the blob shas by path. */
  async commit(message: string, changes: FileChange[]): Promise<{ sha: string; blobs: Record<string, string> }> {
    const ref = await this.req<{ object: { sha: string } }>(`/git/ref/heads/${this.branch}`);
    const head = ref.object.sha;
    const parent = await this.req<{ tree: { sha: string } }>(`/git/commits/${head}`);
    const blobs: Record<string, string> = {};
    const tree: any[] = [];
    for (const c of changes) {
      if (c.remove) { tree.push({ path: c.path, mode: '100644', type: 'blob', sha: null }); continue; }
      const body = c.base64 !== undefined ? { content: c.base64, encoding: 'base64' } : { content: c.text ?? '', encoding: 'utf-8' };
      const b = await this.req<{ sha: string }>('/git/blobs', { method: 'POST', body: JSON.stringify(body) });
      blobs[c.path] = b.sha;
      tree.push({ path: c.path, mode: '100644', type: 'blob', sha: b.sha });
    }
    const t = await this.req<{ sha: string }>('/git/trees', { method: 'POST', body: JSON.stringify({ base_tree: parent.tree.sha, tree }) });
    const c = await this.req<{ sha: string }>('/git/commits', { method: 'POST', body: JSON.stringify({ message, tree: t.sha, parents: [head] }) });
    await this.req(`/git/refs/heads/${this.branch}`, { method: 'PATCH', body: JSON.stringify({ sha: c.sha, force: false }) });
    return { sha: c.sha, blobs };
  }

  /** Latest Pages deploy run for a commit: 'queued' | 'running' | 'success' | 'failure' | 'unknown' (no Actions permission). */
  async deployStatus(sha: string): Promise<'queued' | 'running' | 'success' | 'failure' | 'unknown'> {
    try {
      const r = await this.req<{ workflow_runs: { head_sha: string; status: string; conclusion: string | null }[] }>(`/actions/runs?branch=${encodeURIComponent(this.branch)}&per_page=5&t=${Date.now()}`, { cache: 'no-store' });
      const run = r.workflow_runs.find((w) => w.head_sha === sha);
      if (!run) return 'queued';
      if (run.status !== 'completed') return 'running';
      return run.conclusion === 'success' ? 'success' : 'failure';
    } catch {
      return 'unknown';
    }
  }
}

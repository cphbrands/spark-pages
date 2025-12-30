import { promises as fs } from 'fs';
import path from 'path';

const STORE_PATH = process.env.JOB_STORE_PATH || path.join('/tmp', 'ugc-video-jobs.json');

export type JobRecord = {
  status: 'processing' | 'ready' | 'error';
  createdAt: string;
  videoUrl?: string;
  thumbnailUrl?: string;
  prompt?: string;
  error?: string;
  metadata?: { aiGenerated: boolean };
};

let cache: Map<string, JobRecord> | null = null;
let isLoaded = false;

async function ensureLoaded() {
  if (isLoaded && cache) return;
  cache = new Map();
  try {
    const data = await fs.readFile(STORE_PATH, 'utf-8');
    const parsed = JSON.parse(data) as Record<string, JobRecord>;
    Object.entries(parsed).forEach(([k, v]) => cache!.set(k, v));
  } catch (err: unknown) {
    // Ignore missing file; create on first write
    if (err instanceof Error && (err as NodeJS.ErrnoException).code !== 'ENOENT') {
      const message = (err as NodeJS.ErrnoException).message || 'Unknown error';
      console.warn('jobStore: failed to load store', message);
    }
  } finally {
    isLoaded = true;
  }
}

async function persist() {
  if (!cache) return;
  const obj: Record<string, JobRecord> = {};
  cache.forEach((v, k) => {
    obj[k] = v;
  });
  await fs.writeFile(STORE_PATH, JSON.stringify(obj, null, 2), 'utf-8');
}

export async function createJob(id: string, record: JobRecord) {
  await ensureLoaded();
  cache!.set(id, record);
  await persist();
}

export async function updateJob(id: string, updates: Partial<JobRecord>) {
  await ensureLoaded();
  const existing = cache!.get(id);
  if (!existing) return;
  cache!.set(id, { ...existing, ...updates });
  await persist();
}

export async function getJob(id: string) {
  await ensureLoaded();
  return cache!.get(id);
}

export async function hasJob(id: string) {
  await ensureLoaded();
  return cache!.has(id);
}

export async function listJobs() {
  await ensureLoaded();
  return Array.from(cache!.entries()).map(([id, job]) => ({ id, ...job }));
}

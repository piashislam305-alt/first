import fs from 'fs';
import net from 'net';
import path from 'path';
import { spawn } from 'child_process';
import mongoose from 'mongoose';
import { MongoBinary } from 'mongodb-memory-server-core';

let mongodChild = null;
const MEM_PORT = Number(process.env.MONGO_MEM_PORT || 27077);
const MEM_DBPATH = process.env.MONGO_MEM_PATH || '/var/tmp/govaly-mongo';

const portOpen = (port, host = '127.0.0.1', timeout = 900) =>
  new Promise((resolve) => {
    const s = net.connect({ port, host }, () => { s.destroy(); resolve(true); });
    s.setTimeout(timeout);
    s.on('timeout', () => { s.destroy(); resolve(false); });
    s.on('error', () => resolve(false));
  });

function waitPort(port, timeoutMs = 120000) {
  const started = Date.now();
  return new Promise((resolve, reject) => {
    (function poll() {
      portOpen(port).then((open) => {
        if (open) return resolve(true);
        if (Date.now() - started > timeoutMs) return reject(new Error('mongod did not start in time'));
        setTimeout(poll, 400);
      });
    })();
  });
}

/**
 * Connects to MongoDB.
 * - If MONGO_URI is set, uses that (production / local mongod).
 * - Otherwise starts (or reuses) a local mongod managed by this process with
 *   zero external setup — perfect for demos & development.
 */
export async function connectDB() {
  const uri = process.env.MONGO_URI;

  if (uri) {
    mongoose.set('strictQuery', true);
    await mongoose.connect(uri);
    console.log(`[db] MongoDB connected → ${uri.replace(/\/\/.*@/, '//***@')}`);
    return { memory: false };
  }

  const alreadyRunning = await portOpen(MEM_PORT);
  if (!alreadyRunning) {
    fs.mkdirSync(MEM_DBPATH, { recursive: true });
    fs.rmSync(path.join(MEM_DBPATH, 'mongod.lock'), { force: true });

    const binary = await MongoBinary.getPath();
    mongodChild = spawn(
      binary,
      [
        '--dbpath', MEM_DBPATH,
        '--port', String(MEM_PORT),
        '--storageEngine', 'wiredTiger',
        '--noauth',
        '--bind_ip', '127.0.0.1',
        '--quiet',
        '--logpath', path.join(MEM_DBPATH, 'mongod.log'),
      ],
      { stdio: 'ignore' }
    );
    mongodChild.on('exit', (code) => console.log(`[db] mongod exited (code ${code})`));
    await waitPort(MEM_PORT);
  }

  mongoose.set('strictQuery', true);
  const connUri = `mongodb://127.0.0.1:${MEM_PORT}/govaly`;
  await mongoose.connect(connUri);
  console.log(`[db] MongoDB ready → ${connUri}${alreadyRunning ? ' (reused running instance)' : ''}`);
  console.log('[db] demo mode: data lives in-memory on this machine (set MONGO_URI for persistent storage)');
  return { memory: true };
}

/** Graceful shutdown of the embedded database. */
export async function stopDB() {
  try {
    if (mongoose.connection.readyState) await mongoose.disconnect();
    if (mongodChild) {
      mongodChild.kill('SIGTERM');
      mongodChild = null;
      await new Promise((r) => setTimeout(r, 600));
    }
  } catch {
    /* ignore */
  }
}

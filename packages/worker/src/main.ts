/**
 * Container entrypoint for the delivery worker.
 *
 * `index.ts` only *exports* the worker lifecycle. Running it directly (which is
 * what the image used to do) loads the module, starts nothing and exits 0, so
 * the kubelet turns it into a CrashLoopBackOff and no queued delivery is ever
 * processed. Start the worker here, and shut it down cleanly so an in-flight
 * delivery is not cut off when the pod is replaced.
 */
import { startWorker, stopWorker } from './index';

const worker = startWorker();
console.log('[worker] delivery worker started, queue "delivery"');

// BullMQ emits `error` for connection hiccups as well as real failures. Log
// instead of exiting: ioredis reconnects on its own, and exiting here would
// turn a brief Redis blip into a restart loop.
worker.on('error', (error) => {
  console.error('[worker] error:', error);
});

let stopping = false;

async function shutdown(signal: string): Promise<void> {
  if (stopping) return;
  stopping = true;
  console.log(`[worker] ${signal} received, draining in-flight jobs...`);
  try {
    await stopWorker();
    console.log('[worker] stopped cleanly');
    process.exit(0);
  } catch (error) {
    console.error('[worker] shutdown failed:', error);
    process.exit(1);
  }
}

process.on('SIGTERM', () => void shutdown('SIGTERM'));
process.on('SIGINT', () => void shutdown('SIGINT'));

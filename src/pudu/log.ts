import { info, warn, error, debug, trace } from '@tauri-apps/plugin-log';

const isTauri = '__TAURI_INTERNALS__' in window;

function wrap(
  tauriFn: (msg: string) => Promise<void>,
  consoleFn: (...args: unknown[]) => void,
): (msg: string) => void {
  return (msg: string) => {
    if (isTauri) {
      tauriFn(`[PuduFrontend] ${msg}`);
    } else {
      consoleFn(`[PuduFrontend] ${msg}`);
    }
  };
}

export const log = {
  info: wrap(info, console.log),
  warn: wrap(warn, console.warn),
  error: wrap(error, console.error),
  debug: wrap(debug, console.debug),
  trace: wrap(trace, console.trace),
};

import type {EventEmitter} from 'node:events';
import { log as logger } from '../logger';
export interface LogEntry {
  timestamp: number;
  level: string,
  message: string;
}

export type Filter = (x: LogEntry) => Promise<boolean>;

export class LogMonitor {
  private readonly _logsEmitter: EventEmitter;
  private readonly _filter: Filter;
  private _lastMatch: LogEntry | null;
  private _outputListener: ((logEntry: LogEntry) => any) | null;

  constructor(logsEmitter: EventEmitter, filter: Filter) {
    this._logsEmitter = logsEmitter;
    this._outputListener = null;
    this._filter = filter;
    this._lastMatch = null;
  }

  get started(): boolean {
    return Boolean(this._outputListener);
  }

  clearlastMatch() {
    this._lastMatch = null;
  }

  get lastMatch(): LogEntry | null {
    return this._lastMatch;
  }

  start(): this {
    if (this.started) {
      return this;
    }

    this._outputListener = this._onOutput.bind(this);
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    this._logsEmitter.on('output', this._outputListener!);
    return this;
  }

  stop(): this {
    if (!this.started) {
      return this;
    }

    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    this._logsEmitter.off('output', this._outputListener!);
    this._outputListener = null;
    return this;
  }

  private async _onOutput(logEntry: LogEntry): Promise<void> {
    if (await this._filter(logEntry)) {
      logger.info(`>>>>> ${logEntry.message}`);
      this._lastMatch = logEntry;
    }
  }
}
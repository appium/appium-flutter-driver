import type {EventEmitter} from 'node:events';
import { retryInterval } from 'asyncbox';
export interface LogEntry {
  timestamp: number;
  level: string,
  message: string;
}

const DEFAULT_MAX_RETRY_COUNT = 10;
const DEFAULT_BACKOFF_TIME_MS = 3000;

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

  async waitForLastMatchExist(
    maxRetryCount: number = DEFAULT_MAX_RETRY_COUNT,
    retryBackoffTime: number = DEFAULT_BACKOFF_TIME_MS,
  ): Promise<LogEntry | null> {
    return await retryInterval(
      maxRetryCount,
      retryBackoffTime,
      async () => {
        if (this._lastMatch !== null) {
          return this._lastMatch;
        }
        throw new Error(
          `No matched log found with ${retryBackoffTime} ms interval ` +
          `up to ${maxRetryCount} times. Increasing appium:retryBackoffTime ` +
          `and appium:maxRetryCount would help.`
        );
      },
    );
  };

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
      this._lastMatch = logEntry;
    }
  }
}
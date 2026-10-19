import {Client} from 'rpc-websockets';

interface ExecuteArgs {
  command: string;
  [key: string]: any;
}

export class IsolateSocket extends Client {
  // ensure the instance has the expected runtime members
  public isolateId: number | string = 0;

  // declare members that come from the base `Client`/`CommonClient` so
  // TypeScript recognizes their presence when using `IsolateSocket`.
  declare public on: (...args: any[]) => any;
  declare public removeListener: (...args: any[]) => any;
  declare public call: (...args: any[]) => Promise<any>;
  declare public close: (...args: any[]) => void;

  constructor(address?: string) {
    // Forward to the underlying rpc-websockets Client constructor
    // (address and optional options are supported by the upstream Client).
    // Use `any` to avoid widening the signature here.

    // @ts-ignore - runtime call is valid; types are provided by the package
    super(address as any);
    // rpc-websockets keeps a pending call until a reply or its timeout arrives, and
    // executeSocketCommand sets no timeout. Reject pending calls when the Dart VM connection
    // closes (e.g. the app crashed or relaunched) so the command fails instead of hanging.
    this.on(`close`, () => this.rejectPendingCalls());
  }

  public async executeSocketCommand(args: ExecuteArgs) {
    // call an RPC method with parameters
    return this.call(`ext.flutter.driver`, {
      ...args,
      isolateId: this.isolateId,
    }) as Promise<{
      isError: boolean;
      response: any;
    }>;
  }

  private rejectPendingCalls() {
    const queue: Record<string, {promise: [unknown, (err: Error) => void]; timeout?: NodeJS.Timeout}> =
      (this as any).queue ?? {};
    for (const [id, {promise, timeout}] of Object.entries(queue)) {
      clearTimeout(timeout);
      delete queue[id];
      promise[1](new Error(`The Dart VM connection was closed before it replied`));
    }
  }
}

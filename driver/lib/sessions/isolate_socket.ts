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
  public on: (...args: any[]) => any;
  public removeListener: (...args: any[]) => any;
  public call: (...args: any[]) => Promise<any>;
  public close: (...args: any[]) => void;

  constructor(address?: string) {
    // Forward to the underlying rpc-websockets Client constructor
    // (address and optional options are supported by the upstream Client).
    // Use `any` to avoid widening the signature here.
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore - runtime call is valid; types are provided by the package
    super(address as any);
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
}

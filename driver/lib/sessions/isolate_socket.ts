import {Client} from 'rpc-websockets';

interface IsolateRef {
  name: string;
  id: string | number;
  isolateGroupId?: string;
}

export interface VMInfo {
  isolates?: IsolateRef[];
}

export interface IsolateInfo {
  extensionRPCs?: string[] | null;
}

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
  }

  public async getVM(): Promise<VMInfo | null> {
    return this.call(`getVM`);
  }

  public async getIsolate(isolateId: string | number): Promise<IsolateInfo | null> {
    return this.call(`getIsolate`, {isolateId: `${isolateId}`});
  }

  public async hasFlutterDriverExtension(isolateId: string | number): Promise<boolean> {
    const isolate = await this.getIsolate(isolateId);
    return Array.isArray(isolate?.extensionRPCs) && isolate.extensionRPCs.includes(`ext.flutter.driver`);
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

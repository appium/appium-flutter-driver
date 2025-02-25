import { Client } from 'rpc-websockets';

interface ExecuteArgs {
    command: string,
    [key: string]: any;
}

export class IsolateSocket extends Client {
    public isolateId: number|string = 0;
    public async executeSocketCommand(args: ExecuteArgs) {
        // call an RPC method with parameters
        return this.call(`ext.flutter.driver`, {
            ...args,
            isolateId: this.isolateId,
        }) as Promise<{
            isError: boolean,
            response: any,
        }>;
    }
}

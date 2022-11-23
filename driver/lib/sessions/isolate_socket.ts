import { Client } from 'rpc-websockets';

export class IsolateSocket extends Client {
    public isolateId: number|string = 0;
    public async executeSocketCommand(cmd) {
        // call an RPC method with parameters
        return this.call(`ext.flutter.driver`, {
            ...cmd,
            isolateId: this.isolateId,
        }) as Promise<{
            isError: boolean,
            response: any,
        }>;
    }
}

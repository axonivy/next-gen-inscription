import { InscriptionClient } from "@axonivy/inscription-core";
import { Deferred } from "@theia/core/lib/common/promise-util";
import { injectable } from "@theia/core/shared/inversify";
import { InscriptionClientProvider } from "./inscription-client-provider";

@injectable()
export class WebSocketInscriptionClientProvider implements InscriptionClientProvider {
    protected client: Deferred<InscriptionClient> | undefined;

    get(): Promise<InscriptionClient> {
        if (!this.client) {
            this.client = new Deferred<InscriptionClient>();
            this.createClient(this.client);
        }
        return this.client.promise;
    }

    protected async createClient(client: Deferred<InscriptionClient>): Promise<void> {
        try {
            const webSocketClient = await InscriptionClient.startWebSocketClient('ws://localhost:5015');
            await webSocketClient.initialize();
            client.resolve(webSocketClient);
        } catch (error) {
            client.reject(error);
        }
    }
}
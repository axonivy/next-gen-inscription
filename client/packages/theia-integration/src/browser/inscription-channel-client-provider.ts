import { InscriptionClient, JsonRpcInscriptionClient } from "@axonivy/inscription-core";
import { WebSocketConnectionProvider } from "@theia/core/lib/browser";
import { Deferred } from "@theia/core/lib/common/promise-util";
import { inject, injectable } from "@theia/core/shared/inversify";
import { createChannelConnection } from "../common/channel-connection";
import { INSCRIPTION_PATH } from "../common/inscription-channel";
import { InscriptionClientProvider } from "./inscription-client-provider";

@injectable()
export class ChannelInscriptionClientProvider implements InscriptionClientProvider {
    @inject(WebSocketConnectionProvider) protected readonly wsConnectionProvider: WebSocketConnectionProvider;

    protected client: Deferred<InscriptionClient> | undefined;

    get(): Promise<InscriptionClient> {
        if (!this.client) {
            this.client = new Deferred<InscriptionClient>();
            this.createClient(this.client);
        }
        return this.client.promise;
    }

    protected async createClient(client: Deferred<InscriptionClient>): Promise<void> {
        this.wsConnectionProvider.listen({
            path: INSCRIPTION_PATH,
            onConnection: async channel => {
                const connection = createChannelConnection(channel);
                const channelClient = new JsonRpcInscriptionClient(connection);
                channelClient.start();
                channel.onClose(() => channelClient.stop());
                await channelClient.initialize();
                client.resolve(channelClient);
            }
        }, { reconnecting: false });
    }
}
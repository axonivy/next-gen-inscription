import { MessagingService } from "@theia/core/lib/node/messaging/messaging-service";
import { inject, injectable } from "@theia/core/shared/inversify";
import { INSCRIPTION_PATH } from "../common/inscription-channel";
import { InscriptionServerConnection } from './inscription-server';

@injectable()
export class InscriptionMessagingContribution implements MessagingService.Contribution {
    @inject(InscriptionServerConnection) protected readonly serverConnection: InscriptionServerConnection;

    configure(service: MessagingService): void {
        service.wsChannel(INSCRIPTION_PATH, async (_, connection) => {
            try {
                // assume server is running and we want to connect immediately
                await this.serverConnection.connect(connection);
            } catch (error) {
                console.error(`Error occurred while configuring Inscription server forwarding. ${INSCRIPTION_PATH}.`, error);
            }
        });
    }
}
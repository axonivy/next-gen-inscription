import { MessagingService } from '@theia/core/lib/node/messaging/messaging-service';
import { ContainerModule } from '@theia/core/shared/inversify';
import { InscriptionMessagingContribution } from './inscription-messaging-contribution';
import { InscriptionMockServerConnection } from './inscription-mock-server';
import { InscriptionServerConnection } from './inscription-server';

export default new ContainerModule(bind => {
    bind(InscriptionServerConnection).to(InscriptionMockServerConnection);
    bind(MessagingService.Contribution).to(InscriptionMessagingContribution);
});

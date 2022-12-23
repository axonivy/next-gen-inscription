import { bindViewContribution, FrontendApplicationContribution, WidgetFactory } from '@theia/core/lib/browser';
import { ContainerModule } from '@theia/core/shared/inversify';
import { ChannelInscriptionClientProvider } from './inscription-channel-client-provider';
import { InscriptionClientProvider } from "./inscription-client-provider";
import { InscriptionFrontendContribution } from './inscription-frontend-contribution';
import { InscriptionViewViewContribution } from './inscription-view-contribution';
import { InscriptionWidget } from './inscription-widget';

export default new ContainerModule(bind => {
    bind(FrontendApplicationContribution).to(InscriptionFrontendContribution).inSingletonScope();
    bind(InscriptionClientProvider).to(ChannelInscriptionClientProvider).inSingletonScope();

    bindViewContribution(bind, InscriptionViewViewContribution);
    bind(InscriptionWidget).toSelf();
    bind(WidgetFactory).toDynamicValue(ctx => ({
        id: InscriptionWidget.ID,
        createWidget: () => ctx.container.get<InscriptionWidget>(InscriptionWidget)
    })).inSingletonScope();
});

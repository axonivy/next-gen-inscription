import { AbstractViewContribution } from '@theia/core/lib/browser';
import { Command } from '@theia/core/lib/common/command';
import { injectable } from '@theia/core/shared/inversify';
import { InscriptionWidget } from './inscription-widget';

export const ToggleAppWidget: Command = { id: 'app-widget:command' };

@injectable()
export class InscriptionViewViewContribution extends AbstractViewContribution<InscriptionWidget> {
    constructor() {
        super({
            widgetId: InscriptionWidget.ID,
            widgetName: InscriptionWidget.LABEL,
            defaultWidgetOptions: { area: 'main', mode: 'split-right' },
            toggleCommandId: ToggleAppWidget.id
        });
    }
}

import { FormLanguage, MonacoUtil } from "@axonivy/inscription-core";
import { MonacoEditorUtil } from "@axonivy/inscription-editor";
import { Monaco } from '@monaco-editor/react';
import { FrontendApplicationContribution } from "@theia/core/lib/browser";
import { ThemeService } from "@theia/core/lib/browser/theming";
import { Theme } from "@theia/core/lib/common/theme";
import { inject, injectable } from "@theia/core/shared/inversify";
import * as theiaMonaco from '@theia/monaco-editor-core';
import { MonacoThemeRegistry } from "@theia/monaco/lib/browser/textmate/monaco-theme-registry";

@injectable()
export class InscriptionFrontendContribution implements FrontendApplicationContribution {
    @inject(ThemeService) protected readonly themeService: ThemeService;
    @inject(MonacoThemeRegistry) protected readonly monacoThemeRegistry: MonacoThemeRegistry;

    async onStart(): Promise<void> {
        MonacoUtil.initStandalone();
        const reactMonaco = MonacoEditorUtil.initMonaco();
        this.syncMonacoInstances(reactMonaco);
        FormLanguage.startWebSocketClient('ws://localhost:5013');
    }

    private syncMonacoInstances(reactMonaco: Monaco): void {
        this.syncMonacoTheme(this.themeService.getCurrentTheme(), reactMonaco);
        this.themeService.onDidColorThemeChange(change => this.syncMonacoTheme(change.newTheme, reactMonaco));

        for (const language of reactMonaco.languages.getLanguages()) {
            theiaMonaco.languages.register(language);
        }
    }

    private syncMonacoTheme(theiaTheme: Theme, reactMonaco: Monaco): void {
        if (theiaTheme.editorTheme) {
            const data = this.monacoThemeRegistry.getThemeData(theiaTheme.editorTheme);
            if (data) {
                reactMonaco.editor.defineTheme(theiaTheme.editorTheme, data);
                reactMonaco.editor.setTheme(theiaTheme.editorTheme);
            }
        }
    }
}
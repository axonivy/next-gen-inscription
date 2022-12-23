import { InscriptionClient, InscriptionData } from '@axonivy/inscription-core';
import { App, ClientContextInstance } from '@axonivy/inscription-editor';
import { AutoSaveApp } from '@axonivy/inscription-editor/lib/App';
import { getDiagramWidget } from '@eclipse-glsp/theia-integration';
import { isGlspSelection } from '@eclipse-glsp/theia-integration/lib/browser/diagram/theia-glsp-selection-forwarder';
import { Disposable, DisposableCollection, Emitter, Event, MaybePromise, SelectionService } from '@theia/core';
import { ApplicationShell, codicon, Message, Saveable } from '@theia/core/lib/browser';
import { ReactWidget } from '@theia/core/lib/browser/widgets/react-widget';
import { inject, injectable, postConstruct } from '@theia/core/shared/inversify';
import { EditorPreferences } from '@theia/editor/lib/browser';

import * as React from 'react';
import { InscriptionClientProvider } from './inscription-client-provider';

import '../../style/theia.css';

@injectable()
export class InscriptionWidget extends ReactWidget {
  static readonly ID = 'InscriptionWidget';
  static readonly LABEL = 'Inscription Dialog';

  @inject(SelectionService) protected selectionService: SelectionService;
  @inject(EditorPreferences) protected readonly editorPreferences: EditorPreferences;
  @inject(InscriptionClientProvider) protected readonly clientProvider: InscriptionClientProvider;
  @inject(ApplicationShell) protected readonly shell: ApplicationShell;

  protected client: InscriptionClient;
  protected pid: string = 'default';

  // If we want Theia save support we can implement SaveableSource
  // For now we do not do that but keep the saveable as optional to turn external support on and off
  saveable?: InscriptionWidgetSaveable;

  @postConstruct()
  protected async init(): Promise<void> {
    this.id = InscriptionWidget.ID;
    this.title.caption = InscriptionWidget.LABEL;
    this.title.label = InscriptionWidget.LABEL;
    this.title.iconClass = codicon('symbol-property');
    this.title.closable = true;

    this.node.tabIndex = -1;

    this.client = await this.clientProvider.get();

    this.addGlspSelectionSupport();
    // you can comment the line below to deactivate Theia save integration and simply use App auto-save
    // this.addTheiaSaveSupport();
    this.update();
  }

  protected override onActivateRequest(msg: Message): void {
    super.onActivateRequest(msg);
    this.node.focus();
  }

  protected addGlspSelectionSupport(): void {
    this.toDispose.push(this.selectionService.onSelectionChanged(selection => this.setGlspSelection(selection)));
    this.setGlspSelection(this.selectionService.selection)
  }

  protected setGlspSelection(selection?: Object): void {
    if (isGlspSelection(selection)) {
      const pid = this.resolveSelection(selection.selectedElementsIDs);
      if (pid) {
        this.pid = pid;
        this.update();
      }
    }
  }

  protected resolveSelection(selectedElementsIDs: string[]): string | undefined {
    const firstSelected = selectedElementsIDs.length > 0 ? selectedElementsIDs[0] : undefined;
    if (!firstSelected) {
      return;
    }
    const widget = this.shell.activeWidget;
    const diagramWidget = widget && getDiagramWidget(widget);
    const root = diagramWidget?.editorContext.modelRoot;
    const element = root?.index.getById(firstSelected);
    if (!element) {
      return;
    }
    return element.id;
  }

  protected addTheiaSaveSupport(): void {
    const saveable = new InscriptionWidgetSaveable(this.client);
    saveable.autoSave = this.editorPreferences['files.autoSave'];
    saveable.autoSaveDelay = this.editorPreferences['files.autoSaveDelay'];

    this.toDispose.push(this.editorPreferences.onPreferenceChanged(event => {
      if (event.preferenceName === 'files.autoSave') {
        saveable.autoSave = this.editorPreferences['files.autoSave'];
        this.update();
      }
      if (event.preferenceName === 'files.autoSaveDelay') {
        saveable.autoSaveDelay = this.editorPreferences['files.autoSaveDelay'];
      }
    }));

    this.saveable = saveable;
    this.toDispose.push(this.saveable);
  }

  protected onStateChanged = (data: InscriptionData, dirty: boolean) => {
    if (this.saveable) {
      this.saveable.data = data;
      this.saveable.dirty = dirty;
    }
  }

  render(): React.ReactElement {
    const app = this.saveable
      ? <App pid={this.pid} onStateChanged={this.onStateChanged} />
      : <AutoSaveApp pid={this.pid} />

    return <React.StrictMode>
      <ClientContextInstance.Provider value={{ client: this.client }}>
        {app}
      </ClientContextInstance.Provider>
    </React.StrictMode>
  }
}

type AutoSaveType = 'off' | 'afterDelay' | 'onFocusChange' | 'onWindowChange';

export class InscriptionWidgetSaveable implements Saveable, Disposable {
  protected _autoSave: AutoSaveType = 'off';
  autoSaveDelay = 500;

  data: InscriptionData;

  private autoSaveJobs = new DisposableCollection();
  private isDirty = false;
  readonly dirtyChangedEmitter: Emitter<void> = new Emitter<void>();

  constructor(protected client: InscriptionClient) {
  }

  get onDirtyChanged(): Event<void> {
    return this.dirtyChangedEmitter.event;
  }

  save(): MaybePromise<void> {
    this.client.saveData(this.data);
  }

  get dirty(): boolean {
    return this.isDirty;
  }

  set dirty(newDirty: boolean) {
    const oldValue = this.isDirty;
    if (oldValue !== newDirty) {
      this.isDirty = newDirty;
      this.dirtyChangedEmitter.fire(undefined);
    }
    this.scheduleAutoSave();
  }

  set autoSave(autoSave: AutoSaveType) {
    this._autoSave = autoSave;
    if (this.shouldAutoSave) {
      this.scheduleAutoSave();
    } else {
      this.autoSaveJobs.dispose();
    }
  }

  get autoSave(): AutoSaveType {
    return this._autoSave;
  }

  protected scheduleAutoSave(): void {
    if (this.shouldAutoSave) {
      this.autoSaveJobs.dispose();
      const autoSaveJob = window.setTimeout(() => this.doAutoSave(), this.autoSaveDelay);
      const disposableAutoSaveJob = Disposable.create(() => window.clearTimeout(autoSaveJob));
      this.autoSaveJobs.push(disposableAutoSaveJob);
    }
  }

  protected doAutoSave(): void {
    if (this.shouldAutoSave) {
      this.save();
    }
  }

  protected get shouldAutoSave(): boolean {
    return this.dirty && this.autoSave !== 'off';
  }

  async revert(): Promise<void> {
    console.warn('Inscription Widget only supports server-side saving. The `revert` implementation is no-op and has no effect.');
  }

  createSnapshot(): Saveable.Snapshot {
    throw new Error('Inscription Widget only supports server-side saving. `createSnapshot` should never be invoked');
  }

  dispose(): void {
    this.autoSaveJobs.dispose();
    this.dirtyChangedEmitter.dispose();
  }
}
import cloneDeep from 'lodash/cloneDeep';
import { createMessageConnection, Emitter, Event } from 'vscode-jsonrpc';
import { Disposable } from 'vscode-ws-jsonrpc';
import { ConnectionUtil } from './connection-util';
import { InscriptionData, InscriptionSaveData, USER_DIALOG_DATA } from './data';
import { InscriptionNotificationTypes, InscriptionRequestTypes } from './inscription-protocol';
import { DialogStart, DIALOG_STARTS_META, Variable } from './meta';
import { BaseRcpClient } from './rcp-client';
import { InscriptionValidation } from './validation/inscription-validation';
import { validateInscriptionData } from './validation/validation-mock';

export interface InscriptionClient {
  initialize(): Promise<boolean>;
  data(pid: string): Promise<InscriptionData>;
  saveData(data: InscriptionSaveData): Promise<InscriptionValidation[]>;

  dialogStarts(): Promise<DialogStart[]>;
  outMapping(): Promise<Variable[]>;

  onDataChanged: Event<InscriptionData>;
  onValidation: Event<InscriptionValidation[]>;
}

export class InscriptionClientMock implements InscriptionClient {
  protected store: Map<string, InscriptionData> = new Map();
  protected onDataChangedEmitter = new Emitter<InscriptionData>();
  onDataChanged = this.onDataChangedEmitter.event;
  protected onValidationEmitter = new Emitter<InscriptionValidation[]>();
  onValidation = this.onValidationEmitter.event;

  async initialize(): Promise<boolean> {
    return true;
  }

  async data(pid: string): Promise<InscriptionData> {
    let inscriptionData = this.store.get(pid);
    if(!inscriptionData) {
      const data = cloneDeep(USER_DIALOG_DATA);
      data.nameData.description = pid;
      inscriptionData = { pid, type: 'UserDialog', readonly: false, data };
      this.store.set(pid, inscriptionData);
    }
    // TODO: Validation on every request, maybe client can explicitly ask for validation
    this.validate(inscriptionData);
    return inscriptionData;
  }

  async validate(data: InscriptionSaveData): Promise<InscriptionValidation[]> {
    const validation = validateInscriptionData(data);
    this.onValidationEmitter.fire(validation);
    return validation;
  }

  async saveData(data: InscriptionSaveData): Promise<InscriptionValidation[]> {
    const fullData = { ...data, readonly: false };
    this.store.set(data.pid, fullData);
    this.onDataChangedEmitter.fire(fullData);
    return this.validate(data);
  }

  async dialogStarts(): Promise<DialogStart[]> {
    return DIALOG_STARTS_META;
  }
  
  async outMapping(): Promise<Variable[]> {
    return [];
  }
}

export class JsonRpcInscriptionClient extends BaseRcpClient implements InscriptionClient {
  protected onDataChangedEmitter = new Emitter<InscriptionData>();
  onDataChanged = this.onDataChangedEmitter.event;
  protected onValidationEmitter = new Emitter<InscriptionValidation[]>();
  onValidation = this.onValidationEmitter.event;

  protected override setupConnection(): void {
    super.setupConnection();
    this.toDispose.push(this.onDataChangedEmitter);
    this.onNotification('dataChanged', data => this.onDataChangedEmitter.fire(data));
    this.toDispose.push(this.onValidationEmitter);
    this.onNotification('validation', validations => this.onValidationEmitter.fire(validations));
  }

  initialize(): Promise<boolean> {
    return this.sendRequest('initialize', undefined);
  }

  data(pid: string): Promise<InscriptionData> {
    return this.sendRequest('data', { pid });
  }

  dialogStarts(): Promise<DialogStart[]> {
    return this.sendRequest('dialogStarts', {});
  }

  outMapping(): Promise<Variable[]> {
    return this.sendRequest('outMapping', {});
  }

  saveData(data: InscriptionSaveData): Promise<InscriptionValidation[]> {
    return this.sendRequest('saveData', data);
  }

  sendRequest<K extends keyof InscriptionRequestTypes>(
    command: K,
    args: InscriptionRequestTypes[K][0]
  ): Promise<InscriptionRequestTypes[K][1]> {
    return args === undefined ? this.connection.sendRequest(command) : this.connection.sendRequest(command, args);
  }

  onNotification<K extends keyof InscriptionNotificationTypes>(
    kind: K,
    listener: (args: InscriptionNotificationTypes[K]) => any
  ): Disposable {
    return this.connection.onNotification(kind, listener);
  }
}

export namespace InscriptionClient {
  export async function startWebSocketClient(url: string): Promise<InscriptionClient> {
    const connection = await ConnectionUtil.createWebSocketConnection(url);
    const messageConnection = createMessageConnection(connection.reader, connection.writer);
    const client = new JsonRpcInscriptionClient(messageConnection);
    client.start();
    connection.reader.onClose(() => client.stop());
    return client;
  }
}

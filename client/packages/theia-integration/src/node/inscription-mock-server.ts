import { CallData, DialogStart, InscriptionData, InscriptionProtocol, InscriptionSaveData, InscriptionServer, InscriptionValidation, NameData, UserDialogData, Variable } from "@axonivy/inscription-core";
import { Channel, ILogger } from "@theia/core";

import { inject, injectable } from "@theia/core/shared/inversify";
import cloneDeep from 'lodash/cloneDeep';
import { Message, MessageConnection } from "vscode-jsonrpc";
import { createChannelConnection } from "../common/channel-connection";
import { InscriptionServerConnection } from "./inscription-server";

@injectable()
export class InscriptionMockServerConnection implements InscriptionServerConnection {
    @inject(ILogger) protected logger: ILogger;

    async connect(clientChannel: Channel): Promise<void> {
        // we cannot re-use the Theia proxy mechanism as they are based on the Theia Message protocol
        // instead we are sending VSCode JsonRPC messages through the channel so we need to manually work on those messages
        const connection = createChannelConnection(clientChannel);
        new InscriptionMockServer(connection, this.logger);
        connection.listen();
    }
}

export class InscriptionMockServer implements InscriptionServer {
    protected store: Map<string, InscriptionData> = new Map();

    constructor(protected connection: MessageConnection, protected logger: ILogger) {
        connection.onRequest('initialize', this.initialize.bind(this));
        connection.onRequest('data', this.data.bind(this));
        connection.onRequest('saveData', this.saveData.bind(this));
        connection.onRequest('dialogStarts', this.dialogStarts.bind(this));
        connection.onRequest('outMapping', this.outMapping.bind(this));
        connection.onError(data => this.handleConnectionError(data[0], data[1], data[2]));
    }

    async initialize(): Promise<boolean> {
        return true;
    }

    async data(args: InscriptionProtocol.InscriptionDataArgs): Promise<InscriptionData> {
        const pid = args.pid;
        let inscriptionData = this.store.get(pid);
        if (!inscriptionData) {
            const data = cloneDeep(USER_DIALOG_DATA);
            data.nameData.description = pid;
            inscriptionData = { pid, type: 'UserDialog', readonly: false, data };
            this.store.set(pid, inscriptionData);
        }
        // TODO: Validation on every request, maybe client can explicitly ask for validation
        this.validate(inscriptionData);
        return inscriptionData;
    }

    saveData(args: InscriptionSaveData): Promise<InscriptionProtocol.InscriptionSaveDataRes> {
        const fullData = { ...args, readonly: false };
        this.store.set(args.pid, fullData);
        this.connection.sendNotification('dataChanged', fullData);
        return this.validate(args);
    }

    async dialogStarts(_args: InscriptionProtocol.DialogStartsArgs): Promise<InscriptionProtocol.DialogStartsRes> {
        return DIALOG_STARTS_META;
    }

    async outMapping(_args: InscriptionProtocol.OutMappingArgs): Promise<InscriptionProtocol.OutMappingRes> {
        return [];
    }

    async validate(data: InscriptionSaveData): Promise<InscriptionValidation[]> {
        const validation = validateInscriptionData(data);
        this.connection.sendNotification('validation', validation);
        return validation;
    }

    protected handleConnectionError(error: Error, _message: Message | undefined, _count: number | undefined): void {
        this.logger.error('Connection Error', error);
      }
}  
  
//
// Need to copy data and functions below because we they are part of an ES module and we are a CommonJs module.
// Type imports are fine and in theory using a dynamic import should solve the problem.
// In the long run it would be better to align this more closely.
//

export const USER_DIALOG_DATA: UserDialogData = {
    nameData: {
      displayName: 'test name',
      description: 'test desc',
      documents: [
        {
          description: 'Doc 1',
          url: 'axonivy.com'
        },
        {
          description: 'ivyTeam ❤️',
          url: 'ivyteam.ch'
        }
      ],
      tags: ['bla', 'zag']
    },
    callData: {
      dialogStart: '',
      mappingData: {
        mappings: [{ attribute: 'param.procurementRequest', expression: 'in' }],
        code: 'ivy.log.info("Hello World")'
      }
    },
    outputData: {}
  };
  

export const USER_DIALOG_META_CALL: Variable[] = [
    {
      attribute: 'param',
      type: '<workflow.humantask.ProcurementRequest procurementRequest>',
      simpleType: '<ProcurementRequest>',
      children: [
        {
          attribute: 'procurementRequest',
          type: 'workflow.humantask.ProcurementRequest',
          simpleType: 'ProcurementRequest',
          children: [
            { attribute: 'accepted', type: 'java.lang.Boolean', simpleType: 'Boolean', children: [] },
            { attribute: 'amount', type: 'java.lang.Number', simpleType: 'Number', children: [] }
          ]
        }
      ]
    }
  ];
  
  export const DIALOG_STARTS_META: DialogStart[] = [
    {
      id: 'workflow.humantask.AcceptRequest:start()',
      dialogName: 'AcceptRequest',
      startName: 'start():ProcurementRequest,LogEntry',
      description: '',
      packageName: 'workflow.humantask',
      project: 'workflow-demos',
      callParameter: USER_DIALOG_META_CALL
    },
    {
      id: 'workflow.humantask.AcceptRequest:start2()',
      dialogName: 'AcceptRequest',
      startName: 'start2()',
      description: '',
      packageName: 'workflow.humantask',
      project: 'workflow-demos',
      callParameter: []
    },
    {
      id: 'demo.test1:start()',
      dialogName: 'test1',
      startName: 'start()',
      description: '',
      packageName: 'demo',
      project: 'demo',
      callParameter: []
    }
  ];
  
export function validateInscriptionData(data: InscriptionSaveData): InscriptionValidation[] {
    switch (data.type) {
      case 'UserDialog':
        return validateUserDialogEditor(data.data);
      default:
        return [];
    }
  }
  
  export function validateUserDialogEditor(data: UserDialogData): InscriptionValidation[] {
    const msgs: InscriptionValidation[] = [];
    msgs.push(...validateNameData(data.nameData));
    msgs.push(...validateCallData(data.callData));
    return msgs;
  }
  
  export function validateNameData(data: NameData): InscriptionValidation[] {
    const msgs: InscriptionValidation[] = [];
    if (data.displayName.length === 0) {
      msgs.push({ path: 'nameData/displayName', severity: 'error', message: '🚫 Display name must not be empty' });
    }
    if (data.description.length === 0) {
      msgs.push({ path: 'nameData/description', severity: 'warning', message: '⚠️ Description is empty' });
    }
    return msgs;
  }
  
  export function validateCallData(data: CallData): InscriptionValidation[] {
    const msgs: InscriptionValidation[] = [];
    if (data.dialogStart.length === 0) {
      msgs.push({ path: 'callData/dialogStart', severity: 'warning', message: '⚠️ No User Dialog specified, auto dialog will be shown.' });
    }
    return msgs;
  }
  
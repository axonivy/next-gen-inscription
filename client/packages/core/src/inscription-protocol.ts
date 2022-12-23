import { InscriptionData, InscriptionSaveData } from './data/inscription-data';
import { DialogStart, Variable } from './meta/inscription-meta';
import { InscriptionValidation } from './validation/inscription-validation';

export declare module InscriptionProtocol {
  export type InitializeArgs = void;
  export type InitializeRes = boolean;

  export type InscriptionDataArgs = { pid: string };
  export type InscriptionDataRes = InscriptionData;

  export type InscriptionSaveDataArgs = InscriptionSaveData;
  export type InscriptionSaveDataRes = InscriptionValidation[];

  export type DialogStartsArgs = {}; //maybe later with param to filter offline dialogs
  export type DialogStartsRes = DialogStart[];

  export type OutMappingArgs = {};
  export type OutMappingRes = Variable[];
}

export interface InscriptionServer {
  initialize(args: InscriptionProtocol.InitializeArgs): Promise<InscriptionProtocol.InitializeRes>;
  data(args: InscriptionProtocol.InscriptionDataArgs): Promise<InscriptionProtocol.InscriptionDataRes>;
  saveData(args: InscriptionProtocol.InscriptionSaveDataArgs): Promise<InscriptionProtocol.InscriptionSaveDataRes>;
  dialogStarts(args: InscriptionProtocol.DialogStartsArgs): Promise<InscriptionProtocol.DialogStartsRes>;
  outMapping(args: InscriptionProtocol.OutMappingArgs): Promise<InscriptionProtocol.OutMappingRes>;
}

export interface InscriptionRequestTypes {
  initialize: [InscriptionProtocol.InitializeArgs, InscriptionProtocol.InitializeRes];
  data: [InscriptionProtocol.InscriptionDataArgs, InscriptionProtocol.InscriptionDataRes];
  saveData: [InscriptionProtocol.InscriptionSaveDataArgs, InscriptionProtocol.InscriptionSaveDataRes];

  dialogStarts: [InscriptionProtocol.DialogStartsArgs, InscriptionProtocol.DialogStartsRes];
  outMapping: [InscriptionProtocol.OutMappingArgs, InscriptionProtocol.OutMappingRes];
}

export interface InscriptionNotificationTypes {
  dataChanged: InscriptionData;
  validation: InscriptionValidation[];
}

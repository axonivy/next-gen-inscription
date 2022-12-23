import { Channel } from "@theia/core";

export const InscriptionServerConnection = Symbol('InscriptionServerConnection');
// eslint-disable-next-line @typescript-eslint/no-redeclare
export interface InscriptionServerConnection {
    connect(clientChannel: Channel): Promise<void>;
}

import { Channel, Disposable, DisposableCollection } from "@theia/core";
import { ForwardingChannel } from "@theia/core/lib/common/message-rpc/channel";
import { injectable } from "@theia/core/shared/inversify";
import * as net from 'net';
import { Message, MessageReader, MessageWriter, SocketMessageReader, SocketMessageWriter } from 'vscode-jsonrpc/node';
import { IConnection } from "vscode-ws-jsonrpc/server";
import { ConnectionForwarder } from "./connection-forwarder";
import { InscriptionServerConnection } from "./inscription-server";

@injectable()
export class InscriptionSocketServerConnection implements InscriptionServerConnection {
    async connect(clientChannel: Channel): Promise<void> {
        const socket = new net.Socket();
        const serverConnection = createSocketConnection(socket, socket, () => socket.destroy());
        // simply forward from the frontend client channel to the server socket connection
        new ConnectionForwarder(clientChannel, serverConnection);
        if (clientChannel instanceof ForwardingChannel) {
            socket.on('error', error => clientChannel.onErrorEmitter.fire(error));
        }
        socket.connect({ host: 'localhost', port: 5015 });
    }
}

function createSocketConnection(outSocket: net.Socket, inSocket: net.Socket, onDispose: () => void): IConnection {
    const reader = new SocketMessageReader(outSocket);
    const writer = new SocketMessageWriter(inSocket);
    return createConnection(reader, writer, onDispose);
}

function createConnection<T extends {}>(reader: MessageReader, writer: MessageWriter, onDispose: () => void,
    extensions: T = {} as T): IConnection & T {
    const disposeOnClose = new DisposableCollection();
    reader.onClose(() => disposeOnClose.dispose());
    writer.onClose(() => disposeOnClose.dispose());
    return {
        reader,
        writer,
        forward(to: IConnection, map: (message: Message) => Message = (message) => message): void {
            reader.listen(input => {
                const output = map(input);
                to.writer.write(output);
            });
        },
        onClose(callback: () => void): DisposableCollection {
            disposeOnClose.push(Disposable.create(callback));
            return disposeOnClose;
        },
        dispose: () => onDispose(),
        ...extensions
    };
}

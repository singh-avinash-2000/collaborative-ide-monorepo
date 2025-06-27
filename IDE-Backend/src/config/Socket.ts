import { Server } from 'socket.io';

export class SocketService {
	private _instance: Server;

	constructor() {
		this._instance = new Server();
	}

	public initListeners() {
		this.io.on('connection', (socket) => {
			socket.on('message', (event) => {
				console.log('Received message:', event);
			});
		});
	}

	get io() {
		return this._instance;
	}
}

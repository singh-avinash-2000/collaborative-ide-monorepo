import express, { Request, Response } from 'express';
import http from 'http';
import { SocketService } from './config/Socket';

const init = async () => {
	const app = express();
	const server = http.createServer(app);
	const port = process.env.PORT || 3001;

	const socketService = new SocketService();
	socketService.io.attach(server);
	socketService.initListeners();

	app.get('/health', (_req: Request, res: Response) => {
		console.log('Health check');
		res.send('Server is healthy');
	});

	server.listen(port, () => {
		console.log(`server is running on http://localhost:${port}`);
	});
};

init();

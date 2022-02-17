import { Server } from 'ws';

const WS_PORT = Number(process.env.WS_PORT) || 6000;

const wss = new Server({port: WS_PORT});

wss.on('connection', (ws) => {
    console.log('Client connected.');
    ws.on('close', () => {
        console.log('Client disconected.');
    });
});
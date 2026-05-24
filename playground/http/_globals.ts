import { createServer } from 'node:http';

/** Constants */
export const SERVER_PORT = 19823;
export const SERVER_URL = `http://localhost:${SERVER_PORT}`;

/** Server handling */
type Server = ReturnType<typeof createServer>;

let server: Server | null = null;

export function startServer(): Promise<Server> {
    if (server) return Promise.resolve(server);

    server = createServer((_req, res) => {
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ ok: true }));
    });

    return new Promise((resolve) => server!.listen(SERVER_PORT, () => resolve(server!)));
}

export function stopServer(): Promise<void> {
    if (!server) return Promise.resolve();

    return new Promise((resolve, reject) => {
        server!.close((err) => {
            if (err) reject(err);
            else resolve();
        });
    });
}

export function getServer(): Server {
    if (!server) throw new Error('Server not started. Call startServer() first.');
    return server;
}

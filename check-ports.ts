import net from 'net';

const ports = [5432, 51213, 51214, 51215, 51216, 51217];

async function checkPort(port: number): Promise<boolean> {
    return new Promise((resolve) => {
        const socket = new net.Socket();
        socket.setTimeout(500);
        socket.on('connect', () => {
            console.log(`✅ Port ${port} is OPEN`);
            socket.destroy();
            resolve(true);
        });
        socket.on('timeout', () => {
            socket.destroy();
            resolve(false);
        });
        socket.on('error', (err) => {
            resolve(false);
        });
        socket.connect(port, 'localhost');
    });
}

async function main() {
    console.log('Scanning ports:', ports);
    for (const port of ports) {
        await checkPort(port);
    }
}

main();

// relay-server.js
// A minimal Node.js WebSocket relay for Gemini Live API
// Usage: node relay-server.js

const WebSocket = require('ws');
const http = require('http');

// Configuration
const PORT = 3000;
const API_KEY = process.env.GEMINI_API_KEY || "YOUR_API_KEY_HERE";
const MODEL_ID = "gemini-2.5-flash-native-audio-preview-12-2025";
const TARGET_URL = `wss://generativelanguage.googleapis.com/ws/google.ai.generativelanguage.v1beta.GenerativeService.BidiGenerateContent?key=${API_KEY}`;

const server = http.createServer((req, res) => {
    res.writeHead(200, { 'Content-Type': 'text/plain' });
    res.end('Gemini Live Relay Server Running\n');
});

const wss = new WebSocket.Server({ server });

wss.on('connection', (clientWs) => {
    console.log('[Relay] Client connected');

    const targetWs = new WebSocket(TARGET_URL);

    // Buffer messages from client until target is open
    const messageBuffer = [];
    let isTargetOpen = false;

    // --- Client -> Target ---
    clientWs.on('message', (data) => {
        if (isTargetOpen) {
            targetWs.send(data);
        } else {
            messageBuffer.push(data);
        }
    });

    clientWs.on('close', (code, reason) => {
        console.log(`[Relay] Client closed: ${code} ${reason}`);
        targetWs.close();
    });

    // --- Target -> Client ---
    targetWs.on('open', () => {
        console.log('[Relay] Connected to Gemini API');
        isTargetOpen = true;

        // Flush buffer
        while (messageBuffer.length > 0) {
            targetWs.send(messageBuffer.shift());
        }
    });

    targetWs.on('message', (data) => {
        if (clientWs.readyState === WebSocket.OPEN) {
            clientWs.send(data);
        }
    });

    targetWs.on('error', (err) => {
        console.error('[Relay] Target Error:', err.message);
        clientWs.close(1011, "Relay Target Error");
    });

    targetWs.on('close', (code, reason) => {
        console.log(`[Relay] Target closed: ${code} ${reason}`);
        clientWs.close(code, reason);
    });
});

server.listen(PORT, () => {
    console.log(`Relay server listening on port ${PORT}`);
    console.log(`Targeting Model: ${MODEL_ID}`);
});

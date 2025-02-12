const Redis = require("ioredis");
const WebSocket = require("ws");

const redis = new Redis({ host: "localhost", port: 6379 }); // Change this if using a cloud Redis
const leaderKey = "websocket_leader";
const lockTTL = 5000; // Lock expires after 5 seconds
let isLeader = false;
let ws;

// Try to become the leader
async function tryBecomeLeader() {
    const result = await redis.set(leaderKey, "leader", "NX", "PX", lockTTL);
    return result === "OK";
}

// Renew leadership lock
async function renewLock() {
    if (!isLeader) return;
    const result = await redis.set(leaderKey, "leader", "XX", "PX", lockTTL);
    if (result !== "OK") {
        console.log("Lost leadership!");
        isLeader = false;
        closeWebSocket();
    } else {
        console.log("Renewed leadership lock");
        setTimeout(renewLock, lockTTL / 2); // Renew before lock expires
    }
}

// Connect to WebSocket
function connectWebSocket() {
    ws = new WebSocket("ws://localhost:8080"); // Connect to the dummy WebSocket server
    ws.on("open", () => {
        console.log("🔗 Connected to WebSocket as leader");
        // Send a test message to the WebSocket server
        ws.send("Hello from leader");
    });
    ws.on("message", (message) => {
        console.log("Received from WebSocket:", message.toString());
    });
    ws.on("close", () => {
        console.log("WebSocket closed");
        isLeader = false;
    });
}

// Close WebSocket connection
function closeWebSocket() {
    if (ws) {
        ws.close();
        ws = null;
    }
}

// Check leadership status
async function checkLeadership() {
    if (await tryBecomeLeader()) {
        console.log("Became leader");
        isLeader = true;
        connectWebSocket();
        renewLock();
    } else {
        console.log("Standby mode: Not the leader");
    }
    setTimeout(checkLeadership, 3000); // Re-attempt if not leader
}

// Start the process
checkLeadership();

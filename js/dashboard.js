import { 
    auth, 
    onAuthStateChanged, 
    signOut 
} from './firebase-config.js';

// Store hardware messages
let hardwareMessages = [];
const MAX_MESSAGES = 100; // Maximum number of messages to keep in memory
// Check auth state
onAuthStateChanged(auth, (user) => {
    if (!user) {
        // User is not signed in, redirect to login
        window.location.href = './index.html';
        return;
    }

    // Update UI based on user role
    const userRole = sessionStorage.getItem('userRole');
    console.log('Dashboard - User role:', userRole);
    
    const reportLink = document.getElementById('reportLink');
    if (reportLink) {
        reportLink.style.display = userRole === 'official' ? 'block' : 'none';
    }

    // Update user info in the UI
    const userEmail = sessionStorage.getItem('userEmail') || user?.email || 'Unknown';
    const userInfoElement = document.getElementById('user-info');
    if (userInfoElement) {
        userInfoElement.textContent = `Logged in as: ${userEmail} (${userRole})`;
    }
});

// WebSocket connection for hardware
export let socket;
let reconnectAttempts = 0;
const MAX_RECONNECT_ATTEMPTS = 5;

function connectWebSocket() {
    // Replace with your WebSocket server URL
    const wsProtocol = window.location.protocol === 'https:' ? 'wss://' : 'ws://';
    const wsUrl = wsProtocol + window.location.hostname + ':8080';
    
    socket = new WebSocket(wsUrl);

    socket.onopen = () => {
        console.log('Connected to hardware');
        updateConnectionStatus(true);
        reconnectAttempts = 0;
    };

    socket.onmessage = (event) => {
        try {
            const data = JSON.parse(event.data);
            console.log('Received from hardware:', data);
            updateLastUpdate();
            // Process hardware data here
            processHardwareData(data);
        } catch (error) {
            console.error('Error processing message:', error);
        }
    };

    socket.onclose = () => {
        console.log('Disconnected from hardware');
        updateConnectionStatus(false);
        
        // Attempt to reconnect
        if (reconnectAttempts < MAX_RECONNECT_ATTEMPTS) {
            const delay = Math.min(1000 * Math.pow(2, reconnectAttempts), 30000);
            console.log(`Reconnecting in ${delay/1000} seconds...`);
            setTimeout(connectWebSocket, delay);
            reconnectAttempts++;
        }
    };

    socket.onerror = (error) => {
        console.error('WebSocket error:', error);
    };
}

function updateConnectionStatus(isConnected) {
    const statusElement = document.getElementById('connection-status');
    if (statusElement) {
        const badge = statusElement.querySelector('.badge');
        if (isConnected) {
            badge.className = 'badge bg-success';
            badge.textContent = 'Hardware: Connected';
        } else {
            badge.className = 'badge bg-danger';
            badge.textContent = 'Hardware: Disconnected';
        }
    }
}

function updateLastUpdate() {
    const now = new Date();
    const timeString = now.toLocaleTimeString();
    const dateElement = document.getElementById('last-update');
    if (dateElement) {
        dateElement.textContent = `Last updated: ${timeString}`;
    }
}

function processHardwareData(data) {
    // Add timestamp to the message
    const timestamp = new Date().toISOString();
    const message = {
        timestamp,
        deviceId: data.deviceId || 'Unknown',
        type: data.type || 'data',
        data: JSON.stringify(data),
        status: 'received'
    };

    // Add to beginning of array (newest first)
    hardwareMessages.unshift(message);
    
    // Keep only the most recent messages
    if (hardwareMessages.length > MAX_MESSAGES) {
        hardwareMessages = hardwareMessages.slice(0, MAX_MESSAGES);
    }

    // Update the UI
    updateHardwareMessages();
}

function updateHardwareMessages() {
    const container = document.getElementById('hardwareMessages');
    if (!container) return;

    container.innerHTML = hardwareMessages.map(msg => `
        <tr>
            <td>${new Date(msg.timestamp).toLocaleString()}</td>
            <td>${msg.deviceId}</td>
            <td><span class="badge bg-info">${msg.type}</span></td>
            <td><code>${msg.data}</code></td>
            <td><span class="badge bg-success">${msg.status}</span></td>
        </tr>
    `).join('');
}

// Initialize WebSocket connection when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    // Connect to WebSocket server
    connectWebSocket();
    
    // Logout functionality
    document.getElementById('logoutBtn').addEventListener('click', async function() {
        try {
            await signOut(auth);
            sessionStorage.removeItem('userRole');
            sessionStorage.removeItem('userEmail');
            window.location.href = './index.html';
        } catch (error) {
            console.error('Logout error:', error);
            alert('Failed to log out. Please try again.');
        }
    });
    
    // Initial UI update
    updateHardwareMessages();
});

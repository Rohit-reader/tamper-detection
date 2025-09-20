// Import necessary modules
import { auth, onAuthStateChanged } from './firebase-config.js';

// Check authentication
onAuthStateChanged(auth, (user) => {
    if (!user) {
        // User is not signed in, redirect to login
        window.location.href = './index.html';
        return;
    }

    // Update user info in the UI
    const userEmail = sessionStorage.getItem('userEmail') || user.email;
    const userInfoElement = document.getElementById('user-info');
    if (userInfoElement) {
        userInfoElement.textContent = userEmail;
    }

    // Initialize charts and data
    initializeCharts();
    loadRecentAlerts();
});

// Initialize charts
function initializeCharts() {
    // Tamper Incidents Line Chart
    const tamperCtx = document.getElementById('tamperChart').getContext('2d');
    new Chart(tamperCtx, {
        type: 'line',
        data: {
            labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul'],
            datasets: [{
                label: 'Tamper Incidents',
                data: [12, 19, 3, 5, 2, 3, 8],
                borderColor: 'rgb(75, 192, 192)',
                tension: 0.1,
                fill: true,
                backgroundColor: 'rgba(75, 192, 192, 0.1)'
            }]
        },
        options: {
            responsive: true,
            plugins: {
                legend: {
                    position: 'top',
                },
                title: {
                    display: true,
                    text: 'Monthly Tamper Incidents'
                }
            }
        }
    });

    // Alert Distribution Pie Chart
    const pieCtx = document.getElementById('alertPieChart').getContext('2d');
    new Chart(pieCtx, {
        type: 'doughnut',
        data: {
            labels: ['Weight Machine', 'Electricity Meter', 'Water Meter'],
            datasets: [{
                data: [30, 50, 20],
                backgroundColor: [
                    'rgba(54, 162, 235, 0.7)',
                    'rgba(255, 99, 132, 0.7)',
                    'rgba(255, 206, 86, 0.7)'
                ],
                borderColor: [
                    'rgba(54, 162, 235, 1)',
                    'rgba(255, 99, 132, 1)',
                    'rgba(255, 206, 86, 1)'
                ],
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            plugins: {
                legend: {
                    position: 'right',
                }
            }
        }
    });
}

// Load recent alerts
function loadRecentAlerts() {
    // Sample data - replace with actual API call
    const alerts = [
        {
            id: 1,
            timestamp: '2023-09-20 14:30:22',
            device: 'Weight Machine #1',
            location: 'Foundry Section',
            type: 'Tamper Detected',
            status: 'Active'
        },
        {
            id: 2,
            timestamp: '2023-09-20 13:15:45',
            device: 'Electricity Meter #2',
            location: 'Rolling Mill',
            type: 'Irregular Usage',
            status: 'Investigation'
        },
        {
            id: 3,
            timestamp: '2023-09-20 11:45:12',
            device: 'Water Meter #1',
            location: 'Cooling Tower',
            type: 'Tamper Detected',
            status: 'Resolved'
        },
        {
            id: 4,
            timestamp: '2023-09-20 10:22:33',
            device: 'Weight Machine #3',
            location: 'Storage Area',
            type: 'Device Offline',
            status: 'Resolved'
        },
        {
            id: 5,
            timestamp: '2023-09-20 09:15:07',
            device: 'Electricity Meter #1',
            location: 'Main Office',
            type: 'Irregular Usage',
            status: 'False Positive'
        }
    ];

    const tbody = document.getElementById('recentAlerts');
    if (!tbody) return;

    // Clear existing rows
    tbody.innerHTML = '';

    // Add new rows
    alerts.forEach(alert => {
        const row = document.createElement('tr');
        
        // Set status class
        let statusClass = 'badge bg-secondary';
        if (alert.status === 'Active') statusClass = 'badge bg-danger';
        else if (alert.status === 'Investigation') statusClass = 'badge bg-warning';
        else if (alert.status === 'Resolved') statusClass = 'badge bg-success';
        else if (alert.status === 'False Positive') statusClass = 'badge bg-info';

        row.innerHTML = `
            <td>${alert.timestamp}</td>
            <td>${alert.device}</td>
            <td>${alert.location}</td>
            <td>${alert.type}</td>
            <td><span class="${statusClass}">${alert.status}</span></td>
            <td class="text-end">
                <button class="btn btn-sm btn-outline-primary me-1" onclick="viewAlertDetails(${alert.id})">
                    <i class="bi bi-eye"></i>
                </button>
                <button class="btn btn-sm btn-outline-secondary">
                    <i class="bi bi-download"></i>
                </button>
            </td>
        `;
        tbody.appendChild(row);
    });
}

// Add to window for HTML onclick
window.viewAlertDetails = function(alertId) {
    alert(`Viewing details for alert #${alertId}`);
    // Implement detailed view logic here
};

// Logout functionality
document.addEventListener('DOMContentLoaded', function() {
    document.getElementById('logoutBtn').addEventListener('click', async function() {
        try {
            await auth.signOut();
            sessionStorage.removeItem('userRole');
            sessionStorage.removeItem('userEmail');
            window.location.href = './index.html';
        } catch (error) {
            console.error('Logout error:', error);
            alert('Failed to log out. Please try again.');
        }
    });
});
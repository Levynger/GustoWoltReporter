// Manager dashboard JavaScript

// Category labels mapping
const categoryLabels = {
    'late_delivery': 'Late Delivery',
    'missing_items': 'Missing Items',
    'remake_approved': 'Remake Approved',
    'refund_promised': 'Refund Promised',
    'other': 'Other'
};

// Status labels mapping
const statusLabels = {
    'pending': 'Pending',
    'resolved': 'Resolved',
    'dealt_with': 'Dealt With',
    'escalation': 'Escalation'
};

// Load incidents on page load
document.addEventListener('DOMContentLoaded', () => {
    // Set default date range (last 30 days)
    const dateTo = new Date();
    const dateFrom = new Date();
    dateFrom.setDate(dateFrom.getDate() - 30);
    
    document.getElementById('dateTo').value = dateTo.toISOString().split('T')[0];
    document.getElementById('dateFrom').value = dateFrom.toISOString().split('T')[0];
    
    loadIncidents();
});

// Load incidents from API
async function loadIncidents() {
    const dateFrom = document.getElementById('dateFrom').value;
    const dateTo = document.getElementById('dateTo').value;
    const category = document.getElementById('categoryFilter').value;
    const status = document.getElementById('statusFilter').value;
    
    const loadingDiv = document.getElementById('loading');
    const incidentsList = document.getElementById('incidentsList');
    
    loadingDiv.style.display = 'block';
    incidentsList.innerHTML = '';
    
    try {
        const params = new URLSearchParams();
        if (dateFrom) params.append('dateFrom', dateFrom);
        if (dateTo) params.append('dateTo', dateTo);
        if (category) params.append('category', category);
        if (status) params.append('status', status);
        
        const response = await fetch(`/api/incidents?${params.toString()}`);
        
        if (!response.ok) {
            throw new Error('Failed to load incidents');
        }
        
        const incidents = await response.json();
        
        loadingDiv.style.display = 'none';
        
        if (incidents.length === 0) {
            incidentsList.innerHTML = '<div class="incident-card"><p style="text-align: center; color: #666;">No incidents found for the selected filters.</p></div>';
            return;
        }
        
        incidents.forEach(incident => {
            const card = createIncidentCard(incident);
            incidentsList.appendChild(card);
        });
    } catch (error) {
        console.error('Error loading incidents:', error);
        loadingDiv.style.display = 'none';
        incidentsList.innerHTML = '<div class="incident-card"><p style="text-align: center; color: #d32f2f;">Error loading incidents. Please try again.</p></div>';
    }
}

// Create incident card element
function createIncidentCard(incident) {
    const card = document.createElement('div');
    card.className = 'incident-card';
    card.onclick = () => showIncidentDetail(incident.id);
    
    const statusClass = `status-${incident.status}`;
    const statusLabel = statusLabels[incident.status] || incident.status;
    const categoryLabel = categoryLabels[incident.category] || incident.category;
    
    card.innerHTML = `
        <div class="incident-header">
            <div class="incident-id">Wolt ID: ${escapeHtml(incident.wolt_id)}</div>
            <span class="incident-status ${statusClass}">${statusLabel}</span>
        </div>
        <div class="incident-info">
            <div class="incident-info-item">
                <strong>Category:</strong> ${categoryLabel}
            </div>
            <div class="incident-info-item">
                <strong>Report Date:</strong> ${formatDate(incident.report_date)}
            </div>
            <div class="incident-info-item">
                <strong>Worker:</strong> ${escapeHtml(incident.worker_name)}
            </div>
            <div class="incident-info-item">
                <strong>Created:</strong> ${formatDate(incident.created_at)}
            </div>
        </div>
        ${incident.description ? `<p style="color: #666; margin-top: 10px;">${escapeHtml(incident.description.substring(0, 100))}${incident.description.length > 100 ? '...' : ''}</p>` : ''}
        <div class="incident-actions">
            ${createStatusButtons(incident)}
        </div>
    `;
    
    return card;
}

// Create status update buttons
function createStatusButtons(incident) {
    const buttons = [];
    const statuses = ['pending', 'resolved', 'dealt_with', 'escalation'];
    
    statuses.forEach(status => {
        if (incident.status !== status) {
            buttons.push(`<button class="btn btn-small btn-secondary" onclick="event.stopPropagation(); updateStatus(${incident.id}, '${status}')">Mark as ${statusLabels[status]}</button>`);
        }
    });
    
    return buttons.join('');
}

// Update incident status
async function updateStatus(id, status) {
    try {
        const response = await fetch(`/api/incidents/${id}`, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ status })
        });
        
        if (!response.ok) {
            throw new Error('Failed to update status');
        }
        
        // Reload incidents
        loadIncidents();
    } catch (error) {
        console.error('Error updating status:', error);
        alert('Error updating status. Please try again.');
    }
}

// Show incident detail modal
async function showIncidentDetail(id) {
    try {
        const response = await fetch(`/api/incidents/${id}`);
        
        if (!response.ok) {
            throw new Error('Failed to load incident details');
        }
        
        const incident = await response.json();
        const modal = document.getElementById('detailModal');
        const modalBody = document.getElementById('modalBody');
        
        const statusLabel = statusLabels[incident.status] || incident.status;
        const categoryLabel = categoryLabels[incident.category] || incident.category;
        
        modalBody.innerHTML = `
            <h2>Incident Details</h2>
            <div class="modal-detail">
                <label>Wolt ID:</label>
                <p>${escapeHtml(incident.wolt_id)}</p>
            </div>
            <div class="modal-detail">
                <label>Category:</label>
                <p>${categoryLabel}</p>
            </div>
            <div class="modal-detail">
                <label>Status:</label>
                <p>${statusLabel}</p>
            </div>
            <div class="modal-detail">
                <label>Description:</label>
                <p>${incident.description ? escapeHtml(incident.description) : 'No description provided'}</p>
            </div>
            <div class="modal-detail">
                <label>Report Date:</label>
                <p>${formatDate(incident.report_date)}</p>
            </div>
            <div class="modal-detail">
                <label>Worker Name:</label>
                <p>${escapeHtml(incident.worker_name)}</p>
            </div>
            <div class="modal-detail">
                <label>Created At:</label>
                <p>${formatDate(incident.created_at)}</p>
            </div>
            ${incident.screenshot_path ? `
                <div class="modal-detail">
                    <label>Screenshot:</label>
                    <img src="${incident.screenshot_path}" alt="Screenshot" onerror="this.style.display='none'; this.nextElementSibling.style.display='block';">
                    <p style="display: none; color: #d32f2f;">Image not found</p>
                </div>
            ` : '<div class="modal-detail"><label>Screenshot:</label><p>No screenshot uploaded</p></div>'}
            <div class="modal-detail">
                <label>Update Status:</label>
                <div style="margin-top: 10px;">
                    ${['pending', 'resolved', 'dealt_with', 'escalation'].map(status => 
                        incident.status !== status ? 
                            `<button class="btn btn-small btn-secondary" onclick="updateStatus(${incident.id}, '${status}'); closeModal();">Mark as ${statusLabels[status]}</button>` : 
                            ''
                    ).join('')}
                </div>
            </div>
        `;
        
        modal.style.display = 'block';
    } catch (error) {
        console.error('Error loading incident detail:', error);
        alert('Error loading incident details. Please try again.');
    }
}

// Close modal
function closeModal() {
    document.getElementById('detailModal').style.display = 'none';
}

// Close modal when clicking outside
window.onclick = function(event) {
    const modal = document.getElementById('detailModal');
    if (event.target === modal) {
        closeModal();
    }
}

// Logout
async function logout() {
    try {
        await fetch('/api/logout', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ type: 'manager' })
        });
        window.location.href = '/manager/login';
    } catch (error) {
        console.error('Error logging out:', error);
        window.location.href = '/manager/login';
    }
}

// Helper functions
function formatDate(dateString) {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

function escapeHtml(text) {
    if (!text) return '';
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}


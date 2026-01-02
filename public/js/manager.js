// Manager dashboard JavaScript

// Category labels mapping
const categoryLabels = {
    'late_delivery': 'משלוח מאוחר',
    'missing_items': 'פריטים חסרים',
    'remake_approved': 'חיוב המסעדה',
    'refund_promised': 'זיכוי המסעדה',
    'other': 'אחר, נא לפרט'
};

// Status labels mapping
const statusLabels = {
    'pending': 'ממתין לטיפול',
    'resolved': 'טופל',
    'dealt_with': 'טופל', // Legacy support
    'escalation': 'הועבר להמשך טיפול' // Legacy support - display only
};

// Load incidents on page load
document.addEventListener('DOMContentLoaded', () => {
    // Set default date range (last 30 days)
    const dateTo = new Date();
    const dateFrom = new Date();
    dateFrom.setDate(dateFrom.getDate() - 30);
    
    document.getElementById('dateTo').value = dateTo.toISOString().split('T')[0];
    document.getElementById('dateFrom').value = dateFrom.toISOString().split('T')[0];
    
    // Set default status filter to show only non-resolved (pending) incidents
    document.getElementById('statusFilter').value = 'pending';
    
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
    loadingDiv.textContent = 'טוען...';
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
            incidentsList.innerHTML = '<div class="incident-card"><p style="text-align: center; color: #666;">לא נמצאו תקלות לפי הסינון שנבחר.</p></div>';
            return;
        }
        
        incidents.forEach(incident => {
            const card = createIncidentCard(incident);
            incidentsList.appendChild(card);
        });
    } catch (error) {
        console.error('Error loading incidents:', error);
        loadingDiv.style.display = 'none';
        incidentsList.innerHTML = '<div class="incident-card"><p style="text-align: center; color: #d32f2f;">שגיאה בטעינת התקלות. נסה שוב.</p></div>';
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
            <div class="incident-id">הזמנה: ${escapeHtml(incident.wolt_id)} | משלוח: ${escapeHtml(incident.wolt_delivery_id || 'לא צוין')}</div>
            <span class="incident-status ${statusClass}">${statusLabel}</span>
        </div>
        <div class="incident-info">
            <div class="incident-info-item">
                <strong>סוג תקלה:</strong> ${categoryLabel}
            </div>
            ${incident.amount ? `<div class="incident-info-item">
                <strong>סכום:</strong> ${parseFloat(incident.amount).toFixed(2)} ש"ח
            </div>` : ''}
            <div class="incident-info-item">
                <strong>תאריך דיווח:</strong> ${formatDate(incident.report_date)}
            </div>
            <div class="incident-info-item">
                <strong>עובד:</strong> ${escapeHtml(incident.worker_name)}
            </div>
            <div class="incident-info-item">
                <strong>נוצר:</strong> ${formatDate(incident.created_at)}
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
    const statuses = ['pending', 'resolved'];
    const statusButtonLabels = {
        'pending': 'סמן כממתין לטיפול',
        'resolved': 'סמן כטופל'
    };
    
    statuses.forEach(status => {
        if (incident.status !== status) {
            buttons.push(`<button class="btn btn-small btn-secondary" onclick="event.stopPropagation(); updateStatus(${incident.id}, '${status}')">${statusButtonLabels[status]}</button>`);
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
        alert('שגיאה בעדכון הסטטוס. נסה שוב.');
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
            <h2>פרטי התקלה</h2>
            <div class="modal-detail">
                <label>מספר הזמנה Wolt:</label>
                <p>${escapeHtml(incident.wolt_id)}</p>
            </div>
            <div class="modal-detail">
                <label>מספר משלוח Wolt:</label>
                <p>${escapeHtml(incident.wolt_delivery_id || 'לא צוין')}</p>
            </div>
            <div class="modal-detail">
                <label>סוג תקלה:</label>
                <p>${categoryLabel}</p>
            </div>
            ${incident.amount ? `<div class="modal-detail">
                <label>סכום:</label>
                <p>${parseFloat(incident.amount).toFixed(2)} ש"ח</p>
            </div>` : ''}
            <div class="modal-detail">
                <label>סטטוס:</label>
                <p>${statusLabel}</p>
            </div>
            <div class="modal-detail">
                <label>תיאור:</label>
                <p>${incident.description ? escapeHtml(incident.description) : 'לא צוין תיאור'}</p>
            </div>
            <div class="modal-detail">
                <label>תאריך דיווח:</label>
                <p>${formatDate(incident.report_date)}</p>
            </div>
            <div class="modal-detail">
                <label>שם עובד:</label>
                <p>${escapeHtml(incident.worker_name)}</p>
            </div>
            <div class="modal-detail">
                <label>נוצר ב:</label>
                <p>${formatDate(incident.created_at)}</p>
            </div>
            ${incident.screenshot_path ? `
                <div class="modal-detail">
                    <label>צילום מסך:</label>
                    <img src="${incident.screenshot_path}" alt="צילום מסך" onerror="this.style.display='none'; this.nextElementSibling.style.display='block';">
                    <p style="display: none; color: #d32f2f;">תמונה לא נמצאה</p>
                </div>
            ` : '<div class="modal-detail"><label>צילום מסך:</label><p>לא הועלה צילום מסך</p></div>'}
            <div class="modal-detail">
                <label>עדכן סטטוס:</label>
                <div style="margin-top: 10px;">
                    ${['pending', 'resolved'].map(status => {
                        if (incident.status === status) return '';
                        const statusButtonLabels = {
                            'pending': 'סמן כממתין לטיפול',
                            'resolved': 'סמן כטופל'
                        };
                        return `<button class="btn btn-small btn-secondary" onclick="updateStatus(${incident.id}, '${status}'); closeModal();">${statusButtonLabels[status]}</button>`;
                    }).join('')}
                </div>
            </div>
        `;
        
        modal.style.display = 'block';
    } catch (error) {
        console.error('Error loading incident detail:', error);
        alert('שגיאה בטעינת פרטי התקלה. נסה שוב.');
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
    if (!dateString) return 'לא זמין';
    
    // Check if dateString contains time in format: YYYY-MM-DD HH:MM
    const dateTimeMatch = dateString.match(/^(\d{4}-\d{2}-\d{2}) (\d{2}:\d{2})/);
    if (dateTimeMatch) {
        // Parse the date and time directly without timezone conversion
        const [, datePart, timePart] = dateTimeMatch;
        const [year, month, day] = datePart.split('-');
        const [hours, minutes] = timePart.split(':');
        
        // Create date object in local timezone
        const date = new Date(parseInt(year), parseInt(month) - 1, parseInt(day), parseInt(hours), parseInt(minutes));
        return date.toLocaleDateString('he-IL') + ' ' + date.toLocaleTimeString('he-IL', { hour: '2-digit', minute: '2-digit' });
    } else {
        // Fallback for ISO date strings or other formats
        const date = new Date(dateString);
        return date.toLocaleDateString('he-IL') + ' ' + date.toLocaleTimeString('he-IL', { hour: '2-digit', minute: '2-digit' });
    }
}

function escapeHtml(text) {
    if (!text) return '';
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

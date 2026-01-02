// Worker form JavaScript

// Set default date and time to current
document.addEventListener('DOMContentLoaded', () => {
    const dateInput = document.getElementById('report_date');
    const timeInput = document.getElementById('report_time');
    const categorySelect = document.getElementById('category');
    const amountGroup = document.getElementById('amountGroup');
    const amountInput = document.getElementById('amount');
    
    if (dateInput) {
        const now = new Date();
        const today = now.toISOString().split('T')[0];
        dateInput.value = today;
    }
    
    if (timeInput) {
        const now = new Date();
        const hours = String(now.getHours()).padStart(2, '0');
        const minutes = String(now.getMinutes()).padStart(2, '0');
        timeInput.value = `${hours}:${minutes}`;
    }
    
    // Load worker name from cookie if available
    const workerName = getCookie('worker_name');
    if (workerName) {
        const workerNameInput = document.getElementById('worker_name');
        if (workerNameInput) {
            workerNameInput.value = workerName;
        }
    }
    
    // Handle category change to show/hide amount field
    if (categorySelect && amountGroup && amountInput) {
        categorySelect.addEventListener('change', function() {
            const category = this.value;
            if (category === 'remake_approved' || category === 'refund_promised') {
                amountGroup.style.display = 'block';
                amountInput.required = true;
            } else {
                amountGroup.style.display = 'none';
                amountInput.required = false;
                amountInput.value = '';
            }
        });
    }
});

// Cookie helper functions
function getCookie(name) {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) {
        const cookieValue = parts.pop().split(';').shift();
        // Decode URL-encoded cookie value (needed for Hebrew characters)
        try {
            return decodeURIComponent(cookieValue);
        } catch (e) {
            // If decoding fails, return the original value
            return cookieValue;
        }
    }
    return null;
}

// Form submission
document.getElementById('incidentForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const form = e.target;
    const formData = new FormData(form);
    const messageDiv = document.getElementById('message');
    
    // Combine date and time into a single datetime string
    const dateValue = formData.get('report_date');
    const timeValue = formData.get('report_time');
    
    if (dateValue && timeValue) {
        // Create datetime string in format: YYYY-MM-DD HH:MM
        // This will be stored as local time without timezone conversion
        const dateTimeString = `${dateValue} ${timeValue}`;
        formData.set('report_date', dateTimeString);
        formData.delete('report_time'); // Remove separate time field
    }
    
    // Show loading state
    const submitBtn = form.querySelector('button[type="submit"]');
    const originalText = submitBtn.textContent;
    submitBtn.textContent = 'שולח...';
    submitBtn.disabled = true;
    messageDiv.style.display = 'none';
    
    try {
        const response = await fetch('/worker/submit', {
            method: 'POST',
            body: formData
        });
        
        const data = await response.json();
        
        if (data.success) {
            // Hide form and show success screen
            showSuccessScreen();
        } else {
            messageDiv.className = 'message error';
            messageDiv.textContent = data.message || 'שגיאה בשליחת הדיווח. נסה שוב.';
            messageDiv.style.display = 'block';
        }
    } catch (error) {
        console.error('Error:', error);
        messageDiv.className = 'message error';
        messageDiv.textContent = 'שגיאה בחיבור לשרת. אנא בדוק את החיבור ונסה שוב.';
        messageDiv.style.display = 'block';
    } finally {
        submitBtn.textContent = originalText;
        submitBtn.disabled = false;
    }
});

// Show success screen
function showSuccessScreen() {
    const formContainer = document.getElementById('formContainer');
    const successScreen = document.getElementById('successScreen');
    
    if (formContainer && successScreen) {
        formContainer.style.display = 'none';
        successScreen.style.display = 'block';
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }
}

// Show form (hide success screen)
function showForm() {
    const formContainer = document.getElementById('formContainer');
    const successScreen = document.getElementById('successScreen');
    const form = document.getElementById('incidentForm');
    
    if (formContainer && successScreen) {
        successScreen.style.display = 'none';
        formContainer.style.display = 'block';
        
        // Reset form
        resetForm();
        
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }
}

// Reset form to initial state
function resetForm() {
    const form = document.getElementById('incidentForm');
    const messageDiv = document.getElementById('message');
    
    if (form) {
        form.reset();
        messageDiv.style.display = 'none';
        
        // Reset date and time to current
        const dateInput = document.getElementById('report_date');
        const timeInput = document.getElementById('report_time');
        
        if (dateInput) {
            const now = new Date();
            const today = now.toISOString().split('T')[0];
            dateInput.value = today;
        }
        
        if (timeInput) {
            const now = new Date();
            const hours = String(now.getHours()).padStart(2, '0');
            const minutes = String(now.getMinutes()).padStart(2, '0');
            timeInput.value = `${hours}:${minutes}`;
        }
        
        // Keep worker name in form
        const workerName = getCookie('worker_name');
        if (workerName) {
            document.getElementById('worker_name').value = workerName;
        }
        
        // Hide amount field on reset
        const amountGroup = document.getElementById('amountGroup');
        const amountInput = document.getElementById('amount');
        if (amountGroup) {
            amountGroup.style.display = 'none';
        }
        if (amountInput) {
            amountInput.required = false;
        }
    }
}

// Worker form JavaScript

// Set default date to today
document.addEventListener('DOMContentLoaded', () => {
    const dateInput = document.getElementById('report_date');
    if (dateInput) {
        const today = new Date().toISOString().split('T')[0];
        dateInput.value = today;
    }
    
    // Load worker name from cookie if available
    const workerName = getCookie('worker_name');
    if (workerName) {
        const workerNameInput = document.getElementById('worker_name');
        if (workerNameInput) {
            workerNameInput.value = workerName;
        }
    }
});

// Cookie helper functions
function getCookie(name) {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop().split(';').shift();
    return null;
}

// Form submission
document.getElementById('incidentForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const form = e.target;
    const formData = new FormData(form);
    const messageDiv = document.getElementById('message');
    
    // Show loading state
    const submitBtn = form.querySelector('button[type="submit"]');
    const originalText = submitBtn.textContent;
    submitBtn.textContent = 'Submitting...';
    submitBtn.disabled = true;
    messageDiv.style.display = 'none';
    
    try {
        const response = await fetch('/worker/submit', {
            method: 'POST',
            body: formData
        });
        
        const data = await response.json();
        
        if (data.success) {
            messageDiv.className = 'message success';
            messageDiv.textContent = data.message || 'Incident reported successfully!';
            messageDiv.style.display = 'block';
            
            // Reset form
            form.reset();
            
            // Reset date to today
            const dateInput = document.getElementById('report_date');
            if (dateInput) {
                const today = new Date().toISOString().split('T')[0];
                dateInput.value = today;
            }
            
            // Keep worker name in form
            const workerName = getCookie('worker_name');
            if (workerName) {
                document.getElementById('worker_name').value = workerName;
            }
            
            // Scroll to top to show success message
            window.scrollTo({ top: 0, behavior: 'smooth' });
        } else {
            messageDiv.className = 'message error';
            messageDiv.textContent = data.message || 'Error submitting incident. Please try again.';
            messageDiv.style.display = 'block';
        }
    } catch (error) {
        console.error('Error:', error);
        messageDiv.className = 'message error';
        messageDiv.textContent = 'Error connecting to server. Please check your connection and try again.';
        messageDiv.style.display = 'block';
    } finally {
        submitBtn.textContent = originalText;
        submitBtn.disabled = false;
    }
});


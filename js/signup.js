import { 
    auth, 
    createUserWithRole, 
    onAuthStateChanged 
} from './firebase-config.js';

// Check auth state
onAuthStateChanged(auth, (user) => {
    if (user) {
        // User is signed in, redirect to dashboard
        window.location.href = './dashboard.html';
    }
});

document.addEventListener('DOMContentLoaded', function() {
    const signupForm = document.getElementById('signupForm');
    const errorMessage = document.getElementById('error-message');

    signupForm.addEventListener('submit', async function(e) {
        e.preventDefault();
        
        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;
        const confirmPassword = document.getElementById('confirmPassword').value;
        const role = document.getElementById('role').value;
        
        // Validation
        if (!email || !password || !confirmPassword || !role) {
            showError('Please fill in all fields');
            return;
        }

        if (password !== confirmPassword) {
            showError('Passwords do not match');
            return;
        }

        if (password.length < 6) {
            showError('Password must be at least 6 characters long');
            return;
        }

        try {
            // Create user with role using our custom function
            const user = await createUserWithRole(email, password, role);
            
            // Store user info in session storage (temporary)
            sessionStorage.setItem('userEmail', user.email);
            
            // Redirect to dashboard
            window.location.href = './dashboard.html';
        } catch (error) {
            console.error('Signup error:', error);
            let errorMessage = 'Signup failed. Please try again.';
            
            // Handle specific error cases
            switch(error.code) {
                case 'auth/email-already-in-use':
                    errorMessage = 'An account with this email already exists.';
                    break;
                case 'auth/invalid-email':
                    errorMessage = 'Invalid email format.';
                    break;
                case 'auth/weak-password':
                    errorMessage = 'Password is too weak.';
                    break;
                case 'auth/operation-not-allowed':
                    errorMessage = 'Email/password accounts are not enabled.';
                    break;
            }
            
            showError(errorMessage);
        }
    });
});

function showError(message) {
    const errorElement = document.getElementById('error-message');
    if (errorElement) {
        errorElement.textContent = message;
        errorElement.classList.remove('d-none');
    } else {
        alert(message); // Fallback if error element doesn't exist
    }
}

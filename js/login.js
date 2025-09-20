import { 
    auth, 
    signInWithEmailAndPassword, 
    onAuthStateChanged, 
    getUserRole 
} from './firebase-config.js';

// Check auth state
onAuthStateChanged(auth, (user) => {
    console.log('Auth state changed:', user ? 'User signed in' : 'No user');
    if (user) {
        // User is signed in, redirect to dashboard
        console.log('Redirecting to dashboard...');
        window.location.href = './dashboard.html';
    }
});

document.addEventListener('DOMContentLoaded', function() {
    const loginForm = document.getElementById('loginForm');
    const errorMessage = document.getElementById('error-message');

    loginForm.addEventListener('submit', async function(e) {
        e.preventDefault();
        
        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;
        const role = document.getElementById('role').value;
        
        // Simple validation
        if (!email || !password || !role) {
            showError('Please fill in all fields');
            return;
        }

        try {
            console.log('Attempting to sign in with:', email);
            // Sign in with Firebase Authentication
            const userCredential = await signInWithEmailAndPassword(auth, email, password);
            const user = userCredential.user;
            console.log('User signed in:', user.uid);
            
            // Get the user's actual role from Firestore
            console.log('Fetching user role...');
            const userRole = await getUserRole(user.uid);
            console.log('User role:', userRole);
            
            // Verify the user's role matches what they're trying to log in as
            if (userRole !== role) {
                console.log('Role mismatch. Expected:', role, 'Got:', userRole);
                // If roles don't match, sign them out and show error
                await auth.signOut();
                showError('You do not have permission to access this role.');
                return;
            }
            
            // Store minimal user info in session storage
            console.log('Storing user session...');
            sessionStorage.setItem('userEmail', user.email);
            sessionStorage.setItem('userRole', userRole);
            
            // Force a page reload to ensure auth state is properly set
            console.log('Redirecting to dashboard...');
            window.location.href = './dashboard.html';
        } catch (error) {
            console.error('Login error:', error);
            let errorMessage = 'Login failed. Please try again.';
            
            // Handle specific error cases
            switch(error.code) {
                case 'auth/user-not-found':
                    errorMessage = 'No user found with this email.';
                    break;
                case 'auth/wrong-password':
                    errorMessage = 'Incorrect password.';
                    break;
                case 'auth/invalid-email':
                    errorMessage = 'Invalid email format.';
                    break;
                case 'auth/too-many-requests':
                    errorMessage = 'Too many failed attempts. Please try again later.';
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
        errorElement.style.display = 'block';
    } else {
        alert(message); // Fallback if error element doesn't exist
    }
}

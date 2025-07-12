// Simple debug script to test if JavaScript loads
console.log('Debug script loaded successfully!');

document.addEventListener('DOMContentLoaded', () => {
    console.log('DOM Content Loaded - Debug script running');
    
    // Show a simple message
    const body = document.body;
    const debug = document.createElement('div');
    debug.style.cssText = 'position: fixed; top: 10px; right: 10px; background: #4CAF50; color: white; padding: 10px; border-radius: 5px; z-index: 9999; font-family: Arial;';
    debug.textContent = 'JavaScript is working!';
    body.appendChild(debug);
    
    // Test API call
    fetch('/api/project')
        .then(response => response.json())
        .then(data => {
            console.log('API Response:', data);
            debug.innerHTML = `JS ✓ API ✓<br>Project: ${data.config.name}`;
        })
        .catch(error => {
            console.error('API Error:', error);
            debug.innerHTML = 'JS ✓ API ✗';
            debug.style.background = '#f44336';
        });
});

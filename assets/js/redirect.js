// redirect.js
document.addEventListener('DOMContentLoaded', () => {
    const path = window.location.pathname;
    
    // Redirigir si la URL termina con .html
    if (path.endsWith('.html')) {
        const newPath = path.slice(0, -5); // Elimina '.html'
        window.history.replaceState(null, null, newPath);
    }
});

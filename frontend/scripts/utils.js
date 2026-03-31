function setupPasswordToggle(inputId, toggleId) {
    const input = document.getElementById(inputId);
    const icon = document.getElementById(toggleId);

    if (input && icon) {
        icon.addEventListener('click', function() {
            // 1. Alterna o tipo do campo
            const type = input.getAttribute('type') === 'password' ? 'text' : 'password';
            input.setAttribute('type', type);
            
            // 2. Alterna o ícone (bi-eye-slash <-> bi-eye)
            this.classList.toggle('bi-eye-slash');
            this.classList.toggle('bi-eye');
        });
    }
}



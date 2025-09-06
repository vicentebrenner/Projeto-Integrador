document.addEventListener('DOMContentLoaded', function() {
    
    setupPasswordToggle('senha', 'toggleSenha');

    const loginForm = document.querySelector('.loginBox form');
    const emailInput = document.getElementById('email');
    const senhaInput = document.getElementById('senha');
    
    if (loginForm) {
        loginForm.addEventListener('submit', async function(event) {
            event.preventDefault();

            const email = emailInput.value;
            const senha = senhaInput.value;

            try {
                // URL do servidor corrigida para localhost
                const apiUrl = 'http://localhost:3000';
                
                const response = await fetch(`${apiUrl}/login`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ email, senha }),
                });

                const data = await response.json();

                if (!response.ok) {
                    throw new Error(data.error || 'Erro ao fazer login.');
                }
                
                localStorage.setItem('usuarioLogado', JSON.stringify(data.usuario));
                
                window.location.href = 'index.html';

            } catch (error) {
                alert(`Falha no login: ${error.message}`);
            }
        });
    }
});
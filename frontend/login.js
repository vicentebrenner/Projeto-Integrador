document.addEventListener('DOMContentLoaded', function() {
    
    const loginForm = document.querySelector('.loginBox form');
    const emailInput = document.getElementById('email');
    const senhaInput = document.getElementById('senha');
    
    if (loginForm) {
        loginForm.addEventListener('submit', async function(event) {
            event.preventDefault();

            const email = emailInput.value;
            const senha = senhaInput.value;

            try {
                const apiUrl = '/api/auth/login';
                
                const response = await fetch(apiUrl, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ email, senha }),
                });

                if (!response.ok) {
                    const errorMessage = await response.text();
                    throw new Error(errorMessage || 'Erro ao fazer login.');
                }
                
                const usuarioLogado = {
                    nome: "Usuário",
                    email: email
                };
                
                localStorage.setItem('usuarioLogado', JSON.stringify(usuarioLogado));
                
                window.location.href = 'index.html';

            } catch (error) {
                alert(`Falha no login: ${error.message}`);
            }
        });
    }
});
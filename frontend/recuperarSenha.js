// Arquivo: recuperarSenha.js

document.addEventListener('DOMContentLoaded', function() {
    const form = document.querySelector('.loginBox form'); 
    
    if (form) {
        form.setAttribute('id', 'forgotPasswordForm'); 
        
        form.addEventListener('submit', async function(event) {
            event.preventDefault();

            const emailInput = document.getElementById('emailRecuperacao');
            const email = emailInput.value;

            // URL do novo endpoint
            const apiUrl = '/api/auth/forgot-password';

            try {
                const response = await fetch(apiUrl, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ email }),
                });

                const mensagem = await response.text();

                const loginBox = document.querySelector('.loginBox');
                if (loginBox) {
                    loginBox.innerHTML = `
                        <h2>Link Solicitado!</h2>
                        <p class="recoveryInstruction">
                            ${mensagem}
                        </p>
                        <div class="loginLinks">
                           <a href="login.html">Voltar para o Login</a>
                        </div>
                    `;
                }

            } catch (error) {
                console.error('Erro na requisição:', error);
                alert('Não foi possível conectar ao servidor de autenticação.');
            }
        });
    }
});
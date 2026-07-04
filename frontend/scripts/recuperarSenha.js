document.addEventListener('DOMContentLoaded', function() {
    const form = document.querySelector('.loginBox form'); 
    
    if (form) {
        form.setAttribute('id', 'forgotPasswordForm'); 
        
        form.addEventListener('submit', async function(event) {
            event.preventDefault();

            const emailInput = document.getElementById('emailRecuperacao');
            const email = emailInput.value;

            const apiUrl = getApiUrl('/api/auth/forgot-password');

            try {
                const response = await fetch(apiUrl, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ email }),
                });

                const mensagem = await response.text();

                const loginBox = document.querySelector('.loginBox');
                if (loginBox) {
                    // Mantém a mesma estrutura visual do card (seta de voltar, ícone, logo)
                    // em vez de substituir por um HTML "cru" sem estilo.
                    loginBox.innerHTML = `
                        <a href="login.html" class="btn-back" title="Voltar para o Login"><i class="bi bi-arrow-left"></i></a>

                        <div class="icon-lock-container">
                            <i class="fa-solid fa-envelope-circle-check icon-lock"></i>
                        </div>

                        <a href="index.html" class="logoLogin">Music Makers</a>
                        <h2>Link Solicitado!</h2>

                        <p class="recoveryInstruction">
                            ${escapeHtml(mensagem)}
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

document.addEventListener('DOMContentLoaded', function() {
    
    setupPasswordToggle('senha', 'toggleSenha');
    setupPasswordToggle('confirmarSenha', 'toggleConfirmarSenha');

    const form = document.getElementById('formCadastro');
    const nomeInput = document.getElementById('nome');
    const emailInput = document.getElementById('email');
    const senhaInput = document.getElementById('senha');
    const confirmarSenhaInput = document.getElementById('confirmarSenha');
    const mensagemErro = document.getElementById('mensagemErro');
    const loginBox = document.querySelector('.loginBox');

    const mostrarErro = (mensagem) => {
        mensagemErro.textContent = mensagem;
        mensagemErro.classList.add('visivel');
    };

    const limparErro = () => {
        mensagemErro.textContent = '';
        mensagemErro.classList.remove('visivel');
    };

    form.addEventListener('submit', async function(event) {
        event.preventDefault();
        limparErro();

        const nome = nomeInput.value;
        const email = emailInput.value;
        const senha = senhaInput.value;
        const confirmarSenha = confirmarSenhaInput.value;

        if (senha.length < 8) {
            mostrarErro('A senha deve ter no mínimo 8 caracteres.');
            return;
        }
        if (senha !== confirmarSenha) {
            mostrarErro('As senhas não coincidem.');
            return;
        }

        try {
            // URL do servidor corrigida para localhost
            const apiUrl = 'http://localhost:3000';

            const response = await fetch(`${apiUrl}/register`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ nome, email, senha }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Ocorreu um erro ao cadastrar.');
            }

            let countdown = 3;
            const successMessage = `
                <h2>Cadastro Realizado!</h2>
                <p class="recoveryInstruction">
                    Sua conta foi criada com sucesso. Bem-vindo ao Music Makers!
                </p>
                <p style="font-size: 0.8em; color: #888;">
                    Você será redirecionado para a página de login em <span id="countdownTimer">${countdown}</span> segundos...
                </p>
            `;
            loginBox.innerHTML = successMessage;

            const countdownElement = document.getElementById('countdownTimer');
            const intervalId = setInterval(function() {
                countdown--;
                countdownElement.textContent = countdown;
                if (countdown <= 0) {
                    clearInterval(intervalId);
                    window.location.href = 'login.html';
                }
            }, 1000);

        } catch (error) {
            mostrarErro(error.message);
        }
    });
});
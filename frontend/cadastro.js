document.addEventListener('DOMContentLoaded', function() {
    
    setupPasswordToggle('senha', 'toggleSenha');
    setupPasswordToggle('confirmarSenha', 'toggleConfirmarSenha');

    const cadastroStep = document.getElementById('cadastroStep');
    const formCadastro = document.getElementById('formCadastro');
    const nomeInput = document.getElementById('nome');
    const emailInput = document.getElementById('email');
    const senhaInput = document.getElementById('senha');
    const confirmarSenhaInput = document.getElementById('confirmarSenha');
    const mensagemErroCadastro = document.getElementById('mensagemErroCadastro');

    const verificacaoStep = document.getElementById('verificacaoStep');
    const formVerificacao = document.getElementById('formVerificacao');
    const codigoInput = document.getElementById('codigo');
    const userEmailDisplay = document.getElementById('userEmailDisplay');
    const mensagemErroVerificacao = document.getElementById('mensagemErroVerificacao');
    
    const loginBox = document.querySelector('.loginBox');
    const apiUrl = 'http://localhost:3000';

    const mostrarErro = (elemento, mensagem) => {
        elemento.textContent = mensagem;
        elemento.classList.add('visivel');
    };
    
    const limparErro = (elemento) => {
        elemento.textContent = '';
        elemento.classList.remove('visivel');
    };

    formCadastro.addEventListener('submit', async function(event) {
        event.preventDefault();
        limparErro(mensagemErroCadastro);

        const nome = nomeInput.value;
        const email = emailInput.value;
        const senha = senhaInput.value;
        const confirmarSenha = confirmarSenhaInput.value;

        if (senha.length < 8) {
            mostrarErro(mensagemErroCadastro, 'A senha deve ter no mínimo 8 caracteres.');
            return;
        }
        if (senha !== confirmarSenha) {
            mostrarErro(mensagemErroCadastro, 'As senhas não coincidem.');
            return;
        }

        try {
            const response = await fetch(`${apiUrl}/register-request`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ nome, email, senha }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Ocorreu um erro ao iniciar o cadastro.');
            }

            userEmailDisplay.textContent = email;
            cadastroStep.style.display = 'none';
            verificacaoStep.style.display = 'block';

        } catch (error) {
            mostrarErro(mensagemErroCadastro, error.message);
        }
    });

    formVerificacao.addEventListener('submit', async function(event) {
        event.preventDefault();
        limparErro(mensagemErroVerificacao);

        const email = emailInput.value;
        const code = codigoInput.value;

        try {
            const response = await fetch(`${apiUrl}/verify-code`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, code }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Ocorreu um erro ao verificar o código.');
            }

            const successMessage = `
                <h2>Conta Verificada!</h2>
                <p class="recoveryInstruction">
                    Seu cadastro foi concluído com sucesso. Bem-vindo ao Music Makers!
                </p>
                <a href="login.html" class="btnLoginSubmit" style="text-decoration: none; text-align: center; margin-top: 20px;">Fazer Login</a>
            `;
            loginBox.innerHTML = successMessage;

        } catch (error) {
            mostrarErro(mensagemErroVerificacao, error.message);
        }
    });
});
document.addEventListener('DOMContentLoaded', function() {
    const formCadastro = document.getElementById('formCadastro');
    if (!formCadastro) {
        console.error('O formulário de cadastro não foi encontrado.');
        return;
    }

    const nomeInput = document.getElementById('nome');
    const emailInput = document.getElementById('email');
    const senhaInput = document.getElementById('senha');
    const confirmarSenhaInput = document.getElementById('confirmarSenha');
    const mensagemErroCadastro = document.getElementById('mensagemErroCadastro');

    const mostrarErro = (mensagem) => {
        if (mensagemErroCadastro) {
            mensagemErroCadastro.textContent = mensagem;
            mensagemErroCadastro.classList.add('visivel');
        }
    };

    formCadastro.addEventListener('submit', async function(event) {
        event.preventDefault();
        if (mensagemErroCadastro) mensagemErroCadastro.classList.remove('visivel');

        const nome = nomeInput.value;
        const email = emailInput.value;
        const senha = senhaInput.value;
        const confirmarSenha = confirmarSenhaInput.value;

        // Validações no frontend
        if (!nome || !email || !senha || !confirmarSenha) {
            mostrarErro('Por favor, preencha todos os campos.');
            return;
        }
        if (senha !== confirmarSenha) {
            mostrarErro('As senhas não coincidem.');
            return;
        }
        if (senha.length < 6) {
            mostrarErro('A senha deve ter pelo menos 6 caracteres.');
            return;
        }

        try {
            const response = await fetch('/api/auth/register-request', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ nome, email, senha }),
            });

            const mensagem = await response.text();

            if (response.ok) {
                // Se o pré-cadastro for bem-sucedido
                alert("Cadastro realizado com sucesso! " + mensagem); // Ex: "Código de verificação enviado para o seu e-mail."
                
                // Salva o e-mail para usar na página de verificação
                localStorage.setItem('emailParaVerificacao', email);
                
                // Redireciona para a página de verificação de código
                window.location.href = 'verificar.html';
            } else {
                // Se houver erro (Ex: e-mail já cadastrado)
                mostrarErro(mensagem);
            }

        } catch (error) {
            console.error('Erro na requisição de cadastro:', error);
            mostrarErro('Não foi possível conectar ao servidor. Verifique se o backend está rodando.');
        }
    });
});
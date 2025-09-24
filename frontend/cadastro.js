document.addEventListener('DOMContentLoaded', function() {
    // Busca o formulário no HTML
    const formCadastro = document.getElementById('formCadastro');
    if (!formCadastro) {
        console.error('O formulário com id "formCadastro" não foi encontrado.');
        return;
    }
    
    // Busca os campos do formulário
    const nomeInput = document.getElementById('nome');
    const emailInput = document.getElementById('email');
    const senhaInput = document.getElementById('senha');
    const confirmarSenhaInput = document.getElementById('confirmarSenha');
    const mensagemErroCadastro = document.getElementById('mensagemErroCadastro');
    
    // URL da sua API Spring Boot
    const apiUrl = 'http://localhost:8080/api/usuarios';

    // Função para mostrar mensagens de erro no formulário
    const mostrarErro = (mensagem) => {
        if (mensagemErroCadastro) {
            mensagemErroCadastro.textContent = mensagem;
            mensagemErroCadastro.classList.add('visivel');
        }
    };
    
    // Função para limpar mensagens de erro
    const limparErro = () => {
        if (mensagemErroCadastro) {
            mensagemErroCadastro.textContent = '';
            mensagemErroCadastro.classList.remove('visivel');
        }
    };

    // Função que será executada quando o formulário for enviado
    formCadastro.addEventListener('submit', async function(event) {
        event.preventDefault(); // Impede o recarregamento da página
        limparErro();

        // Pega os valores dos campos
        const nome = nomeInput.value;
        const email = emailInput.value;
        const senha = senhaInput.value;
        const confirmarSenha = confirmarSenhaInput.value;

        // Validações básicas no frontend antes de enviar
        if (senha.length < 8) {
            mostrarErro('A senha deve ter no mínimo 8 caracteres.');
            return;
        }
        if (senha !== confirmarSenha) {
            mostrarErro('As senhas não coincidem.');
            return;
        }

        // Tenta fazer a requisição para o backend
        try {
            const response = await fetch(apiUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                // Cria o corpo da requisição com os dados do usuário em formato JSON
                body: JSON.stringify({
                    nome: nome,
                    email: email,
                    senha: senha
                }),
            });

            // Se a resposta do servidor for "201 Created", o cadastro deu certo
            if (response.status === 201) {
                alert('Cadastro realizado com sucesso!');
                // Redireciona para a tela de login
                window.location.href = 'login.html';
            } else {
                // Se der erro, tenta mostrar a mensagem que o servidor enviou
                const data = await response.json();
                mostrarErro(data.message || 'Ocorreu um erro ao realizar o cadastro.');
            }

        } catch (error) {
            // Captura erros de conexão (ex: backend desligado)
            console.error('Erro de conexão:', error);
            mostrarErro('Não foi possível se conectar ao servidor. Tente novamente mais tarde.');
        }
    });

    // Função para o botão de "mostrar/esconder senha" (opcional)
    function setupPasswordToggle(inputId, toggleId) {
        const passwordInput = document.getElementById(inputId);
        const toggleButton = document.getElementById(toggleId);
        if (passwordInput && toggleButton) {
            toggleButton.addEventListener('click', function () {
                const type = passwordInput.getAttribute('type') === 'password' ? 'text' : 'password';
                passwordInput.setAttribute('type', type);
                this.classList.toggle('bi-eye');
            });
        }
    }
    
    setupPasswordToggle('senha', 'toggleSenha');
    setupPasswordToggle('confirmarSenha', 'toggleConfirmarSenha');
});
document.addEventListener('DOMContentLoaded', function() {
    // Funções para mostrar e esconder a senha (se você tiver os botões no HTML)
    // Se não tiver, pode remover estas duas linhas e a função setupPasswordToggle.
    setupPasswordToggle('senha', 'toggleSenha');
    setupPasswordToggle('confirmarSenha', 'toggleConfirmarSenha');

    const formCadastro = document.getElementById('formCadastro');
    const nomeInput = document.getElementById('nome');
    const emailInput = document.getElementById('email');
    const senhaInput = document.getElementById('senha');
    const confirmarSenhaInput = document.getElementById('confirmarSenha');
    const mensagemErroCadastro = document.getElementById('mensagemErroCadastro');

    // URL da sua API Spring Boot (Java)
    const apiUrl = 'http://localhost:8080/api/usuarios';

    // Função auxiliar para exibir mensagens de erro
    const mostrarErro = (elemento, mensagem) => {
        elemento.textContent = mensagem;
        elemento.style.display = 'block'; // Mostra o elemento de erro
    };
    
    // Função auxiliar para limpar mensagens de erro
    const limparErro = (elemento) => {
        elemento.textContent = '';
        elemento.style.display = 'none'; // Esconde o elemento de erro
    };

    // Adiciona o "escutador" para o envio do formulário
    formCadastro.addEventListener('submit', async function(event) {
        // Impede o comportamento padrão do formulário de recarregar a página
        event.preventDefault();
        limparErro(mensagemErroCadastro);

        const nome = nomeInput.value;
        const email = emailInput.value;
        const senha = senhaInput.value;
        const confirmarSenha = confirmarSenhaInput.value;

        // --- Validações no Frontend ---
        if (senha.length < 8) {
            mostrarErro(mensagemErroCadastro, 'A senha deve ter no mínimo 8 caracteres.');
            return;
        }
        if (senha !== confirmarSenha) {
            mostrarErro(mensagemErroCadastro, 'As senhas não coincidem.');
            return;
        }

        // --- Envio dos dados para a API ---
        try {
            const response = await fetch(apiUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                // Converte os dados para o formato JSON que o backend espera
                body: JSON.stringify({
                    nome: nome,
                    email: email,
                    senha: senha
                }),
            });

            // Se a resposta for 201 (Created), o cadastro foi um sucesso
            if (response.status === 201) {
                alert('Cadastro realizado com sucesso!');
                // Redireciona o usuário para a página de login
                window.location.href = 'login.html';
            } else {
                // Se o backend retornar um erro, tenta mostrar a mensagem
                const data = await response.json();
                mostrarErro(mensagemErroCadastro, data.message || 'Ocorreu um erro no cadastro.');
            }
        } catch (error) {
            // Captura erros de conexão (ex: backend desligado)
            console.error('Erro de conexão:', error);
            mostrarErro(mensagemErroCadastro, 'Não foi possível conectar ao servidor. Tente novamente mais tarde.');
        }
    });

    // Função para alternar a visibilidade da senha
    function setupPasswordToggle(inputId, toggleId) {
        const passwordInput = document.getElementById(inputId);
        const toggleButton = document.getElementById(toggleId);

        if (passwordInput && toggleButton) {
            toggleButton.addEventListener('click', function() {
                // Alterna o tipo do input entre 'password' e 'text'
                const type = passwordInput.getAttribute('type') === 'password' ? 'text' : 'password';
                passwordInput.setAttribute('type', type);
                // Alterna o ícone (ex: olho aberto/fechado)
                this.classList.toggle('bi-eye');
                this.classList.toggle('bi-eye-slash');
            });
        }
    }
});
document.addEventListener('DOMContentLoaded', function() {
    
    const formCadastro = document.getElementById('formCadastro');
    if (!formCadastro) {
        console.error('O formulário com id "formCadastro" não foi encontrado no HTML.');
        return;
    }
    
    const nomeInput = document.getElementById('nome');
    const emailInput = document.getElementById('email');
    const senhaInput = document.getElementById('senha');
    const confirmarSenhaInput = document.getElementById('confirmarSenha');
    const mensagemErroCadastro = document.getElementById('mensagemErroCadastro');
    
    // CORREÇÃO: URL da sua API em Java (Spring Boot)
    const apiUrl = 'http://localhost:8080/api/usuarios';

    const mostrarErro = (mensagem) => {
        if (mensagemErroCadastro) {
            mensagemErroCadastro.textContent = mensagem;
            mensagemErroCadastro.classList.add('visivel');
        }
    };
    
    const limparErro = () => {
        if (mensagemErroCadastro) {
            mensagemErroCadastro.textContent = '';
            mensagemErroCadastro.classList.remove('visivel');
        }
    };

    formCadastro.addEventListener('submit', async function(event) {
        event.preventDefault();
        limparErro();

        const nome = nomeInput.value;
        const email = emailInput.value;
        const senha = senhaInput.value;
        const confirmarSenha = confirmarSenhaInput.value;

        if (senha !== confirmarSenha) {
            mostrarErro('As senhas não coincidem.');
            return;
        }

        try {
            const response = await fetch(apiUrl, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ nome, email, senha }),
            });

            if (response.status === 201) { // 201 é o status de "Criado com Sucesso"
                alert('Cadastro realizado com sucesso!');
                window.location.href = 'login.html';
            } else {
                const data = await response.json();
                mostrarErro(data.message || 'Ocorreu um erro ao realizar o cadastro.');
            }
        } catch (error) {
            console.error('Erro de conexão:', error);
            mostrarErro('Não foi possível conectar ao servidor. Verifique se o backend está rodando.');
        }
    });
});
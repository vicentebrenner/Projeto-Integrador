document.addEventListener('DOMContentLoaded', function() {
    const formLogin = document.getElementById('formLogin');
    if (!formLogin) {
        console.error('O formulário de login não foi encontrado.');
        return;
    }

    const emailInput = document.getElementById('email');
    const senhaInput = document.getElementById('senha');
    const erroLogin = document.getElementById('erroLogin');

    // Função para mostrar mensagens de erro
    const mostrarErro = (mensagem) => {
        if (erroLogin) {
            erroLogin.textContent = mensagem;
            erroLogin.classList.add('visivel');
        }
    };

    formLogin.addEventListener('submit', async function(event) {
        event.preventDefault(); // Impede o envio padrão do formulário
        
        // Limpa erros anteriores
        if (erroLogin) erroLogin.classList.remove('visivel');

        const email = emailInput.value;
        const senha = senhaInput.value;

        // Validação simples no frontend
        if (!email || !senha) {
            mostrarErro('Por favor, preencha todos os campos.');
            return;
        }

        try {
            // Faz a requisição para a API de login no backend
            const response = await fetch('/api/auth/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ email, senha }),
            });

            const data = await response.json();

            if (response.ok) {
                // Se o login for bem-sucedido (status 200 OK)
                alert('Login realizado com sucesso!');
                
                // Armazena os dados do usuário e o token no localStorage
                localStorage.setItem('usuarioLogado', JSON.stringify(data.usuario));
                localStorage.setItem('authToken', data.token);

                // Redireciona para a página do dashboard
                window.location.href = 'dashboard.html';

            } else {
                // Se houver erro (status 401, 403, etc.)
                const mensagemErro = data.message || await response.text(); // Pega a mensagem de erro do backend
                mostrarErro(mensagemErro);
            }

        } catch (error) {
            // Erro de rede ou conexão
            console.error('Erro na requisição de login:', error);
            mostrarErro('Não foi possível conectar ao servidor. Verifique sua conexão ou se o backend está rodando.');
        }
    });
});
document.addEventListener('DOMContentLoaded', function() {
    
    // --- CÓDIGO DO OLHINHO ---
    // Verifica se a função existe (carregada do utils.js) e a executa
    if (typeof setupPasswordToggle === 'function') {
        setupPasswordToggle('senha', 'toggleSenha');
    }

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
            const response = await fetch('http://18.229.124.123:8080/api/auth/login', {
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
                
                // --- CORREÇÃO AQUI ---
                // O backend retorna dados soltos (token, id, nome, role).
                // Precisamos criar o objeto 'usuario' manualmente para salvar no localStorage.
                const usuarioParaSalvar = {
                    id: data.id,
                    nome: data.nome,
                    tipoUsuario: data.role
                };

                localStorage.setItem('usuarioLogado', JSON.stringify(usuarioParaSalvar));
                localStorage.setItem('authToken', data.token);

                // Redireciona para a página do dashboard
                window.location.href = 'dashboard.html';

            } else {
                // Se houver erro (status 401, 403, etc.)
                // Tenta pegar a mensagem do JSON ou usa o texto puro da resposta
                const mensagemErro = data.message || data || 'Erro ao realizar login'; 
                mostrarErro(mensagemErro);
            }

        } catch (error) {
            // Erro de rede ou conexão (ex: backend desligado)
            console.error('Erro na requisição de login:', error);
            mostrarErro('Não foi possível conectar ao servidor. Verifique se o backend está rodando.');
        }
    });
});
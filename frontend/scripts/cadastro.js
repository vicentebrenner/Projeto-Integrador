document.addEventListener('DOMContentLoaded', function() {

    // --- CÓDIGO DO OLHINHO (NOVO) ---
    // Ativa a função para o campo de Senha e para o Confirmar Senha
    if (typeof setupPasswordToggle === 'function') {
        setupPasswordToggle('senha', 'toggleSenha');
        setupPasswordToggle('confirmarSenha', 'toggleConfirmarSenha');
    }
    // --------------------------------

    // --- LÓGICA DAS ABAS (Mantida) ---
    const tabs = document.querySelectorAll('.tab-link');
    const contents = document.querySelectorAll('.tab-content');
    tabs.forEach(tab => {
        tab.addEventListener('click', function() {
            tabs.forEach(item => item.classList.remove('ativo'));
            contents.forEach(item => item.classList.remove('ativo'));
            const target = document.getElementById(this.dataset.tab);
            this.classList.add('ativo');
            if (target) target.classList.add('ativo');
        });
    });

    // --- DADOS DE EXEMPLO (Mantido) ---
    // ... (Seu código original de dados aqui, se houver) ...
    // Vou incluir a parte do formulário de cadastro que é o principal desta página

    const formCadastro = document.getElementById('formCadastro');
    const nomeInput = document.getElementById('nome');
    const emailInput = document.getElementById('email');
    const senhaInput = document.getElementById('senha');
    const confirmarSenhaInput = document.getElementById('confirmarSenha');
    const erroGeral = document.getElementById('mensagemErroCadastro');

    // Função auxiliar para mostrar erro
    const mostrarErro = (elementoId, mensagem) => {
        const el = document.getElementById(elementoId);
        if (el) {
            el.textContent = mensagem;
            el.classList.add('visivel');
        }
    };
    
    const limparErros = () => {
        document.querySelectorAll('.mensagemErro').forEach(el => {
            el.textContent = '';
            el.classList.remove('visivel');
        });
    };

    if (formCadastro) {
        formCadastro.addEventListener('submit', async function(event) {
            event.preventDefault();
            limparErros();

            const nome = nomeInput.value.trim();
            const email = emailInput.value.trim();
            const senha = senhaInput.value;
            const confirmarSenha = confirmarSenhaInput.value;
            let temErro = false;

            // Validações básicas
            if (!nome) { mostrarErro('erroNome', 'Nome é obrigatório.'); temErro = true; }
            if (!email) { mostrarErro('erroEmail', 'E-mail é obrigatório.'); temErro = true; }
            if (senha.length < 6) { mostrarErro('erroSenha', 'A senha deve ter no mínimo 6 caracteres.'); temErro = true; }
            if (senha !== confirmarSenha) { mostrarErro('erroConfirmarSenha', 'As senhas não coincidem.'); temErro = true; }

            if (temErro) return;

            try {
                const response = await fetch('http://18.229.124.123:8080/api/auth/register', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ nome, email, senha })
                });

                if (response.ok) {
                    alert('Cadastro realizado com sucesso! Faça login.');
                    window.location.href = 'login.html';
                } else {
                    const data = await response.json();
                    const msg = data.message || 'Erro ao cadastrar.';
                    mostrarErro('mensagemErroCadastro', msg);
                }
            } catch (error) {
                console.error('Erro de conexão:', error);
                mostrarErro('mensagemErroCadastro', 'Erro de conexão com o servidor.');
            }
        });
    }
});
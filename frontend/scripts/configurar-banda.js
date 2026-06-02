document.addEventListener('DOMContentLoaded', function () {
    const formBanda = document.getElementById('formConfigurarBanda');
    const erroSetup = document.getElementById('erroSetup');
    const btnSalvar = document.getElementById('btnSalvarBanda');

    // Retrieve logged in user and token
    const usuarioLogado = JSON.parse(localStorage.getItem('usuarioLogado'));
    const authToken = localStorage.getItem('authToken');

    // If not authenticated or not a gestor, redirect to login
    if (!usuarioLogado || !authToken) {
        window.location.href = 'login.html';
        return;
    }

    if (usuarioLogado.tipoUsuario !== 'GESTOR' && usuarioLogado.gestor !== true) {
        window.location.href = 'musico.html';
        return;
    }

    // If the gestor already has a band configured, bypass setup and redirect to banda.html
    if (usuarioLogado.bandaId) {
        window.location.href = 'banda.html';
        return;
    }

    function showSnackbar(message) {
        const snackbar = document.getElementById("snackbar");
        if (snackbar) {
            snackbar.textContent = message;
            snackbar.className = "show";
            setTimeout(() => { snackbar.className = snackbar.className.replace("show", ""); }, 3000);
        }
    }

    const mostrarErro = (mensagem) => {
        if (erroSetup) {
            erroSetup.textContent = mensagem;
            erroSetup.classList.add('visivel');
        }
    };

    formBanda.addEventListener('submit', async function (event) {
        event.preventDefault();

        if (erroSetup) erroSetup.classList.remove('visivel');

        const nome = document.getElementById('nomeBanda').value.trim();
        const generoMusical = document.getElementById('generoBanda').value;
        const localizacao = document.getElementById('localizacaoBanda').value.trim();
        const contato = document.getElementById('contatoBanda').value.trim();
        const descricao = document.getElementById('descricaoBanda').value.trim();

        if (!nome || !generoMusical || !localizacao || !contato) {
            mostrarErro('Por favor, preencha todos os campos obrigatórios (*).');
            return;
        }

        const originalBtnText = btnSalvar.innerHTML;
        btnSalvar.disabled = true;
        btnSalvar.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Salvando Banda...';

        try {
            // POST request to create the band
            const response = await fetch(getApiUrl(`/api/bandas?idUsuario=${usuarioLogado.id}`), {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${authToken}`
                },
                body: JSON.stringify({
                    nome: nome,
                    generoMusical: generoMusical,
                    descricao: `${descricao}\n\nLocal: ${localizacao} | Contato: ${contato}`
                })
            });

            if (response.ok) {
                const data = await response.json();

                // Update usuarioLogado with the newly created bandaId
                usuarioLogado.bandaId = data.id;
                localStorage.setItem('usuarioLogado', JSON.stringify(usuarioLogado));
                localStorage.setItem('primeiroAcesso', 'true'); // Enable welcome modal on next load

                showSnackbar('Banda configurada com sucesso!');
                setTimeout(() => {
                    window.location.href = 'banda.html';
                }, 1500);
            } else {
                let errData;
                try {
                    errData = await response.json();
                } catch(e) {
                    errData = { message: 'Erro desconhecido ao salvar banda.' };
                }
                mostrarErro(errData.message || 'Não foi possível cadastrar a banda.');
            }
        } catch (error) {
            console.error('Erro na criação de banda:', error);
            mostrarErro('Erro ao conectar com o servidor. Tente novamente mais tarde.');
        } finally {
            btnSalvar.disabled = false;
            btnSalvar.innerHTML = originalBtnText;
        }
    });
});

document.addEventListener('DOMContentLoaded', function() {

    // --- INÍCIO DA MUDANÇA (PASSO 4) ---

    // 1. Verifica se a "Ponte" (Android) existe
    if (typeof Android === "undefined" || typeof Android.getNomeUsuario !== "function") {
        alert("Erro fatal: Interface nativa (Android) não encontrada.");
        return;
    }

    // 2. Busca o nome do usuário direto do Kotlin (nativo)
    const nomeUsuario = Android.getNomeUsuario();
    if (!nomeUsuario) {
        alert("Sessão inválida. Por favor, reinicie o app.");
        return;
    }
    // (O bloco de 'modo de teste' e verificação de localStorage foi removido)

    // --- FIM DA MUDANÇA (PASSO 4) ---


    // --- DADOS SIMULADOS ---
    let dadosPerfil = {
        nome: nomeUsuario, // <-- MUDANÇA: Usa o nome vindo da Ponte
        local: "Porto Alegre/RS",
        instrumentos: "Guitarra e Vocal",
        bio: "Músico experiente procurando banda de rock autoral. Minhas principais influências são Foo Fighters, QOTSA e Audioslave. Aberto para ensaios 2x por semana.",
        videos: [
            { id: 1, titulo: "Solo de Guitarra (Cover)", url: "https://www.youtube.com/watch?v=dQw4w9WgXcQ" },
            { id: 2, titulo: "Performance Vocal Acústica", url: "https://www.youtube.com/watch?v=L_jWHffIx5E" }
        ]
    };

    // --- LÓGICA DAS ABAS ---
    // (Seu código de 'tabs' continua aqui, sem alterações)
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

    // --- FUNÇÃO DE NOTIFICAÇÃO (Snackbar) ---
    // (Seu código de 'showSnackbar' continua aqui, sem alterações)
    function showSnackbar(message) {
        const snackbar = document.getElementById("snackbar");
        if (snackbar) {
            snackbar.textContent = message;
            snackbar.className = "show";
            setTimeout(() => { snackbar.className = snackbar.className.replace("show", ""); }, 3000);
        } else {
            console.warn("Elemento snackbar não encontrado!");
        }
    }

    // --- FUNÇÕES DE RENDERIZAÇÃO ---

    // Carrega dados do perfil no formulário
    // (Seu código de 'carregarPerfil' continua aqui, sem alterações)
    function carregarPerfil() {
        document.getElementById('perfilNome').value = dadosPerfil.nome;
        document.getElementById('perfilLocal').value = dadosPerfil.local || '';
        document.getElementById('perfilInstrumentos').value = dadosPerfil.instrumentos || '';
        document.getElementById('perfilBio').value = dadosPerfil.bio || '';
    }

    // Carrega os vídeos no portfólio
    // (Seu código de 'carregarPortfolio' continua aqui, sem alterações)
    function carregarPortfolio() {
        const grid = document.getElementById('portfolioGrid');
        if (!grid) return;
        grid.innerHTML = ''; // Limpa o grid

        if (dadosPerfil.videos.length === 0) {
            grid.innerHTML = '<p class="loading-ai">Nenhum vídeo no portfólio. Adicione seu primeiro vídeo!</p>';
            return;
        }

        dadosPerfil.videos.forEach((video, index) => {
            const videoId = extrairVideoID(video.url);
            if (!videoId) return; // Pula se a URL for inválida

            const videoEmbedUrl = `https://www.youtube.com/embed/${videoId}`;

            const item = document.createElement('div');
            item.className = 'video-card';
            item.innerHTML = `
                <div class="video-embed">
                    <iframe
                        src="${videoEmbedUrl}"
                        title="${video.titulo}"
                        frameborder="0"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowfullscreen>
                    </iframe>
                </div>
                <h4>${video.titulo}</h4>
                <div class="video-actions">
                    <button class="btn-icon btn-remover" data-tipo="video" data-index="${index}" title="Remover vídeo">
                        <i class="fas fa-trash-alt"></i>
                    </button>
                </div>
            `;
            grid.appendChild(item);
        });
    }

    // Função mágica para extrair o ID de um link do YouTube
    // (Seu código de 'extrairVideoID' continua aqui, sem alterações)
    function extrairVideoID(url) {
        try {
            const urlObj = new URL(url);
            if (urlObj.hostname === 'youtu.be') {
                return urlObj.pathname.slice(1);
            }
            if (urlObj.hostname.includes('youtube.com')) {
                return urlObj.searchParams.get('v');
            }
        } catch (e) {
            console.error("URL do YouTube inválida:", url);
            return null;
        }
        return null;
    }

    // --- CONTROLE DOS MODAIS ---
    // (Seu código de 'setupModal' e 'setupModal(videoModal...)' continua aqui, sem alterações)
    function setupModal(modalId, abrirBtnId, formId, onSave) {
        const modal = document.getElementById(modalId);
        const abrirBtn = document.getElementById(abrirBtnId);
        const form = document.getElementById(formId);
        const closeButton = modal ? modal.querySelector('.close-button') : null;

        if (modal && abrirBtn && closeButton && form) {
            abrirBtn.onclick = () => { modal.style.display = "block"; };
            const closeModal = () => { modal.style.display = "none"; form.reset(); };
            closeButton.onclick = closeModal;
            window.addEventListener('click', (event) => {
                if (event.target == modal) {
                    closeModal();
                }
            });

            form.addEventListener('submit', function(e) {
                e.preventDefault();
                onSave(this);
                closeModal(); // Fecha o modal após salvar
            });
        } else {
             console.error(`Erro ao configurar o modal: ${modalId}, ${abrirBtnId}, ${formId}`);
        }
    }

    // Configura o modal de Adicionar Vídeo
    setupModal('videoModal', 'abrirModalVideoBtn', 'formAdicionarVideo', (form) => {
        const titulo = form.videoTitulo.value;
        const url = form.videoUrl.value;
        const videoId = extrairVideoID(url);

        if (!videoId) {
            showSnackbar("Erro: URL do YouTube inválida ou não suportada.");
            return;
        }

        // Adiciona o novo vídeo (simulação)
        dadosPerfil.videos.push({
            id: new Date().getTime(), // ID único
            titulo: titulo,
            url: url
        });

        carregarPortfolio(); // Atualiza a lista de vídeos
        showSnackbar("Vídeo adicionado ao portfólio!");
    });


    // --- EVENTOS DE FORMULÁRIO E CLIQUES ---

    // Salvar o formulário de Perfil
    // (Seu código de 'formPerfil' continua aqui, sem alterações)
    const formPerfil = document.getElementById('formPerfilMusico');
    if (formPerfil) {
        formPerfil.addEventListener('submit', (e) => {
            e.preventDefault();
            // Simula o salvamento
            dadosPerfil.local = document.getElementById('perfilLocal').value;
            dadosPerfil.instrumentos = document.getElementById('perfilInstrumentos').value;
            dadosPerfil.bio = document.getElementById('perfilBio').value;

            showSnackbar("Perfil salvo com sucesso!");
            // Em um app real, enviaria 'dadosPerfil' para o backend
            // const token = Android.getAuthToken();
            // fetch('/api/perfil-musico', {
            //    method: 'POST',
            //    headers: { 'Authorization': `Bearer ${token}` },
            //    body: JSON.stringify(dadosPerfil)
            // });
        });
    }

    // Delegação de eventos para botões de remover vídeo
    // (Seu código de 'document.body.addEventListener' continua aqui, sem alterações)
    document.body.addEventListener('click', function(e) {
        const btnRemover = e.target.closest('.btn-remover');
        if (btnRemover && btnRemover.dataset.tipo === 'video') {
            const index = parseInt(btnRemover.dataset.index);
            if (!isNaN(index) && index < dadosPerfil.videos.length) {

                // Confirmação antes de remover
                if (confirm(`Tem certeza que deseja remover o vídeo "${dadosPerfil.videos[index].titulo}"?`)) {
                    dadosPerfil.videos.splice(index, 1); // Remove o vídeo
                    carregarPortfolio(); // Atualiza a tela
                    showSnackbar("Vídeo removido.");
                }
            }
        }
    });

    // --- INICIALIZAÇÃO ---
    carregarPerfil();
    carregarPortfolio();

});
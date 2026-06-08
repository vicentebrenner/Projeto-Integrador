document.addEventListener('DOMContentLoaded', function() {

    // --- VERIFICAÇÃO DE LOGIN ---
    const usuarioLogadoString = localStorage.getItem('usuarioLogado');
    const authToken = localStorage.getItem('authToken');

    if (!usuarioLogadoString || !authToken) {
        window.location.href = 'login.html';
        return;
    }

    const usuarioLogado = JSON.parse(usuarioLogadoString);
    if (usuarioLogado.tipoUsuario !== 'MUSICO') {
        window.location.href = 'banda.html'; // Se for gestor, vai para a banda
        return;
    }

    // Se o músico já tiver banda vinculada, redireciona para banda.html
    if (usuarioLogado.bandaId) {
        window.location.href = 'banda.html';
        return;
    }

    // Preenche cabeçalho
    const headerNome = document.getElementById('headerNomeUsuario');
    if (headerNome) headerNome.textContent = usuarioLogado.nome;
    const perfilNomeInput = document.getElementById('perfilNome');
    if (perfilNomeInput) perfilNomeInput.value = usuarioLogado.nome;

    // --- VARIÁVEIS DE ESTADO ---
    let dadosPerfil = {
        instrumentosPrincipais: "",
        biografia: "",
        linkVideos: "" // Vamos guardar como JSON stringificado ou CSV
    };
    let convitesPendentes = [];

    // --- ABAS ---
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

    // --- NOTIFICAÇÕES (SNACKBAR) ---
    function showSnackbar(message) {
        const snackbar = document.getElementById("snackbar");
        if (snackbar) {
            snackbar.textContent = message;
            snackbar.className = "show";
            setTimeout(() => { snackbar.className = snackbar.className.replace("show", ""); }, 3000);
        } else {
            alert(message);
        }
    }

    // --- LOGOUT ---
    const logoutBtn = document.getElementById('btnLogoutHeader');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', function(e) {
            e.preventDefault();
            localStorage.removeItem('usuarioLogado');
            localStorage.removeItem('authToken');
            localStorage.removeItem('primeiroAcesso');
            window.location.href = 'login.html';
        });
    }

    // --- BUSCA PERFIL DO BANCO ---
    async function carregarPerfil() {
        try {
            const res = await fetch(getApiUrl(`/api/musicos/usuario/${usuarioLogado.id}`), {
                headers: { 'Authorization': `Bearer ${authToken}` }
            });
            if (res.ok) {
                const data = await res.json();
                dadosPerfil.instrumentosPrincipais = data.instrumentosPrincipais || "";
                dadosPerfil.biografia = data.biografia || "";
                dadosPerfil.linkVideos = data.linkVideos || "";

                // document.getElementById('perfilLocal').value = ""; // Local opcional
                const selectEstado = document.getElementById('perfilEstado');
                const selectCidade = document.getElementById('perfilCidade');
                if (selectEstado) selectEstado.value = "";
                if (selectCidade) selectCidade.innerHTML = '<option value="">Selecione o estado primeiro...</option>';
                document.getElementById('perfilInstrumentos').value = dadosPerfil.instrumentosPrincipais;
                document.getElementById('perfilBio').value = dadosPerfil.biografia;

                renderPortfolio();
            }
        } catch (e) {
            console.error("Erro ao carregar perfil:", e);
        }
    }

    // --- SALVAR PERFIL NO BANCO ---
    const formPerfil = document.getElementById('formPerfilMusico');
    if (formPerfil) {
        formPerfil.addEventListener('submit', async function(e) {
            e.preventDefault();
            const instrumentos = document.getElementById('perfilInstrumentos').value;
            const bio = document.getElementById('perfilBio').value;

            try {
                const res = await fetch(getApiUrl(`/api/musicos/usuario/${usuarioLogado.id}`), {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${authToken}`
                    },
                    body: JSON.stringify({
                        instrumentosPrincipais: instrumentos,
                        biografia: bio,
                        linkVideos: dadosPerfil.linkVideos
                    })
                });

                if (res.ok) {
                    showSnackbar("Informações salvas com sucesso!");
                    dadosPerfil.instrumentosPrincipais = instrumentos;
                    dadosPerfil.biografia = bio;
                } else {
                    showSnackbar("Erro ao salvar informações.");
                }
            } catch (error) {
                console.error("Erro ao salvar perfil:", error);
                showSnackbar("Erro de conexão com o servidor.");
            }
        });
    }

    // --- PORTFÓLIO DE VÍDEOS ---
    function parseVideos() {
        if (!dadosPerfil.linkVideos) return [];
        try {
            return JSON.parse(dadosPerfil.linkVideos);
        } catch (e) {
            return [];
        }
    }

    function saveVideos(videosList) {
        dadosPerfil.linkVideos = JSON.stringify(videosList);
        // Salva automaticamente no banco
        fetch(getApiUrl(`/api/musicos/usuario/${usuarioLogado.id}`), {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${authToken}`
            },
            body: JSON.stringify({
                instrumentosPrincipais: dadosPerfil.instrumentosPrincipais,
                biografia: dadosPerfil.biografia,
                linkVideos: dadosPerfil.linkVideos
            })
        }).then(res => {
            if (res.ok) {
                renderPortfolio();
            } else {
                showSnackbar("Erro ao salvar vídeo no portfólio.");
            }
        }).catch(err => {
            console.error("Erro ao salvar portfólio:", err);
        });
    }

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
            return null;
        }
        return null;
    }

    function renderPortfolio() {
        const grid = document.getElementById('portfolioGrid');
        if (!grid) return;
        grid.innerHTML = '';

        const list = parseVideos();
        if (list.length === 0) {
            grid.innerHTML = '<p style="color: var(--cor-texto-claro); grid-column: 1/-1; text-align: center;">Nenhum vídeo no portfólio. Adicione seu primeiro vídeo!</p>';
            return;
        }

        list.forEach((video, index) => {
            const videoId = extrairVideoID(video.url);
            if (!videoId) return;

            const videoEmbedUrl = `https://www.youtube.com/embed/${videoId}`;
            const item = document.createElement('div');
            item.className = 'video-card';
            item.innerHTML = `
                <div class="video-embed">
                    <iframe src="${videoEmbedUrl}" title="${video.titulo}" frameborder="0" allowfullscreen></iframe>
                </div>
                <h4 style="margin-top: 10px; font-weight:600;">${video.titulo}</h4>
                <div class="video-actions" style="margin-top: 5px; display: flex; justify-content: flex-end;">
                    <button class="btn-icon btn-remover-video" data-index="${index}" title="Remover vídeo" style="background: none; border: none; color: #ff6b6b; cursor: pointer;">
                        <i class="fas fa-trash-alt"></i>
                    </button>
                </div>
            `;
            grid.appendChild(item);
        });
    }

    // Modal Adicionar Vídeo
    const videoModal = document.getElementById('videoModal');
    const abrirVideoBtn = document.getElementById('abrirModalVideoBtn');
    const closeBtn = videoModal ? videoModal.querySelector('.close-button') : null;
    const formVideo = document.getElementById('formAdicionarVideo');

    if (abrirVideoBtn && videoModal && closeBtn) {
        abrirVideoBtn.onclick = () => videoModal.style.display = "block";
        const fechar = () => { videoModal.style.display = "none"; formVideo.reset(); };
        closeBtn.onclick = fechar;
        window.onclick = (e) => { if (e.target === videoModal) fechar(); };

        formVideo.onsubmit = (e) => {
            e.preventDefault();
            const titulo = formVideo.videoTitulo.value;
            const url = formVideo.videoUrl.value;
            const videoId = extrairVideoID(url);

            if (!videoId) {
                showSnackbar("URL do YouTube inválida.");
                return;
            }

            const list = parseVideos();
            list.push({ titulo, url });
            saveVideos(list);
            fechar();
            showSnackbar("Vídeo adicionado ao portfólio!");
        };
    }

    // Remover vídeo
    document.body.addEventListener('click', function(e) {
        const btn = e.target.closest('.btn-remover-video');
        if (btn) {
            const index = parseInt(btn.dataset.index);
            if (confirm("Tem certeza que deseja remover este vídeo?")) {
                const list = parseVideos();
                list.splice(index, 1);
                saveVideos(list);
                showSnackbar("Vídeo removido.");
            }
        }
    });


    // --- CONVITES (FASE 1 E 4) ---
    async function carregarConvites() {
        try {
            const res = await fetch(getApiUrl(`/api/convites/pendentes?usuarioId=${usuarioLogado.id}`), {
                headers: { 'Authorization': `Bearer ${authToken}` }
            });
            if (res.ok) {
                convitesPendentes = await res.json();
                renderConvites();
                renderSino();
            }
        } catch (e) {
            console.error("Erro ao carregar convites:", e);
        }
    }

    function renderConvites() {
        const container = document.getElementById('listaConvites');
        if (!container) return;

        if (convitesPendentes.length === 0) {
            container.innerHTML = `<p style="text-align: center; color: var(--cor-texto-claro); padding: 40px 0;">Você não possui convites de bandas pendentes no momento.</p>`;
            return;
        }

        container.innerHTML = '';
        convitesPendentes.forEach(c => {
            const card = document.createElement('div');
            card.className = 'convite-card';
            card.style = "background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.1); border-radius: 8px; padding: 20px; margin-bottom: 15px; display: flex; justify-content: space-between; align-items: center; gap: 15px;";
            
            const dataEnvio = new Date(c.dataEnvio).toLocaleDateString('pt-BR');

            card.innerHTML = `
                <div>
                    <h3 style="color: var(--cor-secundaria); font-weight: 700; margin-bottom: 5px;">${c.banda.nome}</h3>
                    <p style="font-size: 0.9em; margin-bottom: 5px;"><strong>Gênero:</strong> ${c.banda.generoMusical || 'Não informado'}</p>
                    <p style="font-size: 0.9em; margin-bottom: 5px; color: var(--cor-texto-claro);">${c.banda.descricao || 'Sem descrição.'}</p>
                    <small style="color: rgba(255,255,255,0.4);">Convidado por: ${c.usuarioGestor.nome} em ${dataEnvio}</small>
                </div>
                <div style="display: flex; gap: 10px; shrink: 0;">
                    <button class="btn-adicionar btn-aceitar-convite" data-id="${c.id}" style="background: #10b981; padding: 10px 15px; font-size:0.9em; font-weight:600;">Aceitar</button>
                    <button class="btn-remover btn-recusar-convite" data-id="${c.id}" style="background: #ef4444; border:none; padding: 10px 15px; font-size:0.9em; color:#fff; border-radius:6px; cursor:pointer; font-weight:600;">Recusar</button>
                </div>
            `;
            container.appendChild(card);
        });
    }

    // Aceitar / Recusar Convite
    document.body.addEventListener('click', async function(e) {
        const acceptBtn = e.target.closest('.btn-aceitar-convite');
        const refuseBtn = e.target.closest('.btn-recusar-convite');

        if (acceptBtn) {
            const inviteId = acceptBtn.dataset.id;
            try {
                const res = await fetch(getApiUrl(`/api/convites/${inviteId}/aceitar?usuarioId=${usuarioLogado.id}`), {
                    method: 'PUT',
                    headers: { 'Authorization': `Bearer ${authToken}` }
                });
                if (res.ok) {
                    const data = await res.json();
                    
                    // Atualiza localStorage
                    usuarioLogado.membroId = data.membroId;
                    usuarioLogado.bandaId = data.bandaId;
                    usuarioLogado.gestor = data.gestor;
                    localStorage.setItem('usuarioLogado', JSON.stringify(usuarioLogado));

                    showSuccessPopup("Bem-vindo à banda! Redirecionando para o painel...", () => {
                        window.location.href = 'banda.html';
                    });
                } else {
                    showSnackbar("Erro ao aceitar convite.");
                }
            } catch (err) {
                console.error("Erro ao aceitar convite:", err);
            }
        }

        if (refuseBtn) {
            const inviteId = refuseBtn.dataset.id;
            if (confirm("Deseja realmente recusar este convite?")) {
                try {
                    const res = await fetch(getApiUrl(`/api/convites/${inviteId}/recusar?usuarioId=${usuarioLogado.id}`), {
                        method: 'PUT',
                        headers: { 'Authorization': `Bearer ${authToken}` }
                    });
                    if (res.ok) {
                        showSnackbar("Convite recusado com sucesso.");
                        carregarConvites();
                    } else {
                        showSnackbar("Erro ao recusar convite.");
                    }
                } catch (err) {
                    console.error("Erro ao recusar convite:", err);
                }
            }
        }
    });

    // --- SINO DE NOTIFICAÇÕES (FASE 4) ---
    const notifBell = document.getElementById('notifBell');
    const notifDropdown = document.getElementById('notifDropdown');
    const notifBadge = document.getElementById('notifBadge');
    const tabBadge = document.getElementById('tabBadgeConvites');
    const notifList = document.getElementById('notifDropdownList');

    if (notifBell && notifDropdown) {
        notifBell.addEventListener('click', function(e) {
            e.stopPropagation();
            notifDropdown.classList.toggle('show');
        });

        document.addEventListener('click', function() {
            notifDropdown.classList.remove('show');
        });
    }

    function renderSino() {
        const count = convitesPendentes.length;
        
        // Badge do Sino
        if (notifBadge) {
            if (count > 0) {
                notifBadge.textContent = count;
                notifBadge.style.display = 'block';
            } else {
                notifBadge.style.display = 'none';
            }
        }

        // Badge da Tab
        if (tabBadge) {
            if (count > 0) {
                tabBadge.textContent = count;
                tabBadge.style.display = 'inline-block';
            } else {
                tabBadge.style.display = 'none';
            }
        }

        // Listagem no Dropdown
        if (notifList) {
            if (count === 0) {
                notifList.innerHTML = `<p class="notif-empty">Nenhum convite pendente</p>`;
                return;
            }

            notifList.innerHTML = '';
            convitesPendentes.forEach(c => {
                const row = document.createElement('div');
                row.className = 'notif-item';
                row.style = "padding: 10px 15px; border-bottom: 1px solid rgba(255,255,255,0.05); cursor: pointer;";
                row.innerHTML = `
                    <div style="font-weight: 600; color: var(--cor-secundaria);">${c.banda.nome}</div>
                    <div style="font-size: 0.8em; color: var(--cor-texto-claro);">Convidou você para entrar na banda!</div>
                `;
                row.onclick = () => {
                    // Clica na tab de convites para abrir
                    const tabBtn = document.querySelector('[data-tab="convites"]');
                    if (tabBtn) tabBtn.click();
                };
                notifList.appendChild(row);
            });
        }
    }

    // --- POLLING LEVE (30 segundos) ---
    setInterval(carregarConvites, 30000);

    // --- INICIALIZAÇÃO ---
    carregarPerfil();
    carregarConvites();

    // --- LÓGICA DE ESTADOS E CIDADES (IBGE) ---
    const selectEstado = document.getElementById('perfilEstado');
    const selectCidade = document.getElementById('perfilCidade');

    async function carregarEstados() {
        if (!selectEstado) return;
        try {
            const res = await fetch('https://servicodados.ibge.gov.br/api/v1/localidades/estados?orderBy=nome');
            const estados = await res.json();
            estados.forEach(uf => {
                const option = document.createElement('option');
                option.value = uf.sigla;
                option.textContent = uf.nome;
                selectEstado.appendChild(option);
            });
        } catch (error) {
            console.error('Erro ao carregar estados:', error);
        }
    }

    async function carregarCidades(uf) {
        if (!selectCidade || !uf) return;
        selectCidade.innerHTML = '<option value="">Carregando...</option>';
        selectCidade.disabled = true;
        try {
            const res = await fetch(`https://servicodados.ibge.gov.br/api/v1/localidades/estados/${uf}/municipios?orderBy=nome`);
            const cidades = await res.json();
            selectCidade.innerHTML = '<option value="">Selecione a cidade...</option>';
            cidades.forEach(cidade => {
                const option = document.createElement('option');
                option.value = cidade.nome;
                option.textContent = cidade.nome;
                selectCidade.appendChild(option);
            });
            selectCidade.disabled = false;
        } catch (error) {
            console.error('Erro ao carregar cidades:', error);
            selectCidade.innerHTML = '<option value="">Erro ao carregar</option>';
        }
    }

    if (selectEstado) {
        selectEstado.addEventListener('change', (e) => {
            const uf = e.target.value;
            if (uf) {
                carregarCidades(uf);
            } else {
                selectCidade.innerHTML = '<option value="">Selecione o estado primeiro...</option>';
                selectCidade.disabled = true;
            }
        });
        carregarEstados();
    }

});

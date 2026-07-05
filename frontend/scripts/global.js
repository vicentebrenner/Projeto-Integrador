document.addEventListener('DOMContentLoaded', function() {
    const menuPrincipalUl = document.querySelector('.menuPrincipal ul');
    const usuarioLogado = parseJsonSeguro(localStorage.getItem('usuarioLogado'));

    if (usuarioLogado && menuPrincipalUl) {
        const btnLoginAntigo = document.querySelector('.btnLogin');
        if (btnLoginAntigo) {
            btnLoginAntigo.parentElement.remove();
        }

        const nome = usuarioLogado.nome || '';
        let inicial = '?';
        if (nome) {
            const parts = nome.trim().split(" ");
            if (parts.length === 1) {
                inicial = parts[0].substring(0, 2).toUpperCase();
            } else {
                inicial = (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
            }
        }
        // Fonte de verdade da role: claim assinado do JWT, não o localStorage (forjável via DevTools).
        // localStorage.tipoUsuario serve só de fallback cosmético caso o token ainda não tenha sido decodificado.
        const tipoUsuario = getTipoUsuarioSeguro() || usuarioLogado.tipoUsuario || 'MUSICO';

        const perfilLi = document.createElement('li');
        perfilLi.classList.add('perfil-container');

        const linkPerfil = tipoUsuario === 'GESTOR'
            ? `<a href="perfil-gestor.html">Meu Perfil (Gestor)</a><a href="banda.html">Painel da Banda</a>`
            : `<a href="perfil-musico.html">Meu Perfil Músico</a>`;

        const corBackground = escapeHtml(usuarioLogado.corAvatar || '#fa9848');

        perfilLi.innerHTML = `
            <div class="perfil-icone" id="perfilIcone" style="background-color: ${corBackground};">${escapeHtml(inicial)}</div>
            <div class="perfil-dropdown" id="perfilDropdown">
                <p>Olá, ${escapeHtml(nome.split(' ')[0])}!</p>
                <hr>
                ${linkPerfil}
                <a href="#" id="btnLogout">Sair</a>
            </div>
        `;
        
        menuPrincipalUl.appendChild(perfilLi);

        const perfilIcone = document.getElementById('perfilIcone');
        const perfilDropdown = document.getElementById('perfilDropdown');
        const btnLogout = document.getElementById('btnLogout');

        perfilIcone.addEventListener('click', () => {
            perfilDropdown.classList.toggle('ativo');
        });
        
        btnLogout.addEventListener('click', (event) => {
            event.preventDefault();
            
            localStorage.removeItem('usuarioLogado');
            localStorage.removeItem('authToken');
            localStorage.removeItem('primeiroAcesso');
            localStorage.removeItem('perfilConfigurado');
            window.location.href = 'login.html';
        });

        window.addEventListener('click', function(event) {
            if (!perfilIcone.contains(event.target) && !perfilDropdown.contains(event.target)) {
                perfilDropdown.classList.remove('ativo');
            }
        });

    }
});


// ============================================================
// FECHAMENTO UNIVERSAL DE MODAIS
// ============================================================
document.addEventListener('click', function(e) {
    if (e.target.closest('.close-button')) {
        const modal = e.target.closest('.modal');
        if (modal) {
            modal.style.display = 'none';
        }
    }
});

// ============================================================
// MENU HAMBÚRGUER (MOBILE)
// ============================================================
document.addEventListener('DOMContentLoaded', function() {
    const navToggle = document.getElementById('navToggle');
    const menuPrincipal = document.getElementById('menuPrincipal');
    if (!navToggle || !menuPrincipal) return;

    function fecharMenu() {
        menuPrincipal.classList.remove('menu-aberto');
        navToggle.setAttribute('aria-expanded', 'false');
    }

    navToggle.addEventListener('click', function(e) {
        e.stopPropagation();
        const aberto = menuPrincipal.classList.toggle('menu-aberto');
        navToggle.setAttribute('aria-expanded', String(aberto));
    });

    menuPrincipal.addEventListener('click', function(e) {
        if (e.target.closest('a')) fecharMenu();
    });

    document.addEventListener('click', function(e) {
        if (!menuPrincipal.contains(e.target) && !navToggle.contains(e.target)) {
            fecharMenu();
        }
    });

    window.addEventListener('resize', function() {
        if (window.innerWidth > 768) fecharMenu();
    });
});

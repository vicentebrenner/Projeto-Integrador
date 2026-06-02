document.addEventListener('DOMContentLoaded', function() {
    const menuPrincipalUl = document.querySelector('.menuPrincipal ul');
    const usuarioLogado = JSON.parse(localStorage.getItem('usuarioLogado'));

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
        const tipoUsuario = usuarioLogado.tipoUsuario || 'MUSICO';

        const perfilLi = document.createElement('li');
        perfilLi.classList.add('perfil-container');
        
        const linkPerfil = tipoUsuario === 'GESTOR' 
            ? `<a href="banda.html">Painel da Banda</a>` 
            : `<a href="perfil-musico.html">Meu Perfil Músico</a>`;

        const corBackground = usuarioLogado.corAvatar || '#fa9848';

        perfilLi.innerHTML = `
            <div class="perfil-icone" id="perfilIcone" style="background-color: ${corBackground};">${inicial}</div>
            <div class="perfil-dropdown" id="perfilDropdown">
                <p>Olá, ${nome.split(' ')[0]}!</p>
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
            window.location.href = 'login.html';
        });

        window.addEventListener('click', function(event) {
            if (!perfilIcone.contains(event.target) && !perfilDropdown.contains(event.target)) {
                perfilDropdown.classList.remove('ativo');
            }
        });

    }
});
document.addEventListener('DOMContentLoaded', function() {
    const menuPrincipalUl = document.querySelector('.menuPrincipal ul');
    const usuarioLogado = JSON.parse(localStorage.getItem('usuarioLogado'));

    if (usuarioLogado && menuPrincipalUl) {
        const btnLoginAntigo = document.querySelector('.btnLogin');
        if (btnLoginAntigo) {
            btnLoginAntigo.parentElement.remove();
        }

        const nome = usuarioLogado.nome;
        const inicial = nome ? nome.charAt(0).toUpperCase() : '?';

        const perfilLi = document.createElement('li');
        perfilLi.classList.add('perfil-container');
        
        perfilLi.innerHTML = `
            <div class="perfil-icone" id="perfilIcone">${inicial}</div>
            <div class="perfil-dropdown" id="perfilDropdown">
                <p>Olá, ${nome.split(' ')[0]}!</p>
                <hr>
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
            window.location.href = 'index.html';
        });

        window.addEventListener('click', function(event) {
            if (!perfilIcone.contains(event.target) && !perfilDropdown.contains(event.target)) {
                perfilDropdown.classList.remove('ativo');
            }
        });

    }
});
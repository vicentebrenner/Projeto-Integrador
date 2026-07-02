function setupPasswordToggle(inputId, toggleId) {
    const input = document.getElementById(inputId);
    const icon = document.getElementById(toggleId);

    if (input && icon) {
        const alternar = function() {
            // 1. Alterna o tipo do campo
            const type = input.getAttribute('type') === 'password' ? 'text' : 'password';
            input.setAttribute('type', type);

            // 2. Alterna o ícone (bi-eye-slash <-> bi-eye)
            icon.classList.toggle('bi-eye-slash');
            icon.classList.toggle('bi-eye');
        };
        icon.addEventListener('click', alternar);
        // Acessibilidade: ícone tem role="button"/tabindex no HTML, então precisa responder a teclado também.
        icon.addEventListener('keydown', function(e) {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                alternar();
            }
        });
    }
}

/**
 * Escapa caracteres especiais de HTML para evitar XSS ao interpolar dados
 * (nomes de usuário, descrições, textos vindos da API) dentro de innerHTML.
 */
function escapeHtml(str) {
    if (str === null || str === undefined) return '';
    const div = document.createElement('div');
    div.textContent = String(str);
    return div.innerHTML;
}

/**
 * Decodifica o payload de um JWT (base64url) sem validar a assinatura.
 * Usado apenas para LER claims (ex.: "role") já validadas/assinadas pelo backend
 * na hora da emissão do token — nunca deve ser usado como prova de autenticidade
 * (qualquer chamada de API sensível deve continuar validando o Bearer token no backend).
 */
function decodeJwtPayload(token) {
    try {
        if (!token || typeof token !== 'string') return null;
        const partes = token.split('.');
        if (partes.length !== 3) return null;
        let base64 = partes[1].replace(/-/g, '+').replace(/_/g, '/');
        while (base64.length % 4 !== 0) base64 += '=';
        const json = decodeURIComponent(atob(base64).split('').map(function (c) {
            return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
        }).join(''));
        return JSON.parse(json);
    } catch (e) {
        return null;
    }
}

/**
 * Retorna o tipoUsuario (role) a partir do claim assinado do JWT armazenado em
 * localStorage.authToken, em vez de confiar em localStorage.usuarioLogado.tipoUsuario
 * (que pode ser forjado via DevTools). Retorna null se não houver token válido.
 */
function getTipoUsuarioSeguro() {
    const token = localStorage.getItem('authToken');
    const payload = decodeJwtPayload(token);
    return payload && payload.role ? payload.role : null;
}

/**
 * Faz JSON.parse com fallback seguro — usado para ler dados de localStorage sem
 * derrubar a página inteira caso o valor esteja ausente/corrompido.
 */
function parseJsonSeguro(str, fallback) {
    if (!str) return fallback !== undefined ? fallback : null;
    try {
        return JSON.parse(str);
    } catch (e) {
        return fallback !== undefined ? fallback : null;
    }
}

function getApiUrl(path) {
    // Se definido via build/deploy (ver scripts/config.js), usa a URL configurada.
    if (window.__API_BASE_URL__ && window.__API_BASE_URL__ !== '') {
        return `${window.__API_BASE_URL__}${path}`;
    }
    // Se estiver rodando via protocolo file:/// ou em alguma porta que não seja a padrão 80/443 do container,
    // direciona diretamente para o backend local (porta 8080).
    if (window.location.protocol === 'file:' || (window.location.port !== '' && window.location.port !== '80' && window.location.port !== '443')) {
        return `http://localhost:8081${path}`;
    }
    // Caso contrário (rodando no container Nginx na porta 80, ou em produção),
    // usa a rota relativa que passará pelo proxy reverso do Nginx.
    return path;
}

function showSuccessPopup(message, callback) {
    // CSS do popup vive em styles.css (páginas que carregam o arquivo compartilhado)
    // e no <style> embutido de login.html/cadastro.html (páginas autocontidas que não o carregam).
    // 1. Criar container do popup
    const popupOverlay = document.createElement('div');
    popupOverlay.id = 'customSuccessPopup';

    // 2. Montar o HTML do Popup
    popupOverlay.innerHTML = `
        <div class="popup-card">
            <div class="popup-icon-circle">
                <i class="bi bi-check-lg"></i>
            </div>
            <div class="popup-title">Sucesso!</div>
            <div class="popup-message">${escapeHtml(message)}</div>
            <button class="popup-btn" id="popupCloseBtn">Continuar</button>
        </div>
    `;
    
    document.body.appendChild(popupOverlay);
    
    // 4. Trigger do reflow para animação de fade/scale
    setTimeout(() => {
        popupOverlay.classList.add('show');
    }, 10);
    
    // 5. Lógica de fechamento e callback
    const closeBtn = popupOverlay.querySelector('#popupCloseBtn');
    const closePopup = () => {
        popupOverlay.classList.remove('show');
        setTimeout(() => {
            popupOverlay.remove();
            if (typeof callback === 'function') {
                callback();
            }
        }, 300);
    };
    
    closeBtn.addEventListener('click', closePopup);
    
    // Fechar ao pressionar Enter
    const handleKeyDown = (e) => {
        if (e.key === 'Enter') {
            document.removeEventListener('keydown', handleKeyDown);
            closePopup();
        }
    };
    document.addEventListener('keydown', handleKeyDown);
}

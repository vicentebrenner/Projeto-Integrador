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
    
    const handleKeyDown = (e) => {
        if (e.key === 'Enter') {
            document.removeEventListener('keydown', handleKeyDown);
            closePopup();
        }
    };
    document.addEventListener('keydown', handleKeyDown);
}

function showConfirmPopup(title, message, confirmText = 'Confirmar', cancelText = 'Cancelar') {
    return new Promise((resolve) => {
        const popupOverlay = document.createElement('div');
        popupOverlay.className = 'custom-popup-overlay';
        
        popupOverlay.innerHTML = `
            <div class="popup-card">
                <div class="popup-icon-circle" style="background: linear-gradient(135deg, #e74c3c, #c0392b); box-shadow: 0 0 20px rgba(231,76,60,0.4);">
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="white" viewBox="0 0 16 16">
                        <path d="M8.982 1.566a1.13 1.13 0 0 0-1.96 0L.165 13.233c-.457.778.091 1.767.98 1.767h13.713c.889 0 1.438-.99.98-1.767L8.982 1.566zM8 5c.535 0 .954.462.9.995l-.35 3.507a.552.552 0 0 1-1.1 0L7.1 5.995A.905.905 0 0 1 8 5zm.002 6a1 1 0 1 1 0 2 1 1 0 0 1 0-2z"/>
                    </svg>
                </div>
                <div class="popup-title">${escapeHtml(title)}</div>
                <div class="popup-message">${escapeHtml(message)}</div>
                <div style="display: flex; gap: 10px; width: 100%; margin-top: 20px;">
                    <button class="popup-btn" id="popupCancelBtn" style="background: transparent; color: #333; border: 1px solid #ccc; flex: 1;">${escapeHtml(cancelText)}</button>
                    <button class="popup-btn" id="popupConfirmBtn" style="background: #e74c3c; flex: 1;">${escapeHtml(confirmText)}</button>
                </div>
            </div>
        `;
        
        document.body.appendChild(popupOverlay);
        
        setTimeout(() => {
            popupOverlay.classList.add('show');
        }, 10);
        
        const closePopup = (result) => {
            popupOverlay.classList.remove('show');
            setTimeout(() => {
                popupOverlay.remove();
                resolve(result);
            }, 300);
        };
        
        popupOverlay.querySelector('#popupCancelBtn').addEventListener('click', () => closePopup(false));
        popupOverlay.querySelector('#popupConfirmBtn').addEventListener('click', () => closePopup(true));
    });
}

function showErrorPopup(title, message) {
    const popupOverlay = document.createElement('div');
    popupOverlay.className = 'custom-popup-overlay';

    popupOverlay.innerHTML = `
        <div class="popup-card">
            <div class="popup-icon-circle" style="background: linear-gradient(135deg, #e74c3c, #c0392b); box-shadow: 0 0 20px rgba(231,76,60,0.4);">
                <i class="bi bi-x-lg" style="color: white; font-size: 32px; font-style: normal;">&#10006;</i>
            </div>
            <div class="popup-title">${escapeHtml(title)}</div>
            <div class="popup-message">${escapeHtml(message)}</div>
            <button class="popup-btn" id="popupCloseErrorBtn" style="background: #e74c3c; margin-top: 20px;">Fechar</button>
        </div>
    `;
    
    document.body.appendChild(popupOverlay);
    
    setTimeout(() => {
        popupOverlay.classList.add('show');
    }, 10);
    
    const closePopup = () => {
        popupOverlay.classList.remove('show');
        setTimeout(() => {
            popupOverlay.remove();
        }, 300);
    };
    
    popupOverlay.querySelector('#popupCloseErrorBtn').addEventListener('click', closePopup);
}

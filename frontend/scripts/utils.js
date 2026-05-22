function setupPasswordToggle(inputId, toggleId) {
    const input = document.getElementById(inputId);
    const icon = document.getElementById(toggleId);

    if (input && icon) {
        icon.addEventListener('click', function() {
            // 1. Alterna o tipo do campo
            const type = input.getAttribute('type') === 'password' ? 'text' : 'password';
            input.setAttribute('type', type);
            
            // 2. Alterna o ícone (bi-eye-slash <-> bi-eye)
            this.classList.toggle('bi-eye-slash');
            this.classList.toggle('bi-eye');
        });
    }
}

function getApiUrl(path) {
    // Se estiver rodando via protocolo file:/// ou em alguma porta que não seja a padrão 80/443 do container,
    // direciona diretamente para o backend local (porta 8080).
    if (window.location.protocol === 'file:' || (window.location.port !== '' && window.location.port !== '80' && window.location.port !== '443')) {
        return `http://localhost:8080${path}`;
    }
    // Caso contrário (rodando no container Nginx na porta 80, ou em produção),
    // usa a rota relativa que passará pelo proxy reverso do Nginx.
    return path;
}

function showSuccessPopup(message, callback) {
    // 1. Criar container do popup
    const popupOverlay = document.createElement('div');
    popupOverlay.id = 'customSuccessPopup';
    
    // 2. Estilos do popup (injetados dinamicamente para manter o arquivo auto-contido)
    const styleId = 'customSuccessPopupStyles';
    if (!document.getElementById(styleId)) {
        const style = document.createElement('style');
        style.id = styleId;
        style.textContent = `
            #customSuccessPopup {
                position: fixed;
                top: 0;
                left: 0;
                width: 100vw;
                height: 100vh;
                background: rgba(1, 16, 41, 0.6);
                backdrop-filter: blur(8px);
                -webkit-backdrop-filter: blur(8px);
                display: flex;
                justify-content: center;
                align-items: center;
                z-index: 99999;
                opacity: 0;
                transition: opacity 0.3s ease;
            }
            .popup-card {
                background: rgba(255, 255, 255, 0.95);
                border: 1px solid rgba(255, 255, 255, 0.5);
                border-radius: 20px;
                padding: 30px;
                width: 90%;
                max-width: 400px;
                text-align: center;
                box-shadow: 0 20px 40px rgba(0, 0, 0, 0.3);
                transform: scale(0.8);
                transition: transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
            }
            #customSuccessPopup.show {
                opacity: 1;
            }
            #customSuccessPopup.show .popup-card {
                transform: scale(1);
            }
            .popup-icon-circle {
                width: 70px;
                height: 70px;
                background: linear-gradient(135deg, #2ecc71, #27ae60);
                border-radius: 50%;
                display: flex;
                align-items: center;
                justify-content: center;
                margin: 0 auto 20px auto;
                box-shadow: 0 10px 20px rgba(46, 204, 113, 0.3);
                animation: popIn 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275) both;
            }
            .popup-icon-circle i {
                color: white;
                font-size: 2.2rem;
                display: flex;
                align-items: center;
                justify-content: center;
            }
            .popup-title {
                color: #011029;
                font-size: 1.5rem;
                font-weight: 700;
                margin-bottom: 10px;
            }
            .popup-message {
                color: #555;
                font-size: 1rem;
                margin-bottom: 25px;
                line-height: 1.5;
            }
            .popup-btn {
                background: linear-gradient(45deg, #fa9848, #e67e22);
                border: none;
                padding: 12px 30px;
                border-radius: 12px;
                color: white;
                font-weight: 700;
                font-size: 1em;
                cursor: pointer;
                transition: all 0.3s ease;
                box-shadow: 0 4px 15px rgba(230, 126, 34, 0.3);
                width: 100%;
                text-transform: uppercase;
                letter-spacing: 1px;
            }
            .popup-btn:hover {
                transform: translateY(-2px);
                box-shadow: 0 8px 20px rgba(230, 126, 34, 0.4);
                background: linear-gradient(45deg, #e67e22, #d35400);
            }
            @keyframes popIn {
                0% { transform: scale(0); opacity: 0; }
                100% { transform: scale(1); opacity: 1; }
            }
        `;
        document.head.appendChild(style);
    }
    
    // 3. Montar o HTML do Popup
    popupOverlay.innerHTML = `
        <div class="popup-card">
            <div class="popup-icon-circle">
                <i class="bi bi-check-lg"></i>
            </div>
            <div class="popup-title">Sucesso!</div>
            <div class="popup-message">${message}</div>
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

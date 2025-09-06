document.addEventListener('DOMContentLoaded', function() {
    const form = document.querySelector('.loginBox form');
    const loginBox = document.querySelector('.loginBox');

    form.addEventListener('submit', function(event) {
        event.preventDefault();

        let countdown = 5;

        const confirmationMessage = `
            <h2>Link Enviado!</h2>
            <p class="recoveryInstruction">
                Você receberá um link para redefinir sua senha em breve.
            </p>
            <p style="font-size: 0.8em; color: #888;">
                Você será redirecionado para a página de login em <span id="countdownTimer">${countdown}</span> segundos...
            </p>
        `;

        loginBox.innerHTML = confirmationMessage;

        const countdownElement = document.getElementById('countdownTimer');

        const intervalId = setInterval(function() {
            countdown--;
            countdownElement.textContent = countdown;
            if (countdown <= 0) {
                clearInterval(intervalId);
                window.location.href = 'login.html';
            }
        }, 1000);
    });
});
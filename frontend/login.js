<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Login - Music Makers</title>
    <link rel="stylesheet" href="estilos.css">
    <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.10.5/font/bootstrap-icons.css">
</head>
<body class="auth-page-body">

    <div class="loginContainer">
        <div class="loginBox">
            <a href="index.html" class="logoLogin">MusicMakers</a>
            <h2>Acesse sua conta</h2>

            <form id="formLogin">
                <div class="inputGroup">
                    <label for="email">E-mail</label>
                    <input type="email" id="email" name="email" required>
                    <div class="mensagemErro" id="erroEmail"></div>
                </div>

                <div class="inputGroup">
                    <label for="senha">Senha</label>
                    <div class="passwordWrapper">
                        <input type="password" id="senha" name="senha" required>
                        <i class="bi bi-eye-slash togglePasswordIcon" id="toggleSenha"></i>
                    </div>
                    <div class="mensagemErro" id="erroSenha"></div>
                </div>
                
                <div class="mensagemErro geral" id="erroLogin"></div>

                <button type="submit" class="btnLoginSubmit">Entrar</button>

                <div class="loginLinks">
                    <a href="esqueceuSenha.html">Esqueceu sua senha?</a>
                    <p>Não tem uma conta? <a href="cadastro.html">Cadastre-se</a></p>
                </div>
            </form>
        </div>
    </div>

    <script src="login.js"></script>
    <script src="utils.js"></script>

    <script>
        document.addEventListener('DOMContentLoaded', function() {
            // Chama a função do utils.js passando o ID do input de senha e o ID do ícone
            setupPasswordToggle('senha', 'toggleSenha');
        });
    </script>
</body>
</html>
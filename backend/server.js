const express = require('express');
const { Pool } = require('pg');
const bcrypt = require('bcryptjs');
const cors = require('cors');
const nodemailer = require('nodemailer');

const app = express();
const port = 3000;

app.use(cors());
app.use(express.json());

const pool = new Pool({
    user: 'postgres',
    host: 'localhost',
    database: 'music_makers_db',
    password: 'root',
    port: 5432,
});

const transporter = nodemailer.createTransport({
    host: 'smtp.ethereal.email',
    port: 587,
    auth: {
        user: 'reese.oconnell@ethereal.email',
        pass: 'mJ461Sh4UeSnwZfPyG'
    }
});

app.post('/register-request', async (req, res) => {
    const { nome, email, senha } = req.body;
    if (!nome || !email || !senha) {
        return res.status(400).json({ error: 'Todos os campos são obrigatórios.' });
    }
    try {
        const verificationCode = Math.floor(100000 + Math.random() * 900000).toString();
        const salt = await bcrypt.genSalt(10);
        const senhaHash = await bcrypt.hash(senha, salt);
        const expirationTime = new Date(Date.now() + 15 * 60 * 1000);

        const upsertUserQuery = `
            INSERT INTO usuarios (nome, email, senha_hash, verification_code, code_expires_at, email_verified)
            VALUES ($1, $2, $3, $4, $5, FALSE)
            ON CONFLICT (email) DO UPDATE
            SET nome = EXCLUDED.nome,
                senha_hash = EXCLUDED.senha_hash,
                verification_code = EXCLUDED.verification_code,
                code_expires_at = EXCLUDED.code_expires_at,
                email_verified = FALSE
            WHERE usuarios.email_verified = FALSE;
        `;
        await pool.query(upsertUserQuery, [nome, email, senhaHash, verificationCode, expirationTime]);

        const mailOptions = {
            from: '"Music Makers" <no-reply@musicmakers.com>',
            to: email,
            subject: 'Seu Código de Verificação',
            html: `<p>Olá ${nome},</p><p>Seu código de verificação para o Music Makers é: <strong>${verificationCode}</strong></p><p>Este código expira em 15 minutos.</p>`
        };
        
        const info = await transporter.sendMail(mailOptions);
        console.log(`Código enviado para ${email}: ${verificationCode}`);
        console.log('Preview URL (para ver o e-mail de teste): %s', nodemailer.getTestMessageUrl(info));

        res.status(200).json({ message: 'Código de verificação enviado para o seu e-mail.' });

    } catch (error) {
         if (error.code === '23505') {
            return res.status(400).json({ error: 'Este e-mail já está cadastrado e verificado.' });
        }
        console.error('Erro ao registrar usuário:', error);
        res.status(500).json({ error: 'Ocorreu um erro no servidor.' });
    }
});

app.post('/verify-code', async (req, res) => {
    const { email, code } = req.body;
    if (!email || !code) {
        return res.status(400).json({ error: 'E-mail e código são obrigatórios.' });
    }
    try {
        const userQuery = 'SELECT * FROM usuarios WHERE email = $1 AND email_verified = FALSE';
        const result = await pool.query(userQuery, [email]);

        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Usuário não encontrado ou já verificado.' });
        }
        const user = result.rows[0];
        if (new Date() > new Date(user.code_expires_at)) {
            return res.status(400).json({ error: 'Código de verificação expirado.' });
        }
        if (user.verification_code !== code) {
            return res.status(400).json({ error: 'Código de verificação inválido.' });
        }

        const updateUserQuery = `
            UPDATE usuarios
            SET email_verified = TRUE, verification_code = NULL, code_expires_at = NULL
            WHERE email = $1;
        `;
        await pool.query(updateUserQuery, [email]);

        res.status(200).json({ message: 'E-mail verificado com sucesso! Cadastro finalizado.' });
    } catch (error) {
        console.error('Erro ao verificar código:', error);
        res.status(500).json({ error: 'Ocorreu um erro no servidor.' });
    }
});


app.post('/login', async (req, res) => {
    const { email, senha } = req.body;
    if (!email || !senha) {
        return res.status(400).json({ error: 'Email e senha são obrigatórios.' });
    }
    try {
        const usuarioQuery = 'SELECT * FROM usuarios WHERE email = $1';
        const resultado = await pool.query(usuarioQuery, [email]);
        if (resultado.rows.length === 0) {
            return res.status(401).json({ error: 'Credenciais inválidas.' });
        }
        const usuario = resultado.rows[0];
        if (!usuario.email_verified) {
            return res.status(403).json({ error: 'Por favor, verifique seu e-mail para fazer o login.' });
        }
        const senhaCorreta = await bcrypt.compare(senha, usuario.senha_hash);
        if (!senhaCorreta) {
            return res.status(401).json({ error: 'Credenciais inválidas.' });
        }
        res.status(200).json({
            message: 'Login bem-sucedido!',
            usuario: { id: usuario.id, nome: usuario.nome, email: usuario.email }
        });
    } catch (error) {
        console.error('Erro ao fazer login:', error);
        res.status(500).json({ error: 'Ocorreu um erro no servidor.' });
    }
});

app.listen(port, () => {
    console.log(`Servidor rodando em http://localhost:${port}`);
});
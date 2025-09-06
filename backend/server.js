// 1. Importando as bibliotecas necessárias
const express = require('express');
const { Pool } = require('pg');
const bcrypt = require('bcryptjs');
const cors = require('cors');

// 2. Configurações Iniciais
const app = express();
const port = 3000; // Usaremos a porta 3000 para o servidor local

// ==========================================================
// 3. Middlewares - Configuração para Ambiente Local
// ==========================================================
app.use(cors()); // Permite acesso de qualquer origem (perfeito para localhost)
app.use(express.json());

// ==========================================================
// 4. Configuração da Conexão com o Banco de Dados - Configuração Local
// ==========================================================
const pool = new Pool({
    user: 'postgres', // Seu usuário do PostgreSQL
    host: 'localhost',
    database: 'music_makers_db', // O nome do seu banco de dados local
    password: 'root',      // Sua senha do PostgreSQL local
    port: 5432,            // A porta padrão do PostgreSQL
});

// 5. Rota de Teste (para verificar se o servidor está no ar)
app.get('/', (req, res) => {
    res.send('API do Music Makers está funcionando LOCALMENTE!');
});

// ==========================================================
// 6. ROTA DE CADASTRO DE USUÁRIO (POST /register)
// ==========================================================
app.post('/register', async (req, res) => {
    const { nome, email, senha } = req.body;
    if (!nome || !email || !senha) {
        return res.status(400).json({ error: 'Todos os campos são obrigatórios.' });
    }
    try {
        const salt = await bcrypt.genSalt(10);
        const senhaHash = await bcrypt.hash(senha, salt);
        const novoUsuarioQuery = `
            INSERT INTO usuarios (nome, email, senha_hash) 
            VALUES ($1, $2, $3) 
            RETURNING id, nome, email;
        `;
        const values = [nome, email, senhaHash];
        const resultado = await pool.query(novoUsuarioQuery, values);
        res.status(201).json(resultado.rows[0]);
    } catch (error) {
        if (error.code === '23505') {
            return res.status(400).json({ error: 'Este e-mail já está cadastrado.' });
        }
        console.error('Erro ao registrar usuário:', error);
        res.status(500).json({ error: 'Ocorreu um erro no servidor. Tente novamente mais tarde.' });
    }
});

// ==========================================================
// 7. ROTA DE LOGIN DE USUÁRIO (POST /login)
// ==========================================================
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
        const senhaCorreta = await bcrypt.compare(senha, usuario.senha_hash);
        if (!senhaCorreta) {
            return res.status(401).json({ error: 'Credenciais inválidas.' });
        }
        res.status(200).json({ 
            message: 'Login bem-sucedido!',
            usuario: {
                id: usuario.id,
                nome: usuario.nome,
                email: usuario.email
            }
        });
    } catch (error) {
        console.error('Erro ao fazer login:', error);
        res.status(500).json({ error: 'Ocorreu um erro no servidor.' });
    }
});


// 8. Iniciando o Servidor
app.listen(port, () => {
    console.log(`Servidor rodando em http://localhost:${port}`);
});
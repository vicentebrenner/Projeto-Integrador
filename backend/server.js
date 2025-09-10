    const express = require('express');
    const cors = require('cors');
    const authRoutes = require('./src/routes/authRoutes');

    const app = express();
    const port = 3000;

    app.use(cors());
    app.use(express.json());

    app.get('/', (req, res) => {
      res.status(200).send('<h1>API na AWS está funcionando!</h1><p>Deploy realizado com sucesso.</p>');
    });

    app.use('/auth', authRoutes);

    app.listen(port, () => {
        console.log(`Servidor rodando em http://localhost:${port}`);
    });
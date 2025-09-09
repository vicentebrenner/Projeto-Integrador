const express = require('express');
const cors = require('cors');
const authRoutes = require('./src/routes/authRoutes');

const app = express();
const port = 3000;

app.use(cors());
app.use(express.json());

app.use('/', authRoutes);

app.listen(port, () => {
    console.log(`Servidor rodando em http://localhost:${port}`);
});
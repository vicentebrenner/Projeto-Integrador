const fs = require('fs');

const jsFile = 'c:/Users/vicen/OneDrive/Documentos/Projeto-Integrador/frontend/scripts/perfil-musico.js';
let jsContent = fs.readFileSync(jsFile, 'utf8');

// Remover username initialization
jsContent = jsContent.replace(/username: usuarioLogado\.username \|\| "",/g, '');

// Remover atribuição username do data
jsContent = jsContent.replace(/dadosPerfil\.username = data\.username \|\| dadosPerfil\.username;/g, '');

// Adicionar whatsapp e dataNascimento initialization
jsContent = jsContent.replace(/nome: usuarioLogado\.nome \|\| "Músico",/, 'nome: usuarioLogado.nome || "Músico",\n        whatsapp: "",\n        dataNascimento: "",');

// Adicionar whatsapp e dataNascimento assignment do data backend
jsContent = jsContent.replace(/dadosPerfil\.email = usuario\.email \|\| dadosPerfil\.email;/, 'dadosPerfil.email = usuario.email || dadosPerfil.email;\n                dadosPerfil.whatsapp = data.whatsapp || "";\n                dadosPerfil.dataNascimento = data.dataNascimento || "";');

// Atualizar DTO de salvar
jsContent = jsContent.replace(/username: dadosPerfil\.username,/g, 'whatsapp: dadosPerfil.whatsapp,\n            dataNascimento: dadosPerfil.dataNascimento,');

// Remover o username do submit
jsContent = jsContent.replace(/dadosPerfil\.username = document\.getElementById\('perfilUsername'\)\.value\s*\|\|\s*'';/g, '');

// Mapear os novos valores para os inputs no carregarPerfil()
jsContent = jsContent.replace(/document\.getElementById\("perfilNome"\)\.value = dadosPerfil\.nome;/, 'document.getElementById("perfilNome").value = dadosPerfil.nome;\n        if(document.getElementById("perfilWhatsapp")) document.getElementById("perfilWhatsapp").value = dadosPerfil.whatsapp || "";\n        if(document.getElementById("perfilDataNascimento")) document.getElementById("perfilDataNascimento").value = dadosPerfil.dataNascimento || "";');

// Pegar os valores no submit
jsContent = jsContent.replace(/dadosPerfil\.nome = document\.getElementById\('perfilNome'\)\.value;/, 'dadosPerfil.nome = document.getElementById("perfilNome").value;\n            if(document.getElementById("perfilWhatsapp")) dadosPerfil.whatsapp = document.getElementById("perfilWhatsapp").value;\n            if(document.getElementById("perfilDataNascimento")) dadosPerfil.dataNascimento = document.getElementById("perfilDataNascimento").value;');

// Remover a lógica de limpar borda do username no then()
jsContent = jsContent.replace(/const inputUsername = document\.getElementById\('perfilUsername'\);[\s\n]*if \(inputUsername\) inputUsername\.style\.borderColor = ''; \/\/ Limpa borda de erro se houver/g, '// Limpa borda de erro se houver');

// Remover a lógica do erro de username já está em uso no catch()
jsContent = jsContent.replace(/if \(err\.message && err\.message\.includes\("Username já está em uso"\)\) \{[\s\S]*?\}\s*\}/g, '');

// Remover a lógica de atualizar o localstorage username
jsContent = jsContent.replace(/usuarioLogado\.username = dadosPerfil\.username;/g, '');

// Remover o bloco "Gerar Username Aleatório" com segurança (sem quebrar chaves)
jsContent = jsContent.replace(/\/\/ Gerar Username Aleatório[\s\S]*?showSnackbar\("Username gerado!"\);\s*\}\s*\}/g, '');

fs.writeFileSync(jsFile, jsContent);
console.log('Script updated again!');

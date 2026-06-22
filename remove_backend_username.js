const fs = require('fs');

const usuarioFile = 'c:/Users/vicen/OneDrive/Documentos/Projeto-Integrador/backend-springboot/Projeto/src/main/java/com/musicMakers/Projeto/domain/entity/Usuario.java';
const dtoFile = 'c:/Users/vicen/OneDrive/Documentos/Projeto-Integrador/backend-springboot/Projeto/src/main/java/com/musicMakers/Projeto/domain/dto/PerfilUpdateDTO.java';
const serviceFile = 'c:/Users/vicen/OneDrive/Documentos/Projeto-Integrador/backend-springboot/Projeto/src/main/java/com/musicMakers/Projeto/service/PerfilMusicoService.java';
const authController = 'c:/Users/vicen/OneDrive/Documentos/Projeto-Integrador/backend-springboot/Projeto/src/main/java/com/musicMakers/Projeto/controller/AuthController.java';

// Usuario.java
let usuarioContent = fs.readFileSync(usuarioFile, 'utf8');
usuarioContent = usuarioContent.replace(/@Column\(unique = true\)\s*private String username;/g, '');
usuarioContent = usuarioContent.replace(/public String getUsername\(\) \{\s*return username;\s*\}/g, '');
usuarioContent = usuarioContent.replace(/public void setUsername\(String username\) \{\s*this\.username = username;\s*\}/g, '');
fs.writeFileSync(usuarioFile, usuarioContent);

// PerfilUpdateDTO.java
let dtoContent = fs.readFileSync(dtoFile, 'utf8');
dtoContent = dtoContent.replace(/private String username;/g, '');
dtoContent = dtoContent.replace(/public String getUsername\(\) \{\s*return username;\s*\}/g, '');
dtoContent = dtoContent.replace(/public void setUsername\(String username\) \{\s*this\.username = username;\s*\}/g, '');
fs.writeFileSync(dtoFile, dtoContent);

// PerfilMusicoService.java
let serviceContent = fs.readFileSync(serviceFile, 'utf8');
serviceContent = serviceContent.replace(/if\s*\(dto\.getUsername\(\)\s*!=\s*null\s*&&\s*!dto\.getUsername\(\)\.trim\(\)\.isEmpty\(\)\)\s*\{[\s\S]*?\}\s*else\s*\{\s*usuario\.setUsername\(null\);\s*\}/g, '');
fs.writeFileSync(serviceFile, serviceContent);

// AuthController.java
let authContent = fs.readFileSync(authController, 'utf8');
authContent = authContent.replace(/resposta\.put\("username",\s*usuario\.getUsername\(\)\);/g, '');
fs.writeFileSync(authController, authContent);

console.log("Backend cleaned.");

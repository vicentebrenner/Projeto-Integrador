const fs = require('fs');

const authController = 'c:/Users/vicen/OneDrive/Documentos/Projeto-Integrador/backend-springboot/Projeto/src/main/java/com/musicMakers/Projeto/controller/AuthController.java';
let authContent = fs.readFileSync(authController, 'utf8');
authContent = authContent.replace(/resposta\.put\("username",\s*usuario\.getUsername\(\)\);/g, '');
fs.writeFileSync(authController, authContent);

const serviceFile = 'c:/Users/vicen/OneDrive/Documentos/Projeto-Integrador/backend-springboot/Projeto/src/main/java/com/musicMakers/Projeto/service/PerfilMusicoService.java';
let serviceContent = fs.readFileSync(serviceFile, 'utf8');
serviceContent = serviceContent.replace(/if\s*\(\s*dto\.getUsername\(\)\s*!=\s*null\s*&&\s*!dto\.getUsername\(\)\.trim\(\)\.isEmpty\(\)\s*\)\s*\{\s*Optional<Usuario>\s*existente\s*=\s*usuarioRepository\.findByUsername\(dto\.getUsername\(\)\);\s*if\s*\(existente\.isPresent\(\)\s*&&\s*!existente\.get\(\)\.getId\(\)\.equals\(usuarioId\)\)\s*\{\s*throw\s*new\s*IllegalArgumentException\("Username\s*já\s*está\s*em\s*uso\."\);\s*\}\s*usuario\.setUsername\(dto\.getUsername\(\)\);\s*\}\s*else\s*\{\s*usuario\.setUsername\(null\);\s*\}/g, '');
fs.writeFileSync(serviceFile, serviceContent);

// One more check in AuthController
authContent = authContent.replace(/usuario\.getUsername\(\)/g, '""');
fs.writeFileSync(authController, authContent);

console.log("Backend cleaned again.");

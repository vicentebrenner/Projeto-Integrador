const fs = require('fs');

function fixCSS(file) {
    let content = fs.readFileSync(file, 'utf8');
    
    // Fix CSS Selectors for field-icon
    content = content.replace(/i\.field-icon/g, '.field-icon');
    
    // Fix CSS Selectors for role-option (in cadastro.html)
    content = content.replace(/\.role-option i/g, '.role-option svg');
    content = content.replace(/\.role-option\.active i/g, '.role-option.active svg');
    
    fs.writeFileSync(file, content);
    console.log(file, 'CSS Fixed');
}

fixCSS('c:/Users/vicen/OneDrive/Documentos/Projeto-Integrador/frontend/cadastro.html');


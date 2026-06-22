const fs = require('fs');
const jsFile = 'c:/Users/vicen/OneDrive/Documentos/Projeto-Integrador/frontend/scripts/perfil-musico.js';
let lines = fs.readFileSync(jsFile, 'utf8').split('\n');

// The offending lines are around line 468. Let's find exactly where:
// We look for:
//     );
//     }
// just after:
//         });
//     }
let removedCount = 0;
for (let i = 0; i < lines.length; i++) {
    if (lines[i].trim() === ');' && lines[i+1] && lines[i+1].trim() === '}') {
        // Look back to see if it's the one after inputNome
        if (lines[i-2] && lines[i-2].includes('}')) {
            lines.splice(i, 2);
            console.log('Removed dangling braces at line', i+1);
            removedCount++;
            break; // just remove once
        }
    }
}

fs.writeFileSync(jsFile, lines.join('\n'));

const fs = require('fs');
const path = require('path');

const directoryPath = path.join(__dirname, 'src');

const traverseDirectory = (dir) => {
    const files = fs.readdirSync(dir);
    
    files.forEach((file) => {
        const fullPath = path.join(dir, file);
        if (fs.statSync(fullPath).isDirectory()) {
            traverseDirectory(fullPath);
        } else if (fullPath.endsWith('.js') || fullPath.endsWith('.jsx')) {
            let content = fs.readFileSync(fullPath, 'utf8');
            let updated = content;

            // Mapping dictionary for Tailwind classes
            const replacements = [
                // Old exact matches
                { rx: /\bcream\b/g, to: 'vanilla' },
                { rx: /\bforest\b/g, to: 'darkTeal' },
                { rx: /\bleaf-light\b/g, to: 'mint' },
                { rx: /\bleaf-dark\b/g, to: 'teal' },
                { rx: /\bleaf\b/g, to: 'teal' },
                { rx: /\bsage\b/g, to: 'coral' },
                // Some explicit raw colors mapped just in case
                { rx: /#fdfbf7/g, to: '#FAECB6' },
                { rx: /#fcfdfd/g, to: '#FAECB6' },
                { rx: /#1a2e1a/g, to: '#114a42' },
                { rx: /#1a1a1a/g, to: '#114a42' },
                { rx: /#2d5a27/g, to: '#2BBAA5' }, // teal
                { rx: /#4a7c44/g, to: '#93D3AE' }, // mint
                // Emerald -> teal
                { rx: /\bemerald\b/g, to: 'teal' },
                // Amber -> sun
                { rx: /\bamber\b/g, to: 'sun' },
                // Rose -> coral
                { rx: /\brose\b/g, to: 'coral' }
            ];

            replacements.forEach(rep => {
                updated = updated.replace(rep.rx, rep.to);
            });

            if (content !== updated) {
                fs.writeFileSync(fullPath, updated, 'utf8');
                console.log(`Updated ${fullPath}`);
            }
        }
    });
};

console.log("Starting color variable migration in /src ...");
traverseDirectory(directoryPath);
console.log("Migration complete!");

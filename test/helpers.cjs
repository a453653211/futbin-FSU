const fs = require('node:fs');
const path = require('node:path');
const acorn = require('acorn');
const root = path.join(__dirname, '..');
const read = name => fs.readFileSync(path.join(root, name), 'utf8');
function functions(source, names) {
    const found = {};
    function visit(node) {
        if (!node || typeof node !== 'object') return;
        if (node.type === 'FunctionDeclaration' && names.includes(node.id?.name)) found[node.id.name] = source.slice(node.start, node.end);
        for (const value of Object.values(node)) if (Array.isArray(value)) value.forEach(visit); else if (value?.type) visit(value);
    }
    visit(acorn.parse(source, { ecmaVersion: 'latest' }));
    for (const name of names) if (!found[name]) throw new Error(`Missing function: ${name}`);
    return found;
}
module.exports = { root, read, functions };

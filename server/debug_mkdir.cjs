const fs = require('fs');
const path = require('path');
const target = path.join(__dirname, 'uploads');
console.log('Target directory:', target);
try {
    if (!fs.existsSync(target)) {
        fs.mkdirSync(target, { recursive: true });
        console.log('Created directory');
    } else {
        console.log('Directory already exists');
    }
    fs.writeFileSync(path.join(target, 'marker.txt'), 'ready');
    console.log('Wrote marker file');
} catch (e) {
    console.error('FAILED:', e);
}

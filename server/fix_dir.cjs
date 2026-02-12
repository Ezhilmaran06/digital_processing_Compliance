const fs = require('fs');
const path = require('path');
const dir = path.join(__dirname, 'uploads');
try {
    if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
        console.log('Directory created successfully at:', dir);
    } else {
        console.log('Directory already exists at:', dir);
    }
} catch (err) {
    console.error('Error creating directory:', err);
}

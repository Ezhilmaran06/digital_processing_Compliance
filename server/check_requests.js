
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '.env') });

const RequestSchema = new mongoose.Schema({
    status: String,
    title: String
});

const Request = mongoose.model('Request', RequestSchema);

async function check() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        const requests = await Request.find({});
        console.log('--- ALL REQUESTS ---');
        requests.forEach(r => console.log(`${r.title}: [${r.status}]`));
        await mongoose.disconnect();
    } catch (err) {
        console.error(err);
    }
}

check();

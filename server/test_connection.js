import mongoose from 'mongoose';
import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config();

const ATLAS_URI = 'mongodb+srv://maran2006_dbuser:maran2006@cluster0.jxknclt.mongodb.net/changeflow?appName=Cluster0';

async function test() {
  try {
    console.log('Connecting...');
    await mongoose.connect(ATLAS_URI, { serverSelectionTimeoutMS: 5000 });
    console.log('Connected!');
    fs.writeFileSync(path.join(__dirname, 'connection_success.txt'), 'Successfully connected to Atlas at ' + new Date().toISOString());
  } catch (err) {
    console.error('Connection failed:', err.message);
    fs.writeFileSync(path.join(__dirname, 'connection_failed.txt'), 'Failed to connect to Atlas: ' + err.message);
  } finally {
    await mongoose.disconnect();
  }
}

test();

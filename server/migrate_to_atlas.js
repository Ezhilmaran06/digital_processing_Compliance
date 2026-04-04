import mongoose from 'mongoose';
import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config();

const ATLAS_URI = 'mongodb+srv://maran2006_dbuser:maran2006@cluster0.jxknclt.mongodb.net/changeflow?appName=Cluster0';

const filesToImport = [
  { file: 'changeflow.users.json', collection: 'users' },
  { file: 'changeflow.auditlogs.json', collection: 'auditlogs' },
  { file: 'changeflow.chatmessages.json', collection: 'chatmessages' },
  { file: 'changeflow.groups.json', collection: 'groups' },
  { file: 'changeflow.messages.json', collection: 'messages' },
  { file: 'changeflow.requests.json', collection: 'requests' }
];

function log(msg) {
  console.log(msg);
  fs.appendFileSync(path.join(__dirname, 'migration.log'), msg + '\n');
}

function parseBSON(obj) {
  if (Array.isArray(obj)) {
    return obj.map(parseBSON);
  } else if (obj !== null && typeof obj === 'object') {
    if (obj.$oid) return new mongoose.Types.ObjectId(obj.$oid);
    if (obj.$date) {
      const date = new Date(obj.$date);
      return isNaN(date.getTime()) ? obj.$date : date;
    }
    const newObj = {};
    for (const key in obj) {
      newObj[key] = parseBSON(obj[key]);
    }
    return newObj;
  }
  return obj;
}

async function migrate() {
  try {
    log('Starting migration script...');
    log(`Connecting to: ${ATLAS_URI.replace(/:[^:]*@/, ':****@')}`);
    
    // Setting up a timeout for connection
    await mongoose.connect(ATLAS_URI, { 
      serverSelectionTimeoutMS: 5000, // 5 seconds timeout
      connectTimeoutMS: 5000 
    });
    log('Connected successfully!');

    for (const item of filesToImport) {
      const filePath = path.join(__dirname, item.file);
      if (!fs.existsSync(filePath)) {
        log(`Warning: File not found: ${item.file}, skipping...`);
        continue;
      }

      log(`Importing ${item.file} into collection "${item.collection}"...`);
      const rawData = fs.readFileSync(filePath, 'utf8');
      const jsonData = JSON.parse(rawData);
      const parsedData = parseBSON(jsonData);

      const collection = mongoose.connection.db.collection(item.collection);
      
      const operations = parsedData.map(doc => ({
        updateOne: {
          filter: { _id: doc._id },
          update: { $set: doc },
          upsert: true
        }
      }));

      if (operations.length > 0) {
        log(`Executing bulkWrite for ${item.collection} with ${operations.length} operations...`);
        const result = await collection.bulkWrite(operations);
        log(`Finished ${item.collection}: ${result.upsertedCount} upserted, ${result.modifiedCount} modified / matched.`);
      } else {
        log(`No data to import for ${item.collection}.`);
      }
    }

    log('Migration completed successfully!');
  } catch (error) {
    log(`Migration error: ${error.message}`);
    log(error.stack);
  } finally {
    await mongoose.disconnect();
    log('Disconnected.');
  }
}

migrate();

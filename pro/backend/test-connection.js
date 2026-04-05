// Test MongoDB connection
import { MongoClient } from 'mongodb';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config({ path: join(__dirname, '.env') });

const uri = process.env.MONGODB_URI;

if (!uri) {
  console.error('❌ MONGODB_URI is not defined in .env file');
  process.exit(1);
}

console.log('Testing MongoDB connection...');
console.log('URI (hidden password):', uri.replace(/:[^:@]+@/, ':****@'));

async function testConnection() {
  try {
    const client = new MongoClient(uri);
    await client.connect();
    console.log('✅ Successfully connected to MongoDB!');
    
    // List databases
    const adminDb = client.db().admin();
    const { databases } = await adminDb.listDatabases();
    console.log('\nAvailable databases:');
    databases.forEach(db => {
      console.log(`  - ${db.name} (${(db.sizeOnDisk / 1024 / 1024).toFixed(2)} MB)`);
    });
    
    await client.close();
    process.exit(0);
  } catch (error) {
    console.error('\n❌ Connection failed:');
    console.error(`   Error: ${error.message}`);
    console.error(`   Code: ${error.code}`);
    console.error(`   CodeName: ${error.codeName}`);
    
    if (error.code === 8000 || error.codeName === 'AtlasError') {
      console.error('\n💡 Troubleshooting tips:');
      console.error('   1. Verify username and password in MongoDB Atlas');
      console.error('   2. Check if your IP is whitelisted in Network Access');
      console.error('   3. Ensure the database user has proper permissions');
      console.error('   4. Try URL-encoding special characters in username/password');
      console.error('\n   To URL-encode, use encodeURIComponent():');
      console.error('   Example: mongodb+srv://' + encodeURIComponent('My-self') + ':' + encodeURIComponent('password') + '@...');
    }
    
    process.exit(1);
  }
}

testConnection();

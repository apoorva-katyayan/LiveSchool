// Script to make a user an admin
// Usage: node make-admin.js <email>

import { MongoClient } from 'mongodb';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config({ path: join(__dirname, '.env') });

const email = process.argv[2];

if (!email) {
  console.error('Usage: node make-admin.js <email>');
  console.error('Example: node make-admin.js user@example.com');
  process.exit(1);
}

async function makeAdmin() {
  const client = new MongoClient(process.env.MONGODB_URI);
  
  try {
    await client.connect();
    const db = client.db();
    
    const result = await db.collection('users').updateOne(
      { email: email },
      { $set: { role: 'admin' } }
    );
    
    if (result.matchedCount === 0) {
      console.error(`❌ User with email "${email}" not found.`);
      console.log('\nAvailable users:');
      const users = await db.collection('users').find({}).toArray();
      users.forEach(user => {
        console.log(`  - ${user.email} (role: ${user.role})`);
      });
      process.exit(1);
    }
    
    if (result.modifiedCount === 0) {
      console.log(`✅ User "${email}" is already an admin.`);
    } else {
      console.log(`✅ Successfully made "${email}" an admin!`);
    }
    
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  } finally {
    await client.close();
  }
}

makeAdmin();

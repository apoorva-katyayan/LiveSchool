// Script to create an admin user
import { MongoClient } from 'mongodb';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config({ path: join(__dirname, '.env') });

const email = 'apoorvakatyayan1234@gmail.com';
const password = 'Apoorva@4321';

async function createAdmin() {
  const client = new MongoClient(process.env.MONGODB_URI);
  
  try {
    await client.connect();
    const db = client.db();
    
    // Check if user already exists
    const existingUser = await db.collection('users').findOne({ email });
    
    if (existingUser) {
      // Update existing user to admin
      const hashedPassword = await bcrypt.hash(password, 10);
      const result = await db.collection('users').updateOne(
        { email },
        { 
          $set: { 
            role: 'admin',
            password: hashedPassword,
            updatedAt: new Date()
          } 
        }
      );
      
      if (result.modifiedCount > 0) {
        console.log(`✅ Updated existing user "${email}" to admin with new password.`);
      } else {
        console.log(`✅ User "${email}" already exists as admin. Password updated.`);
      }
    } else {
      // Create new admin user
      const hashedPassword = await bcrypt.hash(password, 10);
      const result = await db.collection('users').insertOne({
        email,
        password: hashedPassword,
        role: 'admin',
        createdAt: new Date()
      });
      
      console.log(`✅ Successfully created admin user "${email}"!`);
      console.log(`   User ID: ${result.insertedId}`);
    }
    
    console.log('\n📝 Login credentials:');
    console.log(`   Email: ${email}`);
    console.log(`   Password: ${password}`);
    console.log('\n✨ You can now log in and access the admin panel!');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  } finally {
    await client.close();
  }
}

createAdmin();

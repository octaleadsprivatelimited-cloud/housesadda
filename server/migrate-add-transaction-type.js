import sqlite3 from 'sqlite3';
import { promisify } from 'util';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const DB_PATH = join(__dirname, '..', 'database', 'housesadda.db');

const db = new sqlite3.Database(DB_PATH);
const dbRun = promisify(db.run.bind(db));
const dbGet = promisify(db.get.bind(db));

async function migrate() {
  try {
    console.log('🔄 Checking for transaction_type column...');
    
    // Check if column exists
    try {
      await dbGet('SELECT transaction_type FROM properties LIMIT 1');
      console.log('✅ transaction_type column already exists');
    } catch (e) {
      console.log('➕ Adding transaction_type column...');
      await dbRun('ALTER TABLE properties ADD COLUMN transaction_type TEXT DEFAULT "Sale"');
      console.log('✅ Column added successfully');
      
      // Update existing properties to have 'Sale' as default
      await dbRun('UPDATE properties SET transaction_type = "Sale" WHERE transaction_type IS NULL');
      console.log('✅ Updated existing properties with default transaction_type');
    }
    
    // Verify
    const props = await promisify(db.all.bind(db))('SELECT id, title, transaction_type FROM properties LIMIT 5');
    console.log('\n📊 Sample properties:');
    props.forEach(p => {
      console.log(`  ID ${p.id}: ${p.title} - transaction_type: ${p.transaction_type || 'NULL'}`);
    });
    
    console.log('\n✅ Migration completed successfully!');
  } catch (error) {
    console.error('❌ Migration error:', error);
  } finally {
    db.close();
  }
}

migrate();


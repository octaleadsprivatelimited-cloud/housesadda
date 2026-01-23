import sqlite3 from 'sqlite3';
import { promisify } from 'util';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const DB_PATH = join(__dirname, '..', 'database', 'housesadda.db');

const db = new sqlite3.Database(DB_PATH);
const dbAll = promisify(db.all.bind(db));
const dbRun = promisify(db.run.bind(db));

async function updateRentProperties() {
  try {
    console.log('📋 Checking all properties...');
    const props = await dbAll('SELECT id, title, transaction_type FROM properties');
    
    console.log('\nCurrent properties:');
    props.forEach(p => {
      console.log(`  ID ${p.id}: "${p.title}" -> transaction_type: ${p.transaction_type || 'NULL'}`);
    });
    
    // Find properties with "rent" in title
    const rentProps = props.filter(p => 
      p.title.toLowerCase().includes('rent') && 
      p.transaction_type !== 'Rent'
    );
    
    if (rentProps.length > 0) {
      console.log(`\n🔄 Updating ${rentProps.length} rent property/properties...`);
      for (const p of rentProps) {
        await dbRun('UPDATE properties SET transaction_type = ? WHERE id = ?', ['Rent', p.id]);
        console.log(`  ✅ Updated ID ${p.id}: "${p.title}" -> Rent`);
      }
    } else {
      console.log('\n✅ No properties need updating');
    }
    
    // Show final count
    const finalProps = await dbAll('SELECT transaction_type, COUNT(*) as count FROM properties GROUP BY transaction_type');
    console.log('\n📊 Final counts by transaction type:');
    finalProps.forEach(p => {
      console.log(`  ${p.transaction_type || 'NULL'}: ${p.count} properties`);
    });
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    db.close();
  }
}

updateRentProperties();


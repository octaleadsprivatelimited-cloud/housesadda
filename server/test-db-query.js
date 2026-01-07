import sqlite3 from 'sqlite3';
import { promisify } from 'util';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const DB_PATH = join(__dirname, '..', 'database', 'housesadda.db');

const db = new sqlite3.Database(DB_PATH);
const dbAll = promisify(db.all.bind(db));

async function testQuery() {
  try {
    console.log('🔍 Testing database queries directly...\n');
    
    // Test 1: All properties
    console.log('1️⃣ All properties:');
    const all = await dbAll(`
      SELECT p.*, l.name as location_name, pt.name as type_name, p.transaction_type
      FROM properties p
      LEFT JOIN locations l ON p.location_id = l.id
      LEFT JOIN property_types pt ON p.type_id = pt.id
      ORDER BY p.created_at DESC
    `);
    console.log(`Found ${all.length} properties:`);
    all.forEach(p => {
      console.log(`  ID ${p.id}: ${p.title} -> transaction_type: "${p.transaction_type}"`);
    });
    
    // Test 2: Filter by Rent
    console.log('\n2️⃣ Filter by Rent:');
    const rent = await dbAll(`
      SELECT p.*, l.name as location_name, pt.name as type_name, p.transaction_type
      FROM properties p
      LEFT JOIN locations l ON p.location_id = l.id
      LEFT JOIN property_types pt ON p.type_id = pt.id
      WHERE p.transaction_type = ?
      ORDER BY p.created_at DESC
    `, ['Rent']);
    console.log(`Found ${rent.length} Rent properties:`);
    rent.forEach(p => {
      console.log(`  ID ${p.id}: ${p.title} -> transaction_type: "${p.transaction_type}"`);
    });
    
    // Test 3: Filter by Sale
    console.log('\n3️⃣ Filter by Sale:');
    const sale = await dbAll(`
      SELECT p.*, l.name as location_name, pt.name as type_name, p.transaction_type
      FROM properties p
      LEFT JOIN locations l ON p.location_id = l.id
      LEFT JOIN property_types pt ON p.type_id = pt.id
      WHERE p.transaction_type = ?
      ORDER BY p.created_at DESC
    `, ['Sale']);
    console.log(`Found ${sale.length} Sale properties:`);
    sale.forEach(p => {
      console.log(`  ID ${p.id}: ${p.title} -> transaction_type: "${p.transaction_type}"`);
    });
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    db.close();
  }
}

testQuery();


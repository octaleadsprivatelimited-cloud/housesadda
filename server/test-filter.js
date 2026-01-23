import sqlite3 from 'sqlite3';
import { promisify } from 'util';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const DB_PATH = join(__dirname, '..', 'database', 'housesadda.db');

const db = new sqlite3.Database(DB_PATH);
const dbAll = promisify(db.all.bind(db));

async function testFilter() {
  try {
    console.log('📋 Testing transaction type filtering...\n');
    
    // Test 1: Get all properties
    const allProps = await dbAll('SELECT id, title, transaction_type FROM properties');
    console.log('All properties:');
    allProps.forEach(p => {
      console.log(`  ID ${p.id}: "${p.title}" -> ${p.transaction_type}`);
    });
    
    // Test 2: Filter by Rent
    console.log('\n🔍 Testing Rent filter:');
    const rentQuery = `
      SELECT p.*, l.name as location_name, pt.name as type_name
      FROM properties p
      LEFT JOIN locations l ON p.location_id = l.id
      LEFT JOIN property_types pt ON p.type_id = pt.id
      WHERE p.transaction_type = ?
    `;
    const rentProps = await dbAll(rentQuery, ['Rent']);
    console.log(`Found ${rentProps.length} Rent properties:`);
    rentProps.forEach(p => {
      console.log(`  ID ${p.id}: "${p.title}" (${p.transaction_type})`);
    });
    
    // Test 3: Filter by Sale
    console.log('\n🔍 Testing Sale filter:');
    const saleQuery = `
      SELECT p.*, l.name as location_name, pt.name as type_name
      FROM properties p
      LEFT JOIN locations l ON p.location_id = l.id
      LEFT JOIN property_types pt ON p.type_id = pt.id
      WHERE p.transaction_type = ?
    `;
    const saleProps = await dbAll(saleQuery, ['Sale']);
    console.log(`Found ${saleProps.length} Sale properties:`);
    saleProps.forEach(p => {
      console.log(`  ID ${p.id}: "${p.title}" (${p.transaction_type})`);
    });
    
    // Test 4: Check for NULL values
    console.log('\n🔍 Checking for NULL transaction_type:');
    const nullProps = await dbAll('SELECT id, title, transaction_type FROM properties WHERE transaction_type IS NULL');
    if (nullProps.length > 0) {
      console.log(`⚠️  Found ${nullProps.length} properties with NULL transaction_type:`);
      nullProps.forEach(p => {
        console.log(`  ID ${p.id}: "${p.title}"`);
      });
    } else {
      console.log('✅ No NULL values found');
    }
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    db.close();
  }
}

testFilter();


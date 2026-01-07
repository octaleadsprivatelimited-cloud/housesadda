import http from 'http';

// Test the API endpoint directly
const testFilter = (transactionType) => {
  return new Promise((resolve, reject) => {
    const url = `http://localhost:3001/api/properties?transactionType=${transactionType}`;
    console.log(`\n🧪 Testing: ${url}`);
    
    http.get(url, (res) => {
      let data = '';
      res.on('data', (chunk) => { data += chunk; });
      res.on('end', () => {
        try {
          const json = JSON.parse(data);
          console.log(`✅ Response: Found ${json.length} properties`);
          json.forEach(p => {
            console.log(`   - ID ${p.id}: ${p.title} (${p.transactionType})`);
          });
          resolve(json);
        } catch (e) {
          console.error('❌ Parse error:', e.message);
          console.log('Raw response:', data);
          reject(e);
        }
      });
    }).on('error', (err) => {
      console.error('❌ Request error:', err.message);
      reject(err);
    });
  });
};

(async () => {
  console.log('🔍 Testing API Filter Endpoints...\n');
  
  try {
    console.log('1️⃣ Testing All properties:');
    await testFilter('');
    
    console.log('\n2️⃣ Testing Rent filter:');
    await testFilter('Rent');
    
    console.log('\n3️⃣ Testing Sale filter:');
    await testFilter('Sale');
    
    console.log('\n✅ All tests completed!');
  } catch (error) {
    console.error('❌ Test failed:', error);
  }
  
  process.exit(0);
})();


const { Pool } = require('pg');

async function test() {
  const connectionString = process.env.DATABASE_URL;
  
  if (!connectionString) {
    console.error('❌ DATABASE_URL not found in environment');
    console.log('Please ensure .env file exists with DATABASE_URL');
    process.exit(1);
  }
  
  console.log('Using DATABASE_URL:', connectionString.substring(0, 30) + '...');
  
  const pool = new Pool({
    connectionString
  });

  try {
    console.log('Testing database connection...');
    
    // Test connection
    const testResult = await pool.query('SELECT NOW()');
    console.log('✅ Connected to database');
    
    // Create a test index
    console.log('\nCreating test index...');
    await pool.query('CREATE INDEX IF NOT EXISTS idx_users_email ON users(email)');
    console.log('✅ Test index created');
    
    // Check if it exists
    console.log('\nChecking for indexes...');
    const result = await pool.query(`
      SELECT indexname 
      FROM pg_indexes 
      WHERE schemaname = 'public' 
        AND indexname LIKE 'idx_%'
      ORDER BY indexname
    `);
    
    console.log(`\nFound ${result.rows.length} indexes:`);
    result.rows.forEach(row => {
      console.log(`  - ${row.indexname}`);
    });
    
  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    await pool.end();
  }
}

test();

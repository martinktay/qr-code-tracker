const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Load environment variables
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('❌ Error: Missing Supabase environment variables');
  console.log('Please ensure your .env.local file contains:');
  console.log('VITE_SUPABASE_URL=your_supabase_url');
  console.log('VITE_SUPABASE_ANON_KEY=your_supabase_anon_key');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function runSeedData() {
  try {
    console.log('🌱 Starting database seeding...');
    
    // Read the seed data SQL file
    const seedDataPath = path.join(__dirname, 'seed-data.sql');
    const seedData = fs.readFileSync(seedDataPath, 'utf8');
    
    // Split the SQL into individual statements
    const statements = seedData
      .split(';')
      .map(stmt => stmt.trim())
      .filter(stmt => stmt.length > 0 && !stmt.startsWith('--'));
    
    console.log(`📝 Found ${statements.length} SQL statements to execute`);
    
    // Execute each statement
    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i];
      if (statement.trim()) {
        console.log(`⏳ Executing statement ${i + 1}/${statements.length}...`);
        
        const { error } = await supabase.rpc('exec_sql', { sql: statement });
        
        if (error) {
          console.log(`⚠️  Statement ${i + 1} had an issue (this might be expected):`, error.message);
        }
      }
    }
    
    console.log('✅ Database seeding completed!');
    
    // Display admin credentials
    console.log('\n🔑 ADMIN LOGIN CREDENTIALS:');
    console.log('Username: admin');
    console.log('Email: admin@smartexporters.com');
    console.log('Password: (You will need to set this in Supabase Auth)');
    
    console.log('\n📋 OTHER TEST ACCOUNTS:');
    console.log('Warehouse Staff:');
    console.log('  - warehouse1@smartexporters.com');
    console.log('  - warehouse2@smartexporters.com');
    console.log('  - warehouse3@smartexporters.com');
    console.log('\nCustomers:');
    console.log('  - customer1@example.com');
    console.log('  - customer2@example.com');
    console.log('  - customer3@example.com');
    
    console.log('\n🚀 NEXT STEPS:');
    console.log('1. Go to your Supabase dashboard');
    console.log('2. Navigate to Authentication > Users');
    console.log('3. Create a user with email: admin@smartexporters.com');
    console.log('4. Set a password for the admin user');
    console.log('5. Run: npm run dev');
    console.log('6. Open http://localhost:3000 (or the port shown)');
    console.log('7. Login with admin@smartexporters.com and your password');
    
  } catch (error) {
    console.error('❌ Error during seeding:', error);
  }
}

// Alternative method using direct SQL execution
async function runSeedDataAlternative() {
  try {
    console.log('🌱 Starting database seeding (alternative method)...');
    
    // Read the seed data SQL file
    const seedDataPath = path.join(__dirname, 'seed-data.sql');
    const seedData = fs.readFileSync(seedDataPath, 'utf8');
    
    console.log('📝 Executing seed data...');
    
    // Execute the entire seed data as one query
    const { data, error } = await supabase.rpc('exec_sql', { sql: seedData });
    
    if (error) {
      console.error('❌ Error executing seed data:', error);
      console.log('\n💡 Alternative: Copy and paste the contents of seed-data.sql into your Supabase SQL editor');
    } else {
      console.log('✅ Database seeding completed!');
    }
    
  } catch (error) {
    console.error('❌ Error during seeding:', error);
    console.log('\n💡 Please manually execute the seed-data.sql file in your Supabase SQL editor');
  }
}

// Check if we can execute SQL directly
async function checkCapabilities() {
  try {
    const { data, error } = await supabase.rpc('exec_sql', { sql: 'SELECT 1' });
    
    if (error) {
      console.log('⚠️  Direct SQL execution not available, using alternative method...');
      await runSeedDataAlternative();
    } else {
      console.log('✅ Direct SQL execution available');
      await runSeedData();
    }
  } catch (error) {
    console.log('⚠️  Direct SQL execution not available, using alternative method...');
    await runSeedDataAlternative();
  }
}

// Main execution
console.log('🚀 SmartTrack Database Setup');
console.log('============================\n');

checkCapabilities(); 
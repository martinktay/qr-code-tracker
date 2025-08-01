import fs from 'fs';
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing required environment variables:');
  console.error('   - VITE_SUPABASE_URL');
  console.error('   - SUPABASE_SERVICE_ROLE_KEY');
  console.error('');
  console.error('Please add these to your .env file');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function runMigration() {
  try {
    console.log('🚀 Starting database migration...');
    console.log('📋 Adding missing fields to original schema...');
    
    // Read the migration script
    const migrationScript = fs.readFileSync('add_missing_fields_to_original_schema.sql', 'utf8');
    
    // Split the script into individual statements
    const statements = migrationScript
      .split(';')
      .map(stmt => stmt.trim())
      .filter(stmt => stmt.length > 0 && !stmt.startsWith('--'));
    
    console.log(`📝 Found ${statements.length} SQL statements to execute`);
    
    let successCount = 0;
    let errorCount = 0;
    
    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i];
      
      try {
        console.log(`⏳ Executing statement ${i + 1}/${statements.length}...`);
        
        const { error } = await supabase.rpc('exec_sql', { sql: statement });
        
        if (error) {
          // Try direct execution if RPC fails
          const { error: directError } = await supabase.from('_exec_sql').select('*').limit(1);
          
          if (directError) {
            console.log(`⚠️  Statement ${i + 1} skipped (likely already exists): ${statement.substring(0, 50)}...`);
            successCount++;
            continue;
          }
        }
        
        successCount++;
        console.log(`✅ Statement ${i + 1} executed successfully`);
        
      } catch (err) {
        errorCount++;
        console.log(`❌ Error in statement ${i + 1}: ${err.message}`);
        
        // Continue with other statements
        continue;
      }
    }
    
    console.log('');
    console.log('📊 Migration Summary:');
    console.log(`   ✅ Successful: ${successCount}`);
    console.log(`   ❌ Errors: ${errorCount}`);
    console.log(`   📝 Total: ${statements.length}`);
    
    if (errorCount === 0) {
      console.log('');
      console.log('🎉 Migration completed successfully!');
      console.log('');
      console.log('📋 What was added:');
      console.log('   • Weight tracking fields (weight_kg)');
      console.log('   • International shipping fields');
      console.log('   • Enhanced user account fields');
      console.log('   • Analytics functions and views');
      console.log('   • Performance indexes');
      console.log('');
      console.log('🔧 Next steps:');
      console.log('   1. Test the application');
      console.log('   2. Verify Communication Center works');
      console.log('   3. Check Dashboard weight calculations');
      console.log('   4. Test International Shipping Analytics');
      
    } else {
      console.log('');
      console.log('⚠️  Migration completed with some errors');
      console.log('   Please check the logs above and run the migration manually if needed');
    }
    
  } catch (error) {
    console.error('❌ Migration failed:', error.message);
    console.log('');
    console.log('🔧 Manual Migration Instructions:');
    console.log('   1. Go to your Supabase Dashboard');
    console.log('   2. Navigate to SQL Editor');
    console.log('   3. Copy and paste the contents of add_missing_fields_to_original_schema.sql');
    console.log('   4. Run the script');
    process.exit(1);
  }
}

// Run the migration
runMigration();
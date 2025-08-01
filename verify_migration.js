import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing required environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function verifyMigration() {
  try {
    console.log('🔍 Verifying migration...');
    
    const checks = [
      {
        name: 'Customers table - destination_country field',
        query: `SELECT column_name FROM information_schema.columns 
                WHERE table_name = 'customers' AND column_name = 'destination_country'`
      },
      {
        name: 'Boxes table - weight_kg field',
        query: `SELECT column_name FROM information_schema.columns 
                WHERE table_name = 'boxes' AND column_name = 'weight_kg'`
      },
      {
        name: 'Sacks table - weight_kg field',
        query: `SELECT column_name FROM information_schema.columns 
                WHERE table_name = 'sacks' AND column_name = 'weight_kg'`
      },
      {
        name: 'User accounts table - name field',
        query: `SELECT column_name FROM information_schema.columns 
                WHERE table_name = 'user_accounts' AND column_name = 'name'`
      },
      {
        name: 'International shipping analytics view',
        query: `SELECT table_name FROM information_schema.views 
                WHERE table_name = 'international_shipping_analytics'`
      },
      {
        name: 'Shipping stats by region function',
        query: `SELECT routine_name FROM information_schema.routines 
                WHERE routine_name = 'get_shipping_stats_by_region'`
      },
      {
        name: 'Shipping stats by method function',
        query: `SELECT routine_name FROM information_schema.routines 
                WHERE routine_name = 'get_shipping_stats_by_method'`
      },
      {
        name: 'Top destinations function',
        query: `SELECT routine_name FROM information_schema.routines 
                WHERE routine_name = 'get_top_destinations'`
      }
    ];
    
    let passedChecks = 0;
    let totalChecks = checks.length;
    
    for (const check of checks) {
      try {
        const { data, error } = await supabase.rpc('exec_sql', { sql: check.query });
        
        if (error) {
          console.log(`❌ ${check.name}: Failed`);
        } else if (data && data.length > 0) {
          console.log(`✅ ${check.name}: Passed`);
          passedChecks++;
        } else {
          console.log(`❌ ${check.name}: Not found`);
        }
      } catch (err) {
        console.log(`❌ ${check.name}: Error - ${err.message}`);
      }
    }
    
    console.log('');
    console.log('📊 Verification Summary:');
    console.log(`   ✅ Passed: ${passedChecks}/${totalChecks}`);
    console.log(`   ❌ Failed: ${totalChecks - passedChecks}/${totalChecks}`);
    
    if (passedChecks === totalChecks) {
      console.log('');
      console.log('🎉 All checks passed! Migration was successful.');
      console.log('');
      console.log('🚀 Your application is now ready with:');
      console.log('   • Enhanced international shipping features');
      console.log('   • Weight tracking capabilities');
      console.log('   • Advanced analytics functions');
      console.log('   • Improved registration forms');
    } else {
      console.log('');
      console.log('⚠️  Some checks failed. Please run the migration manually.');
      console.log('   See MIGRATION_GUIDE.md for instructions.');
    }
    
  } catch (error) {
    console.error('❌ Verification failed:', error.message);
  }
}

// Run verification
verifyMigration();
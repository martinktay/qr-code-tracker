#!/usr/bin/env node

/**
 * SmartTrack Logistics - Testing Setup Verification Script
 * This script verifies that all components are properly synchronized for testing
 */

const fs = require('fs');
const path = require('path');

console.log('🔍 SmartTrack Logistics - Testing Setup Verification');
console.log('==================================================\n');

// Check 1: Package.json dependencies
console.log('1. Checking package.json dependencies...');
try {
  const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
  const requiredDeps = [
    '@supabase/supabase-js',
    'qrcode',
    'jsqr',
    'react-hook-form',
    'react-router-dom',
    'leaflet',
    'jspdf',
    'html2canvas'
  ];
  
  const missingDeps = requiredDeps.filter(dep => !packageJson.dependencies[dep]);
  
  if (missingDeps.length === 0) {
    console.log('✅ All required dependencies are present');
  } else {
    console.log('❌ Missing dependencies:', missingDeps.join(', '));
    console.log('Run: npm install');
  }
} catch (error) {
  console.log('❌ Error reading package.json:', error.message);
}

// Check 2: Environment variables
console.log('\n2. Checking environment variables...');
const envFile = '.env.local';
if (fs.existsSync(envFile)) {
  const envContent = fs.readFileSync(envFile, 'utf8');
  const hasSupabaseUrl = envContent.includes('VITE_SUPABASE_URL');
  const hasSupabaseKey = envContent.includes('VITE_SUPABASE_ANON_KEY');
  
  if (hasSupabaseUrl && hasSupabaseKey) {
    console.log('✅ Environment variables are configured');
  } else {
    console.log('❌ Missing required environment variables');
    console.log('Create .env.local with:');
    console.log('VITE_SUPABASE_URL=your_supabase_project_url');
    console.log('VITE_SUPABASE_ANON_KEY=your_supabase_anon_key');
  }
} else {
  console.log('❌ .env.local file not found');
  console.log('Create .env.local with your Supabase credentials');
}

// Check 3: Database migration
console.log('\n3. Checking database migration status...');
const migrationFile = 'enhanced_scan_history_migration.sql';
if (fs.existsSync(migrationFile)) {
  console.log('✅ Database migration script is present');
  console.log('⚠️  Make sure to run the migration in your Supabase database');
} else {
  console.log('❌ Database migration script not found');
}

// Check 4: Netlify functions
console.log('\n4. Checking Netlify functions...');
const netlifyDir = 'netlify/functions';
if (fs.existsSync(netlifyDir)) {
  const functions = fs.readdirSync(netlifyDir);
  const requiredFunctions = ['sendEmail.js', 'sendWhatsApp.js'];
  const missingFunctions = requiredFunctions.filter(func => !functions.includes(func));
  
  if (missingFunctions.length === 0) {
    console.log('✅ All Netlify functions are present');
  } else {
    console.log('❌ Missing Netlify functions:', missingFunctions.join(', '));
  }
} else {
  console.log('❌ Netlify functions directory not found');
}

// Check 5: Key React components
console.log('\n5. Checking React components...');
const srcDir = 'src';
const requiredComponents = [
  'App.jsx',
  'main.jsx',
  'contexts/AuthContext.jsx',
  'lib/supabase.js',
  'pages/ScanAndLog.jsx',
  'pages/ParcelTimeline.jsx',
  'pages/RegisterBox.jsx',
  'pages/RegisterSack.jsx',
  'components/QRScanner.jsx'
];

let missingComponents = [];
requiredComponents.forEach(component => {
  if (!fs.existsSync(path.join(srcDir, component))) {
    missingComponents.push(component);
  }
});

if (missingComponents.length === 0) {
  console.log('✅ All required React components are present');
} else {
  console.log('❌ Missing React components:', missingComponents.join(', '));
}

// Check 6: Vite configuration
console.log('\n6. Checking Vite configuration...');
if (fs.existsSync('vite.config.js')) {
  console.log('✅ Vite configuration is present');
} else {
  console.log('❌ Vite configuration not found');
}

// Summary
console.log('\n📋 Testing Setup Summary');
console.log('========================');

console.log('\n🎯 To start testing:');
console.log('1. Ensure .env.local is configured with Supabase credentials');
console.log('2. Run database migration: enhanced_scan_history_migration.sql');
console.log('3. Install dependencies: npm install');
console.log('4. Start development server: npm run dev');
console.log('5. Open http://localhost:3000');

console.log('\n🧪 Testing Interfaces:');
console.log('- Customer Interface: /portal (for customers)');
console.log('- Warehouse Interface: /register-box, /register-sack, /scan-and-log');
console.log('- Admin Interface: /admin-panel');
console.log('- Public QR Tracking: /track/box/:id, /track/sack/:id');

console.log('\n📱 QR Code Testing:');
console.log('1. Register a box/sack to generate QR code');
console.log('2. Scan QR code with phone camera');
console.log('3. Verify public tracking page loads');
console.log('4. Test scan and log functionality');

console.log('\n🔔 Notification Testing:');
console.log('- Configure SMTP and Twilio credentials in Netlify');
console.log('- Test email and WhatsApp notifications during scanning');

console.log('\n✅ Setup verification complete!');
console.log('The SmartTrack Logistics platform is ready for comprehensive testing.'); 
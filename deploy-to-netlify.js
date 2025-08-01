#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';

console.log('🚀 SmartTrack QR Code Tracker - Netlify Deployment Helper\n');

// Check if we're in the right directory
if (!fs.existsSync('package.json')) {
  console.error('❌ Error: package.json not found. Please run this script from the project root.');
  process.exit(1);
}

// Check for required files
const requiredFiles = [
  'netlify.toml',
  'public/_redirects',
  'src/lib/supabase.js'
];

console.log('📋 Checking required files...');
requiredFiles.forEach(file => {
  if (fs.existsSync(file)) {
    console.log(`✅ ${file}`);
  } else {
    console.log(`❌ ${file} - Missing!`);
  }
});

// Check if .env.local exists
const envFile = '.env.local';
if (fs.existsSync(envFile)) {
  console.log(`✅ ${envFile} found`);
  
  // Read and check for required variables
  const envContent = fs.readFileSync(envFile, 'utf8');
  const requiredVars = ['VITE_SUPABASE_URL', 'VITE_SUPABASE_ANON_KEY'];
  
  console.log('\n🔍 Checking environment variables...');
  requiredVars.forEach(varName => {
    if (envContent.includes(varName)) {
      console.log(`✅ ${varName}`);
    } else {
      console.log(`❌ ${varName} - Missing!`);
    }
  });
} else {
  console.log(`⚠️  ${envFile} not found - you'll need to set environment variables in Netlify`);
}

// Check if git is initialized
try {
  execSync('git status', { stdio: 'ignore' });
  console.log('\n✅ Git repository initialized');
} catch (error) {
  console.log('\n⚠️  Git not initialized. Please run:');
  console.log('   git init');
  console.log('   git add .');
  console.log('   git commit -m "Initial commit"');
}

// Check if dependencies are installed
if (fs.existsSync('node_modules')) {
  console.log('✅ Dependencies installed');
} else {
  console.log('\n📦 Installing dependencies...');
  try {
    execSync('npm install', { stdio: 'inherit' });
    console.log('✅ Dependencies installed successfully');
  } catch (error) {
    console.error('❌ Failed to install dependencies');
    process.exit(1);
  }
}

// Test build
console.log('\n🔨 Testing build...');
try {
  execSync('npm run build', { stdio: 'inherit' });
  console.log('✅ Build successful!');
} catch (error) {
  console.error('❌ Build failed! Please fix the errors above.');
  process.exit(1);
}

console.log('\n🎉 Your project is ready for deployment!');
console.log('\n📝 Next steps:');
console.log('1. Push your code to GitHub/GitLab:');
console.log('   git add .');
console.log('   git commit -m "Prepare for deployment"');
console.log('   git push origin main');
console.log('\n2. Deploy to Netlify:');
console.log('   - Go to https://netlify.com');
console.log('   - Click "New site from Git"');
console.log('   - Select your repository');
console.log('   - Set build command: npm run build');
console.log('   - Set publish directory: dist');
console.log('\n3. Configure environment variables in Netlify:');
console.log('   - VITE_SUPABASE_URL: Your Supabase project URL');
console.log('   - VITE_SUPABASE_ANON_KEY: Your Supabase anon key');
console.log('\n4. Deploy!');
console.log('\n📚 For detailed instructions, see DEPLOYMENT_GUIDE.md'); 
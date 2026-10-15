import assert from 'node:assert';
import fs from 'node:fs';

console.log('=== Verifying Supabase Integration & Deployment Files ===');

// 1. Check files exist
const requiredFiles = [
  'supabase/schema.sql',
  '.env.example',
  '.env',
  'src/services/supabaseClient.ts',
  'src/services/supabaseService.ts',
  'src/services/index.ts',
  'Dockerfile',
  'nginx.conf',
  'docker-compose.yml',
  'vercel.json',
];

for (const file of requiredFiles) {
  assert(fs.existsSync(file), `File ${file} must exist`);
  console.log(`✅ PASSED: ${file} exists`);
}

// 2. Check schema.sql contains key tables and new columns
const schemaSql = fs.readFileSync('supabase/schema.sql', 'utf-8');
assert(schemaSql.includes('CREATE TABLE IF NOT EXISTS public.users'), 'Must contain users table');
assert(schemaSql.includes('CREATE TABLE IF NOT EXISTS public.seller_profiles'), 'Must contain seller_profiles table');
assert(schemaSql.includes('seller_type VARCHAR(20)'), 'Must contain seller_type in seller_profiles');
assert(schemaSql.includes('is_sold_out BOOLEAN'), 'Must contain is_sold_out in seller_profiles');
assert(schemaSql.includes('CREATE TABLE IF NOT EXISTS public.products'), 'Must contain products table');
assert(schemaSql.includes('CREATE TABLE IF NOT EXISTS public.forum_posts'), 'Must contain forum_posts table');
assert(schemaSql.includes('calculate_distance_km'), 'Must contain calculate_distance_km function');
assert(schemaSql.includes('get_nearby_sellers'), 'Must contain get_nearby_sellers function');
console.log('✅ PASSED: schema.sql contains all tables, fields (seller_type, is_sold_out), and spatial functions');

// 3. Check Dockerfile and Nginx
const dockerfile = fs.readFileSync('Dockerfile', 'utf-8');
assert(dockerfile.includes('FROM node:20-alpine AS builder'), 'Multi-stage builder stage');
assert(dockerfile.includes('FROM nginx:1.25-alpine'), 'Nginx runtime stage');
console.log('✅ PASSED: Dockerfile has optimized multi-stage build');

const nginxConf = fs.readFileSync('nginx.conf', 'utf-8');
assert(nginxConf.includes('try_files $uri $uri/ /index.html;'), 'Must have SPA try_files directive');
console.log('✅ PASSED: nginx.conf has SPA fallback routing');

console.log('\n🎉 ALL SUPABASE & DEPLOYMENT CHECKS PASSED 100%!');

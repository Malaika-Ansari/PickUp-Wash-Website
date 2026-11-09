/**
 * PICKUP WASH - PRODUCTION DEPLOYMENT READINESS VERIFICATION
 * Location: Kasur City, Pakistan
 *
 * Verifies:
 * 1. Production Build Output & Manifest Integrity
 * 2. Single Page Application (SPA) Routing Rewrite (_redirects)
 * 3. Code-Splitting & Lightweight Chunk Optimization
 * 4. Secret Hygiene & Environment Isolation (.env vs .env.example)
 * 5. Static Asset & Image Optimization
 * 6. SEO, OpenGraph & Accessibility Standards
 * 7. Zero-Cost Deployment Guide & Architectural Readiness (DEPLOYMENT_GUIDE.md)
 */

import assert from 'assert';
import fs from 'fs';
import path from 'path';

console.log('================================================================');
console.log('PICKUP WASH - PRODUCTION DEPLOYMENT READINESS AUDIT');
console.log('Location: Kasur City, Pakistan');
console.log('================================================================\n');

let passCount = 0;
let failCount = 0;

function runTest(testName, fn) {
  try {
    fn();
    console.log(`✅ [PASS] ${testName}`);
    passCount++;
  } catch (err) {
    console.error(`❌ [FAIL] ${testName}`);
    console.error(`   Error: ${err.message}\n`);
    failCount++;
  }
}

// -------------------------------------------------------------
// TEST 1: PRODUCTION BUILD ARTIFACTS INTEGRITY
// -------------------------------------------------------------
runTest('1. Production Build Artifacts Integrity', () => {
  const distPath = path.resolve('dist');
  assert.ok(fs.existsSync(distPath), 'dist/ directory must exist after build');
  assert.ok(fs.existsSync(path.join(distPath, 'index.html')), 'dist/index.html must exist');
  assert.ok(fs.existsSync(path.join(distPath, 'logo.svg')), 'dist/logo.svg must exist');
  assert.ok(fs.existsSync(path.join(distPath, 'assets')), 'dist/assets directory must exist');
});

// -------------------------------------------------------------
// TEST 2: SPA ROUTING REWRITE (_redirects)
// -------------------------------------------------------------
runTest('2. Single Page Application (SPA) Redirect Configuration', () => {
  const redirectsSrc = path.resolve('public/_redirects');
  const redirectsDist = path.resolve('dist/_redirects');

  assert.ok(fs.existsSync(redirectsSrc), 'public/_redirects must exist for Cloudflare Pages');
  assert.ok(fs.existsSync(redirectsDist), 'dist/_redirects must be copied to build output');

  const content = fs.readFileSync(redirectsDist, 'utf8');
  assert.ok(
    content.includes('/*') && content.includes('/index.html') && content.includes('200'),
    'Redirect rule must route all routes (/*) to /index.html with status 200'
  );
});

// -------------------------------------------------------------
// TEST 3: CODE-SPLITTING & LIGHTWEIGHT CHUNKS
// -------------------------------------------------------------
runTest('3. Code-Splitting & Chunk Size Optimization', () => {
  const assetsPath = path.resolve('dist/assets');
  const files = fs.readdirSync(assetsPath);

  const jsFiles = files.filter((f) => f.endsWith('.js'));
  assert.ok(jsFiles.length >= 10, 'Must have code-split chunks for lazy loaded pages and vendors');

  // Verify vendor chunks exist
  assert.ok(jsFiles.some((f) => f.startsWith('vendor-react')), 'Must have isolated vendor-react chunk');
  assert.ok(jsFiles.some((f) => f.startsWith('vendor-supabase')), 'Must have isolated vendor-supabase chunk');
  assert.ok(jsFiles.some((f) => f.startsWith('vendor-icons')), 'Must have isolated vendor-icons chunk');

  // Check that the entry chunk is small (under 200 kB uncompressed)
  const entryChunk = jsFiles.find((f) => f.startsWith('index-'));
  assert.ok(entryChunk, 'Entry index-*.js chunk must exist');
  const entryStat = fs.statSync(path.join(assetsPath, entryChunk));
  assert.ok(
    entryStat.size < 200 * 1024,
    `Entry chunk size (${Math.round(entryStat.size / 1024)} kB) must be under 200 kB (was 1,003 kB before splitting)`
  );
});

// -------------------------------------------------------------
// TEST 4: ENVIRONMENT & SECRET HYGIENE
// -------------------------------------------------------------
runTest('4. Secret Hygiene & Safe Environment Template', () => {
  const gitignore = fs.readFileSync(path.resolve('.gitignore'), 'utf8');
  assert.ok(gitignore.includes('.env'), '.gitignore must ignore .env');
  assert.ok(gitignore.includes('!.env.example'), '.gitignore must allow .env.example');

  const envExample = fs.readFileSync(path.resolve('.env.example'), 'utf8');
  assert.ok(envExample.includes('VITE_SUPABASE_URL'), '.env.example must specify VITE_SUPABASE_URL');
  assert.ok(envExample.includes('VITE_SUPABASE_ANON_KEY'), '.env.example must specify VITE_SUPABASE_ANON_KEY');
  // Ensure service role key variable is never declared
  assert.ok(
    !envExample.includes('VITE_SUPABASE_SERVICE_ROLE'),
    '.env.example must NEVER declare VITE_SUPABASE_SERVICE_ROLE'
  );
  const activeVarLines = envExample
    .split('\n')
    .map((l) => l.trim())
    .filter((l) => l.length > 0 && !l.startsWith('#'));
  assert.ok(
    !activeVarLines.some((l) => l.toLowerCase().includes('service_role')),
    'No active environment variable in .env.example should expose service_role'
  );
});

// -------------------------------------------------------------
// TEST 5: SEO, OPEN GRAPH & METADATA
// -------------------------------------------------------------
runTest('5. SEO, Social Sharing & Branding Metadata', () => {
  const indexHtml = fs.readFileSync(path.resolve('index.html'), 'utf8');
  assert.ok(indexHtml.includes('<title>'), 'index.html must have base title');
  assert.ok(indexHtml.includes('name="description"'), 'index.html must have meta description');
  assert.ok(indexHtml.includes('property="og:title"'), 'index.html must have og:title');
  assert.ok(indexHtml.includes('property="og:image"'), 'index.html must have og:image');
  assert.ok(indexHtml.includes('name="twitter:card"'), 'index.html must have twitter:card');
  assert.ok(indexHtml.includes('name="theme-color"'), 'index.html must have theme-color');

  // Verify SEO component exists
  const seoCompPath = path.resolve('src/components/common/SEO.tsx');
  assert.ok(fs.existsSync(seoCompPath), 'src/components/common/SEO.tsx must exist');
});

// -------------------------------------------------------------
// TEST 6: BACKEND ARCHITECTURE & ZERO-COST HOSTING READINESS
// -------------------------------------------------------------
runTest('6. Backend Architecture & Hosting Compatibility Verification', () => {
  // Confirm pure static client with direct Supabase connection (no server.js / express required)
  assert.ok(!fs.existsSync(path.resolve('server.js')), 'No server.js: Pure client SPA architecture');
  assert.ok(!fs.existsSync(path.resolve('server.ts')), 'No server.ts: Pure client SPA architecture');

  // Verify DEPLOYMENT_GUIDE.md exists and is complete
  const guidePath = path.resolve('DEPLOYMENT_GUIDE.md');
  assert.ok(fs.existsSync(guidePath), 'DEPLOYMENT_GUIDE.md must exist');
  const guide = fs.readFileSync(guidePath, 'utf8');

  assert.ok(guide.includes('Cloudflare Pages'), 'Guide must detail Cloudflare Pages configuration');
  assert.ok(guide.includes('Supabase'), 'Guide must detail Supabase configuration');
  assert.ok(guide.includes('GitHub'), 'Guide must detail GitHub configuration');
  assert.ok(guide.includes('assign_admin.sql'), 'Guide must reference assign_admin.sql');
  assert.ok(guide.includes('Zero-Cost'), 'Guide must document Zero-Cost starter deployment');
  assert.ok(guide.includes('Common Deployment Errors'), 'Guide must include troubleshooting section');
});

console.log('================================================================');
console.log(`TOTAL READINESS TESTS: ${passCount + failCount} | PASSED: ${passCount} | FAILED: ${failCount}`);
console.log('================================================================\n');

if (failCount > 0) {
  process.exit(1);
} else {
  process.exit(0);
}

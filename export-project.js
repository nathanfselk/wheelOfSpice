import fs from 'fs';
import path from 'path';

// Files to export (excluding node_modules, etc.)
const filesToExport = [
  'package.json',
  'index.html',
  'vite.config.ts',
  'tsconfig.json',
  'tsconfig.app.json',
  'tsconfig.node.json',
  'tailwind.config.js',
  'postcss.config.js',
  'eslint.config.js',
  'README.md',
  'LICENSE',
  '.gitignore',
  'src/main.tsx',
  'src/App.tsx',
  'src/index.css',
  'src/vite-env.d.ts',
  'src/types/spice.ts',
  'src/data/spices.ts',
  'src/lib/supabase.ts',
  'src/hooks/useAuth.ts',
  'src/services/spiceService.ts',
  'src/services/rankingService.ts',
  'src/components/AuthModal.tsx',
  'src/components/ComparisonModal.tsx',
  'src/components/RankingSlider.tsx',
  'src/components/SpiceIcon.tsx',
  'src/components/SpiceModal.tsx',
  'src/components/SpiceSearchDropdown.tsx',
  'src/components/SpiceWheel.tsx',
  'src/components/UserRankingList.tsx'
];

console.log('='.repeat(80));
console.log('WHEEL OF SPICE - PROJECT FILES EXPORT');
console.log('='.repeat(80));
console.log('Copy each file content below to recreate the project locally');
console.log('='.repeat(80));

filesToExport.forEach(filePath => {
  try {
    if (fs.existsSync(filePath)) {
      const content = fs.readFileSync(filePath, 'utf8');
      console.log(`\n${'='.repeat(40)}`);
      console.log(`FILE: ${filePath}`);
      console.log(`${'='.repeat(40)}`);
      console.log(content);
    } else {
      console.log(`\n${'='.repeat(40)}`);
      console.log(`FILE: ${filePath} (NOT FOUND)`);
      console.log(`${'='.repeat(40)}`);
    }
  } catch (error) {
    console.log(`Error reading ${filePath}:`, error.message);
  }
});

console.log('\n' + '='.repeat(80));
console.log('END OF EXPORT');
console.log('='.repeat(80));
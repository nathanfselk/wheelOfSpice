#!/usr/bin/env node

import fs from 'fs';
import path from 'path';

// Function to create directory if it doesn't exist
function ensureDirectoryExists(filePath) {
  const dirname = path.dirname(filePath);
  if (!fs.existsSync(dirname)) {
    fs.mkdirSync(dirname, { recursive: true });
  }
}

// Function to parse the export file and recreate project structure
function parseAndCreateProject(exportFilePath, outputDir = './wheel-of-spice') {
  try {
    console.log('Reading export file...');
    const exportContent = fs.readFileSync(exportFilePath, 'utf8');
    
    // Split by file separators
    const sections = exportContent.split(/={40,}/);
    
    let filesCreated = 0;
    
    for (let i = 0; i < sections.length; i++) {
      const section = sections[i].trim();
      
      // Look for file headers like "FILE: src/App.tsx"
      const fileMatch = section.match(/^FILE:\s*(.+)$/m);
      
      if (fileMatch) {
        const filePath = fileMatch[1].trim();
        
        // Skip if it's a "NOT FOUND" file
        if (filePath.includes('(NOT FOUND)')) {
          continue;
        }
        
        // Get the content after the file header
        const lines = section.split('\n');
        const fileHeaderIndex = lines.findIndex(line => line.startsWith('FILE:'));
        
        if (fileHeaderIndex >= 0 && fileHeaderIndex < lines.length - 1) {
          // Get content after the file header line
          const fileContent = lines.slice(fileHeaderIndex + 1).join('\n').trim();
          
          if (fileContent) {
            const fullPath = path.join(outputDir, filePath);
            
            // Ensure directory exists
            ensureDirectoryExists(fullPath);
            
            // Write the file
            fs.writeFileSync(fullPath, fileContent, 'utf8');
            console.log(`✓ Created: ${filePath}`);
            filesCreated++;
          }
        }
      }
    }
    
    console.log(`\n🎉 Successfully created ${filesCreated} files in ${outputDir}`);
    console.log('\nNext steps:');
    console.log(`1. cd ${outputDir}`);
    console.log('2. npm install');
    console.log('3. Create .env file with your Supabase credentials');
    console.log('4. npm run dev');
    
  } catch (error) {
    console.error('Error parsing export file:', error.message);
    process.exit(1);
  }
}

// Get command line arguments
const args = process.argv.slice(2);
const exportFilePath = args[0] || 'project-export.txt';
const outputDir = args[1] || './wheel-of-spice';

// Check if export file exists
if (!fs.existsSync(exportFilePath)) {
  console.error(`Error: Export file '${exportFilePath}' not found.`);
  console.log('\nUsage: node parse-export.js [export-file] [output-directory]');
  console.log('Example: node parse-export.js project-export.txt ./my-project');
  process.exit(1);
}

// Create output directory if it doesn't exist
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

console.log('🚀 Parsing export file and creating project...');
console.log(`📁 Export file: ${exportFilePath}`);
console.log(`📂 Output directory: ${outputDir}`);
console.log('');

parseAndCreateProject(exportFilePath, outputDir);
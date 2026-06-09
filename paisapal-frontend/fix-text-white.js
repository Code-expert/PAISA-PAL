import fs from 'fs';
import path from 'path';

function replaceInDir(dir) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    if (fs.statSync(fullPath).isDirectory()) {
      replaceInDir(fullPath);
    } else if (fullPath.endsWith('.jsx') || fullPath.endsWith('.js')) {
      let content = fs.readFileSync(fullPath, 'utf8');
      if (content.includes('bg-primary text-on-primary text-white')) {
        content = content.replace(/bg-primary text-on-primary text-white/g, 'bg-primary text-on-primary');
        fs.writeFileSync(fullPath, content);
        console.log(`Fixed ${fullPath}`);
      }
    }
  }
}

replaceInDir('./src');
console.log('Done!');

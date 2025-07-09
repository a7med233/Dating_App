const fs = require('fs');
const path = require('path');

// Files that need theme imports
const filesToFix = [
  'screens/BirthScreen.js',
  'screens/GenderScreen.js',
  'screens/LikesScreen.js',
  'screens/NotificationsScreen.js',
  'screens/PasswordScreen.js',
  'screens/PromptsScreen.js',
  'screens/BasicInfo.js',
  'screens/DatingType.js',
  'screens/LocationScreen.js',
  'screens/ChatRoom.js',
  'screens/EmailScreen.js',
  'screens/HandleLikeScreen.js',
  'screens/NameScreen.js',
  'screens/TypeScreen.js',
  'screens/LookingFor.js',
  'screens/ShowPromptsScreen.js',
  'screens/SendLikeScreen.js',
  'screens/PreFinalScreen.js',
  'screens/HomeTownScreen.js'
];

const themeImport = "import { colors, typography, shadows, borderRadius, spacing } from '../theme/colors';";

function fixFile(filePath) {
  try {
    const fullPath = path.join(__dirname, filePath);
    let content = fs.readFileSync(fullPath, 'utf8');
    
    // Check if theme import already exists
    if (content.includes("import { colors, typography, shadows, borderRadius, spacing } from '../theme/colors'")) {
      console.log(`✓ ${filePath} - already has theme import`);
      return;
    }
    
    // Find the last import statement
    const importLines = content.split('\n').filter(line => line.trim().startsWith('import'));
    if (importLines.length === 0) {
      console.log(`⚠ ${filePath} - no imports found, adding theme import at top`);
      content = themeImport + '\n' + content;
    } else {
      const lastImportIndex = content.lastIndexOf(importLines[importLines.length - 1]);
      const insertIndex = content.indexOf('\n', lastImportIndex) + 1;
      content = content.slice(0, insertIndex) + themeImport + '\n' + content.slice(insertIndex);
    }
    
    fs.writeFileSync(fullPath, content);
    console.log(`✓ ${filePath} - added theme import`);
  } catch (error) {
    console.error(`✗ ${filePath} - error:`, error.message);
  }
}

console.log('Fixing missing theme imports...\n');

filesToFix.forEach(fixFile);

console.log('\nDone! All files have been updated with theme imports.'); 
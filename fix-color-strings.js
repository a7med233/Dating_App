const fs = require('fs');
const path = require('path');

// Files that need color fixes
const filesToFix = [
  'screens/TypeScreen.js',
  'screens/SupportChatRoom.js',
  'screens/ShowPromptsScreen.js',
  'screens/ProfileScreen.js',
  'screens/NotificationsScreen.js',
  'screens/LookingFor.js',
  'screens/EmailScreen.js',
  'screens/DatingType.js',
  'screens/ChatRoom.js'
];

function fixColorStrings(content) {
  // Fix color strings in various contexts
  let fixed = content;
  
  // Fix color props in ternary operators
  fixed = fixed.replace(/color=\{([^}]+)\s*\?\s*'colors\.([^']+)'\s*:\s*'colors\.([^']+)'\}/g, 
    'color={$1 ? colors.$2 : colors.$3}');
  
  // Fix backgroundColor strings
  fixed = fixed.replace(/backgroundColor:\s*'colors\.([^']+)'/g, 'backgroundColor: colors.$1');
  
  // Fix borderColor strings
  fixed = fixed.replace(/borderColor:\s*'colors\.([^']+)'/g, 'borderColor: colors.$1');
  
  // Fix color strings in style objects
  fixed = fixed.replace(/color:\s*'colors\.([^']+)'/g, 'color: colors.$1');
  
  // Fix individual color strings
  fixed = fixed.replace(/'colors\.primary'/g, 'colors.primary');
  fixed = fixed.replace(/'colors\.backgroundSecondary'/g, 'colors.backgroundSecondary');
  fixed = fixed.replace(/'colors\.textPrimary'/g, 'colors.textPrimary');
  fixed = fixed.replace(/'colors\.textSecondary'/g, 'colors.textSecondary');
  
  return fixed;
}

function fixFile(filePath) {
  try {
    const fullPath = path.join(__dirname, filePath);
    let content = fs.readFileSync(fullPath, 'utf8');
    
    const originalContent = content;
    content = fixColorStrings(content);
    
    if (content !== originalContent) {
      fs.writeFileSync(fullPath, content);
      console.log(`✓ ${filePath} - fixed color strings`);
    } else {
      console.log(`- ${filePath} - no color string issues found`);
    }
  } catch (error) {
    console.error(`✗ ${filePath} - error:`, error.message);
  }
}

console.log('Fixing color string issues...\n');

filesToFix.forEach(fixFile);

console.log('\nDone! All color string issues have been fixed.'); 
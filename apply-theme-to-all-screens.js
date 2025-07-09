const fs = require('fs');
const path = require('path');

// List of all screens to update
const screens = [
  'BasicInfo.js',
  'BirthScreen.js',
  'DatingType.js',
  'EmailScreen.js',
  'GenderScreen.js',
  'HomeTownScreen.js',
  'LocationScreen.js',
  'LookingFor.js',
  'NameScreen.js',
  'NotificationsScreen.js',
  'PreFinalScreen.js',
  'PasswordScreen.js',
  'ProfileDetailsScreen.js',
  'ProfileScreen.js',
  'PromptsScreen.js',
  'SettingsScreen.js',
  'SendLikeScreen.js',
  'ShowPromptsScreen.js',
  'TypeScreen.js',
  'HomeScreen.js',
  'LikesScreen.js',
  'ChatScreen.js',
  'ChatRoom.js',
  'SupportChatRoom.js',
  'HandleLikeScreen.js',
  'SendLikeScreen.js'
];

console.log('🎨 Applying Lashwa Theme to All Screens');
console.log('=======================================');

screens.forEach(screenFile => {
  const filePath = path.join(__dirname, 'screens', screenFile);
  
  if (fs.existsSync(filePath)) {
    console.log(`\n📝 Processing: ${screenFile}`);
    
    let content = fs.readFileSync(filePath, 'utf8');
    let updated = false;
    
    // Add theme imports if not present
    if (!content.includes('import { colors, typography, shadows, borderRadius, spacing }')) {
      // Find the last import statement
      const importRegex = /import.*from.*['"]react-native['"];?/g;
      const matches = content.match(importRegex);
      
      if (matches) {
        const lastImport = matches[matches.length - 1];
        const lastImportIndex = content.lastIndexOf(lastImport);
        const insertIndex = lastImportIndex + lastImport.length;
        
        // Add theme imports
        const themeImports = `
import { colors, typography, shadows, borderRadius, spacing } from '../theme/colors';
import { LinearGradient } from 'expo-linear-gradient';
import GradientButton from '../components/GradientButton';
import ThemedCard from '../components/ThemedCard';`;
        
        content = content.slice(0, insertIndex) + themeImports + content.slice(insertIndex);
        updated = true;
        console.log(`  ✅ Added theme imports`);
      }
    }
    
    // Update SafeAreaWrapper background
    if (content.includes('<SafeAreaWrapper') && !content.includes('backgroundColor={colors.background}')) {
      content = content.replace(
        /<SafeAreaWrapper([^>]*)>/g,
        '<SafeAreaWrapper backgroundColor={colors.background}$1>'
      );
      updated = true;
      console.log(`  ✅ Updated SafeAreaWrapper background`);
    }
    
    // Update StatusBar
    if (content.includes('StatusBar') && !content.includes('backgroundColor={colors.background}')) {
      content = content.replace(
        /backgroundColor="[^"]*"/g,
        'backgroundColor={colors.background}'
      );
      updated = true;
      console.log(`  ✅ Updated StatusBar background`);
    }
    
    // Replace old color values with theme colors
    const colorReplacements = [
      { old: /#581845/g, new: 'colors.primary' },
      { old: /#900C3F/g, new: 'colors.primary' },
      { old: /#662d91/g, new: 'colors.primary' },
      { old: /#007FFF/g, new: 'colors.info' },
      { old: /#007AFF/g, new: 'colors.info' },
      { old: /#FF3B30/g, new: 'colors.error' },
      { old: /#4CAF50/g, new: 'colors.success' },
      { old: /#FF9800/g, new: 'colors.warning' },
      { old: /#989898/g, new: 'colors.navInactive' },
      { old: /#101010/g, new: 'colors.navBackground' },
      { old: /#F0F0F0/g, new: 'colors.backgroundSecondary' },
      { old: /#DCDCDC/g, new: 'colors.backgroundSecondary' },
      { old: /#E8E8E8/g, new: 'colors.cardBorder' },
      { old: /#333/g, new: 'colors.textPrimary' },
      { old: /#666/g, new: 'colors.textSecondary' },
      { old: /#9E9E9E/g, new: 'colors.textTertiary' },
      { old: /'white'/g, new: 'colors.textInverse' },
      { old: /'black'/g, new: 'colors.textPrimary' }
    ];
    
    colorReplacements.forEach(replacement => {
      if (content.match(replacement.old)) {
        content = content.replace(replacement.old, replacement.new);
        updated = true;
        console.log(`  ✅ Updated color: ${replacement.old}`);
      }
    });
    
    // Update typography
    const typographyReplacements = [
      { 
        old: /fontSize:\s*(\d+)/g, 
        new: function(match, size) {
          const numSize = parseInt(size);
          if (numSize <= 12) return 'fontSize: typography.fontSize.xs';
          if (numSize <= 14) return 'fontSize: typography.fontSize.sm';
          if (numSize <= 16) return 'fontSize: typography.fontSize.md';
          if (numSize <= 18) return 'fontSize: typography.fontSize.lg';
          if (numSize <= 20) return 'fontSize: typography.fontSize.xl';
          if (numSize <= 24) return 'fontSize: typography.fontSize.xxl';
          if (numSize <= 32) return 'fontSize: typography.fontSize.xxxl';
          return 'fontSize: typography.fontSize.display';
        }
      },
      { old: /fontWeight:\s*'bold'/g, new: 'fontFamily: typography.fontFamily.bold' },
      { old: /fontWeight:\s*'600'/g, new: 'fontFamily: typography.fontFamily.semiBold' },
      { old: /fontWeight:\s*'500'/g, new: 'fontFamily: typography.fontFamily.medium' },
      { old: /fontWeight:\s*'400'/g, new: 'fontFamily: typography.fontFamily.regular' },
      { old: /fontWeight:\s*'300'/g, new: 'fontFamily: typography.fontFamily.light' },
    ];
    
    typographyReplacements.forEach(replacement => {
      if (content.match(replacement.old)) {
        if (typeof replacement.new === 'function') {
          content = content.replace(replacement.old, replacement.new);
        } else {
          content = content.replace(replacement.old, replacement.new);
        }
        updated = true;
        console.log(`  ✅ Updated typography`);
      }
    });
    
    // Update spacing
    const spacingReplacements = [
      { 
        old: /marginTop:\s*(\d+)/g, 
        new: function(match, size) {
          const numSize = parseInt(size);
          if (numSize <= 4) return 'marginTop: spacing.xs';
          if (numSize <= 8) return 'marginTop: spacing.sm';
          if (numSize <= 16) return 'marginTop: spacing.md';
          if (numSize <= 24) return 'marginTop: spacing.lg';
          if (numSize <= 32) return 'marginTop: spacing.xl';
          return 'marginTop: spacing.xxl';
        }
      },
      { 
        old: /marginBottom:\s*(\d+)/g, 
        new: function(match, size) {
          const numSize = parseInt(size);
          if (numSize <= 4) return 'marginBottom: spacing.xs';
          if (numSize <= 8) return 'marginBottom: spacing.sm';
          if (numSize <= 16) return 'marginBottom: spacing.md';
          if (numSize <= 24) return 'marginBottom: spacing.lg';
          if (numSize <= 32) return 'marginBottom: spacing.xl';
          return 'marginBottom: spacing.xxl';
        }
      },
      { 
        old: /paddingHorizontal:\s*(\d+)/g, 
        new: function(match, size) {
          const numSize = parseInt(size);
          if (numSize <= 8) return 'paddingHorizontal: spacing.sm';
          if (numSize <= 16) return 'paddingHorizontal: spacing.md';
          if (numSize <= 24) return 'paddingHorizontal: spacing.lg';
          if (numSize <= 32) return 'paddingHorizontal: spacing.xl';
          return 'paddingHorizontal: spacing.xxl';
        }
      },
    ];
    
    spacingReplacements.forEach(replacement => {
      if (content.match(replacement.old)) {
        content = content.replace(replacement.old, replacement.new);
        updated = true;
        console.log(`  ✅ Updated spacing`);
      }
    });
    
    // Update border radius
    if (content.match(/borderRadius:\s*(\d+)/g)) {
      content = content.replace(/borderRadius:\s*(\d+)/g, (match, size) => {
        const numSize = parseInt(size);
        if (numSize <= 8) return 'borderRadius: borderRadius.small';
        if (numSize <= 12) return 'borderRadius: borderRadius.medium';
        if (numSize <= 16) return 'borderRadius: borderRadius.large';
        if (numSize <= 24) return 'borderRadius: borderRadius.xlarge';
        return 'borderRadius: borderRadius.round';
      });
      updated = true;
      console.log(`  ✅ Updated border radius`);
    }
    
    // Add shadows to cards and buttons
    if (content.includes('backgroundColor:') && !content.includes('...shadows.')) {
      // Add shadows to main containers
      content = content.replace(
        /(container:\s*{[^}]*backgroundColor:[^}]*})/g,
        '$1,\n    ...shadows.small'
      );
      updated = true;
      console.log(`  ✅ Added shadows to containers`);
    }
    
    if (updated) {
      fs.writeFileSync(filePath, content, 'utf8');
      console.log(`  ✅ Updated: ${screenFile}`);
    } else {
      console.log(`  ℹ️  No changes needed: ${screenFile}`);
    }
  } else {
    console.log(`  ❌ File not found: ${screenFile}`);
  }
});

console.log('\n🎉 Theme application complete!');
console.log('\n📋 Next steps:');
console.log('1. Test the app to ensure all screens look consistent');
console.log('2. Check for any remaining hardcoded colors or styles');
console.log('3. Verify that gradients and shadows are working properly');
console.log('4. Test on both iOS and Android devices'); 
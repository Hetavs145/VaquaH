#!/bin/bash

# Auto Pull Request Creator
# This script automates the PR creation process

echo "🚀 Creating Auto Pull Request..."

# Check if we're in a git repository
if [ ! -d ".git" ]; then
    echo "❌ Error: Not in a git repository"
    exit 1
fi

# Get current branch
CURRENT_BRANCH=$(git branch --show-current)
echo "📍 Current branch: $CURRENT_BRANCH"

# Check if there are uncommitted changes
if [ -n "$(git status --porcelain)" ]; then
    echo "📝 Staging and committing changes..."
    git add .
    git commit -m "Fix CORS issues and Firebase Functions initialization

- Fix CORS configuration in Firebase Functions
- Resolve import/initialization issues in adminService.js
- Create proper TypeScript-based Firebase Functions
- Update Firebase configuration to use correct functions directory
- Add proper error handling and fallback methods"
fi

# Push changes
echo "🚀 Pushing changes to remote..."
git push origin $CURRENT_BRANCH

# Try to create PR using GitHub CLI
if command -v gh &> /dev/null; then
    echo "🔧 Creating Pull Request using GitHub CLI..."
    gh pr create \
        --title "Fix CORS issues and Firebase Functions initialization" \
        --body "## 🚀 Fix CORS Issues and Firebase Functions Initialization

### ✅ What's Fixed:
- **CORS Errors**: Proper CORS configuration for localhost:8080
- **Import Issues**: Fixed dynamic imports and Firebase initialization
- **Functions Structure**: Created proper TypeScript-based Firebase Functions
- **Error Handling**: Better fallback methods and error messages

### 🔧 Changes Made:
- Updated \`adminService.js\` with proper Firebase imports
- Created \`/functions\` directory with TypeScript configuration
- Added \`initializeAdminCollections\` and \`healthCheck\` functions
- Updated \`firebase.json\` configuration
- Fixed \`writeBatch\` usage and database instance handling

### 🧪 Testing:
- Run \`firebase deploy --only functions\` after merging
- Test with \`node test-cors-fix.js\`
- Verify CORS headers are properly set

### 📋 Next Steps:
1. Deploy functions: \`firebase deploy --only functions\`
2. Deploy rules: \`firebase deploy --only firestore:rules\`
3. Test admin panel functionality"

    if [ $? -eq 0 ]; then
        echo "✅ Pull Request created successfully!"
        echo "🔗 Check your GitHub repository for the new PR"
    else
        echo "⚠️  GitHub CLI failed, but changes were pushed"
        echo "📝 Please create PR manually on GitHub"
    fi
else
    echo "⚠️  GitHub CLI not found"
    echo "📝 Changes pushed successfully. Please create PR manually on GitHub:"
    echo "   - Go to your repository"
    echo "   - Click 'Pull requests' → 'New pull request'"
    echo "   - Select branch: $CURRENT_BRANCH"
fi

echo ""
echo "🎉 Auto PR process completed!"
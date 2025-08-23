#!/bin/bash

# GitHub API configuration
REPO_OWNER="Hetavs145"
REPO_NAME="VaquaH"
SOURCE_BRANCH="fix/services-admin-panel-cors-and-permissions"
TARGET_BRANCH="main"
GITHUB_TOKEN="ghs_EMkFYcVv7L4Bj7mt8iTNMdewi8bfxz2ZNdOW"

# PR details
PR_TITLE="Fix Services Admin Panel CORS and Permissions Issues"
PR_BODY=$(cat << 'EOF'
## 🚀 Fix Services Admin Panel CORS and Permissions Issues

### 📋 Summary
This PR fixes critical CORS errors and permission issues in the Services Admin Panel by refactoring the system to use direct Firestore access instead of problematic Cloud Functions, following the exact same pattern as the working Orders system.

### 🐛 Issues Fixed
- **CORS Error**: `Access to fetch at 'https://us-central1-vaquah-react.cloudfunctions.net/initializeAdminCollections' from origin 'http://localhost:8080' has been blocked by CORS policy`
- **Firebase Permissions Error**: `FirebaseError: Missing or insufficient permissions`
- **Cloud Function Failures**: Failed fallback attempts to create collections directly
- **Complex Collection Initialization**: Overly complex logic that was causing initialization failures

### 🔧 Changes Made

#### 1. **Updated `firestoreService.js`**
- ✅ Added `agentService` with full CRUD operations
- ✅ Added `agentApplicationService` with full CRUD operations  
- ✅ Added `serviceRequestService` with full CRUD operations
- ✅ Added timeline tracking for service requests (similar to orders)
- ✅ All services follow the exact same pattern as the working orders system

#### 2. **Refactored `agentService.js`**
- ✅ Replaced complex collection creation logic with simple Firestore operations
- ✅ Added missing methods: `approveAgentApplication`, `rejectAgentApplication`, `assignAgentToService`, `completeService`
- ✅ Uses the new `firestoreService` pattern for consistency
- ✅ Removed direct Firestore imports in favor of centralized service layer

#### 3. **Simplified `adminService.js`**
- ✅ Removed Cloud Function calls that were causing CORS issues
- ✅ Removed complex collection initialization logic
- ✅ Simplified to use direct Firestore access (same as orders system)
- ✅ Added optional sample data creation method for testing

#### 4. **Updated `ServicesAdmin.jsx`**
- ✅ Removed complex collection initialization checks
- ✅ Simplified data loading to use direct service calls
- ✅ Removed "Initialize Collections" button (no longer needed)
- ✅ Data loads directly from Firestore collections

### 🎯 **Key Benefits**
1. **No More CORS Issues**: Eliminated Cloud Function calls completely
2. **Real-time Updates**: Services now update in real-time just like orders
3. **Consistent Pattern**: Uses exact same architecture as working orders system
4. **Better Performance**: Direct Firestore access is faster than Cloud Functions
5. **Simplified Maintenance**: Easier to debug and maintain
6. **Automatic Collection Creation**: Collections are created automatically when needed

### 🔍 **Technical Details**

#### **Before (Problematic)**
```javascript
// Complex Cloud Function call with CORS issues
const response = await fetch(
  'https://us-central1-vaquah-react.cloudfunctions.net/initializeAdminCollections',
  { method: 'POST', headers: {...}, mode: 'cors' }
);

// Fallback with permission errors
await this.createCollectionsDirectly();
```

#### **After (Fixed)**
```javascript
// Simple, direct Firestore access (same as orders)
const agentsData = await agentService.getAllAgents();
const applicationsData = await agentService.getAllAgentApplications();
const requestsData = await agentService.getAllServiceRequests();
```

### 🧪 **Testing**
- ✅ **Build Success**: Application builds without errors
- ✅ **No Syntax Errors**: All files pass compilation
- ✅ **Service Integration**: All agent and service management functions work
- ✅ **Real-time Updates**: Changes reflect immediately in the UI
- ✅ **Permission Handling**: Proper admin access controls maintained

### 📁 **Files Changed**
- `frontend/src/services/firestoreService.js` - Added services layer
- `frontend/src/services/agentService.js` - Refactored to use new pattern
- `frontend/src/services/adminService.js` - Simplified initialization logic
- `frontend/src/pages/admin/ServicesAdmin.jsx` - Updated to use new services

### 🚫 **Breaking Changes**
**None** - This is a pure refactor that maintains all existing functionality while fixing the underlying issues.

### 🔄 **Migration Notes**
- **No action required** for existing users
- **Collections are created automatically** when first accessed
- **All existing data is preserved**
- **Admin permissions remain the same**

### 🎉 **Result**
The Services Admin Panel now works exactly like the Orders system:
- ✅ **No CORS errors**
- ✅ **No permission issues** 
- ✅ **Real-time updates**
- ✅ **Reliable data loading**
- ✅ **Consistent user experience**

### 🔗 **Related Issues**
- Fixes CORS blocking in Services Admin Panel
- Resolves Firebase permission errors
- Eliminates Cloud Function dependency for admin operations
- Improves overall system reliability and performance

---

**Ready for review and merge!** 🚀
EOF
)

echo "🚀 Creating Pull Request via GitHub API..."
echo "=========================================="
echo ""

# Create the pull request using GitHub API
RESPONSE=$(curl -s -X POST \
  -H "Authorization: token $GITHUB_TOKEN" \
  -H "Accept: application/vnd.github.v3+json" \
  -H "Content-Type: application/json" \
  -d "{
    \"title\": \"$PR_TITLE\",
    \"body\": \"$PR_BODY\",
    \"head\": \"$SOURCE_BRANCH\",
    \"base\": \"$TARGET_BRANCH\"
  }" \
  "https://api.github.com/repos/$REPO_OWNER/$REPO_NAME/pulls")

# Check if PR was created successfully
if echo "$RESPONSE" | grep -q '"number"'; then
    PR_NUMBER=$(echo "$RESPONSE" | grep -o '"number":[0-9]*' | cut -d':' -f2)
    PR_URL=$(echo "$RESPONSE" | grep -o '"html_url":"[^"]*"' | cut -d'"' -f4)
    
    echo "✅ Pull Request Created Successfully!"
    echo "   PR Number: #$PR_NUMBER"
    echo "   PR URL: $PR_URL"
    echo ""
    echo "🎉 Your PR is now ready for review!"
    echo "   Visit: $PR_URL"
else
    echo "❌ Failed to create Pull Request"
    echo "Response: $RESPONSE"
    echo ""
    echo "🔍 Troubleshooting:"
    echo "   1. Check if the branch exists: $SOURCE_BRANCH"
    echo "   2. Verify GitHub token permissions"
    echo "   3. Check if PR already exists"
fi

echo ""
echo "📋 Manual PR Creation (if API fails):"
echo "   https://github.com/$REPO_OWNER/$REPO_NAME/pull/new/$SOURCE_BRANCH"
echo ""
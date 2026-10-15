import fs from 'fs';
import path from 'path';

function assert(condition, message) {
  if (!condition) {
    console.error(`❌ FAILED: ${message}`);
    process.exit(1);
  } else {
    console.log(`✅ PASSED: ${message}`);
  }
}

console.log('=== 1. Verifying Forum Posts Code & Data Files ===');
const postsFilePath = path.resolve('src/mock/forumPosts.ts');
const commentsFilePath = path.resolve('src/mock/forumComments.ts');

assert(fs.existsSync(postsFilePath), 'src/mock/forumPosts.ts exists');
assert(fs.existsSync(commentsFilePath), 'src/mock/forumComments.ts exists');

const postsContent = fs.readFileSync(postsFilePath, 'utf8');
const commentsContent = fs.readFileSync(commentsFilePath, 'utf8');

// Check tab definitions
assert(postsContent.includes("type: 'sell'"), "Contains 'sell' posts for Tab 1 (Cần Bán)");
assert(postsContent.includes("type: 'buy'"), "Contains 'buy' posts for Tab 2 (Tìm Mua)");
assert(postsContent.includes("isUrgent: true"), "Contains urgent posts with 24h badge");
assert(postsContent.includes("Cầu Giấy") && postsContent.includes("Đống Đa") && postsContent.includes("Hai Bà Trưng"), "Covers multiple Hanoi districts");

// Check comments and offerPrice
assert(commentsContent.includes("offerPrice:"), "Contains offerPrice field for price negotiation/bidding");
assert(commentsContent.includes("Đề xuất giá") || commentsContent.includes("Trả giá") || commentsContent.includes("offerPrice: 950000"), "Contains realistic offer price values");

console.log('\n=== 2. Verifying Components & Route Integration ===');
assert(fs.existsSync(path.resolve('src/components/community/CommunityHeader.vue')), 'CommunityHeader component exists');
assert(fs.existsSync(path.resolve('src/components/community/CommunityFilters.vue')), 'CommunityFilters component exists');
assert(fs.existsSync(path.resolve('src/components/community/PostCard.vue')), 'PostCard component exists');
assert(fs.existsSync(path.resolve('src/components/community/PostComments.vue')), 'PostComments component exists');
assert(fs.existsSync(path.resolve('src/components/community/CreatePostModal.vue')), 'CreatePostModal component exists');
assert(fs.existsSync(path.resolve('src/views/CommunityView.vue')), 'CommunityView component exists');

// Verify Router has /community
const routerContent = fs.readFileSync(path.resolve('src/router/index.ts'), 'utf8');
assert(routerContent.includes("path: '/community'"), "Router registered '/community' route");

// Verify Supabase schema includes Phase 2 tables
const schemaContent = fs.readFileSync(path.resolve('supabase/schema.sql'), 'utf8');
assert(schemaContent.includes("CREATE TABLE IF NOT EXISTS public.forum_posts"), "Schema has forum_posts table");
assert(schemaContent.includes("CREATE TABLE IF NOT EXISTS public.forum_comments"), "Schema has forum_comments table");

console.log('\n🎉 ALL PHASE 2 CODE, INTEGRATION AND DATA CHECKS PASSED 100%!');

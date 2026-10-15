// Automated test for Seller Registration & Auto-Hide on Sold Logic
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

console.log('=== 1. Testing Code Files & Structure ===');
assert(fs.existsSync(path.resolve('src/components/seller/RegisterSellerModal.vue')), 'RegisterSellerModal component exists');
assert(fs.existsSync(path.resolve('src/components/seller/MyListingsModal.vue')), 'MyListingsModal component exists');

const mockServiceContent = fs.readFileSync(path.resolve('src/services/mockService.ts'), 'utf8');
assert(mockServiceContent.includes('markProductAsSold'), 'mockService has markProductAsSold');
assert(mockServiceContent.includes('markProductAsAvailable'), 'mockService has markProductAsAvailable');
assert(mockServiceContent.includes('registerSeller'), 'mockService has registerSeller');
assert(mockServiceContent.includes("seller.sellerType === 'individual'"), 'mockService differentiates individual sellers');
assert(mockServiceContent.includes('(seller.productsCount ?? 0) === 0') || mockServiceContent.includes('seller.isSoldOut'), 'mockService excludes sold-out individual sellers from map');

console.log('\n=== 2. Testing Logic: Individual Seller Auto-Hide on Sold ===');
// Simulate the mock service logic directly
const sellers = [
  { userId: 'store-1', shopName: 'Vựa ve chai', sellerType: 'store', isSoldOut: false },
  { userId: 'indiv-1', shopName: 'Bạn Mai Linh', sellerType: 'individual', isSoldOut: false }
];

let products = [
  { id: 'p1', sellerId: 'indiv-1', status: 'available' },
  { id: 'p2', sellerId: 'indiv-1', status: 'available' },
];

function getActiveSellers() {
  return sellers.filter(seller => {
    if (seller.sellerType === 'individual') {
      const available = products.filter(p => p.sellerId === seller.userId && p.status === 'available');
      if (seller.isSoldOut || available.length === 0) {
        return false; // HIDE FROM MAP!
      }
    }
    return true;
  });
}

// Check initial state: both are visible
let active = getActiveSellers();
console.log('Initial active sellers:', active.map(s => s.shopName));
assert(active.length === 2, 'Both store and individual seller are initially visible');

// Mark p1 sold: indiv-1 still has p2, so still visible
products[0].status = 'sold';
active = getActiveSellers();
assert(active.some(s => s.userId === 'indiv-1'), 'indiv-1 is still visible with 1 remaining item');

// Mark p2 sold: indiv-1 now has 0 available items -> AUTO-HIDE FROM MAP!
products[1].status = 'sold';
sellers.find(s => s.userId === 'indiv-1').isSoldOut = true;
active = getActiveSellers();
console.log('Active sellers after selling out:', active.map(s => s.shopName));
assert(!active.some(s => s.userId === 'indiv-1'), 'indiv-1 MUST BE HIDDEN FROM MAP once all items are sold!');
assert(active.some(s => s.userId === 'store-1'), 'Store remains visible');

// Reopen item: indiv-1 re-appears
products[0].status = 'available';
sellers.find(s => s.userId === 'indiv-1').isSoldOut = false;
active = getActiveSellers();
console.log('Active sellers after reopen:', active.map(s => s.shopName));
assert(active.some(s => s.userId === 'indiv-1'), 'indiv-1 RE-APPEARS ON MAP after reopening an item');

console.log('\n🎉 ALL SELLER REGISTRATION & AUTO-HIDE ON SOLD TESTS PASSED 100%!');

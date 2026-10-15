// Direct Node.js ESM verification script
function calculateDistanceKm(coord1, coord2) {
  const R = 6371;
  const toRad = (value) => (value * Math.PI) / 180;

  const dLat = toRad(coord2.latitude - coord1.latitude);
  const dLon = toRad(coord2.longitude - coord1.longitude);

  const lat1 = toRad(coord1.latitude);
  const lat2 = toRad(coord2.latitude);

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.sin(dLon / 2) * Math.sin(dLon / 2) * Math.cos(lat1) * Math.cos(lat2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(R * c * 100) / 100;
}

function formatDistance(distanceKm) {
  if (distanceKm < 1) {
    const meters = Math.round(distanceKm * 1000);
    return `${meters} m`;
  }
  return `${distanceKm.toFixed(1)} km`;
}

function assert(condition, message) {
  if (!condition) {
    console.error(`❌ FAILED: ${message}`);
    process.exit(1);
  } else {
    console.log(`✅ PASSED: ${message}`);
  }
}

console.log('=== 1. Testing Haversine Distance Formula ===');
const hoanKiem = { latitude: 21.028511, longitude: 105.854167 };

// Hang Da, Hoan Kiem
const hangDa = { latitude: 21.0315, longitude: 105.8480 };
const distHangDa = calculateDistanceKm(hoanKiem, hangDa);
console.log(`Hoan Kiem -> Hang Da: ${distHangDa} km (${formatDistance(distHangDa)})`);
assert(distHangDa > 0.6 && distHangDa < 0.9, 'Hang Da should be ~0.72 km from Hoan Kiem');
assert(formatDistance(distHangDa) === `${Math.round(distHangDa * 1000)} m`, 'Should display meters for < 1km');

// Cau Giay
const cauGiay = { latitude: 21.0302, longitude: 105.7876 };
const distCauGiay = calculateDistanceKm(hoanKiem, cauGiay);
console.log(`Hoan Kiem -> Cau Giay: ${distCauGiay} km (${formatDistance(distCauGiay)})`);
assert(distCauGiay > 6.5 && distCauGiay < 7.2, 'Cau Giay should be ~6.9 km from Hoan Kiem');
assert(formatDistance(distCauGiay) === `${distCauGiay.toFixed(1)} km`, 'Should display km for >= 1km');

// Bach Khoa, Hai Ba Trung
const bachKhoa = { latitude: 21.0042, longitude: 105.8455 };
const distBachKhoa = calculateDistanceKm(hoanKiem, bachKhoa);
console.log(`Hoan Kiem -> Bach Khoa: ${distBachKhoa} km (${formatDistance(distBachKhoa)})`);
assert(distBachKhoa > 2.5 && distBachKhoa < 3.2, 'Bach Khoa should be ~2.85 km from Hoan Kiem');

// Ha Dong
const haDong = { latitude: 20.9712, longitude: 105.7765 };
const distHaDong = calculateDistanceKm(hoanKiem, haDong);
console.log(`Hoan Kiem -> Ha Dong: ${distHaDong} km (${formatDistance(distHaDong)})`);
assert(distHaDong > 9.5 && distHaDong < 11.5, 'Ha Dong should be ~10.2 km from Hoan Kiem');

console.log('\n=== 2. Testing Radius Sorting & Filtering ===');
const sellers = [
  { name: 'Hang Da', coords: hangDa, dist: distHangDa },
  { name: 'Bach Khoa', coords: bachKhoa, dist: distBachKhoa },
  { name: 'Cau Giay', coords: cauGiay, dist: distCauGiay },
  { name: 'Ha Dong', coords: haDong, dist: distHaDong },
];

// Sort ascending
const sorted = [...sellers].sort((a, b) => a.dist - b.dist);
console.log('Sorted order by distance:', sorted.map(s => `${s.name} (${s.dist}km)`).join(' -> '));
assert(sorted[0].name === 'Hang Da', 'Closest must be Hang Da');
assert(sorted[sorted.length - 1].name === 'Ha Dong', 'Furthest must be Ha Dong');

console.log('\n🎉 ALL GPS & LOGIC TESTS COMPLETED SUCCESSFULLY!');

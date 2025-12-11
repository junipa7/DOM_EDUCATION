// /js/ads.js (BASE) — 광고 스크립트가 파서를 막는 상황을 가시화
console.log("[ads] START (BASE) — 광고 스크립트 로드 및 실행 시작");

// 간단한 CPU 바쁜 대기 (주의: 교육/실험용 시뮬레이션)
(function busyWait(ms) {
  const start = performance.now();
  while (performance.now() - start < ms) {}
})(700); // 약 700ms 차단

// 동기 작업(즉시 실행) — 가상의 초기화
var ADS_READY = true;
console.log("[ads] READY (BASE) — 파서 차단 후 광고 초기화 완료");

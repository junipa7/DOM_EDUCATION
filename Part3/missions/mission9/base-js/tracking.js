// /js/tracking.js (BASE) — 트래킹 스크립트도 파서를 막는 상황을 가시화
console.log("[tracking] START (BASE) — 트래킹 로드 및 실행 시작");

// 또 한 번의 바쁜 대기
(function busyWait(ms) {
  const start = performance.now();
  while (performance.now() - start < ms) {}
})(800); // 약 800ms 차단

// 동기 초기화
var TRACKING_READY = true;
function track(event, payload) {
  console.log("[tracking] event:", event, payload);
}
console.log("[tracking] READY (BASE)");

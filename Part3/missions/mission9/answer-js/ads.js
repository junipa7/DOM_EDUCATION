// /js/ads.js (ANSWER)
// async 로 로드되므로 다운로드는 파서를 막지 않음.
// 실행 "순간"에는 JS가 돌아가지만, DOMContentLoaded(DCL)를 지연시키지는 않음.
console.log("[ads] START (ANSWER) — async 로드");

// 광고 SDK 스텁: 최소 초기화만 수행 (가벼운 논리)
window.ADS_READY = true;

// 너무 무거운 동기 작업은 금지 — 필요 시 비동기/지연 실행
setTimeout(() => {
  console.log("[ads] deferred init (ANSWER)");
}, 0);

console.log("[ads] READY (ANSWER)");
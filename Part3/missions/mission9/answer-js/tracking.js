// /js/tracking.js (ANSWER)
// async 특성상 '언제' 실행될지 확정적이지 않으므로 큐잉 패턴으로 안정화
console.log("[tracking] START (ANSWER) — async 로드");

// 사전 정의된 큐가 있으면 흡수(없으면 생성)
window.analyticsQueue = window.analyticsQueue || [];

// 실제 track 함수 바인딩 (SDK 준비된 것처럼 동작)
window.track = function(event, payload) {
  console.log("[tracking] event:", event, payload);
};

// 로딩 중 쌓였던 호출이 있다면 순서대로 flush
if (window.analyticsQueue.length) {
  console.log("[tracking] flushing queued events:", window.analyticsQueue.length);
  while (window.analyticsQueue.length) {
    const [e, p] = window.analyticsQueue.shift();
    window.track(e, p);
  }
}

window.TRACKING_READY = true;
console.log("[tracking] READY (ANSWER)");

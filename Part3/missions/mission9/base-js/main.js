// /js/main.js (BASE) — DOM 의존 로직이지만 파서를 막는 기본 로드 방식
console.log("[main] START (BASE)");

(function busyWait(ms) {
  const start = performance.now();
  while (performance.now() - start < ms) {}
})(600); // 약 600ms 차단

// 기본 상호작용: 버튼 클릭 핸들러
const btn = document.getElementById("cta");
btn.addEventListener("click", () => {
  console.log("[main] CTA clicked (BASE)");
  // 클릭 직후 또 잠깐 버벅임 시뮬레이션
  (function busyWait(ms) {
    const start = performance.now();
    while (performance.now() - start < ms) {}
  })(200);
  console.log("[main] CTA handled (BASE)");
});

console.log("[main] READY (BASE)");

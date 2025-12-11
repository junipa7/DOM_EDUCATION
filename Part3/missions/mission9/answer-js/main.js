// /js/main.js (ANSWER)
// defer 로 로드되므로 DOM 파싱 완료 후(DCL 직전) 안전하게 실행됨.
console.log("[main] START (ANSWER) — defer 로드, DOM OK");

// 버튼 상호작용: 즉시 반응 가능해야 함
const btn = document.getElementById("cta");
btn.addEventListener("click", () => {
  console.log("[main] CTA clicked (ANSWER)");
  // 무거운 일은 메인 스레드 점유를 피하기 위해 쪼개기/지연하기
  setTimeout(() => {
    console.log("[main] CTA handled async (ANSWER)");
  }, 0);

  // 트래킹 호출(큐잉 패턴과 궁합)
  if (typeof window.track === "function") {
    window.track("cta_click", { ts: Date.now() });
  } else {
    // 혹시 아직 준비 안 됐다면 큐에 쌓기
    window.analyticsQueue = window.analyticsQueue || [];
    window.analyticsQueue.push(["cta_click", { ts: Date.now() }]);
  }
});

console.log("[main] READY (ANSWER)");

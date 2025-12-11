// js/ads.js
(function(){
  // (미션 2에서 blocking/async 실험용) 네트워크/실행 지연 시뮬레이터
  const start = performance.now();
  while (performance.now() - start < 40) {} // ~40ms 바쁜 대기
  console.log('[ads] 광고 SDK 초기화 완료');
})();

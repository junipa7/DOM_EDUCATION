// js/tracking.js
(function(){
  // 간단한 트래킹 스텁
  window.__track = (ev, data)=>console.log('[tracking]', ev, data||{});
  console.log('[tracking] 트래킹 초기화');
})();

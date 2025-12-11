// js/main.js
document.addEventListener('DOMContentLoaded', ()=>{
  console.log('[main] DOM 준비 완료, UI 초기화 시작');
  const btn = document.getElementById('cta');
  if (btn) {
    btn.addEventListener('click', ()=>{
      window.__track && window.__track('cta_click', { ts: Date.now() });
      alert('시작합니다!');
    });
  }
});

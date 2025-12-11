// assets/next-section.bundle.js
(function(){
  console.log('[BUNDLE] next-section.bundle.js 실행 시작');

  const ph = document.getElementById('next-placeholder');
  const box = document.getElementById('next-content');
  const grid = document.getElementById('grid');
  const img = document.getElementById('next-img');

  // 1) 프리패치해 둔 이미지를 즉시 사용 (URL 동일해야 네트워크 대기 최소)
const PREFETCHED_IMG = 'https://picsum.photos/1600/900?random=3';
img.src = PREFETCHED_IMG;

  // 2) 카드 데이터 (모의)
  const data = Array.from({length:6}).map((_,i)=>({
    title: `카드 ${i+1}`,
    desc: 'prefetch + on-demand 실행으로 체감속도 개선',
  }));

  // 3) DOM 구성 (간단한 카드들)
  data.forEach(item=>{
    const card = document.createElement('div');
    card.className = 'card';
    card.innerHTML = `<strong>${item.title}</strong><p class="muted" style="margin:6px 0 0">${item.desc}</p>`;
    grid.appendChild(card);
  });

  // 4) Placeholder 숨기고 실제 컨텐츠 표시
  ph.hidden = true;
  box.hidden = false;

  console.log('[BUNDLE] next-section.render 완료');
})();

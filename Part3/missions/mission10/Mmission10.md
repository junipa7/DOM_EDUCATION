<!--
Mission #10: "preload / preconnect / prefetch로 LCP를 앞당겨라"

0) 폴더 구조
  project/
  ├─ base.html
  ├─ answer.html
  ├─ js/
  │  ├─ ads.js
  │  ├─ tracking.js
  │  └─ main.js
  └─ assets/
     └─ next-section.bundle.js

  js/ 폴더는 Mission 2와 연속성을 위해 포함(광고/트래킹/메인 스크립트 샘플).
  이번 미션에서 핵심적으로 실행·검증하는 JS는 assets/next-section.bundle.js 입니다(아래 코드 포함).

📖 미션 설명
  신규 랜딩을 맡은 지 2주. 월요일 아침, PM이 커피를 내려놓으며 말합니다.
  “모바일 LCP가 3.8초예요. 광고 전환이 휘청입니다.”
  DevTools를 켜고 네트워크 워터폴을 보니 히어로 이미지 요청이 너무 늦게 출발합니다. 파서가 <img>를 만난 뒤에야 움직이죠. 게다가 이미지 CDN에 첫 연결이라 DNS → TCP → TLS 비용을 한 번에 치르고 있고요.
  스크롤 아래에서 쓸 무거운 자원들이 초반부터 섞여 내려오면서 네트워크 혼잡도 유발합니다.

  “해법은 세 가지를 동시에.” 
  1. 가장 중요한 자원(히어로/LCP)은 가장 먼저: preload
  2. 처음 만나는 외부 서버는 연결부터 열어두자: preconnect
  3. 곧 쓸 리소스는 조용히 준비: prefetch

  그리고 “증거”. 워터폴 상단 이동, Initial connection 단축, LCP ms 감소, 스크롤 시 즉시 실행되는 다음 섹션까지 보여줘야 합니다.

1) 실무 스토리 (맥락을 충분히)
  우리 랜딩의 LCP(Largest Contentful Paint) 후보는 상단 히어로 이미지입니다. 최근 모바일 p75에서 LCP 3.8s가 관측되어 전환율이 하락 중입니다. DevTools로 확인해 보니:
  - 히어로 이미지는 <img> 태그를 파서가 발견한 시점 이후에야 네트워크 요청이 시작됩니다. 즉, 요청 시작 자체가 늦습니다.
  - 히어로 이미지는 외부 CDN 도메인에 있으므로, DNS 조회 → TCP 연결 → TLS 핸드셰이크 지연이 첫 요청에서 크게 발생합니다.
  - 아래쪽(스크롤 후) 섹션에서 쓰일 무거운 JS/이미지도 초기 단계부터 내려받아 네트워크 혼잡을 유발합니다(당장 보이진 않는데도).

  PM의 요구는 명확합니다:
  1. LCP 후보 이미지 요청을 문서 초반부터 당겨라(발견 시점을 앞당김).
  2. 외부 이미지 CDN에 대해 preconnect를 적용해 연결 지연을 줄여라.
  3. 아래 섹션 리소스는 prefetch로 미리 가져오되, 현재 렌더링은 절대 막지 말 것.
  4. DevTools Network/Performance에서 전후 증거(워터폴·LCP 시점)를 남겨라.
  5. 스크롤 시점에 prefetch된 번들을 실제로 즉시 실행해 체감 개선을 시연하라.

2) 요구사항 (체크리스트)
  - <head>에서 LCP 후보 이미지에 <link rel="preload" as="image"> 선언(발견/요청을 최우선으로)
  - 이미지 CDN 도메인에 <link rel="preconnect" href="..."> 선언(+ 필요 시 crossorigin)
  - 다음 섹션 자원은 prefetch로 미리 받기(현재 렌더 차단 X, 우선순위 낮음)
  - 스크롤 진입 시 prefetch로 캐시된 JS 번들을 즉시 실행(동일 URL 사용)
  - DevTools Network: preconnect(초기 새 소켓), preload(High priority) 확인
  - DevTools Performance: LCP 시점 개선 확인(+ 콘솔 LCP 로거 비교)
  👉 부연설명
  - 현재 렌더를 돕는 자원 = preload, 곧 쓸 자원 = prefetch, 연결 비용 = preconnect 로 분리해 생각하면 깔끔합니다.
  - “동일 URL 재사용”이 핵심입니다. 쿼리 파라미터 하나만 달라도 중복 다운로드가 날 수 있어요.

3) Base Code
-->
<!DOCTYPE html>
<html lang="ko">
<head>
  <meta charset="utf-8" />
  <title>[BASE] LCP 후보 이미지 지연 요청</title>
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <style>
    body{margin:0;font-family:system-ui,sans-serif}
    .hero{min-height:100vh;display:grid;place-items:center;text-align:center;padding:24px}
    .hero img{max-width:min(92vw, 1200px);width:100%;height:auto;border-radius:12px;box-shadow:0 10px 40px rgba(0,0,0,.15)}
    .title{font-size:clamp(24px,6vw,42px);margin:16px 0 8px}
    .sub{color:#64748b;margin:0 0 16px}
    .next{padding:56px 24px;border-top:1px solid #e2e8f0}
  </style>
</head>
<body>
  <section class="hero">
    <div>
      <!-- 문제: <img>를 파서가 만나는 시점에야 요청 시작 → 워터폴 하단에서 늦게 보임 -->
      <img
  src="https://picsum.photos/1600/900?random=1"
        alt="히어로 이미지 (LCP 후보)">
      <h1 class="title">느린 LCP를 고쳐보자</h1>
      <p class="sub">이미지 요청이 늦게 시작되면 LCP가 밀립니다</p>
    </div>
  </section>

  <section class="next" id="next">
    <h2>다음 섹션</h2>
    <p>여기서 무거운 번들을 사용합니다(지금 당장 필요 없음).</p>
    <div id="next-placeholder" style="height:280px;display:grid;place-items:center;color:#64748b;border:1px dashed #cbd5e1;border-radius:8px;">
      (스크롤 진입 시 기능 활성화)
    </div>
  </section>

  <script>
    // (선택) LCP 콘솔 로거
    try{
      new PerformanceObserver((list)=>{
        const entry = list.getEntries().at(-1);
        if(entry){ console.log('[BASE] LCP', Math.round(entry.startTime),'ms', entry); }
      }).observe({type:'largest-contentful-paint', buffered:true});
    }catch(e){}
  </script>
</body>
</html>

<!--
🔎 Base 관찰 포인트
  - Network: 히어로 이미지 요청이 워터폴 중간/하단에서 늦게 시작.
  - Performance: LCP가 뒤로 밀림(콘솔 [BASE] LCP …ms 확인).
  - 네트워크 연결비용: 첫 이미지 요청 순간에 DNS/TCP/TLS 비용이 함께 발생.
🧠 코드 해설
  - <img src="…Hero+LCP">는 파서가 여기까지 오기 전엔 모릅니다. 그래서 “요청 시작 타이밍” 자체가 늦습니다.
  - 랜딩 첫 진입에서 외부 CDN을 처음 호출하면, 이름 찾기·연결 맺기·암호화 합의까지 한 번에 치르느라 대기 시간이 길어집니다.
  - 해결의 핵심은 “발견을 앞당기고, 연결을 먼저 열고, 지금 당장 아닌 자원은 뒤로”입니다.

4) Answer Code
  핵심: 발견을 앞당기고(Preload), 연결을 미리 열고(Preconnect), 다음 자원은 조용히 준비(Prefetch).
  스크롤 진입 시 prefetch 캐시된 JS를 동일 URL로 즉시 실행해 체감 이득을 증명합니다.
  -->
<!DOCTYPE html>
<html lang="ko">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width,initial-scale=1" />
  <title>[ANSWER] 매거진 랜딩 - LCP/FCP 최적화</title>

  <!-- 웹폰트 Preload -->
  <link rel="preload"
        as="font"
        href="https://fonts.gstatic.com/s/roboto/v30/KFOmCnqEu92Fr1Mu4mxM.woff2"
        type="font/woff2"
        crossorigin="anonymous">

  <style>
    @font-face{
      font-family:"MyRoboto";
      src:url("https://fonts.gstatic.com/s/roboto/v30/KFOmCnqEu92Fr1Mu4mxM.woff2") format("woff2");
      font-display:swap;
    }

    body{margin:0;font-family:"MyRoboto", system-ui, -apple-system, Segoe UI, Noto Sans, sans-serif;line-height:1.6;background:#fafafa;color:#222}
    header{padding:24px 16px;border-bottom:1px solid #ddd;font-weight:bold;font-size:22px;background:#fff;position:sticky;top:0;z-index:10}
    .hero{max-width:1100px;margin:40px auto;padding:0 16px;text-align:center}
    .hero h1{font-size:48px;margin:16px 0}
    .hero img{width:100%;border-radius:16px;box-shadow:0 4px 16px rgba(0,0,0,.08)}
    .muted{color:#666}
    .grid{max-width:1100px;margin:40px auto;padding:0 16px;display:grid;grid-template-columns:repeat(auto-fill,minmax(300px,1fr));gap:20px}
    .card img{width:100%;border-radius:12px;opacity:.001;transition:opacity .4s ease, transform .4s ease}
    .card img.loaded{opacity:1;transform:scale(1.02)}
    .media{max-width:1100px;margin:60px auto;padding:0 16px}
    .video-shell{position:relative}
    video{width:100%;border-radius:16px;background:#000}
    .play-overlay{
      position:absolute;inset:0;display:grid;place-items:center;
      background:rgba(0,0,0,.35);color:#fff;font-size:22px;
      border:0;cursor:pointer;border-radius:16px;backdrop-filter:blur(2px)
    }
  </style>
</head>
<body>
  <header>매거진 <span class="muted">/ Weekly</span></header>

  <main class="hero">
    <h1>도시의 주말 산책 코스</h1>
    <!-- LCP 후보: 즉시 로드 + 크기 지정 -->
    <img src="https://picsum.photos/id/1015/1200/700" width="1200" height="700" alt="hero">
    <p class="muted">사진과 이야기가 있는 주말, 도시 속 자연을 걸어요.</p>
  </main>

  <!-- 썸네일: 지연 로드 -->
  <section class="grid" id="thumbs">
    <article class="card"><img data-src="https://picsum.photos/id/1025/600/400" width="600" height="400" alt=""></article>
    <article class="card"><img data-src="https://picsum.photos/id/1035/600/400" width="600" height="400" alt=""></article>
    <article class="card"><img data-src="https://picsum.photos/id/1045/600/400" width="600" height="400" alt=""></article>
    <article class="card"><img data-src="https://picsum.photos/id/1055/600/400" width="600" height="400" alt=""></article>
    <article class="card"><img data-src="https://picsum.photos/id/1065/600/400" width="600" height="400" alt=""></article>
    <article class="card"><img data-src="https://picsum.photos/id/1075/600/400" width="600" height="400" alt=""></article>
  </section>

  <!-- Video: 지연 로드 + poster -->
  <section class="media" id="video-section">
    <h2>도심 산책 브이로그</h2>
    <div class="video-shell">
      <video id="vlog" controls preload="none" playsinline poster="https://images.unsplash.com/photo-1520975922215-230f3cd8a487?w=1280&q=80&auto=format&fit=crop">
        <source data-src="https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.webm" type="video/webm">
        <source data-src="https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4" type="video/mp4">
      </video>
      <button class="play-overlay" aria-label="재생">▶ 동영상 보기</button>
    </div>
  </section>

  <script>
    // 이미지 Lazy Loading
    const imgIO = new IntersectionObserver((entries, obs)=>{
      entries.forEach(e=>{
        if(e.isIntersecting){
          const img = e.target;
          const src = img.getAttribute('data-src');
          if(src){
            img.src = src;
            img.onload = ()=> img.classList.add('loaded');
          }
          obs.unobserve(img);
        }
      });
    }, { rootMargin:'200px 0px' });
    document.querySelectorAll('#thumbs img[data-src]').forEach(img => imgIO.observe(img));

    // Video Lazy Loading
    const video = document.getElementById('vlog');
    const shell = document.querySelector('.video-shell');
    const playBtn = shell.querySelector('.play-overlay');
    let videoPrepared = false;
    const videoIO = new IntersectionObserver((entries, obs)=>{
      entries.forEach(e=>{
        if(e.isIntersecting && !videoPrepared){
          video.querySelectorAll('source[data-src]').forEach(s=>{
            s.setAttribute('src', s.getAttribute('data-src'));
            s.removeAttribute('data-src');
          });
          video.load();
          videoPrepared = true;
          obs.unobserve(video);
        }
      });
    }, { rootMargin:'400px 0px' });
    videoIO.observe(video);

    playBtn.addEventListener('click', async ()=>{
      playBtn.style.display='none';
      try { await video.play(); }
      catch(e){ playBtn.style.display='grid'; alert('재생 버튼을 다시 눌러 주세요.'); }
    });
  </script>
</body>
</html>

<!--
🔎 Answer 관찰 포인트
  - Network
    . preconnect: https://via.placeholder.com에 초기 새 소켓(DNS/TCP/TLS 미리 수행) 확인
    . preload: 히어로 이미지가 워터폴 상단에 High priority로 먼저 요청
    . prefetch: /assets/next-section.bundle.js 와 …Next+Image 가 우선순위 낮게 미리 받아짐
  - Performance
    . LCP 시점이 Base 대비 앞당겨졌는지(콘솔 [BASE] LCP vs [ANSWER] LCP 비교)
  - 실행 증명
    . 스크롤로 #next 근처 → prefetch된 JS가 동일 URL로 로드되어 즉시 실행(콘솔 로그)
    . 번들이 DOM을 채우고, prefetch 이미지를 #next-img로 바로 표시

🧠 코드 해설
  - <link rel="preconnect">가 연결만 먼저 열어두고, <link rel="preload">가 실제 데이터를 먼저 받아옵니다.
  - <img>의 src/srcset/sizes 와 <link rel="preload" imagesrcset/imagesizes>를 일관시키면, 브라우저가 preload 응답을 재사용합니다.
  - IntersectionObserver는 “보이기 직전(rootMargin)” 시점을 잡아 prefetch 캐시를 즉시 실행하게 해줍니다.

5)assets/next-section.bundle.js(실제 실행되는 번들)
  스크롤 진입 시 Answer에서 동적으로 주입하여 실행합니다.
  prefetch 캐시가 있으면 즉시 실행/표시가 되어 체감 향상이 보입니다.
-->

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

<!--
🧠 코드 해설
  - 핵심은 “같은 URL”입니다. prefetch된 이미지/스크립트와 동일 URL을 사용해야 캐시 히트로 거의 즉시 표시/실행됩니다.
  - DOM 갱신 순서(placeholder → 콘텐츠)가 분명하여 사용자 체감이 매끄럽게 이어집니다.

6) (참고) js/ 폴더의 스크립트 3종 — ads/tracking/main
  이번 미션에서는 직접 사용하지 않지만, 프로젝트 일관성과 Mission 2 연계를 위해 포함합니다.
  필요 시 Answer/Body에 삽입해 async/defer 실험에 활용할 수 있습니다.
-->
// js/ads.js
(function(){
  // (미션 2에서 blocking/async 실험용) 네트워크/실행 지연 시뮬레이터
  const start = performance.now();
  while (performance.now() - start < 40) {} // ~40ms 바쁜 대기
  console.log('[ads] 광고 SDK 초기화 완료');
})();


// js/tracking.js
(function(){
  // 간단한 트래킹 스텁
  window.__track = (ev, data)=>console.log('[tracking]', ev, data||{});
  console.log('[tracking] 트래킹 초기화');
})();


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

<!--
🧠 코드 해설
  - Mission 2와 동일한 맥락: 광고/트래킹은 async, DOM 의존 코드는 defer가 안전합니다.
  - 본 미션과 결합하면, “네트워크 힌트 + 스크립트 로딩 전략”이 함께 맞물려 더 큰 개선을 만들 수 있습니다.

7) 왜 이렇게 개선되는가?
  1. preconnect — “외부 서버 연결을 미리 열자”
    - 외부 CDN 첫 요청엔 DNS → TCP → TLS 단계를 필요로 합니다.
    - <link rel="preconnect" href="CDN">는 이 과정을 문서 초반에 미리 수행합니다.
    - 실제 이미지 요청 순간의 대기 시간이 줄어듭니다.
    - CORS 자원(폰트 등)은 crossorigin을 함께 지정하는 습관을 들이세요.
  2. preload(as=image) — “가장 중요한 자원을 맨 먼저 받아!”
    - <head>에 선언하면 발견 시점이 앞당겨져 곧바로 다운로드가 시작됩니다.
    - *as="image"*가 정확해야 우선순위/캐시 정책이 올바르게 적용됩니다.
    - 중복 방지: <img>에서 정확히 같은 URL이 선택되어야 preload 응답을 재사용합니다.
  3. prefetch — “곧 필요할 자원, 한가할 때 미리 받아둬”
    - 우선순위가 낮아 현재 렌더링을 방해하지 않음.
    - 이후 동일 URL로 사용하면 캐시 히트로 빠르게 표시/실행됩니다.
    - 남발 금지: 실제로 곧 쓸 자원만 미리 받아 데이터 낭비 방지.
  4. 스크롤 트리거 — “미리 받은 걸 필요한 순간에 즉시 쓰기”
    - 가시성 근처에서 실행하면 사용자는 거의 대기 없이 다음 섹션을 보게 됩니다.

💡 실무 감각
  - LCP 최적화는 “요청을 앞당기고, 연결을 줄이며, 불필요한 초기 다운로드를 미루는 것”의 합입니다.
  - 작은 최적화가 겹치면 체감은 기하급수적으로 좋아집니다.

8) DevTools로 검증하는 절차 (손에 잡히는 가이드)
  1. Network → Disable cache 해제, Throttling “Slow 3G”로 실험(선택).
  2. mission3-base.html: 워터폴에서 히어로 이미지 요청 시작 위치 와 [BASE] LCP ms 기록.
  3. mission3-answer.html: 상단의 preconnect(초기 새 소켓)·preload(High priority) 확인.
  4. 콘솔에서[ANSWER] LCP …ms vs [BASE] LCP …ms 비교(3회 이상 반복, p75 감각).
  5. 스크롤로 #next 근처 → [ANSWER] next-section.bundle 실행 완료 로그와 즉시 렌더 확인.
  6. Network에서 next-section.bundle.js / Next+Image 가 (from memory/disk cache) 표시되는지 체크.

🔧 추가 실험 팁
  - CPU Slowdown(×4)도 함께 켜보면 메인 스레드 바운드 상황에서의 체감을 이해하기 좋습니다.

9) 용어 정리
  - LCP: 첫 화면에서 가장 큰 콘텐츠가 보이는 시점
  - preconnect: 외부 서버와 연결(DNS/TCP/TLS) 미리 열기
  - preload: 지금 꼭 필요한 자원을 최우선으로 미리 다운로드
  - prefetch: 곧 필요할 자원을 우선순위 낮게 미리 받아 캐시에 준비
  - imagesrcset/sizes: 뷰포트/해상도에 맞게 적절한 이미지 선택 힌트
📎
  - preconnect=문 앞까지 미리 가 있기, preload=필수 짐부터 먼저 싣기 , prefetch=내일 쓸 짐을 오늘 한가할 때 미리 준비 느낌입니다.

10) 실무 팁 & 주의점 (Gotchas)
  - URL 완전 동일성: preload/prefetch와 실제 사용 태그의 URL(쿼리까지) 정확히 일치해야 재사용.
  - as 정확히: image/script/style/font등 올바르게 지정.
  - CORS/폰트: crossorigin + 서버 CORS 헤더 필요(경고/재사용 실패 방지).
  - 과도한 preload 금지: 너무 많으면 모두가 최우선이 되어 혼잡. 진짜 LCP 후보만.
  - prefetch는 힌트: 상황에 따라 무시 가능. 반복 측정으로 평균 이득 확인.
  - 측정의 습관화: Throttling/CPU slow + 3회 이상 반복으로 p75 감각 잡기.

✅ 선택 보강(옵션) — 피드백 반영 코드 & 팁
  아래는 원본 코드를 유지하면서, 추가로 적용해볼 수 있는 선택적 보강 예시입니다.
  1. 히어로 이미지 Priority 힌트(원본 <img>는 유지, 추가로 다음과 같이 변경 가능)

<!-- (선택) 히어로 이미지에 우선순위 힌트 -->
<img fetchpriority="high"
    src = "https://via.placeholder.com/1600x900.jpg?text=Hero+LCP"
    srcset = "https://via.placeholder.com/1200x675.jpg?text=Hero+LCP+1200 1200w, https://via.placeholder.com/1600x900.jpg?text=Hero+LCP+1600 1600w"
    sizes = "(max-width: 1200px) 92vw, 1200px"
    alt = "히어로 이미지 (LCP 후보)"
/>

<!--
    - 브라우저에게 “이건 진짜 급함”을 한 번 더 알려줍니다.
  2. DNS Prefetch 백업 힌트(preconnect와 함께 사용) -->

<link rel = "dns-prefetch" href="//via.placeholder.com">
<link rel = "preconnect" href="https://via.placeholder.com" crossorigin>
<!-->
  3. 저속/절약 모드에서 prefetch 억제 -->
<script>
    const n = navigator.connection || {};
    const allowPrefetch = !n.saveData && (n.downlink || 1.5) > 1.2; // 임계값은 팀 상황에 맞게
    if (allowPrefetch) {
        [{href:'/assets/next-section.bundle.js', as:'script'},
         {href:'https://via.placeholder.com/1200x800.jpg?text=Next+Image', as:'image'}]
         .forEach(({href, as}) => {
            const l = document.createElement('link');
            l.rel = 'prefetch';
            l.as = as;
            l.href = href;
            document.head.appendChild(l);
        });
    }
</script>
<!--
  4. ESM 환경에서는 modulepreload 고려  -->
<!-- (ESM인 프로젝트 한정) -->
<link rel = "modulepreload" href = "/assets/next-section.module.js">

<!--
  5. background-image가 LCP 후보인 경우 주의
    - CSS background-image 는 <img>처럼 자동 연결되지 않습니다.
    - preload as="image"를 쓰되, 정확히 같은 URL을 CSS와 맞추거나, 케이스에 따라 마크업으로 <img> 사용을 고려하세요.
  6. 보안·캐시 전략
    - CDN 스크립트: SRI + crossorigin 사용 권장.
    - 이미지/번들: 긴 캐시 수명 + 버전 쿼리(?v=123)로 캐시 무효화 전략 수립.

🔚 한눈 요약
  - Base: LCP 후보 발견 지연 + 외부 연결 비용 + 불필요 초기 다운로드 → LCP 느림
  - Answer: preconnect(연결 예열) + preload(우선 다운로드) + prefetch(다음 자원 예열) → 워터폴 상단 이동 + LCP 단축 + 스크롤 즉시 실행
  - 보강 옵션: fetchpriority, dns-prefetch, 저속/절약 모드 감지, modulepreload, background-image 주의, SRI/캐시 전략
-->
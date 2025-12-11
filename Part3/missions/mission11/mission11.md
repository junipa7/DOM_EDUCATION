<!--
Mission #11: “미디어가 많은 매거진 랜딩의 LCP/FCP 개선 (Video 지연 로드)”

1) 미션 설명 (실무 스토리 – 스토리텔링 확장판)
  봄 시즌을 맞아 매거진 팀이 새로운 랜딩 페이지를 런칭했습니다. 화보 중심의 잡지답게, 페이지 첫 화면에는 고화질 히어로 이미지, 아래에는 여러 장의 사진 카드, 그리고 페이지 하단에는 브이로그 영상까지 담아 콘텐츠가 풍성해 보이도록 기획되었습니다.
  디자인적으로는 완벽해 보였지만, 곧 QA 팀에서 성능 문제가 보고되었습니다.
  - 첫 화면이 늦게 보인다.
    사용자가 URL을 입력하고 들어왔는데, 텍스트보다 무거운 이미지와 폰트가 모두 다운로드될 때까지 화면이 빈 상태로 보인다. 이로 인해 LCP 지표가 4초 이상으로 치솟는다.
  - 스크롤을 내리면 버벅인다.
    기사 카드 이미지가 모두 초기부터 로드되어 있어, 네트워크는 포화 상태이고 GPU는 디코딩을 동시에 처리하느라 버벅임이 발생한다.
  - 영상이 보이지도 않았는데 데이터가 낭비된다.
    페이지 가장 아래에 있는 브이로그 영상이 초기부터 로드되어, 사용자가 끝까지 스크롤하지 않아도 대용량 미디어 파일이 다운로드된다. 모바일 환경에서는 특히 데이터 낭비로 이어진다.

  PM은 팀 전체 회의에서 이렇게 말했습니다.
    “사용자가 첫 화면을 보는 순간 ‘깔끔하다, 빠르다’라는 느낌을 줘야 합니다. 중요한 건 맨 위 히어로와 텍스트예요. 나머지 사진과 영상은 사용자가 스크롤했을 때만 보여도 충분합니다. 이걸 DevTools로 근거를 뽑아서 확실히 증명해 주세요.”

  즉, 이번 미션은 단순히 이미지나 폰트를 줄이는 문제가 아니라, “무엇을 언제 보여줄 것인가”를 설계하는 것이 핵심입니다. 초기에는 필수 요소만 집중적으로 불러오고, 나머지는 사용자의 행동(스크롤, 클릭)에 맞춰 늦게 불러오는 Lazy Loading 전략을 완성하는 것이 목표입니다.

2) 미션 요구사항 (체크리스트)
  - 히어로 이미지는 즉시 로드 + 크기 지정으로 CLS 방지
  - 썸네일 이미지는 IntersectionObserver 기반 data-src → src 지연 로드
  - 웹폰트는 preload + @font-face + font-display: swap + crossorigin="anonymous"
  - Video는 preload="none" + poster + IO 기반 data-src → src 동적 주입
  - DevTools에서 LCP/FCP 시각이 개선되었음을 확인

3) Base Code (문제 포함)
파일명: project1-base.html
-->
<!DOCTYPE html>
<html lang="ko">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width,initial-scale=1" />
  <title>[BASE] 매거진 랜딩 - 성능 문제</title>

  <!-- 문제: Fonts를 stylesheet로만 로드 -->
  <link href="https://fonts.googleapis.com/css2?family=Roboto:wght@400;700" rel="stylesheet">

  <style>
    body{margin:0;font-family:Roboto, system-ui, -apple-system, Segoe UI, Noto Sans, sans-serif;line-height:1.6}
    header{padding:24px 16px;border-bottom:1px solid #eee;font-weight:bold;font-size:20px}
    .hero{max-width:1100px;margin:24px auto;padding:0 16px}
    .hero h1{font-size:48px;margin:12px 0}
    .hero img{width:100%;border-radius:12px}
    .grid{max-width:1100px;margin:24px auto;padding:0 16px;display:grid;grid-template-columns:repeat(3,1fr);gap:16px}
    .card img{width:100%;border-radius:8px}
    .media{max-width:1100px;margin:24px auto;padding:0 16px}
    video{width:100%;border-radius:12px;background:#000}
  </style>
</head>
<body>
  <header>매거진 / Weekly</header>

  <main class="hero">
    <h1>도시의 주말 산책 코스</h1>
    <!-- 모든 이미지를 즉시 로드 -->
    <img src="https://picsum.photos/id/1015/1200/700" alt="hero">
    <p>사진과 이야기가 있는 주말, 도시 속 자연을 걸어요.</p>
  </main>

  <section class="grid">
    <article class="card"><img src="https://picsum.photos/id/1025/600/400" alt=""></article>
    <article class="card"><img src="https://picsum.photos/id/1035/600/400" alt=""></article>
    <article class="card"><img src="https://picsum.photos/id/1045/600/400" alt=""></article>
    <article class="card"><img src="https://picsum.photos/id/1055/600/400" alt=""></article>
    <article class="card"><img src="https://picsum.photos/id/1065/600/400" alt=""></article>
    <article class="card"><img src="https://picsum.photos/id/1075/600/400" alt=""></article>
  </section>

  <section class="media">
    <h2>도심 산책 브이로그</h2>
    <!-- video 소스가 초기부터 즉시 요청 -->
    <video controls>
      <source src="https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.webm" type="video/webm">
      <source src="https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4" type="video/mp4">
    </video>
  </section>
</body>
</html>

<!--
4) 미션의 의의
  - 무엇을 먼저 보이게 할지를 결정하는 것이 LCP 개선의 핵심입니다.
  - 초기에는 LCP 후보(히어로 텍스트·이미지)에 네트워크/CPU를 집중시키고,
  - 아래쪽 리소스는 시야 진입 시점에만 로드하여 네트워크·CPU 낭비를 줄입니다.
  - 이 방식은 이미지, 동영상, 폰트 모두에 적용 가능한 보편 전략입니다.

5) 정답 해설
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
6) 정답 코드 해설
  1. 웹폰트 최적화 (Preload + @font-face + font-display: swap)
    변경 내용
    - <link rel="preload" as="font" ... crossorigin="anonymous">로 폰트를 HTML 파싱과 동시에 요청합니다.
    - CSS의 @font-face에서 font-display: swap을 사용해 폰트가 늦게 와도 즉시 텍스트를 기본 폰트로 표시 합니다.
    효과
    - FOIT(보이지 않는 텍스트) 제거 → 첫 화면에서 텍스트 공백 현상 방지
    - 폰트를 초기 타임라인 앞쪽에서 가져오므로 전반적 가독성/안정성이 향상
    - crossorigin="anonymous"로 CDN 캐시를 안전하게 활용 → 중복 다운로드 감소 가능
    DevTools 확인법
    - Network 탭 → 폰트 요청이 HTML 초기 구간에 나타나는지 확인
    - Elements → Computed → 폰트 적용 여부 확인 (초기에는 시스템 폰트 → 폰트 로드 후 Roboto로 교체)
  2. 히어로 이미지(Above the Fold) — 즉시 로드 + CLS 방지
    변경 내용
    - 히어로 이미지는 LCP 후보이므로 그대로 src 지정(즉시 로드).
    - width/height 속성을 명시하여 브라우저가 레이아웃 박스를 선계산할 수 있게 했습니다.
    효과
    - LCP 안정화: 핵심 콘텐츠가 빠르고 예측 가능하게 표시
    - CLS(누적 레이아웃 이동) 감소: 이미지 로드 전후로 레이아웃이 흔들리지 않음
    - 약간의 시각적 품질(둥근 모서리 + 그림자)로 인지적 체감 품질도 개선
    DevTools 확인법
    - Performance 탭 → Largest Contentful Paint 항목에 히어로 이미지/텍스트가 잡히는지, 시점이 전보다 앞당겨졌는지 확인
    - Lighthouse(혹은 Web Vitals) → LCP와 CLS 점수 비교

    (선택적 팁) 히어로 이미지는 경우에 따라 <img fetchpriority="high">(지원 브라우저) 또는 <link rel="preload" as="image">를 검토할 수 있습니다. 이번 코드는 핵심 원리 설명에 집중하기 위해 포함하지 않았습니다.

  3. 썸네일 이미지 — Intersection Observer 기반 지연 로드
    변경 내용
    - 초기 HTML에는 실제 경로가 아닌 data-src 속성만 넣습니다.
    - IO(IntersectionObserver)로 뷰포트 근처(루트 마진 200px)에 들어오면 data-src → src를 주입하여 그때 다운로드합니다.
    - 이미지가 로드된 뒤 loaded 클래스를 부여하여 부드러운 페이드/살짝 확대 트랜지션을 적용했습니다.
    - width/height를 명시해 CLS를 사전에 방지합니다.
    효과
    - 초기 네트워크 요청 개수 대폭 감소 → 첫 화면 시야에 집중 투자 가능
    - 스크롤 구간에 따라 네트워크 요청이 자연스럽게 분산
    - 애니메이션으로 이미지가 티 없이 등장 → 체감 품질 상승
    DevTools 확인법
    - Network 탭 → 초기 로드 3초 구간에 썸네일 요청이 없는지 확인
    - 스크롤 시점에 Initiator가 script인 이미지 요청이 순차 발생하는지 관찰
    - Performance → 스크롤 중 디코딩/페인트 스파이크가 완만하게 분포되는지

  4. 동영상(Video) — preload="none" + IO 주입 + 클릭 재생
    변경 내용
    - <video preload="none" poster="...">로 초기 네트워크를 0으로 시작합니다.
    - <source>에는 src대신 data-src만 넣고, IO가 근접(400px) 했을 때에만 src를 주입하고 video.load()를 호출합니다.
    - 사용자 클릭 시 play()를 호출하여 의도 기반 재생을 보장합니다(모바일 자동재생 제한 대응).
    효과
    - 초기 네트워크/디코딩 비용 제거: 아직 보지 않는 미디어는 로드하지 않음
    - 포스터 이미지로 첫인상을 유지하면서, 실제 시청 의사/시야에 맞춰 로드
    - 모바일/저대역폭 환경에서 데이터 낭비를 효과적으로 차단
    DevTools 확인법
    - Network → 초기 상태에서 video 소스 요청이 없는지 확인
    - 아래로 스크롤하여 동영상이 근접하면 그때 MP4/WebM 요청이 발생하는지 확인
    - Performance → 동영상 구간에서 디코딩/미디어 파이프라인이 IO 시점 이후에만 활성화되는지 확인

    (주의) video는 아직 표준 loading="lazy" 속성이 없습니다. preload 제어 + IO + 사용자 클릭을 조합하는 방식이 호환성과 제어성 측면에서 안전합니다.

  5. 자바스크립트 구조 — 한 번만, 필요한 순간에
    변경 내용
    - 관심사 분리:
      . 이미지용 IO와 비디오용 IO를 분리하여 각기 다른 rootMargin/로직을 적용
      . 각 요소는 감지 1회 후 unobserve하여 불필요한 콜백을 차단
    - 비디오 준비 상태(videoPrepared) 플래그로 중복 주입 방지
    효과
    - 이벤트/관찰 횟수 최소화 → 메인 스레드 부담 완화
    - 빠른 스크롤 등 변칙 상황에서도 중복 네트워크 요청/중복 DOM 조작 방지
    - 유지보수성과 디버깅 용이성 향상
    DevTools 확인법
    - Performance → Scripting 타임라인에서 짧은 콜백들이 필요 시점에만 실행되는지 확인
    - Memory → 이벤트 리스너/관찰자 누수 없이 안정적으로 GC(가비지 컬렉션)되는지 관찰

  6. 레이아웃/스타일 — 세련된 UI와 안정성의 균형
    변경 내용
    - 반응형 카드 그리드: grid-template-columns: repeat(auto-fill, minmax(300px, 1fr))
    - 적절한 gap과 border-radius, box-shadow로 가독성/시각 안정성을 확보
    - Header를 sticky로 고정해 탐색성을 높이고, 배경/테두리 대비를 조정하여 콘텐츠 영역과 명시적 구분
    효과
    - 다양한 화면 너비에서 예측 가능한 배치 유지
    - 이미지가 등장할 때 시각적 매끄러움과 브랜드 일관성 향상
    - UI 개선이 성능 최적화와 충돌하지 않도록 CSS 연산 비용이 가벼운 속성(opacity/transform 중심) 사용
    DevTools 확인법
    - Rendering 패널(레이아웃 셰프트 하이라이트)로 CLS 발생 여부 시각 확인
    - Performance → Paint/Composite 구간이 짧고, 프레임 드랍 없이 유지되는지 체크

  7. DevTools 체크포인트
    - Network 탭
      . Base: 초기부터 썸네일+video 소스까지 전부 요청
      . Answer: 초기에는 히어로+폰트만 요청, 스크롤 시점에 썸네일/영상 요청 발생
    - Performance 탭
      . LCP 시점이 Base보다 앞당겨짐
      . CPU 타임라인에서 디코드 비용이 초기에서 제거됨
    - Layout Shift
      . CLS 값이 Base 대비 개선됨 (width/height 지정 효과)

  8. 추가 팁
    - Video는 아직 loading="lazy" 속성이 표준화되지 않았으므로, IO + preload 제어 방식이 안전합니다.
    - 포스터 이미지는 실제 영상과 유사한 장면을 선택해 사용자 경험을 향상시키는 것이 좋습니다.
    - Root Margin을 충분히 주어 조기 로드를 설정하면 빠른 스크롤에도 안정적인 표시가 가능합니다.
-->
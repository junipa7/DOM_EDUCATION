<!--
Mission #12: “신상품 피드 최적화: Virtual List + 무한 로드 + 미디어/스크립트 Lazy Loading”

1) 미션 설명
  여러분은 지금 대형 커머스 서비스의 신상품 피드를 개발 중입니다.
  기획팀은 “상품이 하루에도 수천 개씩 쏟아지니, 피드를 무한히 스크롤해서 끝까지 볼 수 있게 해주세요”라고 요청했습니다.
  문제는 이 요구를 그대로 구현했을 때 발생했습니다.
  - 스크롤이 끊긴다.
    상품이 5,000개 이상 누적되니 브라우저가 DOM 계산을 버티지 못하고 프레임이 떨어집니다.
  - 데이터 낭비가 심하다.
    화면 끝에 있는 영상이나 광고까지도 처음부터 로드되어, 사용자가 보지 않아도 모바일 데이터가다 빠져나갑니다.
  - UX 품질 지표도 악화됐다.
    CLS(레이아웃 시프트)와 LCP(가장 큰 콘텐츠 표시 속도)가 나빠져서 SEO와 사용자 만족도가 모두 떨어졌습니다.

  PM은 이렇게 요구합니다.
    “사용자가 보는 영역만 가볍게 그려주세요. 스크롤할 때 필요한 데이터만 불러오고, 영상·광고·분석 스크립트는 정말 필요할 때만 실행되도록 해주세요.”

  즉, 이번 미션은 대량의 데이터를 성능 좋게 보여주는 기술을 직접 구현하는 것입니다.
  우리가 지금까지 배운 Lazy Load, Intersection Observer, Virtual List 기법을 종합적으로 써야만 해결할 수 있습니다.

2) 미션 요구사항 (체크리스트)
  - 가상 리스트(Virtual List): 보이는 구간만 DOM으로 만들고, 화면 밖은 렌더하지 않는다.
  - 무한 스크롤(Infinite Scroll): 끝에 도달했을 때만 다음 페이지를 서버에서 가져온다.
  - 이미지 Lazy Loading: 썸네일은 실제로 보일 때 src를 주입해 네트워크 요청을 늦춘다.
  - 동영상 Lazy Loading: 추천 동영상은 사용자가 가까이 왔을 때만 소스를 주입해 로드한다.
  - 광고/분석 스크립트 Lazy Loading: 광고와 Analytics 코드는 실제로 보일 때만 <script>를 삽입해 실행한다.
  - 접근성: 버튼에 ARIA 라벨을 넣고, 키보드 포커스 스타일도 제공한다.
  - DevTools 근거: 전/후 성능 차이를 Network, Performance 패널로 확인한다.

3) Base Code (문제 상황)
  아래 코드는 “문제가 되는” 기본 상태입니다.
  상품이 10,000개 있을 때 모두 DOM에 그려지고, 이미지도 즉시 요청됩니다.
  👉 직접 실행해서 DevTools로 성능을 측정해 보시면 스크롤이 매우 무거워짐을 체감할 수 있습니다.
-->
<!DOCTYPE html>
<html lang="ko">
<head>
  <meta charset="utf-8"/>
  <meta name="viewport" content="width=device-width,initial-scale=1"/>
  <title>[BASE] 느린 신상품 피드</title>
  <style>
    :root{--maxw:1000px}
    body{margin:0;font-family:system-ui,-apple-system,Segoe UI,Noto Sans,sans-serif}
    header{position:sticky;top:0;background:#fff;border-bottom:1px solid #eee;padding:12px 16px;z-index:10;font-weight:700}
    .list{max-width:var(--maxw);margin:0 auto;padding:12px 16px}
    .item{display:flex;gap:12px;align-items:center;padding:12px 8px;border-bottom:1px solid #eee}
    .item img{width:72px;height:72px;border-radius:8px;object-fit:cover}
    .title{font-weight:600}
  </style>
</head>
<body>
<header>신상품 피드(전부 그리기)</header>
<main class="list" id="list"></main>

<script>
  // 더미 데이터 10000개 생성
  const data = Array.from({length:10000}, (_,i)=>({
    id:i+1,
    title:`상품 #${i+1}`,
    img:`https://picsum.photos/seed/${i+1}/128/128`,
    price:(Math.random()*90000+10000|0).toLocaleString('ko-KR')
  }));

  const list = document.getElementById('list');

  // 문제: 1만개 전부 DOM 생성 + 이미지 즉시 로드
  for(const p of data){
    const row = document.createElement('div');
    row.className = 'item';
    row.innerHTML = `
      <img src="${p.img}" alt="${p.title}">
      <div>
        <div class="title">${p.title}</div>
        <div class="muted">₩${p.price}</div>
      </div>`;
    list.appendChild(row);
  }
</script>
</body>
</html>

<!--
4) 의의
  이 미션을 통해 우리는 “보이는 만큼만” 그린다는 원칙을 코드로 직접 구현합니다.
  가상 리스트와 Lazy Loading은 현대 웹앱(커머스, 뉴스, 소셜, SaaS 대시보드)에 반드시 필요한 기술입니다.
  실무에서는 이 기술이 UX 품질, 서버 비용, 모바일 데이터 절감에 직결됩니다.

5) Answer Code
  아래는 Virtual List + 무한 로드 + 이미지/동영상/스크립트 Lazy Loading이 모두 적용된 정답 코드입니다.
-->
<!DOCTYPE html>
<html lang="ko">
<head>
  <meta charset="utf-8"/>
  <meta name="viewport" content="width=device-width,initial-scale=1"/>
  <title>[ANSWER] 가상 리스트 + 무한 로드 + 미디어/스크립트 Lazy</title>
  <style>
    :root{
      --maxw:1000px;
      --vh:560px;             /* 데모용 뷰포트 */
      --row-h:92px;           /* 행 높이(고정) = 이미지72 + 패딩/보더 여유 */
      --gap:12px;
      --radius:12px;
      --muted:#667085;
      --bg:#fafafa; --elev:#fff; --bd:#eaeaea;
      --shadow:0 6px 18px rgba(0,0,0,.06);
    }
    *{box-sizing:border-box}
    body{margin:0;font-family:system-ui,-apple-system,Segoe UI,Noto Sans,sans-serif;background:var(--bg);color:#222}
    header{
      position:sticky;top:0;background:var(--elev);border-bottom:1px solid var(--bd);
      padding:14px 16px;z-index:10;font-weight:700;display:flex;align-items:center;gap:10px
    }
    header .badge{background:#111;color:#fff;border-radius:999px;padding:4px 8px;font-size:12px}
    .container{max-width:var(--maxw);margin:20px auto;padding:0 16px}

    /* Virtual viewport */
    #viewport{
      height:var(--vh); overflow-y:auto; position:relative; background:var(--elev);
      border:1px solid var(--bd); border-radius:var(--radius); box-shadow:var(--shadow)
    }
    #scroll-area{position:relative}
    .row{
      position:absolute; left:0; right:0; height:var(--row-h);
      display:flex; gap:var(--gap); align-items:center; padding:10px 12px; border-bottom:1px solid var(--bd);
      background:var(--elev)
    }
    .row:focus-within{outline:2px solid #2563eb; outline-offset:-2px}
    .thumb{width:72px;height:72px;border-radius:10px;object-fit:cover; background:#ddd; opacity:.001; transition:opacity .3s ease, transform .3s ease}
    .thumb.loaded{opacity:1; transform:scale(1.02)}
    .title{font-weight:700; margin-bottom:4px}
    .muted{color:var(--muted); font-size:13px}
    .actions button{
      background:#111; color:#fff; border:0; border-radius:10px; padding:8px 12px; cursor:pointer
    }
    .actions button:focus{outline:2px solid #2563eb; outline-offset:2px}

    /* Sentinel & footer content */
    .sentinel{height:1px}
    .tail{
      max-width:var(--maxw); margin:24px auto; padding:0 16px;
      display:grid; grid-template-columns:1fr 1fr; gap:16px
    }
    .card{
      background:var(--elev); border:1px solid var(--bd); border-radius:var(--radius); padding:12px; box-shadow:var(--shadow)
    }

    /* Lazy video */
    .video-shell{position:relative}
    video{width:100%; border-radius:12px; background:#000}
    .play-overlay{
      position:absolute; inset:0; display:grid; place-items:center; background:rgba(0,0,0,.35);
      color:#fff; font-size:18px; border:0; cursor:pointer; border-radius:12px
    }

    /* Lazy ad/analytics placeholders */
    .placeholder{height:160px; display:grid; place-items:center; background:#f2f2f2; border-radius:12px; color:#888}
  </style>
</head>
<body>
<header>
  신상품 피드
  <span class="badge">Virtualized</span>
</header>

<div class="container">
  <!-- Virtualized List -->
  <div id="viewport" aria-label="신상품 목록">
    <div id="scroll-area" role="list"></div>
    <div id="sentinel" class="sentinel" aria-hidden="true"></div>
  </div>

  <!-- Tail section: 동영상 / 광고 / 분석 (모두 Lazy) -->
  <section class="tail" id="tail">
    <article class="card">
      <h3>추천 브이로그</h3>
      <div class="video-shell">
        <video id="vlog" controls preload="none" playsinline
               poster="https://images.unsplash.com/photo-1520975922215-230f3cd8a487?w=1280&q=80&auto=format&fit=crop">
          <source data-src="https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.webm" type="video/webm">
          <source data-src="https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4" type="video/mp4">
        </video>
        <button class="play-overlay" aria-label="재생">▶ 동영상 보기</button>
      </div>
    </article>

    <article class="card">
      <h3>Sponsored & Analytics</h3>
      <div id="ad-slot" class="placeholder" aria-label="광고 영역">광고 준비중…</div>
      <div id="ana-slot" class="placeholder" aria-label="분석 스크립트">분석 준비중…</div>
    </article>
  </section>
</div>

<script>
  // ----------------------------
  // 0) 환경 설정
  // ----------------------------
  const ROW_H = parseInt(getComputedStyle(document.documentElement).getPropertyValue('--row-h')); // 행 높이
  const PAGE_SIZE = 800;   // 데모용 대용량 페이지 크기
  const MAX_PAGES = 5;     // 총 4,000개
  const PRELOAD_MARGIN_ROWS = 8; // 뷰포트 대비 여유 행

  const viewport = document.getElementById('viewport');
  const area = document.getElementById('scroll-area');
  const sentinel = document.getElementById('sentinel');

  let page = 0;
  let items = []; // 누적 아이템
  let loading = false;
  let done = false;

  // ----------------------------
  // 1) 데이터 로드(실무에서는 fetch 대체)
  // ----------------------------
  async function loadPage(){
    if (loading || done) return;
    if (page >= MAX_PAGES) { done = true; return; }

    loading = true;
    // 네트워크 지연 시뮬레이션
    await new Promise(r => setTimeout(r, 150));

    const start = page * PAGE_SIZE;
    const chunk = Array.from({length: PAGE_SIZE}, (_,i)=>{
      const id = start + i + 1;
      return {
        id,
        title: `상품 #${id}`,
        img: `https://picsum.photos/seed/${id}/128/128`,
        price: (Math.random()*90000+10000|0).toLocaleString('ko-KR')
      };
    });

    items = items.concat(chunk);
    page++;

    // 스크롤 전체 높이 갱신
    area.style.height = (items.length * ROW_H) + 'px';

    // 즉시 렌더(뷰포트에 보이는 범위만)
    render();
    loading = false;
  }

  // ----------------------------
  // 2) 가상 리스트 렌더
  // ----------------------------
  function render(){
    const scrollTop = viewport.scrollTop;
    const vh = viewport.clientHeight;

    const start = Math.max(0, Math.floor(scrollTop / ROW_H) - PRELOAD_MARGIN_ROWS);
    const visible = Math.ceil(vh / ROW_H) + PRELOAD_MARGIN_ROWS * 2;
    const end = Math.min(start + visible, items.length);

    // DOM 최소화: 필요한 행만 다시 그림
    area.innerHTML = '';

    for(let i = start; i < end; i++){
      const p = items[i];
      const row = document.createElement('div');
      row.className = 'row';
      row.style.top = (i * ROW_H) + 'px';
      row.setAttribute('role','listitem');
      row.innerHTML = `
        <img class="thumb" alt="${p.title}" width="72" height="72" data-src="${p.img}">
        <div style="flex:1 1 auto; min-width:0">
          <div class="title">${p.title}</div>
          <div class="muted">₩${p.price}</div>
        </div>
        <div class="actions">
          <button aria-label="${p.title} 장바구니 담기">담기</button>
        </div>
      `;
      area.appendChild(row);
    }

    // 이미지 Lazy (현재 DOM에 존재하는 썸네일만 관찰)
    observeThumbs();
  }

  // ----------------------------
  // 3) 이미지 Lazy: data-src → src
  // ----------------------------
  const imgIO = new IntersectionObserver((entries, obs)=>{
    entries.forEach(e=>{
      if(e.isIntersecting){
        const img = e.target;
        const src = img.getAttribute('data-src');
        if(src){
          img.src = src;
          img.onload = ()=> img.classList.add('loaded');
          img.removeAttribute('data-src');
        }
        obs.unobserve(img);
      }
    });
  }, { root: viewport, rootMargin: '200px 0px' });

  function observeThumbs(){
    area.querySelectorAll('img.thumb[data-src]').forEach(img => imgIO.observe(img));
  }

  // ----------------------------
  // 4) 스크롤 이벤트: 가시 범위만 유지
  // ----------------------------
  viewport.addEventListener('scroll', render, { passive: true });

  // ----------------------------
  // 5) 무한 로드: sentinel IO
  // ----------------------------
  const loadIO = new IntersectionObserver((entries)=>{
    entries.forEach(e=>{
      if(e.isIntersecting){
        loadPage();
      }
    });
  }, { root: viewport, rootMargin: '800px 0px' });
  loadIO.observe(sentinel);

  // ----------------------------
  // 6) Tail 영역: 동영상/광고/분석 Lazy
  // ----------------------------
  // 6-1) Video
  const video = document.getElementById('vlog');
  const playBtn = document.querySelector('.play-overlay');
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
  }, { root: null, rootMargin: '400px 0px' });
  videoIO.observe(video);

  playBtn.addEventListener('click', async ()=>{
    playBtn.style.display = 'none';
    try { await video.play(); }
    catch(e){ playBtn.style.display='grid'; alert('재생 버튼을 다시 눌러 주세요.'); }
  });

  // 6-2) 광고/분석 스크립트 Lazy
  const adSlot = document.getElementById('ad-slot');
  const anaSlot = document.getElementById('ana-slot');

  const scriptIO = new IntersectionObserver((entries, obs)=>{
    entries.forEach(e=>{
      if(e.isIntersecting){
        // 광고 스크립트 삽입(데모: 콘솔 로깅으로 대체)
        const adScript = document.createElement('script');
        adScript.textContent = `
          console.log('[AD] Loaded when visible');
          document.getElementById('ad-slot').textContent = '광고 로드 완료';
        `;
        document.body.appendChild(adScript);

        // 분석 스크립트 삽입(데모)
        const anaScript = document.createElement('script');
        anaScript.textContent = `
          console.log('[Analytics] Loaded when visible');
          document.getElementById('ana-slot').textContent = '분석 스크립트 로드 완료';
        `;
        document.body.appendChild(anaScript);

        obs.unobserve(adSlot);
        obs.unobserve(anaSlot);
      }
    });
  }, { root: null, rootMargin: '200px 0px' });

  scriptIO.observe(adSlot);
  scriptIO.observe(anaSlot);

  // ----------------------------
  // 7) 초기 데이터 + 첫 렌더
  // ----------------------------
  loadPage();
  render();
</script>
</body>
</html>

<!--
🔍 정답 코드 — 상세 해설
0) 전반 구조 개요
  - 핵심 아이디어:
    1. #viewport(스크롤 컨테이너) + #scroll-area(총 높이만 표현)
    2. .row는 position:absolute로 정확한 y좌표에만 생성 → 보이는 구간 + 여유분 만큼만 DOM 유지
    3. 리스트 끝 #sentinel을 IntersectionObserver로 감지 → 페이지 단위 데이터 로드
    4. 이미지/동영상/광고/분석 스크립트는 화면 노출 시점에 로드(또는 실행) → 초기 네트워크/CPU 절감

1) HTML 구조 해설 -->
<div id = "viewport">
    <div id = "scroll-area"></div>
    <div id = "sentinel" class = "sentinel"></div>
</div>

<!--
  - #viewport: 실제로 스크롤이 발생하는 영역(고정 높이).
  - #scroll-area: 리스트의 전체 높이만 갖는 빈 래퍼(내용은 비워둠). 여기 높이가 스크롤바 길이를 결정합니다.
  - .row는 자바스크립트에서 필요한 범위만 동적으로 생성해서 #scroll-area 안에 절대 위치(absolute)로 배치합니다.
  - #sentinel: 맨 아래에 있는 얇은 엘리먼트. 뷰포트에 들어오는 순간 “다음 페이지를 가져올 시점”임을 알려주는 트리거입니다. -->

<section class = "tail">
    <article class = "card">
        <!-- 추천 영상 -->
        <video id = "promo" preload = "none" poster ="...">
            <source data-src = "...mp4" type = "video/mp4">
        </video>
    </article>
    <article class = "card">
        <!-- 광고 & 분석 -->
        <div id = "ad" class = "placeholder">광고 준비중…</div>
        <div id = "ana" class = "placeholder">분석 준비중…</div>
    </article>
</section>

<!--
  - 리스트 본문 하단에는 추가 리소스 구역(Tail)을 분리했습니다.
  - 동영상 preload="none" + <source data-src>: 초기에는 실제 네트워크 요청 없음.
  - 광고/분석은 단순 div로 시작 → 보일 때 스크립트 주입 또는 콘텐츠 교체.
  효과
  - 초기 로딩에서 필요 최소한의 엘리먼트 + 리소스만 사용 → LCP/FCP 개선
  - 아래쪽 부가 요소는 정말 봐야 할 때만 로드/실행 → 데이터/CPU 절감

2) CSS 해설 (가상 리스트 핵심 스타일)
    #viewport {
        height: 560px; /* 데모용 고정 높이 (실서비스는 반응형 높이 가능) */
        overflow-y: auto; /* 내부 스크롤 */
        position: relative; /* 자식 absolute를 위한 기준 */
    ...
    }
    #scroll-area {
        position: relative
    } /* absolute row를 담는 래퍼 */
    .row {
        position: absolute; /* 각 행을 y축으로 정확한 좌표에 배치 */
        left: 0;
        right: 0;
        height: var(--row-h);
        display: flex;
        align-items: center;
        gap: 12px;
        padding: 10px 12px;
        border-bottom: 1px solid #eee;
    }

  - .row를 absolute로 두는 이유: 흐름에 따라 쌓지 않고, 정확한 top 좌표에 찍어 리스트가 실제로 다 있는 것처럼 보이게 하기 위해서입니다.
  - 이렇게 하면 DOM 수가 수만 개라도, 실제로는 보이는 구간 + 여분만 생성하면 되므로 렌더링 비용이 상수 O(1) 수준에 수렴합니다.
    .thumb {
        width: 72px;
        height: 72px; /* 이미지 크기 고정 → CLS 방지 */
        object-fit: cover;
        background: #ddd;
        opacity: .2;
        transition: opacity .3s;
    }
    .thumb.loaded {
        opacity: 1
    } /* onload 후 자연스러운 페이드인 */

  - CLS(누적 레이아웃 이동) 방지를 위해 이미지의 렌더링 박스를 고정합니다.
  - 로딩 완료 후 opacity로만 시각 변화를 주면 합성 단계에서 처리되어 프레임 유지에 유리합니다(Transform/Opacity는 GPU 합성 친화적).

3) 자바스크립트 — 상태/상수/초기화 -->
<script>
const ROW_H = 92, PAGE = 500, MAX = 5; // 행 높이, 페이지 당 개수, 총 페이지 수
const vm=document.getElementById('viewport');
const area = document.getElementById('scroll-area');
const sent = document.getElementById('sentinel');
let items = [], page = 0, loading = false;
</script>
<!--
  - ROW_H는 .row의 픽셀 높이와 반드시 일치해야 합니다(불일치하면 행이 겹치거나 뜁니다).
  - PAGE / MAX는 무한 스크롤의 “덩어리 크기”와 전체 페이지 수입니다. 실제 서비스는 서버 페이징 API로 대체합니다.
  - items는 누적 데이터 배열입니다. page/loading 플래그로 동시 로딩/중복 요청을 방지합니다.

4) 데이터 로드(loadPage) — 페이지 단위 페칭 -->
<script>
async function loadPage() {
    if(loading||page >= MAX) return; // 가드
    loading = true;
    await new Promise(r => setTimeout(r, 200)); // 네트워크 지연 시뮬레이션

    const start = page*PAGE;
    const chunk = Array.from({length:PAGE}, (_, i) => ({
        id: start + i + 1,
        title: `상품 #${start + i + 1}`,
        img: `https://picsum.photos/seed/${start + i + 1}/128/128`,
        price: (Math.random() * 90000 + 10000|0).toLocaleString('ko-KR')
    })
);

items = items.concat(chunk);
page++;

area.style.height = (items.length * ROW_H) + 'px'; // 전체 높이 갱신render();// 가시 영역만 그리기
loading = false;
}
</script>
<!--
  - 핵심: #scroll-area의 높이를 항상 아이템 수 × 행 높이로 유지 → 브라우저는 “거대한 스크롤 공간”이 있다고 인식합니다.
  - 데이터 추가 후 **즉시 render()*를 호출하여 현재 스크롤 위치 주변만 DOM으로 만듭니다.
  주의
  - 실제 서비스에서는 fetch('/api/products?page=...')로 대체하고, 에러/타임아웃/재시도(백오프)를 넣어야 합니다.
  - 새로 로드된 데이터가 0개면 MAX/done 플래그와 같은 종료 조건을 관리해야 합니다.

5) 가상 렌더(render) — 보이는 범위만 DOM 생성 -->
<script>
function render(){
    const top = vm.scrollTop; // 스크롤 위치const vh = vm.clientHeight;// 뷰포트 높이co
    nst start = Math.max(0, Math.floor(top / ROW_H) - 5);
    const end = Math.min(start + Math.ceil(vh / ROW_H) + 10, items.length);

    area.innerHTML=''; // (간단/안전) 매 렌더링마다 깨끗이 다시 그림

    for(let i=start;i<end;i++){
        const p = items[i];
        const row = document.createElement('div');
        row.className = 'row';
        row.style.top = (i * ROW_H) + 'px'; // y좌표 계산(핵심)
        row.innerHTML = `
            <img class="thumb" width="72" height="72" alt="${p.title}" data-src="${p.img}">
            <div style="flex:1">
                <div class="title">${p.title}</div>
                <div>₩${p.price}</div>
            </div>
            <div class="actions">
                <button>담기</button>
            </div>`;
        area.appendChild(row);
    }
    observeImgs();// 새로 그려진 행 안의 썸네일만 관찰 시작}
</script>
<!--
  - start/end 계산: 현재 스크롤 위치로부터 보여야 하는 첫 행/마지막 행을 구하고, 위·아래로 여유(프리페치) 5행/10행을 더해 빠른 스크롤에도 빈 화면이 덜 보이게 합니다.
  - area.innerHTML = ''로 통째로 교체하는 방식은 코드가 단순하고, DOM Diff 비용없이 깨끗합니다. 성능상 더 최적화하려면 키드 패치(재사용) 전략을 사용할 수도 있습니다(복잡도↑).
  효과
  - 스크롤 시 늘 동일한 수(수십 개)의 행만 DOM에 존재 → Recalc Style/Layout/Scripting 비용이 안정적입니다.
  DevTools 확인
  - Performance → 스크롤하면서도 프레임 타임이 일정하고 긴 스파이크가 줄어드는지 확인합니다.
  - Memory → DOM 노드 수가 일정 범위로 유지되는지 확인합니다.

6) 이미지 Lazy — data-src → src (IntersectionObserver) -->
<script>
const imgIO = new IntersectionObserver(es => {
    es.forEach(e => {
        if(e.isIntersecting) {
            const img = e.target;
            img.src = img.dataset.src; // 이 순간 네트워크 요청 시작
            img.onload =() => img.classList.add('loaded'); // 시각적 페이드인
            imgIO.unobserve(img); // 1회만 관찰
        }
    });
}, {root: vm, rootMargin: '200px 0px'});

function observeImgs() {
    area.querySelectorAll('img[data-src]').forEach(i => imgIO.observe(i));
}
</script>
<!--
  - root: vm → 뷰포트 기준을 페이지 전체가 아니라 #viewport로 설정(성능/정확성↑).
  - rootMargin 200px → 화면에 보이기 조금 전에 미리 로드(스크롤 시 빈칸 방지).
  - onload에서 .loaded 클래스를 붙여 opacity 트랜지션을 시작 → 사용자 체감 품질↑.
  대안
  - 정적 HTML이라면 <img loading="lazy">도 간단합니다. 하지만 본 예제는 가상 리스트에서 동적으로 DOM을 그리므로 IO가 더 유연합니다.
  - 고해상도 대응에는 srcset/sizes 추가를 고려하십시오.
  DevTools 확인
- Network → 초기 로드에는 썸네일 요청이 거의 없음. 스크롤로 근접 시에만 Initiator: script로 요청이 발생합니다.

7) 스크롤 이벤트 — 렌더 호출 -->
<script>
vm.addEventListener('scroll', render,{passive: true});
</script>
<!--
  - passive:true → 스크롤 성능 최적화. 브라우저가 스크롤을 블로킹 없이 처리합니다.
  - 별도의 requestAnimationFrame 스로틀이 필요할 수도 있지만, 현재 규模/연산량에서는 충분히 가볍습니다. 프레임 드랍이 보이면 rAF 스케줄링을 고려하세요.

8) 무한 로드 — sentinel 관찰자 -->
<script>
const loadIO = new IntersectionObserver(es => {
    es.forEach(e => {
        if(e.isIntersecting) loadPage();
    });
}, {root: vm, rootMargin: '800px 0px'});
loadIO.observe(sent);
</script>
<!--
  - rootMargin 800px → 바닥에 충분히 가까워지면 다음 페이지를 미리 로딩 → 끊김 없이 이어짐.
  - loading 플래그로 동시 요청 방지. 실제 서비스는 중복 페이지, 마지막 페이지 처리도 반드시 고려해야 합니다.
  DevTools 확인
  - Network → 스크롤 진행에 따라 페이지 단위(PAGE=500)로 API/이미지 요청이 증대되는지 타이밍을 관찰합니다.

9) 동영상 Lazy — preload="none" + data-src + IO  -->
<script>
const promo = document.getElementById('promo');
const vidIO = new IntersectionObserver(es => {
    es.forEach(e => {
        if(e.isIntersecting) {
            promo.querySelectorAll('source[data-src]').forEach(s => {
                s.src = s.dataset.src;
                s.removeAttribute('data-src');
            });
            promo.load(); // 소스 주입 후 강제 로드 시작
            vidIO.unobserve(promo);
        }
    });
}, {root: null, rootMargin: '400px 0px'});
vidIO.observe(promo);
</script>
<!--
  - preload="none": 초기 로딩에서 비디오 파이프라인이 동작하지 않습니다.
  - IO로 근접 시 <source data-src> → src를 할당하고 load()호출 → 그때부터 네트워크 요청/디코딩 시작.
  - rootMargin 400px: 미리 준비해서 재생 버튼을 눌렀을 때 지연이 최소화 되도록 합니다.
  주의/대안
  - 자동재생(autoplay)은 모바일/정책에 의해 차단될 수 있으므로 사용자 클릭 기반 재생을 유지합니다.
  - poster는 실제 영상 첫 프레임과 비슷한 이미지로 두면 심리적 이질감이 적습니다.

10) 광고/분석 스크립트 Lazy — 화면 노출 시 실행      -->
<script>
const ad = document.getElementById('ad'), ana = document.getElementById('ana');
const scriptIO = new IntersectionObserver(es => {
    es.forEach(e => {
        if(e.isIntersecting) {
            ad.textContent = '광고 로드 완료';
            ana.textContent = '분석 스크립트 실행';
            scriptIO.disconnect(); // 데모: 한번에 둘 다 처리 후 해제
        }
    });
}, {root: null, rootMargin: '200px 0px'});

scriptIO.observe(ad);
scriptIO.observe(ana);
</script>
<!--
  - 데모에서는 텍스트 교체로 대체했지만, 실제론 <script src="..."> 삽입 또는 동적 import(import('...'))를 사용합니다.
  - 장점: 초기 JS 실행·다운로드 압박을 크게 낮춥니다. 특히 광고/분석은 3rd-party 비용이 크므로 Lazy의 효과가 큽니다.
  - 안전장치: 로드 실패/타임아웃/중복 실행 방지(플래그)를 더하는 것이 좋습니다.
  DevTools 확인
  - Network → Tail 영역 근접 전에는 광고/분석 관련 요청이 없습니다. 근접 시에만 발생하는지 확인합니다.
  - Performance → 초기 JS 평가/실행 시간 감소 확인.

11) 접근성과 UX 디테일
  - 이미지 alt: 상품명 전달 → 스크린리더 사용자가 이해 가능.
  - 버튼 ARIA 라벨: “담기”처럼 의미가 명확하지 않을 때, aria-label="상품 #123 장바구니 담기"로 맥락 강화.
  - 포커스 표시: .row:focus-within, .actions button:focus등 키보드 탐색 시 가시적 포커스 링 제공.
  - 스크롤 컨테이너 #viewport에 적절한 aria-label/role="list" 와 각 행 role="listitem"을 부여하면 더 좋습니다(본 Answer 코드 간소화 버전에는 최소한만 포함).

12) DevTools에서 확인할 포인트(체크리스트)
  1. Network(초기 3초)
    - 이미지/비디오/광고/분석 요청이 거의 없음(필수만) → 초기 혼잡 완화.
  2. Performance(스크롤 구간)
    - Recalculate Style / Layout / Scripting 스파이크가 짧고 낮음 → FPS 안정적.
  3. Memory
    - DOM 노드 수가 스크롤과 무관하게 수십 개 수준으로 유지.
  4. Layout Shift
    - 행 높이/이미지 크기 고정 → CLS 거의 0.
  5. Tail 근접 시점
    - 그때서야 비디오 소스/광고/분석 스크립트가 로드/실행되는지 타임라인으로 확인.

13) 흔한 실수 & 방지법
  - 행 높이(ROW_H) 불일치 → 행이 겹치거나 공백 생김
    . CSS 변경 시 상수도 함께 갱신하세요.
  - IO 누수 → 관찰 대상이 계속 누적되어 성능 하락
    . 처리 후 unobserve() 또는 disconnect()를 습관화합니다.
  - 무한 로드 중복 호출
    . loading 플래그, 마지막 페이지 처리(done)를 명확히.
  - 이미지 고해상도 과다 요청
    . 실제 서비스는 srcset/sizes, CDN 리사이즈를 함께 사용합니다.
  - 3rd-party 스크립트 오작동
    . 타임아웃/에러 핸들링, 중복 방지, 실행 순서 관리가 중요합니다.

14) 확장/고급화 아이디어
  - 가변 높이 리스트: 행마다 높이가 다르면 ResizeObserver /사전 측정/캐시로 variable size virtualization을 구현합니다(또는 react-virtualized/virtuoso등 라이브러리 사용).
  - 가상화 유지/DOM 재사용: innerHTML='' 대신 키드 재사용으로 미세 성능 향상(복잡도↑).
  - 프리페치 정책: 네트워크/단말 성능에 따라 rootMargin과 PAGE크기를 A/B로 최적화합니다.
  - 미디어 포맷: MP4 외 WebM/AV1, 이미지 WebP/AVIF 등으로 전송량 절감.

결론
  본 정답 코드는 “보이는 만큼만 렌더링”과 “필요할 때만 로딩”을 동시에 이행합니다.
    - 가상 리스트로 DOM/레이아웃 비용을 상수화,
    - IO 기반 무한 로드로 네트워크를 수요형으로 전환,
    - 이미지/비디오/광고/분석을 Lazy로 전환해 초기·전체 비용 최소화.
-->
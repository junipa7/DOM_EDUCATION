<!-- 
Mission #3: 실무형 CLS 최적화 미션 – 레이아웃 시프트 측정부터 개선까지

1. 미션 문제 설명
  당신은 이커머스 웹사이트의 프론트엔드 개발자입니다. 최근 고객센터와 리뷰에 이런 불만이 쌓이고 있습니다.
  - “상품 설명을 읽다가 갑자기 화면이 아래로 밀려서 줄을 놓쳤어요.”
  - “BUY 버튼을 누르려는 순간 광고가 튀어나와 잘못 눌렀습니다.”
  - “사이트가 안정적이지 않아 신뢰가 안 갑니다.”
  이 문제는 단순한 불편을 넘어 매출 손실, 브랜드 신뢰도 하락, 그리고 Google Core Web Vitals의 CLS(Cumulative Layout Shift) 점수 악화로 인한 SEO 불이익으로 이어질 수 있습니다.

  CLS 목표 : 일반적으로 0.1 이하를 양호, 0.25 이상을 개선 필요로 봅니다.

  현재 상품 상세 페이지에는 다음 문제가 있습니다.
    1. 이미지: 상단의 큰 이미지가 늦게 로드되며 공간 예약이 없어 콘텐츠를 아래로 밀어냄.
    2. 광고 영역: 상단 광고가 나중에 prepend 되어 문서 전체가 한 번 더 흔들림.
    3. 애니메이션: left로 이동하는 배너가 레이아웃 재계산을 유발.
    4. 폰트: 웹폰트가 늦게 도착하면 줄바꿈/높이가 변해 텍스트 블록이 흔들림.

  당신의 미션
    . 위 문제를 직접 재현하고, CLS를 수치로 측정한 뒤,
    . 원인별 최적화(이미지 자리 예약, 상단 late 삽입 방지, transform 이동, 폰트 swap)를 적용하여,
    . CLS ≤ 0.10을 달성하세요.
    . HUD(실시간 표시)와 DevTools Performance 탭에서 개선 효과를 시각·수치로 검증하세요.

2. Base Code (의도적으로 CLS가 크게 발생하는 나쁜 예시)
  이 Base는 일반 데스크톱 뷰포트에서 CLS 0.25+가 쉽게 나오도록 설계했습니다.

  포인트: 큰 이미지 늦은 삽입 → 상단 광고 prepend → 배너 left 이동 → 이미지 높이 강제 확대 → 중간 공지 삽입(여러 번, 멀리, 대면적 이동)
-->
<!DOCTYPE html>
<html lang="ko">
  <head>
    <meta charset="UTF-8" />
    <title>CLS 미션 - Fixed (Hardened)</title>

    <!-- Google Fonts with display=swap -->
    <link rel="preconnect" href="https://fonts.googleapis.com" />
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
    <link
      href="https://fonts.googleapis.com/css2?family=Roboto&display=swap"
      rel="stylesheet"
    />

    <style>
      :root {
        --ad-height: 120px;
      }

      body {
        font-family: "Roboto", system-ui, -apple-system, Segoe UI, sans-serif;
        margin: 0;
        padding: 24px;
        line-height: 1.5;
      }

      .hud {
        position: fixed;
        top: 12px;
        right: 12px;
        background: #111;
        color: #fff;
        padding: 10px 12px;
        border-radius: 8px;
        font-size: 14px;
        z-index: 9999;
      }

      /* 상단 광고: 초기부터 자리 확보 */
      .ad-wrap {
        width: 100%;
        height: var(--ad-height);
        background: #fff6bf;
        display: flex;
        align-items: center;
        justify-content: center;
        border: 2px dashed #222;
        margin: -24px -24px 24px;
      }
      .ad-content {
        opacity: 0;
        transition: opacity 0.3s ease;
      }
      .ad-content.ready {
        opacity: 1;
      }

      /* 이미지 공간 예약 */
      .hero-wrap {
        width: 100%;
      }
      .hero-skeleton {
        width: 100%;
        aspect-ratio: 4 / 3;
        background: #e9e9e9;
        border-radius: 8px;
        display: flex;
        align-items: center;
        justify-content: center;
        color: #666;
        font-size: 14px;
      }
      #hero {
        width: 100%;
        height: auto;
        display: none;
        border-radius: 8px;
      }

      .card {
        margin-top: 16px;
        padding: 12px;
        background: #f3f3f3;
        border-radius: 8px;
      }

      /* transform 애니메이션 */
      .banner-box {
        position: relative;
        height: 60px;
        margin-top: 24px;
      }
      .banner {
        position: absolute;
        left: 0;
        top: 0;
        width: 120px;
        height: 40px;
        background: #4c6ef5;
        color: #fff;
        display: flex;
        align-items: center;
        justify-content: center;
        border-radius: 8px;
        transition: transform 400ms ease;
        will-change: transform;
      }
      .banner.move {
        transform: translateX(260px);
      }
    </style>
  </head>
  <body>
    <div class="hud">CLS: <span id="cls">0.000</span></div>

    <!-- 광고 컨테이너 (초기부터 자리 확보) -->
    <div class="ad-wrap">
      <div class="ad-content" id="ad-content">로딩 중…</div>
    </div>

    <h1>레이아웃 셰프트 개선 페이지</h1>
    <p>이미지, 광고, 애니메이션, 폰트 문제를 개선했습니다.</p>

    <div class="hero-wrap">
      <!-- skeleton 안에 안내 문구도 배치 (로드 지연 시 사용자 피드백) -->
      <div class="hero-skeleton" id="hero-skeleton">이미지 로딩 중…</div>
      <!-- width/height로 공간 명시 + referrerpolicy로 리퍼러 이슈 회피 -->
      <img
        id="hero"
        alt="큰 이미지"
        width="1200"
        height="900"
        referrerpolicy="no-referrer"
        decoding="async"
      />
    </div>

    <div class="card" id="card1">
      이미지가 도착하기 전에도 공간이 예약되어 있어 아래 요소가 밀리지 않습니다.
    </div>

    <div class="banner-box">
      <div class="banner" id="banner">BUY</div>
    </div>

    <script>
      // CLS HUD
      (function measureCLS() {
        let clsValue = 0;
        const clsEl = document.getElementById("cls");
        if ("PerformanceObserver" in window) {
          const po = new PerformanceObserver((list) => {
            for (const entry of list.getEntries()) {
              if (!entry.hadRecentInput) {
                clsValue += entry.value;
                clsEl.textContent = clsValue.toFixed(3);
              }
            }
          });
          try {
            po.observe({ type: "layout-shift", buffered: true });
          } catch (e) {}
        }
      })();

      const hero = document.getElementById("hero");
      const skeleton = document.getElementById("hero-skeleton");
      const banner = document.getElementById("banner");
      const adContent = document.getElementById("ad-content");

      // 1차 기본 이미지 URL (Wikimedia)
      const IMG_PRIMARY =
        "https://upload.wikimedia.org/wikipedia/commons/3/3f/Fronalpstock_big.jpg";
      // 2차 대체 URL (Picsum: 4:3 비율)
      const IMG_FALLBACK = "https://picsum.photos/1200/900";

      // 이미지 로드 성공 시 skeleton 교체
      function showImage() {
        hero.style.display = "block";
        skeleton.style.display = "none";
      }

      // 이미지 로드 실패 시 대체 소스 시도
      function handleImgError() {
        if (hero.dataset.triedFallback === "1") {
          // 최종 실패: skeleton에 안내 표시 유지
          skeleton.textContent =
            "이미지를 불러오지 못했습니다. 네트워크 상태를 확인하세요.";
          return;
        }
        hero.dataset.triedFallback = "1";
        hero.src = IMG_FALLBACK;
      }

      // 5초 내 로드/에러 콜백이 없으면 안내로 전환(네트워크 지연 대비)
      const failSafeTimer = setTimeout(() => {
        if (hero.style.display === "none") {
          skeleton.textContent =
            "네트워크가 느립니다. 잠시 후 다시 시도합니다…";
        }
      }, 5000);

      // 이미지 로딩 시작 (자리 예약은 이미 되어 있음)
      setTimeout(() => {
        hero.onload = () => {
          clearTimeout(failSafeTimer);
          showImage();
        };
        hero.onerror = handleImgError;
        hero.src = IMG_PRIMARY;
      }, 600);

      // 광고 내용 교체 (컨테이너는 이미 자리 확보 → 레이아웃 영향 없음)
      setTimeout(() => {
        adContent.textContent = "광고 영역 – 예약된 자리 안에서 내용 교체";
        adContent.classList.add("ready");
      }, 1000);

      // transform 애니메이션 (레이아웃 비침범)
      setTimeout(() => {
        banner.classList.add("move");
      }, 1400);
    </script>
  </body>
</html>

<!-- 
Base가 왜 높은 CLS를 만드는가
  - Impact Fraction(영향 면적 비율): 이동에 영향받은 화면 면적 비율. 상단 큰 이미지/광고는 대면적 → 비율↑
  - Distance Fraction(이동 거리 비율): 화면 대비 이동 거리. 상단에서 추가 삽입/확대는 멀리 이동 → 비율↑
  - Shift = Impact × Distance, 여러 번 누적되어 CLS가 커짐.

3. 미션 문제 요구 사항
  최종 목표: CLS ≤ 0.101.
  - 이미지 셰프트 제거
    . <img width height> or aspect-ratio로 자리를 예약
    . skeleton UI로 로딩 중에도 시각적 안정성 제공
    . 로딩 후 onload에서 skeleton → 실제 이미지로 교체
  - 상단 Late Insertion 방지/완화
    . 상단 광고/공지 등 늦게 오는 컴포넌트는 초기부터 고정 높이 컨테이너로 자리 확보
    . 나중엔 내용만 교체 또는 position: sticky/fixed 로 문서 흐름을 밀지 않도록
  - 애니메이션 최적화
    . left/top/margin 대신 transform: translate 사용
    . 필요 시 will-change: transform으로 합성 레이어 힌트
  - 웹폰트 셰프트 최소화
    . Google Fonts CSS + display=swap
    . 주요 텍스트 line-height 고정으로 줄바꿈 변동 최소화
  - 측정과 검증
    . HUD로 실시간 CLS 표시
    . DevTools Performance에서 Layout Shift 이벤트 확인(Moved from/to, Impacted nodes)

4. 미션 문제의 의의
  - UX 안정성 확보: 화면이 “덜컥”하지 않아 사용자 집중/조작 안정
  - SEO/매출 영향: CLS 양호(≤0.10) 유지 → 검색 노출/신뢰/전환율 개선
  - 재현-측정-개선-검증 사이클 훈련: 실무 프로젝트에 곧바로 적용 가능
  - 조직 설득력 강화: HUD 수치 + DevTools 시각 증거로 PM/디자인/경영진 설득 용이

5. 미션 정답 코드 (CLS ≤ 0.10)
  이미지 로딩 실패/지연 케이스까지 고려한 내결함성 강화 버전입니다.
  변경점: onerror 폴백(2단계 URL), referrerpolicy="no-referrer", loading="lazy" 제거(테스트 안정),
  <img width height> 명시(자리 예약), 5초 타임아웃 안내, 여전히 transform 기반 이동.
-->

<!DOCTYPE html>
<html lang="ko">
  <head>
    <meta charset="UTF-8" />
    <title>CLS 미션 - Fixed (Hardened)</title>

    <!-- Google Fonts with display=swap -->
    <link rel="preconnect" href="https://fonts.googleapis.com" />
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
    <link
      href="https://fonts.googleapis.com/css2?family=Roboto&display=swap"
      rel="stylesheet"
    />

    <style>
      :root {
        --ad-height: 120px;
      }

      body {
        font-family: "Roboto", system-ui, -apple-system, Segoe UI, sans-serif;
        margin: 0;
        padding: 24px;
        line-height: 1.5;
      }

      .hud {
        position: fixed;
        top: 12px;
        right: 12px;
        background: #111;
        color: #fff;
        padding: 10px 12px;
        border-radius: 8px;
        font-size: 14px;
        z-index: 9999;
      }

      /* 상단 광고: 초기부터 자리 확보 */
      .ad-wrap {
        width: 100%;
        height: var(--ad-height);
        background: #fff6bf;
        display: flex;
        align-items: center;
        justify-content: center;
        border: 2px dashed #222;
        margin: -24px -24px 24px;
      }
      .ad-content {
        opacity: 0;
        transition: opacity 0.3s ease;
      }
      .ad-content.ready {
        opacity: 1;
      }

      /* 이미지 공간 예약 */
      .hero-wrap {
        width: 100%;
      }
      .hero-skeleton {
        width: 100%;
        aspect-ratio: 4 / 3;
        background: #e9e9e9;
        border-radius: 8px;
        display: flex;
        align-items: center;
        justify-content: center;
        color: #666;
        font-size: 14px;
      }
      #hero {
        width: 100%;
        height: auto;
        display: none;
        border-radius: 8px;
      }

      .card {
        margin-top: 16px;
        padding: 12px;
        background: #f3f3f3;
        border-radius: 8px;
      }

      /* transform 애니메이션 */
      .banner-box {
        position: relative;
        height: 60px;
        margin-top: 24px;
      }
      .banner {
        position: absolute;
        left: 0;
        top: 0;
        width: 120px;
        height: 40px;
        background: #4c6ef5;
        color: #fff;
        display: flex;
        align-items: center;
        justify-content: center;
        border-radius: 8px;
        transition: transform 400ms ease;
        will-change: transform;
      }
      .banner.move {
        transform: translateX(260px);
      }
    </style>
  </head>
  <body>
    <div class="hud">CLS: <span id="cls">0.000</span></div>

    <!-- 광고 컨테이너 (초기부터 자리 확보) -->
    <div class="ad-wrap">
      <div class="ad-content" id="ad-content">로딩 중…</div>
    </div>

    <h1>레이아웃 셰프트 개선 페이지</h1>
    <p>이미지, 광고, 애니메이션, 폰트 문제를 개선했습니다.</p>

    <div class="hero-wrap">
      <!-- skeleton 안에 안내 문구도 배치 (로드 지연 시 사용자 피드백) -->
      <div class="hero-skeleton" id="hero-skeleton">이미지 로딩 중…</div>
      <!-- width/height로 공간 명시 + referrerpolicy로 리퍼러 이슈 회피 -->
      <img
        id="hero"
        alt="큰 이미지"
        width="1200"
        height="900"
        referrerpolicy="no-referrer"
        decoding="async"
      />
    </div>

    <div class="card" id="card1">
      이미지가 도착하기 전에도 공간이 예약되어 있어 아래 요소가 밀리지 않습니다.
    </div>

    <div class="banner-box">
      <div class="banner" id="banner">BUY</div>
    </div>

    <script>
      // CLS HUD
      (function measureCLS() {
        let clsValue = 0;
        const clsEl = document.getElementById("cls");
        if ("PerformanceObserver" in window) {
          const po = new PerformanceObserver((list) => {
            for (const entry of list.getEntries()) {
              if (!entry.hadRecentInput) {
                clsValue += entry.value;
                clsEl.textContent = clsValue.toFixed(3);
              }
            }
          });
          try {
            po.observe({ type: "layout-shift", buffered: true });
          } catch (e) {}
        }
      })();

      const hero = document.getElementById("hero");
      const skeleton = document.getElementById("hero-skeleton");
      const banner = document.getElementById("banner");
      const adContent = document.getElementById("ad-content");

      // 1차 기본 이미지 URL (Wikimedia)
      const IMG_PRIMARY =
        "https://upload.wikimedia.org/wikipedia/commons/3/3f/Fronalpstock_big.jpg";
      // 2차 대체 URL (Picsum: 4:3 비율)
      const IMG_FALLBACK = "https://picsum.photos/1200/900";

      // 이미지 로드 성공 시 skeleton 교체
      function showImage() {
        hero.style.display = "block";
        skeleton.style.display = "none";
      }

      // 이미지 로드 실패 시 대체 소스 시도
      function handleImgError() {
        if (hero.dataset.triedFallback === "1") {
          // 최종 실패: skeleton에 안내 표시 유지
          skeleton.textContent =
            "이미지를 불러오지 못했습니다. 네트워크 상태를 확인하세요.";
          return;
        }
        hero.dataset.triedFallback = "1";
        hero.src = IMG_FALLBACK;
      }

      // 5초 내 로드/에러 콜백이 없으면 안내로 전환(네트워크 지연 대비)
      const failSafeTimer = setTimeout(() => {
        if (hero.style.display === "none") {
          skeleton.textContent =
            "네트워크가 느립니다. 잠시 후 다시 시도합니다…";
        }
      }, 5000);

      // 이미지 로딩 시작 (자리 예약은 이미 되어 있음)
      setTimeout(() => {
        hero.onload = () => {
          clearTimeout(failSafeTimer);
          showImage();
        };
        hero.onerror = handleImgError;
        hero.src = IMG_PRIMARY;
      }, 600);

      // 광고 내용 교체 (컨테이너는 이미 자리 확보 → 레이아웃 영향 없음)
      setTimeout(() => {
        adContent.textContent = "광고 영역 – 예약된 자리 안에서 내용 교체";
        adContent.classList.add("ready");
      }, 1000);

      // transform 애니메이션 (레이아웃 비침범)
      setTimeout(() => {
        banner.classList.add("move");
      }, 1400);
    </script>
  </body>
</html>


<!-- 
6. 각 정답 코드 및 해설 상세

(A) 이미지 셰프트 제거 (자리 예약 + 온로드 교체 + 폴백)
  - 원리: 이미지가 도착하기 전엔 높이를 모름 → 높이 0으로 배치했다가 나중에 확장 → 레이아웃 셰프트 발생.
  - 해결:
    . <img width height> 또는 .hero-skeleton { aspect-ratio: 4/3; } 로 처음부터 공간 예약.
    . onload 에서 skeleton을 교체(레이아웃 불변).
    . onerror 폴백과 타임아웃 안내로 네트워크 문제에서도 안정성/피드백 확보.
  - 코드 포인트:
    . width="1200" height="900": 비율 예약 + CLS에 안전
    . referrerpolicy="no-referrer": 일부 외부 호스트의 리퍼러 정책 회피
    . handleImgError() → 2차 URL 시도, 그래도 실패 시 안내 유지
    . failSafeTimer: 5초 응답 없음 시 skeleton에 안내문 표시

(B) 상단 Late Insertion 방지 (컨테이너 고정)
  - 원리: 상단에 late 삽입하면 기존 콘텐츠가 한 번에 내려가 Impact가 큼.
  - 해결: .ad-wrap { height: var(--ad-height) } 로 초기부터 자리 확보, 나중엔 .ad-content 텍스트만 교체.
  - 코드 포인트: 초기 ad-wrap 렌더 → 1000ms에 ad-content 만 교체 → 레이아웃 불변

(C) 애니메이션 최적화 (transform 전환)
  - 원리: left/top 변경은레이아웃 → 페인트 → 합성 파이프라인 유발.
  - 해결: transform: translateX()는 합성 단계만 거쳐 레이아웃 고정 → CLS 0.
  - 코드 포인트:
    . .banner { transition: transform 400ms; will-change: transform; }
    . classList.add('move') → transform: translateX(260px)

(D) 폰트 셰프트 최소화 (display=swap)
  - 원리: 웹폰트 늦을 때 기본 글꼴 → 웹폰트 교체 시 폭/줄바꿈 변동.
  - 해결: Google Fonts CSS display=swap으로 가시 텍스트 유지, 줄바꿈 변동 최소화(추가로 line-height
          고정은 상황에 따라 고려).
  - 코드 포인트:
    . <link href="...family=Roboto&display=swap">
    . preconnect 로 폰트 서버 연결 비용 감소

(E) 측정과 검증 (HUD + DevTools)
  - HUD: PerformanceObserver({ type: 'layout-shift', buffered: true })로 엔트리 수집 → entry.value = Impact × Distance, hadRecentInput 제외, 누적해서 화면에 표시.
  - DevTools: F12 → Performance
    . Record 후 새로고침
    . Layout Shift 마커 클릭
    . 영향 영역/이동 거리, 해당 노드 추적
    . Base는 큰 마커 여러 번, Fixed는 거의 없음/작음
  - 목표: 새로고침 반복/창 크기 변경/네트워크 변동에도 CLS ≤ 0.10 유지.

부록: 체크리스트
  - 이미지에 width/height 또는 aspect-ratio 로 자리 예약
  - 상단 광고/공지 등 late 컴포넌트는 초기 컨테이너로 자리 확보, 이후 내용만 교체
  - 이동/애니메이션은 transform 기반, 필요 시 will-change
  - 폰트는 display=swap, 필요시 주요 텍스트 line-height 고정
  - HUD 수치 및 DevTools Layout Shift 이벤트로 CLS ≤ 0.10 검증 완료
  - 네트워크 오류/지연 대비 onerror 폴백 + 타임아웃 안내 구현
-->
<!--
Mission #2: “프로모션 가격표 섹션이 산만합니다. DevTools로 원인 추적 후, 한 번에 고치고 UI를 리디자인하세요.”
(정답 코드를 먼저 실행하고 미션을 진행하시길 권장해 드립니다!)

1) 실무 스토리
  회사 랜딩 페이지에 “봄맞이 프로모션 가격표”가 급히 붙었습니다. 출시 당일 QA 피드백은 이렇습니다.
  - 다크 모드에서 버튼/텍스트 대비가 너무 낮아 읽기 어렵다.
  - 카드마다 패딩/폰트 크기가 들쭉날쭉이다.
  - inline style 과 !important, 그리고 특이성 높은 규칙이 섞여 왜 저 색이 최종인지 이해가 안 된다.
  - “Pro” 카드만 디자인이 다르고, CTA가 브랜드 컬러가 아닌 파란색으로 덮인다.
  - “할인 배지”가 좌우 브라우저에서 엉뚱한 위치에 붙는다.

  PM의 요구:
  1. DevTools Elements/Styles/Computed 로 “왜 이런 최종값이 되었는지” 근거를 뽑아라.
  2. CSS를 컴포넌트 스코프로 정리하고, 다크/라이트 모두 고대비로 재설계하라.
  3. 카드 간 타이포/간격/버튼 스타일을 완전 통일하고, Pro 카드만 적절히 강조하되 과한 특이성 없이 만들라.

  2) 미션 요구 사항 (체크리스트)
  - DevTools Computed에서 최소 5개 항목(색, 패딩, 폰트 크기, 배경, 위치) 최종값과 출처 규칙을 캡처/설명
  - inline style/!important/ID 규칙 때문에 생기는 최종값 역전 사례 2개 이상 근거 제시
  - CSS 디자인 토큰(변수) 도입, 색/간격/폰트 일원화
  - *컴포넌트 스코프(BEM/모듈식)**로 가격표를 재작성, 전역 부작용 제거
  - 라이트/다크 모두에서 명도 대비(CTA/텍스트/배경) 확보
  - “Pro” 카드만 깔끔하게 강조(리본/외곽선/음영 등), 나머지는 균형 유지
  - 리본/배지 절대 위치 오작동 해결(컨테이너 기준 위치)
  - 버튼은 전역 .btn의 강제 파랑에 덮이지 않도록 특이성/소스 순서 정리
  - 폰트/라인/패딩을 px/rem 혼용 없이 일관화, Computed 수치가 카드 간 동일

3) Base Code (전 상태 – 충돌/저대비/특이성 함정)
pricing-base.html로 저장, 브라우저에서 열고 DevTools로 관찰하세요.
(테마 토글 포함. 다크에서 특히 문제를 보이게 설계) -->

<!DOCTYPE html>
<html lang="ko" data-theme="dark">
  <head>
    <meta charset="UTF-8" />
    <meta name="color-scheme" content="dark light" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>[BASE] 산만한 가격표 – 특이성/inline/저대비 문제</title>
    <style>
      /* 전역 토큰이 없음 → 전역 규칙 충돌 유발용 */
      html {
        font-size: 14px;
      }
      body {
        margin: 0;
        font-family: system-ui, -apple-system, Segoe UI, Roboto, Noto Sans,
          sans-serif;
        background: #0b1220;
        color: #cfd3dc;
      }
      html[data-theme="light"] body {
        background: #ffffff;
        color: #0b1220;
      }

      /* 전역 버튼 – 파랑 강제 + !important (문제의 씨앗) */
      .btn {
        background: #0a8fff !important;
        color: white !important;
        border: 0;
        padding: 10px 14px;
        border-radius: 10px;
        cursor: pointer;
      }

      /* 헤더 (대비 낮음) */
      .header {
        position: sticky;
        top: 0;
        background: #0b1220aa;
        color: #95a0b3;
        padding: 10px 14px;
        border-bottom: 1px solid #1d2635;
      }
      html[data-theme="light"] .header {
        background: #ffffffcc;
        color: #4d5a6e;
        border-bottom: 1px solid #e6e8ef;
      }
      .header .right {
        float: right;
      }
      .header .btn-ghost {
        background: transparent;
        color: inherit;
        border: 1px solid #1d2635;
        padding: 8px 12px;
        border-radius: 10px;
      }
      html[data-theme="light"] .header .btn-ghost {
        border-color: #e6e8ef;
      }

      /* 가격표 래퍼 – 구식 레이아웃 */
      .pricing {
        max-width: 1100px;
        margin: 40px auto 60px;
      }
      .row {
        font-size: 0;
      }
      .plan {
        display: inline-block;
        vertical-align: top;
        width: 32%;
        margin: 0 1%;
        font-size: 1rem;
        background: #111a2a;
        border: 1px solid #1f2937;
        border-radius: 12px;
        overflow: hidden;
        position: relative;
      }
      html[data-theme="light"] .plan {
        background: #f8fafc;
        border-color: #e6e8ef;
      }

      /* 카드 타이포 – 혼용, 저대비 */
      .plan h3 {
        margin: 16px 16px 6px 16px;
        font-size: 18px;
        color: #9fb0c7;
      }
      .plan .price {
        margin: 0 16px 8px 16px;
        font-size: 28px;
        color: #a5b4c8;
      }
      .plan .desc {
        margin: 0 16px 12px 16px;
        color: #8a94a6;
        line-height: 1.3;
      }
      .plan .features {
        margin: 12px 16px 16px 16px;
        color: #9aa4b8;
      }
      .plan .features li {
        margin: 6px 0;
      }

      /* CTA – 전역 .btn 규칙에 종속 → 파랑으로 강제 */
      .plan .cta {
        margin: 16px;
      }
      .plan .cta .btn {
        width: 100%;
      }

      /* Pro 카드만 inline style과 id로 어지럽게 덮어쓰기 */
      #pro {
        border-color: #3b82f6;
      }
      #pro h3 {
        color: #b6cfff !important;
      } /* 강제 */
      #pro .price {
        font-size: 30px;
      }
      /* inline style이 아래 본문에 들어감 */

      /* 할인 배지 – 위치 기준 잘못(문제 유도) */
      .badge {
        position: absolute;
        top: -10px;
        right: -6px;
        background: #f87171;
        color: white;
        padding: 4px 10px;
        border-radius: 999px;
        font-size: 12px;
      }

      /* 라이트에서 대비 낮음 유지하려고 일부러 */
      html[data-theme="light"] .plan h3 {
        color: #7b8aa1;
      }
      html[data-theme="light"] .plan .desc {
        color: #8ea0b5;
      }
    </style>
  </head>
  <body>
    <div class="header">
      <strong>봄맞이 프로모션</strong>
      <span class="right">
        <button id="theme" class="btn-ghost">🌓 테마</button>
      </span>
    </div>

    <main class="pricing">
      <div class="row">
        <section class="plan" id="basic">
          <span class="badge">-20%</span>
          <h3>Basic</h3>
          <p class="price">₩9,900</p>
          <p class="desc">개인/취미용. 소규모 프로젝트에 적합.</p>
          <ul class="features">
            <li>월 1GB 트래픽</li>
            <li>커뮤니티 지원</li>
          </ul>
          <div class="cta">
            <button class="btn">지금 시작</button>
          </div>
        </section>

        <section
          class="plan"
          id="pro"
          style="background: #0c1528; padding-bottom: 26px"
        >
          <span class="badge" style="right: -12px; top: -14px">인기</span>
          <h3>Pro</h3>
          <p class="price">₩19,900</p>
          <p class="desc" style="line-height: 1.1">
            팀 협업, 대시보드 제작에 추천.
          </p>
          <ul class="features">
            <li>월 10GB 트래픽</li>
            <li>이메일 지원</li>
            <li>애널리틱스</li>
          </ul>
          <div class="cta">
            <button class="btn" style="border-radius: 6px">업그레이드</button>
          </div>
        </section>

        <section class="plan" id="business">
          <span class="badge">-30%</span>
          <h3>Business</h3>
          <p class="price">₩49,900</p>
          <p class="desc">기업/고트래픽 서비스용. SLA 포함.</p>
          <ul class="features">
            <li>무제한 트래픽</li>
            <li>우선 지원</li>
            <li>전담 CSM</li>
          </ul>
          <div class="cta">
            <button class="btn">상담하기</button>
          </div>
        </section>
      </div>
    </main>

    <script>
      const root = document.documentElement;
      const saved = localStorage.getItem("theme") || "dark";
      root.setAttribute("data-theme", saved);
      document.getElementById("theme").addEventListener("click", () => {
        const next =
          root.getAttribute("data-theme") === "dark" ? "light" : "dark";
        root.setAttribute("data-theme", next);
        localStorage.setItem("theme", next);
      });
    </script>
  </body>
</html>

<!--
  왜 Base가 문제인지(DevTools 관찰 포인트)
    - .btn{… !important}가 모든 CTA 색을 파랑으로 강제 — 특이성/!important 확인.
    - #pro h3{… !important} + #pro inline style → Computed에서 소스 순서/특이성 역전 확인.
    - .desc는 카드마다 line-height가 달라 가독성 불균형.
    - .badge 기준이 카드인지 아닌지 정확히 애매 → 화면 크기 바뀌면 위치 튐.
    - 다크/라이트 전환 시 h3/desc 대비가 체감 낮음(명도 차 확인).

4) 미션의 의의
  - Elements/Computed로 “최종값 = 규칙 A(특이성 N) + 소스 순서 M + inline/!important 여부”를 근거로 밝히는 훈련.
  - 컴포넌트 스코프(BEM 등)와 디자인 토큰(CSS 변수)로 전역 부작용을 격리.
  - 접근성 대비(버튼/텍스트/배경), 일관 타이포/간격을 정량화해 팀 공통 기준 마련.

5) Answer Code (후 상태 – 토큰/스코프/접근성/레이아웃 리디자인)
  pricing-answer.html로 저장해서 실행하세요.
  전/후가 즉시 체감되도록 그리드/리본/버튼/타이포 모두 정리했습니다.
-->

<!DOCTYPE html>
<html lang="ko" data-theme="dark">
  <head>
    <meta charset="UTF-8" />
    <meta name="color-scheme" content="dark light" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>[ANSWER] 정돈된 가격표 – 토큰/스코프/접근성</title>
    <style>
      /* ===== Design Tokens ===== */
      :root {
        --space-1: 4px;
        --space-2: 8px;
        --space-3: 12px;
        --space-4: 16px;
        --space-5: 20px;
        --space-6: 24px;
        --radius: 14px;
        --font-body: 16px;
        --lh-body: 1.6;
        --font-h3: 20px;
        --font-price: 32px;

        --bg: #0b1220;
        --elev: #111a2a;
        --text: #e6e9ef;
        --muted: #a7b1c2;
        --border: #203047;
        --brand: #60a5fa;
        --brand-strong: #3b82f6;
        --danger: #f87171;
        --ok: #22c55e;

        --cta-fg: #0b1220;
        --cta-bg: #60a5fa;
        --cta-bg-strong: #3b82f6;

        --card-shadow: 0 6px 24px rgba(0, 0, 0, 0.35);
        --ribbon-bg: linear-gradient(135deg, var(--ok), #7dd3fc);
      }
      html[data-theme="light"] {
        --bg: #ffffff;
        --elev: #f8fafc;
        --text: #0b1220;
        --muted: #49566b;
        --border: #e6e8ef;
        --brand: #2563eb;
        --brand-strong: #1d4ed8;
        --cta-fg: #ffffff;
        --cta-bg: #2563eb;
        --cta-bg-strong: #1d4ed8;
        --card-shadow: 0 6px 20px rgba(17, 24, 39, 0.08);
        --ribbon-bg: linear-gradient(135deg, #10b981, #60a5fa);
      }

      /* ===== Base ===== */
      html {
        font-size: 16px;
      }
      * {
        box-sizing: border-box;
      }
      body {
        margin: 0;
        background: var(--bg);
        color: var(--text);
        font: var(--font-body) / var(--lh-body) system-ui, -apple-system,
          Segoe UI, Roboto, Noto Sans, sans-serif;
      }

      /* ===== Header ===== */
      .header {
        position: sticky;
        top: 0;
        background: color-mix(in oklab, var(--bg), white 5%);
        backdrop-filter: saturate(1.2) blur(6px);
        border-bottom: 1px solid var(--border);
        padding: var(--space-4) var(--space-5);
        display: flex;
        justify-content: space-between;
        align-items: center;
      }
      .btn-ghost {
        background: transparent;
        color: var(--text);
        border: 1px solid var(--border);
        padding: var(--space-3) var(--space-4);
        border-radius: 10px;
        cursor: pointer;
      }

      /* ===== Pricing Layout (모듈 스코프: .pricing) ===== */
      .pricing {
        max-width: 1100px;
        margin: 40px auto 60px;
        padding: 0 var(--space-5);
      }
      .pricing__grid {
        display: grid;
        grid-template-columns: repeat(3, 1fr);
        gap: var(--space-5);
      }
      @media (max-width: 960px) {
        .pricing__grid {
          grid-template-columns: 1fr;
        }
      }

      .plan {
        background: var(--elev);
        border: 1px solid var(--border);
        border-radius: var(--radius);
        padding: var(--space-6);
        box-shadow: var(--card-shadow);
        position: relative;
        overflow: hidden;
      }
      .plan__head {
        margin-bottom: var(--space-4);
      }
      .plan__name {
        margin: 0 0 var(--space-2);
        font-size: var(--font-h3);
        color: color-mix(in oklab, var(--text), var(--brand) 20%);
      }
      .plan__price {
        margin: 0;
        font-size: var(--font-price);
        font-weight: 700;
        letter-spacing: -0.02em;
      }
      .plan__desc {
        margin: var(--space-3) 0 var(--space-4);
        color: var(--muted);
        line-height: 1.7;
      }

      .plan__features {
        margin: 0 0 var(--space-5);
        padding: 0;
        list-style: none;
        color: color-mix(in oklab, var(--muted), var(--text) 25%);
      }
      .plan__features li {
        display: flex;
        gap: var(--space-3);
        align-items: flex-start;
        margin: var(--space-2) 0;
      }
      .plan__features li::before {
        content: "✔";
        color: var(--ok);
        margin-top: 2px;
      }

      .plan__cta .btn {
        width: 100%;
        border-radius: 12px;
        padding: var(--space-4);
        border: 0;
        color: var(--cta-fg);
        background: var(--cta-bg);
        cursor: pointer;
      }
      .plan__cta .btn:hover {
        background: var(--cta-bg-strong);
      }

      /* Pro 강조 – 특이성 남발 없이 상태 클래스로 */
      .plan--pro {
        outline: 2px solid
          color-mix(in oklab, var(--brand-strong), var(--text) 20%);
        outline-offset: 2px;
      }
      .plan--pro .plan__name {
        color: var(--brand);
      }
      .plan--pro .ribbon {
        position: absolute;
        top: 12px;
        right: -36px;
        transform: rotate(35deg);
        background: var(--ribbon-bg);
        color: #fff;
        padding: 6px 56px;
        font-weight: 700;
        text-shadow: 0 1px 0 rgba(0, 0, 0, 0.25);
      }

      /* 배지(할인) – 컨테이너 기준 앵커 고정 */
      .badge {
        position: absolute;
        top: 3px;
        left: 12px;
        background: var(--danger);
        color: white;
        padding: 4px 10px;
        border-radius: 999px;
        font-size: 12px;
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.25);
      }
    </style>
  </head>
  <body>
    <header class="header">
      <strong>봄맞이 프로모션</strong>
      <button id="theme" class="btn-ghost">🌓 테마</button>
    </header>

    <main class="pricing">
      <section class="pricing__grid">
        <!-- Basic -->
        <article class="plan plan--basic">
          <span class="badge">-20%</span>
          <div class="plan__head">
            <h3 class="plan__name">Basic</h3>
            <p class="plan__price">₩9,900</p>
            <p class="plan__desc">
              개인/취미용 – 소규모 프로젝트를 가볍게 시작하세요.
            </p>
          </div>
          <ul class="plan__features">
            <li>월 1GB 트래픽</li>
            <li>커뮤니티 지원</li>
          </ul>
          <div class="plan__cta">
            <button class="btn">지금 시작</button>
          </div>
        </article>

        <!-- Pro (강조) -->
        <article class="plan plan--pro">
          <div class="ribbon">인기</div>
          <div class="plan__head">
            <h3 class="plan__name">Pro</h3>
            <p class="plan__price">₩19,900</p>
            <p class="plan__desc">
              팀 협업/대시보드 제작 – 필요 기능을 안정적으로.
            </p>
          </div>
          <ul class="plan__features">
            <li>월 10GB 트래픽</li>
            <li>이메일 지원</li>
            <li>애널리틱스</li>
          </ul>
          <div class="plan__cta">
            <button class="btn">업그레이드</button>
          </div>
        </article>

        <!-- Business -->
        <article class="plan plan--biz">
          <span class="badge">-30%</span>
          <div class="plan__head">
            <h3 class="plan__name">Business</h3>
            <p class="plan__price">₩49,900</p>
            <p class="plan__desc">
              기업/고트래픽 – SLA/전담 지원 포함, 확장성 극대화.
            </p>
          </div>
          <ul class="plan__features">
            <li>무제한 트래픽</li>
            <li>우선 지원</li>
            <li>전담 CSM</li>
          </ul>
          <div class="plan__cta">
            <button class="btn">상담하기</button>
          </div>
        </article>
      </section>
    </main>

    <script>
      const root = document.documentElement;
      const saved = localStorage.getItem("theme") || "dark";
      root.setAttribute("data-theme", saved);
      document.getElementById("theme").addEventListener("click", () => {
        const next =
          root.getAttribute("data-theme") === "dark" ? "light" : "dark";
        root.setAttribute("data-theme", next);
        localStorage.setItem("theme", next);
      });
    </script>
  </body>
</html>

<!--
  Answer 핵심 변화(전/후가 즉시 보임)
    - 전역 .btn의 !important제거: 전역 강제 파랑이 사라지고, 컴포넌트 스코프 .plan__cta .btn가 브랜드 토큰을 정확히 반영.
    - 디자인 토큰으로 색/간격/폰트 일원화 → Computed에서 카드 간 padding/line-height/size가 모두 동일.
    - 상태 클래스 .plan--pro 만으로 강조(리본, 아웃라인, 타이틀 색) — ID/inline/!important 없이 해결.
    - 배지/리본 위치는 카드 컨테이너 기준으로 안정적.
    - 라이트/다크 둘 다 CTA/텍스트 대비가 뚜렷.

6) 해설 & DevTools 분석 가이드
  A. 왜 버튼이 늘 파랑이었나?
    - Base의 .btn{ background:#0a8fff !important; color:white !important }가 모든 버튼을 강제.
    - Elements → Styles에서 .plan .cta .btn가 있어도, !important 때문에 우선 적용.
    - Answer는 전역 !important를 제거 + 컴포넌트 규칙 .plan__cta .btn로 스코프 우선 적용.
    - Computed에서 최종 배경이 -cta-bg로 바뀐 것 확인.

  B. Pro 카드의 타이틀/배경 왜 제멋대로였나?
    - Base: #pro h3{… !important} + <section id="pro" style="background:…"> inline.
    - Styles에서 ID + inline이 높은 특이성으로 다른 규칙을 덮음.
    - Answer: plan--pro 상태 클래스로 의도만 표현 → outline, name 색, ribbon 만 추가.
    - Computed에서 h3 색이 변수/상태 클래스에서 온 것인지 출처 확인.

  C. 폰트/패딩 불일치 원인
    - Base: html{font-size:14px}, 개별 요소 px/line-height가 혼용 + 카드마다 inline 차이.
    - Answer: :root 토큰과 .plan{ padding: var(--space-6) }, font-size/line-height 일원화.
    - Box model에서 카드들 padding/높이가 동일(혹은 규칙적)해진 것을 확인.

  D. 배지/리본 위치 불안정
    - Base: .badge가 컨테이너 상대가 아닌 맥락으로 쉽게 흔들림(특히 inline style).
    - Answer: .plan을 position:relative(이미 있음)로 기준 고정, .badge/.ribbon을 절대 위치로 안정 배치.
    - Elements에서 .plan을 선택 → Computed → position과 좌표/offset을 확인.

  E. 접근성 대비
    - Answer는 CTA 텍스트/배경, 본문/배경의 명도 대비를 토큰으로 확보.
    - 라이트/다크 전환 시 색상이 아니라 토큰만 바뀌기 때문에 일관된 대비 유지.
    - Computed에서 최종 색/배경 쌍을 캡처해 대비 체크(DevTools/확장 도구 활용).

이 미션으로 Elements/Computed를 ‘읽는 힘’ 과 특이성/상속/소스 순서를 설계로 제어하는 힘을 동시에 키웁니다. 전/후가 확연히 달라진 가격표 UI를 기준삼아, 팀 내 어디서든 “왜 이렇게 보이는지”를 근거로 설명하고, “어디를 어떻게 고쳐야 하는지”를 정확히 제안할 수 있게 될 거예요.
-->

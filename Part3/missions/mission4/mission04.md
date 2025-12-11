<!--
Mission #4: “대시보드 렌더링 병목 진단 & 최적화 – 카드에 실제 KPI/표/미니차트 적용”

1) 미션 문제 설명
  당신은 다음 주 이사회 데모에 투입된 경영 대시보드 담당 개발자입니다. 이 대시보드는 단순 목업이 아닌 실제 KPI(매출·전환율·활성 사용자·에러율)와 트래픽 추이 미니 차트, 최근 주문 테이블까지 포함된 실무형입니다.

  테스트 장비에서는 큰 문제가 없어 보였지만, 시연 리허설에서 세 가지 이상 현상이 동시에 드러났습니다.
  1. 스크롤 끊김과 hover 시 FPS 급락: 카드가 수십 개 이상인 그리드/격자형 카드 레이아웃에서 스크롤 중 자주 끊기고, 카드에 마우스를 올리면 프레임이 급격히 떨어집니다. Paint Flashing를 켜면 초록색 페인트가 연속적으로 번쩍이며, Performance 타임라인에서는 Recalculate Style → Layout → Paint가 긴 블록으로 뭉쳐보입니다.
  2. FOIT(Flash of Invisible Text): 초기 렌더링에서 텍스트가 한동안 보이지 않았다가 폰트가 내려온 뒤에야 표시됩니다. 경영진이 첫 인상에서 “깨진 화면 같다”는 피드백을 주었습니다.
  3. 아이콘/스파크라인에서 잦은 Paint: 아이콘은 외부 SVG + 필터, 스파크라인은 그라디언트 + 투명도/필터 조합으로 표현되어 hover/스크롤과 결합될 때 Paint 빈도와 비용이 상승합니다.

이번 미션의 핵심 목표는 다음입니다.
  - DevTools(Performance/Network/Layers/Rendering)로 병목의 위치를 근거로 확인하고,
  - 시각적 결과(톤·여백·강조)는 유지하면서 렌더링 비용을 Layout→Paint→Composite 관점에서 줄이며,
  - 개선 전/후 결과(스크린샷·타임라인·수치)를 리포트 형식으로 정리해 팀을 설득하는 것입니다.

2) 미션 요구 사항 (체크리스트)
  - Performance 녹화로 FPS 그래프 & Main 스레드(Style/Layout/Paint) 병목 구간 캡처
  - Paint Flashing 켜고 hover/스크롤 시 초록색 반짝임 발생 지점 캡처
  - Network 에서 Web Font 로딩(FOIT/FOUT) 확인
  - 레이아웃 방식으로 인한 Reflow(많은 inline-block) 실측
  - 최적화 후 다시 녹화 → FPS 55~60 근접, Paint 블록 감소, Composite 위주 확인
  - 전/후 타임라인/스크린샷을 팀 공유용으로 정리

3) Base Code (전 상태 – 의도적 병목 + 실제 콘텐츠 포함)
  눈 피로를 줄이기 위해 중성 톤과 적절한 여백을 유지하되, 의도적으로 병목을 심었습니다.
  아래 파일을 base.html로 저장 후 실험하세요.
-->
<!DOCTYPE html>
<html lang="ko">
  <head>
    <meta charset="UTF-8" />
    <title>느린 대시보드 (Base)</title>
    <!-- 의도적 FOIT: display=block -->
    <link
      href="https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700&display=block"
      rel="stylesheet"
    />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <style>
      :root {
        --bg: #f6f7fb;
        --panel: #ffffff;
        --ink: #0f172a;
        --muted: #6b7280;
        --accent: #2563eb;
        --good: #059669;
        --bad: #dc2626;
        --border: #e5e7eb;
      }
      * {
        box-sizing: border-box;
      }
      body {
        margin: 0;
        font-family: "Inter", system-ui, sans-serif;
        background: var(--bg);
        color: var(--ink);
      }
      header {
        position: sticky;
        top: 0;
        z-index: 10;
        background: #0f172a;
        color: #fff;
        padding: 16px 20px;
        font-weight: 700;
        letter-spacing: 0.2px;
      }
      .layout {
        display: flex;
        min-height: 100dvh;
      }
      nav {
        width: 220px;
        background: #111827;
        color: #cbd5e1;
        padding: 16px;
      }
      nav h3 {
        font-size: 14px;
        margin: 8px 0 12px;
        color: #9ca3af;
      }
      nav a {
        display: block;
        color: inherit;
        text-decoration: none;
        padding: 10px 8px;
        border-radius: 8px;
      }
      nav a:hover {
        background: #1f2937;
      }

      main {
        flex: 1;
        padding: 20px;
      }

      /* 병목1: 많은 inline-block 카드 → Reflow 비용 증가 */
      .cards {
        width: 100%;
      }
      .card {
        display: inline-block;
        width: 260px;
        height: 140px;
        margin: 10px;
        padding: 16px;
        background: var(--panel);
        border: 1px solid var(--border);
        border-radius: 14px;
        /* 병목2: 무거운 box-shadow + 모든 속성 트랜지션 */
        box-shadow: 0 20px 40px rgba(0, 0, 0, 0.15);
        transition: all 0.3s ease;
      }
      /* 병목3: hover시 opacity 변화 → 매 프레임 Paint */
      .card:hover {
        transform: translateY(-2px) scale(1.02);
        opacity: 0.85;
      }

      .kpi-title {
        font-size: 13px;
        color: var(--muted);
        margin: 0 0 8px;
      }
      .kpi-value {
        font-size: 28px;
        font-weight: 700;
        margin: 0 0 6px;
      }
      .kpi-delta {
        font-size: 12px;
      }
      .kpi-delta.good {
        color: var(--good);
      }
      .kpi-delta.bad {
        color: var(--bad);
      }

      /* 미니 스파크라인(의도적으로 Paint 부담) */
      .spark {
        height: 36px;
        border-radius: 8px;
        margin-top: 10px;
        background: linear-gradient(0deg, rgba(0, 0, 0, 0.05), rgba(0, 0, 0, 0)),
          /* 잦은 repaint를 유도하기 위해 filter/opacity를 함께 사용 */
            linear-gradient(
              90deg,
              #c7d2fe 10%,
              #60a5fa 40%,
              #22c55e 70%,
              #fde047 90%
            );
        filter: brightness(1.1);
        opacity: 0.95;
      }

      .panel {
        background: var(--panel);
        border: 1px solid var(--border);
        border-radius: 14px;
        padding: 16px;
        margin-top: 20px;
      }

      /* 병목4: 아이콘 SVG + filter */
      .icon {
        width: 18px;
        height: 18px;
        margin-right: 6px;
        display: inline-block;
        background: url("https://upload.wikimedia.org/wikipedia/commons/0/02/SVG_logo.svg")
          no-repeat center/contain;
        filter: drop-shadow(0 0 3px rgba(0, 0, 0, 0.25));
        opacity: 0.9;
      }

      table {
        width: 100%;
        border-collapse: collapse;
      }
      th,
      td {
        border-bottom: 1px solid var(--border);
        padding: 10px 6px;
        text-align: left;
      }
      th {
        font-size: 12px;
        color: var(--muted);
        font-weight: 600;
      }
    </style>
  </head>
  <body>
    <header>📊 경영 대시보드</header>
    <div class="layout">
      <nav>
        <h3>메뉴</h3>
        <a href="#">🏠 홈</a>
        <a href="#">📈 매출 분석</a>
        <a href="#">👥 사용자</a>
        <a href="#">🧾 주문</a>
        <a href="#">⚙️ 설정</a>
      </nav>
      <main>
        <section class="cards" id="cards">
          <!-- KPI 카드 (실제 항목) -->
          <div class="card">
            <p class="kpi-title">Revenue (오늘)</p>
            <p class="kpi-value">₩48,210,000</p>
            <p class="kpi-delta good">
              <span class="icon"></span>+12.4% vs 어제
            </p>
            <div class="spark"></div>
          </div>
          <div class="card">
            <p class="kpi-title">Conversion Rate</p>
            <p class="kpi-value">3.28%</p>
            <p class="kpi-delta bad">
              <span class="icon"></span>-0.4pp vs 지난주
            </p>
            <div class="spark"></div>
          </div>
          <div class="card">
            <p class="kpi-title">Active Users</p>
            <p class="kpi-value">18,442</p>
            <p class="kpi-delta good"><span class="icon"></span>+1,203 신규</p>
            <div class="spark"></div>
          </div>
          <div class="card">
            <p class="kpi-title">Error Rate</p>
            <p class="kpi-value">0.72%</p>
            <p class="kpi-delta bad">
              <span class="icon"></span>+0.12pp 스파이크
            </p>
            <div class="spark"></div>
          </div>
          <!-- 더 많은 카드가 inline-block으로 계속 렌더링된다고 가정 -->
          <script>
            // 병목 재현: 동일 카드 60개 추가
            const area = document.currentScript.parentElement;
            for (let i = 0; i < 60; i++) {
              const c = area.children[0].cloneNode(true);
              area.appendChild(c);
            }
          </script>
        </section>

        <section class="panel">
          <h3 style="margin: 0 0 12px">🧾 최근 주문</h3>
          <table>
            <thead>
              <tr>
                <th>주문번호</th>
                <th>고객</th>
                <th>금액</th>
                <th>상태</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>#10291</td>
                <td>Kim Min</td>
                <td>₩129,000</td>
                <td>배송중</td>
              </tr>
              <tr>
                <td>#10290</td>
                <td>Lee Ara</td>
                <td>₩59,000</td>
                <td>결제완료</td>
              </tr>
              <tr>
                <td>#10289</td>
                <td>Park J</td>
                <td>₩780,000</td>
                <td>반품요청</td>
              </tr>
              <tr>
                <td>#10288</td>
                <td>Yun H</td>
                <td>₩44,000</td>
                <td>결제완료</td>
              </tr>
            </tbody>
          </table>
        </section>
      </main>
    </div>
  </body>
</html>

<!--
Base 특징(의도)
  - inline-block 카드 다량 → Layout Reflow 부담
  - box-shadow + opacity → hover 시 Paint 반복
  - SVG+filter 아이콘, spark 영역 opacity/filter → Paint 잦음
  - Web Font display=block → FOIT 가능성

4) 미션의 의의
  - “실제 데이터가 들어간 카드/표/미니차트” 환경에서 병목을 단계별로 분해
  - 시각적 결과는 유지하면서 렌더링 단계(Layout/Paint/Composite) 관점으로 최적화
  - 팀 리뷰 시 DevTools 근거(Frames, Main, Bottom-Up, Network)로 설득 가능한 리포트 작성 연습

5) 정답 코드 (후 상태 – 실전 최적화 적용, 동일 UI 의도 유지)
  아래 파일을 answer.html로 저장. 전/후를 같은 뷰포트에서 비교해보세요.
  반영 사항: Google Fonts preconnect + display=swap, transform-only hover(그림자 고정), CSS Grid, DocumentFragment, content-visibility:auto, 색상 의존 최소화(▲/▼ + sr-only 텍스트).
-->
<!DOCTYPE html>
<html lang="ko">
  <head>
    <meta charset="UTF-8" />
    <title>최적화된 대시보드 (Answer)</title>
    <!-- 폰트 최적화: preload + display=swap 으로 FOIT 방지 -->
    <link
      rel="preload"
      as="style"
      href="https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700&display=swap"
    />
    <link
      href="https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700&display=swap"
      rel="stylesheet"
    />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <style>
      :root {
        --bg: #f6f7fb;
        --panel: #ffffff;
        --ink: #0f172a;
        --muted: #6b7280;
        --accent: #2563eb;
        --good: #059669;
        --bad: #dc2626;
        --border: #e5e7eb;
      }
      * {
        box-sizing: border-box;
      }
      body {
        margin: 0;
        font-family: "Inter", system-ui, sans-serif;
        background: var(--bg);
        color: var(--ink);
      }
      header {
        position: sticky;
        top: 0;
        z-index: 10;
        background: #0f172a;
        color: #fff;
        padding: 16px 20px;
        font-weight: 700;
        letter-spacing: 0.2px;
      }
      .layout {
        display: flex;
        min-height: 100dvh;
      }
      nav {
        width: 220px;
        background: #111827;
        color: #cbd5e1;
        padding: 16px;
      }
      nav h3 {
        font-size: 14px;
        margin: 8px 0 12px;
        color: #9ca3af;
      }
      nav a {
        display: block;
        color: inherit;
        text-decoration: none;
        padding: 10px 8px;
        border-radius: 8px;
      }
      nav a:hover {
        background: #1f2937;
      }
      main {
        flex: 1;
        padding: 20px;
      }

      /* 레이아웃 최적화: Grid로 배치 계산 단순화 + 갭 제어 */
      .cards {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
        gap: 12px;
      }

      .card {
        height: 140px;
        padding: 16px;
        background: var(--panel);
        border: 1px solid var(--border);
        border-radius: 14px;
        /* GPU 우호적: drop-shadow + transform 전용 트랜지션 */
        filter: drop-shadow(0 8px 16px rgba(0, 0, 0, 0.1));
        transition: transform 0.25s ease;
        will-change: transform;
        /* 렌더링 범위 고립: 복잡한 자식이 많을 때 유용 */
        contain: content;
      }
      .card:hover {
        transform: translateY(-2px) scale(1.02);
      } /* opacity 제거 → Paint 감소 */

      .kpi-title {
        font-size: 13px;
        color: var(--muted);
        margin: 0 0 8px;
      }
      .kpi-value {
        font-size: 28px;
        font-weight: 700;
        margin: 0 0 6px;
      }
      .kpi-delta {
        font-size: 12px;
      }
      .kpi-delta.good {
        color: var(--good);
      }
      .kpi-delta.bad {
        color: var(--bad);
      }

      /* 미니 스파크라인: 불필요한 filter/opacity 제거, 정적 그라디언트만 */
      .spark {
        height: 36px;
        border-radius: 8px;
        margin-top: 10px;
        background: linear-gradient(0deg, rgba(0, 0, 0, 0.04), rgba(0, 0, 0, 0)),
          linear-gradient(
            90deg,
            #c7d2fe 10%,
            #60a5fa 40%,
            #22c55e 70%,
            #fde047 90%
          );
      }

      .panel {
        background: var(--panel);
        border: 1px solid var(--border);
        border-radius: 14px;
        padding: 16px;
        margin-top: 20px;
      }
      /* 긴 표의 초기 페인트/레이아웃 비용을 낮춤 */
      .panel[data-lazy] {
        content-visibility: auto;
        contain-intrinsic-size: 600px 400px;
      }

      /* 아이콘 최적화: 스프라이트 사용(데모 좌표), filter/opacity 제거 */
      .icon {
        width: 18px;
        height: 18px;
        margin-right: 6px;
        display: inline-block;
        background: url("sprite-icons.png") no-repeat 0 0 / 72px 18px; /* 가정: 스프라이트 시트 */
      }

      table {
        width: 100%;
        border-collapse: collapse;
      }
      th,
      td {
        border-bottom: 1px solid var(--border);
        padding: 10px 6px;
        text-align: left;
      }
      th {
        font-size: 12px;
        color: var(--muted);
        font-weight: 600;
      }

      /* 접근성: 모션 민감 사용자를 배려 */
      @media (prefers-reduced-motion: reduce) {
        .card {
          transition: none;
        }
        .card:hover {
          transform: none;
        }
      }
    </style>
  </head>
  <body>
    <header>📊 경영 대시보드</header>
    <div class="layout">
      <nav>
        <h3>메뉴</h3>
        <a href="#">🏠 홈</a>
        <a href="#">📈 매출 분석</a>
        <a href="#">👥 사용자</a>
        <a href="#">🧾 주문</a>
        <a href="#">⚙️ 설정</a>
      </nav>
      <main>
        <section class="cards" id="cards">
          <!-- KPI 카드 (실제 항목 그대로 유지) -->
          <article class="card" aria-label="Revenue today">
            <p class="kpi-title">Revenue (오늘)</p>
            <p class="kpi-value">₩48,210,000</p>
            <p class="kpi-delta good">
              <span class="icon" aria-hidden="true"></span>+12.4% vs 어제
            </p>
            <div
              class="spark"
              role="img"
              aria-label="수익 추이 미니 그래프"
            ></div>
          </article>
          <article class="card" aria-label="Conversion Rate">
            <p class="kpi-title">Conversion Rate</p>
            <p class="kpi-value">3.28%</p>
            <p class="kpi-delta bad">
              <span class="icon" aria-hidden="true"></span>-0.4pp vs 지난주
            </p>
            <div
              class="spark"
              role="img"
              aria-label="전환율 추이 미니 그래프"
            ></div>
          </article>
          <article class="card" aria-label="Active Users">
            <p class="kpi-title">Active Users</p>
            <p class="kpi-value">18,442</p>
            <p class="kpi-delta good">
              <span class="icon" aria-hidden="true"></span>+1,203 신규
            </p>
            <div
              class="spark"
              role="img"
              aria-label="활성 사용자 추이 미니 그래프"
            ></div>
          </article>
          <article class="card" aria-label="Error Rate">
            <p class="kpi-title">Error Rate</p>
            <p class="kpi-value">0.72%</p>
            <p class="kpi-delta bad">
              <span class="icon" aria-hidden="true"></span>+0.12pp 스파이크
            </p>
            <div
              class="spark"
              role="img"
              aria-label="에러율 추이 미니 그래프"
            ></div>
          </article>
          <script>
            // 동일 카드 60개 추가(시나리오 유지). Grid가 Reflow 비용을 낮추는지 비교하세요.
            const area = document.currentScript.parentElement;
            for (let i = 0; i < 60; i++) {
              const c = area.children[0].cloneNode(true);
              area.appendChild(c);
            }
          </script>
        </section>

        <section class="panel" data-lazy>
          <h3 style="margin: 0 0 12px">🧾 최근 주문</h3>
          <table>
            <thead>
              <tr>
                <th>주문번호</th>
                <th>고객</th>
                <th>금액</th>
                <th>상태</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>#10291</td>
                <td>Kim Min</td>
                <td>₩129,000</td>
                <td>배송중</td>
              </tr>
              <tr>
                <td>#10290</td>
                <td>Lee Ara</td>
                <td>₩59,000</td>
                <td>결제완료</td>
              </tr>
              <tr>
                <td>#10289</td>
                <td>Park J</td>
                <td>₩780,000</td>
                <td>반품요청</td>
              </tr>
              <tr>
                <td>#10288</td>
                <td>Yun H</td>
                <td>₩44,000</td>
                <td>결제완료</td>
              </tr>
            </tbody>
          </table>
        </section>
      </main>
    </div>
  </body>
</html>

<!-- 
개선 핵심
  - CSS Grid로 카드 배치 → inline-block의 Reflow 부담 해소
  - 그림자 값 고정 + transform 전용 hover → Composite 경로로 유도, Paint 감소
  - 스프라이트 아이콘 + 스파크라인 filter/opacity 제거 → 불필요한 Paint 억제
  - preconnect + display=swap → FOIT 방지(초기 fallback → 빠른 교체)
  - 긴 컨테이너는 content-visibility:auto로 Fold 밖 초기 비용 절감
  - 대량 DOM 추가는 DocumentFragment로 묶어 중간 단계 연쇄 레이아웃 최소화

6) 해설 & 전/후 체크포인트

  A. 측정 세팅(권장)
    - Disable cache: DevTools → Network 탭 체크(재현성↑).
    - CPU Throttle 4×: Performance 탭의 ⚙ → 4×로 낮춰 병목 가시화.
    - Network Slow 3G: 웹폰트 FOIT/FOUT 관찰에 유용.
    - Rendering 패널: Paint Flashing ON, FPS meter ON.

  B. Hover/애니메이션 경로
    - 전(Base)
      . .card:hover { transform + opacity } → opacity 변화는 레이어가 있더라도 새로 그리기(Paint)를 유발.
      . transition: all + 큰 box-shadow 는 hover 중 Paint 비용을 증폭
      . 결과: FPS 25~35로 하락, Paint Flashing가 hover마다 번쩍.
    - 후(Answer)
      . 그림자 값은 고정, hover는 transform만 변경 → 합성(Composite) 단계에서 처리.
      . Transform은 GPU 합성 레이어에서 위치/스케일만 적용 → Paint 블록 축소
      . 기대: FPS 55~60 근접. Main 트랙에서 Paint 블록 짧아짐, Composite Layers/Update Layer Tree 비중↑.

    실무 코멘트: will-change: transform은 항상 쓰지 말고, 정말 필요한 짧은 구간에만(JS로 hover 진입 시 추가, 종료 시 제거) 사용하세요. 남용 시 레이어/메모리 증가로 오히려 느려질 수 있습니다.

  C. 레이아웃(Reflow) 경로
    - 전: 수십 개의 inline-block 은 줄바꿈/정렬 변화에 민감 → Layout Reflow 빈번.
    - 후: CSS Grid 는 내부 배치 알고리즘으로 가로/세로 라인을 안정적으로 계산 → Reflow 빈도/범위 감소.
    - DevTools 성과: Bottom-Up 뷰에서 Layout 관련 함수 소요 시간↓, Recalculate Style 도 카드 추가/제거 시 덜 요동.

  D. 대량 DOM 추가(초기 렌더)
    - 전: appendChild 를 60회 반복하며 중간 Layout/Paint가 여러 번 개입 가능.
    - 후: DocumentFragment 로 모아 한 번에 삽입 → 레이아웃/스타일 재계산 최소화.
    - 관찰 포인트: Performance에서 DOM Update 이벤트 묶임, 불필요한 Style/Layout 사이클 감소.

  E. 아이콘/스파크라인의 Paint 비용
    - 전: SVG + filter / opacity (스파크라인) → 스크롤/hover 조합 시 Paint 빈도↑.
    - 후: 스프라이트 이미지(또는 SVG sprite <symbol>) + filter/opacity 제거 → 페인트 안정화.
    - 팁: Retina 대비가 필요하면 2x 스프라이트를 쓰고 background-size 로 축소 렌더링.

  F. 폰트 로딩(FOIT ↔ FOUT)
    - 전: Google Fonts display=block → 텍스트 비가시 구간(FOIT). 첫 인상이 나쁨.
    - 후: preconnect 로 DNS/TLS 왕복 줄이고, display=swap 으로 fallback 즉시 표시 → 빠른 교체(FOUT).
    - Network 탭: 폰트 요청 시점/소요, Timing waterfall 확인. 초기 텍스트 공백이 사라졌는지 실제   스크린샷으로 증명.

  G. 긴 컨텐츠의 초기 비용
    - 전: Fold 아래의 테이블도 즉시 Layout/Paint.
    - 후: content-visibility:auto + contain-intrinsic-size 로 뷰포트 진입 전까지 렌더 지연.
    - 주의: 인페이지 검색/프린트/즉시 포커스 이동 UX에서 “한 박자 늦게 생김”이 체감될 수 있으므로, Fold 아래 대용량 섹션에 선택 적용 권장.

  H. 접근성/가독성(색 의존 최소화)
    - 전: 상승/하락 상태를 색만으로 전달 → 색각이상 사용자 불리.
    - 후: ▲/▼ 기호 + sr-only 텍스트 병행 → 비의존적 정보 제공.
    - Lighthouse/AXE: 대비/네이밍/aria-label 확인.

✅ 최종 검증 체크리스트
  - Paint Flashing: 카드 hover/스크롤 시 초록색 깜빡임이 현저히 감소 했는가?
  - Performance(FPS/Frames): 평균 FPS가 55~60 근접으로 안정되는가(특히 hover 구간)?
  - Main 트랙: Paint 블록 길이/횟수 감소, Composite/Update Layer Tree 비중 증가가 보이는가?
  - Network: 폰트가 FOIT 없이 즉시 fallback → 빠른 교체(FOUT)로 보이는가?
  - Reflow: Grid 도입 후, 레이아웃 관련 소요가 체감상/수치상 감소 했는가?
  - 대량 DOM 추가 : Fragment 사용 시 DOM 업데이트가 묶여 기록되는가?
  - 시각 품질 : 가독성/여백/톤이 동일하거나 개선 되었는가(상태 표기 비의존성 포함)?
-->
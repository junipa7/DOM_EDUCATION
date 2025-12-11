<!--
Mission #6: “장바구니 & 결제 페이지 성능 최적화”

1. 미션 설명
  오픈 첫 주, MyShop의 장바구니 트래픽이 폭증합니다. 결제 전환율이 치솟아야 할 타이밍에 CS 채널엔 이런 메시지가 쌓입니다.
  - “상품이 많으면 스크롤이 너무 버벅여요.”
  - “장바구니에서 수량을 바꿀 때 화면이 전체적으로 깜빡여요.”
  - “할인 코드 적용 버튼을 눌렀더니 몇 초간 멈춘 줄 알았어요.”
  - “결제 버튼 반응이 느려서 두세 번 눌렀다는 사람도 있어요.”
  운영팀의 요청은 단호합니다.

  “지금 이 페이지가 이대로면 전환율이 떨어집니다. 당장 DevTools로 병목을 찾고, UI 반응성을 올려주세요.”

  당신은 Performance / Network / Elements 패널을 열고 원인을 추적합니다. 핵심은 세 가지입니다.
  1. 이미지 때문에 네트워크와 레이아웃이 흔들린다.
  2. 동기 처리(할인, 결제) 때문에 버튼 클릭 시 UI가 멈춘다.
  3. 수량 변경이 전체 리렌더·페인트를 유발해 깜빡임이 커진다.
  
  이 미션의 목표는 “보여지는 UI”만 예쁘게 만드는 게 아니라, 성능과 피드백까지 현업 품질로 끌어올리는 것입니다.

2. 요구사항
  진단
  - Network: 썸네일이 초기에 모두 다운로드되는지 확인
  - Elements: 이미지에 width/height 미지정 → CLS 발생지점 확인
  - Paint Flashing: 수량 변경 시 리스트 전체가 다시 칠해지는지 확인
  - Performance: 할인 코드/결제 클릭시 Main 스레드 Long task 캡처

  개선
  - 썸네일: loading="lazy", decoding="async" + 크기 명시 → 네트워크 절약 & CLS 방지
  - 수량 변경: 부분 업데이트(입력 필드만), 불필요한 전체 리렌더/스타일 변경 제거
  - 할인 코드/결제: UI 즉시 피드백(텍스트·disabled) → 비동기 처리로 반응성 확보
  - 전/후 타임라인·워터폴·Elements 비교 캡처

  ※ 피드백 반영 포인트: 입력 이벤트 과발화 방지(디바운스/검증), a11y 상태 일관화, 이미지 캐시/srcset/sizes/fetchpriority 현실 적용, CLS 추가 방어(aspect-ratio / content-visibility), 합성 비용 관리.

3. Base Code (전 상태 – 의도적 충돌/저대비)
-->

<!DOCTYPE html>
<html lang="ko">
  <head>
    <meta charset="UTF-8" />
    <title>장바구니 (느린 버전)</title>
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <style>
      body {
        font-family: sans-serif;
        margin: 0;
        background: #f9fafb;
        color: #111;
      }
      header {
        padding: 16px;
        background: #fff;
        border-bottom: 1px solid #ddd;
      }
      main {
        max-width: 960px;
        margin: 0 auto;
        padding: 20px;
      }
      .cart-item {
        display: flex;
        align-items: center;
        gap: 12px;
        padding: 12px;
        background: #fff;
        border: 1px solid #ddd;
        margin-bottom: 12px;
        border-radius: 8px;
      }
      .cart-item img {
        max-width: 100%;
      } /* 크기 없음 → CLS */
      .cart-item .info {
        flex: 1;
      }
      .actions {
        margin-top: 16px;
        display: flex;
        gap: 8px;
      }
      .btn {
        padding: 10px 14px;
        border: 0;
        border-radius: 6px;
        cursor: pointer;
      }
      .btn.primary {
        background: #2563eb;
        color: #fff;
      }
      .btn.outline {
        background: #fff;
        border: 1px solid #ccc;
      }
    </style>
  </head>
  <body>
    <header>🛒 장바구니</header>
    <main>
      <div id="cart"></div>
      <div class="actions">
        <input type="text" id="coupon" placeholder="할인 코드 입력" />
        <button class="btn outline" id="btn-coupon">할인 코드 적용</button>
        <button class="btn primary" id="btn-pay">결제하기</button>
      </div>
    </main>

    <script>
      const cart = document.getElementById("cart");
      // 50개 상품 → 이미지 모두 즉시 다운로드
      for (let i = 1; i <= 50; i++) {
        const div = document.createElement("div");
        div.className = "cart-item";
        div.innerHTML = `
        <img src="https://picsum.photos/200/150?random=${i}" alt="상품${i}">
        <div class="info">
          <h4>상품 ${i}</h4>
          <p>₩${(i * 1000).toLocaleString()}</p>
          <label>수량: <input type="number" value="1" min="1"></label>
        </div>`;
        cart.appendChild(div);
      }

      // 문제1: 할인 코드 동기 처리 → UI 멈춤
      document.getElementById("btn-coupon").addEventListener("click", () => {
        const start = performance.now();
        while (performance.now() - start < 500) {} // 500ms 멈춤
        alert("할인 코드가 적용되었습니다.");
      });

      // 문제2: 결제 버튼도 동기 블로킹
      document.getElementById("btn-pay").addEventListener("click", () => {
        const start = performance.now();
        while (performance.now() - start < 800) {} // 800ms 멈춤
        alert("결제가 완료되었습니다!");
      });
    </script>
  </body>
</html>

<!--
Base 문제 요약 — 디테일 확장

1) 이미지/네트워크
  - 증상: 장바구니에 50개 항목을 한 번에 생성하면서, 각 항목 썸네일을 즉시 요청 → 초기 네트워크 폭주(워터폴 상단이 이미지로 가득 참).
  - 원인: loading="lazy" 미적용 + ?random=${i} 쿼리로 캐시 무력화. 반복 방문 시에도 캐시 히트율 저조.
  - 영향: 첫 화면에 필요 없는 이미지도 병렬 요청에 섞여 핵심 리소스(LCP 후보/자바스크립트) 다운로드가 경합. 초기 렌더 지연.

2) 레이아웃/CLS(Layout Shift)
  - 증상: 스크롤/이미지 로딩 타이밍에 리스트가 살짝 “덜컥” 흔들림.
  - 원인: <img> 에 width/height 미지정 → 브라우저가 초기 레이아웃 공간을 가늠할 근거가 없음. 이미지가 뒤늦게 로드되며 DOM 박스(특히 텍스트·버튼)가 아래로 밀림.
  - 영향: CLS 지표 증가(Performance → Experience → Layout shift regions에 하이라이트 표시). 실제 구매 흐름에서 사용자 신뢰·집중력 저하.

3) 인터랙션/Long Task/INP
  - 증상: “할인 코드 적용”/“결제하기” 클릭 직후 버튼이 멈춘 것처럼 보임.
  - 원인: 클릭 핸들러에서 while(performance.now() - start < N){}로 의도적 동기 블로킹. 메인 스레드가 바쁜 동안 페인트·입력 처리·레이아웃 모두 정지.
  - 영향: Long task(>50ms)가 생기고, INP(Interaction to Next Paint) 악화 — 사용자는 “눌림이 안 먹힌다”라고 인지.

4) 페인트/리렌더 범위
  - 증상: 수량 변경 시 리스트가 광범위하게 반짝임(Paint Flashing).
  - 원인: 입력 이벤트 마다 전체 합계·여러 DOM 업데이트가 연쇄 발생. 입력 도중 수 회 발생하면 페인트 빈도 상승.
  - 영향: 특정 기기/저사양 환경에서 프레임 드랍 체감.

5) 종합 리스크
  - 고객 경험: 멈춤/깜빡임/점프 → 불신(결제 이탈 유도).
  - 사업 지표: 전환율·체류시간·반품율에 직접 악영향.
  - 운영 비용: CS 증가, 릴리즈 주기 지연(핫픽스 반복).

6) 재현·측정 가이드(DevTools)
  - Network: 문서 로드 후 이미지 요청 동시성/총량 확인. 캐시 히트 여부도 체크.
  - Performance: 할인/결제 클릭 → Long task 존재 여부, Interaction 이벤트 후 첫 페인트까지 지연(INP) 확인.
  - Rendering: Paint flashing 활성화 → 수량 입력 시 반짝이는 영역 폭 비교.
  - Experience: Layout Shift Regions → CLS 유발 요소 지점 표시 확인.

미션의 의의
1) 실무 가치(비즈니스·UX)
  - 초심자 오해를 바로잡음: “UI를 예쁘게”보다 “사용자가 체감하는 반응성”이 매출에 직결.
  - ‘빠르게 보이게’ 설계: 실제 작업(가격 계산, 서버 검증)은 뒤로 미루되, 즉시 피드백(텍스트/disabled/토스트)로 누름-반응의 심리적 갭을 제거.
  - LCP/CLS/INP 3대 축을 실제 사례로 개선 — 핵심 KPI(전환율, 이탈률)를 움직이는 체감 개선.

2) 기술 역량(반복 가능한 패턴)
  - 이미지 전략 표준화: loading="lazy", decoding="async", 크기 예약(width/height, aspect-ratio), srcset/sizes, 캐시 정책.
  - 입력 이벤트 제어: 디바운스/스로틀/검증으로 계산·페인트 빈도 관리.
  - 합성/페인트 비용 제어: transform-only hover, content-visibility로 오프스크린 비용 절감.
  - 접근성·상태 일관성: disabled/aria-disabled/aria-live/aria-busy — 보조기기·키보드 사용자도 놓치지 않는 설계.

정답 코드
-->
<!DOCTYPE html>
<html lang="ko">
  <head>
    <meta charset="UTF-8" />
    <title>장바구니 (최적화된 UI)</title>
    <meta name="viewport" content="width=device-width, initial-scale=1" />

    <style>
      /* ========== Base & Motion Preferences ========== */
      * {
        box-sizing: border-box;
      }
      body {
        font-family: "Segoe UI", Roboto, system-ui, -apple-system, sans-serif;
        margin: 0;
        background: #f3f4f6;
        color: #111827;
      }
      /* 사용자 모션 감소 설정 존중: 애니메이션 최소화 */
      @media (prefers-reduced-motion: reduce) {
        .card:hover {
          transform: none;
        }
        .btn {
          transition: none;
        }
      }

      /* ========== Header ========== */
      header {
        background: linear-gradient(90deg, #2563eb, #1d4ed8);
        color: #fff;
        padding: 16px 24px;
        display: flex;
        align-items: center;
        justify-content: space-between;
        position: sticky;
        top: 0;
        z-index: 10;
      }
      .logo {
        display: flex;
        align-items: center;
        gap: 10px;
        font-weight: 700;
        font-size: 20px;
      }

      /* ========== Layout: 2-Column with Sticky Aside ========== */
      main {
        max-width: 1120px;
        margin: 24px auto;
        padding: 0 16px;
        display: grid;
        grid-template-columns: 2fr 1fr;
        gap: 24px;
      }

      /* ========== Cart List Card ========== */
      .card {
        display: flex;
        gap: 16px;
        align-items: center;
        background: #fff;
        border: 1px solid #e5e7eb;
        border-radius: 12px;
        padding: 16px;
        box-shadow: 0 2px 6px rgba(0, 0, 0, 0.04);
        /* transform만 사용 → 페인트보다 저렴(가능하면 합성 단계 처리) */
        transition: transform 0.15s ease;
      }
      .card:hover {
        transform: translateY(-2px);
      }
      .thumb {
        /* 크기 예약 + cover → CLS 방지 */
        width: 120px;
        height: 90px;
        aspect-ratio: 4/3;
        border-radius: 8px;
        object-fit: cover;
        flex: 0 0 auto;
      }
      .info {
        flex: 1;
        min-width: 0;
      }
      .info h4 {
        margin: 0 0 6px;
        font-size: 16px;
      }
      .info p {
        margin: 0 0 8px;
        color: #374151;
        font-weight: 600;
      }
      .qty {
        font-size: 14px;
        color: #4b5563;
      }
      .qty input {
        width: 64px;
        padding: 6px 8px;
        margin-left: 6px;
        border: 1px solid #d1d5db;
        border-radius: 8px;
        font-size: 14px;
      }

      /* ========== Aside (Order Summary) ========== */
      aside {
        background: #fff;
        border: 1px solid #e5e7eb;
        border-radius: 12px;
        padding: 20px;
        box-shadow: 0 2px 6px rgba(0, 0, 0, 0.04);
        height: fit-content;
        position: sticky;
        top: 84px;
        display: flex;
        flex-direction: column;
        gap: 16px;
      }
      aside h3 {
        margin: 0;
        font-size: 18px;
        font-weight: 700;
      }
      .summary {
        border-top: 1px solid #e5e7eb;
        padding-top: 12px;
      }
      .row {
        display: flex;
        justify-content: space-between;
        margin: 8px 0;
        color: #374151;
      }
      .row strong {
        color: #111827;
      }
      .actions {
        display: flex;
        gap: 8px;
      }
      .actions input[type="text"] {
        flex: 1;
        padding: 10px 12px;
        border: 1px solid #d1d5db;
        border-radius: 8px;
        font-size: 14px;
      }

      /* ========== Buttons ========== */
      .btn {
        padding: 10px 14px;
        border: 0;
        border-radius: 10px;
        cursor: pointer;
        font-weight: 600;
        font-size: 15px;
        transition: transform 0.06s ease, background 0.2s ease,
          box-shadow 0.2s ease;
      }
      .btn:active {
        transform: translateY(1px);
      }
      .btn.primary {
        background: #2563eb;
        color: #fff;
      }
      .btn.primary:hover {
        background: #1d4ed8;
      }
      .btn.outline {
        background: #fff;
        color: #111827;
        border: 1px solid #d1d5db;
      }
      .btn.outline:hover {
        background: #f3f4f6;
      }
      .btn.loading {
        opacity: 0.6;
        pointer-events: none;
      } /* 시각적/마우스 차단 */

      /* ========== Misc ========== */
      #cart-list {
        display: flex;
        flex-direction: column;
        gap: 16px;
      }
      .badge {
        display: inline-block;
        padding: 2px 8px;
        background: #eff6ff;
        color: #1d4ed8;
        border-radius: 999px;
        font-size: 12px;
        margin-left: 8px;
      }

      /* 모바일: 1열 전환, sticky 해제 */
      @media (max-width: 900px) {
        main {
          grid-template-columns: 1fr;
        }
        aside {
          position: static;
          top: auto;
        }
      }

      /* 접근성: 스크린리더 전용 영역 */
      .sr-only {
        position: absolute;
        width: 1px;
        height: 1px;
        padding: 0;
        margin: -1px;
        overflow: hidden;
        clip: rect(0, 0, 0, 0);
        white-space: nowrap;
        border: 0;
      }

      /* (옵션) 오프스크린 비용 절감: 초기 레이아웃 예측치 제공 */
      @supports (content-visibility: auto) {
        .card {
          content-visibility: auto;
          contain-intrinsic-size: 150px 360px;
        }
      }
    </style>
  </head>
  <body>
    <header>
      <div class="logo">🛒 MyShop <span class="badge">Cart</span></div>
      <nav class="nav">고객센터 | 로그인</nav>
    </header>

    <main>
      <!-- 왼쪽: 장바구니 리스트 -->
      <section id="cart-list" aria-label="장바구니 항목 목록"></section>

      <!-- 오른쪽: 주문 요약 -->
      <aside aria-labelledby="order-summary-title" aria-busy="false">
        <h3 id="order-summary-title">주문 요약</h3>

        <!-- 가격 정보는 라이브 영역으로 즉시 읽어주기 -->
        <div class="summary" aria-live="polite">
          <div class="row">
            <span>상품 합계</span><span id="subtotal">₩0</span>
          </div>
          <div class="row">
            <span>할인</span><span id="discount">- ₩0</span>
          </div>
          <div class="row">
            <strong>총 결제 금액</strong><strong id="total">₩0</strong>
          </div>
        </div>

        <div class="actions">
          <input
            type="text"
            id="coupon"
            placeholder="할인 코드 입력 (예: SAVE10)"
            aria-label="할인 코드 입력"
          />
          <button
            class="btn outline"
            id="btn-coupon"
            aria-label="할인 코드 적용"
            aria-disabled="false"
          >
            적용
          </button>
        </div>
        <button
          class="btn primary"
          id="btn-pay"
          aria-label="결제하기"
          aria-disabled="false"
        >
          결제하기
        </button>

        <!-- 비차단 상태 알림 -->
        <div id="toast" class="sr-only" aria-live="polite"></div>
      </aside>
    </main>

    <script>
      /* ================= Utilities ================= */
      const fmt = new Intl.NumberFormat("ko-KR", {
        style: "currency",
        currency: "KRW",
        maximumFractionDigits: 0,
      });
      const $ = (s) => document.querySelector(s);
      const $$ = (s) => document.querySelectorAll(s);

      // 입력 과발화 방지: 입력이 멈춘 뒤 Nms 후 실행
      const debounce = (fn, d = 120) => {
        let t;
        return (...args) => {
          clearTimeout(t);
          t = setTimeout(() => fn(...args), d);
        };
      };

      // 안전한 정수 변환 + 범위 보정(최소 1, 최대 99)
      const safeInt = (v, { min = 1, max = 99 } = {}) => {
        let n = parseInt(v, 10);
        if (Number.isNaN(n)) n = min;
        return Math.max(min, Math.min(max, n));
      };

      // 비차단 토스트: alert 대체. SR에 즉시 읽힘.
      function toast(msg) {
        const t = $("#toast");
        t.classList.remove("sr-only");
        t.textContent = msg;
        setTimeout(() => {
          t.classList.add("sr-only");
          t.textContent = "";
        }, 1500);
      }

      // 공통 로딩 상태 토글: 시각·키보드·SR 모두 반영
      function setLoading(button, text) {
        button.classList.add("loading");
        button.disabled = true;
        button.setAttribute("aria-disabled", "true");
        const prev = button.textContent;
        button.textContent = text;
        return () => {
          button.classList.remove("loading");
          button.disabled = false;
          button.setAttribute("aria-disabled", "false");
          button.textContent = prev;
        };
      }

      /* ================= Data & Nodes ================= */
      const ITEMS_COUNT = 50;
      const cartList = $("#cart-list");
      const subtotalEl = $("#subtotal");
      const discountEl = $("#discount");
      const totalEl = $("#total");
      const couponInput = $("#coupon");
      const couponBtn = $("#btn-coupon");
      const payBtn = $("#btn-pay");

      let subtotal = 0,
        discount = 0,
        appliedCoupon = null;

      /* ========== Render Items (lazy + 크기예약 + 응답해상도 + 캐시 고려) ========== */
      for (let i = 1; i <= ITEMS_COUNT; i++) {
        const price = i * 3000;
        const card = document.createElement("article");
        card.className = "card";
        card.innerHTML = `
        <img class="thumb"
             loading="lazy" decoding="async" fetchpriority="low"
             src="https://picsum.photos/200/150"
             srcset="https://picsum.photos/240/180 240w, https://picsum.photos/480/360 480w, https://picsum.photos/720/540 720w"
             sizes="(max-width: 900px) 33vw, 120px"
             width="120" height="90" alt="상품 ${i} 이미지">
        <div class="info">
          <h4>상품 ${i}</h4>
          <p data-price="${price}">${fmt.format(price)}</p>
          <label class="qty">수량:
            <input type="number" inputmode="numeric" pattern="[0-9]*"
                   min="1" value="1" aria-label="상품 ${i} 수량" data-price="${price}">
          </label>
        </div>`;
        cartList.appendChild(card);

        /* (옵션) 첫 카드(above-the-fold)만 fetchpriority="high"로 승격
      if(i===1){
        const img = card.querySelector('img');
        img.setAttribute('fetchpriority','high'); // LCP 후보 빠른 확보
      }
      */
      }

      /* ================= Totals ================= */
      function recalcTotals() {
        let sum = 0;
        $$('#cart-list input[type="number"]').forEach((inp) => {
          const price = Number(inp.dataset.price || 0);
          const qty = safeInt(inp.value, { min: 1, max: 99 });
          sum += price * qty;
        });
        subtotal = sum;

        // 간단 쿠폰 룰: SAVE10 → 10% (최대 50,000)
        discount = 0;
        if (appliedCoupon === "SAVE10") {
          discount = Math.min(Math.round(subtotal * 0.1), 50000);
        }

        subtotalEl.textContent = fmt.format(subtotal);
        discountEl.textContent = `- ${fmt.format(discount)}`;
        totalEl.textContent = fmt.format(Math.max(0, subtotal - discount));
      }
      recalcTotals(); // 초기 1회만 정확 계산(중복 누적 제거)

      /* ========== Quantity Change (부분 업데이트 + 디바운스) ========== */
      const onQtyInput = debounce((e) => {
        const el = e.target;
        if (el.matches('input[type="number"]')) {
          el.value = safeInt(el.value, { min: 1, max: 99 }); // 빈값·음수·과대값 보정
          recalcTotals(); // 합계만 갱신 → 페인트 범위 축소
        }
      }, 120);
      cartList.addEventListener("input", onQtyInput);

      /* ========== Coupon (즉시 피드백 + 비동기 + 토스트) ========== */
      couponBtn.addEventListener("click", () => {
        if (couponBtn.disabled) return;

        const restore = setLoading(couponBtn, "검증 중…");
        const code = (couponInput.value || "").trim().toUpperCase();

        // 서버 대기 시뮬레이션
        setTimeout(() => {
          if (code === "SAVE10") {
            appliedCoupon = "SAVE10";
            toast("10% 할인 코드 적용 (최대 50,000원)");
          } else if (!code) {
            appliedCoupon = null;
            toast("할인 코드가 비어 있습니다.");
          } else {
            appliedCoupon = null;
            toast("유효하지 않은 할인 코드입니다.");
          }
          recalcTotals();
          restore();
        }, 300);
      });

      /* ========== Pay (즉시 반응 + 비동기) ========== */
      payBtn.addEventListener("click", () => {
        if (payBtn.disabled) return;

        const restore = setLoading(payBtn, "결제 처리 중…");
        // 결제 API 대기 시뮬레이션
        setTimeout(() => {
          toast("결제가 완료되었습니다!");
          restore();
        }, 600);
      });
    </script>
  </body>
</html>

<!--
상세 설명
A. 이미지 최적화가 왜 ‘처음부터’ 필요한가
  - width/height + aspect-ratio: 브라우저가 레이아웃 단계에서 정확한 박스 크기를 미리 알 수 있어, 이미지가 늦게 와도 주변 텍스트/버튼 자리를 유지 → CLS 0에 수렴.
  - loading="lazy": 뷰포트 밖 이미지는 로딩을 지연해 초기 네트워크 압력을 낮춤.
  - decoding="async": 이미지 디코딩을 메인 작업과 비동기로 처리해 입력·페인트 간섭 최소화.
  - srcset/sizes: 디스플레이/레이아웃 조건에 맞는 최소 적정 해상도로 응답 → 전송량 감소.
  - 캐시 고려(랜덤 쿼리 제거): 같은 URL이면 브라우저 캐시 재사용 → 재방문/리스트 재진입 시 요청 감소.
  - (옵션) fetchpriority: 첫 화면에 꼭 필요한 LCP 후보 이미지는 fetchpriority="high"로 앞당겨 초기 인상 개선.
  - DevTools 확인
    . Network: 초기 요청 수/전송량 감소, 같은 이미지 URL(from disk/memory cache) 히트율 확인.
    . Performance → Experience: Layout Shift Regions 사라짐(또는 0에 근접).

B. 인터랙션 반응성(INP) 설계
  - 문제: 동기 while 블로킹은 클릭 직후 첫 페인트 지연 → 사용자는 “안 눌린다”로 체감.
  - 해결: 클릭 즉시 버튼 상태 변경(텍스트/disabled/aria-disabled) → 조작-피드백 간격을 0에 가깝게. 실제 처리(검증/결제)는 타이머/Promise등으로 메인 스레드 점유를 쪼갬.
  - 토스트(라이브 리전): alert 대신 비차단 UI로 사용자 흐름을 끊지 않음. 보조기기에도 즉시 읽힘.
  - DevTools 확인
    . Performance: Interaction 이벤트 이후 Long task 감소/소거, Next Paint까지 지연 축소.
    . Timings: 클릭 직후 버튼 텍스트 변경 프레임이 바로 보이는지 체크.

C. 수량 변경: 부분 업데이트 + 디바운스
  - 왜 디바운스?: 사용자가 12를 입력하면 실제로는 1 → 12 까지 두 번의 입력이 발생. 매 입력마다 합계 계산·페인트는 낭비.
  - 안전 변환(safeInt): 빈 문자열, ‘0’, ‘-1’, ‘9999’ 등 엣지 입력을 즉시 보정해 계산 안정성 보장.
  - 부분 업데이트: 합계·할인·총액 세 텍스트 노드만 변경 → 페인트 영역 최소화.
  - DevTools 확인
    . Rendering → Paint flashing: 입력 시 합계 영역만 반짝이는지 확인.
    . Performance → Bottom-Up: recalcTotals 호출 빈도/시간 확인 → 디바운스 적용 효과 체감.

D. 합성/페인트 비용 관리
  - transform-only hover: 레이아웃·페인트를 유발할 수 있는 box-shadow/filter의 과도한 사용을 피하고, 합성 단계에서 처리되는 transform 위주로 연출.
  - content-visibility/contain-intrinsic-size: 오프스크린 대량 카드의 초기 계산·페인트 지연. “처음 보이는 영역부터” 가볍게.
  - DevTools 확인
    . Layers 탭: 불필요한 레이어 폭증 여부, hover 시 레이어 승격이 과도하지 않은지 확인.
    . Performance: 스크롤·입력 시 메인 스레드 점유 시간 단축.

E. 접근성/상태 일관성
  - 버튼 로딩: disabled + aria-disabled="true"로 보조기기·키보드 모두 상태를 인지.
  - 진행 안내: aside에 aria-busy를 함께 쓰면 영역 전체가 바쁜 상태임을 알릴 수 있음(여기선 버튼 단위에 집중).
  - 토스트: aria-live="polite"로 자연스러운 음성 안내.

전/후 측정 시나리오(권장 절차)
  1. 초기 로드
    - Network: 이미지 요청 건수/전송량/캐시 히트율 비교.
    - Performance: LCP 후보 리소스가 이미지 요청에 밀리지 않았는지.
  2. 수량 입력(3초간 빠르게 타이핑)
    - Rendering: Paint flashing 면적(전: 리스트 전반 / 후: 합계 텍스트).
    - Performance: recalcTotals 호출 빈도/총시간(디바운스 적용 후 급감).
  3. 할인 코드 버튼
    - 전: 클릭 직후 Long task, INP↑.
    - 후: 클릭 프레임에 텍스트 “검증 중…” 즉시 보임, Long task 없음.
  4. 결제 버튼
    - 전: 800ms 블로킹 → 프레임 미발생.
    - 후: 즉시 “결제 처리 중…” 노출 → 600ms 후 토스트.

회귀 방지 체크리스트(필수)
  - 이미지에 width/height 또는 aspect-ratio가 항상 존재한다.
  - 첫 화면의 핵심 이미지는 필요 시 fetchpriority="high".
  - 입력 핸들러에 디바운스 또는 change 이벤트를 적용했다.
  - 로딩 상태는 시각(UI)·키보드(disabled)·SR(aria-*) 모두 반영했다.
  - Paint flashing에서 합계 텍스트 영역만 갱신된다.
  - Layers 탭에서 레이어 남발/메모리 급증이 없다.
  -->
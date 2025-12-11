<!--
Mission #7 “브라우저 생명주기 완전 정복: 초기화 타이밍·UX 데이터 보호·세션 로깅 최적화”
(현재 브라우저에서는 unload 이벤트 사용이 기본적으로 제한되어 있기 때문에, 이 미션은 참고용 예시로만 활용하시면 됩니다.)

1) 미션 설명 (실무 스토리)
  당신은 SaaS 분석 대시보드의 프론트엔드 리드입니다. 런칭 직전 QA에서 다음 이슈가 연속 보고됩니다.
  - 초기 UI 표시 지연 — 사용자 이름/알림 배지가 페이지가 “완전히” 로드된 뒤에야 나타남.
  - 이미지 기반 레이아웃 깨짐 — 배너 높이를 기준으로 카드 높이를 맞추는데, 이미지 로딩 전에 계산해 0px가 반영됨.
  - 작성 중 데이터 유실 — 고객이 보고서를 쓰다 탭을 닫으면 아무 경고 없이 내용이 사라짐.
  - 세션 로그 유실 — 사용자가 로그아웃 없이 바로 탭을 닫으면 종료 로그가 서버에 거의 남지 않음.
  - 외부 스크립트 병목 — 광고 SDK 동기 로딩으로 HTML 파싱이 막히며 초기화가 지연됨.
  - PM의 지시:
    1. 초기화 타이밍을 DOMContentLoaded / load로 분리해 UX를 개선하라.
    2. DevTools Performance → Timings에서 DOMContentLoaded vs load 발생 시점을 캡처·기록하라.
    3. beforeunload로 데이터 유실을 막고, sendBeacon으로 세션 로그 신뢰성을 확보하라.
    4. 외부 스크립트는 async/defer 전략으로 파싱 차단을 제거하라.

2) 요구사항 (체크리스트)
  - DOMContentLoaded: 사용자 이름·알림 배지 표시, 초안(draft) 복원(로컬스토리지)
  - load: 배너 이미지 실제 높이를 반영해 카드(레이아웃) 계산
  - beforeunload: 폼 미제출 시 경고 + draft 자동 저장
  - unload: navigator.sendBeacon()으로 세션 종료 로그 전송
  - DevTools Performance → Timings스크린샷: DOMContentLoaded와 load의 시간 차 기록
  - 외부 스크립트 async/defer 적용 및 효과 설명(파싱 차단 제거)
  ⚠ 실습 재현을 위해 모든 이미지와 외부 스크립트는 유효한 리소스로 제공됩니다(데이터 URI 사용). 네트워크 의존 없이 동작합니다.

3) Base Code (전 상태 – 타이밍 혼동/데이터 유실/파싱 차단)
-->

<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8" />
  <title>[BASE] 타이밍 혼동으로 인한 UX/로그 불안정</title>

  <!-- 동기 스크립트(데이터 URI). HTML 파싱을 '의도적으로' 잠깐 막아 병목 재현 -->
  <script src="data:text/javascript;charset=utf-8,
    (function(){
      const start = performance.now();
      while(performance.now() - start < 80){} // ~80ms busy-wait to simulate blocking
      console.log('[BASE SDK] 동기 로딩 완료(파싱 차단 시뮬레이션)');
    })();
  "></script>

  <script>
    window.onload = () => {
      console.log("🌎 load - 모든 리소스 로딩 후 실행");

      // (문제) DOM 조작이 불필요하게 load까지 늦춰짐 → 초기 환영 문구가 늦게 뜸
      document.getElementById("username").textContent = "홍길동님, 환영합니다!";

      // (문제) 이미지 높이 기반 레이아웃: DOMContentLoaded에서 실행하면 0px가 나오는 케이스를 유발
      const banner = document.getElementById("banner");
      document.getElementById("card").style.height = banner.naturalHeight + "px";
      console.log("카드 높이(잘못 반영 가능):", document.getElementById("card").style.height);

      // (문제) beforeunload 경고만 띄우고 저장 안 함 → 실수 시 데이터 유실
      window.addEventListener("beforeunload", (e) => {
        if (document.querySelector("#report").value.trim() !== "") {
          e.preventDefault();
          e.returnValue = "정말 나가시겠습니까?";
        }
      });

      // (문제) fetch는 탭 종료 중단 → 종료 로그 유실
      window.addEventListener("unload", () => {
        fetch("/analytics/exit", {
          method: "POST",
          keepalive: false,
          body: JSON.stringify({ end: Date.now() })
        });
      });
    };
  </script>

  <style>
    body { font-family: system-ui, sans-serif; margin: 24px; }
    header { margin-bottom: 12px; }
    #card { background: #e5e7eb; margin-top: 10px; display:flex; align-items:center; justify-content:center; }
    textarea { width: 100%; height: 160px; margin-top: 16px; }
  </style>
</head>
<body>
  <header>
    <h1 id="username">로딩 중...</h1>
  </header>

  <!-- 유효한 이미지: 데이터 URI(SVG) -->
  <img id="banner"
       alt="배너 이미지"
       src="data:image/svg+xml;charset=UTF-8,%3Csvg xmlns='http://www.w3.org/2000/svg' width='800' height='200'%3E%3Crect width='100%25' height='100%25' fill='%23e2e8f0'/%3E%3Ctext x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle' font-family='Arial' font-size='32' fill='%2363748b'%3EBanner%20800x200%3C/text%3E%3C/svg%3E" />

  <section id="card">
    <p>카드 콘텐츠(배너 높이에 맞춰 세로 크기를 지정해야 함)</p>
  </section>

  <textarea id="report" placeholder="여기에 보고서를 작성하세요(작성 중 이탈 시 유실 위험)"></textarea>
</body>
</html>

<!--
  왜 Base가 문제인가 (관찰 포인트)
    - 동기 스크립트가 HTML 파싱을 멈춤 → 초기 렌더 지연.
    - DOM 조작을 load에 몰아넣음 → UX 반응성 저하(환영 문구 늦게 표시).
    - 이미지 높이 의존 계산을 DOMContentLoaded에 두면 0px → 레이아웃 깨짐(현 코드 주석 참고).
    - beforeunload 저장 부재 → 경고는 뜨나 데이터는 사라짐.
    - unload+fetch → 탭 닫힘과 함께 요청 취소, 로그 누락.

4) 미션의 의의
  1. 렌더링 타이밍을 ‘설계 변수’로 다루기
    - DOMContentLoaded는 DOM Tree 완성 시점, load는 모든 외부 리소스까지 끝난 시점입니다.
    - 단순 지식이 아니라 “어떤 초기화는 어디에 두어야 사용자에게 즉시 반응하는가?”를 설계하는 능력이 핵심입니다.
    - 이 분리가 되면 초기 체감 속도(FMP/INP 체감), 레이아웃 안정성(CLS), 초기 인터랙션 신뢰성이 눈에 띄게 좋아집니다.
  2.데이터 보존 UX를 표준 제약 하에서 구현
    - beforeunload는 커스텀 문구가 차단됩니다. 이 제약을 전제로 UX를 설계해야 합니다.
    - 실무 해법은 경고 + draft 자동 저장(로컬스토리지) 조합입니다. 이 덕에 사용자는 실수로 탭을 닫아도 복구가 가능합니다.
  3. 세션 종료 로그의 신뢰성 담보
    - fetch는 탭 종료 순간 중단될 수 있습니다. 실제로 BI/분석 파이프라인의 결측률로 나타나며, A/B 결과 신뢰도를 해칩니다.
    - navigator.sendBeacon은 종료 직전에도 백그라운드로 전송을 시도, 수집률을 실무적으로 끌어올립니다(완전 보장은 아님 → 서버 dedupe/재시도 설계 병행).
  4. CRP에 영향을 주는 외부 스크립트 다루기
    - 동기 <script>는 파서를 멈춥니다. 광고/분석 SDK는 async, 초기화 의존 스크립트는 defer로 전환해 CRP 차단을 제거해야 합니다.
    - DevTools Performance에서 스크립트 실행 구간 과 DOMContentLoaded/load 마커를 함께 보면 차단/지연의 인과가 선명해집니다.
  5. DevTools로 ‘증거 기반’ 리포트 작성
    - 단순 “개선했다”가 아니라 Timings 마커 스크린샷과 함께 “무엇을 어디로 옮겨서 어떤 수치 변화가 있었는가”를 데이터로 보고합니다.
    - 팀 내 리뷰/회고 시 재현 가능하고, 후속 최적화의 기준선을 제공합니다.

정답 코드 -->
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8" />
  <title>[ANSWER] 안정적 초기화 + 데이터 보호 + 로그 신뢰성 + 파싱 최적화</title>

  <!-- 외부 SDK: async로 병렬 다운로드, 파싱 차단 제거 -->
  <script src="data:text/javascript;charset=utf-8,
    (function(){
      setTimeout(function(){
        console.log('[ANSWER SDK] async 로딩(파싱 차단 없음) + 비동기 초기화 완료');
      }, 0);
    })();
  " async></script>

  <style>
    :root { --pad: 24px; --bg: #0b1220; --fg: #e5e7eb; --muted:#94a3b8; }
    @media (prefers-color-scheme: light) {
      :root { --bg: #ffffff; --fg:#0b1220; --muted:#475569; }
    }
    body { font-family: system-ui, sans-serif; margin: var(--pad); background: var(--bg); color: var(--fg); }
    header { margin-bottom: 12px; }
    #username .badge { background:#ef4444; color:#fff; padding:2px 6px; margin-left:8px; border-radius:12px; font-size:12px; }
    #card { background: color-mix(in srgb, var(--fg), transparent 85%); margin-top: 10px; display:flex; align-items:center; justify-content:center; transition: height .2s ease; }
    textarea { width: 100%; height: 160px; margin-top: 16px; color: inherit; background: color-mix(in srgb, var(--fg), transparent 92%); border: 1px solid color-mix(in srgb, var(--fg), transparent 70%); }
    .hint { color: var(--muted); font-size: 14px; margin-top: 8px; }
  </style>

  <script>
    // --- 유틸: 초안 자동 저장(간단 throttle) ---
    function throttle(fn, wait){
      let t = 0, lastArgs = null;
      return function(...args){
        const now = Date.now();
        lastArgs = args;
        if(now - t >= wait){
          t = now;
          fn.apply(this, args);
        } else {
          clearTimeout(throttle._tid);
          throttle._tid = setTimeout(() => {
            t = Date.now();
            fn.apply(this, lastArgs);
          }, wait - (now - t));
        }
      }
    }

    // 1) DOMContentLoaded → 즉시 반응해야 하는 DOM 작업
    document.addEventListener("DOMContentLoaded", () => {
      console.log("🚀 DOMContentLoaded - DOM 준비 완료");

      // 사용자 이름/알림 배지 표시 (즉시)
      const usernameEl = document.getElementById("username");
      usernameEl.textContent = "홍길동님, 환영합니다!";
      const badge = document.createElement("span");
      badge.className = "badge";
      badge.textContent = "3";
      usernameEl.appendChild(badge);

      // draft 복원
      const cached = localStorage.getItem("draft");
      if (cached) document.getElementById("report").value = cached;

      // 입력 중엔 자동 저장(throttle)
      const saver = throttle((val) => localStorage.setItem("draft", val), 500);
      document.getElementById("report").addEventListener("input", e => saver(e.target.value));
    });

    // 2) load → 이미지(리소스) 의존 레이아웃 계산
    window.addEventListener("load", () => {
      console.log("🌎 load - 모든 리소스 로딩 완료");
      const banner = document.getElementById("banner");
      const card = document.getElementById("card");

      // 배너 실제 높이 기반으로 카드 높이 반영
      const h = banner.naturalHeight;               // 실제 이미지 높이
      card.style.height = Math.max(h, 140) + "px";  // 최소 높이 가드
      console.log("카드 높이(정확히 반영):", card.style.height);
    });

    // 3) beforeunload → 데이터 보호(경고 + draft 보존)
    window.addEventListener("beforeunload", (event) => {
      const text = document.getElementById("report").value;
      if (text.trim() !== "") {
        localStorage.setItem("draft", text); // 초안 저장
        event.preventDefault();
        event.returnValue = "";              // 브라우저 기본 경고
      }
    });

    // 4) unload → 세션 종료 로그(신뢰성 ↑)
    window.addEventListener("unload", () => {
      const payload = JSON.stringify({
        sessionId: "sess-" + Math.floor(performance.timeOrigin),
        end: Date.now(),
        page: location.pathname,
        timeSpentMs: Math.round(performance.now())
      });
      // sendBeacon: 종료 직전에도 비동기 전송 시도(완전 보장은 아님)
      navigator.sendBeacon("/analytics/exit", payload);
    });
  </script>
</head>
<body>
  <header>
    <h1 id="username">로딩 중...</h1>
    <p class="hint">※ DevTools → Performance에서 Timings(🚀DOMContentLoaded / 🌎load) 마커를 캡처해 비교하세요.</p>
  </header>

  <!-- 유효한 이미지: 데이터 URI(SVG, 800×200) -->
  <img id="banner"
       alt="배너 이미지"
       src="data:image/svg+xml;charset=UTF-8,%3Csvg xmlns='http://www.w3.org/2000/svg' width='800' height='200'%3E%3Cdefs/%3E%3Crect width='100%25' height='100%25' fill='%23dbeafe'/%3E%3Ctext x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle' font-family='Arial' font-size='32' fill='%231d4ed8'%3EAnalytics%20Banner%20800x200%3C/text%3E%3C/svg%3E" />

  <section id="card">
    <p>카드 콘텐츠(배너 높이에 맞춰 세로 크기가 지정됩니다)</p>
  </section>

  <textarea id="report" placeholder="여기에 보고서를 작성하세요(작성 중 이탈 시에도 draft가 보존됩니다)"></textarea>
</body>
</html>

<!--
6) 해설 & 전/후 체크포인트 (DevTools 분석 가이드 포함)
  A. DOM 조작 타이밍 — “보여줄 건 빨리”
    - Base: 환영 문구를 load에 묶어 이미지까지 기다림 → 초기 반응이 느림.
    - Answer: DOMContentLoaded에서 즉시 표시하고 배지도 붙임 → 초기 인지 반응이 빨라짐.
    - DevTools 가이드: Performance 기록 → Timings에서 🚀DOMContentLoaded 직후 UI 변화(스크립트 호출)를 확인.
  B. 이미지 기반 레이아웃 — “정확한 순간에 계산”
    - Base: DOM 생성 직후(이미지 미로딩) 높이 계산 → 0px 반영 위험.
    - Answer: load후 naturalHeight 사용, 최소 높이 가드까지 → 레이아웃 안정(CLS↓).
    - DevTools 가이드: Network 패널에서 이미지 상태, Performance에서 🌎load 직후 스타일 변경 타이밍 확인.
  C. 데이터 보존 UX — “경고만이 답이 아니다”
    - Base: 경고만 띄우고 실제 저장은 안 함 → 실수 시 데이터 유실.
    - Answer: draft 자동 저장(throttle) + beforeunload 경고 병행 → 복구 가능성↑, 불필요 경고↓.
    - 실무 팁: 커스텀 문구는 무시되므로, “저장 로직”이 핵심. 서버 자동 저장(API)로 확장 가능.
  D. 세션 종료 로그 — “수집률을 높이는 채널”
    - Base: fetch는 탭 종료 시 취소될 수 있음 → 로그 누락.
    - Answer: sendBeacon은 종료 직전 비동기 전송 시도 → 수집률 현실적으로 개선(서버 dedupe/타임아웃 전략 병행).
    - DevTools 가이드 : Network → Beacon 요청(비동기) 확인, 서버 미구현 시에도 브라우저 송신 시도 로그는 Console에서 확인.
  E. 외부 스크립트 최적화 — “CRP 차단 제거”
    - Base: 동기 <script>가 파서 차단 → 초기 렌더 지연.
    - Answer: async로 병렬 다운로드 + 비동기 초기화 → LCP/FCP 개선 잠재력.
    - DevTools 가이드 : Performance → 스크립트 실행 구간과 Timings 마커 상대 위치 비교. 차단(Blocking) 구간이 사라진 것을 확인.
  F. 보고서 작성 포인트 — “증거 기반”
    - 변경 전/후의 Timings 스크린샷과 콘솔 타임라인(로그)을 캡처해 무엇을, 어디에, 왜 옮겼는지 설명하세요.
    - 예: “환영 문구 DOM 업데이트를 DOMContentLoaded로 이동 → 사용자 초기 지각 반응 1.2s → 0.3s 단축”.

✅ 최종 요약
  - DOMContentLoaded = DOM Tree 완료 → 즉시 보여줄 것을 이 시점에.
  - load = 모든 리소스 완료 → 리소스 의존 계산을 이 시점에.
  - beforeunload = 사용자 보호 라스트 콜 → draft 저장 + 기본 경고로 데이터 유실 최소화.
  - unload + sendBeacon = 종료 로그 신뢰도 개선.
  - async/defer = 외부 스크립트 파싱 차단 제거 → 초기 렌더 지연 축소.
-->
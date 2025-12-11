<!--
Mission #9: "async와 defer로 렌더링 막는 JS를 최적화하라"

1) 실무 스토리
  회사 랜딩 페이지가 광고 캠페인 중이라 트래픽이 급증했습니다.
  그런데 사용자 설문조사 결과,
  - “페이지가 뜨기 전에 빈 화면에서 2~3초 멈춰있다”
  - “버튼이 안 눌려서 기다리다가 그냥 나가버렸다”
  라는 불만이 많았습니다.

  DevTools로 Performance를 찍어보니 원인은 JS 스크립트 였습니다.
  - <head>에 외부 광고 스크립트,
  - <body>에 통계 트래킹, 소셜 로그인 SDK, UI 라이브러리,
  - 그리고 메인 로직 main.js
  이것들이 순서대로 blocking 되어 HTML 파싱이 멈추고, 그 결과 DOMContentLoaded 이벤트도 밀리고, 첫 화면 렌더링(FCP/LCP)이 늦어지고 있었습니다.

  PM이 요구합니다:
  1. 광고/트래킹은 페이지 렌더링을 막지 않게 비동기로 실행
  2. 메인 로직은 DOM이 다 만들어진 직후 실행되도록 안정적으로 실행 순서 보장
  3. 개선 전/후 성능을 DevTools에서 증거로 남겨라 (DOMContentLoaded / load 타이밍 비교)
  👉 부연설명
    - 기본 <script>는 다운로드와 실행 모두 HTML 파싱을 멈추게합니다. 이게 바로 “blocking script” 문제입니다.
    - 광고 SDK, 트래킹 코드 같은 외부 스크립트는 사용자에게 첫 화면을 보여주는 데 필요하지 않음에도, 기본 방식 때문에 페이지를 늦추고 있었습니다.
    - 핵심은 “필수 아닌 건 최대한 async로 밀어내고, DOM 의존 로직은 defer로 안전하게 실행하자”입니다.

2) 요구사항 (체크리스트)
  - 광고/트래킹: async적용 (실행 순서 상관 없음, 다운로드 끝나자마자 실행)
  - 메인 로직(main.js): defer적용 (HTML 파싱이 끝난 후, DOMContentLoaded 직전에 실행)
  - DevTools Performance 탭에서 DOMContentLoaded 시점 앞당겨진 것 확인
  - Console 로그로 DOMContentLoaded / load / script 실행 순서 비교
  - Base Code와 Answer Code 비교하여 실행 순서 차이 학습
  👉 부연설명
    . async는 순서 보장 없음, 대신 DOMContentLoaded를 지연시키지 않는다는 장점이 있습니다.
    . defer는 문서에 나온 순서대로 실행 보장, DOM 파싱이 끝난 직후에 실행되므로 DOM 의존 로직에 최적입니다.
    . 검증은 단순히 코드 실행 결과만 보는 게 아니라, DevTools의 Performance·Network·Console 세 군데에서 각각 체크해야 실무 감각이 생깁니다.

3) Base Code+ /js 파일들
-->

<!DOCTYPE html>
<html lang="ko">
<head>
  <meta charset="utf-8" />
  <title>[BASE] Blocking JS</title>

  <!-- 문제: head에 광고/트래킹 스크립트가 blocking -->
  <script src="./base-js/ads.js"></script>
  <script src="./base-js/tracking.js"></script>
</head>
<body>
  <h1>JS Blocking 실험</h1>
  <p>버튼 클릭 시 반응 속도를 확인해보세요</p>
  <button id="cta">지금 시작</button>

  <!-- 문제: main.js도 body 하단에서 blocking -->
  <script src="./base-js/main.js"></script>

  <script>
    document.addEventListener("DOMContentLoaded", () => {
      console.log("🚀 DOMContentLoaded (BASE)");
    });
    window.addEventListener("load", () => {
      console.log("🌎 load (BASE)");
    });
  </script>
</body>
</html>


<!--
코드 해설 — mission2-base.html
  - head의 <script src="/js/ads.js"></script> / <script src="/js/tracking.js"></script>
    . 기본 <script>는 파서를 멈춥니다. 네트워크로 스크립트를 내려받고(다운로드), 받자마자 즉시 실행합니다. 이 실행이 끝날 때까지 HTML 파싱은 대기합니다.
    . 결과적으로 DOM 생성이 지연되고, DCL(DOMContentLoaded)도 뒤로 밀립니다.
  - body 하단의 <script src="/js/main.js"></script>
    . 문서 하단이더라도 기본 <script>는 현재 위치에서 파서를 멈추고 실행합니다. DOM 노드가 충분히 만들어졌더라도 실행 동안 메인 스레드는 점유됩니다.
  - 인라인 스크립트에서 DCL/load 로그를 남기는 이유
    . 실행 순서 체감과 이벤트 타이밍을 콘솔로 명확히 비교하기 위해서입니다. BASE에서는 세 개의 외부 스크립트가 모두 끝난 뒤에야 DCL이 발생하는 패턴을 보게 될 것입니다.

✅ /js/ads.js(BASE — 의도적 차단 시뮬레이션)
-->

// /js/ads.js (BASE) — 광고 스크립트가 파서를 막는 상황을 가시화
console.log("[ads] START (BASE) — 광고 스크립트 로드 및 실행 시작");

// 간단한 CPU 바쁜 대기 (주의: 교육/실험용 시뮬레이션)
(function busyWait(ms) {
  const start = performance.now();
  while (performance.now() - start < ms) {}
})(700); // 약 700ms 차단

// 동기 작업(즉시 실행) — 가상의 초기화
var ADS_READY = true;
console.log("[ads] READY (BASE) — 파서 차단 후 광고 초기화 완료");

<!--
코드 해설 — /js/ads.js(BASE)
  - console.log("[ads] START...")
    . 스크립트 실행 진입 시점을 로깅합니다. 이 순간 HTML 파서는 정지 상태입니다.
  - busyWait(700)
    . 메인 스레드를 700ms 동안 바쁘게 돌려 렌더링·파싱 모두 중단시키는 교육용 코드입니다. 실제 서비스에서는 사용하지 않습니다.
    . DevTools Performance에서 이 구간이 긴 Task로 기록됩니다.
  - var ADS_READY = true;
    . 전역 상태를 통해 “광고 초기화 완료”를 가정합니다(의존 코드가 있을 때 체크 포인트).
  - 마지막 console.log
    . “차단이 끝났고 초기화가 완료되었다”는 마커입니다. BASE에서는 이 뒤에 tracking.js가 이어서 또 파서를 멈춘다는 점이 핵심입니다.

✅ /js/tracking.js(BASE — 의도적 차단 시뮬레이션)
-->
// /js/tracking.js (BASE) — 트래킹 스크립트도 파서를 막는 상황을 가시화
console.log("[tracking] START (BASE) — 트래킹 로드 및 실행 시작");

// 또 한 번의 바쁜 대기
(function busyWait(ms) {
  const start = performance.now();
  while (performance.now() - start < ms) {}
})(800); // 약 800ms 차단

// 동기 초기화
var TRACKING_READY = true;
function track(event, payload) {
  console.log("[tracking] event:", event, payload);
}
console.log("[tracking] READY (BASE)");

<!--코드 해설 — /js/tracking.js(BASE)
  - 전반 구조는 ads.js와 동일하되 차단 시간이 800ms로 더 길어 누적 지연을 만듭니다.
  - track함수는 나중에 main.js에서 호출 가능한 동기 트래킹 함수로 노출됩니다.
  - BASE의 핵심은 “여러 동기 스크립트가 연쇄 차단하며 DCL을 뒤로 미룬다”는 시각적 증거를 만드는 것입니다.

✅ /js/main.js(BASE — DOM 의존 로직이지만 차단 방식)
-->
// /js/main.js (BASE) — DOM 의존 로직이지만 파서를 막는 기본 로드 방식
console.log("[main] START (BASE)");

(function busyWait(ms) {
  const start = performance.now();
  while (performance.now() - start < ms) {}
})(600); // 약 600ms 차단

// 기본 상호작용: 버튼 클릭 핸들러
const btn = document.getElementById("cta");
btn.addEventListener("click", () => {
  console.log("[main] CTA clicked (BASE)");
  // 클릭 직후 또 잠깐 버벅임 시뮬레이션
  (function busyWait(ms) {
    const start = performance.now();
    while (performance.now() - start < ms) {}
  })(200);
  console.log("[main] CTA handled (BASE)");
});

console.log("[main] READY (BASE)");

<!--
코드 해설 — /js/main.js(BASE)
  - busyWait(600)
    . 메인 로직조차 동기로 긴 작업을 수행하면 파서를 멈춥니다. 이 시점에는 대체로 DOM이 많이 생겨 있지만, 사용자 상호작용도 막히고 FCP/LCP도 늦어질 수 있습니다.
  - document.getElementById("cta") + addEventListener("click", ...)
    . 사용자의 클릭에 반응해야 하는 핵심 UI 로직인데, 지금은 페이지 로드 직후에도 차단 코드 때문에 전체 반응성이 저하될 수 있습니다.
  - 클릭 핸들러 내부의 busyWait(200)
    . 클릭 직후 프리즈를 체감하게 하는 시뮬레이션입니다. Performance에서 프레임 드랍/FPS 저하를 관찰해보세요.

관찰 포인트 (BASE)
  - Network 탭: JS 파일이 순서대로 blocking
  - Performance 탭:
    . DOMContentLoaded가 늦게 발생
    . FCP/LCP 지연
  - Console: ads.js → tracking.js → main.js 실행 후에야 DOMContentLoaded 발생
  👉 부연설명
    . Blocking 스크립트는 HTML 파서가 정지 → JS 실행 → 다시 파싱 순으로 진행하게 만듭니다. 이 때문에 DOM 트리 생성이 밀리고, 결국 사용자에게 빈 화면 시간이 길어집니다.
    . 특히 광고/트래킹 같은 “3rd-party 스크립트”는 네트워크 지연이 많아 전체 페이지 체감 속도를 끌어내리는 주범이 됩니다.

4) Answer Code
-->
<!DOCTYPE html>
<html lang="ko">
<head>
  <meta charset="utf-8" />
  <title>[ANSWER] async / defer 적용</title>

  <!-- ✅ 광고/트래킹: async (순서 상관 없음, 다운로드 끝나는 즉시 실행) -->
  <script src="./answer-js/ads.js" async></script>
  <script src="./answer-js/tracking.js" async></script>

  <!-- ✅ 메인 로직: defer (HTML 파싱과 병렬 다운로드, 파싱 완료 후 실행) -->
  <script src="./answer-js/main.js" defer></script>

  <!-- ✅ 외부 도메인 최적화(선택): preconnect & SRI 예시 -->
  <!-- <link rel="preconnect" href="https://ads.example.com" crossorigin> -->
  <!-- <script src="https://cdn.example.com/analytics.js"
            async integrity="sha384-...yourhash..." crossorigin="anonymous"></script> -->
</head>
<body>
  <h1>JS Blocking 최적화</h1>
  <p>DOMContentLoaded / load 타이밍을 확인해보세요</p>
  <button id="cta">지금 시작</button>

  <script>
    document.addEventListener("DOMContentLoaded", () => {
      console.log("🚀 DOMContentLoaded (ANSWER)");
    });
    window.addEventListener("load", () => {
      console.log("🌎 load (ANSWER)");
    });
  </script>
</body>
</html>

<!--
코드 해설
  - async가 붙은 광고/트래킹
    . 다운로드는 파서를 막지 않음, 실행은 다운로드 직후 발생(순서 미보장).
    . 중요 포인트: 실행 “순간”에는 JS가 도니 파서가 아주 잠깐 멈출 수 있지만, DCL은 지연되지 않는다는 점이 핵심입니다.
  - defer가 붙은 main.js
    . 다운로드는 파싱과 병렬, 실행은 DOM 파싱 완성 후(=DCL 직전), 여러 개면 문서 순서대로 실행됩니다.
    . DOM 의존 초기화 코드는 defer가 정석입니다.
  - preconnect/SRI(주석)
    . 외부 CDN/광고 도메인과의 초기 연결 시간을 줄이고(DNS/TLS 핸드셰이크 단축), 무결성 검증(SRI)으로 보안을 강화합니다.

✅ /js/ads.js(ANSWER — 가벼운 초기화, DCL 비차단)
-->
// /js/ads.js (ANSWER)
// async 로 로드되므로 다운로드는 파서를 막지 않음.
// 실행 "순간"에는 JS가 돌아가지만, DOMContentLoaded(DCL)를 지연시키지는 않음.
console.log("[ads] START (ANSWER) — async 로드");

// 광고 SDK 스텁: 최소 초기화만 수행 (가벼운 논리)
window.ADS_READY = true;

// 너무 무거운 동기 작업은 금지 — 필요 시 비동기/지연 실행
setTimeout(() => {
  console.log("[ads] deferred init (ANSWER)");
}, 0);

console.log("[ads] READY (ANSWER)");


<!--
코드 해설 — /js/tracking.js(ANSWER)
  - window.analyticsQueue = window.analyticsQueue || []
    . 선행된 호출 버퍼를 이어받거나 새로 만듭니다. HTML 상단 인라인에서 window.track = (...args) => queue.push(args) 형태로 콜을 쌓아둘 수 있습니다.
  - window.track = function(...) { ... }
    . SDK가 준비되기 전이라도 호출 가능하도록 최소 구현체를 제공합니다.
  - 큐 flush 로직
    . 로딩 전 쌓였던 이벤트를 순서대로 소모합니다. 경합/레이스 컨디션을 줄여 안정적입니다.

✅ /js/main.js(ANSWER — defer 전제, DOM 의존 코드 안전 실행)
-->
// /js/main.js (ANSWER)
// defer 로 로드되므로 DOM 파싱 완료 후(DCL 직전) 안전하게 실행됨.
console.log("[main] START (ANSWER) — defer 로드, DOM OK");

// 버튼 상호작용: 즉시 반응 가능해야 함
const btn = document.getElementById("cta");
btn.addEventListener("click", () => {
  console.log("[main] CTA clicked (ANSWER)");
  // 무거운 일은 메인 스레드 점유를 피하기 위해 쪼개기/지연하기
  setTimeout(() => {
    console.log("[main] CTA handled async (ANSWER)");
  }, 0);

  // 트래킹 호출(큐잉 패턴과 궁합)
  if (typeof window.track === "function") {
    window.track("cta_click", { ts: Date.now() });
  } else {
    // 혹시 아직 준비 안 됐다면 큐에 쌓기
    window.analyticsQueue = window.analyticsQueue || [];
    window.analyticsQueue.push(["cta_click", { ts: Date.now() }]);
  }
});

console.log("[main] READY (ANSWER)");

<!--코드 해설 — /js/main.js(ANSWER)
  - defer 덕분에 DOM이 이미 완성된 상태에서 실행됩니다. 그래서 getElementById("cta")가 안전하게 노드를 획득합니다.
  - 클릭 핸들러 내부의 setTimeout(..., 0) 
    . 메인 스레드의 연속 점유를 피하려는 패턴입니다(작업 단위를 잘게 나누면 INP 개선에 유리).
  - 트래킹 호출 분기
    . track이 준비되어 있으면 즉시 호출, 아니면 큐에 쌓았다가 나중에 flush. 실무적 내구성을 높이는 핵심입니다.
  👉 부연설명
    . 광고/트래킹은 순서가 중요하지 않으므로 async에 적합합니다.
    . main.js는 DOM이 준비되어야 실행 가능하므로 defer를 붙이면 안전합니다.
    . 외부 도메인에서 내려오는 광고/SDK라면 <link rel="preconnect">를 추가해 네트워크 핸드셰이크 시간을 절약할 수 있습니다.
  - 보안까지 챙기려면 <script src="..." integrity="sha384-..." crossorigin="anonymous">로 SRI를 적용하는 게 좋습니다.

5) 왜 이렇게 바뀌었을까?
  A. 광고/트래킹 → async
    - 광고/트래킹 스크립트는 페이지 렌더링과 직접적인 연관이 없음
    - async를 쓰면 HTML 파싱과 동시에 다운로드, 다운로드가 끝나는 즉시 실행
    - 실행 순간에는 파서가 잠깐 멈추지만, DOMContentLoaded는 지연시키지 않음
    - 순서가 중요하지 않기 때문에 광고/트래킹에 최적
  타이밍 정확도
    - async는 DCL 비차단이 핵심입니다.
    - 다만 “실행 시점”은 네트워크 속도/리소스 크기에 따라 예측 불가(순서 미보장). 그러므로 DOM 의존 로직에는 부적합합니다.

  B. 메인 로직(main.js) → defer
    - defer는 HTML 파싱과 동시에 다운로드,
    - DOM 파싱이 끝난 직후(=DOMContentLoaded 직전)에 실행
    - 여러 개의 defer 스크립트는 문서 순서대로 실행 보장
    - DOM 의존 로직(main.js)에는 가장 안전한 선택
  실행 순서와 안정성
    - defer 스크립트는 항상 파서를 멈추지 않고 끝까지 파싱을 마친 후 순서대로 실행됩니다.
    - DOM 조작이 많은 초기화 코드(탭/모달/툴팁/리스트 렌더 등)는 defer가 맞습니다.

  C. 실행 순서 비교
    - BASE: ads.js → tracking.js → main.js 실행 끝난 후 DOMContentLoaded → load
    - ANSWER:
      . 광고/트래킹은 다운로드가 끝나는 즉시 async 실행
      . main.js는 DOM 파싱 완료 후 defer 실행
      . → DOMContentLoaded 시점이 앞당겨지고, UI 반응도 개선

  추가 해설(텍스트 타임라인 예시)
    - BASE 콘솔 예상 -->
      [ads] START (BASE)
      [ads] READY (BASE)
      [tracking] START (BASE)
      [tracking] READY (BASE)
      [main] START (BASE)
      [main] READY (BASE)
      🚀 DOMContentLoaded (BASE)
      🌎 load (BASE)
<!--
    -ANSWER 콘솔 예상 -->
      [ads] START (ANSWER)
      [tracking] START (ANSWER)
      [main] START (ANSWER)// defer, DCL 직전
      [main] READY (ANSWER)
      🚀 DOMContentLoaded (ANSWER)
      🌎 load (ANSWER)
      // ads/tracking READY 로그는 네트워크/타이밍에 따라 앞뒤 변동 가능

<!--
  D. 모듈 스크립트(type="module") 주의
    - <script type="module">은 기본적으로 defer 유사 동작을 합니다.
    - 다운로드는 병렬, 실행은 DOM 파싱 후.
    - 단, 여러 모듈의 실행 순서는 보장되지 않습니다.
    - 따라서 모듈 스크립트에는 defer 속성을 붙여도 무시됩니다.
  추가 해설(언제 module을 쓰나)
    - 번들러(ESM)·트리쉐이킹·코드 스플리팅이 필요한 현대 프론트엔드에서 type="module"은 흔해졌습니다.
    - 이 경우에도 DOM 의존 코드는 DCL 이후에 실행된다는 점은 동일하지만, 여러 모듈 간 의존 순서는 명시적 import 그래프로 해결하세요.

  E. 3rd-party 스크립트 안정화 (큐잉 패턴) -->

<script>
    window.analyticsQueue = [];
    window.track = (...args) => analyticsQueue.push(args);
</script>
<script src = "https://cdn.example.com/analytics.js" async></script>
<script>
    document.addEventListener('DOMContentLoaded', () => {
// analytics.js 로드 후 flush (SDK가 window.track을 재정의/수신하도록)
});
</script>

<!--
  👉 이런 식으로 SDK 로딩 전 발생하는 호출을 버퍼링(queueing)해두면, async 로드로 인한 타이밍 불확실성을 흡수할 수 있습니다.

  추가 해설(왜 안전한가)
    - async는 “언제 준비되는지” 알 수 없습니다. 따라서 호출을 잃지 않으려면 큐에 쌓아두고, 준비 완료 시 순서대로 비우는(flush) 방식이 가장 단순하면서 실전에서 검증된 패턴입니다.

6) 용어 설명
  - Blocking Script: HTML 파싱을 멈추게 하는 JS (기본 <script>)
  - async: 병렬 다운로드 + 다운로드 끝나는 즉시 실행 (순서 ❌, DCL 지연 ❌)
  - defer: 병렬 다운로드 + DOM 파싱 완료 후 실행 (순서 ✅, DCL 직전)
  - DOMContentLoaded (DCL): DOM 트리가 완성된 시점 이벤트
  - load: 모든 자원(JS, CSS, 이미지 등)까지 끝난 시점 이벤트
  👉 부연설명
  - 초보자들이 자주 헷갈리는 부분:
    . async는 DOMContentLoaded를 막지 않지만, 실행 타이밍이 랜덤이라 DOM 의존 코드에는 쓰면 안 됨.
    . defer는 순서 보장 + DOM 준비 후 실행이라 DOM 조작에 최적.
    . inline script에는 async/defer가 효과가 없습니다. 오직 src 외부 스크립트일 때만 의미가 있습니다.

  이벤트 루프 관점
  - setTimeout(..., 0)은 macrotask로, 현재 실행 중인 call stack이 비워진 뒤 처리됩니다.
  - Promise 기반 작업은 microtask로, 같은 틱에서 macrotask보다 먼저 실행됩니다.
  - 초기화 시 작업을 적절히 쪼개 event loop로 넘기면 INP 개선에 도움이 됩니다.

7) 이 미션의 의의
  - 실무에서 JS가 성능 병목 1순위인 경우가 많습니다.
  - 광고/트래킹 같은 부가 스크립트는 async로 처리해 렌더링에 방해되지 않게 하고,
  - 메인 로직은 defer로 DOM이 준비된 직후 실행하는 것이 가장 안정적입니다.
  - DevTools에서 DOMContentLoaded가 앞당겨지고, 버튼 클릭 반응 속도가 개선된 것을 직접 확인해보면, “JS를 어디 두고, 어떤 속성을 붙이느냐가 UX와 성능에 이렇게 큰 영향을 주는구나”를 체감할 수 있습니다.
  👉 추가 포인트
  - preconnect와 dns-prefetch를 활용하면 외부 스크립트 서버와의 초기 연결 지연도 줄일 수 있습니다.
  - 보안을 강화하려면 **SRI(서브리소스 무결성)**와 crossorigin 속성을 함께 쓰는 습관을 들이세요.
  - 단순히 DOMContentLoaded만 볼 게 아니라, FCP/LCP/INP 같은 Core Web Vitals 지표에도 영향을 준다는 점을 연결해 생각하면 더 실무적인 시야를 가질 수 있습니다.

🧪 DevTools 실험 가이드(권장)
  1. Console 실행 순서
    - 기대값
      . BASE: ads → tracking → main → DCL → load
      . ANSWER: (ads/tracking: 다운로드 시점마다) → main(defer) → DCL → load
  2. Performance 탭
    - Disable cache 켜고 3회 측정, FCP/LCP/DCL/load 마커 비교
    - 긴 Task(>50ms) 구간이 BASE 대비 감소하는지 확인(특히 ads/tracking 초기화).
  3. Network 탭
    - async/defer 스크립트가 HTML 파싱과 겹쳐 다운로드되는지 확인
    - 외부 도메인은 preconnect 적용 전/후 Initial connection/TLS 구간 비교

🔚 한눈 체크 — 전/후 핵심 요약
  - BASE: 기본 <script>가 파서를 반복 차단 → DCL/반응성 저하
  - ANSWER: 광고/트래킹 async(DCL 비차단), 메인 defer(DCL 직전, 순서 보장) → DCL 앞당김 + UX 개선
  - 실무 안정화: 3rd-party 큐잉 패턴, preconnect/SRI, 작업 쪼개기(setTimeout/Promise)
-->
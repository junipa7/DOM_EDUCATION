<!--
Mission #8: "Critical CSS만 남기고 나머지는 지연 로딩하라"

1) 실무 스토리
  우리 회사는 최근에 신규 서비스를 런칭했습니다.
  서비스의 첫 랜딩 페이지는 방문자들이 가장 먼저 접하는 페이지이자, 전환율(가입/구매 전환)에 직접적인 영향을 주는 중요한 페이지입니다.
  페이지 상단에는 다음과 같은 히어로 영역이 있습니다:
  - 큰 제목(H1): 방문자에게 강렬한 메시지 전달
  - 부제목(Subtext): 서비스의 간단한 설명
  - CTA 버튼(Call To Action): “지금 시작”, “가입하기”, “무료 체험” 같은 행동 유도 버튼
  - 배경: 간단한 색상 그라디언트나 이미지를 통해 시각적 강조

  문제는 사용자가 페이지를 열었을 때 이 히어로 영역이 늦게 나타난다는 것입니다.
  RUM(실제 사용자 모니터링) 결과를 보면, 특히 모바일 3G 환경에서:
  - 아무것도 없는 빈 화면이 약 2~3초간 지속됨 (→ 사용자는 사이트가 멈췄다고 생각할 수 있음)
  - LCP(Largest Contentful Paint)가 3.7초를 넘어, 구글 권장치(2.5초 이하)를 크게 벗어남
  - 결과적으로 이탈률이 높아지고, 광고비 대비 전환율이 떨어짐

  개발자 도구(DevTools)로 확인해보니 원인은 명확했습니다:
  - <head>에 CSS 파일이 여러 개 로드되고 있었고, 모두 동기(Render Blocking) 방식이었음
  - 브라우저는 CSS가 완전히 내려오고 적용될 때까지 화면을 그리지 않고 기다림
  - 결과적으로 첫 화면이 늦게 그려지고, 사용자는 “느린 사이트”라는 인상을 받음

  PM의 요청은 단순합니다.
  👉 “첫 화면(Hero Section)만이라도 빨리 보여주세요. 나머지 스타일은 천천히 적용돼도 괜찮습니다.”
  이 요구를 충족시키려면 Critical CSS(필수 스타일)만 먼저 적용하고, 나머지 CSS는 지연 로딩(Non-blocking) 방식으로 불러와야 합니다.

  👉 부연설명
    - 히어로 영역은 보통 LCP 후보가 됩니다. 큰 제목·배너·영웅 이미지가 “가장 큰 콘텐츠”로 잡히기 때문입니다. LCP가 늦으면 사용자는 “핵심 내용이 아직 안 보인다”고 느끼고, 전환 행동(가입/클릭)도 미뤄집니다.
    - 모바일 3G(또는 저전력·저사양 기기)에서는 네트워크 지연 + CSS 파싱·적용 시간이 겹쳐 빈 화면 구간이 쉽게 길어집니다. 이 구간을 최대한 줄이는 것이 미션의 목표입니다.
    - 핵심 아이디어는 “위에서 보이는 영역(Above-the-fold)”을 먼저 스타일링해서 지각된 속도를 높이고, 나머지는 뒤에서 천천히 붙이는 것입니다.

2) 요구사항 (체크리스트)
  첫 화면(Hero Section)에 꼭 필요한 CSS(타이틀/부제/CTA/배경 등)만 Critical CSS로 <head>에 인라인 삽입
  - 나머지 CSS는 지연 로딩: preload + onload 방식 또는 media="print" 트릭 활용
  - 화면이 깜빡이지 않도록(FOUC 방지) 기본 글꼴, 배경, 버튼 색상까지 Critical에 포함
  - DevTools의 Performance 탭에서 개선 전후 FCP/LCP 시점을 비교
  - Network 패널에서 CSS 요청이 렌더 차단(render-blocking)에서 해제된 것을 확인
  - Coverage 탭을 활용해 unused CSS(첫 화면에서 쓰이지 않는 스타일)를 추출하고, Critical CSS만 인라인 처리
  👉 부연설명
    - Critical CSS 선정 요령: 첫 화면에 실제로 눈에 보이는 요소의 레이아웃·타이포·컬러만 최소로 담으세요. 아래 접힌 섹션의 카드/푸터/모달 등은 제외합니다.
    - 지연 로딩 선택지:
      . preload + onload: 네트워크로 미리 받아두고, onload 시점에 rel="stylesheet"로 바꿔 적용합니다. 렌더 차단 없이 빠르게 준비됩니다.
      . media="print" 트릭: 로딩 중에는 차단하지 않게 media="print"로 두고, 로드가 끝나면 this.media='all'로 바꿉니다. 오래된 브라우저 호환을 챙기고 싶을 때 유용합니다.
      . FOUC 방지: 초기 폰트 로딩 지연을 고려해 시스템 폰트 스택을 먼저 지정하거나, 버튼·배경·텍스트 대비만큼은 Critical에 꼭 포함시키면 “깜빡임” 인상이 줄어듭니다.
      . DevTools 사용 루틴:
        1. Performance에서 Record → 새로고침(Cold Start) → FCP/LCP 마커 시점 기록
        2. Network에서 CSS 요청의 ‘Blocking’ 플래그(또는 waterfall 상단 위치) 확인
        3. Coverage로 Used/Unused 비율을 보고 Critical 후보를 뽑습니다.

3) Base Code (문제 버전)
-->
<!DOCTYPE html>
<html lang="ko">
<head>
  <meta charset="utf-8" />
  <title>[BASE] Critical CSS 미분리</title>

  <!-- 문제: CSS 파일 4개가 모두 동기적으로 로드됨 (렌더 차단) -->
  <link rel="stylesheet" href="/css/reset.css">
  <link rel="stylesheet" href="/css/fonts.css">
  <link rel="stylesheet" href="/css/layout.css">
  <link rel="stylesheet" href="/css/theme.css">

  <style>
    html,body{height:100%}
  </style>
</head>
<body>
  <section class="hero">
    <h1 class="title">빠른 첫 화면이 UX를 살립니다</h1>
    <p class="subtitle">렌더링을 막는 CSS를 정리해보세요</p>
    <button class="cta">지금 시작</button>
  </section>
</body>
</html>

<!--
  관찰 포인트 (BASE)
    - Network 탭: CSS 4개 모두 렌더 차단 리소스로 표시됨
    - Performance 탭: FCP(첫 페인트)까지 2~3초 소요
    - LCP(히어로 타이틀 등장)는 더 늦음
    - Coverage 탭: 실제 첫 화면에서 쓰이지 않는 CSS도 초기 로딩에 모두 내려옴 (비효율)
  👉 부연설명
    - <link rel="stylesheet">는 기본적으로 렌더 차단입니다. 브라우저는 CSS가 적용되기 전까지 DOM을 그리지 않는데, 이는 스타일 미적용 상태의 깜빡임을 막기 위한 설계이기도 합니다.
    - Base 구성처럼 reset/fonts/layout/theme를 한꺼번에 동기 로드하면, 위에서 보이는 히어로조차 CSS 다운로드 → 파싱 → 적용이 끝날 때까지 나타나지 않습니다.
    - 확인 방법(Chrome):
      1. Network → Disable cache 체크 → 새로고침
      2. CSS 리소스를 클릭해 “Initiator” 와 “Timing”에서 차단 구간을 살펴보기
      3. Performance에서 막대 그래프의 FCP/LCP 마커 위치가 뒤로 밀려 있는지 확인
      4. Coverage에서 Unused %가 높은 파일을 찾아 Critical에서 제외할 후보로 표시

4) Answer Code
-->
<!DOCTYPE html>
<html lang="ko">
<head>
  <meta charset="utf-8" />
  <title>[ANSWER] Critical CSS 분리 + 지연 로딩</title>

  <!-- ✅ Critical CSS: 첫 화면에 꼭 필요한 최소 스타일만 인라인 -->
  <style>
    body {
      margin:0;
      font-family:sans-serif;
      background:#0b1220;
      color:#e5e7eb;
      display:flex;
      justify-content:center;
      align-items:center;
      height:100vh;
      flex-direction:column;
      text-align:center;
    }
    h1 { font-size:2rem; margin:0 0 0.5rem }
    p { margin:0 0 1rem; color:#94a3b8 }
    button {
      padding:12px 20px;
      border:none;
      border-radius:8px;
      background:#2563eb;
      color:white;
      cursor:pointer;
    }
    button:hover { background:#1d4ed8 }
  </style>

  <!-- ✅ 비필수 CSS는 preload + onload 방식으로 지연 로딩 -->
  <link rel="preload" href="/css/theme.css" as="style" onload="this.onload=null;this.rel='stylesheet'">
  <noscript><link rel="stylesheet" href="/css/theme.css"></noscript>

  <!-- ✅ 대체 패턴: media="print" 후 onload 시점에 변경 -->
  <!--
  <link rel="stylesheet" href="/css/theme.css" media="print" onload="this.media='all'">
  -->
</head>
<body>
  <section class="hero">
    <h1 class="title">빠른 첫 화면이 UX를 살립니다</h1>
    <p class="subtitle">Critical CSS만 먼저 적용하세요</p>
    <button class="cta">지금 시작</button>
  </section>
</body>
</html>

<!--
  👉 부연설명
    - 인라인 Critical: body·h1·p·button 정도의 최소 스타일만 담아 첫 화면의 배경/텍스트/레이아웃을 바로 그립니다. 이 정도 분량은 보통 수KB로, 초기 페인트를 앞당기기에 충분합니다.
    - preload 라인 해석:
      . rel="preload"는 “지금 바로 내려받되, 적용은 나중에”라는 의미입니다.
      . as="style"은 브라우저가 리소스 우선순위와 캐싱을 올바르게 판단하도록 힌트를 줍니다.
      . onload="this.onload=null;this.rel='stylesheet'"는 로딩이 끝난 후에만 스타일시트로 전환합니다. 이로 인해 렌더 차단이 발생하지 않습니다.
      . <noscript>는 JS가 꺼진 환경에서도 CSS가 적용되도록 하는 안전장치 입니다.
    - 대체 패턴 주석: media="print" → onload에서 all로 변경하는 방식은 오래된 환경 과의 호환성을 챙길 때 선택할 수 있습니다. 둘 중 하나만 쓰면 됩니다.

5) 왜 이렇게 바뀌었을까?
  A. Critical CSS 인라인
    - 브라우저는 CSS가 준비되기 전까지 화면을 그리지 않습니다.
    - 하지만 첫 화면에 꼭 필요한 스타일(배경색, 글자 크기, 버튼 색상)만 <style>에 직접 작성하면, 브라우저가 기다리지 않고 바로 화면을 그릴 수 있습니다.
    - → FCP(첫 콘텐츠 표시)가 빨라집니다.
    - → LCP(히어로 타이틀 표시)도 더 이른 시점에 가능해집니다.
    - 추출 방법: DevTools → Coverage 탭을 열고, 첫 화면에서 실제 사용된 CSS만 확인 후 복사해 인라인 처리
  👉 부연설명
    - Above-the-fold 기준: 최초 뷰포트(예: 800~900px 높이)에 실제로 보이는 요소만 대상으로 잡습니다. 아래 스크롤로만 보이는 UI는 과감히 제외합니다.
    - Coverage 사용 순서:
      1. Command Palette(⌘/Ctrl+Shift+P) → “Coverage” → “Start instrumenting coverage and reload page”
      2. 새로고침 후 각 CSS 파일의 Used/Unused 바 확인
      3. 사용된 규칙들만 복사해 <style>에 최소치로 붙입니다. 필요 시 클래스 이름 범위를 좁혀 누수 방지
    - 주의 : Critical을 과도하게 키우면 오히려 HTML의 전송 크기가 불어나 지연됩니다. 보통 수KB~수십KB 이내로 관리하는 것을 권장합니다. 또한 중복 정의(인라인과 외부 CSS에 같은 규칙)를 피하고, 외부 CSS에서 덮어쓰는 규칙이 있으면 인라인 쪽의 특이성을 낮춰 충돌을 줄이세요.

  B. 비필수 CSS 지연 로딩
    - 나머지 CSS는 preload로 미리 다운로드하지만, 실제 적용은 onload후에 rel="stylesheet"로 전환합니다.
    - 즉, 다운로드는 빨리, 렌더링 차단은 안 되게, 적용은 나중에 → 초기 화면 표시를 방해하지 않습니다.
    - <noscript>는 자바스크립트를 꺼둔 브라우저에서도 안전하게 CSS를 적용하기 위한 백업입니다.
    - 대체 방법으로 media="print" 속성을 활용한 뒤 onload 이벤트에서 media="all"로 바꾸는 패턴도 있습니다. → 오래된 브라우저 호환성 확보 가능
  👉 부연설명
    - preload는 적용(apply)가 아니라 다운로드 예약입니다. 따라서 onload에서 rel을 바꾸는 코드가 반드시 필요합니다.
    - media="print" 패턴은 다운로드는 하되 화면(media=screen)에 즉시 적용되지 않게하여 차단을 피합니다. 이후 onload에서 all로 바꿔 적용하면 됩니다.
    - 트러블슈팅 팁 : 지연 로딩 후 스타일이 늦게 붙으면서 약간의 레이아웃 점프가 보이면, Critical에 컨테이너 높이/패딩등 레이아웃 안정화 속성을 조금 더 포함하세요.

  C. FOUC 방지
    - Critical CSS에 기본적인 글꼴, 배경, 버튼 색상을 포함시켰기 때문에, 지연 로딩된 CSS가 늦게 적용되더라도 사용자는 화면이 허전하거나 깜빡이지 않습니다.
  👉 부연설명
    - 폰트 전략: 초기에는 시스템 폰트(apple-system, Segoe UI, Roboto, Noto Sans, Apple SD Gothic Neo등)로 먼저 그려 FOUT/FOIT 체감을 줄이고, 이후 웹폰트가 준비되면 천천히 바꾸는 식으로 전환을 유도합니다.
    - 색/대비 선반영: 배경색·텍스트 대비·버튼 색만 맞아도 사용자는 “화면이 떴다”고 인지합니다. 화려한 섀도/애니메이션은 뒤로 미뤄도 됩니다.

  D. 실제 개선 효과
    - BASE 버전: 빈 화면 상태가 길고, CSS 로딩 때문에 FCP/LCP가 늦음
    - ANSWER 버전: 히어로 영역이 바로 표시됨 → 사용자 체감 속도 개선
    - DevTools Performance 탭에서 FCP/LCP 마커로 개선된 시점을 직접 비교 가능
  👉 부연설명
    - 실습 팁: “Disable cache”를 켜고 2~3회 반복 측정하여 Cold vs Warm 차이를 체감해 보세요.
    - 해석 요령: FCP가 빨라졌는데 LCP가 그대로면, 히어로 내부 이미지(예: 배너)나 웹폰트가 LCP를 잡고 있을 수 있습니다. 이 경우 이미지 preload/fetchpriority="high" 또는 웹폰트 최적화를 추가로 고려하세요.

6) 용어 설명
  - FCP (First Contentful Paint)
    → 화면에 첫 번째 글자/이미지가 보이는 순간
    → 사용자가 “사이트가 열리기 시작했구나” 하고 느끼는 시점
  - LCP (Largest Contentful Paint)
    → 화면에서 가장 큰 요소(보통 히어로 타이틀/배너)가 나타나는 순간
    → 사용자가 “메인 콘텐츠가 준비됐다” 하고 느끼는 시점
  - 렌더 차단(Render Blocking)
    → 브라우저가 CSS/JS를 다 받을 때까지 화면 그리기를 멈추는 현상
  - FOUC (Flash of Unstyled Content)
    → 스타일이 늦게 적용되어 글자가 잠깐 “기본 스타일”로 보였다가 바뀌는 현상
  👉 부연설명
    - 감각적 기준: UX 관점에서 FCP는 “페이지가 시작됐다”는 신호, LCP는 “핵심 내용이 준비됐다”는 신호입니다. 두 시점을 앞당기는 것이 사용자 만족과 전환율을 밀어 올립니다.
    - 실무 연결: 검색 노출·광고 효율·장바구니 이탈률 등 비즈니스 KPI가 LCP와 상관관계를 보이는 경우가 많습니다.

7) 이 미션의 의의
  - 실제 서비스에서는 첫 화면 속도가 전환율과 직결됩니다.
  - Critical CSS 분리는 가장 효과적인 성능 최적화 중 하나입니다.
  - 이 방식을 통해 Core Web Vitals(특히 LCP) 개선 가능 → 검색 엔진 랭킹에도 도움
  - 또한 이 전략은 레거시 페이지에도 적용 가능: CSS를 새로 뜯어고치지 않고, 로딩 방식만 바꿔도 성능 개선 효과 큼
  👉 부연설명
    - 확장 응용:
      . SPA/SSR에서도 초기 HTML에 Critical 주입 → 클라이언트 하이드레이션 전에 첫 화면 안정화
      . 디자인 시스템/토큰을 쓰는 프로젝트라면 토큰 레벨의 최소 테마를 Critical로 구성
    - 실무 체크리스트(빠른 자가검증):
      . 첫 화면이 “색/텍스트/버튼”만으로도 이질감 없이 뜨는가?
      . 지연 로딩 후 레이아웃 점프가 없는가? (CLS 주의)
      . Coverage로 실제 사용 비율을 주기적으로 점검하는가?
-->
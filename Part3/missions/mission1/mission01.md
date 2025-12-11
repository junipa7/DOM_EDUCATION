<!-- 
Mission #1: “시안과 다르게 보이는 제목 스타일 문제 해결하기”

1) 미션 문제 설명
  디자인 시안에서는 페이지의 메인 제목(<h1>)이 남색(#1e3a8a), 32px, bold, 아래 여백 16px로 보여야 합니다. 하지만 실제 화면에서는 검은색(#000), 28px, 기본 두께, 여백 없음으로 나타납니다.
  Elements / Styles / Computed 탭을 사용해 원인을 정확히 추적하고, CSS를 안전하게 수정 해 시안과 일치시키세요.

2) Base Code (간단 설명 포함)
  아래 코드는 의도치 않게 전체 h1에 기본 스타일을 덮어써 버리는 전역 규칙을 포함하고 있습니다.
  DevTools에서 어떤 규칙이 승리하는지를 확인하고, 선택자 구체성 / 선언 순서 / 상속을 고려해 고치세요. -->

<!DOCTYPE html>
<html lang = "ko">
<head>
    <meta charset = "UTF-8"/>
    <title>Mission 10-1</title>
    <style>
        /* 👇 전역 규칙(문제 유발): 시안과 충돌 */
        h1 {color: #000; font-size: 28px;}
        p {color: #666; font-size: 14px; line-height: 1.4;}
    </style>
</head>
<body>
    <main class = "landing">
        <h1>서비스 오픈 예정</h1>
        <p>시안과 다르게 보이는 스타일을 DevTools로 분석하세요.</p>
    </main>
</body>
</html>

<!-- 
3) 미션 문제 요구 사항
  . DevTools Elements 탭에서 <h1> 을 선택하고 Styles 패널에서 어떤 규칙이 적용/무시되는지 확인하세요.
  . Computed 탭에서 최종 color , font-size , font-weight , margin 값을 확인하세요.
  . UA(User Agent) 기본 스타일의 margin-block-start/end(브라우저 기본 h1 여백)도 체크하세요.
  . 시안(남색 #1e3a8a, 32px, 굵게, 아래 여백 16px)을 만족하도록 구체성(specificity) 과 선언순서를 고려해 CSS를 수정하세요.
  . 전역 규칙을 완전히 제거하지 않아도 되지만, 영향 범위를 안전하게 좁히는 방식으로 해결하세요.

4) 미션 문제의 의의
  실무에서 “시안과 화면이 다르다”는 제보의 90%는 스타일 충돌입니다.
  이 미션은 Styles/Computed/Box Model을 활용해 충돌 원인을 빠르게 진단하고, 구체성·캐스케이딩·UA 기본값을 고려해 부작용 없이 고치는 능력을 훈련합니다.

5) 미션 정답 코드
  아래는 전역 h1 규칙을 유지하되, 랜딩 영역에서만 보다 구체적인 선택자로 시안을 보장하는 해결 예시입니다.
  (프로덕션에서는 BEM/스코프 기준으로 더 명확히 구분하는 것도 좋습니다.)
  -->
<!DOCTYPE html>
<html lang="ko">
<head>
    <meta charset="UTF-8"/>
    <title>Mission 10-1 – 정답</title>
    <style>
        /* 전역 규칙(남기되, 이후에 더 구체적인 규칙으로 덮어씀) */
            h1 { color:#000; font-size:28px; }
            p { color:#666; font-size:14px; line-height:1.4; }
        /* ✅ 시안 준수: 더 구체적인 선택자로 덮어쓰기 */
            .landing > h1 {color: #1e3a8a; /* 남색 */
                font-size: 32px; /* 32px */
                font-weight: 700; /* bold */
                margin: 0 0 16px 0; /* 아래 여백 16px (UA 기본 여백 무시/정의) */
                line-height: 1.25; /* 가독성(선택) */
        }
    </style>
</head>
<body>
    <main class = "landing">
        <h1>서비스 오픈 예정</h1>
        <p>시안과 다르게 보이는 스타일을 DevTools로 분석하세요.</p>
    </main>
</body>
</html>
<!-- 
6) 각 정답 코드 및 해설
  . 왜 전역 h1을 지우지 않았나?
    레거시 페이지나 다른 화면에서 전역 h1을 쓰고 있을 가능성이 큽니다. 무작정 삭제하면 회귀 버그가 납니다. 대신 더 구체적인 선택자 .landing > h1 로 해당 화면에서만 안전하게 덮어쓰기 했습니다.
  . Styles 패널에서 봐야 할 것
    <h1> 선택 → Styles: 전역 h1 { color:#000; font-size:28px; } 가 적용되어 있었고, 우리가 추가한 .landing > h1 규칙이 구체성과 선언 순서에서 더 강하므로 승리합니다.
  . Computed 탭 확인 포인트
    color: rgb(30, 58, 138), font-size: 32px , font-weight: 700, margin-bottom: 16px로 바뀌었는지 확인.
    UA 기본 h1 여백이 보일 수 있으므로 명시적 margin 세팅으로 일관성을 확보했습니다.
  . 팀 가이드 팁
    섹션 스코프(.landing), 페이지 스코프(.page-home) 등을 일관되게 두고, 제목은 .page-title 같은 역할 기반 클래스를 쓰면 전역 태그 셀렉터 충돌을 줄이고, 유지보수성도 좋아집니다.
    -->
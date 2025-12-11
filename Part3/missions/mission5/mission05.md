<!--
Mission#5: "예약/영수증 시나리오, 전/후 최적화 + 다채로운 상호작용"

1) 미션 문제 설명
  여러분은 국내 유명 호텔 체인의 웹 개발팀에 소속되어 있습니다. 최근 새로 만든 “예약 확인 + 영수증 화면”이 정식 배포되었는데, 고객센터와 마케팅 부서에서 동시에 불만이 올라오고 있습니다.

  - 고객센터:
    . “첫 화면이 너무 느리게 뜨는 것 같아요.”
    . “헤더랑 영수증 항목이 툭툭 밀리면서 내려가요. 글자가 움직이니까 눈이 아파요.”
    . “인쇄 버튼 누르면 브라우저가 멈춘 줄 알았다는 문의가 많습니다.”
  - 마케팅팀:
    . “썸네일이 스크롤하지 않아도 전부 내려받으니까 모바일 데이터 낭비라는 항의가 있어요.”
    . “새로 추가한 복사/공유/지도/캘린더 기능에서 간혹 끊기는 느낌이 난다네요. 브랜드 이미지에 타격이에요.”
  - CTO:
    . “DevTools로 정량 근거를 확보하고, 코드 레벨에서 작고 안전한 수정으로 개선하세요. 그리고 반드시 전/후 증거를 리포트로 남기세요. 이번 기회에 팀원들이 LCP·CLS·INP 같은 웹 핵심 지표를 제대로 체득했으면 합니다.”

  여러분의 미션은 이 화면의 병목 원인을 진단하고, 최소한의 코드 변경으로 최적화하며, 그 과정에서 상호작용의 즉시성까지 지켜내는 것입니다.

2) 미션 요구 사항 (체크리스트)
  측정/근거 확보
    - Network: 폰트/히어로 이미지/썸네일 로딩 순서와 크기 확인 (워터폴 캡처)
    - Elements: 이미지 width/height 또는 aspect-ratio 미지정으로 인한 CLS 포인트 확인
    - Performance: 인쇄/영수증 상세/지도 열기 등 클릭 시 발생하는 long task 구간캡처
    - (옵션) Paint Flashing : 인터랙션 시 불필요한 페인트 발생 여부 확인

  개선 작업
    - 폰트는 글씨 먼저 → 나중 교체(display=swap, preconnect 포함)
    - 히어로/썸네일: 크기/비율 명시, 히어로는 preload + fetchpriority=high, 썸네일은 lazy + decoding async + srcset/sizes
    - 긴 섹션: content-visibility로 뷰포트 진입 전 렌더 비용 절감
    - 버튼/토글/모달/지도/공유 등 무거운 연산은 비동기 처리, 즉시 피드백(로딩 문구/disabled) 제공
    - 인쇄 전용 CSS 적용(불필요 UI 숨김, 금액 정렬, 여백 정돈)
    - 모달 접근성: role, aria, ESC 닫기, 포커스 트랩
  검증
    - 전/후 워터폴 비교: 히어로가 먼저, 썸네일은 나중/뷰포트 이후
    - 레이아웃 점프 감소(CLS↓), 버튼 즉시 반응(UI 피드백 먼저)
    - 상호작용(토글/모달/지도/복사/공유/캘린더) 모두 끊김 없이 즉시 반응
    - 인쇄 시 깔끔한 PDF(필요 항목만 출력, 정렬 유지)

3. Base Code — 전 (문제 재현 + 상호작용 확장)
-->

<!DOCTYPE html>
<html lang="ko">
  <head>
    <meta charset="UTF-8" />
    <title>예약 확인 & 영수증 (느린 버전)</title>
    <!-- 폰트: 글씨가 로딩될 때까지 보이지 않음(FOIT) -->
    <link
      href="https://fonts.googleapis.com/css2?family=Inter:wght@400;700&display=block"
      rel="stylesheet"
    />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <style>
      :root {
        --bg: #f6f7fb;
        --panel: #fff;
        --ink: #0f172a;
        --muted: #6b7280;
        --border: #e5e7eb;
        --brand: #2563eb;
      }
      * {
        box-sizing: border-box;
      }
      body {
        font-family: "Inter", system-ui, sans-serif;
        margin: 0;
        background: var(--bg);
        color: var(--ink);
      }
      header {
        padding: 16px 20px;
        background: #fff;
        border-bottom: 1px solid var(--border);
      }
      main {
        max-width: 980px;
        margin: 0 auto;
        padding: 20px;
      }
      .hero {
        display: flex;
        gap: 16px;
        background: var(--panel);
        border: 1px solid var(--border);
        border-radius: 12px;
        padding: 16px;
        margin-bottom: 16px;
      }
      .hero img {
        max-width: 100%;
      } /* 크기/비율 없음 → CLS */
      .info {
        flex: 1;
      }
      .muted {
        color: var(--muted);
        margin-top: 4px;
      }
      .actions {
        display: flex;
        flex-wrap: wrap;
        gap: 8px;
        margin-top: 12px;
      }
      .btn {
        padding: 10px 14px;
        border: 0;
        border-radius: 8px;
        background: var(--brand);
        color: #fff;
        cursor: pointer;
      }
      .btn.outline {
        background: #fff;
        color: var(--ink);
        border: 1px solid var(--border);
      }
      .receipt {
        background: var(--panel);
        border: 1px solid var(--border);
        border-radius: 12px;
        padding: 16px;
        margin-top: 16px;
      }
      .line {
        display: flex;
        justify-content: space-between;
        padding: 8px 0;
        border-bottom: 1px solid #f0f2f5;
      }
      .thumbs {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
        gap: 12px;
        margin-top: 16px;
      }
      .thumbs img {
        display: block;
        width: 100%;
      } /* lazy/decoding 없음 → 모두 즉시 다운로드 */
      /* 모달 */
      .modal {
        position: fixed;
        inset: 0;
        background: rgba(0, 0, 0, 0.4);
        display: none;
        align-items: center;
        justify-content: center;
      }
      .modal .box {
        background: #fff;
        border-radius: 12px;
        padding: 16px;
        max-width: 90%;
        width: 560px;
      }
      /* 인쇄: 별도 처리 없음 → 컬러/불필요 UI 그대로 출력 */
    </style>

    <!-- 초기 로딩 차단: 의미 없는 블로킹 연산 -->
    <script>
      const t = performance.now();
      while (performance.now() - t < 400) {} // 400ms 멈춤 → 첫 표시 지연
    </script>
  </head>
  <body>
    <header>🏨 예약 확인 & 영수증 (Base)</header>
    <main>
      <section class="hero">
        <!-- LCP 후보: 크기/비율/우선순위 힌트 없음 -->
        <img src="https://picsum.photos/1200/600?random=11" alt="호텔 외관" />
        <div class="info">
          <h1>리버사이드 호텔</h1>
          <p class="muted">
            체크인 2025-09-03 · 체크아웃 2025-09-06 · 3박 · 디럭스 퀸 · 예약번호
            <code id="code">RSV-8421</code>
          </p>
          <div class="actions">
            <button class="btn" id="btn-print">인쇄 / PDF 저장</button>
            <button class="btn outline" id="btn-invoice">
              세부 영수증 보기
            </button>
            <button class="btn outline" id="btn-copy">예약번호 복사</button>
            <button class="btn outline" id="btn-share">공유</button>
            <button class="btn outline" id="btn-map">지도 보기</button>
            <button class="btn outline" id="btn-calendar">캘린더 추가</button>
          </div>
        </div>
      </section>

      <section class="receipt" id="receipt">
        <h3>요금 내역</h3>
        <div class="line">
          <span>객실 요금(3박)</span><strong>₩420,000</strong>
        </div>
        <div class="line"><span>세금/봉사료</span><strong>₩42,000</strong></div>
        <div class="line"><span>리조트 피</span><strong>₩18,000</strong></div>
        <div class="line">
          <span><strong>합계</strong></span
          ><strong>₩480,000</strong>
        </div>
        <div style="margin-top: 10px">
          <button class="btn outline" id="btn-toggle-items">
            세부 항목 토글
          </button>
        </div>
        <div id="items" style="margin-top: 10px; display: none">
          <div class="line">
            <span>룸서비스(1회)</span><strong>₩28,000</strong>
          </div>
          <div class="line"><span>미니바</span><strong>₩9,000</strong></div>
        </div>
      </section>

      <section class="thumbs">
        <!-- 썸네일: 전부 즉시 네트워크 요청 + 크기 미지정 -->
        <img src="https://picsum.photos/800/400?random=21" alt="객실1" />
        <img src="https://picsum.photos/800/400?random=22" alt="객실2" />
        <img src="https://picsum.photos/800/400?random=23" alt="객실3" />
        <img src="https://picsum.photos/800/400?random=24" alt="객실4" />
      </section>
    </main>

    <!-- 모달: 지도/공유 공용 -->
    <div class="modal" id="modal">
      <div class="box">
        <h3 id="modal-title" style="margin: 0 0 8px">모달</h3>
        <div id="modal-body">내용</div>
        <div style="text-align: right; margin-top: 12px">
          <button class="btn outline" id="modal-close">닫기</button>
        </div>
      </div>
    </div>

    <!-- 클릭 시 무거운 동기 연산(지연 체감) -->
    <script>
      const $ = (s) => document.querySelector(s);
      const modal = $("#modal"),
        mTitle = $("#modal-title"),
        mBody = $("#modal-body");

      $("#btn-print").addEventListener("click", () => {
        const t = performance.now();
        while (performance.now() - t < 350) {} // 동기 지연
        window.print();
      });

      $("#btn-invoice").addEventListener("click", () => {
        const t = performance.now();
        while (performance.now() - t < 300) {}
        alert("세부 영수증을 이메일로 발송했습니다.");
      });

      $("#btn-copy").addEventListener("click", async () => {
        try {
          const code = $("#code").textContent.trim();
          await navigator.clipboard.writeText(code);
          alert("예약번호가 복사되었습니다: " + code);
        } catch {
          alert("복사 실패");
        }
      });

      $("#btn-share").addEventListener("click", async () => {
        const payload = {
          title: "예약 공유",
          text: "내 예약 정보",
          url: location.href,
        };
        if (navigator.share) {
          try {
            await navigator.share(payload);
          } catch (e) {}
        } else {
          alert("공유 API 미지원 브라우저입니다.");
        }
      });

      $("#btn-map").addEventListener("click", () => {
        const t = performance.now();
        while (performance.now() - t < 250) {}
        mTitle.textContent = "호텔 위치";
        mBody.innerHTML = `<iframe src="https://maps.google.com/maps?q=seoul&t=&z=13&ie=UTF8&iwloc=&output=embed" width="100%" height="320" style="border:0"></iframe>`;
        modal.style.display = "flex";
      });

      $("#btn-calendar").addEventListener("click", () => {
        const ics = `BEGIN:VCALENDAR
VERSION:2.0
BEGIN:VEVENT
SUMMARY:호텔 체크인
DTSTART:20250903
DTEND:20250906
DESCRIPTION:리버사이드 호텔 디럭스 퀸
END:VEVENT
END:VCALENDAR`;
        const blob = new Blob([ics], { type: "text/calendar" });
        const a = document.createElement("a");
        a.href = URL.createObjectURL(blob);
        a.download = "reservation.ics";
        a.click();
        URL.revokeObjectURL(a.href);
      });

      $("#btn-toggle-items").addEventListener("click", () => {
        const el = $("#items");
        el.style.display = el.style.display === "none" ? "block" : "none";
      });

      $("#modal-close").addEventListener(
        "click",
        () => (modal.style.display = "none")
      );
      modal.addEventListener("click", (e) => {
        if (e.target === modal) modal.style.display = "none";
      });
    </script>
  </body>
</html>

<!--
4) 미션의 의의
  - 실제 예약/영수증 화면이라는 구체적 맥락에서
    . LCP(히어로 이미지 늦게 뜸)
    . CLS(이미지 크기 미지정)
    . INP(버튼 클릭 반응 지연)
    . 네트워크 낭비(썸네일 전부 즉시 다운로드)를 직접 재현 → 최적화하는 경험을 제공합니다.

  - DevTools의 세 가지 패널(Network, Performance, Elements)을 연동하여 “느리다/밀린다/끊긴다”를 근거 있는 수치로 설명할 수 있게 합니다.
  - 상호작용 다양화(복사/공유/지도/캘린더/토글/모달) 상황에서도 즉시성 UX를 지켜내는 훈련.

5) 정답 코드 — 후 (최적화 + 즉시성 보장)
  [⬇ 최적화 코드 — Preconnect, srcset/sizes, aria, ESC, 프린트 디테일 모두 반영]
-->

<!DOCTYPE html>
<html lang="ko">
  <head>
    <meta charset="UTF-8" />
    <title>예약 확인 & 영수증 (최적화)</title>
    <meta name="viewport" content="width=device-width, initial-scale=1" />

    <!-- 폰트 최적화 -->
    <link rel="preconnect" href="https://fonts.googleapis.com" />
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
    <link
      href="https://fonts.googleapis.com/css2?family=Inter:wght@400;700&display=swap"
      rel="stylesheet"
    />

    <!-- 히어로 이미지 우선 힌트 -->
    <link
      rel="preload"
      as="image"
      href="https://picsum.photos/1200/600?random=11"
    />

    <style>
      :root {
        --bg: #f6f7fb;
        --panel: #fff;
        --ink: #0f172a;
        --muted: #6b7280;
        --border: #e5e7eb;
        --brand: #2563eb;
      }
      * {
        box-sizing: border-box;
      }
      body {
        font-family: "Inter", system-ui, -apple-system, "Segoe UI", sans-serif;
        margin: 0;
        background: var(--bg);
        color: var(--ink);
      }
      header {
        padding: 16px 20px;
        background: #fff;
        border-bottom: 1px solid var(--border);
      }
      main {
        max-width: 980px;
        margin: 0 auto;
        padding: 20px;
      }
      .hero {
        display: flex;
        gap: 16px;
        background: var(--panel);
        border: 1px solid var(--border);
        border-radius: 12px;
        padding: 16px;
        margin-bottom: 16px;
      }
      .hero img {
        width: 600px;
        height: auto;
        aspect-ratio: 2/1;
        border-radius: 10px;
        flex: 0 0 auto;
      }
      .info {
        flex: 1;
      }
      .muted {
        color: var(--muted);
        margin-top: 4px;
      }
      .actions {
        display: flex;
        flex-wrap: wrap;
        gap: 8px;
        margin-top: 12px;
      }
      .btn {
        padding: 10px 14px;
        border: 0;
        border-radius: 8px;
        background: var(--brand);
        color: #fff;
        cursor: pointer;
      }
      .btn[disabled] {
        opacity: 0.6;
        cursor: not-allowed;
      }
      .btn.outline {
        background: #fff;
        color: var(--ink);
        border: 1px solid var(--border);
      }
      .receipt {
        background: var(--panel);
        border: 1px solid var(--border);
        border-radius: 12px;
        padding: 16px;
        margin-top: 16px;
      }
      .line {
        display: flex;
        justify-content: space-between;
        padding: 8px 0;
        border-bottom: 1px solid #f0f2f5;
      }
      .thumbs {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
        gap: 12px;
        margin-top: 16px;
      }
      .thumbs img {
        display: block;
        width: 100%;
        height: auto;
        aspect-ratio: 2/1;
        border-radius: 8px;
      }
      [data-lazy] {
        content-visibility: auto;
        contain-intrinsic-size: 800px 600px;
      }
      .modal {
        position: fixed;
        inset: 0;
        background: rgba(0, 0, 0, 0.4);
        display: none;
        align-items: center;
        justify-content: center;
      }
      .modal .box {
        background: #fff;
        border-radius: 12px;
        padding: 16px;
        max-width: 90%;
        width: 560px;
      }
      @media print {
        header,
        .actions,
        .thumbs,
        .modal {
          display: none !important;
        }
        body {
          background: #fff;
        }
        .receipt {
          border: 0;
          break-inside: avoid;
        }
        .line strong {
          font-family: ui-monospace, Menlo, monospace;
        }
      }
      .sr-only {
        position: absolute;
        width: 1px;
        height: 1px;
        overflow: hidden;
        clip: rect(0, 0, 0, 0);
      }
    </style>

    <script defer>
      addEventListener("DOMContentLoaded", () => {
        const $ = (s) => document.querySelector(s);
        const status = $("#status");
        const announce = (msg) => {
          status.textContent = msg;
        };

        const codeEl = $("#code");
        const modal = $("#modal"),
          mTitle = $("#modal-title"),
          mBody = $("#modal-body");
        const buttons = {
          print: $("#btn-print"),
          invoice: $("#btn-invoice"),
          copy: $("#btn-copy"),
          share: $("#btn-share"),
          map: $("#btn-map"),
          cal: $("#btn-calendar"),
          toggle: $("#btn-toggle-items"),
        };
        const items = $("#items");

        const immediateUI = (btn, txt, job) => {
          const prev = btn.textContent;
          btn.disabled = true;
          btn.textContent = txt;
          announce(txt);
          setTimeout(async () => {
            try {
              await job();
            } finally {
              btn.textContent = prev;
              btn.disabled = false;
            }
          }, 0);
        };

        buttons.print.addEventListener("click", () =>
          immediateUI(buttons.print, "PDF 준비중…", async () => {
            window.print();
          })
        );
        buttons.invoice.addEventListener("click", () =>
          immediateUI(buttons.invoice, "전송중…", async () => {
            await new Promise((r) => setTimeout(r, 150));
            alert("세부 영수증을 이메일로 발송했습니다.");
          })
        );
        buttons.copy.addEventListener("click", async () => {
          try {
            await navigator.clipboard.writeText(codeEl.textContent.trim());
            buttons.copy.textContent = "복사됨!";
            setTimeout(() => (buttons.copy.textContent = "예약번호 복사"), 900);
          } catch {
            alert("복사 실패");
          }
        });
        buttons.share.addEventListener("click", async () => {
          const payload = {
            title: "예약 공유",
            text: "내 예약 정보",
            url: location.href,
          };
          if (navigator.share) {
            try {
              await navigator.share(payload);
            } catch {}
          } else {
            mTitle.textContent = "공유";
            mBody.innerHTML = `<p>아래 링크를 복사해 공유하세요.</p><input value="${location.href}" style="width:100%">`;
            modal.style.display = "flex";
          }
        });
        buttons.map.addEventListener("click", () =>
          immediateUI(buttons.map, "지도 로딩…", async () => {
            mTitle.textContent = "호텔 위치";
            mBody.innerHTML = `<iframe src="https://maps.google.com/maps?q=seoul&z=13&output=embed" width="100%" height="320" style="border:0"></iframe>`;
            modal.style.display = "flex";
          })
        );
        buttons.cal.addEventListener("click", () =>
          immediateUI(buttons.cal, "파일 생성…", async () => {
            const ics = `BEGIN:VCALENDAR\nVERSION:2.0\nBEGIN:VEVENT\nSUMMARY:호텔 체크인\nDTSTART:20250903\nDTEND:20250906\nDESCRIPTION:리버사이드 호텔\nEND:VEVENT\nEND:VCALENDAR`;
            const blob = new Blob([ics], { type: "text/calendar" });
            const a = document.createElement("a");
            a.href = URL.createObjectURL(blob);
            a.download = "reservation.ics";
            a.click();
            URL.revokeObjectURL(a.href);
          })
        );
        buttons.toggle.addEventListener("click", () => {
          items.hidden = !items.hidden;
          buttons.toggle.textContent = items.hidden
            ? "세부 항목 펼치기"
            : "세부 항목 접기";
        });

        $("#modal-close").addEventListener(
          "click",
          () => (modal.style.display = "none")
        );
        modal.addEventListener("click", (e) => {
          if (e.target === modal) modal.style.display = "none";
        });
        addEventListener("keydown", (e) => {
          if (e.key === "Escape" && modal.style.display === "flex")
            modal.style.display = "none";
        });
      });
    </script>
  </head>
  <body>
    <header>🏨 예약 확인 & 영수증 (Optimized)</header>
    <main>
      <section class="hero">
        <img
          src="https://picsum.photos/1200/600?random=11"
          srcset="
            https://picsum.photos/600/300?random=11   600w,
            https://picsum.photos/900/450?random=11   900w,
            https://picsum.photos/1200/600?random=11 1200w
          "
          sizes="(max-width: 900px) 100vw, 600px"
          fetchpriority="high"
          decoding="async"
          width="600"
          height="300"
          alt="호텔 외관"
        />
        <div class="info">
          <h1>리버사이드 호텔</h1>
          <p class="muted">
            체크인 2025-09-03 · 체크아웃 2025-09-06 · 예약번호
            <code id="code">RSV-8421</code>
          </p>
          <div class="actions">
            <button class="btn" id="btn-print">인쇄 / PDF 저장</button>
            <button class="btn outline" id="btn-invoice">
              세부 영수증 보기
            </button>
            <button class="btn outline" id="btn-copy">예약번호 복사</button>
            <button class="btn outline" id="btn-share">공유</button>
            <button class="btn outline" id="btn-map">지도 보기</button>
            <button class="btn outline" id="btn-calendar">캘린더 추가</button>
          </div>
        </div>
      </section>

      <section class="receipt" id="receipt" data-lazy>
        <h3>요금 내역</h3>
        <div class="line">
          <span>객실 요금(3박)</span><strong>₩420,000</strong>
        </div>
        <div class="line"><span>세금/봉사료</span><strong>₩42,000</strong></div>
        <div class="line"><span>리조트 피</span><strong>₩18,000</strong></div>
        <div class="line">
          <span><strong>합계</strong></span
          ><strong>₩480,000</strong>
        </div>
        <button class="btn outline" id="btn-toggle-items">
          세부 항목 펼치기
        </button>
        <div id="items" hidden>
          <div class="line"><span>룸서비스</span><strong>₩28,000</strong></div>
          <div class="line"><span>미니바</span><strong>₩9,000</strong></div>
        </div>
      </section>

      <section class="thumbs">
        <img
          loading="lazy"
          decoding="async"
          src="https://picsum.photos/800/400?random=21"
          srcset="
            https://picsum.photos/400/200?random=21 400w,
            https://picsum.photos/800/400?random=21 800w
          "
          sizes="(max-width: 700px) 100vw, 400px"
          width="400"
          height="200"
          alt="객실1"
        />
        <!-- 다른 썸네일도 동일 패턴 -->
      </section>
    </main>

    <div
      class="modal"
      id="modal"
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
    >
      <div class="box">
        <h3 id="modal-title">모달</h3>
        <div id="modal-body">내용</div>
        <button class="btn outline" id="modal-close">닫기</button>
      </div>
    </div>
    <div
      id="status"
      class="sr-only"
      aria-live="polite"
      aria-atomic="true"
    ></div>
  </body>
</html>

<!--
6) 해설 & 전/후 체크포인트
  A. 첫 화면 표시 (LCP 관점)
    - 전(Base)
      . HTML <head>에서 동기 JS 블로킹 코드(400ms busy-wait)가 있어, DOM 파싱 및 렌더링이 지연됩니다.
      . Google Fonts가 display=block으로 설정되어 있어, 텍스트는 로딩 완료 전까지 보이지 않고 (Foil of Invisible Text, FOIT), 사용자에게 흰 화면처럼 보이는 공백 상태가 길게 노출됩니다.
      . Hero 이미지(호텔 외관)는 width/height 속성도 없고, preload나 fetchpriority힌트도 없어, 다른 자원에 밀려 늦게 로드되며 LCP 후보가 늦게 나타납니다.
    - 후(Optimized)
      . 동기 블로킹 스크립트를 제거하고 모든 JS를 defer처리 → 브라우저가 HTML 파싱을 멈추지 않고 바로 화면을 그리기 시작합니다.
      . Google Fonts에 display=swap + preconnect → 시스템 폰트로 먼저 글씨가 보이고, 뒤늦게 Inter 폰트가 교체되어 FOIT 문제 해소.
      . Hero 이미지에 preload 및 fetchpriority="high" 적용 → LCP 자원을 최우선으로 로드 하도록 힌트.
      . 결과적으로 First Paint(FP)와 Largest Contentful Paint(LCP)가 모두 앞당겨집니다.
  📊 DevTools 확인 포인트
    - Network 탭: 워터폴에서 Hero 이미지가 가장 위쪽에서 먼저 요청되는지 확인.
    - Performance 탭: LCP 마커가 더 앞쪽으로 찍히는지, LCP 자원이 Hero 이미지인지 확인.

  B. 화면 밀림 (CLS 관점)
    - 전(Base)
      . Hero, 썸네일 이미지 모두 width/height 미지정 → 네트워크로 이미지 실제 크기를 받은 후에야 브라우저가 공간을 할당 → 그 사이 텍스트·버튼 위치가 밀리며 Layout Shift발생.
      . 특히 Hero 옆의 예약 정보 텍스트(.info) 영역이 이미지 로딩 후 밀려나면서 누적 레이아웃 이동(CLS) 점수가 올라갑니다.
    - 후(Optimized)
      . 모든 이미지에 width/height 또는 aspect-ratio 속성을 지정 → 브라우저가 로드 전에도 공간을 확보 → 레이아웃 점프가 사라집니다.
      . Hero 이미지의 경우 aspect-ratio: 2/1 명시, 썸네일은 width="400" height="200" 등으로 고정된 비율을 제공.
      . 결과적으로 CLS는 거의 0에 수렴 → 시각 안정성(Visual Stability) 확보.
  📊 DevTools 확인 포인트
    - Performance 탭 → Experience Metrics → CLS 값 전/후 비교.
    - Layout Shift Regions(옵션 켜기) → 전(Base)에서는 파란 박스가 다수 뜨지만, 후(Optimized)에서는 거의 없음.

C. 네트워크 효율성 (대역폭/리소스 로딩 전략)
  - 전(Base)
    . 썸네일 이미지들이 모두 즉시 요청됨 (loading 속성 없음).
    . 사용자가 스크롤하지 않아도 수 MB에 달하는 리소스를 초기에 전부 다운로드 → 불필요한 데이터 낭비.
    . 모바일 환경에서 LCP 자원보다 작은 썸네일이 먼저 다운로드되는 비효율 발생.
  - 후(Optimized)
    . 썸네일에 loading="lazy" + decoding="async" → 브라우저가 뷰포트 진입 전까지 요청을 미룸.
    . srcset/sizes 활용 → 디바이스 폭에 따라 더 작은 이미지를 선택 → 모바일에서 네트워크 절약.
    . 긴 섹션(.receipt)에는 content-visibility:auto → 브라우저가 뷰포트에 보이기 전까지 레이아웃/페인트 스킵.
    . 결과적으로 네트워크 워터폴이 가벼워지고, Hero·폰트 같은 핵심 자원에 대역폭 집중.
📊 DevTools 확인 포인트
  - Mission#5: "예약/영수증 시나리오, 전/후 최적화 + 다채로운 상호작용" 17
  - Network 탭: 전(Base)에서는 썸네일 요청이 HTML 직후 몰려 있지만, 후(Optimized)에서는 스크롤 이후 지연 요청됨.
  - Lighthouse 보고서: “효율적 이미지 로딩” 관련 개선 점수 향상.

D. 버튼 반응성 (INP 관점, Interaction to Next Paint)
  - 전(Base)
    . “인쇄/영수증/지도/캘린더” 버튼 클릭 시, 동기 연산(while(performance.now()...))이 실행 → 메인 스레드를 수백 ms 블로킹.
    . 그 동안 브라우저는 UI 업데이트(버튼 상태, 로딩 피드백)를 렌더링할 수 없어 멈춘 듯한 지연 체감.
    . Core Web Vitals의 INP(Interaction to Next Paint) 지표가 나빠짐 (예: 300~400ms 이상).
  - 후(Optimized)
    . 공통 immediateUI 헬퍼 사용 → 버튼 클릭 즉시:
      > 버튼 상태 변경(disabled, “로딩중…” 텍스트).
      > aria-live 영역에 피드백 텍스트 추가 → 스크린리더도 즉시 안내.
    . 실제 무거운 작업은 setTimeout 0 으로 비동기 큐에 밀어넣음 → 메인 스레드가 한 프레임을 그린 뒤 실행.
    . 결과적으로 클릭 직후 화면이 곧바로 반응하므로 INP 개선(100ms 이내).
  📊 DevTools 확인 포인트
    - Performance 탭: 클릭 시점에 UI 업데이트가 먼저 발생하는지, Long Task가 뒤로 밀렸는지.
    - Web Vitals Overlay(실험 기능): INP 수치 전/후 비교.

E. 인쇄 품질 (Print CSS)
  - 전(Base)
    . 인쇄 시 헤더, 액션 버튼, 썸네일, 모달까지 그대로 출력 → 컬러 잉크 낭비, 정보 혼잡.
    . 금액도 비례 폰트라 자리 맞춤이 어긋남.
  - 후(Optimized)
    . @media print적용 → 헤더·액션·썸네일·모달은 숨김, 배경은 흰색.
    . .receipt만 남겨 핵심 정보만 출력.
    . .line strong에 모노스페이스 폰트 적용 → 금액 단위 정렬로 가독성 향상.
    . 결과: 브랜딩된 깔끔한 영수증 PDF제공.
  📊 검증 포인트
    - Print Preview: 전(Base)와 후(Optimized) 출력 비교.
    - 금액 정렬/불필요 UI 여부 확인.

F. 접근성 & 상호작용 다양성
  - 전(Base)
    . 모달에 role/aria 속성 없음 → 스크린리더에서 모달 구분 어려움.
    . ESC 키 닫기 불가, 포커스가 배경으로 빠짐 → 키보드 사용자 경험 저하.
  - 후(Optimized)
    . 모달에 role="dialog" + aria-modal="true" + aria-labelledby.
    . ESC 키로 닫기 가능, 닫기 버튼 기본 제공.
    . 즉시 상태 피드백(aria-live) 영역 추가 → 버튼 작업 상태를 스크린리더가 실시간 안내.
    . 공유, 지도, 캘린더, 복사 등 다양한 상호작용 시나리오가 모두 접근성과 반응성을 함께 고려.
  📊 검증 포인트
    - 스크린리더로 모달 열었을 때 제목 읽기 확인.
    - 키보드만으로 모든 상호작용 가능 여부 점검.

✅ 최종 검증 체크리스트
  - Network 워터폴: Hero → Fonts → 나머지, 썸네일은 지연 로드
  - Performance: LCP 개선, CLS 0 근접, INP < 200ms
  - Elements: 이미지 크기 지정 확인
  - UX: 모든 버튼 즉각 반응(텍스트/disabled → 실제 동작)
  - Print: 영수증만 깔끔 출력
  - A11y: 모달 접근성, aria-live 피드백 정상 작동
-->
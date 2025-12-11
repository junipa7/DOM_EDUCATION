# 🧪 insertBefore, append, insertAdjacentHTML 실전 연습 문제

---

## 🟢 초급

### ✅ 문제 1. `insertBefore()`로 중간 삽입

다음 HTML에서 `"🍓 Strawberry"`라는 새로운 `<li>` 요소를 `"🍌 Banana"` 앞에 삽입해보세요.

```html
<ul id="fruits">
  <li>🍎 Apple</li>
  <li>🍌 Banana</li>
</ul>
```

---

### ✅ 문제 2. `append()`로 아이콘과 설명 텍스트 함께 추가

아래 코드에서 `div#message` 안에 `"✅ 완료되었습니다"`라는 문자열과 `<span>` 요소를 동시에 삽입하세요. `<span>` 안에는 `"상세 보기"`라는 텍스트가 있어야 합니다.

```html
<div id="message"></div>
```

---

## 🟡 중급

### ✅ 문제 3. `insertAdjacentHTML()`로 여러 위치에 삽입

아래 HTML에서 `div#content`의 위치를 기준으로 다음과 같은 HTML 문자열을 각각 삽입해보세요.

- `"beforebegin"` 위치에 `<p>👋 앞에 인사</p>`
- `"afterbegin"` 위치에 `<p>💬 맨 앞 메시지</p>`
- `"beforeend"` 위치에 `<p>📌 맨 끝 공지</p>`
- `"afterend"` 위치에 `<p>✅ 끝났어요</p>`

```html
<div id="content">본문 내용</div>
```

---

### ✅ 문제 4. `insertBefore()`를 `DocumentFragment`와 함께 사용

`ul#list`에 `"Item 1"`부터 `"Item 5"`까지의 `<li>` 요소를 만들어 `"기존 항목"` 앞에 **한 번에 삽입**하세요. DOM을 최소한으로 건드려야 합니다.

```html
<ul id="list">
  <li>기존 항목</li>
</ul>
```

---

## 🔴 고급

### ✅ 문제 5. 사용자 입력을 그대로 `insertAdjacentHTML`로 출력

아래 HTML에서 사용자 입력값을 받아 `<ul id="comments">` 아래에 새 `<li>`로 추가하는 기능을 구현해보세요. 단, 입력값에는 악성 `<script>` 코드가 포함될 수 있으므로 **보안 처리**가 필요합니다.

```html
<input id="userInput" value="<script>alert('xss')</script>" />
<ul id="comments"></ul>
```

힌트: `insertAdjacentHTML()`을 쓰되, 보안상 안전하게 출력해야 합니다.

---

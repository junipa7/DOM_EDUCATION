# 🧪 DOM 요소 제거 및 교체 – 실전 연습 문제 (난이도별)

---

## 🟢 초급

### ✅ 문제 1. `.remove()`로 요소 제거하기

아래 HTML에서 `"🍌 Banana"` 항목만 DOM에서 제거해보세요.

```html
<ul id="fruits">
  <li>🍎 Apple</li>
  <li id="banana">🍌 Banana</li>
  <li>🍇 Grape</li>
</ul>
```

---

### ✅ 문제 2. `.removeChild()`로 자식 제거하기

위와 같은 HTML에서 `"🍇 Grape"` 항목을 `ul#fruits`에서 제거하되, `removeChild()`를 사용하여 구현해보세요.

---

## 🟡 중급

### ✅ 문제 3. `replaceChild()`로 교체하기

다음 HTML에서 `"🍌 Banana"`를 `"🍊 Orange"`로 교체하세요.

```html
<ul id="fruits">
  <li>🍎 Apple</li>
  <li id="banana">🍌 Banana</li>
</ul>
```

---

### ✅ 문제 4. `removeChild()` 오류 방지

다음 코드에서 존재하지 않는 자식 노드를 제거하려고 하면 에러가 발생합니다. 이를 try-catch 또는 조건문을 이용해 안전하게 처리하세요.

```js
const ul = document.getElementById("fruits");
const ghost = document.getElementById("ghost");
ul.removeChild(ghost); // 오류 발생 가능
```

---

## 🔴 고급

### ✅ 문제 5. 사용자 입력값을 안전하게 출력

아래 HTML에서 `<div id="output">`에 사용자 입력값을 넣되, XSS 공격을 방지하세요. 입력값: `"<img src=x onerror=alert('XSS')>"`

```html
<input id="input" value="<img src=x onerror=alert('XSS')>" />
<div id="output"></div>
```

힌트: `innerHTML`이 아닌 다른 속성을 사용해보세요.

---

### ✅ 문제 6. 동적 메시지 교체

다음 HTML에서 버튼 클릭 시 `"로딩 중..."`이라는 메시지를 `div#box`에 추가하고, 2초 후 `"완료되었습니다!"`로 교체되도록 구현하세요.

```html
<div id="box"></div>
<button id="start">시작</button>
```

---

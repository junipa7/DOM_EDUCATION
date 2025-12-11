# ✅ insertBefore, append, insertAdjacentHTML 해설 및 정답

---

### 문제 1 정답

```js
const fruits = document.getElementById("fruits");
const banana = fruits.children[1];

const newItem = document.createElement("li");
newItem.textContent = "🍓 Strawberry";

fruits.insertBefore(newItem, banana);
```

📌 `insertBefore(newNode, referenceNode)`는 기준 노드 앞에 새 노드를 삽입합니다. 여기서 `banana`가 기준이므로 `"Strawberry"`는 `"Banana"` 앞에 들어갑니다.

---

### 문제 2 정답

```js
const msg = document.getElementById("message");
const span = document.createElement("span");
span.textContent = "상세 보기";

msg.append("✅ 완료되었습니다", span);
```

📌 `append()`는 **문자열과 노드를 함께** 추가할 수 있어 `appendChild()`보다 유연합니다.

---

### 문제 3 정답

```js
const content = document.getElementById("content");

content.insertAdjacentHTML("beforebegin", "<p>👋 앞에 인사</p>");
content.insertAdjacentHTML("afterbegin", "<p>💬 맨 앞 메시지</p>");
content.insertAdjacentHTML("beforeend", "<p>📌 맨 끝 공지</p>");
content.insertAdjacentHTML("afterend", "<p>✅ 끝났어요</p>");
```

📌 위치별 의미는 다음과 같습니다:

- `"beforebegin"`: 대상 요소 앞 (형제 요소로 삽입됨)
- `"afterbegin"`: 대상 요소 안, 맨 앞
- `"beforeend"`: 대상 요소 안, 맨 뒤
- `"afterend"`: 대상 요소 뒤 (형제 요소)

---

### 문제 4 정답

```js
const list = document.getElementById("list");
const firstItem = list.children[0];
const fragment = document.createDocumentFragment();

for (let i = 1; i <= 5; i++) {
  const li = document.createElement("li");
  li.textContent = `Item ${i}`;
  fragment.appendChild(li);
}

list.insertBefore(fragment, firstItem);
```

📌 `DocumentFragment`를 먼저 만들고, 여기에만 `appendChild()`를 반복합니다. 최종적으로 한 번만 `insertBefore()`로 DOM에 적용하면 **리플로우가 1회**로 줄어듭니다.

---

### 문제 5 정답

```js
const userInput = document.getElementById("userInput").value;
const comments = document.getElementById("comments");

// 1. 텍스트 노드로 감싸기 (XSS 방지)
const li = document.createElement("li");
li.textContent = userInput; // HTML 문자열이 아닌 순수 텍스트로 출력

comments.appendChild(li);
```

📌 `insertAdjacentHTML()`은 문자열을 그대로 HTML로 파싱하므로 XSS에 매우 취약합니다.
→ 대신 `textContent`를 사용하면 **스크립트 코드가 실행되지 않고 그대로 보이기만** 하므로 안전합니다.

🛡 보안 팁:

- `textContent`를 쓰면 HTML이 아닌 텍스트로 다뤄져서 **스크립트가 실행되지 않음**
- 실무에서는 DOMPurify 같은 라이브러리로 **HTML 구조만 남기고 스크립트 제거** 가능

---

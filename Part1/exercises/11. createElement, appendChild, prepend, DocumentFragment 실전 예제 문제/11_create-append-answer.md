# ✅ 정답 코드 및 상세 해설

---

### 문제 1 정답

```js
const menu = document.getElementById("menu");
const li = document.createElement("li");
li.textContent = "Contact";
menu.appendChild(li);
```

📌 `appendChild()`는 부모 요소의 **가장 마지막 자식 위치**에 새 요소를 추가합니다. DOM 구조에서 항상 "맨 뒤에 덧붙이기"입니다.

---

### 문제 2 정답

```js
const menu = document.getElementById("menu");
const li = document.createElement("li");
li.textContent = "News";
menu.prepend(li);
```

📌 `prepend()`는 부모 요소의 **가장 앞에** 자식을 추가합니다. 기존 자식 요소들이 한 칸씩 뒤로 밀리게 됩니다.

---

### 문제 3 정답

```js
const menu = document.getElementById("menu");

for (let i = 1; i <= 5; i++) {
  const li = document.createElement("li");
  li.textContent = `Item ${i}`;
  menu.appendChild(li); // 반복마다 DOM 조작 발생 → 성능 비효율 가능
}
```

📌 이 방식은 반복문이 도는 **매 순간마다 브라우저가 DOM을 재계산**하게 됩니다. 요소가 많아질수록 느려질 수 있습니다.

---

### 문제 4 정답

```js
const menu = document.getElementById("menu");
const fragment = document.createDocumentFragment();

for (let i = 1; i <= 5; i++) {
  const li = document.createElement("li");
  li.textContent = `Item ${i}`;
  fragment.appendChild(li); // 일단 메모리상 가상 DOM 공간에만 추가
}

menu.appendChild(fragment); // 마지막에 단 한 번 DOM 조작
```

📌 `DocumentFragment`는 **브라우저에 직접 보이지 않는 임시 DOM 공간**입니다. 여기에 먼저 모든 요소를 추가한 후, 최종적으로 한 번에 DOM에 넣으면 **불필요한 렌더링과 reflow를 방지**할 수 있습니다.

---

### 문제 5 정답

```js
const comments = document.getElementById("comments");
const li = document.createElement("li");
li.textContent = "새 댓글입니다";
comments.prepend(li);
```

📌 `prepend()`는 댓글 시스템처럼 **새 항목이 위로 쌓여야 하는 UI에서 매우 유용**합니다. 댓글, 알림, 채팅창 등에서 자주 쓰입니다.

---

### 문제 6 정답

#### 방법 1: 매 반복마다 appendChild

```js
const menu = document.getElementById("menu");

for (let i = 1; i <= 1000; i++) {
  const li = document.createElement("li");
  li.textContent = `항목 ${i}`;
  menu.appendChild(li); // ❌ 1000번의 DOM 조작 → 성능 저하 유발
}
```

#### 방법 2: DocumentFragment 활용 (최적화)

```js
const menu = document.getElementById("menu");
const fragment = document.createDocumentFragment();

for (let i = 1; i <= 1000; i++) {
  const li = document.createElement("li");
  li.textContent = `항목 ${i}`;
  fragment.appendChild(li); // ✅ 메모리상 조립만 진행 (DOM 영향 없음)
}

menu.appendChild(fragment); // ✅ 단 1번의 DOM 업데이트로 완료
```

📌 두 코드 모두 기능은 같지만, **렌더링 성능에 큰 차이**가 있습니다.
첫 번째 방식은 1000번 **layout/reflow**가 발생하고, 두 번째는 **단 1번만 발생**합니다.
브라우저 최적화와 UX 측면에서 `DocumentFragment`는 필수적인 기술입니다.

---

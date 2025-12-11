# ✅ 요소 제거 및 교체 – 정답 및 상세 해설

---

### 문제 1 정답

```js
const banana = document.getElementById("banana");
banana.remove();
```

📌 `remove()`는 가장 직관적이며 간단한 요소 제거 방식입니다. 단, IE는 지원하지 않으니 최신 환경에서 사용하세요.

---

### 문제 2 정답

```js
const grape = document.querySelector("#fruits li:last-child");
grape.parentNode.removeChild(grape);
```

📌 `removeChild()`는 부모가 직접 자식을 제거해야 하므로 `parentNode`로 부모 접근이 필요합니다.

---

### 문제 3 정답

```js
const list = document.getElementById("fruits");
const banana = document.getElementById("banana");

const orange = document.createElement("li");
orange.textContent = "🍊 Orange";

list.replaceChild(orange, banana);
```

📌 `replaceChild(newNode, oldNode)`는 기존 자식을 새로운 자식으로 바꾸며, 내부적으로는 삭제 + 삽입의 결합 동작입니다.

---

### 문제 4 정답

```js
const ul = document.getElementById("fruits");
const ghost = document.getElementById("ghost");

if (ghost && ghost.parentNode === ul) {
  ul.removeChild(ghost);
} else {
  console.log("해당 요소가 존재하지 않거나 자식이 아닙니다.");
}
```

📌 `removeChild()`는 조건이 맞지 않으면 예외를 던지므로, 사전 검사 또는 `try...catch`가 필수입니다.

---

### 문제 5 정답

```js
const input = document.getElementById("input");
const output = document.getElementById("output");

output.textContent = input.value;
```

📌 `textContent`는 모든 HTML을 문자열로 처리하므로 스크립트가 실행되지 않습니다.
🛡️ 실무 보안 규칙: 사용자 입력값은 절대 `innerHTML`로 출력하지 마세요.

---

### 문제 6 정답

```js
const box = document.getElementById("box");
const btn = document.getElementById("start");

btn.addEventListener("click", () => {
  const loading = document.createElement("p");
  loading.textContent = "로딩 중...";
  box.appendChild(loading);

  setTimeout(() => {
    const done = document.createElement("p");
    done.textContent = "완료되었습니다!";
    box.replaceChild(done, loading);
  }, 2000);
});
```

📌 초기 로딩 메시지를 `appendChild()`로 넣고, 일정 시간 후 `replaceChild()`로 새 메시지로 교체하는 흐름입니다. 실시간 UI 변화에서 매우 자주 사용되는 패턴입니다.

---

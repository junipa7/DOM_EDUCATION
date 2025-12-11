# ✅ 속성 vs DOM 접근자 – 정답 및 상세 해설

---

### 문제 1 정답

```js
const input = document.getElementById("input1");
const btn = document.getElementById("check");

btn.addEventListener("click", () => {
  console.log("getAttribute:", input.getAttribute("value"));
  console.log("input.value:", input.value);
});
```

📌 `getAttribute("value")`는 HTML에 처음 정의된 값을 반환하고, `.value`는 현재 상태값을 반환합니다.

---

### 문제 2 정답

```js
input.setAttribute("value", "속성으로 설정됨");

console.log("getAttribute:", input.getAttribute("value")); // "속성으로 설정됨"
console.log("input.value:", input.value); // 여전히 "초기값"
```

📌 `setAttribute()`로 바꾸면 `.value`에는 영향이 없습니다. 사용자 입력이나 동적 변경을 위해선 `.value`를 써야 합니다.

---

### 문제 3 정답

```js
input.value = "DOM으로 설정됨";

console.log("input.value:", input.value); // "DOM으로 설정됨"
console.log("getAttribute:", input.getAttribute("value")); // 여전히 "초기값" 또는 이전 속성값
```

📌 `.value`는 화면에도 바로 반영되며 사용자와 상호작용하는 현재 상태를 나타냅니다.

---

### 문제 4 정답

```js
const input2 = document.getElementById("input2");
const btn2 = document.getElementById("log");

btn2.addEventListener("click", () => {
  console.log("input.value:", input2.value);
  console.log("getAttribute:", input2.getAttribute("value"));
});
```

📌 사용자가 `"직접 입력"`을 하면 `.value`는 즉시 반영되지만, `getAttribute()`는 여전히 초기값 `"초기"`를 반환합니다.

---

### 문제 5 정답

```js
const checkbox = document.getElementById("checkMe");
const checkBtn = document.getElementById("checkBtn");

checkBtn.addEventListener("click", () => {
  console.log("checkbox.checked:", checkbox.checked);
  console.log("getAttribute:", checkbox.getAttribute("checked"));
});
```

📌 `.checked`는 현재 사용자의 클릭 상태를 반영하지만, `getAttribute("checked")`는 초기 정의 상태만 읽습니다. 클릭해도 바뀌지 않음.

---

### 문제 6 정답

```js
checkbox.setAttribute("checked", false);

console.log("getAttribute:", checkbox.getAttribute("checked")); // "false"
console.log("checkbox.checked:", checkbox.checked); // true (여전히 체크됨)
```

📌 HTML 속성값은 `"false"`라는 문자열일 뿐이며, `checked` 속성은 존재 유무로 판단됩니다.
즉, `"false"`가 있어도 체크된 상태로 해석됩니다.

---

✅ 이 연습은 속성(attribute)과 DOM 접근자(property)의 실제 차이를 직접 실습해보며, 폼 요소와 사용자 입력의 신뢰성과 정확한 제어 방식을 이해하는 데 초점을 맞추고 있습니다.
실무에서는 항상 DOM 속성 (`.value`, `.checked`, `.selectedIndex` 등)을 기준으로 로직을 구성해야 예외 없는 안정적인 동작을 보장할 수 있습니다.

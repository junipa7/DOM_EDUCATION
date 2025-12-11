# ✅ classList와 style 속성 해설 및 정답

---

### 문제 1 정답

```js
const box = document.querySelector(".box");
box.className = "box highlight";
```

📌 `className`은 전체 문자열을 교체합니다. 단점은 실수로 기존 클래스를 잃을 수 있다는 점입니다.

---

### 문제 2 정답

```js
const btn = document.getElementById("selectBtn");
btn.addEventListener("click", () => {
  btn.classList.add("selected");
});
```

📌 `classList.add()`는 중복 없이 클래스만 추가합니다. 인터랙션에 필수적인 메서드입니다.

---

### 문제 3 정답

```js
const toggle = document.getElementById("modeToggle");
toggle.addEventListener("click", () => {
  document.body.classList.toggle("dark-mode");
});
```

📌 `toggle()`은 상태 전환 UI에 매우 적합합니다. `classList.contains()`를 내부적으로 활용합니다.

---

### 문제 4 정답

```js
const box = document.querySelector(".box");
box.style.backgroundColor = "lightblue";
box.style.borderRadius = "10px";
```

📌 스타일 속성명은 `background-color` → `backgroundColor`, `border-radius` → `borderRadius`처럼 카멜 표기법으로 작성합니다.

---

### 문제 5 정답

📌 **권장 방식 – 클래스 사용**

```css
/* style.css */
.red-bold {
  color: red;
  font-weight: bold;
}
```

```js
const items = document.querySelectorAll(".item");
items.forEach((item) => item.classList.add("red-bold"));
```

📌 인라인 스타일 방식은 이렇게 됩니다:

```js
items.forEach((item) => {
  item.style.color = "red";
  item.style.fontWeight = "bold";
});
```

🔍 차이점:

- 인라인 방식은 브라우저의 렌더링 엔진에 **각 요소마다 별도 스타일 계산 요청** → 성능 저하
- 클래스 방식은 **한 번만 CSSOM에 정의** → 적용은 빠르고 효율적

---

### 문제 6 정답

```js
const btn = document.getElementById("toggleBtn");
btn.addEventListener("click", () => {
  if (btn.classList.contains("active")) {
    console.log("비활성화됨");
  } else {
    console.log("활성화됨");
  }
});
```

📌 `contains()`는 조건 분기, 접근성 제어, 트리거 상태 판단에 유용하게 사용됩니다.

---

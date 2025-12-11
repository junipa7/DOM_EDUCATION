# ✅ 정답 코드 (문제별)

---

### 문제 1 정답

```js
const boxes = document.querySelectorAll(".box");
boxes.forEach((box) => {
  box.style.border = "2px solid red";
});
```

---

### 문제 2 정답

```js
const ps = document.querySelectorAll("p");
ps.forEach((p, index) => {
  p.innerText = `${index + 1}. ${p.innerText}`;
});
```

---

### 문제 3 정답

```js
const sectionItems = document.querySelectorAll("#section1 .item");
sectionItems.forEach((el) => {
  el.style.backgroundColor = "lightyellow";
});
```

---

### 문제 4 정답

```js
const inputs = document.querySelectorAll("input[type='text']");
inputs.forEach((input) => {
  input.style.backgroundColor = "lightblue";
});
```

---

### 문제 5 정답

```js
const buttons = document.querySelectorAll(".btn");
buttons.forEach((btn) => {
  btn.addEventListener("click", function () {
    alert("클릭됨");
  });
});
```

---

### 문제 6 정답

```js
const noneList = document.querySelectorAll(".none");
if (noneList.length === 0) {
  console.log("선택된 요소 없음");
} else {
  noneList.forEach((el) => {
    el.style.color = "blue";
  });
}
```

---

# ✅ 정답 코드 (문제별)

---

### 문제 1 정답

```js
const items = document.getElementsByClassName("item");
for (let i = 0; i < items.length; i++) {
  items[i].style.color = "red";
}
```

---

### 문제 2 정답

```js
const items = document.getElementsByClassName("item");
console.log(items.length); // 콘솔에 3 출력
```

---

### 문제 3 정답

```js
const lines = document.getElementsByClassName("line");
for (let i = 0; i < lines.length; i++) {
  lines[i].innerText = `${i + 1}. ${lines[i].innerText}`;
}
```

---

### 문제 4 정답

```js
const highlights = document.getElementsByClassName("highlight");
for (let i = 0; i < highlights.length; i++) {
  highlights[i].addEventListener("mouseover", function () {
    highlights[i].style.backgroundColor = "yellow";
  });
}
```

---

### 문제 5 정답

```js
const btn = document.getElementById("apply");
btn.addEventListener("click", function () {
  const boxes = document.getElementsByClassName("box");
  for (let i = 0; i < boxes.length; i++) {
    boxes[i].style.backgroundColor = "blue";
    boxes[i].style.color = "white";
  }
});
```

---

### 문제 6 정답

```js
const tags = document.getElementsByClassName("tag");
for (let i = 0; i < tags.length; i++) {
  if (tags[i].classList.contains("hot")) {
    tags[i].style.border = "2px solid red";
  }
}
```

---

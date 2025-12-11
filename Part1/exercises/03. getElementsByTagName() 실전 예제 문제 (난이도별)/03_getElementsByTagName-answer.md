# ✅ 정답 코드 (문제별)

---

### 문제 1 정답

```js
const ps = document.getElementsByTagName("p");
for (let i = 0; i < ps.length; i++) {
  ps[i].style.color = "green";
}
```

---

### 문제 2 정답

```js
const imgs = document.getElementsByTagName("img");
console.log(imgs.length); // 3 출력
```

---

### 문제 3 정답

```js
const items = document.getElementsByTagName("li");
for (let i = 0; i < items.length; i++) {
  items[i].innerText = `${i + 1}. ${items[i].innerText}`;
}
```

---

### 문제 4 정답

```js
const box = document.getElementById("box");
const spans = box.getElementsByTagName("span");
for (let i = 0; i < spans.length; i++) {
  spans[i].style.color = "blue";
}
```

---

### 문제 5 정답

```js
const tds = document.getElementsByTagName("td");
for (let i = 0; i < tds.length; i++) {
  tds[i].style.backgroundColor = "lightyellow";
}
```

---

### 문제 6 정답

```js
const headers = document.getElementsByTagName("h2");
for (const h of headers) {
  h.innerText = h.innerText.toUpperCase();
}
```

---

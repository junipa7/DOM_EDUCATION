# ✅ Node vs Element – childNodes, children 해설 및 정답

---

### 문제 1 정답

```js
console.log(menu.childNodes.length); // 5
console.log(menu.children.length); // 2
```

📌 `childNodes`는 줄바꿈과 공백도 **텍스트 노드**로 간주합니다.

HTML 구조:

```html
<ul>
  \n
  <li>Home</li>
  \n
  <li>About</li>
  \n
</ul>
```

→ 총 5개 (`#text`, `li`, `#text`, `li`, `#text`)

→ `children`은 오직 `<li>` 태그만 포함하므로 2개.

---

### 문제 2 정답

```js
console.log(menu.firstChild); // #text (줄바꿈)
console.log(menu.firstElementChild); // <li>Home</li>
```

📌 `firstChild`는 진짜 첫 번째 노드인 `#text`를 반환
📌 `firstElementChild`는 첫 번째 HTML 요소를 반환

→ 이 차이를 모르고 `firstChild`로 조작하려 하면 **예상 외의 결과**가 나올 수 있음

---

### 문제 3 정답

```js
// 출력 결과 예시: 3, 1, 3, 1, 3
```

📌 `nodeType === 3`은 **Text Node**
📌 `nodeType === 1`은 **Element Node**

→ 줄바꿈이 끼어 있는 구조에서는 Text → Element → Text → Element → Text 구조가 됨

---

### 문제 4 정답

```js
for (const node of menu.childNodes) {
  if (node.nodeType === 1) {
    node.classList.add("highlight");
  }
}
```

또는 더 명시적으로:

```js
for (const node of menu.childNodes) {
  if (node instanceof Element) {
    node.classList.add("highlight");
  }
}
```

📌 `Text Node`는 `classList` 속성이 없기 때문에, 직접 걸러줘야 함
📌 실무에서는 `menu.children`을 사용하는 것이 가장 안전하고 간단함

---

### 문제 5 정답

```js
console.log(first.nodeName); // "#text"
console.log(first.nodeValue); // "\n" 또는 공백 문자열
```

📌 `Text Node`는 nodeName이 `#text`이고, 실제 값은 줄바꿈 문자일 수 있음
📌 줄바꿈이나 공백도 **브라우저가 DOM으로 해석하여 노드화**한 것임

---

### 문제 6 정답

```js
for (const node of menu.childNodes) {
  if (node.nodeType === 1) {
    console.log(node); // <li> 요소만 출력
  }
}
```

또는:

```js
[...menu.childNodes]
  .filter((n) => n.nodeType === 1)
  .forEach((el) => console.log(el));
```

📌 `childNodes`는 **NodeList**이기 때문에 반복 순회가 가능하지만
📌 Element만 필터링하려면 `nodeType === 1`로 걸러주는 것이 기본 전략

---

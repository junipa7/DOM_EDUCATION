# 🧪 Node vs Element – childNodes, children, firstChild 실전 연습 문제

---

## 🟢 초급

### ✅ 문제 1. `childNodes`와 `children`의 길이 비교

다음 HTML 구조에서, 각각 `childNodes.length`와 `children.length`는 얼마일까요?

```html
<ul id="menu">
  <li>Home</li>
  <li>About</li>
</ul>
```

```js
const menu = document.getElementById("menu");

console.log(menu.childNodes.length); // ?
console.log(menu.children.length); // ?
```

---

### ✅ 문제 2. `firstChild` vs `firstElementChild` 비교

위의 `menu` 요소에서 다음 두 구문의 차이를 설명하고, 콘솔에 출력될 결과를 예측하세요.

```js
console.log(menu.firstChild); // ?
console.log(menu.firstElementChild); // ?
```

---

## 🟡 중급

### ✅ 문제 3. `nodeType` 값을 출력하여 구조 분석

다음 코드를 실행했을 때 어떤 숫자들이 출력될까요? 그리고 그 숫자는 무엇을 의미하나요?

```js
const menu = document.getElementById("menu");

for (const node of menu.childNodes) {
  console.log(node.nodeType);
}
```

---

### ✅ 문제 4. `Text Node`를 건너뛰고 `.classList` 추가

아래 코드에서 에러 없이 모든 `<li>` 요소에 `"highlight"` 클래스를 추가하려면 어떻게 코드를 수정해야 할까요?

```js
for (const node of menu.childNodes) {
  node.classList.add("highlight"); // ⚠️ 에러 발생 가능
}
```

---

## 🔴 고급

### ✅ 문제 5. `nodeName`, `nodeValue` 활용

`menu.firstChild`가 `#text` 노드일 경우, 다음 출력 결과를 예측해보세요.

```js
const first = menu.firstChild;

console.log(first.nodeName); // ?
console.log(first.nodeValue); // ?
```

---

### ✅ 문제 6. `children`과 `childNodes`를 이용한 노드 필터링

다음과 같이 `ul#menu`의 자식 중 `Text Node`가 아닌 것만 필터링해 `console.log()` 하세요.

```js
const menu = document.getElementById("menu");

// 여기서 Element 노드만 출력되도록 필터링하세요.
```

---

# ✅ DOM 트리 탐색 정답 및 해설

---

### ✅ 문제 1 정답

```js
const btn = document.querySelector("button");
console.log(btn.parentNode.id); // "card"
```

📘 `.parentNode`는 선택한 요소의 부모 노드를 반환합니다. 여기서는 `<div id="card">`가 버튼의 부모입니다.

---

### ✅ 문제 2 정답

```js
const btn = document.querySelector("button");
console.log(btn.previousElementSibling.textContent); // "설명입니다."
```

📘 `.previousElementSibling`은 같은 부모를 가진 형제 중, 선택한 요소 **바로 앞에 있는 요소**를 반환합니다.

---

### ✅ 문제 3 정답

```js
const btn = document.querySelector("button");
const children = btn.parentNode.children;

for (let el of children) {
  console.log(el.tagName);
}
```

📘 `.children`은 요소 노드만을 포함하는 HTMLCollection을 반환하며, 줄바꿈 등은 무시합니다. 결과는:

```
H2
P
BUTTON
```

---

### ✅ 문제 4 정답

```js
const buttons = document.querySelectorAll(".card button");

buttons.forEach((button) => {
  button.addEventListener("click", () => {
    const card = button.parentNode;
    const img = card.querySelector("img");
    img.src = "new.jpg";
  });
});
```

📘 버튼 클릭 시, `.parentNode`를 통해 해당 버튼이 포함된 `.card` 요소를 찾고, **그 카드 안에서만** 이미지 요소를 선택해 `src`를 바꿉니다.
→ 전체 페이지가 아닌, “내가 누른 버튼의 카드 안”만 탐색하는 것이 핵심입니다.
→ 이 방식은 실제 쇼핑몰, 슬라이드, 동적 UI에서 매우 자주 사용됩니다.

---

### ✅ 보너스 문제 정답

```js
const ul = document.getElementById("fruits");

console.log("children:", ul.children); // HTMLCollection(2) [li, li]
console.log("childNodes:", ul.childNodes); // NodeList(5) [#text, li, #text, li, #text]

console.log("children length:", ul.children.length); // 2
console.log("childNodes length:", ul.childNodes.length); // 5
```

📘 줄바꿈도 노드로 취급되기 때문에 `.childNodes`는 텍스트 노드도 포함하고, 총 5개의 항목을 가집니다. 반면 `.children`은 요소 노드만 필터링해 두 개만 반환합니다.

→ DOM 탐색에서 불필요한 줄바꿈이나 공백을 제거하고 싶을 땐 `.children`을 써야 합니다.

---

이처럼 `parentNode`, `children`, `sibling` 관련 속성들은 **복잡한 구조 안에서 필요한 정보만 빠르게 추출하거나, 이벤트 발생 요소 중심으로 UI를 조작할 때** 꼭 필요한 도구입니다.
지금의 연습은 앞으로 배울 이벤트 위임, 컴포넌트 분리, 동적 데이터 바인딩 등에 결정적인 기초가 됩니다.

---

# ✅ querySelector & querySelectorAll – 정답과 해설

---

## ✅ 문제 1 정답

```js
const title = document.querySelector(".card .title");
console.log(title.textContent); // 첫 번째 카드
```

🔍 `querySelector()`는 일치하는 요소 중 첫 번째 하나만 반환합니다.

---

## ✅ 문제 2 정답

```js
const titles = document.querySelectorAll(".card .title");
titles.forEach((el) => console.log(el.textContent));
```

🔍 `querySelectorAll()`은 NodeList를 반환하며 `forEach`를 사용할 수 있습니다.

---

## ✅ 문제 3 정답

```js
const activeMenu = document.querySelector(".menu-item.active");
console.log("활성화된 메뉴:", activeMenu.textContent);
```

🔍 `.menu-item.active`는 두 클래스를 모두 가진 요소만 선택합니다.

---

## ✅ 문제 4 정답

```js
const evenItems = document.querySelectorAll(".menu-item:nth-of-type(even)");
evenItems.forEach((el) => console.log(el.textContent));
```

🔍 `:nth-of-type(even)`은 형제 중 짝수 번째 요소를 선택합니다.

---

## ✅ 문제 5 정답

```js
const footerLink = document.querySelector("#footer a");
console.log("푸터에 있는 링크입니다:", footerLink.textContent);
```

🔍 `#footer a`는 특정 부모 영역 안에서만 자식 요소를 탐색합니다.

---

## ✅ 보너스 문제 정답

```js
const main = document.querySelector('[data-role="main"]');
console.log("메인 콘텐츠입니다:", main.textContent);
```

🔍 속성 선택자는 `[속성명="값"]` 형태로 쓰이며, 커스텀 속성도 자유롭게 탐색 가능합니다.

---

이처럼 querySelector 계열은 CSS 선택자의 강력함을 그대로 활용할 수 있어 구조 기반의 DOM 탐색에 매우 효과적입니다.
반복과 선택자 조합에 익숙해질수록 DOM의 복잡한 구조도 유연하게 다룰 수 있게 됩니다!

---

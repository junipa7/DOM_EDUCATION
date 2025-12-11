# ✅ 정답 및 해설

---

### ✅ 문제 1 정답

```js
const items = document.getElementsByClassName("menu-item");
console.log(items); // HTMLCollection(3) [li, li, li]
```

📌 **해설:**

- `getElementsByClassName()`는 클래스명이 `"menu-item"`인 모든 요소를 HTMLCollection으로 반환합니다.
- 유사 배열이지만, `forEach()`는 직접 사용 불가 → `for`문 또는 배열 변환 필요.

---

### ✅ 문제 2 정답

```js
const footer = document.getElementById("footer");
const footerItems = footer.getElementsByClassName("menu-item");
console.log(footerItems); // HTMLCollection(2) [li, li]
```

📌 **해설:**

- 특정 영역 내에서만 클래스를 찾고 싶을 때는 해당 영역 요소(`footer`)를 기준으로 호출.
- `document` 대신 `footer.getElementsByClassName()`으로 범위 제한 가능.

---

### ✅ 문제 3 정답

```js
const items = document.getElementsByClassName("menu-item");
console.log("초기 개수:", items.length); // 2

const newItem = document.createElement("li");
newItem.className = "menu-item";
newItem.textContent = "Blog";
document.querySelector("ul").appendChild(newItem);

console.log("추가 후 개수:", items.length); // 3 (자동 갱신)
```

📌 **해설:**

- `items`는 live 컬렉션이므로, DOM에 해당 클래스를 가진 요소가 추가되면 `.length`가 자동 증가합니다.

---

### ✅ 문제 4 정답

```js
const activeItem = document.getElementsByClassName("menu-item active");
console.log(activeItem.length); // 1
```

📌 **해설:**

- `"menu-item active"`는 **두 클래스가 모두 존재해야** 선택됩니다.
- `menu-item`만 있는 요소는 제외됩니다.
- `.menu-item.active`와 다르게 작동하므로 주의!

---

### ✅ 문제 5 정답

```js
const items = document.getElementsByClassName("menu-item");
// HTMLCollection은 forEach 사용 불가 → 배열로 변환
const itemsArray = Array.from(items);

itemsArray.forEach((el) => {
  console.log(el.textContent);
});
```

📌 **해설:**

- `HTMLCollection`은 배열이 아니므로 `forEach()` 오류 발생
- `Array.from()`으로 안전하게 배열 변환 → 고차함수 사용 가능

---

### ✅ 문제 6 정답

```js
const items = Array.from(document.getElementsByClassName("menu-item"));
items.forEach((el) => el.remove());
```

📌 **해설:**

- live 구조의 HTMLCollection을 그대로 반복하면 삭제 도중 리스트가 바뀌어 오류 발생 가능
- `Array.from()`으로 복사하면 DOM 변화를 반영하지 않으므로 반복이 안전하게 유지됨

---

# ✅ 핵심 요약표

| 항목                       | 설명                                   |
| -------------------------- | -------------------------------------- |
| 메서드 명                  | `getElementsByClassName()`             |
| 기준                       | 클래스 이름                            |
| 반환 타입                  | HTMLCollection (live 구조)             |
| 반복문 주의사항            | 삭제/추가 도중 반복 시 오류 가능       |
| 안전한 반복 방법           | `Array.from()`으로 복사 후 처리        |
| 공백 포함 클래스 조건 사용 | `"a b"` → `a`와 `b` 모두 있어야 선택됨 |
| 범위 제한 가능 여부        | 특정 요소 기준으로 호출 가능           |

---

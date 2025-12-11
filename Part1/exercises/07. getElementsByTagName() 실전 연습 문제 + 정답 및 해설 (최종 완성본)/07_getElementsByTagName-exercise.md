# ✅ 정답 및 해설

---

### ✅ 문제 1 정답

```js
const items = document.getElementsByTagName("li");
console.log(items); // HTMLCollection(3) [li, li, li]
```

**📌 해설:**

- `getElementsByTagName("li")`는 문서 전체에서 모든 `<li>` 태그를 가져옵니다.
- 반환 타입은 **HTMLCollection**, 유사 배열이지만 `forEach()`는 직접 사용 불가.

---

### ✅ 문제 2 정답

```js
const footer = document.getElementById("footer");
const footerItems = footer.getElementsByTagName("li");
console.log(footerItems); // HTMLCollection(2) [li, li]
```

**📌 해설:**

- 특정 상위 요소를 기준으로 `getElementsByTagName()`을 호출하면, 해당 영역 내부만 탐색.
- `document` 전체가 아니라 `footer`만 기준으로 동작하기 때문에 정확한 범위 제어 가능.

---

### ✅ 문제 3 정답

```js
const list = document.getElementsByTagName("li");
console.log("초기 길이:", list.length); // 2

const newItem = document.createElement("li");
newItem.textContent = "세 번째";
document.querySelector("ul").appendChild(newItem);

console.log("추가 후 길이:", list.length); // 3
```

**📌 해설:**

- `list`는 live 컬렉션이기 때문에 DOM에 새로운 `<li>`가 추가되면 자동 반영됨.
- `list.length`가 증가 → 실시간으로 DOM 상태를 반영하는 구조.

---

### ✅ 문제 4 정답

```js
const list = document.getElementsByTagName("li");
for (let i = 0; i < list.length; i++) {
  list[i].remove();
}
```

**📌 해설:**

- `list[0]` 삭제 시 나머지 요소가 앞으로 밀려 인덱스가 재정렬됨.
- `i++`에 의해 다음 요소가 건너뛰어지는 현상 발생 → 일부 요소가 삭제되지 않음.

---

### ✅ 문제 5 정답

```js
const list = document.getElementsByTagName("li");
const copy = Array.from(list);

copy.forEach((item) => item.remove());
```

**📌 해설:**

- `Array.from()`으로 정적 배열을 생성 → 더 이상 DOM 변화에 영향을 받지 않음.
- 반복 도중 삭제해도 순서가 꼬이지 않고 모든 요소 안전하게 삭제됨.

---

### ✅ 문제 6 정답

```js
const allTags = document.getElementsByTagName("*");
console.log("전체 태그 개수:", allTags.length);
```

**📌 해설:**

- `"*"`는 해당 노드 내부의 **모든 태그 요소**를 선택.
- 문서 분석, 테스트 자동화 등에서 전체 구조 파악에 유용.

---

# ✅ 핵심 요약

| 기능                    | `getElementsByTagName()`             |
| ----------------------- | ------------------------------------ |
| 반환 타입               | HTMLCollection                       |
| 실시간 갱신             | O (live)                             |
| 반복 중 DOM 조작 안전성 | 낮음 (인덱스 밀림 주의)              |
| 안전한 반복 방식        | `Array.from()`으로 복사 or 역순 반복 |
| 범위 제한               | 특정 부모 요소에서 호출 가능         |
| 특수 태그명             | `"*"` 사용 시 전체 요소 선택 가능    |

---

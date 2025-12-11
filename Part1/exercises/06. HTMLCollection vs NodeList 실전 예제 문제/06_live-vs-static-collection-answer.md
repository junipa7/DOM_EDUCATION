# ✅ 정답 및 상세 해설

---

## ✅ 문제 1 정답

```js
const coll = document.getElementsByTagName("p");
const nodes = document.querySelectorAll("p");

console.log(coll); // HTMLCollection
console.log(nodes); // NodeList

console.log(coll.length); // 2
console.log(nodes.length); // 2
```

**해설:**

- `getElementsByTagName()` → HTMLCollection (실시간)
- `querySelectorAll()` → NodeList (정적)
- 둘 다 유사 배열이지만, 내부 동작이 다름

---

## ✅ 문제 2 정답

```js
const newP = document.createElement("p");
newP.textContent = "셋";
document.body.appendChild(newP);

console.log(coll.length); // 3 (추가됨)
console.log(nodes.length); // 2 (변하지 않음)
```

**해설:**

- `coll`은 실시간 DOM을 감지하는 라이브 컬렉션이므로 `.length`가 증가
- `nodes`는 선택 당시의 DOM만 기억하는 정적 구조 → 그대로 유지됨

---

## ✅ 문제 3 정답

```js
const list = document.getElementsByTagName("li");
for (let i = 0; i < list.length; i++) {
  list[i].remove();
}
```

**실행 결과:**

- `철수`, `영희`는 삭제됨
- `지민`은 남아 있음

**해설:**

- `list[0]` 삭제 → `지민`이 앞으로 밀림 → `i++`로 인해 건너뜀
- HTMLCollection은 실시간 갱신 → 인덱스 밀림 발생

---

## ✅ 문제 4 정답

```js
const safeList = Array.from(document.getElementsByTagName("li"));
safeList.forEach((li) => li.remove());
```

**해설:**

- `Array.from()`은 실시간 구조를 복사하여 정적인 배열로 만듦
- 복사된 배열은 `.remove()`가 DOM을 바꿔도 내부 순서가 고정 → 안정적으로 삭제 가능

---

## ✅ 문제 5 정답

```js
const list = document.getElementsByTagName("li");
for (let i = list.length - 1; i >= 0; i--) {
  list[i].remove();
}
```

**해설:**

- 뒤에서 앞으로 삭제하면 앞쪽 요소가 밀릴 일이 없음
- `HTMLCollection`의 실시간 갱신 특성과 인덱스 안전성 모두 확보

---

## ✅ 문제 6 정답

```js
const staticItems = document.querySelectorAll(".item");

staticItems.forEach((el) => {
  const newDiv = document.createElement("div");
  newDiv.className = "item";
  document.body.appendChild(newDiv);
});

console.log(staticItems.length); // 2
console.log(document.querySelectorAll(".item").length); // 4
```

**해설:**

- `staticItems`는 처음 선택된 2개의 요소만 포함된 정적 리스트
- 새로 추가된 `.item`은 이후에 `querySelectorAll()`을 다시 호출해야 포함됨
- NodeList는 반복 안정성은 높지만, 실시간 반영이 되지 않음

---

# ✅ 핵심 정리

| 항목               | HTMLCollection       | NodeList             |
| ------------------ | -------------------- | -------------------- |
| 반환 메서드 예     | getElementsByTagName | querySelectorAll     |
| 실시간 갱신 여부   | O (Live)             | X (Static)           |
| 반복 중 DOM 조작   | 위험 (인덱스 밀림)   | 안전 (리스트 고정)   |
| forEach 사용 가능  | X                    | O                    |
| DOM 변경 반영 방식 | 자동 갱신            | 새로 선택해야 반영됨 |

---

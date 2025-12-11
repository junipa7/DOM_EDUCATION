# 📘 HTMLCollection vs NodeList – 실전 연습 문제 (심화 완성본)

---

## 🟢 초급: 구조와 차이점 이해하기

---

### ✅ 문제 1. HTMLCollection과 NodeList 구별하기

#### 💡 목표

- DOM 선택 메서드별로 어떤 객체를 반환하는지 확인
- 구조는 비슷해도 동작 방식이 다름을 인식하기

#### 📝 문제

다음 HTML이 있다고 가정합니다.

```html
<body>
  <p>하나</p>
  <p>둘</p>
</body>
```

다음 자바스크립트를 작성하여, `getElementsByTagName()`과 `querySelectorAll()`의 반환 타입과 `.length`를 콘솔에 각각 출력하세요.

```js
// 여기에 코드를 작성하세요
```

---

## 🟡 중급: DOM 변화와 컬렉션의 반응 방식 이해

---

### ✅ 문제 2. DOM 변경 후 `.length` 비교

#### 💡 목표

- HTMLCollection은 실시간으로 변하고, NodeList는 고정된다는 것을 확인

#### 📝 문제

문제 1의 코드 뒤에 다음을 추가하세요.

```js
const newP = document.createElement("p");
newP.textContent = "셋";
document.body.appendChild(newP);

// 두 컬렉션의 .length 값을 다시 출력
```

실행 결과를 예측하고, 왜 그런 결과가 나오는지 설명하세요.

---

### ✅ 문제 3. HTMLCollection 반복 중 DOM 조작 실험

#### 💡 목표

- 실시간 컬렉션을 반복하면서 DOM을 조작할 때의 위험성을 확인

#### 📝 문제

다음 HTML 구조가 주어졌습니다.

```html
<ul>
  <li>철수</li>
  <li>지민</li>
  <li>영희</li>
</ul>
```

다음 코드를 작성하여 `getElementsByTagName()`으로 모든 `<li>`를 순회하며 `.remove()` 해보세요.

```js
const list = document.getElementsByTagName("li");
for (let i = 0; i < list.length; i++) {
  list[i].remove();
}
```

결과는 어떠한가요? 어떤 요소가 남았나요? 이유를 설명해보세요.

---

## 🔴 고급: 안전한 반복 방법과 구조 설계

---

### ✅ 문제 4. 안전한 삭제 – 배열로 복사하기

#### 💡 목표

- `Array.from()`을 활용해 HTMLCollection을 정적인 배열로 만들어 안전하게 순회 삭제

#### 📝 문제

문제 3과 동일한 HTML에서 `Array.from()`을 이용하여 안전하게 모든 `<li>` 요소를 삭제하는 코드를 작성하세요.

---

### ✅ 문제 5. 뒤에서 앞으로 삭제하기

#### 💡 목표

- 인덱스 밀림 없이 HTMLCollection을 삭제하는 고전적이고 안전한 반복 방식 익히기

#### 📝 문제

문제 3의 HTML에서 이번엔 인덱스를 뒤에서부터 감소시키며 `.remove()` 하세요. 왜 이 방식이 안전한가요?

---

### ✅ 문제 6. NodeList의 정적 특성 실험

#### 💡 목표

- NodeList는 정적이며 반복 중 추가된 요소를 포함하지 않는다는 것을 직접 확인

#### 📝 문제

다음 HTML을 기준으로 코드를 작성하세요:

```html
<div class="item">A</div>
<div class="item">B</div>
```

`querySelectorAll(".item")`으로 가져온 NodeList를 순회하면서 `.item` 요소를 하나씩 더 추가하세요. 반복이 끝난 뒤 다음 두 가지를 비교하세요:

```js
console.log(staticItems.length); // NodeList
console.log(document.querySelectorAll(".item").length); // 실제 문서 기준
```

둘의 차이가 왜 발생하는지 설명해보세요.

---

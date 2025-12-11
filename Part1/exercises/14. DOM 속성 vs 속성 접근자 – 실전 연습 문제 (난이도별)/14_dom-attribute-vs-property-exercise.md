# 🧪 DOM 속성 vs 속성 접근자 – 실전 연습 문제 (난이도별)

---

## 🟢 초급

### ✅ 문제 1. `getAttribute()`와 `.value`의 차이 확인

다음 HTML에서 버튼 클릭 시 `getAttribute("value")`와 `input.value` 값을 각각 출력해보세요.

```html
<input id="input1" value="초기값" /> <button id="check">확인</button>
```

---

### ✅ 문제 2. `setAttribute()`로 입력 필드 값 바꾸기

위의 input에 대해 `"속성으로 설정됨"`이라는 값을 `setAttribute()`로 설정하고, `input.value`와 `getAttribute("value")`를 비교 출력하세요.

---

## 🟡 중급

### ✅ 문제 3. `.value`로 값 변경하기

위 input 요소의 `.value` 속성에 `"DOM으로 설정됨"`을 할당하고, 이후 `getAttribute("value")`와 다시 비교해 보세요.

---

### ✅ 문제 4. 사용자 입력값 확인

아래 HTML에서 사용자가 input에 `"직접 입력"`을 타이핑한 뒤, 버튼 클릭 시 `.value`와 `getAttribute()` 값의 차이를 로그로 출력해보세요.

```html
<input id="input2" value="초기" /> <button id="log">현재 값 확인</button>
```

---

## 🔴 고급

### ✅ 문제 5. `.checked` vs `getAttribute("checked")` 차이 분석

아래 HTML을 이용해 사용자가 체크박스를 클릭했을 때 DOM 속성과 HTML 속성의 차이를 비교해보세요.

```html
<input type="checkbox" id="checkMe" checked />
<button id="checkBtn">상태 확인</button>
```

---

### ✅ 문제 6. `setAttribute()`로 `checked` 변경 후 실제 상태 비교

위 체크박스에 대해 `setAttribute("checked", false)`를 실행한 후 `checkbox.checked` 값이 어떻게 되는지 확인해보세요. 브라우저 화면의 체크 상태와도 비교하세요.

---

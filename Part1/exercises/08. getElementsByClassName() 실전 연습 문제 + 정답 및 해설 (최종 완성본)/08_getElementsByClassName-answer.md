# 📘 `getElementsByClassName()` 실전 연습 문제 + 정답 및 해설 (최종 완성본)

---

## 🟢 초급 – 기본 선택과 구조 이해

---

### ✅ 문제 1. 클래스 이름으로 요소 전부 선택하기

#### 💡 목표

- `getElementsByClassName()`의 기본 사용법 이해
- 반환되는 HTMLCollection의 구조 파악

#### 📝 문제

아래 HTML에서 `menu-item` 클래스를 가진 요소들을 모두 선택해 콘솔에 출력해보세요.

```html
<ul>
  <li class="menu-item">Home</li>
  <li class="menu-item">About</li>
  <li class="menu-item">Contact</li>
</ul>
```

```js
// 여기에 코드를 작성하세요
```

---

### ✅ 문제 2. 특정 영역 내부에서만 클래스 선택

#### 💡 목표

- 특정 부모 요소를 기준으로 클래스 선택 범위를 제한하는 방법 익히기

#### 📝 문제

아래 HTML에서 `id="footer"` 내부에 있는 `menu-item`만 선택해보세요.

```html
<ul id="main">
  <li class="menu-item">Home</li>
  <li class="menu-item">About</li>
</ul>

<ul id="footer">
  <li class="menu-item">Terms</li>
  <li class="menu-item">Privacy</li>
</ul>
```

---

## 🟡 중급 – live 특성과 반복 문제 이해

---

### ✅ 문제 3. 새로운 요소 추가 시 자동 반영 확인

#### 💡 목표

- `getElementsByClassName()`이 반환하는 `HTMLCollection`이 live 구조임을 실습

#### 📝 문제

아래 HTML에 새로운 `menu-item` 요소를 동적으로 추가한 뒤, `.length`가 자동으로 증가되는지 확인해보세요.

```html
<ul>
  <li class="menu-item">Home</li>
  <li class="menu-item">About</li>
</ul>
```

---

### ✅ 문제 4. 공백으로 구분된 여러 클래스 조건 실험

#### 💡 목표

- 클래스 여러 개를 동시에 일치시켜야 선택된다는 조건 실습

#### 📝 문제

아래 HTML에서 `"menu-item active"` 두 클래스를 모두 가진 요소만 선택하세요.

```html
<li class="menu-item active">Home</li>
<li class="menu-item">About</li>
```

---

## 🔴 고급 – 배열 변환 및 반복 안전성 확보

---

### ✅ 문제 5. `forEach()` 사용을 위한 배열 변환

#### 💡 목표

- HTMLCollection을 `Array.from()`으로 변환해 안전하게 반복 처리

#### 📝 문제

아래 HTML에서 `menu-item` 클래스 요소들을 모두 콘솔에 출력하려고 할 때, `forEach()`를 사용해보세요.

```html
<ul>
  <li class="menu-item">HTML</li>
  <li class="menu-item">CSS</li>
  <li class="menu-item">JavaScript</li>
</ul>
```

---

### ✅ 문제 6. 반복 중 DOM 삭제 오류 방지

#### 💡 목표

- live 컬렉션 반복 중 요소를 제거할 때 생기는 오류를 `Array.from()`으로 해결

#### 📝 문제

위 문제 HTML에서 모든 `menu-item` 요소를 `.remove()` 하려고 할 때, `for` 반복문 대신 배열 변환을 통해 안정적으로 삭제하세요.

---

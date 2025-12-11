# 📘 DOM 완전 정복 실전 연습 – querySelector() & querySelectorAll()

---

## 🟢 문제 1: 첫 번째 카드의 제목만 출력하기

다음 HTML 구조에서, `querySelector()`를 사용해 **첫 번째 카드 내부의 제목(`h2`)만 선택**하고 그 텍스트를 출력해보세요.

```html
<div class="card">
  <h2 class="title">첫 번째 카드</h2>
</div>
<div class="card">
  <h2 class="title">두 번째 카드</h2>
</div>
```

---

## 🟢 문제 2: 모든 카드의 제목 출력하기

위 구조를 그대로 사용하여, `querySelectorAll()`을 활용해 **모든 카드의 `.title` 내용을 한 줄씩** 출력해보세요.

---

## 🟡 문제 3: 특정 클래스만 가진 요소 선택하기

아래와 같은 구조에서, 클래스가 **"menu-item active"** 모두 일치하는 요소만 선택해서 `"활성화된 메뉴: 홈"`이라는 문장이 출력되도록 하세요.

```html
<ul>
  <li class="menu-item active">홈</li>
  <li class="menu-item">소개</li>
  <li class="menu-item">연락처</li>
</ul>
```

---

## 🔴 문제 4: 구조 선택자 사용해 짝수번째 항목만 선택하기

아래 HTML에서 `querySelectorAll()`과 `:nth-of-type()` 구조 선택자를 사용해 **짝수 번째 메뉴 항목의 텍스트만 모두 출력**해보세요.

```html
<ul>
  <li class="menu-item">A</li>
  <li class="menu-item">B</li>
  <li class="menu-item">C</li>
  <li class="menu-item">D</li>
</ul>
```

---

## 🔴 문제 5: 특정 부모 내부에서만 선택하기

다음 HTML에서, `#footer` 안에 있는 링크만 선택하여 `"푸터에 있는 링크입니다"`라는 메시지를 출력해보세요.

```html
<div id="header">
  <a href="#">메인 링크</a>
</div>
<div id="footer">
  <a href="#">푸터 링크</a>
</div>
```

---

## 🧠 보너스 문제: 속성 선택자 활용하기

아래 HTML에서, `querySelector()`와 속성 선택자를 활용해 `data-role="main"` 속성을 가진 요소를 선택해 콘솔에 `"메인 콘텐츠입니다"`를 출력해보세요.

```html
<div data-role="main">메인 콘텐츠</div>
<div data-role="sidebar">사이드바</div>
```

---

# 📘 `createElement`, `appendChild`, `prepend`, `DocumentFragment` 실전 예제 문제 (난이도별)

---

## 🟢 초급

### ✅ 문제 1. `appendChild()`로 메뉴 항목 추가

아래 HTML에서 `"Contact"`라는 텍스트를 가진 `<li>` 요소를 JavaScript로 만들어, `ul#menu`의 **맨 뒤**에 추가하세요.

```html
<!DOCTYPE html>
<html>
  <body>
    <ul id="menu">
      <li>Home</li>
      <li>About</li>
    </ul>

    <script>
      // 여기에 코드를 작성하세요
    </script>
  </body>
</html>
```

---

### ✅ 문제 2. `prepend()`로 항목 맨 앞에 넣기

위와 동일한 HTML에서 `"News"`라는 `<li>` 요소를 만들어, `ul#menu`의 **맨 앞**에 추가해보세요.

---

## 🟡 중급

### ✅ 문제 3. 반복문으로 여러 항목 추가

`ul#menu`에 1부터 5까지의 숫자를 텍스트로 가진 `<li>` 요소를 반복문으로 생성하여, **순서대로** 추가하세요. `appendChild()`를 직접 사용해 반복문에서 DOM에 붙이세요.

---

### ✅ 문제 4. `DocumentFragment`로 성능 최적화된 추가

위 문제와 똑같이 숫자 1\~5의 `<li>` 요소를 만들되, 이번에는 `DocumentFragment`를 사용하여 브라우저가 중간에 렌더링하지 않도록 하세요. 반복문에서는 `fragment`에만 추가하고, 마지막에 한 번만 `appendChild()`를 사용해 DOM에 넣으세요.

---

## 🔴 고급

### ✅ 문제 5. 새로운 댓글 위에 추가 (`prepend()`)

다음 HTML에서 `"새 댓글입니다"`라는 텍스트를 가진 `<li>` 요소를 만들어, `ul#comments`의 **맨 위**에 추가하세요.

```html
<!DOCTYPE html>
<html>
  <body>
    <ul id="comments">
      <li>기존 댓글</li>
    </ul>

    <script>
      // 여기에 코드를 작성하세요
    </script>
  </body>
</html>
```

---

### ✅ 문제 6. 1000개 항목을 효율적으로 추가하는 두 방식 비교

`ul#menu`에 1000개의 `<li>` 요소를 `"항목 1"`부터 `"항목 1000"`까지 생성하여 추가한다고 가정했을 때,

1. 단순 반복문에서 `appendChild()`를 직접 DOM에 적용하는 코드
2. `DocumentFragment`를 활용해 최적화된 방식으로 추가하는 코드

두 방식을 각각 작성하고, 성능 차이가 왜 발생하는지도 코드 주석으로 설명하세요.

---

# 📘 `querySelector()` 실전 예제 문제 (난이도별)

---

## 🟢 초급

### ✅ 문제 1. 클래스 선택자로 버튼 선택

아래 HTML에서 클래스가 `btn`인 버튼을 선택하여 텍스트를 `"전송 완료"`로 바꾸세요.

```html
<!DOCTYPE html>
<html>
  <body>
    <button class="btn">전송</button>

    <script>
      // 여기에 코드를 작성하세요
    </script>
  </body>
</html>
```

---

### ✅ 문제 2. 아이디 선택자로 색상 변경

다음 HTML에서 `id="main-title"`인 요소를 선택하여 글자 색상을 빨간색으로 바꾸세요.

```html
<!DOCTYPE html>
<html>
  <body>
    <h1 id="main-title">DOM 학습</h1>

    <script>
      // 여기에 코드를 작성하세요
    </script>
  </body>
</html>
```

---

## 🟡 중급

### ✅ 문제 3. 태그 이름으로 첫 번째 단락 선택

아래 HTML에서 `<p>` 태그 중 첫 번째 요소를 선택하여 텍스트를 `"첫 문단입니다"`로 변경하세요.

```html
<!DOCTYPE html>
<html>
  <body>
    <p>문단 A</p>
    <p>문단 B</p>

    <script>
      // 여기에 코드를 작성하세요
    </script>
  </body>
</html>
```

---

### ✅ 문제 4. 조합 선택자 사용

다음 HTML에서 `id="container"` 내부의 클래스가 `highlight`인 요소를 선택하여 배경색을 노란색으로 변경하세요.

```html
<!DOCTYPE html>
<html>
  <body>
    <div id="container">
      <span class="highlight">중요한 텍스트</span>
      <span>일반 텍스트</span>
    </div>

    <script>
      // 여기에 코드를 작성하세요
    </script>
  </body>
</html>
```

---

## 🔴 고급

### ✅ 문제 5. 특정 영역 안의 링크 선택

아래 HTML에서 `id="menu"` 안에 있는 첫 번째 `<a>` 요소를 선택하여 `"메뉴 클릭"`이라는 텍스트로 변경하세요.

```html
<!DOCTYPE html>
<html>
  <body>
    <div id="menu">
      <a href="#">Home</a>
      <a href="#">About</a>
    </div>

    <script>
      // 여기에 코드를 작성하세요
    </script>
  </body>
</html>
```

---

### ✅ 문제 6. 일치하는 요소가 없을 때 안전하게 처리

다음 HTML에서 `.none`이라는 클래스를 가진 요소가 없을 경우에도 에러 없이 안전하게 "선택 실패"를 콘솔에 출력하도록 코드를 작성하세요.

```html
<!DOCTYPE html>
<html>
  <body>
    <h2>존재하지 않는 요소 테스트</h2>

    <script>
      // 여기에 코드를 작성하세요
    </script>
  </body>
</html>
```

---

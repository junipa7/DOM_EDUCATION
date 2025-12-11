## 🟢 초급 실전 예제

### 문제 1. 인사말 바꾸기

아래 HTML에 자바스크립트를 추가하여, 페이지가 열리면 `"환영합니다!"`라는 글자를 `"DOM 공부를 시작합니다!"`로 바꾸세요.

```html
<!DOCTYPE html>
<html>
  <body>
    <h1 id="greeting">환영합니다!</h1>

    <script>
      // 여기에 코드를 작성하세요
    </script>
  </body>
</html>
```

---

### 문제 2. 색상 바꾸기

다음 HTML에서 `id="box"`를 가진 요소의 배경색을 파란색으로 바꾸세요.

```html
<!DOCTYPE html>
<html>
  <body>
    <div id="box" style="width: 100px; height: 100px; background: gray;"></div>

    <script>
      // 여기에 코드를 작성하세요
    </script>
  </body>
</html>
```

---

## 🟡 중급 실전 예제

### 문제 3. 버튼 클릭 시 텍스트 변경

버튼을 클릭하면 `<p id="result">`의 내용을 `"클릭되었습니다!"`로 바꾸는 코드를 작성하세요.

```html
<!DOCTYPE html>
<html>
  <body>
    <button id="myBtn">눌러보세요</button>
    <p id="result">기다리는 중...</p>

    <script>
      // 여기에 코드를 작성하세요
    </script>
  </body>
</html>
```

---

### 문제 4. 입력값 반영하기

사용자가 입력창에 값을 입력하고 버튼을 누르면 `<h2>`의 텍스트가 입력한 내용으로 바뀌도록 만드세요.

```html
<!DOCTYPE html>
<html>
  <body>
    <input id="userInput" type="text" placeholder="입력하세요" />
    <button id="submitBtn">적용</button>
    <h2 id="output">여기에 결과가 나옵니다</h2>

    <script>
      // 여기에 코드를 작성하세요
    </script>
  </body>
</html>
```

---

## 🔴 고급 실전 예제

### 문제 5. 다크모드 버튼

버튼을 누르면 아래 요소의 배경색이 흰색 → 검정색, 글자색은 검정색 → 흰색으로 바뀌도록 다크모드 기능을 구현하세요. 다시 버튼을 누르면 원래대로 돌아오게 하세요.

```html
<!DOCTYPE html>
<html>
  <body>
    <div id="container" style="padding: 20px; background: white; color: black;">
      <p>다크모드를 토글해보세요!</p>
      <button id="darkModeBtn">다크모드</button>
    </div>

    <script>
      // 여기에 코드를 작성하세요
    </script>
  </body>
</html>
```

---

### 문제 6. 실시간 시계

페이지가 로드되면 `id="clock"`인 요소에 현재 시간을 매초마다 업데이트하여 보여주는 코드를 작성하세요. (힌트: `setInterval()` 사용)

```html
<!DOCTYPE html>
<html>
  <body>
    <h1 id="clock">00:00:00</h1>

    <script>
      // 여기에 코드를 작성하세요
    </script>
  </body>
</html>
```

---

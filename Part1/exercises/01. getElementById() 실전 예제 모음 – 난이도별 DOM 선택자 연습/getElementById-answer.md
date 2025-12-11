## 🟢 초급 실전 예제 정답

### ✅ 문제 1. 인사말 바꾸기

```html
<!DOCTYPE html>
<html>
  <body>
    <h1 id="greeting">환영합니다!</h1>

    <script>
      const title = document.getElementById("greeting");
      title.innerText = "DOM 공부를 시작합니다!";
    </script>
  </body>
</html>
```

---

### ✅ 문제 2. 색상 바꾸기

```html
<!DOCTYPE html>
<html>
  <body>
    <div id="box" style="width: 100px; height: 100px; background: gray;"></div>

    <script>
      const box = document.getElementById("box");
      box.style.backgroundColor = "blue";
    </script>
  </body>
</html>
```

---

## 🟡 중급 실전 예제 정답

### ✅ 문제 3. 버튼 클릭 시 텍스트 변경

```html
<!DOCTYPE html>
<html>
  <body>
    <button id="myBtn">눌러보세요</button>
    <p id="result">기다리는 중...</p>

    <script>
      const btn = document.getElementById("myBtn");
      const result = document.getElementById("result");

      btn.addEventListener("click", function () {
        result.innerText = "클릭되었습니다!";
      });
    </script>
  </body>
</html>
```

---

### ✅ 문제 4. 입력값 반영하기

```html
<!DOCTYPE html>
<html>
  <body>
    <input id="userInput" type="text" placeholder="입력하세요" />
    <button id="submitBtn">적용</button>
    <h2 id="output">여기에 결과가 나옵니다</h2>

    <script>
      const input = document.getElementById("userInput");
      const btn = document.getElementById("submitBtn");
      const output = document.getElementById("output");

      btn.addEventListener("click", function () {
        output.innerText = input.value;
      });
    </script>
  </body>
</html>
```

---

## 🔴 고급 실전 예제 정답

### ✅ 문제 5. 다크모드 버튼

```html
<!DOCTYPE html>
<html>
  <body>
    <div id="container" style="padding: 20px; background: white; color: black;">
      <p>다크모드를 토글해보세요!</p>
      <button id="darkModeBtn">다크모드</button>
    </div>

    <script>
      const container = document.getElementById("container");
      const btn = document.getElementById("darkModeBtn");

      let isDark = false;

      btn.addEventListener("click", function () {
        if (isDark) {
          container.style.backgroundColor = "white";
          container.style.color = "black";
          isDark = false;
        } else {
          container.style.backgroundColor = "black";
          container.style.color = "white";
          isDark = true;
        }
      });
    </script>
  </body>
</html>
```

---

### ✅ 문제 6. 실시간 시계

```html
<!DOCTYPE html>
<html>
  <body>
    <h1 id="clock">00:00:00</h1>

    <script>
      const clock = document.getElementById("clock");

      function updateTime() {
        const now = new Date();
        const hours = String(now.getHours()).padStart(2, "0");
        const minutes = String(now.getMinutes()).padStart(2, "0");
        const seconds = String(now.getSeconds()).padStart(2, "0");
        clock.innerText = `${hours}:${minutes}:${seconds}`;
      }

      // 처음 1번 실행하고
      updateTime();
      // 이후 1초마다 갱신
      setInterval(updateTime, 1000);
    </script>
  </body>
</html>
```

---

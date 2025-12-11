# 📘 `getElementsByTagName()` 실전 예제 문제 (난이도별)

---

## 🟢 초급

### ✅ 문제 1. 문단 색상 바꾸기

다음 HTML에서 모든 `<p>` 태그의 글자 색을 초록색으로 바꾸세요.

```html
<!DOCTYPE html>
<html>
  <body>
    <p>첫 번째 문장</p>
    <p>두 번째 문장</p>
    <p>세 번째 문장</p>

    <script>
      // 여기에 코드를 작성하세요
    </script>
  </body>
</html>
```

---

### ✅ 문제 2. 이미지 개수 세기

아래 HTML에서 `<img>` 태그의 개수를 콘솔에 출력하세요.

```html
<!DOCTYPE html>
<html>
  <body>
    <img src="img1.jpg" />
    <img src="img2.jpg" />
    <img src="img3.jpg" />

    <script>
      // 여기에 코드를 작성하세요
    </script>
  </body>
</html>
```

---

## 🟡 중급

### ✅ 문제 3. 리스트 항목에 번호 붙이기

다음 HTML에서 모든 `<li>` 항목 앞에 순서를 숫자로 붙이세요.
예: "1. 사과", "2. 바나나", ...

```html
<!DOCTYPE html>
<html>
  <body>
    <ul>
      <li>사과</li>
      <li>바나나</li>
      <li>딸기</li>
    </ul>

    <script>
      // 여기에 코드를 작성하세요
    </script>
  </body>
</html>
```

---

### ✅ 문제 4. 특정 영역 안의 span만 스타일 변경

다음 HTML에서 `id="box"` 안에 있는 모든 `<span>` 태그의 글자 색을 파란색으로 바꾸세요.

```html
<!DOCTYPE html>
<html>
  <body>
    <div id="box">
      <span>첫 번째</span>
      <span>두 번째</span>
    </div>

    <div>
      <span>외부 첫 번째</span>
      <span>외부 두 번째</span>
    </div>

    <script>
      // 여기에 코드를 작성하세요
    </script>
  </body>
</html>
```

---

## 🔴 고급

### ✅ 문제 5. 테이블의 모든 셀 배경색 변경

아래 HTML에서 모든 `<td>` 셀의 배경색을 연노랑(`lightyellow`)으로 바꾸세요.

```html
<!DOCTYPE html>
<html>
  <body>
    <table border="1">
      <tr>
        <td>A1</td>
        <td>A2</td>
      </tr>
      <tr>
        <td>B1</td>
        <td>B2</td>
      </tr>
    </table>

    <script>
      // 여기에 코드를 작성하세요
    </script>
  </body>
</html>
```

---

### ✅ 문제 6. `for...of`를 활용한 반복

다음 HTML에서 모든 `<h2>` 요소의 글자를 대문자로 변환하세요 (`innerText.toUpperCase()` 활용).

```html
<!DOCTYPE html>
<html>
  <body>
    <h2>안녕하세요</h2>
    <h2>javascript</h2>
    <h2>Dom 조작</h2>

    <script>
      // 여기에 코드를 작성하세요
    </script>
  </body>
</html>
```

---

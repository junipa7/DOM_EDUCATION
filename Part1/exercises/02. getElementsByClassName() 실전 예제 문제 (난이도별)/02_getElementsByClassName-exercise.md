# 📘 `getElementsByClassName()` 실전 예제 문제 (난이도별)

---

## 🟢 초급

### ✅ 문제 1. 모든 항목을 빨간색으로

다음 HTML에서 `class="item"`인 요소들을 모두 선택하고, 글자 색을 빨간색으로 바꾸세요.

```html
<!DOCTYPE html>
<html>
  <body>
    <p class="item">항목 1</p>
    <p class="item">항목 2</p>
    <p class="item">항목 3</p>

    <script>
      // 여기에 코드를 작성하세요
    </script>
  </body>
</html>
```

---

### ✅ 문제 2. 항목 개수 세기

위와 동일한 HTML에서 `class="item"`을 가진 요소의 **개수**를 콘솔에 출력해보세요.

---

## 🟡 중급

### ✅ 문제 3. 모든 항목에 인덱스 붙이기

다음 HTML에서 `class="line"`인 각 요소의 텍스트 앞에 번호를 붙이세요.
예: `"1. 첫 줄"` `"2. 두 번째 줄"` `"3. 세 번째 줄"`

```html
<!DOCTYPE html>
<html>
  <body>
    <div class="line">첫 줄</div>
    <div class="line">두 번째 줄</div>
    <div class="line">세 번째 줄</div>

    <script>
      // 여기에 코드를 작성하세요
    </script>
  </body>
</html>
```

---

### ✅ 문제 4. 마우스 오버 시 강조

`class="highlight"`인 모든 요소에 대해, 마우스를 올리면 배경색이 노란색으로 바뀌도록 하세요.

```html
<!DOCTYPE html>
<html>
  <body>
    <span class="highlight">JavaScript</span>
    <span class="highlight">DOM</span>
    <span class="highlight">HTML</span>

    <script>
      // 여기에 코드를 작성하세요
    </script>
  </body>
</html>
```

---

## 🔴 고급

### ✅ 문제 5. 버튼 클릭 시 다중 스타일 변경

버튼을 클릭하면 `class="box"`인 모든 요소의 배경색을 파란색, 글자색을 흰색으로 변경하세요.

```html
<!DOCTYPE html>
<html>
  <body>
    <div class="box">A</div>
    <div class="box">B</div>
    <div class="box">C</div>

    <button id="apply">변경</button>

    <script>
      // 여기에 코드를 작성하세요
    </script>
  </body>
</html>
```

---

### ✅ 문제 6. 특정 class가 있는 요소만 변경

다음 예시에서 `class="tag hot"`처럼 class가 여러 개인 요소 중, `"hot"`이라는 클래스가 포함된 요소만 선택하여, 테두리를 빨간색으로 바꾸세요.

```html
<!DOCTYPE html>
<html>
  <body>
    <span class="tag">CSS</span>
    <span class="tag hot">JavaScript</span>
    <span class="tag hot">React</span>
    <span class="tag">HTML</span>

    <script>
      // 여기에 코드를 작성하세요
    </script>
  </body>
</html>
```

---

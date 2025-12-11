# 📘 `querySelectorAll()` 실전 예제 문제 (난이도별)

---

## 🟢 초급

### ✅ 문제 1. 클래스가 `box`인 요소 모두에 테두리 적용

아래 HTML에서 클래스가 `box`인 모든 요소에 빨간색 테두리(`2px solid red`)를 적용하세요.

```html
<!DOCTYPE html>
<html>
  <body>
    <div class="box">1</div>
    <div class="box">2</div>
    <div class="box">3</div>

    <script>
      // 여기에 코드를 작성하세요
    </script>
  </body>
</html>
```

---

### ✅ 문제 2. 모든 `<p>` 태그에 번호 붙이기

모든 `<p>` 태그 앞에 `"1. "` `"2. "` 형식으로 순서를 붙이세요.

```html
<!DOCTYPE html>
<html>
  <body>
    <p>Apple</p>
    <p>Banana</p>
    <p>Cherry</p>

    <script>
      // 여기에 코드를 작성하세요
    </script>
  </body>
</html>
```

---

## 🟡 중급

### ✅ 문제 3. 특정 영역 내부에서만 선택

아래 HTML에서 `id="section1"` 내부에 있는 `.item` 클래스 요소들만 선택해 배경색을 연노랑(`lightyellow`)으로 바꾸세요.

```html
<!DOCTYPE html>
<html>
  <body>
    <div id="section1">
      <p class="item">Item 1</p>
      <p class="item">Item 2</p>
    </div>

    <div id="section2">
      <p class="item">Item A</p>
      <p class="item">Item B</p>
    </div>

    <script>
      // 여기에 코드를 작성하세요
    </script>
  </body>
</html>
```

---

### ✅ 문제 4. input type="text"만 선택

다음 HTML에서 `<input type="text">` 요소들만 선택하여 배경색을 연하늘색(`lightblue`)으로 바꾸세요.

```html
<!DOCTYPE html>
<html>
  <body>
    <input type="text" placeholder="이름" />
    <input type="password" placeholder="비밀번호" />
    <input type="text" placeholder="주소" />

    <script>
      // 여기에 코드를 작성하세요
    </script>
  </body>
</html>
```

---

## 🔴 고급

### ✅ 문제 5. `forEach()`로 클릭 이벤트 일괄 등록

클래스가 `btn`인 버튼들이 여러 개 있을 때, 각 버튼을 클릭하면 `"클릭됨"`이라는 알림(alert)이 뜨도록 하세요.

```html
<!DOCTYPE html>
<html>
  <body>
    <button class="btn">버튼 1</button>
    <button class="btn">버튼 2</button>
    <button class="btn">버튼 3</button>

    <script>
      // 여기에 코드를 작성하세요
    </script>
  </body>
</html>
```

---

### ✅ 문제 6. 일치하는 요소가 없을 때도 안전하게 처리

클래스가 `none`인 요소가 없더라도, `querySelectorAll(".none")`을 사용한 뒤 **NodeList가 비어 있는지 확인하고**, 비어 있다면 `"선택된 요소 없음"`을 콘솔에 출력하세요.

```html
<!DOCTYPE html>
<html>
  <body>
    <h2>선택자 실패 테스트</h2>

    <script>
      // 여기에 코드를 작성하세요
    </script>
  </body>
</html>
```

---

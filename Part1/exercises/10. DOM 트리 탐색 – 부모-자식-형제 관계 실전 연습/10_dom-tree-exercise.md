# 📘 DOM 트리 탐색 – 부모/자식/형제 관계 실전 연습

---

### 🟢 문제 1: 버튼의 부모 요소 찾기

다음 HTML 구조에서 `<button>` 요소를 선택한 뒤, 그 부모 요소의 `id`를 콘솔에 출력하세요.

```html
<div id="card">
  <button>Click me</button>
</div>
```

---

### 🟢 문제 2: 버튼 앞 형제 요소 찾기

다음 HTML에서 버튼의 **바로 앞에 있는 요소의 텍스트**를 출력해보세요.

```html
<div>
  <p>설명입니다.</p>
  <button>Click</button>
</div>
```

---

### 🟡 문제 3: 부모 요소의 모든 자식 요소 순회하기

다음 HTML에서 버튼의 부모 요소를 기준으로, **그 안에 있는 모든 자식 요소들의 태그 이름(tagName)을 순서대로 출력**하세요.

```html
<div id="box">
  <h2>제목</h2>
  <p>내용</p>
  <button>확인</button>
</div>
```

---

### 🔴 문제 4: 요소 간 이동을 통한 값 변경

다음 구조에서 버튼을 클릭했을 때, **그 버튼과 같은 카드 안에 있는 이미지의 `src` 값을 `"new.jpg"`로 변경**하는 코드를 작성하세요.

```html
<div class="card">
  <img src="old.jpg" />
  <button>변경</button>
</div>
<div class="card">
  <img src="old.jpg" />
  <button>변경</button>
</div>
```

※ 단, **모든 버튼이 아닌, 클릭한 그 버튼의 카드 안에서만** 이미지가 바뀌어야 합니다.

---

### 🧠 보너스 문제: 자식 vs 모든 노드 구분

다음 HTML 구조에서 `.children`과 `.childNodes`를 사용해 어떤 결과가 나오는지 예측해보고, 실제로 코드를 작성하여 각각의 길이와 내용을 출력해보세요.

```html
<ul id="fruits">
  <li>Apple</li>
  <li>Banana</li>
</ul>
```

---

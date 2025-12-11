function buildRenderTree(domNode, cssOM) {
  if (!domNode || domNode.type !== "element") return null;

  const matchedRule = cssOM.find((rule) => rule.selector === domNode.tag);
  const computedStyle = {};

  if (matchedRule) {
    matchedRule.declarations.forEach((decl) => {
      computedStyle[decl.property] = decl.value;
    });
  }

  const renderNode = {
    tag: domNode.tag,
    style: computedStyle,
    children: [],
  };

  domNode.children.forEach((child) => {
    const renderedChild = buildRenderTree(child, cssOM);
    if (renderedChild) {
      renderNode.children.push(renderedChild);
    }
  });

  return renderNode;
}

const domTree = {
  type: "element",
  tag: "div",
  children: [
    {
      type: "element",
      tag: "h1",
      children: [],
    },
    {
      type: "element",
      tag: "p",
      children: [],
    },
  ],
};

const cssOM = [
  {
    selector: "h1",
    declarations: [
      { property: "color", value: "blue" },
      { property: "font-size", value: "24px" },
    ],
  },
  {
    selector: "p",
    declarations: [{ property: "color", value: "gray" }],
  },
];

console.log("\n✅ 렌더 트리 생성 시작");
const renderTree = buildRenderTree(domTree, cssOM);
console.dir(renderTree, { depth: null });

// HTML → DOM 트리
// CSS  → CSSOM 트리

// DOM + CSSOM (필터링 + 스타일 계산)
// ↓
// Render Tree (시각적 요소만 포함된 별도 구조)
// ↓
// Layout (위치와 크기 계산)
// ↓
// Paint (픽셀 그리기)

/*
✅ 렌더 트리 생성 시작
{
  tag: 'div',
  style: {},
  children: [
    {
      tag: 'h1',
      style: { color: 'blue', 'font-size': '24px' },
      children: []
    },
    {
      tag: 'p',
      style: { color: 'gray' },
      children: []
    }
  ]
}
*/

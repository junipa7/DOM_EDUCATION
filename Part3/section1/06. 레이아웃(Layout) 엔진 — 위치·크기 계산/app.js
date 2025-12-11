function layout(renderNode, parentX = 0, parentY = 0) {
  const fontSize = parseInt(renderNode.style["font-size"] || "16");
  const height = fontSize;
  const width = 300;

  const x = parentX;
  const y = parentY;

  renderNode.layout = { x, y, width, height };

  let currentY = y + height;

  renderNode.children.forEach((child) => {
    layout(child, x, currentY);
    currentY += child.layout.height;
  });

  return renderNode;
}

const renderTree = {
  tag: "div",
  style: {},
  children: [
    {
      tag: "h1",
      style: { color: "blue", "font-size": "24px" },
      children: [],
    },
    {
      tag: "p",
      style: { color: "gray" },
      children: [],
    },
  ],
};

console.log("\n📐 레이아웃 계산 시작");
const layoutedTree = layout(renderTree);
console.dir(layoutedTree, { depth: null });

/*
📐 레이아웃 계산 시작
{
  tag: 'div',
  style: {},
  layout: { x: 0, y: 0, width: 300, height: 16 },
  children: [
    {
      tag: 'h1',
      style: { color: 'blue', 'font-size': '24px' },
      layout: { x: 0, y: 16, width: 300, height: 24 },
      children: []
    },
    {
      tag: 'p',
      style: { color: 'gray' },
      layout: { x: 0, y: 40, width: 300, height: 16 },
      children: []
    }
  ]
}
*/

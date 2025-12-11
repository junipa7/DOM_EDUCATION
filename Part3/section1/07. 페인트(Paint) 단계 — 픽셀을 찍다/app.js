function paint(renderNode) {
  const { x, y, width, height } = renderNode.layout;
  const color = renderNode.style.color || "black";

  console.log(
    `🖌️ ${renderNode.tag} → (${x}, ${y}, ${width}x${height}) color: ${color}`
  );

  renderNode.children.forEach((child) => paint(child));
}

const layoutedTree = {
  tag: "div",
  style: {},
  layout: { x: 0, y: 0, width: 300, height: 16 },
  children: [
    {
      tag: "h1",
      style: { color: "blue", "font-size": "24px" },
      layout: { x: 0, y: 16, width: 300, height: 24 },
      children: [],
    },
    {
      tag: "p",
      style: { color: "gray" },
      layout: { x: 0, y: 40, width: 300, height: 16 },
      children: [],
    },
  ],
};

console.log("\n🎨 페인트 시작");
paint(layoutedTree);

/*
🎨 페인트 시작
🖌️ div → (0, 0, 300x16) color: black
🖌️ h1 → (0, 16, 300x24) color: blue
🖌️ p → (0, 40, 300x16) color: gray
*/

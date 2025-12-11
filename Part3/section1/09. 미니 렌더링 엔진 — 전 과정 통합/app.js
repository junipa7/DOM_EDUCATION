function parseSimpleHTML(html) {
  const tagRegex = /<(\w+)>|<\/(\w+)>|([^<>]+)/g;
  const root = { type: "Document", children: [] };
  const stack = [root];

  let match;
  while ((match = tagRegex.exec(html))) {
    if (match[1]) {
      const node = { type: "Element", tag: match[1], children: [] };
      stack[stack.length - 1].children.push(node);
      stack.push(node);
    } else if (match[2]) {
      stack.pop();
    } else if (match[3].trim()) {
      const node = { type: "Text", content: match[3].trim() };
      stack[stack.length - 1].children.push(node);
    }
  }

  return root;
}

function parseCSS(cssText) {
  const ruleRegex = /(\w+)\s*\{([^}]+)\}/g;
  const styleSheet = [];
  let match;

  while ((match = ruleRegex.exec(cssText))) {
    console.log("\n🎯 새로운 규칙 발견:");
    console.log("전체 match:", match);

    const selector = match[1];
    const declarationsBlock = match[2];

    console.log(`선택자: ${selector}`);
    console.log(`선언부: ${declarationsBlock}`);

    const declarations = declarationsBlock
      .split(";")
      .filter(Boolean)
      .map((decl) => {
        const [property, value] = decl.split(":").map((s) => s.trim());
        console.log(`  속성: ${property}, 값: ${value}`);
        return { property, value };
      });

    const rule = { selector, declarations };
    styleSheet.push(rule);

    console.log("\n📦 현재 CSSOM 트리 상태:");
    console.dir(JSON.stringify(styleSheet, null, 2));
  }

  return styleSheet;
}

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

function paint(renderNode) {
  const { x, y, width, height } = renderNode.layout;
  const color = renderNode.style.color || "black";

  console.log(
    `🖌️ ${renderNode.tag} → (${x}, ${y}, ${width}x${height}) color: ${color}`
  );

  renderNode.children.forEach((child) => paint(child));
}

function composite(layers) {
  console.log("\n🧩 컴포지팅 시작:");

  layers.sort((a, b) => a.zIndex - b.zIndex);

  layers.forEach((layer) => {
    console.log(`📦 레이어 ${layer.name} (zIndex=${layer.zIndex})`);
    layer.commands.forEach((cmd) => {
      console.log(`   ↳ ${cmd}`);
    });
  });

  console.log("✅ 모든 레이어가 하나의 화면으로 합성되었습니다.\n");
}

function miniRenderer(html, css) {
  const dom = parseHTML(html);
  const cssom = parseCSS(css);
  const renderTree = buildRenderTree(dom, cssom);
  renderTree.layout();
  renderTree.paint();
  renderTree.composite();
}

// miniRenderer가 부르는 이름을 만족시키기 위한 별칭
function parseHTML(html) {
  return parseSimpleHTML(html);
}

// DOM 타입/루트 정규화: "Element" → "element" 로 맞춰 주고, 텍스트 노드는 통과
function normalizeDOMTypes(node) {
  if (!node) return null;

  // 깊은 복사 + 타입 변환
  const clone = { ...node };
  if (clone.type === "Element") clone.type = "element";
  if (clone.type === "Text") clone.type = "text";
  if (Array.isArray(clone.children)) {
    clone.children = clone.children.map(normalizeDOMTypes).filter(Boolean);
  }
  return clone;
}

// Document 루트에서 실제 첫 번째 요소 노드(<html>/<div> 등)를 찾아 반환
function pickFirstElementChild(documentNode) {
  if (!documentNode || !Array.isArray(documentNode.children)) return null;
  for (const child of documentNode.children) {
    if (child.type === "Element" || child.type === "element") return child;
  }
  return null;
}

// paint 단계의 출력을 합성 명령으로 모으기
function collectPaintCommands(renderNode, acc = []) {
  const { x, y, width, height } = renderNode.layout;
  const color = renderNode.style.color || "black";
  acc.push(
    `draw ${renderNode.tag} at (${x}, ${y}, ${width}x${height}) color=${color}`
  );
  renderNode.children.forEach((c) => collectPaintCommands(c, acc));
  return acc;
}

/********************************************
 * miniRenderer 테스트 러너 *
 ********************************************/
function miniRendererTest(html, css) {
  console.log(
    "\n================= 🧪 miniRenderer TEST START ================="
  );
  // 1) HTML/CSS 파싱
  const rawDOM = parseHTML(html);
  const cssom = parseCSS(css);

  // 2) DOM 정규화 + 루트 요소 선택
  const rootElement = pickFirstElementChild(rawDOM);
  if (!rootElement) {
    throw new Error("루트 요소를 찾을 수 없습니다. (예: <div> ... )");
  }
  const normalizedRoot = normalizeDOMTypes(rootElement);

  console.log("\n🌳 정규화된 DOM 루트:");
  console.dir(JSON.stringify(normalizedRoot, null, 2));

  // 3) 렌더 트리 생성
  const renderTree = buildRenderTree(normalizedRoot, cssom);
  console.log("\n🧱 Render Tree:");
  console.dir(JSON.stringify(renderTree, null, 2));

  // 4) 레이아웃 계산
  layout(renderTree);
  console.log("\n📐 Layout 결과:");
  console.dir(JSON.stringify(renderTree, null, 2));

  // 5) 페인트 (콘솔 로그)
  console.log("\n🎨 Paint 로그:");
  paint(renderTree);

  // 6) 합성(Composite) – 페인트 명령을 하나의 레이어로 모아 합성
  const commands = collectPaintCommands(renderTree);
  const layers = [{ name: "main", zIndex: 0, commands }];
  composite(layers);

  console.log(
    "================== ✅ miniRenderer TEST END ==================\n"
  );
}

/**************************************
 * 샘플 입력으로 실제 테스트 실행    *
 **************************************/
const sampleHTML = `
<div>
  <h1>Hello</h1>
  <p>World</p>
</div>
`;

const sampleCSS = `
div { color: red; font-size: 24px; }
h1  { color: blue; font-size: 32px; }
p   { color: green; font-size: 16px; }
`;

// 실행
miniRendererTest(sampleHTML, sampleCSS);

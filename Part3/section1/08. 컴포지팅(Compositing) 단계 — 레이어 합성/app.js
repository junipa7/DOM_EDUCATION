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

const layers = [
  {
    name: "background",
    zIndex: 0,
    commands: [
      "fill rect (0, 0, 300x100) with #ffffff",
      "draw image banner.png at (0, 0)",
    ],
  },
  {
    name: "content",
    zIndex: 1,
    commands: [
      "draw h1 at (0, 100) with blue text",
      "draw p at (0, 130) with gray text",
    ],
  },
  {
    name: "modal",
    zIndex: 100,
    commands: [
      "fill rect (50, 50, 200x100) with rgba(0,0,0,0.5)",
      "draw button at (100, 100) with white text",
    ],
  },
];

composite(layers);

/* 
🧩 컴포지팅 시작:
📦 레이어 background (zIndex=0)
   ↳ fill rect (0, 0, 300x100) with #ffffff
   ↳ draw image banner.png at (0, 0)
📦 레이어 content (zIndex=1)
   ↳ draw h1 at (0, 100) with blue text
   ↳ draw p at (0, 130) with gray text
📦 레이어 modal (zIndex=100)
   ↳ fill rect (50, 50, 200x100) with rgba(0,0,0,0.5)
   ↳ draw button at (100, 100) with white text
✅ 모든 레이어가 하나의 화면으로 합성되었습니다.
*/



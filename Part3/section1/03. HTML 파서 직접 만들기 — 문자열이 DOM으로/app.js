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

const html = `<body><h1>Hello</h1><p>World</p></body>`;
console.log(JSON.stringify(parseSimpleHTML(html), null, 2));

// 입력 문자열:
// <body><h1>Hello</h1><p>World</p></body>

// 스택 상태:
// [Document]

// DOM 구조:
// Document
// └── (비어 있음)

// Document
// └── body
//     ├── h1
//     │   └── "Hello"
//     └── p
//         └── "World"

/*
{
  "type": "Document",
  "children": [
    {
      "type": "Element",
      "tag": "body",
      "children": [
        {
          "type": "Element",
          "tag": "h1",
          "children": [
            { "type": "Text", "content": "Hello" }
          ]
        },
        {
          "type": "Element",
          "tag": "p",
          "children": [
            { "type": "Text", "content": "World" }
          ]
        }
      ]
    }
  ]
}
*/

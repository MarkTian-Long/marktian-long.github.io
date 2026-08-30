# Blog 视觉发布规范

`Leo Editorial v1` 是思考碎片博客的新文章视觉系统。它服务于理解、识别和分享，不把文章变成插画画廊。主页与 Blog 列表继续保持纯文字；图片只出现在文章页、OG/Twitter 分享预览和结构化数据中。

## 1. 视觉语言：Leo Editorial v1

### 色彩

| 角色 | 建议色 | 用法 |
|------|--------|------|
| 深海军蓝 | `#080c18` | 主背景与大面积安静空间 |
| 陶土橙 | `#d97757` / `#c96442` | 核心对象、连接和少量视觉重心 |
| 暖米白 | `#f5f4ed` / `#faf9f5` | 纸张、节点和柔和高光 |
| 支撑蓝 | `#4f8fff` / `#2563eb` | 只用于次级关系，不与陶土橙争夺焦点 |

- 整体应冷静、分析性、克制而有温度。
- 优先使用哑光纸张、纸雕浮层或轻微 3D 深度；避免玻璃拟态、强荧光与高饱和渐变。
- 深浅主题共用同一张图，因此边缘和主体不能依赖纯黑或纯白背景才能辨认。

### 构图

- 每张图只表达一个核心机制，使用 1–3 个主要形体；必要的模块关系应一眼可读。
- 封面采用宽幅 `1.91:1` 构图，关键主体和连接保留在中央 75% 安全区，允许稳定裁切为 1200 × 630。
- 使用足够留白和清晰层级；不以大量小图标复述文章目录。
- 图像不能包含正文标题、标签、字母、数字、Logo、商标、水印或 UI 截图。

### 禁止母题

除非文章本身在批判这些视觉陈词，否则避免：发光大脑、人形机器人头、霓虹赛博朋克、装饰性电路板、握手商务照、火箭起飞、无意义数据流、密集微型模块和图库照片感。

## 2. 资产规格

| 类型 | 必需性 | 最终路径 | 输出格式 | 尺寸 | 大小上限 | 加载策略 |
|------|--------|----------|----------|------|----------|----------|
| 文章封面 | 所有非历史豁免的新文章必需 | `assets/images/blog/<slug>/cover.jpg` | JPEG | 1200 × 630 | 350 KB | eager + high priority |
| 正文图 | 按解释价值选择 0–2 张 | `assets/images/blog/<slug>/<descriptive-name>.webp` | WebP | 1280 × 720 | 250 KB | lazy |

- 最终文件只能由 `scripts/prepare-blog-image.js` 生成；脚本会中心裁切、去除源元数据、控制质量和大小，并拒绝覆盖现有文件。
- 正文图文件名必须用能说明机制的 kebab-case，例如 `context-feedback-loop.webp`；禁止 `image.webp`、`figure-1.webp` 等通用名。
- 候选图保存在被 Git 忽略的 `build/blog-image-work/<slug>/`，只有选中的规范化成品进入 `assets/images/blog/<slug>/`。

## 3. 正文是否配图：0–2 张决策门

正文图默认不是必需品。逐张回答以下问题：

1. 这张图是否能解释文字难以快速说明的关系、顺序、边界、分层或反馈回路？
2. 删除它后，读者是否需要明显更多认知成本才能理解对应段落？
3. 它是否提供了与封面不同的信息，而不是装饰或重复标题？

只有三项均为“是”时才保留。通常：

- 0 张：文章以判断、论证或案例为主，文字和表格已足够。
- 1 张：存在一个关键系统、流程或机制需要建立共同心智模型。
- 2 张：两个机制彼此独立且都对结论必要；不得把一张图拆成两张来凑数量。

## 4. Alt 与 caption

- `alt` 描述图中与论点相关的对象和关系，让看不到图的读者获得等价信息；不用“图片展示了”“封面图”等套话，不重复文章标题。
- `caption` 只用于正文图，以一个完整、简洁的句子说明读者应从图中带走什么；不写素材来源式占位语或 SEO 关键词堆砌。
- `alt` 和 `caption` 均为去除首尾空格后的 1–160 个字符。
- Markdown 中的 alt、caption 必须与 `posts-meta.json` 完全一致；生成器会拒绝不一致、未登记、远程、跨文章或路径穿越图片。

正文图只接受独立成行的形式：

```markdown
![Context and feedback form a reusable loop](../../assets/images/blog/your-slug/context-feedback-loop.webp "The loop turns each completed task into reusable context for the next one.")
```

## 5. 元数据契约

`tools/blog/data/posts-meta.json` 使用版本 4。根级 `image_contract.legacy_without_visuals` 只列出允许没有 `visuals` 的历史文章；新文章不得加入该列表。新文章示例：

```json
{
  "slug": "your-slug",
  "visuals": {
    "cover": {
      "src": "assets/images/blog/your-slug/cover.jpg",
      "alt": "A concise description of the central visual mechanism",
      "width": 1200,
      "height": 630
    },
    "inline": []
  }
}
```

同一封面会被文章页、Open Graph、Twitter large image card 和 JSON-LD 共用。旧文章在没有单篇视觉资产时继续使用全站 `assets/images/og-cover.png` 作为分享回退，不补封面、不改正文。

## 6. 生成与选择

默认使用 Codex 内置 `imagegen`，该模式不需要也不得向用户索取 API Key。只有用户明确选择 CLI/API 方案后，才允许使用外部回退；不得因内置生成失败而静默切换模式。

每篇文章先生成一个候选，检查核心隐喻、中央安全区、几何完整性、意外文字/符号、水印和双主题适配。若只存在一个明确问题，允许一次只针对该问题的定向修订；不要开放式批量生成。内置生成仍失败时，新文章发布被阻断，并如实报告原因。

统一提示词骨架：

```text
Use case: stylized-concept
Asset type: blog header image
Primary request: editorial concept illustration for an article about <core judgment>
Scene/backdrop: deep navy field with restrained matte texture
Subject: one visual metaphor representing <mechanism>, using 1-3 large forms
Style/medium: sophisticated editorial illustration, paper-cut relief and matte 3D finish
Composition/framing: wide 1.91:1 composition; important subject inside the central safe area
Lighting/mood: calm, analytical, quietly confident
Color palette: deep navy, clay orange, warm off-white, minimal supporting blue
Constraints: no text; no letters; no numbers; no logos; no trademarks; no watermark
Avoid: glowing brain, humanoid robot head, neon cyberpunk, decorative circuit board, tiny clutter
```

## 7. 发布步骤与检查

```powershell
node scripts/prepare-blog-image.js --slug <slug> --role cover --input build/blog-image-work/<slug>/candidate.png
node scripts/prepare-blog-image.js --slug <slug> --role inline --name <descriptive-name> --input build/blog-image-work/<slug>/inline-candidate.png
node scripts/check-blog-images.js
node tools/blog/generate-post.js --write docs/blog/<slug>.md tools/blog/posts/<slug>.html
node scripts/generate-search-assets.js --write
node scripts/check-search-foundation.js
```

发布前还必须构建并检查 public dist，并在桌面/移动、浅色/深色状态下截图复核文章页；同时确认图片加载失败时 alt 可读、布局不坍塌。交付报告应列出最终资产路径、最终提示词、生成模式、正文图选择结论和线上封面 URL。

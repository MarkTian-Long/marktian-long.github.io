# Blog 视觉发布规范

版本：1.2｜更新：2026-10-15

`Leo Editorial v1.1` 是思考碎片博客的可选视觉指南。文章可以完全以文字、表格和引用完成表达；只有图片确实能帮助理解、识别或分享时才使用。主页与 Blog 列表继续保持纯文字；如有图片，只出现在文章页、OG/Twitter 分享预览和结构化数据中。

**职责分工。** 本文件维护图片的视觉语言、同篇一致性、制作方式、资产规格及预览验收；[图表规范](governance/blog-charts-spec.md)维护图表必要性、分类/坐标/箭头的语义及图文关系；[Writing Guide](WRITING_GUIDE.md)维护 Markdown 与网站发布契约。SOP 继续负责写作阶段路由，Checklist 调用这些规范验收，不在多个文件重复维护配色、字号或图片处理细则。

## 1. 视觉语言：Leo Editorial v1.1

### 色彩

| 角色 | 建议色 | 用法 |
|------|--------|------|
| 深海军蓝 | `#080c18` | 浅底图的主要文字；封面或明确选用的深色图的主背景 |
| 陶土橙 | `#d97757` / `#c96442` | 核心对象、连接和少量视觉重心；根据背景选择清晰的深浅版本 |
| 暖米白 | `#f5f4ed` / `#faf9f5` | 正文解释图的默认底色、纸张、节点和柔和高光 |
| 支撑蓝 | `#4f8fff` / `#2563eb` | 只用于次级关系，不与陶土橙争夺焦点 |

- 整体应冷静、分析性、克制而有温度。
- 概念插图可以使用哑光纸张、纸雕浮层或轻微 3D 深度；信息图优先清晰的平面排版，不为了统一风格增加妨碍读图的纹理和立体效果。避免玻璃拟态、强荧光与高饱和渐变。
- 栅格图片默认在网页深浅主题中共用同一资产。深色网页不等于必须生成深色图片；不要用自动反色改变图片、截图和品牌原色。两种页面背景下都要能辨认图片边界、主体和文字。

### 同一篇文章的视觉一致性

**同一套调色盘不等于同一套视觉系统。** 同篇自行制作的正文解释图，默认共享底色、文字层级、字体、强调色含义、边框/箭头样式、圆角及留白；不能因为一张是流程图、一张是场景导航，就自行切换成深底和浅底两套主题。

- **默认基线**：正文解释图采用暖米白 `#faf9f5` 底、深海军蓝主文字、陶土橙重点。整篇可明确选择深底方案，但同用途图片应一起切换；不要求所有文章永久使用同一种底色。
- **封面与正文分开**：封面可用深底强化识别，正文继续浅底阅读；这属于用途差异，不强求封面与正文完全相同。
- **允许有理由的例外**：真实产品截图、照片、原始论文图保留其内容与必要配色，可通过外框、留白和图注统一呈现。不能为统一而改写证据。自行制作的对照图只有在深浅变化本身表达必要含义时才例外，并在制作说明中解释；不靠换底色制造无意义变化。
- **按整组图验收**：单图好看不构成通过。放进同一篇 HTML，检查切换到下一张图时是否仍像同一套视觉表达；颜色不能在不同图中无说明地改变含义。

### 字级与构图

- 每张图只表达一个核心机制，使用少量主要形体与清晰的关系；不以大量小图标复述文章目录。正文结构图的节点容量和语义由图表规范决定，不机械套用封面隐喻的 1–3 个形体限制。
- 封面采用宽幅 `1.91:1` 构图，关键主体和连接保留在中央 75% 安全区，允许稳定裁切为 1200 × 630。正文图使用第 2 节的规格，不套用封面构图。
- 1280 × 720 的正文解释图可从以下排版基线开始：安全边距约 48 px、标题 40–48 px、主要标签 28–32 px、必要说明约 24 px。同篇相同角色沿用同一字级；这些是设计起点，最终以网页实际显示尺寸验收，不是填满画布的目标。
- 精确图形使用一致的中文字体及明确回退字体；生成式图片也要求同组的字形、字号层级和字重一致。文字过长先删减或调整布局，不能靠缩到难读来装下内容。
- 图片缩至文章实际宽度时，关键标签无需放大也能理解。手机端必要时采用纵向布局或配套可读说明，放大入口只辅助细节；不要用一行极小字承担决定结论的边界。
- 图内标题、正文小标题和图注各有作用，不三次重写同一结论。来源、适用范围等长说明优先放在可读的网页图注或相邻正文。
- 文字、数字、Logo、商标或 UI 截图可按文章表达需要使用；仅避免无法辨识的乱码、未经授权的第三方素材和会误导读者的水印。

### 可避免的母题

除非文章本身在批判这些视觉陈词，否则避免：发光大脑、人形机器人头、霓虹赛博朋克、装饰性电路板、握手商务照、火箭起飞、无意义数据流、密集微型模块和图库照片感。

## 2. 资产规格

| 类型 | 必需性 | 最终路径 | 输出格式 | 尺寸 | 大小上限 | 加载策略 |
|------|--------|----------|----------|------|----------|----------|
| 文章封面 | 可选 | `assets/images/blog/<slug>/cover.jpg` | JPEG | 1200 × 630 | 350 KB | eager + high priority |
| 正文位图 | 可选，正文共 0–2 张 | `assets/images/blog/<slug>/<descriptive-name>.webp` | WebP | 1280 × 720 | 250 KB | lazy |
| 正文精确图形 | 可选，与位图合计 0–2 张 | `assets/images/blog/<slug>/<descriptive-name>.svg` | 静态 SVG | 1280 × 720 viewBox | 250 KB | lazy |

- 栅格成品只能由 `scripts/prepare-blog-image.js` 生成；脚本会中心裁切、去除源元数据、控制质量和大小，并拒绝覆盖现有文件。
- 正文图文件名必须用能说明机制的 kebab-case，例如 `context-feedback-loop.webp`；禁止 `image.webp`、`figure-1.webp` 等通用名。
- 候选图保存在被 Git 忽略的 `build/blog-image-work/<slug>/`，只有选中的规范化成品进入 `assets/images/blog/<slug>/`。
- 精确图形可以直接登记为 SVG，沿用相同的 Markdown 独立图片语法、alt/caption 与 metadata 校验，由生成器输出普通 `<img>`，不注入任意 HTML。SVG 必须静态、自包含，不含脚本、事件处理、foreignObject、动画、外部引用或字体资源；由 `check-blog-images.js` 做结构、尺寸和完整解码检查。SVG 封面仍不支持。
- 同一张图只保留一个生效的发布表示；替换为 SVG 时同步 Markdown、metadata 和 HTML，并移除被替代的未登记位图。需要公众号栅格导出时从同一 SVG 图源渲染，再走位图规范化流程，不另外重画一张近似图。

## 3. 正文是否配图：0–2 张决策门

正文图默认不是必需品。决定是否使用时，可参考：

1. 这张图是否能解释文字难以快速说明的关系、顺序、边界、分层或反馈回路？
2. 删除它后，读者是否需要明显更多认知成本才能理解对应段落？
3. 它是否提供了与封面不同的信息，而不是装饰或重复标题？

不需要为满足配图要求而保留图片。通常：

- 0 张：文章以判断、论证或案例为主，文字和表格已足够。
- 1 张：存在一个关键系统、流程或机制需要建立共同心智模型。
- 2 张：两个机制彼此独立且都对结论必要；不得把一张图拆成两张来凑数量。

## 4. Alt 与 caption

- `alt` 描述图中与论点相关的对象和关系，让看不到图的读者获得等价信息；不用“图片展示了”“封面图”等套话，不重复文章标题。
- `caption` 只用于正文图，以一个完整、简洁的句子说明读者应从图中带走什么；不写素材来源式占位语或 SEO 关键词堆砌。
- `alt` 和 `caption` 均为去除首尾空格后的 1–160 个字符。
- 受独立 Markdown 图片语法限制，正文图 `alt` 不得包含 `]` 或换行，`caption` 不得包含 ASCII 双引号 `"` 或换行；需要引用时使用中文引号。
- Markdown 中的 alt、caption 必须与 `posts-meta.json` 完全一致；生成器会拒绝不一致、未登记、远程、跨文章或路径穿越图片。

正文图只接受独立成行的形式；登记的静态 SVG 使用相同语法并将扩展名替换为 `.svg`：

```markdown
![Context and feedback form a reusable loop](../../assets/images/blog/your-slug/context-feedback-loop.webp "The loop turns each completed task into reusable context for the next one.")
```

## 5. 元数据契约

`tools/blog/data/posts-meta.json` 使用版本 4。根级 `image_contract.legacy_without_visuals` 仅保留历史兼容记录；任何文章都可以省略 `visuals`，并让 OG/Twitter/JSON-LD 回退全站默认图。文章选择使用图片时，再声明 `visuals`（其中 `inline` 为数组，`cover` 可选）。例如：

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

同一封面会被文章页、Open Graph、Twitter large image card 和 JSON-LD 共用。没有单篇视觉资产的文章统一使用全站 `assets/images/og-cover.png` 作为分享回退，无需补图或改正文。

## 6. 制作与选择

### 先确定整组图片的制作说明

在已确认需要配图后，先读取 GitHub 最新正文和相关规范，再在现有制作记录或图源中保留一份简短的整组约定：正文来源版本、每张图回答的问题及位置、表示类型、共享底色/字体/字级/强调色/线型、各图已核对的文案与关系、允许的例外。已有明确规则的部分直接继承，不为每篇文章新增规范文件或再次请用户逐项确认。

同组图片使用共享样式参数或同一视觉提示词前缀；制作后续图片时提供已选的风格参照，不能每张独立决定一套风格。需要修改背景或字级时，检查同组其他图片是否一起调整。

### 按表达目的选择制作方式

- **概念插图与封面**：默认使用当前环境可用的内置图像生成工具，例如 ChatGPT 的 image_gen 或 Codex 的 imagegen；不需要也不得向用户索取 API Key。只有用户明确选择 CLI/API 方案后，才允许使用外部回退；不得因内置生成失败而静默切换模式。
- **精确结构图、数据图与产品关系图**：按图表规范确定内容和表示，可用 SVG/HTML 等确定性排版保留节点、文字、数值和连线的可编辑性。采用生成式图像时也须逐项核对这些内容，不能把看起来合理的图形当成事实。实际制作工具如实记录，不将代码绘图说成模型生图。
- **产品截图与原始资料图**：使用可核实来源，保留必要上下文并注明来源；不可用 AI 重绘的界面冒充产品实测截图。

只有决定使用生成图片时才生成候选。检查重点是图像是否服务文章、主体是否完整、文字是否可读，以及是否有误导性水印或明显瑕疵；若只存在一个明确问题，允许一次只针对该问题的定向修订。图片生成失败不阻断纯文字文章发布。

以下是**封面概念插图**的提示词示例，不直接套用于正文信息图。实际使用时应继承整组视觉约定，并替换图片角色、宽高比、背景和已确认文案：

```text
Use case: stylized-concept
Asset type: blog header image
Primary request: editorial concept illustration for an article about <core judgment>
Scene/backdrop: deep navy field
Subject: one visual metaphor representing <mechanism>, using 1-3 large forms
Style/medium: sophisticated editorial illustration, paper-cut relief and matte 3D finish
Composition/framing: wide 1.91:1 composition; important subject inside the central safe area
Lighting/mood: calm, analytical, quietly confident
Color palette: deep navy, clay orange, warm off-white, minimal supporting blue
Text or logo treatment: optional when it improves the article's communication; text must be readable and relevant
Avoid: unreadable gibberish, misleading watermarks, and unauthorized third-party brand assets
Avoid: glowing brain, humanoid robot head, neon cyberpunk, decorative circuit board, tiny clutter
```

## 7. 预览与发布检查

### 预览必须对应当前正文和当前图源

- 以 GitHub 当前 Markdown 为正文真源；本地旧缓存不得覆盖它。预览内部记录对应正文版本和图源版本，改图后从同一图源重新渲染图片，不另画一份外观相似的 HTML 专用图。
- GitHub 图源、规范化图片和 HTML 内嵌图片应具有同样的文案、对象、关系和样式。内嵌时可核对导出图片与内嵌字节的哈希；哈希核对只能证明版本一致，不能代替视觉检查。
- 在实际文章宽度下检查两张图的整组一致性、字号与留白，并分别查看桌面/移动、浅色/深色状态。图中文字遮挡、截断、移动端关键内容难读或样式突然切换，都应在交付前解决。
- HTML 标签闭合、文件存在、引用数量正确，只能算结构检查。未实际渲染查看的尺寸或主题，如实标记未验收，不能声称已完成视觉 QA。
- 单文件离线预览可以内嵌图片；它是当前稿的派生展示，不是第二份可独立修改的正文。未发布预览不意味着已经登记图片元数据、进入公共列表或完成发布。

### 正式发布步骤

```powershell
node scripts/prepare-blog-image.js --slug <slug> --role cover --input build/blog-image-work/<slug>/candidate.png
node scripts/prepare-blog-image.js --slug <slug> --role inline --name <descriptive-name> --input build/blog-image-work/<slug>/inline-candidate.png
node scripts/check-blog-images.js
node tools/blog/generate-post.js --write docs/blog/<slug>.md tools/blog/posts/<slug>.html
node scripts/generate-search-assets.js --write
node scripts/check-search-foundation.js
```

上面两条 `prepare-blog-image.js` 命令仅用于实际选择的位图；静态 SVG 直接使用已验收的图源登记为正文资产，仍须运行图片、生成器和发布检查。

发布前还必须构建并检查 public dist。使用图片时，在桌面/移动、浅色/深色状态下截图复核文章页，并确认图片加载失败时 alt 可读、布局不坍塌；纯文字文章不需要图片专项复核。交付报告仅在实际使用图片时列出最终资产路径、实际制作方式及生成图片所用的最终提示词；精确图形则给出可编辑源与渲染路径。

## 8. 版本记录

- 1.2（2026-10-15）：为正文精确图形增加静态 SVG 发布路径，沿用 metadata、独立图片语法与 public dist 白名单；限定静态、自包含的内容和安全检查，保留原位图规格，避免文字图因有损压缩和缩放失真。图表语义继续由图表规范维护。
- 1.1（2026-10-14）：保留原调色盘及资产尺寸，区分封面与正文的默认底色，补充同篇视觉约定、字级与实际显示尺寸检查；区分概念生成、精确图形和来源截图的制作方式；明确预览必须由当前正文及同一图源派生。图表语义仍由图表规范维护，不改写作流程或发布脚本。
- 1.0：Leo Editorial v1 视觉语言、可选 0–2 张正文图、资产规格、alt/caption 与发布契约。

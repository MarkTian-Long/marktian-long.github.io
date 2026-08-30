# 博客图片生成与发布链路设计

## 目标

让后续每篇新博客都拥有一张与文章核心判断相关的专属封面，并在内容确实受益时加入 1–2 张正文配图；图片由 Codex 内置 `imagegen` 创作，最终作为普通静态资产进入现有发布、检查和 GitHub Pages 链路。

首期只为最新文章 `personal-harness` 增加一张试点封面，用来验证完整链路。其余历史文章不批量补图，继续使用当前全站默认 OG 图。

## 当前问题

- 现有 40 篇文章没有逐篇图片字段。
- 所有文章的 `og:image`、`twitter:image` 和 BlogPosting JSON-LD 都指向 `assets/images/og-cover.png`。
- 现有 1080 × 1920 分享海报解决的是社交分享长图，不是文章封面或正文配图。
- `generate-post.js` 目前不解析 Markdown 图片。
- `public-dist-manifest.js` 目前只白名单一张全站 OG 图，没有博客图片资产契约。

这意味着问题不能通过“生成几张图并手工插进 HTML”解决；图片必须成为文章元数据、生成器、SEO、公开构建与 QA 的共同输入。

## 方案比较

### 方案一：逐篇手工插入图片

直接生成图片、手改文章 HTML，并手工修改 OG 标签。

优点是一次改动最快。缺点是 Markdown 源稿、HTML、SEO 和公开白名单会形成多个数据源，下一次发布极易漏项，也无法自动阻止路径错误、图片过大或 OG 回退。

### 方案二：内置 imagegen + 静态资产契约（采用）

Codex 在发布阶段调用内置 `imagegen`；仓库脚本只做确定性的裁切、压缩、格式转换、路径校验和 HTML/SEO 生成。最终图片与文章一起提交，线上运行时不调用模型。

优点是无公开 API Key、结果可审查、部署稳定，并能融入现有静态站和 `publish-blog` 流程。代价是需要一次性扩展元数据、生成器和测试。

### 方案三：CI 或浏览器实时调用图片 API

在 GitHub Actions 或页面端按文章自动生成图片。

它会引入凭据、费用、非确定性、失败重试和构建漂移，也违反当前静态客户端不得承载 credential 的边界，因此不采用。

## 核心架构

```text
最终 Markdown + posts-meta 元数据
              │
              ▼
      文章视觉 brief（发布阶段）
              │
              ▼
   Codex 内置 imagegen 生成候选图
              │
              ▼
  prepare-blog-image.js 标准化静态资产
              │
              ├── cover.jpg（1200 × 630）
              └── 可选正文图.webp（1280 × 720）
              │
              ▼
 posts-meta visuals + Markdown 图片语法
              │
              ▼
 generate-post / search assets / public-dist
              │
              ▼
 本地视觉 QA → commit → push HITL → 线上验证
```

`imagegen` 只负责不可确定的创作步骤；裁切、格式、路径、元数据、HTML 和部署均由仓库内确定性代码负责。内置模式不需要 `OPENAI_API_KEY`。若内置工具不可用，不自动切换 CLI/API；新文章暂停在发布前，等待恢复或用户提供图片。

## 视觉系统：Leo Editorial v1

### 封面风格

- 类型：品牌化概念插画，而不是照片拼贴或带字海报。
- 色彩：深海军蓝、陶土橙、米白为主，可少量使用现有辅助蓝。
- 形式：克制的纸雕/哑光立体质感，1 个核心隐喻、1–3 组大形体、充足留白。
- 构图：横向 1.91:1，关键主体保持在中央安全区，允许最终居中裁切。
- 禁止：图片内文字、Logo、水印、品牌商标、发光大脑、机器人头像、霓虹赛博背景、无意义电路线和过度复杂的小元素。
- 标题继续由 HTML、OG title 和分享海报承载，不让图片模型负责中文排版。

Google 的图片规范建议 OG/结构化数据使用与页面相关、具有代表性且高分辨率的图片，并避免通用 Logo 或带文字的图片；该视觉方向与此一致：[Google 图片 SEO 最佳实践](https://developers.google.com/search/docs/appearance/google-images)。

### 正文配图触发条件

正文图不是固定配额。只有满足以下任一条件才生成，单篇最多 2 张：

- 某个流程、边界或对象关系用视觉表达明显比连续文字更快理解。
- 文章存在一个贯穿多节的核心隐喻，需要在中段重新建立读者心智模型。
- 配图能承担新的解释功能，而不是重复标题或段落结论。

精确数字、带标签架构图、对比矩阵和流程节点仍优先使用 HTML 表格、CSS 或 SVG。图片模型不负责需要逐字准确的技术图。纯装饰性需求返回 0 张正文图。

## 资产契约

```text
assets/images/blog/<slug>/
├── cover.jpg                         # 必需，1200 × 630，≤ 350 KB
├── <descriptive-name>.webp           # 可选，1280 × 720，≤ 250 KB
└── <second-descriptive-name>.webp    # 可选，单篇最多两张
```

- 文件名使用小写 kebab-case；不使用 `image-1`、`final`、`new` 等无语义名称。
- 封面统一使用 JPEG，优先保证社交抓取兼容性；正文插画使用 WebP。
- 最终资产去除 EXIF 和生成过程元数据。
- 候选图任一边小于目标尺寸时拒绝放大，避免把低分辨率结果伪装成合格资产。
- 标准化脚本从质量 82 开始，必要时按固定档位降到 78、74；仍超出体积预算则失败，不继续牺牲画质。
- 原始候选图仅放在被忽略的 `build/blog-image-work/<slug>/`，不提交、不部署。
- 标准化脚本默认拒绝覆盖已有文件。替换已发布图片必须单独获得用户授权，或使用新的版本化文件名。

## 元数据契约

`posts-meta.json` 升级到 schema version 4，并增加显式的历史无图豁免清单：

```json
{
  "version": 4,
  "image_contract": {
    "version": 1,
    "legacy_without_visuals": [
      "alignment-under-change",
      "ai-rd-self-acceleration-rsi"
    ]
  }
}
```

示例只展示清单前两项；实施时清单包含除试点 `personal-harness` 外的 39 篇历史文章。只有清单中的文章可以缺省 `visuals`；任何新增 slug 默认都必须有图。历史文章日后补图时，同时从清单移除。这个约束不依赖文章数组顺序，也无需给 39 篇历史文章逐条添加空字段。

单篇结构：

```json
"visuals": {
  "cover": {
    "src": "assets/images/blog/personal-harness/cover.jpg",
    "alt": "深色背景中，一个个人工作台被多层协作模块环绕连接，象征 Personal Harness",
    "width": 1200,
    "height": 630
  },
  "inline": []
}
```

正文图对象额外包含非空 `caption`；路径、alt、caption、尺寸均由 metadata validator 校验。历史文章没有 `visuals` 时，SEO 继续回退到 `site-config.js` 的全站默认图。

## Markdown 与 HTML

封面不写入 Markdown，由 `visuals.cover` 自动插入文章标题摘要之后、正文之前。这样封面同时服务文章页面和 SEO，且不会在源稿中重复维护。

正文图使用标准 Markdown：

```markdown
![描述图片真正表达的关系](../../assets/images/blog/<slug>/<name>.webp "一句话图注")
```

生成器只接受：

- 独占一行的图片语法；
- 当前文章 slug 自己目录下的本地图片；
- 与 `visuals.inline` 中路径、alt、caption 完全一致的条目。

输出 HTML 使用 `<figure>` / `<img>` / `<figcaption>`。封面设置明确的宽高和高优先级加载；正文图使用 `loading="lazy"`、`decoding="async"` 和明确宽高，避免布局跳动。

## 页面与分享呈现

- 封面只进入文章页，不在首页和 Blog 列表页增加缩略图；首期继续保持现有文字优先的信息密度。
- 文章页封面位于摘要后，使用现有圆角、边框和主题变量；不增加灯箱或点击交互。
- 每篇有封面的文章使用自己的 `og:image`、`twitter:image` 和 BlogPosting `image`。
- 增加 `og:image:width/height/alt`、`twitter:image:alt`，并统一使用 `summary_large_image`。
- 历史文章继续使用全站默认图，不重写正文。
- 现有 1080 × 1920 分享海报保持不变；把封面融入海报属于后续可选工作，不在首期范围。

Google 的 Article 结构化数据要求图片与文章内容相关、可抓取，并建议高分辨率图片；首期先提供稳定的一张代表图，不为了增加多个比例而扩大范围：[Article 结构化数据](https://developers.google.com/search/docs/appearance/structured-data/article)。

## 发布流程

1. 锁定最终 Markdown、标题、summary、share quote 和文章关系。
2. 从全文提炼一个核心视觉隐喻，判断正文是否真正需要 0–2 张配图。
3. 按 `VISUAL_GUIDE.md` 组装无文字的 imagegen prompt。
4. 默认调用一次内置 `imagegen`；视觉审查不通过时只做一次针对性修正，不无限生成变体。
5. 将选中候选图复制到 `build/blog-image-work/<slug>/`，运行标准化脚本写入最终资产。
6. 更新 `posts-meta.json` 的 `visuals`；有正文图时同步添加标准 Markdown 图片语法。
7. 生成文章 HTML 和搜索发现资产，执行图片、SEO、public-dist 与项目全量检查。
8. 在真实本地页面检查浅色/深色、桌面/手机视口。
9. review、commit；`git push` 仍按 HITL 等待用户确认，随后验证图片 URL、文章 URL 和线上 meta。

发布报告必须列出最终图片路径、最终 prompt、使用的内置/CLI 模式、图片 QA 结论和页面视觉复核证据。

## 失败与回退

- imagegen 不可用：停止新文章发布，不静默使用默认图，也不自动要求 API Key。
- 图片含文字、水印、商标或明显结构错误：拒绝入库，做一次针对性修正。
- 裁切破坏主体：调整 prompt 的安全区或重新生成，不用 CSS 掩盖。
- 文件超尺寸、格式或像素不合规：按固定质量档位处理后仍不合规则失败，禁止提交。
- 新文章缺少 `visuals`：metadata validator 和发布检查失败。
- 历史文章缺少 `visuals`：继续使用默认 OG 图，不报错。
- 图片路径不存在或未进入 public manifest：public-dist 检查失败。

## 安全与部署边界

- 不修改 `.github/workflows/`，不新增 GitHub Secret。
- 浏览器、Pages artifact 和公开 JS 不包含模型 credential。
- CI 只验证已提交图片，不生成或重新生成图片。
- 外部图片不得热链；发布资产必须落入仓库并通过白名单构建。
- 图片生成是编辑流程的一部分，不是线上运行时依赖。

## 首期试点

试点文章：`personal-harness`。

试点只增加一张封面，不强行为正文添加装饰图。视觉隐喻是“一个个人工作台被 Context、Memory、工具、方法和反馈组成的模块系统逐层环绕连接”，不出现标签文字。该试点同时验证：

- imagegen → 标准化资产；
- metadata version 4 与显式历史豁免；
- 文章页封面；
- per-post OG/Twitter/JSON-LD；
- public-dist 图片白名单；
- 浅色/深色与桌面/手机视觉 QA。

## 验收标准

- `personal-harness` 显示专属封面，图片文件满足尺寸和体积预算。
- 新增的 metadata 契约能拒绝未来新文章漏图，同时允许历史文章回退。
- 有封面的文章 SEO 全部指向自己的绝对图片 URL；历史文章仍指向默认图。
- Markdown 正文图只允许当前 slug 的已登记本地资产。
- public-dist 精确包含被 metadata 引用的图片，不包含候选图或孤儿文件。
- 文章页浅色/深色、1440px 桌面与 390px 手机视口均无裁切失真、溢出或层级冲突。
- 所有既有文章 `post-body` 保持冻结，除明确试点外不产生历史正文 diff。
- 发布流程不需要任何公开 API Key，push 仍保留 HITL。

## 非目标

- 不批量为其余历史文章补图。
- 不给首页或 Blog 列表增加图片卡片。
- 不改变现有分享海报设计。
- 不自动生成带文字的信息图。
- 不在 CI、GitHub Actions 或浏览器中调用图片模型。
- 不创建新的项目 Skill；先把流程并入现有 `publish-blog`，累计稳定使用后再评估是否拆分。

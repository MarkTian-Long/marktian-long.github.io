# A股 AI 数据助手

自然语言查询 A股数据，由 Yahoo Finance 提供数据、OpenRouter LLM 提供解析与解读。

## 功能

- 自然语言输入 → AI 解析意图 → Yahoo Finance 取数 → AI 解读数据
- 支持股票日线、指数行情查询
- 数据延迟约 15 分钟，覆盖沪深港主要股票及指数
- 纯前端，无需代理，GitHub Pages 直接可用

## 支持的股票/指数

| 名称 | 代码 |
|------|------|
| 上证指数 | 000001.SS |
| 深证成指 | 399001.SZ |
| 创业板指 | 399006.SZ |
| 沪深300 | 000300.SS |
| 中证500 | 000905.SS |
| 贵州茅台 | 600519.SS |
| 宁德时代 | 300750.SZ |
| 比亚迪 | 002594.SZ |

也可直接输入其他股票名称，AI 会自动推断代码。

## 配置

打开 `index.html`，修改顶部 `CONFIG`：

```js
const CONFIG = {
  OPENROUTER_KEY: 'your_openrouter_key_here',
  MODEL: 'stepfun/step-3.5-flash:free'
};
```

> ⚠️ 不要将含有真实 Key 的文件提交到公开仓库。

## 本地使用

直接浏览器打开 `index.html`，或通过主站 AI 工具箱 → 📊 A股助手 访问。

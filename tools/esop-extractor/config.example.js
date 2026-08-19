// 历史配置结构示例：公开静态页面不会加载此文件或 config.local.js。
// 如需接入真实模型，请使用服务端代理保管密钥，不要把真实值写入此文件。
window.ESOP_CONFIG = {
  baseUrl: 'https://your-server-proxy.example/api',
  model:   'your-server-side-model-alias',
};

# 运维手册（Runbook）

## 1. 服务概况

| 服务 | URL | 技术栈 | 负责人 |
|------|-----|--------|--------|
| Web App | https://app.example.com | React + Vite | @frontend-team |
| Admin App | https://admin.example.com | React + Vite | @frontend-team |

---

## 2. 监控指标

### Core Web Vitals 目标
| 指标 | 含义 | Good | Needs Improvement | Poor |
|------|------|------|-------------------|------|
| LCP | 最大内容绘制 | < 2.5s | 2.5s - 4s | > 4s |
| FID / INP | 交互响应延迟 | < 100ms | 100-300ms | > 300ms |
| CLS | 累积布局偏移 | < 0.1 | 0.1 - 0.25 | > 0.25 |
| TTFB | 首字节时间 | < 800ms | 800ms - 1.8s | > 1.8s |

### 业务指标告警阈值
| 指标 | 告警阈值 | 严重告警阈值 |
|------|----------|--------------|
| 前端 JS 错误率 | > 1% | > 5% |
| API 错误率（4xx/5xx） | > 2% | > 10% |
| 页面 404 率 | > 5% | > 15% |

---

## 3. 常见故障处理

### 故障 01: 白屏（JS Bundle 加载失败）

**现象**：页面空白，控制台有 ChunkLoadError 或网络请求 404

**原因**：
- CDN 缓存未刷新，旧客户端请求已删除的 chunk 文件
- 构建产物未成功部署

**处理步骤**：
```bash
# Step 1: 确认 CDN 最新文件是否存在
curl -I https://cdn.example.com/assets/index-{hash}.js

# Step 2: 如果是缓存问题，刷新 CDN
# (根据实际 CDN 服务操作)

# Step 3: 如果是部署问题，重新触发部署流水线
gh workflow run release.yml
```

**预防措施**：
- `vite.build.rollupOptions.output.chunkFileNames` 使用内容 hash
- 服务端添加 `Cache-Control: no-cache` for `index.html`

---

### 故障 02: 登录失效 / 自动登出

**现象**：用户频繁被踢出，报 401 错误

**原因**：
- JWT Token 过期（正常行为）
- Token 刷新逻辑异常
- localStorage 被清除

**处理步骤**：
1. 检查浏览器 devtools → Application → localStorage 中是否有 `enterprise-auth`
2. 检查 Network 面板，查看 401 请求的响应体
3. 确认后端 token 过期时间配置是否正确

---

### 故障 03: 构建失败

**现象**：CI/CD 流水线 build 步骤失败

**排查步骤**：
```bash
# 本地复现
pnpm install --frozen-lockfile
pnpm nx run-many --target=build --all

# 查看详细错误（关闭缓存）
pnpm nx run web:build --skip-nx-cache

# 清理 nx 缓存
pnpm nx reset
```

---

### 故障 04: 依赖版本冲突

**现象**：`pnpm install` 报 peer dependency 警告或错误

**处理**：
```bash
# 查看依赖树
pnpm why <package-name>

# 强制覆盖版本（临时方案）
# 在根 package.json 添加：
# "pnpm": { "overrides": { "<package>": "<version>" } }
```

---

## 4. 性能排查

### 分析 bundle 体积
```bash
# 生成 bundle 分析报告
pnpm nx run web:build -- --mode analyze

# 查看报告（需安装 rollup-plugin-visualizer）
open apps/web/dist/stats.html
```

### Lighthouse 性能分析
```bash
# 使用 Playwright 运行 Lighthouse
pnpm exec playwright test --project=chromium performance.spec.ts
```

---

## 5. 部署回滚

### 快速回滚到上一版本
```bash
# 方式 1: GitHub Actions 手动触发回滚
# 在 GitHub Actions → Release workflow → Run workflow
# 输入上一个稳定 tag 版本号

# 方式 2: 直接修改 CDN 指向
# 将 CDN origin 切回上一版本的 S3 bucket 路径
```

### 验证回滚成功
```bash
# 检查版本号（页面 footer 或 /version 接口）
curl https://app.example.com/version.json

# 运行 Smoke Test
pnpm exec playwright test smoke.spec.ts --project=chromium
```

---

## 6. 日志与追踪

### 前端错误监控（Sentry 集成示例）
```typescript
// apps/web/src/main.tsx
import * as Sentry from '@sentry/react';

Sentry.init({
  dsn: import.meta.env.VITE_SENTRY_DSN,
  environment: import.meta.env.MODE,
  release: import.meta.env.VITE_APP_VERSION,
  tracesSampleRate: 0.1,
});
```

### 重要日志过滤
```javascript
// 过滤噪音错误（浏览器插件引起的）
Sentry.init({
  ignoreErrors: [
    'ResizeObserver loop limit exceeded',
    'Non-Error promise rejection captured',
  ],
  denyUrls: [/extensions\//i, /^chrome:\/\//i],
});
```

---

## 7. 发布通知模板

### 正常发布
```
🚀 [Enterprise Web] v1.2.0 已发布

变更摘要：
- ✨ 新增 Tooltip 组件
- 🐛 修复 Safari 白屏问题

发布时间：2024-06-01 14:00
发布环境：生产环境
负责人：@xxx

监控看板：[链接]
```

### 故障公告
```
⚠️ [Enterprise Web] 服务异常通告

时间：2024-06-01 14:30
影响范围：用户登录功能不可用
当前状态：正在排查

预计恢复时间：30 分钟内
负责人：@xxx
```

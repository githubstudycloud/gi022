# user-service 运维手册

**更新日期**: 2026-03-18 | **维护人**: SRE 团队

---

## 1. 服务概览

| 项目 | 值 |
|------|---|
| 服务名 | user-service |
| 端口 | HTTP:8080, gRPC:9090 |
| 技术栈 | Go 1.22, Gin, GORM, Redis |
| 部署方式 | Kubernetes |
| 命名空间 | `production` / `staging` |
| 健康检查 | `GET /health` |
| 指标端点 | `GET /metrics` |
| 日志位置 | ELK: `index: user-service-*` |
| 链路追踪 | Jaeger: service=user-service |

---

## 2. 常用操作

### 2.1 查看服务状态

```bash
# 查看 Pod 状态
kubectl get pods -n production -l app=user-service

# 查看最近日志
kubectl logs -n production -l app=user-service --tail=100 -f

# 查看特定 Pod 日志
kubectl logs -n production {pod-name} --tail=200

# 查看资源使用
kubectl top pods -n production -l app=user-service
```

### 2.2 扩缩容

```bash
# 手动扩容至 5 个副本
kubectl scale deployment user-service -n production --replicas=5

# 查看 HPA 状态
kubectl get hpa -n production
```

### 2.3 重启服务

```bash
# 滚动重启（零停机）
kubectl rollout restart deployment/user-service -n production

# 查看重启进度
kubectl rollout status deployment/user-service -n production
```

### 2.4 配置更新

```bash
# 更新 ConfigMap
kubectl edit configmap user-service-config -n production

# 查看当前配置
kubectl get configmap user-service-config -n production -o yaml
```

---

## 3. 告警处理

### 3.1 高错误率告警

**告警名**: `UserServiceHighErrorRate`
**触发条件**: 5xx 错误率 > 1%，持续 5 分钟

**排查步骤**：
```bash
# 1. 查看错误日志
kubectl logs -n production -l app=user-service | grep '"level":"error"' | tail -50

# 2. 检查数据库连接
kubectl exec -it {pod-name} -n production -- wget -qO- http://localhost:8080/health

# 3. 查看链路追踪
# 打开 Jaeger UI，过滤 service=user-service，查看 error=true 的 trace

# 4. 数据库连接池状态（通过指标）
# user_service_db_open_connections > max_open_conns * 0.9 → 连接池满
```

**常见原因及处置**：

| 原因 | 现象 | 处置 |
|------|------|------|
| 数据库连接耗尽 | 日志含 `too many connections` | 扩容 DB 连接池或服务副本 |
| Redis 不可用 | 日志含 `cache: connect` | 检查 Redis 状态，降级缓存（可选） |
| 上游服务超时 | 日志含 `context deadline exceeded` | 检查依赖服务 |
| OOM | Pod 反复 Restart | 增加 memory limit 或排查内存泄漏 |

### 3.2 高延迟告警

**告警名**: `UserServiceHighLatency`
**触发条件**: P99 延迟 > 500ms，持续 3 分钟

**排查步骤**：
```bash
# 1. 查看慢查询
# MySQL: SHOW PROCESSLIST; 或查看 slow_query_log

# 2. 查看 Redis 慢日志
redis-cli SLOWLOG GET 10

# 3. 通过 pprof 分析热点（需开启 pprof 端点）
go tool pprof http://{pod-ip}:6060/debug/pprof/profile?seconds=30
```

### 3.3 Pod CrashLoopBackOff

```bash
# 查看 Pod 事件
kubectl describe pod {pod-name} -n production

# 查看上次崩溃日志
kubectl logs {pod-name} -n production --previous

# 常见原因：配置错误、端口被占用、启动超时
```

---

## 4. 数据库运维

### 4.1 执行数据库迁移

```bash
# 使用 golang-migrate
migrate -path ./migrations \
  -database "mysql://user:pass@tcp(host:3306)/dbname" \
  up

# 查看当前迁移版本
migrate -path ./migrations \
  -database "mysql://user:pass@tcp(host:3306)/dbname" \
  version
```

### 4.2 常用 SQL

```sql
-- 查看活跃连接数
SHOW STATUS LIKE 'Threads_connected';

-- 查看运行中的查询
SHOW FULL PROCESSLIST;

-- 查看表大小
SELECT table_name,
       ROUND((data_length + index_length) / 1024 / 1024, 2) AS size_mb
FROM information_schema.tables
WHERE table_schema = 'users'
ORDER BY size_mb DESC;
```

---

## 5. 故障演练

每季度执行一次，记录在 `docs/runbook/drill-records/`：

- [ ] 数据库主从切换
- [ ] Redis 主节点故障（Sentinel 自动切换）
- [ ] 单个 Pod 被 Kill（验证滚动更新）
- [ ] 流量突增（验证 HPA）

---

## 6. 联系方式

| 角色 | 联系方式 | 值班时间 |
|------|---------|---------|
| On-call 工程师 | PagerDuty: user-service | 24/7 |
| 服务 Owner | @backend-team | 工作时间 |
| DBA | @dba-team | 工作时间+紧急 |

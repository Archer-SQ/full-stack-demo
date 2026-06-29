# Codex Handoff

这是唯一的交接文档。另一台电脑上的 Codex 先读这个文件，用来接上当前进度。

更新时间：2026-06-30

## 项目背景

这是一个面试用全栈 Demo。

目标：

- 前端开发者转全栈能力展示。
- 前端使用 React + TypeScript + Vite。
- 后端使用 Python + FastAPI。
- 数据库使用 PostgreSQL。
- 本地通过 Docker Compose 启动数据库。

用户希望按 `plan.md` 一步一步做。协作方式很重要：

- 不要一次性把后续所有代码都做完。
- 一次只推进一小步，用户做完发结果，再继续下一步。
- 后端概念要讲细，尽量用前端知识类比。
- 难懂的 Python / FastAPI / SQLAlchemy 语法要逐行解释。
- 文档必须同步更新到 `plan.md`，不要只在聊天里解释。
- 提交代码前必须更新本文件。

## 当前最准确的进度

当前已经完成到：

```txt
第 17 步：前端接入后端前的 API 基础层
```

并且已经通过：

```txt
后端 python -m compileall app
前端 pnpm build
```

下一步从 `plan.md` 的这里继续：

```txt
第 18 步：用前端页面调用 /api/settings，确认前后端连通
```

不要直接开始做最终页面。

第 18 步只是一个临时联调页，用来验证：

```txt
React -> Vite proxy -> FastAPI -> PostgreSQL
```

这条链路是否完整打通。

## 已完成内容

已经完成：

1. 安装并确认 Node、pnpm、Python、Docker Desktop。
2. 初始化前端 Vite + React + TypeScript。
3. 初始化后端 FastAPI。
4. Docker Compose 启动 PostgreSQL。
5. FastAPI 成功连接 PostgreSQL。
6. `/health` 成功返回 `{"status":"ok"}`。
7. `/health/db` 成功返回 `{"database":"ok"}`。
8. 创建 SQLAlchemy 基类和数据模型。
9. 创建数据库表。
10. 创建 Pydantic Schema。
11. 创建数据库会话依赖 `get_db()`。
12. 初始化 `app_settings` 默认配置数据。
13. 创建并验证应用配置接口。
14. 创建并验证回复校对接口。
15. 创建模拟 AI 服务 `backend/app/services/mock_ai.py`。
16. 创建会话接口 `backend/app/routers/chat.py`。
17. 在 `backend/app/main.py` 挂载 `chat.router`。
18. 用 Swagger 验证会话接口。
19. 配置前端 Vite `/api` 代理。
20. 创建前端 API 请求基础层。
21. 前端构建通过。

## 已完成接口

基础接口：

```txt
GET /health
GET /health/db
```

应用配置接口：

```txt
GET   /api/settings
PATCH /api/settings/{code}
```

回复校对接口：

```txt
POST  /api/feedbacks
GET   /api/feedbacks
GET   /api/feedbacks/{feedback_id}
PATCH /api/feedbacks/{feedback_id}
```

会话接口：

```txt
POST /api/sessions
GET  /api/sessions
GET  /api/sessions/{session_id}
POST /api/sessions/{session_id}/messages
```

会话接口已用 Swagger 验证通过：

- 创建会话。
- 查询会话列表。
- 查询单个会话。
- 发送用户消息。
- 后端自动保存用户消息和 assistant 模拟回复。
- assistant 回复里包含 `answer_data`。

## 当前前端 API 基础层

已新增：

```txt
frontend/src/api/http.ts
frontend/src/api/types.ts
frontend/src/api/settings.ts
frontend/src/api/chat.ts
```

`frontend/vite.config.ts` 已配置：

```ts
server: {
  proxy: {
    "/api": {
      target: "http://127.0.0.1:8000",
      changeOrigin: true,
    },
  },
}
```

注意：

- 前端页面里应该请求 `/api/...`，不要写死 `http://127.0.0.1:8000/api/...`。
- `/api/settings` 返回的是数组，所以前端函数是 `getSettings()`，返回 `AppSetting[]`。
- 后端会返回 `null` 的字段，前端类型也使用 `xxx | null`。

当前 API 函数：

```txt
getSettings()
updateSetting(code, payload)
createSession(title)
getSessions()
getSession(sessionId)
sendMessage(sessionId, content)
```

## 数据库表

PostgreSQL 当前使用 4 张核心表：

```txt
app_settings
chat_sessions
chat_messages
feedbacks
```

注意：

- 之前曾误建过 `feedback` 和字段 `useer_name`，已经修正为 `feedbacks` 和 `user_name`。
- 如果另一台电脑是新数据库，只需要按恢复步骤重新 `init_db` 和 `seed`。

## 重要代码约定

### 模型注册

`backend/app/models/__init__.py` 统一导出模型：

```python
from app.models.chat import ChatMessage, ChatSession
from app.models.feedback import Feedback
from app.models.setting import AppSetting
```

`backend/app/db/init_db.py` 里保留：

```python
import app.models
```

原因：

- 这句看似没用，但它是为了触发模型注册。
- `Base.metadata.create_all(bind=engine)` 只能创建已经注册到 `Base.metadata` 的表。

router 里更推荐：

```python
from app.models import Feedback
from app.models import ChatMessage, ChatSession
```

这样既会执行 `app.models.__init__`，又能拿到当前文件要用的类。

### 当前 main.py 状态

`backend/app/main.py` 当前已挂载：

```python
app.include_router(settings.router)
app.include_router(feedbacks.router)
app.include_router(chat.router)
```

所以 Swagger 里应该能看到：

```txt
settings
feedbacks
sessions
```

## 重要本地配置

`docker-compose.yml` 当前 PostgreSQL 配置：

```yaml
POSTGRES_DB: fullstack_demo
POSTGRES_USER: archer
POSTGRES_PASSWORD: 123456
```

`backend/.env.example`：

```env
DATABASE_URL=postgresql+psycopg://archer:123456@localhost:5432/fullstack_demo
```

注意：

- `backend/.env` 不提交到仓库。
- 当前后端是在本机运行，所以数据库地址用 `localhost`。
- 以后如果后端也放进 Docker，数据库地址要改成 `postgres`。
- 不要把真实生产密码提交到远程仓库。

## 另一台电脑恢复环境

拉取代码：

```bash
git pull
```

如果是新克隆：

```bash
git clone https://github.com/Archer-SQ/full-stack-demo.git
cd full-stack-demo
```

启动 PostgreSQL：

```bash
docker compose up -d postgres
docker compose ps
```

准备后端：

```bash
cd backend
python3 -m venv .venv
source .venv/bin/activate
python -m pip install -r requirements.txt
cp .env.example .env
```

初始化数据库表和默认数据：

```bash
python -m app.db.init_db
python -m app.db.seed
```

启动后端：

```bash
python -m uvicorn app.main:app --reload
```

访问：

```txt
http://127.0.0.1:8000/health
http://127.0.0.1:8000/health/db
http://127.0.0.1:8000/api/settings
http://127.0.0.1:8000/docs
```

准备前端：

```bash
cd ../frontend
pnpm install
pnpm dev
```

## 下一步

先打开：

```txt
plan.md
```

从这里继续：

```txt
第 18 步：用前端页面调用 /api/settings，确认前后端连通
```

要做的事：

1. 启动 PostgreSQL。
2. 启动 FastAPI 后端。
3. 启动 Vite 前端。
4. 临时修改 `frontend/src/App.tsx`。
5. 临时修改 `frontend/src/App.css`。
6. 打开 `http://127.0.0.1:5173`。
7. 确认页面能显示 `/api/settings` 返回的配置列表。
8. 在浏览器 Network 里确认 `/api/settings` 是 `200`。

## 当前仍未完成

- 第 18 步前端页面联调还没做。
- 配置页前端还没做成正式页面。
- 回复校对页前端还没做。
- 智能问数页前端还没做。
- 原型页面还没有迁移成 React 组件。
- 真实 AI 调用还没接入，当前仍然使用 mock AI。

## 面试讲解方向

可以这样讲：

- PostgreSQL 用 Docker Compose 管理，保证本地环境可复现。
- FastAPI 负责 HTTP API。
- SQLAlchemy ORM 映射 PostgreSQL 表。
- Pydantic Schema 负责请求和响应数据结构。
- router / service / model / schema 分层：
  - router：接口入口。
  - service：业务逻辑。
  - model：数据库表。
  - schema：接口数据格式。
- 当前 AI 回复先用 mock，目的是先跑通完整全栈链路，后续可替换成真实大模型调用。
- 前端先建立 API 请求层，再接页面，避免组件里到处散落 `fetch`。

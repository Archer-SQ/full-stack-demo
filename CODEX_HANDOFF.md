# Codex Handoff

这是唯一的交接文档。另一台电脑上的 Codex 先读这个文件，用来接上当前进度。

更新时间：2026-07-01

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
- 前端部分用户熟悉，可以节奏快一点，但不要私自加 `demo.html` 之外的功能。
- 文档必须同步更新到 `plan.md`，不要只在聊天里解释。
- 提交代码前必须更新本文件。

## 当前最准确的进度

当前已经完成到：

```txt
第 32 步：组件化弹窗，并按 demo.html 补应用配置弹窗
```

已通过：

```txt
后端 python -m compileall app
前端 pnpm build
```

当前前端已经不是临时联调页，而是有正式路由和三个页面：

```txt
/chat       智能问数
/settings   应用配置
/feedbacks  回复校对
```

下一步建议先做浏览器人工验收：

1. 启动 PostgreSQL。
2. 启动 FastAPI 后端。
3. 启动 Vite 前端。
4. 打开 `/chat`、`/settings`、`/feedbacks`。
5. 按 `plan.md` 第 32 步验收应用配置弹窗和回复校对弹窗。

验收通过后，再继续根据 `demo.html` 做剩余视觉和交互细节修正。

## 已完成内容

后端已完成：

1. 安装并确认 Node、pnpm、Python、Docker Desktop。
2. 初始化后端 FastAPI。
3. Docker Compose 启动 PostgreSQL。
4. FastAPI 成功连接 PostgreSQL。
5. `/health` 成功返回 `{"status":"ok"}`。
6. `/health/db` 成功返回 `{"database":"ok"}`。
7. 创建 SQLAlchemy 基类和数据模型。
8. 创建数据库表。
9. 创建 Pydantic Schema。
10. 创建数据库会话依赖 `get_db()`。
11. 初始化 `app_settings` 默认配置数据。
12. 创建并验证应用配置接口。
13. 创建并验证回复校对接口。
14. 创建模拟 AI 服务 `backend/app/services/mock_ai.py`。
15. 创建会话接口 `backend/app/routers/chat.py`。
16. 在 `backend/app/main.py` 挂载 `chat.router`。
17. 用 Swagger 验证会话接口。

前端已完成：

1. 初始化 Vite + React + TypeScript。
2. 配置 Vite `/api` 代理。
3. 创建 API 请求基础层。
4. 创建 `useAsyncData` 和 `toAsyncResult`，避免页面里到处写重复的 try/catch。
5. 安装并使用 `lucide-react` 图标。
6. 使用 `react-router-dom` 创建页面路由。
7. 创建正式应用配置页。
8. 创建正式智能问数页。
9. 创建正式回复校对页。
10. 创建 `AnswerDataView` 展示 AI 回复里的表格、统计和图表数据。
11. 拆分样式文件：
    - `layout.css`
    - `settings.css`
    - `feedback.css`
    - `chat.css`
    - `modal.css`
12. 拆分弹窗组件：
    - `AppModal`
    - `FeedbackHandleModal`
    - `GreetingConfigModal`
    - `HotRecommendConfigModal`
13. 前端 `pnpm build` 通过。

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

## 当前前端结构

重要文件：

```txt
frontend/src/App.tsx
frontend/src/App.css
frontend/src/api/http.ts
frontend/src/api/settings.ts
frontend/src/api/chat.ts
frontend/src/api/feedback.ts
frontend/src/api/types.ts
frontend/src/hooks/useAsyncData.ts
frontend/src/utils/asyncResult.ts
frontend/src/pages/AppConfigPage.tsx
frontend/src/pages/ChatPage.tsx
frontend/src/pages/FeedbackReviewPage.tsx
frontend/src/components/AnswerDataView.tsx
frontend/src/components/AppModal.tsx
frontend/src/components/FeedbackHandleModal.tsx
frontend/src/components/GreetingConfigModal.tsx
frontend/src/components/HotRecommendConfigModal.tsx
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
- 后端会返回 `null` 的字段，前端类型也使用 `xxx | null`。
- React 开发环境下如果看到 GET 请求出现两次，通常是 `StrictMode` 检查副作用导致；只读 GET 安全，POST/PATCH 要避免在 mount effect 中自动触发。

## 当前前端 API 函数

```txt
getSettings()
updateSetting(code, payload)
createFeedback(payload)
getFeedbacks(params)
getFeedback(feedbackId)
updateFeedback(feedbackId, payload)
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

### 弹窗组件边界

当前弹窗拆分规则：

- `AppModal` 是通用壳，只管遮罩、标题、内容区域、底部按钮。
- `FeedbackHandleModal` 负责回复校对处理表单。
- `GreetingConfigModal` 负责对话开场白表单。
- `HotRecommendConfigModal` 负责常问设置表单。

页面仍然负责：

- 当前打开哪个弹窗。
- 保存中的状态。
- 调接口。
- 保存成功后更新页面数据。

不要把请求逻辑塞进弹窗组件里。

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

访问：

```txt
http://127.0.0.1:5173/chat
http://127.0.0.1:5173/settings
http://127.0.0.1:5173/feedbacks
```

## 下一步

先打开：

```txt
plan.md
```

从这里继续：

```txt
第 32 步：组件化弹窗，并按 demo.html 补应用配置弹窗
```

当前第 32 步代码已写完并且 `pnpm build` 通过。

下一台电脑优先做验收：

1. `/feedbacks` 点击 `处理`，确认能打开 `反馈处理` 弹窗。
2. 回复校对弹窗应保持左侧问题和 AI 回复，右侧状态和备注。
3. `/settings` 点击 `对话开场白` 齿轮，确认能打开配置弹窗。
4. 修改开场白或开场问题，保存后确认 Network 有 `PATCH /api/settings/greeting`。
5. `/settings` 点击 `常问设置` 齿轮，确认能打开配置弹窗。
6. 修改阈值，保存后确认 Network 有 `PATCH /api/settings/hot_recommend`。
7. 刷新页面后确认配置保留。

验收后，再继续：

- 对照 `demo.html` 做三页视觉细节修正。
- 检查移动端和窄屏布局。
- 清理开发用 `console.log`。
- 最后准备二面讲解稿。

## 当前仍未完成

- 三个页面还需要最终对照 `demo.html` 逐项验收。
- 应用配置里的 `模型配置` 在原型中会跳模型配置页，但本任务只要求三个页面，暂时不新增第四页。
- 回复校对页的筛选会即时请求，目前已避免整屏闪动，但还需要人工验收交互观感。
- 智能问数页使用 mock AI，还没有接真实大模型。
- 还没有写二面讲解稿。

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
- 前端页面拆分：
  - `pages` 放路由页面。
  - `components` 放可复用组件和业务弹窗。
  - `api` 放接口函数。
  - `styles` 按页面和通用能力拆分样式。
- 弹窗抽成 `AppModal + 业务弹窗组件`，页面只保留数据流和保存逻辑。

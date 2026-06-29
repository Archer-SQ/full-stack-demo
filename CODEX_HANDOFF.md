# Codex Handoff

这是唯一的交接文档。另一台电脑上的 Codex 先读这个文件，用来接上当前进度。

更新时间：2026-06-29

## 项目背景

这是一个面试用全栈 Demo。

目标：

- 前端开发者转全栈能力展示。
- 前端使用 React + TypeScript + Vite。
- 后端使用 Python + FastAPI。
- 数据库使用 PostgreSQL。
- 本地通过 Docker Compose 启动数据库。

用户希望按 `plan.md` 一步一步做。每一步都要解释清楚：

- 这一步做什么。
- 为什么要做。
- 命令是什么意思。
- Python / FastAPI / PostgreSQL 概念尽量用前端知识类比。

重要协作方式：

- 不要一次性把后续所有代码都做完。
- 一次只推进一小步，用户做完发结果，再继续下一步。
- 难懂的 Python 语法要逐行解释，例如 `sum`、`round`、`max(..., key=...)`、`lambda`、`Depends`、`Session`、`db.query()` 等。
- 文档必须同步更新到 `plan.md`，不要只在聊天里解释。

## 当前进度

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
16. 创建会话接口文件 `backend/app/routers/chat.py`，但还没有挂载到 `main.py`。

当前最准确的阶段：

```txt
第 16.2 步已写完 chat.py，并已做语法级检查。
下一步是第 16.3：在 main.py 挂载 chat.router，然后用 Swagger 测试会话接口。
```

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

回复校对接口已用 Swagger 验证通过：

- 创建反馈。
- 按问题关键字筛选。
- 按用户筛选。
- 按状态筛选。
- 分页查询。
- 查询详情。
- 处理反馈，把状态改成 `resolved` 并写入备注。

## 当前已写但尚未联调的代码

### 模拟 AI 服务

文件：

```txt
backend/app/services/mock_ai.py
```

作用：

- 返回第一张原型图里的经营单元收入与目标分析数据。
- 包含表格、统计项、柱状图配置、快捷追问。
- 现在是 mock 数据，后续真实接 AI 时可以替换 `generate_mock_answer()` 内部逻辑。

已执行：

```bash
python -m compileall app
```

结果：通过。

### 会话接口文件

文件：

```txt
backend/app/routers/chat.py
```

已经写了这些接口定义：

```txt
POST /api/sessions
GET  /api/sessions
GET  /api/sessions/{session_id}
POST /api/sessions/{session_id}/messages
```

注意：

- `chat.py` 目前还没有在 `backend/app/main.py` 里挂载。
- 所以 Swagger 里暂时还看不到 `/api/sessions`。
- 下一步才改 `main.py` 并测试。

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

`backend/app/main.py` 当前只挂载了：

```python
app.include_router(settings.router)
app.include_router(feedbacks.router)
```

还没有挂载：

```python
app.include_router(chat.router)
```

下一步要做这个。

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

## 回家后的下一步

先打开：

```txt
plan.md
```

从第 16 步继续。

下一步建议是：

```txt
第 16.3：在 main.py 挂载 chat router
```

要做的事：

1. 修改 `backend/app/main.py`。
2. 导入 `chat` router。
3. 增加 `app.include_router(chat.router)`。
4. 执行 `python -m compileall app`。
5. 启动后端。
6. 打开 Swagger 测试：

```txt
POST /api/sessions
GET  /api/sessions
GET  /api/sessions/{session_id}
POST /api/sessions/{session_id}/messages
```

不要直接跳到前端页面。先把后端会话接口联调通过。

## 当前仍未完成

- 智能问数接口还没 Swagger 验证。
- 配置页前端还没做。
- 回复校对页前端还没做。
- 智能问数页前端还没做。
- 原型页面还没有迁移成 React 组件。

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

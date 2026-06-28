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

原型文件：

```txt
demo.html
```

计划文档：

```txt
plan.md
```

用户希望按 `plan.md` 一步一步做。每一步都要解释清楚：

- 这一步做什么。
- 为什么要做。
- 命令是什么意思。
- 后端概念如何类比前端知识。

当前用户是前端开发，后端、PostgreSQL、Docker 都在学习阶段。

## 当前进度

已完成：

1. 安装并确认环境。
2. 初始化前端 Vite 项目。
3. 初始化后端 FastAPI 项目。
4. Docker 启动 PostgreSQL。
5. FastAPI 成功连接 PostgreSQL。
6. `/health` 成功返回 `{"status":"ok"}`。
7. `/health/db` 成功返回 `{"database":"ok"}`。
8. 创建 SQLAlchemy 基类和数据模型。
9. 创建数据库表。
10. 创建 Pydantic Schema。
11. 创建数据库会话依赖 `get_db()`。
12. 初始化 `app_settings` 默认配置数据。
13. 创建并验证应用配置接口。

当前已经完成到：

```txt
第 14 步：创建应用配置接口
```

当前正在继续：

```txt
第 15 步：创建回复校对接口
```

## 已完成的后端能力

### 数据库表

PostgreSQL 已创建 4 张表：

```txt
app_settings
chat_messages
chat_sessions
feedbacks
```

注意：之前曾经误建成 `feedback` 和字段 `useer_name`，已经修正为：

```txt
feedbacks
user_name
```

### 默认配置数据

`app_settings` 已 seed 6 条配置：

```txt
greeting
suggestions
tts
stt
model_config
hot_recommend
```

本机测试时曾通过 PATCH 把 `tts.enabled` 改成了 `true`。另一台电脑重新建库后，如果只跑 seed，初始值会按 `seed.py` 来：`tts` 和 `stt` 默认是 `false`。

### 已验证接口

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

Swagger 已验证：

- `GET /api/settings` 返回 200，并返回 6 条配置。
- `PATCH /api/settings/tts` 返回 200，可以更新 `enabled` 和 `config`。

## 当前项目结构重点

```txt
full-stack-demo/
  CODEX_HANDOFF.md
  demo.html
  docker-compose.yml
  plan.md
  .vscode/
    settings.json
  backend/
    .env.example
    requirements.txt
    app/
      main.py
      core/
        config.py
      db/
        base.py
        init_db.py
        seed.py
        session.py
      models/
        chat.py
        feedback.py
        setting.py
      routers/
        settings.py
      schemas/
        chat.py
        feedback.py
        setting.py
      services/
  frontend/
    package.json
    pnpm-lock.yaml
    src/
```

还没创建：

```txt
backend/app/routers/feedbacks.py
backend/app/routers/chat.py
```

前端仍基本是 Vite 模板，业务 UI 还没迁移。

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

拉取最新代码：

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
python3.12 -m venv .venv
source .venv/bin/activate
python -m pip install -r requirements.txt
cp .env.example .env
```

如果另一台电脑没有 `python3.12`，至少要用 Python 3.10+。之前 Python 3.9 会导致依赖安装失败，比如 `anyio==4.14.1` 要求 Python 3.10+。

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
http://localhost:5173/
```

## 下一步：第 15 步

继续 `plan.md` 的第 15 步：

```txt
创建回复校对接口
```

要做：

1. 修改 `backend/app/schemas/feedback.py`，增加 `FeedbackListResponse`。
2. 创建 `backend/app/routers/feedbacks.py`。
3. 修改 `backend/app/main.py`，挂载 `feedbacks.router`。
4. 执行 `python -m compileall app`。
5. 用 Swagger 测试 `POST /api/feedbacks`。
6. 测试 `GET /api/feedbacks`。
7. 测试 `GET /api/feedbacks/{feedback_id}`。
8. 测试 `PATCH /api/feedbacks/{feedback_id}`。

计划里的第 15 步已经写了详细代码和解释。

## 当前 Git 状态

上一轮已提交并推送：

```txt
942a2dd Add database foundation and settings API
```

该提交包含：

- 数据库模型。
- 建表脚本。
- seed 脚本。
- Pydantic Schema。
- `get_db()` 数据库会话依赖。
- settings router。
- VS Code Python Black Formatter 配置。
- 详细补充过的 `plan.md`。

本交接文件更新需要再单独提交一次。

## Git 身份配置

本机已配置全局 Git 身份：

```txt
user.name  = Archer-SQ
user.email = 707365172@qq.com
```

## 提交远程前检查

这些文件或目录不要提交：

```txt
backend/.venv/
backend/.env
frontend/node_modules/
frontend/dist/
__pycache__/
*.pyc
*.log
.DS_Store
```

根目录 `.gitignore` 已存在。

## 已踩过的坑

### 1. Python 版本太低

现象：

```txt
No matching distribution found for anyio==4.14.1
Requires-Python >=3.10
```

原因：

- 当前 `.venv` 用的是 Python 3.9。

解决：

```bash
cd backend
deactivate
rm -rf .venv
python3.12 -m venv .venv
source .venv/bin/activate
python -m pip install -r requirements.txt
```

### 2. `No module named 'psycopg'`

原因：

- `uvicorn` 可能使用了系统 Python，而不是 `.venv`。

解决：

```bash
cd backend
source .venv/bin/activate
python -m pip install -r requirements.txt
python -m uvicorn app.main:app --reload
```

不要优先使用：

```bash
uvicorn app.main:app --reload
```

更推荐：

```bash
python -m uvicorn app.main:app --reload
```

### 3. `Did not find any relations.`

这个不是错误。

意思是 PostgreSQL 当前数据库里还没有表。

建表后再执行：

```sql
\dt
```

就应该能看到表。

### 4. Docker 修改 Postgres 密码不生效

`POSTGRES_USER`、`POSTGRES_PASSWORD`、`POSTGRES_DB` 只在数据库第一次初始化时生效。

如果刚开始练习，想重新初始化：

```bash
docker compose down -v
docker compose up -d postgres
```

注意：`down -v` 会删除数据库数据。

### 5. VS Code Black Formatter 没反应

已添加：

```txt
.vscode/settings.json
```

内容指定 Python 默认 formatter 为 Black。

如果还是没反应，检查：

- VS Code 打开的是项目根目录 `full-stack-demo`，不是只打开 `backend`。
- Python 解释器选择的是 `backend/.venv/bin/python`。
- `.venv` 使用 Python 3.12，而不是 3.9。

## 给接手 Codex 的提示

请不要一次性重构项目。

用户要的是“边做边学”的节奏。后续每一步都要解释：

- 为什么现在做这一步。
- 文件为什么放在这里。
- 每段代码是什么意思。
- 命令执行后应该看到什么。
- 常见错误如何判断。

解释风格建议：

- `pip` 类比 `pnpm`。
- `.venv` 类比 Python 的项目依赖隔离环境。
- `uvicorn` 类比 Vite dev server。
- `SQLAlchemy model` 类比 TypeScript type + 数据库映射。
- `Pydantic schema` 类比 TypeScript interface。
- `router` 类比接口路由模块。
- `Docker Compose` 类比多服务启动配置。

# Codex Handoff

这是唯一的交接文档。另一台电脑上的 Codex 先读这个文件，用来接上当前进度。

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

## 当前进度

已完成：

1. 安装并确认环境。
2. 初始化前端 Vite 项目。
3. 初始化后端 FastAPI 项目。
4. Docker 启动 PostgreSQL。
5. FastAPI 已成功连接 PostgreSQL。
6. `/health` 已成功返回 `{"status":"ok"}`。
7. `/health/db` 已成功返回 `{"database":"ok"}`。
8. 已开始创建 SQLAlchemy 数据模型。

当前正在做：

```txt
第 10 步：创建数据库表
```

已经存在的模型文件：

```txt
backend/app/db/base.py
backend/app/models/chat.py
```

还需要继续创建：

```txt
backend/app/models/setting.py
backend/app/models/feedback.py
backend/app/db/init_db.py
```

然后执行：

```bash
cd backend
source .venv/bin/activate
python -m app.db.init_db
```

再进入 PostgreSQL 检查：

```bash
cd ..
docker compose exec postgres psql -U archer -d fullstack_demo
\dt
\q
```

预期能看到 4 张表：

```txt
app_settings
chat_messages
chat_sessions
feedbacks
```

## 当前项目结构

```txt
full-stack-demo/
  demo.html
  plan.md
  docker-compose.yml
  backend/
    .env
    .env.example
    requirements.txt
    app/
      main.py
      core/
        config.py
      db/
        base.py
        session.py
      models/
        chat.py
      routers/
      schemas/
      services/
  frontend/
    package.json
    pnpm-lock.yaml
    src/
```

## 重要本地配置

`docker-compose.yml` 当前 PostgreSQL 配置：

```yaml
POSTGRES_DB: fullstack_demo
POSTGRES_USER: archer
POSTGRES_PASSWORD: 123456
```

`backend/.env` 当前数据库连接：

```env
DATABASE_URL=postgresql+psycopg://archer:123456@localhost:5432/fullstack_demo
```

注意：

- 当前后端是在本机运行，所以数据库地址用 `localhost`。
- 以后如果后端也放进 Docker，数据库地址要改成 `postgres`。
- 不要把真实生产密码提交到远程仓库。

## 启动方式

### 启动 PostgreSQL

```bash
cd ~/Desktop/full-stack-demo
docker compose up -d postgres
docker compose ps
```

### 启动后端

```bash
cd ~/Desktop/full-stack-demo/backend
source .venv/bin/activate
python -m uvicorn app.main:app --reload
```

访问：

```txt
http://127.0.0.1:8000/health
http://127.0.0.1:8000/health/db
http://127.0.0.1:8000/docs
```

### 启动前端

```bash
cd ~/Desktop/full-stack-demo/frontend
pnpm dev
```

访问：

```txt
http://localhost:5173/
```

## 另一台电脑恢复环境

拉取代码后：

```bash
cd full-stack-demo
```

启动 PostgreSQL：

```bash
docker compose up -d postgres
```

准备后端：

```bash
cd backend
python3 -m venv .venv
source .venv/bin/activate
python -m pip install -r requirements.txt
```

如果仓库里没有 `.env`，新建：

```bash
cp .env.example .env
```

启动后端：

```bash
python -m uvicorn app.main:app --reload
```

准备前端：

```bash
cd ../frontend
pnpm install
pnpm dev
```

## 提交远程前检查

这些文件或目录不要提交：

```txt
backend/.venv/
backend/.env
frontend/node_modules/
__pycache__/
*.pyc
```

建议根目录添加 `.gitignore`：

```gitignore
# Python
backend/.venv/
__pycache__/
*.pyc

# Env
backend/.env
.env

# Frontend
frontend/node_modules/
frontend/dist/

# System
.DS_Store
```

## 已踩过的坑

### 1. `No module named 'psycopg'`

原因：

- `uvicorn` 可能使用了系统 Python，而不是 `.venv`。

解决：

```bash
cd backend
source .venv/bin/activate
python -m pip install sqlalchemy "psycopg[binary]" python-dotenv
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

### 2. `Did not find any relations.`

这个不是错误。

意思是 PostgreSQL 当前数据库里还没有表。

建表后再执行：

```sql
\dt
```

就应该能看到表。

### 3. Docker 修改 Postgres 密码不生效

`POSTGRES_USER`、`POSTGRES_PASSWORD`、`POSTGRES_DB` 只在数据库第一次初始化时生效。

如果刚开始练习，想重新初始化：

```bash
docker compose down -v
docker compose up -d postgres
```

注意：`down -v` 会删除数据库数据。

## 下一步建议

继续完成 `plan.md` 的第 10 步：

1. 创建 `setting.py`。
2. 创建 `feedback.py`。
3. 创建 `init_db.py`。
4. 执行建表脚本。
5. 用 `\dt` 验证 4 张表。

完成建表后，再进入下一步：

```txt
编写种子数据和第一批 CRUD 接口
```

## 给接手 Codex 的提示

请不要一次性重构项目。

用户希望被一步一步带着做，每一步需要解释：

- 这一步做什么
- 为什么要做
- 命令是什么意思
- 可以用前端知识类比解释后端概念

当前用户是前端开发，后端、PostgreSQL、Docker 都是初学。

解释风格建议：

- `pip` 类比 `pnpm`
- `.venv` 类比 Python 版依赖隔离环境
- `uvicorn` 类比 Vite dev server
- `SQLAlchemy model` 类比 TypeScript type + 数据库映射
- `router` 类比接口路由
- `schema` 类比 TypeScript interface
- `Docker Compose` 类比多服务启动配置

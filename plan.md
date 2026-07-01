# Full Stack Demo Plan

规则：一次只做一步。你完成当前步骤后，把结果发我，我再补下一步。

## 技术选型

- 前端：React + TypeScript + Vite
- 包管理器：pnpm
- 后端：Python + FastAPI
- 数据库：PostgreSQL
- 本地运行：Docker Compose

原因：这套组合简单、清晰、适合 CRUD，也方便二面讲解。

## 第 1 步：安装/确认环境（已完成）

你需要准备这些工具：

| 工具 | 用来干什么 |
| --- | --- |
| Node.js | 运行前端项目，React/Vite 依赖它 |
| pnpm | 安装前端依赖包，比 npm 更快，也更适合现代前端项目 |
| Python | 运行后端项目，FastAPI 依赖它 |
| Docker Desktop | 本地启动 PostgreSQL，也可以一键启动前端、后端、数据库 |
| VS Code | 写代码用，非必须但推荐 |

安装建议：

- Node.js：安装 LTS 版本
- pnpm：用 Node 自带的 Corepack 启用
- Python：安装 3.11 或以上版本
- Docker Desktop：安装 Mac 版本，安装后打开一次

启用 pnpm：

```bash
corepack enable
corepack prepare pnpm@latest --activate
```

检查命令：

```bash
node -v
pnpm -v
python3 --version
docker --version
docker compose version
```

你现在要做：

1. 安装缺少的工具。
2. 执行上面的检查命令。
3. 把输出结果发给我。

你的当前结果：

| 工具 | 状态 |
| --- | --- |
| Node.js | 已安装：v22.21.1 |
| pnpm | 已安装：11.9.0 |
| Python | 已安装：3.13.7 |
| Docker Desktop | 已安装：Docker 29.5.3 / Docker Compose v5.1.4 |

## 第 2 步：确认 Demo 页面范围（已完成）

根据截图，第一版做这 3 个页面：

1. 智能问数
2. 应用配置
3. 回复校对

### 页面 1：智能问数

需要做的功能：

1. 左侧近 30 天会话列表
2. 开启新对话
3. 点击历史会话切换内容
4. 输入问题并发送
5. 后端返回一条模拟 AI 回复
6. AI 回复包含：
   - 数据表格
   - 数据统计
   - 柱状图数据
   - 耗时、Token、回复时间
   - 下一步问题建议
7. 点击下一步问题建议，可以继续发送问题
8. 点击“数据有误/反馈”按钮，生成一条回复校对数据

说明：第一版不接真实大模型，后端根据问题关键词返回模拟分析结果。这样重点放在全栈数据流和 CRUD。

### 页面 2：应用配置

需要做的功能：

1. 展示 6 个配置卡片：
   - 对话开场白
   - 下一步问题建议
   - 文字转语音
   - 语音转文字
   - 模型配置
   - 常问设置
2. 每个配置支持开关
3. 配置状态保存到数据库
4. 对话开场白支持编辑引导语
5. 模型配置支持保存模型名称
6. 常问设置支持保存常问阈值

说明：语音能力第一版只做配置开关，不实现真实语音播放或录音。

### 页面 3：回复校对

需要做的功能：

1. 反馈列表表格
2. 按问题搜索
3. 按用户搜索
4. 按状态筛选
5. 分页
6. 点击处理
7. 处理弹窗里填写处理备注
8. 保存后状态变为已处理

### 后端数据

1. 智能问数：会话、消息
2. 应用配置：开关配置、开场白、快捷问题、模型配置
3. 回复校对：反馈列表、处理状态、处理备注

## 第 3 步：设计数据库表和接口

这一版先设计 4 张表：

| 表名 | 存什么 |
| --- | --- |
| `chat_sessions` | 智能问数的会话 |
| `chat_messages` | 每个会话里的用户提问和 AI 回复 |
| `app_settings` | 应用配置页的 6 个配置卡片 |
| `feedbacks` | 回复校对页的反馈处理数据 |

原因：这 4 张表刚好覆盖 3 个页面，不会过度设计，也能完整体现 CRUD。

### 表 1：`chat_sessions`

字段：

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| `id` | integer | 主键 |
| `title` | varchar | 会话标题 |
| `created_at` | timestamp | 创建时间 |
| `updated_at` | timestamp | 更新时间 |

用途：

- 左侧“近 30 天记录”
- 新建对话
- 点击历史会话切换内容

### 表 2：`chat_messages`

字段：

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| `id` | integer | 主键 |
| `session_id` | integer | 所属会话 |
| `role` | varchar | `user` 或 `assistant` |
| `content` | text | 消息正文 |
| `answer_data` | jsonb | AI 回复里的表格、统计、图表、建议问题 |
| `elapsed_ms` | integer | 模拟耗时 |
| `token_count` | integer | 模拟 Token 数 |
| `created_at` | timestamp | 创建时间 |

用途：

- 保存用户问题
- 保存 AI 回复
- 展示表格、统计信息、柱状图、下一步问题建议

说明：`jsonb` 是 PostgreSQL 的 JSON 类型，适合存 AI 回复这种结构不固定的数据。

### 表 3：`app_settings`

字段：

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| `id` | integer | 主键 |
| `code` | varchar | 配置编码，例如 `greeting` |
| `name` | varchar | 配置名称 |
| `description` | text | 配置说明 |
| `enabled` | boolean | 是否开启 |
| `config` | jsonb | 额外配置，例如开场白、模型名称、常问阈值 |
| `updated_at` | timestamp | 更新时间 |

用途：

- 展示 6 个配置卡片
- 保存开关状态
- 保存开场白、模型名称、常问阈值

### 表 4：`feedbacks`

字段：

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| `id` | integer | 主键 |
| `user_name` | varchar | 反馈用户 |
| `question` | text | 用户问题 |
| `ai_answer` | text | AI 回复摘要 |
| `status` | varchar | `pending` 或 `resolved` |
| `remark` | text | 处理备注 |
| `message_id` | integer | 来源 AI 消息，可为空 |
| `created_at` | timestamp | 反馈时间 |
| `handled_at` | timestamp | 处理时间，可为空 |

用途：

- 回复校对列表
- 搜索问题
- 搜索用户
- 按状态筛选
- 处理反馈并保存备注

## 接口设计

### 基础接口

```txt
GET /health
```

### 智能问数接口

```txt
GET  /api/sessions
POST /api/sessions
GET  /api/sessions/{session_id}
POST /api/sessions/{session_id}/messages
POST /api/messages/{message_id}/feedback
```

### 应用配置接口

```txt
GET   /api/settings
PATCH /api/settings/{code}
```

### 回复校对接口

```txt
GET   /api/feedbacks
GET   /api/feedbacks/{feedback_id}
PATCH /api/feedbacks/{feedback_id}
```

`GET /api/feedbacks` 支持参数：

```txt
question=
user=
status=
page=
page_size=
```

你现在要做：

确认这 4 张表和这些接口是否 OK。

## 第 4 步：创建项目目录（已完成）

这一步只创建目录，不写业务代码。

原因：先把前端、后端、文档、Docker 文件的位置固定下来，后面每个文件该放哪里就不会乱。

在终端执行：

```bash
cd ~/Desktop/full-stack-demo

mkdir -p frontend
mkdir -p backend/app/core
mkdir -p backend/app/db
mkdir -p backend/app/models
mkdir -p backend/app/schemas
mkdir -p backend/app/routers
mkdir -p backend/app/services
mkdir -p docs

touch backend/app/__init__.py
touch backend/app/core/__init__.py
touch backend/app/db/__init__.py
touch backend/app/models/__init__.py
touch backend/app/schemas/__init__.py
touch backend/app/routers/__init__.py
touch backend/app/services/__init__.py
```

目录用途：

| 目录 | 用途 |
| --- | --- |
| `frontend` | React 前端项目 |
| `backend` | Python 后端项目 |
| `backend/app/core` | 配置相关代码 |
| `backend/app/db` | 数据库连接 |
| `backend/app/models` | SQLAlchemy 数据表模型 |
| `backend/app/schemas` | Pydantic 请求/响应类型 |
| `backend/app/routers` | FastAPI 接口路由 |
| `backend/app/services` | 业务逻辑 |
| `docs` | 放接口说明、二面讲解材料 |

执行完成后，检查目录：

```bash
find . -maxdepth 3 -type d | sort
```

## 第 5 步：初始化前端项目（已完成）

这一步只初始化 React + TypeScript + Vite，不写页面。

原因：Vite 相当于前端开发服务器和构建工具，负责让 React 项目能本地启动、热更新、打包。

在终端执行：

```bash
cd ~/Desktop/full-stack-demo
pnpm create vite frontend --template react-ts
```

如果提示：

```txt
Directory frontend is not empty. Remove existing files and continue?
```

选择：

```txt
Ignore files and continue
```

然后安装依赖：

```bash
cd frontend
pnpm install
```

启动前端：

```bash
pnpm dev
```

看到类似下面的输出就说明启动成功：

```txt
Local: http://localhost:5173/
```

## 第 6 步：初始化后端 FastAPI（已完成）

这一步只让后端跑起来，并提供一个健康检查接口。

原因：后端先跑通 `/health`，再接数据库；这样出问题时能判断是 Python 服务问题，还是数据库连接问题。

### 6.1 进入后端目录

```bash
cd ~/Desktop/full-stack-demo/backend
```

解释：

- `cd` 是进入目录。
- 我们要在 `backend` 目录里操作，因为后端依赖、后端代码都放这里。

前端类比：

- 类似你写 React 项目前先 `cd frontend`，再执行 `pnpm install`。

### 6.2 创建 Python 虚拟环境

```bash
python3 -m venv .venv
```

解释：

- `python3`：使用 Python。
- `-m venv`：调用 Python 自带的虚拟环境工具。
- `.venv`：虚拟环境目录名。

前端类比：

- `.venv` 可以理解成 Python 版的 `node_modules`。
- 它把当前项目的 Python 依赖隔离起来，避免污染你电脑上的全局 Python。

创建后，`backend` 目录里会多一个 `.venv` 文件夹。

### 6.3 启用虚拟环境

```bash
source .venv/bin/activate
```

解释：

- 这句命令表示：接下来安装和运行 Python 包，都使用当前项目的 `.venv` 环境。
- 启用成功后，终端前面一般会出现 `(.venv)`。

前端类比：

- 有点像告诉终端：“接下来用这个项目自己的依赖环境”。

如果后面你新开终端，要重新执行这句。

### 6.4 安装后端依赖

```bash
pip install fastapi uvicorn
```

解释：

- `pip`：Python 的包管理器，可以类比 `pnpm`。
- `fastapi`：后端框架，负责声明接口。
- `uvicorn`：后端开发服务器，负责把 FastAPI 应用跑起来。

前端类比：

- `fastapi` 类似前端里的框架能力，比如 React 负责组织 UI。
- `uvicorn` 类似 Vite dev server，负责本地启动服务。

### 6.5 创建后端入口文件

创建文件：

```txt
backend/app/main.py
```

写入：

```bash
from fastapi import FastAPI

app = FastAPI(title="Full Stack Demo API")


@app.get("/health")
def health_check():
    return {"status": "ok"}
```

解释：

- `from fastapi import FastAPI`：从 FastAPI 包里引入 FastAPI。
- `app = FastAPI(...)`：创建后端应用实例。
- `@app.get("/health")`：声明一个 GET 接口，地址是 `/health`。
- `def health_check()`：接口处理函数。
- `return {"status": "ok"}`：返回 JSON 数据。

前端类比：

- `app = FastAPI()` 类似创建一个应用入口。
- `@app.get("/health")` 类似配置一个路由。
- `return {"status": "ok"}` 类似接口返回给前端的 JSON。

### 6.6 启动后端

在 `backend` 目录执行：

```bash
uvicorn app.main:app --reload
```

解释：

- `uvicorn`：启动后端服务。
- `app.main:app`：
  - `app.main` 表示 `app/main.py` 这个文件。
  - 最后的 `app` 表示文件里的 `app = FastAPI(...)`。
- `--reload`：代码改了自动重启，类似前端热更新。

看到类似下面的输出说明启动成功：

```txt
Uvicorn running on http://127.0.0.1:8000
```

### 6.7 验证后端接口

浏览器打开：

```txt
http://127.0.0.1:8000/health
```

如果看到下面的内容，说明后端成功：

```json
{"status":"ok"}
```

也可以打开接口文档：

```txt
http://127.0.0.1:8000/docs
```

解释：

- FastAPI 会自动生成 Swagger 接口文档。
- 这点很适合二面展示，因为面试官可以直接看到你有哪些接口。

你现在要做：

1. 创建 Python 虚拟环境。
2. 安装 FastAPI 和 Uvicorn。
3. 创建 `backend/app/main.py`。
4. 启动后端。
5. 把 `/health` 页面结果发给我。

## 第 7 步：固定后端依赖（已完成）

这一步把当前安装过的 Python 包记录下来。

原因：前端有 `package.json` 记录依赖；Python 后端常用 `requirements.txt` 记录依赖。别人拿到项目后，可以按这个文件安装同样的后端依赖。

确认你当前终端已经在后端虚拟环境里。

如果终端前面没有 `(.venv)`，先执行：

```bash
cd ~/Desktop/full-stack-demo/backend
source .venv/bin/activate
```

生成依赖文件：

```bash
pip freeze > requirements.txt
```

查看文件内容：

```bash
cat requirements.txt
```

你应该能看到类似：

```txt
fastapi==...
uvicorn==...
```

前端类比：

- `requirements.txt` 类似后端版的 `package.json` 依赖清单。
- `pip freeze` 类似把当前安装的包版本导出来。

你现在要做：

1. 确保虚拟环境已启用。
2. 执行 `pip freeze > requirements.txt`。
3. 执行 `cat requirements.txt`。
4. 把输出结果发给我。

## 第 8 步：用 Docker 启动 PostgreSQL（已完成）

这一步只启动数据库，不改后端代码。

原因：先确认 PostgreSQL 能通过 Docker 跑起来，再让 FastAPI 连接数据库。这样问题更容易定位。

### 8.1 在项目根目录创建 `docker-compose.yml`

创建文件：

```txt
~/Desktop/full-stack-demo/docker-compose.yml
```

写入：

```yaml
services:
  postgres:
    image: postgres:16
    container_name: full_stack_demo_postgres
    restart: unless-stopped
    environment:
      POSTGRES_DB: fullstack_demo
      POSTGRES_USER: demo_user
      POSTGRES_PASSWORD: demo_password
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data

volumes:
  postgres_data:
```

解释：

- `postgres`：服务名，后面后端在 Docker 里会用这个名字连接数据库。
- `image: postgres:16`：使用 PostgreSQL 16 镜像。
- `POSTGRES_DB`：自动创建的数据库名。
- `POSTGRES_USER`：数据库用户名。
- `POSTGRES_PASSWORD`：数据库密码。
- `5432:5432`：把容器里的 5432 端口映射到你电脑的 5432 端口。
- `postgres_data`：数据库数据卷，容器重启后数据不会丢。

为什么这里用 `postgres:16`：

- PostgreSQL 16 是稳定大版本，功能够新，生态兼容性也好。
- 它还在官方支持期内，适合 Demo 和真实业务入门。
- 不直接用 `latest`，是为了避免以后 PostgreSQL 大版本自动变化，导致本地环境不一致。

业务中选版本的原则：

- 新项目：选当前仍在支持期内、团队和云平台都支持的稳定版本。
- 老项目：优先保持现有大版本，只做小版本安全升级。
- 不建议：生产环境直接使用 `latest` 标签。

前端类比：

- `docker-compose.yml` 类似一个项目启动配置。
- `postgres` 服务类似前端项目里的一个独立 dev server。
- `volumes` 有点像持久化存储，不是浏览器的 `localStorage`，但作用都是“重启后数据还在”。

### 8.2 启动 PostgreSQL

在项目根目录执行：

```bash
cd ~/Desktop/full-stack-demo
docker compose up -d postgres
```

解释：

- `docker compose up`：按 `docker-compose.yml` 启动服务。
- `-d`：后台运行。
- `postgres`：只启动 PostgreSQL 这个服务。

### 8.3 检查容器是否启动

```bash
docker compose ps
```

如果看到 `postgres` 状态是 `running` 或 `Up`，说明数据库容器启动成功。

### 8.4 测试能否进入数据库

```bash
docker compose exec postgres psql -U demo_user -d fullstack_demo
```

进入后会看到类似：

```txt
fullstack_demo=#
```

执行：

```sql
\dt
```

现在还没有建表，所以可能看到：

```txt
Did not find any relations.
```

退出 PostgreSQL：

```sql
\q
```

你现在要做：

1. 创建 `docker-compose.yml`。
2. 启动 PostgreSQL。
3. 执行 `docker compose ps`。
4. 进入数据库执行 `\dt`。
5. 把结果发给我。

## 第 9 步：让 FastAPI 连接 PostgreSQL（已完成）

这一步只做数据库连接测试，不建业务表。

原因：先确认 FastAPI 能连上 PostgreSQL，再写表模型和 CRUD。这样如果后面出错，可以排除“数据库连不上”这个问题。

### 9.1 安装数据库相关依赖

在后端目录执行：

```bash
cd ~/Desktop/full-stack-demo/backend
source .venv/bin/activate
pip install sqlalchemy "psycopg[binary]" python-dotenv
pip freeze > requirements.txt
```

解释：

- `sqlalchemy`：Python 里的 ORM，用 Python 类操作数据库表。
- `psycopg`：Python 连接 PostgreSQL 的驱动。
- `python-dotenv`：读取 `.env` 环境变量文件。

前端类比：

- `sqlalchemy` 有点像后端版的数据访问层，后面会把数据库表映射成 Python 类。
- `psycopg` 类似浏览器里的网络能力，负责真正和 Postgres 通信。
- `.env` 类似前端项目里的 `.env.local`，用来放接口地址、数据库地址这种配置。

### 9.2 创建后端环境变量文件

创建文件：

```txt
backend/.env
```

写入：

```env
DATABASE_URL=postgresql+psycopg://demo_user:demo_password@localhost:5432/fullstack_demo
```

解释：

- `demo_user`：数据库用户名。
- `demo_password`：数据库密码。
- `localhost:5432`：本机访问 Docker 里的 Postgres。
- `fullstack_demo`：数据库名。

注意：

- 现在后端是在你电脑本机运行，所以这里写 `localhost`。
- 以后后端也放进 Docker 后，连接地址会改成 `postgres`，也就是 Docker Compose 里的服务名。

### 9.3 创建配置文件

创建文件：

```txt
backend/app/core/config.py
```

写入：

```python
import os

from dotenv import load_dotenv

load_dotenv()

DATABASE_URL = os.getenv(
    "DATABASE_URL",
    "postgresql+psycopg://demo_user:demo_password@localhost:5432/fullstack_demo",
)
```

解释：

- `load_dotenv()`：读取 `.env` 文件。
- `os.getenv("DATABASE_URL")`：读取数据库连接地址。
- 第二个参数是默认值，防止 `.env` 没读到时程序直接崩。

### 9.4 创建数据库连接文件

创建文件：

```txt
backend/app/db/session.py
```

写入：

```python
from sqlalchemy import create_engine, text
from sqlalchemy.orm import sessionmaker

from app.core.config import DATABASE_URL

engine = create_engine(DATABASE_URL, echo=True)
SessionLocal = sessionmaker(bind=engine, autoflush=False, autocommit=False)


def check_database_connection() -> bool:
    with engine.connect() as connection:
        connection.execute(text("SELECT 1"))
    return True
```

解释：

- `create_engine`：创建数据库连接引擎。
- `SessionLocal`：后面每次操作数据库时，会从这里创建一个数据库会话。
- `text("SELECT 1")`：执行一条最简单的 SQL，用来测试数据库是否能连通。

逐行解释：

```python
engine = create_engine(DATABASE_URL, echo=True)
```

- `DATABASE_URL` 是数据库连接地址，告诉程序要连哪个数据库。
- `create_engine(...)` 会创建一个数据库引擎。
- 这个 `engine` 不等于一次具体查询，而是整个应用连接数据库的入口。
- `echo=True` 表示把 SQLAlchemy 执行的 SQL 打印到终端，开发阶段方便调试。

前端类比：

- `engine` 有点像提前创建好的 `axios instance`。
- `DATABASE_URL` 类似 `baseURL`。
- `echo=True` 类似打开请求日志，方便看到实际发了什么请求。

```python
SessionLocal = sessionmaker(bind=engine, autoflush=False, autocommit=False)
```

- `sessionmaker(...)` 是一个“数据库会话工厂”。
- 后面每次接口要操作数据库时，都会从 `SessionLocal()` 创建一个新的数据库会话。
- `bind=engine` 表示这个会话使用上面创建的数据库引擎。
- `autoflush=False` 表示不会在查询前自动把临时改动同步到数据库。
- `autocommit=False` 表示不会自动提交事务，需要我们明确提交。

前端类比：

- `SessionLocal` 像一个创建请求客户端的函数。
- 每个接口请求来了，就创建一个会话；请求结束后关闭。
- `autocommit=False` 类似你不会一改表单就立刻提交，而是点“保存”后才真正提交。

```python
def check_database_connection() -> bool:
```

- 定义一个函数，用来检查数据库能不能连通。
- `-> bool` 是 Python 的类型提示，表示这个函数预期返回布尔值。

前端类比：

- 类似 TypeScript 里的函数返回值声明：

```ts
function checkDatabaseConnection(): boolean {}
```

```python
with engine.connect() as connection:
```

- `engine.connect()` 创建一次真实数据库连接。
- `with ... as ...` 表示用完后自动关闭连接。

前端类比：

- 类似你发起一次请求，请求结束后自动释放资源。
- 不需要手动写 `connection.close()`，`with` 会帮你处理。

```python
connection.execute(text("SELECT 1"))
```

- 执行一条 SQL。
- `SELECT 1` 不查业务数据，只让数据库返回数字 `1`。
- 如果这句能执行成功，说明数据库连接正常。
- `text(...)` 是 SQLAlchemy 用来包裹原生 SQL 字符串的方法。

前端类比：

- 类似调用一个最简单的健康检查接口：

```ts
await api.get("/health")
```

```python
return True
```

- 如果前面的 SQL 没报错，就返回 `True`。
- 如果数据库连不上，前面会直接抛异常，接口就会报错。

这段代码现在只负责“测试连接”，还不会创建表，也不会读写业务数据。

前端类比：

- `engine` 可以理解成数据库请求客户端。
- `SessionLocal` 类似每次发请求前创建一个可用的 client 实例。
- `SELECT 1` 类似调用一个最简单的 ping 接口。

### 9.5 修改 `main.py`

打开文件：

```txt
backend/app/main.py
```

改成：

```python
from fastapi import FastAPI

from app.db.session import check_database_connection

app = FastAPI(title="Full Stack Demo API")


@app.get("/health")
def health_check():
    return {"status": "ok"}


@app.get("/health/db")
def database_health_check():
    check_database_connection()
    return {"database": "ok"}
```

解释：

- `/health`：只测试 FastAPI 是否运行。
- `/health/db`：测试 FastAPI 是否能连接 PostgreSQL。

### 9.6 启动并验证

如果后端服务还在运行，先按：

```txt
Ctrl + C
```

然后重新启动：

```bash
cd ~/Desktop/full-stack-demo/backend
source .venv/bin/activate
uvicorn app.main:app --reload
```

浏览器打开：

```txt
http://127.0.0.1:8000/health/db
```

看到：

```json
{"database":"ok"}
```

就说明 FastAPI 已经成功连上 PostgreSQL。

你现在要做：

1. 安装数据库依赖。
2. 创建 `.env`。
3. 创建 `app/core/config.py`。
4. 创建 `app/db/session.py`。
5. 修改 `app/main.py`。
6. 启动后端并访问 `/health/db`。
7. 把结果发给我。

### 9.7 常见错误：No module named 'psycopg'

如果启动时报错：

```txt
ModuleNotFoundError: No module named 'psycopg'
```

意思是当前 Python 环境里没有安装 PostgreSQL 驱动。

先停止后端：

```txt
Ctrl + C
```

然后重新安装依赖：

```bash
cd ~/Desktop/full-stack-demo/backend
source .venv/bin/activate
python -m pip install sqlalchemy "psycopg[binary]" python-dotenv
python -m pip freeze > requirements.txt
python -c "import psycopg; print(psycopg.__version__)"
```

解释：

- `python -m pip` 比直接写 `pip` 更稳，能确保包安装到当前启用的 `.venv` 里。
- `psycopg` 是 Python 连接 PostgreSQL 的驱动。
- `python -c "import psycopg; ..."` 是快速验证这个包是否真的能被 Python 找到。

验证成功后重新启动：

```bash
uvicorn app.main:app --reload
```

如果还是报 `No module named 'psycopg'`，并且报错路径里出现：

```txt
/Library/Frameworks/Python.framework/...
```

说明当前启动后端时用的是系统 Python，不是项目里的 `.venv`。

按下面方式检查：

```bash
cd ~/Desktop/full-stack-demo/backend
source .venv/bin/activate
which python
which uvicorn
python -c "import sys; print(sys.executable)"
python -c "import psycopg; print(psycopg.__version__)"
```

正常情况下，`which python` 应该包含：

```txt
~/Desktop/full-stack-demo/backend/.venv/bin/python
```

如果 `which uvicorn` 不是 `.venv/bin/uvicorn`，就不要直接用 `uvicorn` 启动，改用：

```bash
python -m uvicorn app.main:app --reload
```

解释：

- `uvicorn app.main:app --reload` 可能会调用到全局的 Uvicorn。
- `python -m uvicorn app.main:app --reload` 会强制使用当前 `.venv` 里的 Python 来启动 Uvicorn。
- 这和前端里用项目内依赖运行命令类似，避免调用到全局工具。

## 第 10 步：创建数据库表

这一步用 SQLAlchemy 定义 4 张业务表，并在 PostgreSQL 里创建出来。

原因：现在 FastAPI 已经能连上数据库，下一步要让数据库里真正有表，后面接口才能做新增、查询、修改、删除。

前端类比：

- SQLAlchemy Model 像 TypeScript 里的 `interface` + 数据库映射。
- `Base.metadata.create_all(...)` 像根据模型定义生成真实数据库表。
- 生产项目通常用 Alembic 做数据库迁移；这个 Demo 先用 `create_all`，更容易理解。

### 10.1 创建 SQLAlchemy 基类

创建文件：

```txt
backend/app/db/base.py
```

写入：

```python
from sqlalchemy.orm import DeclarativeBase


class Base(DeclarativeBase):
    pass
```

解释：

- `Base` 是所有数据库模型的父类。
- 后面每个表模型都会继承 `Base`。
- SQLAlchemy 会通过 `Base` 收集所有表结构。

前端类比：

- 有点像所有页面组件都遵守 React Component 的规则。
- 这里所有数据库表模型都遵守 SQLAlchemy Model 的规则。

### 10.2 创建智能问数模型

创建文件：

```txt
backend/app/models/chat.py
```

写入：

```python
from sqlalchemy import DateTime, ForeignKey, Integer, String, Text, func
from sqlalchemy.dialects.postgresql import JSONB
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base


class ChatSession(Base):
    __tablename__ = "chat_sessions"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    title: Mapped[str] = mapped_column(String(200), nullable=False)
    created_at: Mapped[DateTime] = mapped_column(DateTime(timezone=True), server_default=func.now())
    updated_at: Mapped[DateTime] = mapped_column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

    messages: Mapped[list["ChatMessage"]] = relationship(
        back_populates="session",
        cascade="all, delete-orphan",
    )


class ChatMessage(Base):
    __tablename__ = "chat_messages"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    session_id: Mapped[int] = mapped_column(ForeignKey("chat_sessions.id"), nullable=False, index=True)
    role: Mapped[str] = mapped_column(String(20), nullable=False)
    content: Mapped[str] = mapped_column(Text, nullable=False)
    answer_data: Mapped[dict | None] = mapped_column(JSONB, nullable=True)
    elapsed_ms: Mapped[int | None] = mapped_column(Integer, nullable=True)
    token_count: Mapped[int | None] = mapped_column(Integer, nullable=True)
    created_at: Mapped[DateTime] = mapped_column(DateTime(timezone=True), server_default=func.now())

    session: Mapped[ChatSession] = relationship(back_populates="messages")
```

解释：

- `__tablename__` 是数据库里的真实表名。
- `id` 是主键。
- `Mapped[...]` 是 SQLAlchemy 2.x 的类型写法。
- `mapped_column(...)` 定义数据库字段。
- `ForeignKey("chat_sessions.id")` 表示消息属于某个会话。
- `relationship(...)` 表示 Python 里可以通过会话拿到消息列表。
- `JSONB` 是 PostgreSQL 的 JSON 类型，适合存 AI 回复里的表格、统计、图表数据。

前端类比：

- `ChatSession` 像一个会话类型。
- `ChatMessage` 像一个消息类型。
- `session_id` 像前端数据里的关联字段。
- `answer_data` 像一个对象字段，可以存结构化数据。

两个类的关系：

- `ChatSession` 表示一次对话会话。
- `ChatMessage` 表示这次会话里的每一条消息。
- 一个 `ChatSession` 可以有很多条 `ChatMessage`。
- 一条 `ChatMessage` 只属于一个 `ChatSession`。

前端数据类比：

```ts
type ChatSession = {
  id: number
  title: string
  messages: ChatMessage[]
}

type ChatMessage = {
  id: number
  sessionId: number
  role: "user" | "assistant"
  content: string
}
```

#### `ChatSession` 逐项解释

```python
class ChatSession(Base):
```

- 定义一个数据库模型类。
- 继承 `Base`，表示它会被 SQLAlchemy 当成一张表来管理。

```python
__tablename__ = "chat_sessions"
```

- 指定数据库里的表名。
- 最后创建出来的表就叫 `chat_sessions`。

```python
id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
```

- `id` 是主键。
- `Integer` 表示整数。
- `primary_key=True` 表示主键，每条记录唯一。
- `index=True` 表示给这个字段建索引，查询更快。

前端类比：

- 类似列表数据里每条记录都有唯一 `id`，React 渲染列表时也常用它做 `key`。

```python
title: Mapped[str] = mapped_column(String(200), nullable=False)
```

- `title` 是会话标题。
- `String(200)` 表示最多 200 个字符。
- `nullable=False` 表示不能为空。

```python
created_at: Mapped[DateTime] = mapped_column(DateTime(timezone=True), server_default=func.now())
```

- `created_at` 是创建时间。
- `DateTime(timezone=True)` 表示带时区的时间。
- `server_default=func.now()` 表示由数据库自动填当前时间。

```python
updated_at: Mapped[DateTime] = mapped_column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())
```

- `updated_at` 是更新时间。
- 创建时默认当前时间。
- 更新记录时自动改成当前时间。

```python
messages: Mapped[list["ChatMessage"]] = relationship(...)
```

- 这不是普通字段，不会直接变成数据库列。
- 它表示 Python 对象层面的关系。
- 有了它之后，可以通过 `session.messages` 拿到这个会话下的所有消息。

前端类比：

- 数据库里实际是两张表分开存。
- 但 Python 里可以像访问嵌套对象一样访问：

```python
session.messages
```

类似前端里：

```ts
session.messages.map(...)
```

```python
back_populates="session"
```

- 表示它和 `ChatMessage` 里的 `session` 字段互相对应。
- `ChatSession.messages` 指向多条消息。
- `ChatMessage.session` 指回所属会话。

```python
cascade="all, delete-orphan"
```

- 级联操作规则。
- 如果删除一个会话，它下面的消息也一起删除。
- `delete-orphan` 表示消息如果脱离了会话，也应该被删除。

前端类比：

- 如果删除一个聊天会话，聊天记录也不应该孤零零留在列表里。

#### `ChatMessage` 逐项解释

```python
class ChatMessage(Base):
```

- 定义消息表模型。

```python
__tablename__ = "chat_messages"
```

- 数据库表名是 `chat_messages`。

```python
session_id: Mapped[int] = mapped_column(ForeignKey("chat_sessions.id"), nullable=False, index=True)
```

- `session_id` 是外键。
- 它指向 `chat_sessions.id`。
- 表示这条消息属于哪个会话。
- `nullable=False` 表示消息必须属于某个会话。
- `index=True` 表示按会话查消息时更快。

前端类比：

```ts
const messages = allMessages.filter(item => item.sessionId === currentSession.id)
```

数据库就是靠 `session_id` 做这种关联。

```python
role: Mapped[str] = mapped_column(String(20), nullable=False)
```

- `role` 表示消息角色。
- 第一版只会存 `user` 和 `assistant`。

```python
content: Mapped[str] = mapped_column(Text, nullable=False)
```

- `content` 是消息正文。
- `Text` 适合存比较长的文本。

```python
answer_data: Mapped[dict | None] = mapped_column(JSONB, nullable=True)
```

- `answer_data` 存 AI 回复的结构化数据。
- `dict | None` 表示可以是字典，也可以为空。
- `JSONB` 是 PostgreSQL 的 JSON 类型。
- 用户消息不需要表格、统计、图表，所以可以为空。

可以存类似：

```json
{
  "table": [],
  "stats": {},
  "chart": {},
  "suggestions": []
}
```

```python
elapsed_ms: Mapped[int | None] = mapped_column(Integer, nullable=True)
token_count: Mapped[int | None] = mapped_column(Integer, nullable=True)
```

- `elapsed_ms` 存模拟耗时。
- `token_count` 存模拟 Token 数。
- 这两个主要用于 AI 回复展示。
- 用户消息可以为空。

```python
session: Mapped[ChatSession] = relationship(back_populates="messages")
```

- 这是消息指回会话的关系。
- 有了它之后，可以通过 `message.session` 拿到所属会话。

总结：

- 数据库真正关联靠 `session_id` 外键。
- Python 里方便访问靠 `relationship`。
- `back_populates` 让两边关系互相知道对方。

### 10.3 创建应用配置模型

创建文件：

```txt
backend/app/models/setting.py
```

写入：

```python
from sqlalchemy import Boolean, DateTime, Integer, String, Text, func
from sqlalchemy.dialects.postgresql import JSONB
from sqlalchemy.orm import Mapped, mapped_column

from app.db.base import Base


class AppSetting(Base):
    __tablename__ = "app_settings"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    code: Mapped[str] = mapped_column(String(50), unique=True, nullable=False, index=True)
    name: Mapped[str] = mapped_column(String(100), nullable=False)
    description: Mapped[str] = mapped_column(Text, nullable=False)
    enabled: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)
    config: Mapped[dict] = mapped_column(JSONB, default=dict, nullable=False)
    updated_at: Mapped[DateTime] = mapped_column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())
```

解释：

- `code` 是配置编码，比如 `greeting`、`model_config`。
- `unique=True` 表示配置编码不能重复。
- `enabled` 保存开关状态。
- `config` 保存额外配置，比如开场白、模型名称、常问阈值。

### 10.4 创建回复校对模型

创建文件：

```txt
backend/app/models/feedback.py
```

写入：

```python
from sqlalchemy import DateTime, ForeignKey, Integer, String, Text, func
from sqlalchemy.orm import Mapped, mapped_column

from app.db.base import Base


class Feedback(Base):
    __tablename__ = "feedbacks"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    user_name: Mapped[str] = mapped_column(String(100), nullable=False)
    question: Mapped[str] = mapped_column(Text, nullable=False)
    ai_answer: Mapped[str] = mapped_column(Text, nullable=False)
    status: Mapped[str] = mapped_column(String(20), default="pending", nullable=False, index=True)
    remark: Mapped[str | None] = mapped_column(Text, nullable=True)
    message_id: Mapped[int | None] = mapped_column(ForeignKey("chat_messages.id"), nullable=True)
    created_at: Mapped[DateTime] = mapped_column(DateTime(timezone=True), server_default=func.now())
    handled_at: Mapped[DateTime | None] = mapped_column(DateTime(timezone=True), nullable=True)
```

解释：

- `status` 第一版用字符串：`pending`、`resolved`。
- `remark` 是处理备注。
- `message_id` 可以关联到某条 AI 回复，也可以为空。

### 10.5 创建建表脚本

创建文件：

```txt
backend/app/db/init_db.py
```

写入：

```python
from app.db.base import Base
from app.db.session import engine
from app.models.chat import ChatMessage, ChatSession
from app.models.feedback import Feedback
from app.models.setting import AppSetting


def init_db() -> None:
    Base.metadata.create_all(bind=engine)


if __name__ == "__main__":
    init_db()
    print("Database tables created.")
```

解释：

- 这里 import 了所有模型，是为了让 SQLAlchemy 知道有哪些表。
- `Base.metadata.create_all(bind=engine)` 会根据模型创建数据库表。
- 如果表已经存在，它不会重复创建。

### 10.6 执行建表脚本

在后端目录执行：

```bash
cd ~/Desktop/full-stack-demo/backend
source .venv/bin/activate
python -m app.db.init_db
```

看到：

```txt
Database tables created.
```

说明脚本跑完。

### 10.7 检查数据库表

回到项目根目录：

```bash
cd ~/Desktop/full-stack-demo
docker compose exec postgres psql -U archer -d fullstack_demo
```

这句命令的作用是：进入 Docker 里的 PostgreSQL 数据库，并打开 PostgreSQL 的命令行工具，方便你检查数据库里有没有成功创建表。

拆开解释：

```txt
docker compose
```

- 使用当前项目里的 `docker-compose.yml`。
- 这个文件里定义了本地 PostgreSQL 服务。

```txt
exec
```

- 在一个已经运行中的容器里执行命令。
- 注意：它不是启动新容器，而是进入现有的 PostgreSQL 容器执行命令。

```txt
postgres
```

- 这是 `docker-compose.yml` 里定义的服务名。
- 表示要进入 `postgres` 这个数据库服务容器。

```txt
psql
```

- PostgreSQL 自带的命令行客户端。
- 可以理解成数据库版的“终端”。
- 进入后可以执行 `\dt` 查看表、执行 SQL 查询等。

```txt
-U archer
```

- 指定用哪个数据库用户登录。
- 这里的 `archer` 来自 `docker-compose.yml` 里的 `POSTGRES_USER`。

```txt
-d fullstack_demo
```

- 指定要连接哪个数据库。
- 这里的 `fullstack_demo` 来自 `docker-compose.yml` 里的 `POSTGRES_DB`。

所以整句可以读成：

```txt
在 postgres 这个 Docker 服务容器里，使用 psql，
以 archer 用户连接 fullstack_demo 数据库。
```

如果执行成功，终端会进入 PostgreSQL 交互模式，一般会看到类似：

```txt
fullstack_demo=#
```

进入 PostgreSQL 后执行：

```sql
\dt
```

应该能看到：

```txt
app_settings
chat_messages
chat_sessions
feedbacks
```

退出：

```sql
\q
```

你现在要做：

1. 创建 `base.py`。
2. 创建 3 个 model 文件。
3. 创建 `init_db.py`。
4. 执行 `python -m app.db.init_db`。
5. 进入 PostgreSQL 执行 `\dt`。
6. 把结果发给我。

## 第 11 步：创建接口数据类型 Schema

这一步先创建 Pydantic Schema，也就是接口的请求和响应数据类型。

原因：数据库表已经有了，下一步要写 FastAPI 接口。接口需要清楚规定：

- 前端请求时要传什么字段。
- 后端返回时会返回什么字段。
- 哪些字段是新增时需要的。
- 哪些字段是更新时可选的。

前端类比：

- Pydantic Schema 有点像 TypeScript 里的 `type` 或 `interface`。
- 例如前端会写：

```ts
type AppSetting = {
  code: string
  name: string
  enabled: boolean
}
```

后端这里用 Pydantic 来做类似的事情。

注意：

- SQLAlchemy Model 描述“数据库表长什么样”。
- Pydantic Schema 描述“接口传输的数据长什么样”。
- 它们很像，但职责不同。

### 先理解：为什么 Model 和 Schema 要分开

后端项目里经常会同时出现两类“数据结构”：

```txt
SQLAlchemy Model
Pydantic Schema
```

它们名字都像“模型”，但作用完全不同。

#### SQLAlchemy Model：给数据库看的

比如第 10 步写的：

```python
class ChatSession(Base):
    __tablename__ = "chat_sessions"
```

它关心的是：

- 数据库表名叫什么。
- 每一列是什么数据库类型。
- 哪些字段不能为空。
- 哪些字段是主键、外键、索引。
- 表和表之间是什么关系。

前端类比：

- SQLAlchemy Model 更像“数据库建表说明书”。
- 它不是直接给前端看的。

#### Pydantic Schema：给接口看的

这一步要写的：

```python
class ChatSessionRead(BaseModel):
    id: int
    title: str
```

它关心的是：

- 前端请求接口时，body 里应该传什么字段。
- 后端返回 JSON 时，应该返回什么字段。
- 字段类型是否正确。
- 哪些字段可以不传。
- 返回数据库对象时，如何转换成 JSON。

前端类比：

- Pydantic Schema 更像 TypeScript 里的接口类型。
- 它定义的是“前后端通信的数据形状”。

#### 为什么不能只用 SQLAlchemy Model

理论上很多字段名一样，看起来好像可以只写一份。但实际开发里最好分开，原因是：

1. 数据库字段不一定都要暴露给前端。
2. 创建数据时，不应该让前端传 `id`、`created_at` 这种数据库自动生成的字段。
3. 更新数据时，通常只允许更新部分字段。
4. 返回数据时，可能要附带关联数据，比如会话里带消息列表。

所以我们会拆成几类 Schema：

```txt
Create  创建时前端传入的数据
Read    后端返回给前端的数据
Update  更新时前端传入的数据
```

### 先理解：Pydantic 是什么

Pydantic 是 FastAPI 常用的数据校验库。

它可以帮你做这些事：

- 检查字段类型是否正确。
- 把请求 JSON 转成 Python 对象。
- 把 Python 对象转成响应 JSON。
- 自动生成接口文档里的请求/响应结构。

比如接口要求：

```python
class ChatSessionCreate(BaseModel):
    title: str
```

如果前端传：

```json
{
  "title": "新对话"
}
```

这是合法的。

如果前端传：

```json
{
  "title": 123
}
```

Pydantic 会发现类型不对，FastAPI 会返回参数校验错误。

前端类比：

- TypeScript 在写代码时帮你检查类型。
- Pydantic 在接口运行时帮你检查请求数据。

### 先理解：几个类型写法

后面代码里会看到这些写法：

```python
str
int
bool
datetime
dict[str, Any]
list[ChatMessageRead]
str | None
```

解释：

```python
str
```

- 字符串。
- 对应 JSON 里的字符串。

```python
int
```

- 整数。
- 对应 JSON 里的数字。

```python
bool
```

- 布尔值。
- 对应 JSON 里的 `true` / `false`。

```python
datetime
```

- 日期时间。
- Pydantic 返回 JSON 时会转成类似 `2026-06-28T10:30:00` 的字符串。

```python
dict[str, Any]
```

- 字典。
- `str` 表示 key 是字符串。
- `Any` 表示 value 可以是任意类型。
- 适合存 AI 回复里的表格、统计、图表配置这种结构不固定的数据。

```python
list[ChatMessageRead]
```

- 列表。
- 列表里的每一项都是 `ChatMessageRead`。
- 适合表示一个会话下面有多条消息。

```python
str | None
```

- 可以是字符串，也可以是空值。
- 对应前端里大概是 `string | null`。

```python
= None
```

- 表示这个字段默认不传也可以。

```python
model_config = {"from_attributes": True}
```

- 允许 Pydantic 从 SQLAlchemy 对象属性里读取值。
- 后面接口里从数据库查出来的是 SQLAlchemy 对象，不是普通 dict。
- 加了这句以后，Pydantic 才能把它顺利转换成接口响应。

### 11.1 创建智能问数 Schema

创建文件：

```txt
backend/app/schemas/chat.py
```

写入：

```python
from datetime import datetime
from typing import Any

from pydantic import BaseModel, Field


class ChatMessageBase(BaseModel):
    role: str
    content: str


class ChatMessageCreate(ChatMessageBase):
    pass


class ChatMessageRead(ChatMessageBase):
    id: int
    session_id: int
    answer_data: dict[str, Any] | None = None
    elapsed_ms: int | None = None
    token_count: int | None = None
    created_at: datetime

    model_config = {"from_attributes": True}


class ChatSessionCreate(BaseModel):
    title: str


class ChatSessionRead(BaseModel):
    id: int
    title: str
    created_at: datetime
    updated_at: datetime
    messages: list[ChatMessageRead] = Field(default_factory=list)

    model_config = {"from_attributes": True}
```

解释：

- `BaseModel` 是 Pydantic 的基础类。
- `ChatMessageCreate` 表示创建消息时前端要传的数据。
- `ChatMessageRead` 表示后端返回消息时的数据。
- `ChatSessionCreate` 表示创建会话时前端要传的数据。
- `ChatSessionRead` 表示后端返回会话时的数据。
- `model_config = {"from_attributes": True}` 允许 Pydantic 从 SQLAlchemy 对象里读取字段。

逐段解释：

```python
from datetime import datetime
```

- 引入 Python 的日期时间类型。
- `created_at`、`updated_at` 这些字段会用到。

```python
from typing import Any
```

- `Any` 表示任意类型。
- AI 回复里的 `answer_data` 可能有表格、统计、图表、建议问题，不适合一开始写得太死，所以先用 `dict[str, Any]`。

```python
from pydantic import BaseModel, Field
```

- `BaseModel` 是所有 Pydantic Schema 的父类。
- `Field(default_factory=list)` 用来给列表字段设置默认空列表。
- 不直接写 `messages = []`，是为了避免可变默认值的问题。

```python
class ChatMessageBase(BaseModel):
    role: str
    content: str
```

- 这是消息的基础字段。
- `role` 表示角色，比如 `user` 或 `assistant`。
- `content` 表示消息正文。

为什么叫 `Base`：

- 因为创建消息和读取消息都会用到 `role`、`content`。
- 抽一个基础类，可以减少重复。

```python
class ChatMessageCreate(ChatMessageBase):
    pass
```

- 表示创建消息时需要的数据。
- 它继承 `ChatMessageBase`，所以它拥有 `role` 和 `content`。
- `pass` 表示这个类暂时不新增字段。

前端请求创建消息时，大概会传：

```json
{
  "role": "user",
  "content": "北京代表处今年达成情况"
}
```

```python
class ChatMessageRead(ChatMessageBase):
```

- 表示后端返回消息时的数据。
- 它也继承 `ChatMessageBase`，所以返回里也有 `role` 和 `content`。

```python
id: int
session_id: int
created_at: datetime
```

- 这些字段是数据库生成或数据库保存的字段。
- 创建时前端不需要传。
- 返回时前端需要看到。

```python
answer_data: dict[str, Any] | None = None
elapsed_ms: int | None = None
token_count: int | None = None
```

- 这些主要用于 AI 回复。
- 用户消息没有这些数据，所以允许为空。

```python
class ChatSessionCreate(BaseModel):
    title: str
```

- 创建会话时前端只需要传标题。
- `id`、`created_at`、`updated_at` 都由数据库生成。

```python
class ChatSessionRead(BaseModel):
    id: int
    title: str
    created_at: datetime
    updated_at: datetime
    messages: list[ChatMessageRead] = Field(default_factory=list)
```

- 返回会话时，会带上数据库里的完整信息。
- `messages` 表示这个会话下的消息列表。
- 第一版接口里可以选择是否真的返回 messages，但 Schema 先准备好。

### 11.2 创建应用配置 Schema

创建文件：

```txt
backend/app/schemas/setting.py
```

写入：

```python
from datetime import datetime
from typing import Any

from pydantic import BaseModel


class AppSettingRead(BaseModel):
    id: int
    code: str
    name: str
    description: str
    enabled: bool
    config: dict[str, Any]
    updated_at: datetime

    model_config = {"from_attributes": True}


class AppSettingUpdate(BaseModel):
    enabled: bool | None = None
    config: dict[str, Any] | None = None
```

解释：

- 配置项第一版不需要前端新增，只需要读取和修改。
- 所以这里先定义 `AppSettingRead` 和 `AppSettingUpdate`。
- `enabled` 和 `config` 都写成可选，是为了支持只改开关、或者只改配置内容。

逐段解释：

```python
class AppSettingRead(BaseModel):
```

- 表示后端返回给前端的配置项。
- 应用配置页要展示 6 个配置卡片，所以读取接口会返回一组 `AppSettingRead`。

```python
id: int
code: str
name: str
description: str
```

- `id` 是数据库主键。
- `code` 是配置编码，比如 `greeting`、`suggestions`、`tts`。
- `name` 是展示名称，比如“对话开场白”。
- `description` 是配置说明。

```python
enabled: bool
```

- 表示开关是否开启。
- 前端可以用它控制 toggle 的选中状态。

```python
config: dict[str, Any]
```

- 存额外配置。
- 不同配置项里面内容不一样，所以用 JSON 字典。

例如：

```json
{
  "text": "欢迎使用智能AI问数",
  "questions": ["各产品线销售情况", "北京的产品线收入情况"]
}
```

或者：

```json
{
  "model_name": "gpt-4o-mini"
}
```

```python
class AppSettingUpdate(BaseModel):
    enabled: bool | None = None
    config: dict[str, Any] | None = None
```

- 表示更新配置时前端可以传的数据。
- 两个字段都可以不传，所以写 `| None = None`。

为什么更新 Schema 里没有 `name`、`description`：

- 第一版应用配置页只让用户改开关和配置内容。
- 配置名称、描述是系统预置的，不让前端随便改。

更新开关时，前端可以只传：

```json
{
  "enabled": false
}
```

更新开场白时，前端可以传：

```json
{
  "config": {
    "text": "欢迎使用智能AI问数",
    "questions": ["各产品线销售情况"]
  }
}
```

### 11.3 创建回复校对 Schema

创建文件：

```txt
backend/app/schemas/feedback.py
```

写入：

```python
from datetime import datetime

from pydantic import BaseModel


class FeedbackCreate(BaseModel):
    user_name: str
    question: str
    ai_answer: str
    message_id: int | None = None


class FeedbackRead(BaseModel):
    id: int
    user_name: str
    question: str
    ai_answer: str
    status: str
    remark: str | None = None
    message_id: int | None = None
    created_at: datetime
    handled_at: datetime | None = None

    model_config = {"from_attributes": True}


class FeedbackUpdate(BaseModel):
    status: str | None = None
    remark: str | None = None
```

解释：

- `FeedbackCreate` 用于“数据有误/反馈”按钮创建反馈。
- `FeedbackRead` 用于回复校对列表展示。
- `FeedbackUpdate` 用于处理反馈时修改状态和备注。

逐段解释：

```python
class FeedbackCreate(BaseModel):
```

- 表示创建反馈时前端要传的数据。
- 对应智能问数页面里的“数据有误/反馈”按钮。

```python
user_name: str
question: str
ai_answer: str
message_id: int | None = None
```

- `user_name`：谁提交的反馈。
- `question`：用户当时问的问题。
- `ai_answer`：AI 当时返回的答案摘要或正文。
- `message_id`：如果这条反馈能关联到某条 AI 消息，就传消息 id；如果暂时没有，也允许为空。

创建反馈时，前端大概会传：

```json
{
  "user_name": "管理员",
  "question": "北京代表处今年达成情况",
  "ai_answer": "北京代表处整体同比下降3%...",
  "message_id": 12
}
```

```python
class FeedbackRead(BaseModel):
```

- 表示后端返回反馈数据时的结构。
- 回复校对列表和处理弹窗都会用它。

```python
status: str
remark: str | None = None
handled_at: datetime | None = None
```

- `status` 表示处理状态，例如 `pending` 或 `resolved`。
- `remark` 是处理备注，未处理时可以为空。
- `handled_at` 是处理时间，未处理时可以为空。

```python
class FeedbackUpdate(BaseModel):
    status: str | None = None
    remark: str | None = None
```

- 表示处理反馈时前端可以传的数据。
- 处理时通常会把 `status` 改成 `resolved`，并填写 `remark`。

例如：

```json
{
  "status": "resolved",
  "remark": "已核对，数据口径已修正"
}
```

### 11.4 检查格式化

执行：

```bash
cd ~/Desktop/full-stack-demo/backend
source .venv/bin/activate
python -m compileall app/schemas
```

解释：

- `compileall` 会检查这些 Python 文件有没有语法错误。
- 如果没有报错，说明 Schema 文件至少语法是正确的。
- 它不会运行接口，也不会连接数据库。
- 它只做 Python 语法层面的检查。

如果成功，通常会看到类似：

```txt
Listing 'app/schemas'...
Compiling 'app/schemas/chat.py'...
Compiling 'app/schemas/feedback.py'...
Compiling 'app/schemas/setting.py'...
```

如果某个文件有语法错误，它会告诉你文件名和行号。

常见错误：

```txt
SyntaxError
```

- 说明 Python 语法写错了。
- 常见原因是少了冒号、括号没闭合、缩进不对。

```txt
NameError
```

- `compileall` 阶段不一定会触发所有 `NameError`，但如果有导入执行，就可能看到。
- 常见原因是用了 `Any` 却忘了 `from typing import Any`。

```txt
ImportError
```

- 说明导入失败。
- 常见原因是虚拟环境没激活，或者依赖没安装。

你现在要做：

1. 创建 `backend/app/schemas/chat.py`。
2. 创建 `backend/app/schemas/setting.py`。
3. 创建 `backend/app/schemas/feedback.py`。
4. 执行 `python -m compileall app/schemas`。
5. 把结果发给我。

## 第 12 步：创建数据库会话依赖

这一步要在后端里准备一个 `get_db()` 函数。

原因：前面已经完成了数据库连接、数据库表、接口 Schema。下一步要开始写真正的 FastAPI 接口，接口里会需要读写数据库。每次接口请求进来时，后端都需要：

1. 打开一个数据库会话。
2. 在接口里用这个会话查询或修改数据。
3. 请求结束后关闭这个会话。

这个流程如果每个接口都手写一遍，会很重复，也容易忘记关闭连接。所以 FastAPI 项目里通常会封装一个 `get_db()`，然后通过 `Depends(get_db)` 给接口使用。

前端类比：

- `SessionLocal()` 有点像创建一个“数据库请求客户端”。
- `get_db()` 有点像给每个接口准备好一个可用的 API client。
- `finally: db.close()` 有点像请求结束后做清理，避免资源一直占着。

### 12.1 修改数据库连接文件

修改文件：

```txt
backend/app/db/session.py
```

把它改成：

```python
from collections.abc import Generator

from sqlalchemy import create_engine, text
from sqlalchemy.orm import Session, sessionmaker

from app.core.config import DATABASE_URL

engine = create_engine(DATABASE_URL, echo=True)
SessionLocal = sessionmaker(bind=engine, autoflush=False, autocommit=False)


def get_db() -> Generator[Session, None, None]:
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


def check_database_connection() -> bool:
    with engine.connect() as connection:
        connection.execute(text("SELECT 1"))
    return True
```

### 12.2 逐行解释

```python
from collections.abc import Generator
```

- 引入 `Generator` 类型。
- 后面的 `get_db()` 会用到 `yield`，所以它不是普通函数，而是生成器函数。
- 这里的 `Generator` 只是给类型标注用的。

```python
from sqlalchemy.orm import Session, sessionmaker
```

- `sessionmaker` 用来创建数据库会话工厂。
- `Session` 表示一个数据库会话的类型。

前端类比：

- `sessionmaker` 像一个“创建数据库客户端的工厂函数”。
- `Session` 像一次具体的数据库操作上下文。

```python
engine = create_engine(DATABASE_URL, echo=True)
```

- `engine` 是 SQLAlchemy 连接数据库的核心对象。
- 它知道数据库地址、用户、密码、数据库名。
- `echo=True` 表示把 SQLAlchemy 执行的 SQL 打印到终端，学习阶段很有用。

注意：

- 生产环境通常会关掉 `echo=True`。
- Demo 阶段先开着，方便看到后端到底执行了什么 SQL。

```python
SessionLocal = sessionmaker(bind=engine, autoflush=False, autocommit=False)
```

- `SessionLocal` 是一个“会话工厂”。
- 每调用一次 `SessionLocal()`，就会创建一个新的数据库会话。

参数解释：

```python
bind=engine
```

- 表示这个会话连接到哪个数据库 engine。

```python
autoflush=False
```

- 表示 SQLAlchemy 不要在某些查询前自动把修改同步到数据库。
- 第一版先关掉，行为更容易理解。

```python
autocommit=False
```

- 表示不自动提交事务。
- 后面新增、修改、删除数据时，需要我们明确调用：

```python
db.commit()
```

这样更安全，也更容易知道什么时候数据真正写入数据库。

### 12.3 重点理解 get_db()

```python
def get_db() -> Generator[Session, None, None]:
```

- 定义一个函数，名字叫 `get_db`。
- 它会返回一个数据库会话。
- 因为函数内部用了 `yield`，所以返回类型写成 `Generator[...]`。

```python
db = SessionLocal()
```

- 创建一个新的数据库会话。
- 后面接口里会通过这个 `db` 去查询、增加、修改、删除数据。

```python
try:
    yield db
```

- `yield db` 表示把这个数据库会话交给 FastAPI 接口使用。
- 接口执行期间，`db` 会保持可用。

前端类比：

- 有点像你把一个已经配置好的请求客户端传给某个函数。

```python
finally:
    db.close()
```

- 不管接口执行成功还是报错，最后都会关闭数据库会话。
- 这是为了释放数据库连接资源。

为什么用 `try/finally`：

- 如果接口正常结束，会执行 `finally`。
- 如果接口中途报错，也会执行 `finally`。
- 这样不会因为异常导致连接忘记关闭。

### 12.4 以后接口里怎么用

现在先不用写接口，但你要知道后面会这样用：

```python
from fastapi import Depends
from sqlalchemy.orm import Session

from app.db.session import get_db


@router.get("/settings")
def list_settings(db: Session = Depends(get_db)):
    ...
```

这里的重点是：

```python
db: Session = Depends(get_db)
```

意思是：

- 这个接口需要一个数据库会话。
- FastAPI 会自动调用 `get_db()`。
- 然后把 `yield` 出来的 `db` 传给接口函数。
- 接口结束后，FastAPI 会继续执行 `finally`，关闭 db。

前端类比：

- 有点像 React 组件通过 hook 拿到某个能力。
- 只不过这里是 FastAPI 通过依赖注入，把数据库会话传给接口函数。

### 12.5 检查语法

执行：

```bash
cd ~/Desktop/full-stack-demo/backend
source .venv/bin/activate
python -m compileall app/db
```

如果没有报错，说明 `app/db` 里的 Python 文件语法正确。

### 12.6 再检查数据库健康接口

启动后端：

```bash
python -m uvicorn app.main:app --reload
```

浏览器打开：

```txt
http://127.0.0.1:8000/health/db
```

如果看到：

```json
{"database":"ok"}
```

说明修改 `session.py` 后，数据库连接仍然正常。

你现在要做：

1. 修改 `backend/app/db/session.py`。
2. 执行 `python -m compileall app/db`。
3. 启动后端 `python -m uvicorn app.main:app --reload`。
4. 访问 `http://127.0.0.1:8000/health/db`。
5. 把结果发给我。

## 第 13 步：初始化应用配置默认数据

这一步要往 `app_settings` 表里插入 6 条默认配置数据。

原因：第 10 步只是创建了表结构，表现在还是空的。应用配置页需要展示 6 个配置卡片：

```txt
对话开场白
下一步问题建议
文字转语音
语音转文字
模型配置
常问设置
```

如果不先初始化这些数据，后面就算写好了：

```txt
GET /api/settings
```

接口也只能查到空数组。

所以这一步先写一个 seed 脚本，把系统默认配置写进数据库。

### 先理解：什么是 seed

`seed` 可以理解成“初始化种子数据”。

数据库里有两类东西：

```txt
表结构
初始数据
```

第 10 步的 `init_db.py` 做的是：

```txt
创建表结构
```

这一步的 `seed.py` 做的是：

```txt
插入项目运行需要的默认数据
```

前端类比：

如果你在前端写 demo，可能会先写：

```ts
const defaultSettings = [
  { code: "greeting", name: "对话开场白", enabled: true },
  { code: "suggestions", name: "下一步问题建议", enabled: true },
]
```

现在只是把这批默认数据从前端 mock 移到 PostgreSQL 数据库里。

### 先理解：为什么要单独写 seed.py

你可能会问：为什么不直接写在 `init_db.py` 里？

可以写在一起，但这里先拆开更清楚：

- `init_db.py`：只负责创建表。
- `seed.py`：只负责插入默认数据。

这样职责更单一。

以后如果表已经存在，只想重新补默认配置，就可以单独运行：

```bash
python -m app.db.seed
```

不用重新关心建表逻辑。

### 13.1 创建 seed 脚本

创建文件：

```txt
backend/app/db/seed.py
```

写入：

```python
from sqlalchemy.orm import Session

from app.db.session import SessionLocal
from app.models.setting import AppSetting


DEFAULT_SETTINGS = [
    {
        "code": "greeting",
        "name": "对话开场白",
        "description": "开启后，新对话将自动显示开场白引导语。",
        "enabled": True,
        "config": {
            "text": "欢迎使用智能AI问数，您可以向我咨询经营数据、报表分析相关问题。",
            "questions": [
                "各产品线销售情况",
                "北京的产品线收入情况",
                "深圳的产品销售情况",
            ],
        },
    },
    {
        "code": "suggestions",
        "name": "下一步问题建议",
        "description": "开启后，AI回复下方自动生成相关延伸问题提示。",
        "enabled": True,
        "config": {},
    },
    {
        "code": "tts",
        "name": "文字转语音",
        "description": "开启后，AI回答支持语音播报功能。",
        "enabled": False,
        "config": {},
    },
    {
        "code": "stt",
        "name": "语音转文字",
        "description": "开启后，支持通过语音输入问题。",
        "enabled": False,
        "config": {},
    },
    {
        "code": "model_config",
        "name": "模型配置",
        "description": "配置智能问数使用的AI模型。",
        "enabled": True,
        "config": {
            "model_name": "mock-analysis-v1",
        },
    },
    {
        "code": "hot_recommend",
        "name": "常问设置",
        "description": "根据经常提问频次，在快捷提问中展示常问问题。",
        "enabled": True,
        "config": {
            "threshold": 3,
        },
    },
]


def seed_app_settings(db: Session) -> None:
    for item in DEFAULT_SETTINGS:
        exists = (
            db.query(AppSetting)
            .filter(AppSetting.code == item["code"])
            .first()
        )
        if exists:
            continue

        db.add(AppSetting(**item))

    db.commit()


def seed_db() -> None:
    db = SessionLocal()
    try:
        seed_app_settings(db)
    finally:
        db.close()


if __name__ == "__main__":
    seed_db()
    print("Database seed data inserted.")
```

### 13.2 逐段解释

```python
from sqlalchemy.orm import Session
```

- 引入 SQLAlchemy 的数据库会话类型。
- 后面的 `seed_app_settings(db: Session)` 会用到。

```python
from app.db.session import SessionLocal
```

- 引入第 9 步创建的数据库会话工厂。
- 用它可以创建一个真实的数据库会话。

```python
from app.models.setting import AppSetting
```

- 引入应用配置表的 SQLAlchemy Model。
- 后面插入数据时，会创建 `AppSetting(...)` 对象。

### 13.3 DEFAULT_SETTINGS 是什么

```python
DEFAULT_SETTINGS = [...]
```

- 这是一个 Python 列表。
- 列表里每一项是一个字典。
- 每个字典对应 `app_settings` 表里的一条记录。

前端类比：

```ts
const defaultSettings = [
  {
    code: "greeting",
    name: "对话开场白",
    enabled: true,
  },
]
```

字段对应关系：

```python
"code": "greeting"
```

- 配置编码。
- 后面更新配置时会通过 `code` 找到对应配置。
- 比如接口可能是：

```txt
PATCH /api/settings/greeting
```

```python
"name": "对话开场白"
```

- 前端卡片上展示的配置名称。

```python
"description": "开启后，新对话将自动显示开场白引导语。"
```

- 前端卡片上展示的说明文字。

```python
"enabled": True
```

- 配置开关是否开启。
- `True` 表示开启。
- `False` 表示关闭。

```python
"config": {...}
```

- 额外配置。
- 不同配置项内容不一样，所以用 JSONB 存。

例如开场白配置：

```python
"config": {
    "text": "欢迎使用智能AI问数...",
    "questions": ["各产品线销售情况"]
}
```

例如常问设置：

```python
"config": {
    "threshold": 3
}
```

### 13.4 重点理解 seed_app_settings

```python
def seed_app_settings(db: Session) -> None:
```

- 定义一个函数，用来初始化应用配置。
- 参数 `db` 是数据库会话。
- `-> None` 表示这个函数不返回数据。

```python
for item in DEFAULT_SETTINGS:
```

- 遍历 6 条默认配置。
- 每次循环处理一条配置。

```python
exists = (
    db.query(AppSetting)
    .filter(AppSetting.code == item["code"])
    .first()
)
```

这段是在查数据库：

```txt
app_settings 表里是否已经有相同 code 的配置
```

比如当前 `item["code"]` 是：

```txt
greeting
```

那它就会检查数据库里有没有：

```txt
code = greeting
```

为什么要检查：

- 这个 seed 脚本可能会被重复执行。
- 如果不检查，每次执行都会重复插入。
- 但 `code` 字段是唯一的，重复插入还会报错。

```python
if exists:
    continue
```

- 如果这条配置已经存在，就跳过。
- `continue` 表示进入下一轮循环。

```python
db.add(AppSetting(**item))
```

这句是插入新数据。

拆开理解：

```python
AppSetting(**item)
```

如果 `item` 是：

```python
{
    "code": "greeting",
    "name": "对话开场白",
    "description": "开启后...",
    "enabled": True,
    "config": {},
}
```

那么：

```python
AppSetting(**item)
```

大概等价于：

```python
AppSetting(
    code="greeting",
    name="对话开场白",
    description="开启后...",
    enabled=True,
    config={},
)
```

`**item` 是 Python 的字典展开语法。

```python
db.add(...)
```

- 把这条新数据加入当前数据库会话。
- 注意：这时还没有真正写入数据库。

```python
db.commit()
```

- 提交事务。
- 到这一步，数据才真正写入 PostgreSQL。

前端类比：

- `db.add(...)` 有点像先把修改放进待提交队列。
- `db.commit()` 才像真正点击保存。

### 13.5 重点理解 seed_db

```python
def seed_db() -> None:
    db = SessionLocal()
    try:
        seed_app_settings(db)
    finally:
        db.close()
```

这段和第 12 步的 `get_db()` 思路很像：

1. 创建数据库会话。
2. 调用初始化函数。
3. 最后关闭数据库会话。

为什么这里不用 `get_db()`：

- `get_db()` 是给 FastAPI 接口依赖用的。
- `seed.py` 是命令行脚本，直接用 `SessionLocal()` 更直观。

```python
if __name__ == "__main__":
    seed_db()
    print("Database seed data inserted.")
```

- 表示直接运行这个文件时，执行 `seed_db()`。
- 运行成功后打印提示。

### 13.6 执行 seed 脚本

在后端目录执行：

```bash
cd ~/Desktop/full-stack-demo/backend
source .venv/bin/activate
python -m app.db.seed
```

如果成功，会看到：

```txt
Database seed data inserted.
```

### 13.7 检查数据库数据

回到项目根目录，进入 PostgreSQL：

```bash
cd ~/Desktop/full-stack-demo
docker compose exec postgres psql -U archer -d fullstack_demo
```

执行 SQL：

```sql
SELECT code, name, enabled, config FROM app_settings ORDER BY id;
```

应该能看到 6 条配置：

```txt
greeting
suggestions
tts
stt
model_config
hot_recommend
```

退出：

```sql
\q
```

### 13.8 检查语法

也可以执行：

```bash
cd ~/Desktop/full-stack-demo/backend
python -m compileall app/db
```

如果没有报错，说明 `seed.py` 语法没问题。

你现在要做：

1. 创建 `backend/app/db/seed.py`。
2. 执行 `python -m compileall app/db`。
3. 执行 `python -m app.db.seed`。
4. 进入 PostgreSQL 查询 `app_settings`。
5. 把查询结果发给我。

## 第 14 步：创建应用配置接口

这一步开始写真正的业务接口。

先做应用配置接口，原因是它最简单：

- 数据表已经有了：`app_settings`
- 默认数据已经有了：6 条配置
- Schema 已经有了：`AppSettingRead`、`AppSettingUpdate`
- 接口只需要查询和更新，不涉及复杂业务逻辑

这一轮要完成两个接口：

```txt
GET   /api/settings
PATCH /api/settings/{code}
```

作用：

- `GET /api/settings`：返回所有应用配置，用于应用配置页展示 6 个卡片。
- `PATCH /api/settings/{code}`：根据配置编码更新某一个配置，比如开关、开场白、模型名称、常问阈值。

前端类比：

```ts
await fetch("/api/settings")
```

拿到配置列表。

```ts
await fetch("/api/settings/greeting", {
  method: "PATCH",
  body: JSON.stringify({ enabled: false }),
})
```

更新某个配置。

### 14.1 创建应用配置路由文件

创建文件：

```txt
backend/app/routers/settings.py
```

写入：

```python
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.models.setting import AppSetting
from app.schemas.setting import AppSettingRead, AppSettingUpdate

router = APIRouter(prefix="/api/settings", tags=["settings"])


@router.get("", response_model=list[AppSettingRead])
def list_settings(db: Session = Depends(get_db)):
    return db.query(AppSetting).order_by(AppSetting.id).all()


@router.patch("/{code}", response_model=AppSettingRead)
def update_setting(
    code: str,
    payload: AppSettingUpdate,
    db: Session = Depends(get_db),
):
    setting = db.query(AppSetting).filter(AppSetting.code == code).first()
    if setting is None:
        raise HTTPException(status_code=404, detail="Setting not found")

    if payload.enabled is not None:
        setting.enabled = payload.enabled

    if payload.config is not None:
        setting.config = payload.config

    db.commit()
    db.refresh(setting)

    return setting
```

### 14.2 逐段解释

```python
from fastapi import APIRouter, Depends, HTTPException
```

- `APIRouter`：用来创建一组接口路由。
- `Depends`：用来声明依赖，比如自动获取数据库会话。
- `HTTPException`：用来主动返回 HTTP 错误，比如配置不存在时返回 404。

前端类比：

- `APIRouter` 有点像前端路由里的一个模块。
- 比如你会把“设置页相关逻辑”放在一个文件里。

```python
from sqlalchemy.orm import Session
```

- 引入数据库会话类型。
- 用来给 `db` 参数做类型标注。

```python
from app.db.session import get_db
```

- 引入第 12 步写的数据库会话依赖。
- 后面的接口会用它拿到数据库连接。

```python
from app.models.setting import AppSetting
```

- 引入 SQLAlchemy Model。
- 通过它查询和更新 `app_settings` 表。

```python
from app.schemas.setting import AppSettingRead, AppSettingUpdate
```

- 引入 Pydantic Schema。
- `AppSettingRead` 用于接口返回。
- `AppSettingUpdate` 用于接口接收更新数据。

### 14.3 理解 APIRouter

```python
router = APIRouter(prefix="/api/settings", tags=["settings"])
```

这句创建了一个路由对象。

```python
prefix="/api/settings"
```

- 表示这个文件里的接口都以 `/api/settings` 开头。

比如：

```python
@router.get("")
```

最终接口地址就是：

```txt
GET /api/settings
```

再比如：

```python
@router.patch("/{code}")
```

最终接口地址就是：

```txt
PATCH /api/settings/{code}
```

```python
tags=["settings"]
```

- 表示在 Swagger 文档里，这组接口归类到 `settings` 分组。
- 打开 `/docs` 时会更清楚。

### 14.4 理解 GET /api/settings

```python
@router.get("", response_model=list[AppSettingRead])
```

- 声明一个 GET 接口。
- `""` 表示路径就是 prefix 本身。
- `response_model=list[AppSettingRead]` 表示接口返回的是一个列表，列表里每一项都是 `AppSettingRead`。

前端类比：

```ts
type Response = AppSetting[]
```

```python
def list_settings(db: Session = Depends(get_db)):
```

- 定义接口处理函数。
- `db` 是数据库会话。
- `Depends(get_db)` 表示让 FastAPI 自动调用 `get_db()` 获取数据库会话。

```python
return db.query(AppSetting).order_by(AppSetting.id).all()
```

这句是在查询数据库：

```txt
查询 app_settings 表，按 id 排序，返回全部记录
```

拆开：

```python
db.query(AppSetting)
```

- 查询 `AppSetting` 对应的数据库表，也就是 `app_settings`。

```python
.order_by(AppSetting.id)
```

- 按 id 排序。
- 这样返回顺序稳定。

```python
.all()
```

- 返回所有符合条件的数据。
- 结果是一个列表。

### 14.5 理解 PATCH /api/settings/{code}

```python
@router.patch("/{code}", response_model=AppSettingRead)
```

- 声明一个 PATCH 接口。
- `{code}` 是路径参数。

如果请求：

```txt
PATCH /api/settings/greeting
```

那函数里的：

```python
code: str
```

值就是：

```txt
greeting
```

为什么用 PATCH：

- `PATCH` 表示局部更新。
- 这里可以只更新 `enabled`，也可以只更新 `config`。

```python
payload: AppSettingUpdate
```

- 请求 body 会被 Pydantic 转成 `AppSettingUpdate`。
- 比如前端传：

```json
{
  "enabled": false
}
```

那后端里：

```python
payload.enabled
```

就是：

```python
False
```

```python
setting = db.query(AppSetting).filter(AppSetting.code == code).first()
```

这句是在按 `code` 查配置。

```python
.filter(AppSetting.code == code)
```

- 只查 `code` 等于路径参数的记录。

```python
.first()
```

- 返回第一条记录。
- 如果没找到，返回 `None`。

```python
if setting is None:
    raise HTTPException(status_code=404, detail="Setting not found")
```

- 如果没有找到对应配置，就返回 404。

前端会收到类似：

```json
{
  "detail": "Setting not found"
}
```

```python
if payload.enabled is not None:
    setting.enabled = payload.enabled
```

- 如果前端传了 `enabled`，就更新开关。
- 这里必须判断 `is not None`，不能简单写 `if payload.enabled`。

原因：

```python
False
```

本身也是一个合法值，表示关闭开关。

如果写：

```python
if payload.enabled:
```

当前端传 `false` 时，这个判断不会进入，导致无法关闭配置。

所以正确写法是：

```python
if payload.enabled is not None:
```

```python
if payload.config is not None:
    setting.config = payload.config
```

- 如果前端传了 `config`，就更新配置内容。
- 比如更新开场白文案、模型名称、常问阈值。

```python
db.commit()
```

- 提交事务。
- 数据真正写入 PostgreSQL。

```python
db.refresh(setting)
```

- 从数据库重新刷新这个对象。
- 这样能拿到数据库更新后的最新字段，比如 `updated_at`。

```python
return setting
```

- 返回更新后的配置。
- FastAPI 会根据 `response_model=AppSettingRead` 把它转换成 JSON。

### 14.6 在 main.py 挂载路由

只创建 `settings.py` 还不够。

还需要告诉 FastAPI：

```txt
请把 settings 这组接口加入到 app 里
```

修改文件：

```txt
backend/app/main.py
```

改成：

```python
from fastapi import FastAPI

from app.db.session import check_database_connection
from app.routers import settings

app = FastAPI(title="Full Stack Demo API")

app.include_router(settings.router)


@app.get("/health")
def health_check():
    return {"status": "ok"}


@app.get("/health/db")
def database_health_check():
    check_database_connection()
    return {"database": "ok"}
```

解释：

```python
from app.routers import settings
```

- 导入刚创建的 settings 路由模块。

```python
app.include_router(settings.router)
```

- 把 `settings.router` 注册到 FastAPI 应用里。
- 注册后，`GET /api/settings` 和 `PATCH /api/settings/{code}` 才会真正生效。

注意：

- 如果忘了 `include_router`，代码没有语法错误，但浏览器访问接口会是 404。
- 因为 FastAPI 根本不知道你写了这个 router。

### 14.7 检查语法

执行：

```bash
cd ~/Desktop/full-stack-demo/backend
source .venv/bin/activate
python -m compileall app
```

如果没有报错，说明后端 Python 文件语法正确。

### 14.8 启动后端

执行：

```bash
python -m uvicorn app.main:app --reload
```

如果之前已经启动着后端，保存代码后它会自动 reload。

### 14.9 测试 GET 接口

浏览器打开：

```txt
http://127.0.0.1:8000/api/settings
```

应该看到一个 JSON 数组，里面有 6 条配置。

也可以打开 Swagger：

```txt
http://127.0.0.1:8000/docs
```

找到：

```txt
settings
GET /api/settings
```

点 `Try it out`，再点 `Execute`。

### 14.10 测试 PATCH 接口

打开 Swagger：

```txt
http://127.0.0.1:8000/docs
```

找到：

```txt
PATCH /api/settings/{code}
```

点击 `Try it out`。

`code` 填：

```txt
tts
```

Request body 填：

```json
{
  "enabled": true
}
```

点击 `Execute`。

如果成功，返回结果里应该能看到：

```json
"code": "tts",
"enabled": true
```

然后再打开：

```txt
http://127.0.0.1:8000/api/settings
```

确认 `tts` 的 `enabled` 已经变成 `true`。

### 14.11 常见错误

#### 404 Not Found

可能原因：

- 忘了在 `main.py` 里写 `app.include_router(settings.router)`。
- 路径写错了，比如访问成 `/settings`，但真实路径是 `/api/settings`。

#### ImportError

可能原因：

- `from app.routers import settings` 写错。
- 文件名不是 `settings.py`。
- 当前运行命令不是在 `backend` 目录执行。

#### 422 Unprocessable Entity

通常是请求 body 格式不符合 Schema。

比如 PATCH 时传了：

```json
{
  "enabled": "yes"
}
```

但后端期望：

```json
{
  "enabled": true
}
```

#### 500 Internal Server Error

可能原因：

- 数据库没启动。
- `.env` 数据库连接配置不对。
- 表还没创建。

你现在要做：

1. 创建 `backend/app/routers/settings.py`。
2. 修改 `backend/app/main.py`，挂载 settings router。
3. 执行 `python -m compileall app`。
4. 启动或等待后端 reload。
5. 访问 `http://127.0.0.1:8000/api/settings`。
6. 在 Swagger 里测试 `PATCH /api/settings/{code}`。
7. 把 GET 和 PATCH 的结果发给我。

## 第 15 步：创建回复校对接口

这一步要实现“回复校对”页面需要的后端接口。

第 14 步做的是应用配置接口，只有查询和更新一个配置项。第 15 步稍微复杂一点，会包含：

- 新增反馈
- 查询反馈列表
- 按问题搜索
- 按用户搜索
- 按状态筛选
- 分页
- 查看单条反馈详情
- 处理反馈并保存备注

这一轮要完成这些接口：

```txt
POST  /api/feedbacks
GET   /api/feedbacks
GET   /api/feedbacks/{feedback_id}
PATCH /api/feedbacks/{feedback_id}
```

说明：

- 原计划里回复校对主要是 `GET /api/feedbacks`、`GET /api/feedbacks/{feedback_id}`、`PATCH /api/feedbacks/{feedback_id}`。
- 这里额外加一个 `POST /api/feedbacks`，是为了方便现在手动创建测试数据。
- 后面智能问数页面里的“数据有误/反馈”按钮，也可以复用这个创建接口。

### 15.1 先调整反馈 Schema

修改文件：

```txt
backend/app/schemas/feedback.py
```

建议改成：

```python
from datetime import datetime

from pydantic import BaseModel, Field


class FeedbackBase(BaseModel):
    user_name: str
    question: str
    ai_answer: str
    message_id: int | None = None


class FeedbackCreate(FeedbackBase):
    pass


class FeedbackRead(FeedbackBase):
    id: int
    status: str
    remark: str | None = None
    created_at: datetime
    handled_at: datetime | None = None

    model_config = {"from_attributes": True}


class FeedbackUpdate(BaseModel):
    status: str | None = None
    remark: str | None = None


class FeedbackListResponse(BaseModel):
    total: int
    page: int
    page_size: int
    items: list[FeedbackRead] = Field(default_factory=list)
```

如果你当前写的是：

```python
class FeedbackBasic(BaseModel):
```

也能运行，但这里建议改成：

```python
class FeedbackBase(BaseModel):
```

原因：

- `Base` 是这类公共字段的常见命名。
- 和前面 `ChatMessageBase` 风格统一。

### 15.2 解释 FeedbackListResponse

为什么要新增：

```python
class FeedbackListResponse(BaseModel):
```

因为回复校对页面有分页。

如果接口只返回：

```json
[
  { "id": 1, "question": "..." },
  { "id": 2, "question": "..." }
]
```

前端只能拿到当前页数据，但不知道：

- 总共有多少条
- 当前是第几页
- 每页多少条

所以更适合返回：

```json
{
  "total": 23,
  "page": 1,
  "page_size": 10,
  "items": [
    { "id": 1, "question": "..." },
    { "id": 2, "question": "..." }
  ]
}
```

字段解释：

```python
total: int
```

- 符合查询条件的总条数。
- 前端分页器需要用它计算总页数。

```python
page: int
```

- 当前页码。

```python
page_size: int
```

- 每页条数。

```python
items: list[FeedbackRead] = Field(default_factory=list)
```

- 当前页的反馈数据列表。
- `Field(default_factory=list)` 表示默认是一个新的空列表。
- 不直接写 `items = []`，避免可变默认值问题。

### 15.3 创建回复校对路由文件

创建文件：

```txt
backend/app/routers/feedbacks.py
```

写入：

```python
from datetime import datetime, timezone

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.models.feedback import Feedback
from app.schemas.feedback import (
    FeedbackCreate,
    FeedbackListResponse,
    FeedbackRead,
    FeedbackUpdate,
)

router = APIRouter(prefix="/api/feedbacks", tags=["feedbacks"])


@router.post("", response_model=FeedbackRead)
def create_feedback(
    payload: FeedbackCreate,
    db: Session = Depends(get_db),
):
    feedback = Feedback(**payload.model_dump())
    db.add(feedback)
    db.commit()
    db.refresh(feedback)
    return feedback


@router.get("", response_model=FeedbackListResponse)
def list_feedbacks(
    question: str | None = None,
    user: str | None = None,
    status: str | None = None,
    page: int = Query(1, ge=1),
    page_size: int = Query(10, ge=1, le=100),
    db: Session = Depends(get_db),
):
    query = db.query(Feedback)

    if question:
        query = query.filter(Feedback.question.ilike(f"%{question}%"))

    if user:
        query = query.filter(Feedback.user_name.ilike(f"%{user}%"))

    if status:
        query = query.filter(Feedback.status == status)

    total = query.count()
    items = (
        query.order_by(Feedback.created_at.desc())
        .offset((page - 1) * page_size)
        .limit(page_size)
        .all()
    )

    return {
        "total": total,
        "page": page,
        "page_size": page_size,
        "items": items,
    }


@router.get("/{feedback_id}", response_model=FeedbackRead)
def get_feedback(
    feedback_id: int,
    db: Session = Depends(get_db),
):
    feedback = db.query(Feedback).filter(Feedback.id == feedback_id).first()
    if feedback is None:
        raise HTTPException(status_code=404, detail="Feedback not found")

    return feedback


@router.patch("/{feedback_id}", response_model=FeedbackRead)
def update_feedback(
    feedback_id: int,
    payload: FeedbackUpdate,
    db: Session = Depends(get_db),
):
    feedback = db.query(Feedback).filter(Feedback.id == feedback_id).first()
    if feedback is None:
        raise HTTPException(status_code=404, detail="Feedback not found")

    if payload.status is not None:
        feedback.status = payload.status
        if payload.status == "resolved":
            feedback.handled_at = datetime.now(timezone.utc)
        elif payload.status == "pending":
            feedback.handled_at = None

    if payload.remark is not None:
        feedback.remark = payload.remark

    db.commit()
    db.refresh(feedback)

    return feedback
```

### 15.4 逐段解释 imports

```python
from datetime import datetime, timezone
```

- 用来生成处理时间 `handled_at`。
- `timezone.utc` 表示使用 UTC 时间。

```python
from fastapi import APIRouter, Depends, HTTPException, Query
```

- `APIRouter`：创建接口路由。
- `Depends`：注入数据库会话。
- `HTTPException`：返回 404 等错误。
- `Query`：给查询参数加规则，比如页码不能小于 1。

```python
from sqlalchemy.orm import Session
```

- 数据库会话类型。

```python
from app.db.session import get_db
```

- 第 12 步写的数据库会话依赖。

```python
from app.models.feedback import Feedback
```

- SQLAlchemy Model，用来操作 `feedbacks` 表。

```python
from app.schemas.feedback import (...)
```

- Pydantic Schema，用来声明接口请求和响应的数据结构。

### 15.5 理解 POST /api/feedbacks

```python
@router.post("", response_model=FeedbackRead)
```

- 声明创建反馈接口。
- 路径是 `/api/feedbacks`。
- 返回值格式是 `FeedbackRead`。

```python
payload: FeedbackCreate
```

- 请求 body 会被 Pydantic 校验并转成 `FeedbackCreate` 对象。

前端请求大概是：

```json
{
  "user_name": "管理员",
  "question": "北京代表处今年达成情况",
  "ai_answer": "北京代表处整体同比下降3%",
  "message_id": null
}
```

```python
feedback = Feedback(**payload.model_dump())
```

拆开理解：

```python
payload.model_dump()
```

- 把 Pydantic 对象转成普通 Python 字典。

例如：

```python
{
    "user_name": "管理员",
    "question": "北京代表处今年达成情况",
    "ai_answer": "北京代表处整体同比下降3%",
    "message_id": None,
}
```

```python
Feedback(**payload.model_dump())
```

- 用字典展开语法创建 SQLAlchemy 对象。

大概等价于：

```python
Feedback(
    user_name="管理员",
    question="北京代表处今年达成情况",
    ai_answer="北京代表处整体同比下降3%",
    message_id=None,
)
```

```python
db.add(feedback)
db.commit()
db.refresh(feedback)
```

- `db.add`：加入当前会话。
- `db.commit`：提交到数据库。
- `db.refresh`：从数据库刷新，拿到 `id`、`created_at` 等数据库生成的字段。

### 15.6 理解 GET /api/feedbacks

```python
@router.get("", response_model=FeedbackListResponse)
```

- 声明反馈列表接口。
- 返回值不是普通列表，而是带分页信息的对象。

```python
question: str | None = None
user: str | None = None
status: str | None = None
```

这些是查询参数。

例如请求：

```txt
GET /api/feedbacks?question=北京&user=管理员&status=pending
```

对应函数参数：

```python
question = "北京"
user = "管理员"
status = "pending"
```

```python
page: int = Query(1, ge=1)
```

- `page` 默认是 1。
- `ge=1` 表示 greater than or equal，大于等于 1。
- 如果前端传 `page=0`，FastAPI 会自动返回 422。

```python
page_size: int = Query(10, ge=1, le=100)
```

- `page_size` 默认是 10。
- 最小 1，最大 100。
- 防止一次请求拿太多数据。

```python
query = db.query(Feedback)
```

- 先创建一个基础查询。
- 后面根据条件一点点往上加筛选。

```python
if question:
    query = query.filter(Feedback.question.ilike(f"%{question}%"))
```

- 如果传了 `question`，就按问题模糊搜索。
- `ilike` 是 PostgreSQL 里的不区分大小写模糊匹配。
- `%北京%` 表示包含“北京”的内容都能匹配。

```python
if user:
    query = query.filter(Feedback.user_name.ilike(f"%{user}%"))
```

- 如果传了 `user`，就按用户名模糊搜索。

```python
if status:
    query = query.filter(Feedback.status == status)
```

- 如果传了状态，就精确匹配状态。
- 比如 `pending` 或 `resolved`。

```python
total = query.count()
```

- 统计符合筛选条件的总条数。
- 注意：这是分页前的总数。

```python
.order_by(Feedback.created_at.desc())
```

- 按创建时间倒序。
- 最新反馈排在前面。

```python
.offset((page - 1) * page_size)
```

- 跳过前面的数据。

分页例子：

```txt
page = 1, page_size = 10, offset = 0
page = 2, page_size = 10, offset = 10
page = 3, page_size = 10, offset = 20
```

```python
.limit(page_size)
```

- 限制最多返回多少条。

```python
.all()
```

- 执行查询并返回列表。

### 15.7 理解 GET /api/feedbacks/{feedback_id}

```python
@router.get("/{feedback_id}", response_model=FeedbackRead)
```

- 根据 id 查询单条反馈。
- 处理弹窗打开时，可以用这个接口拿详情。

```python
feedback_id: int
```

- 路径参数。

例如请求：

```txt
GET /api/feedbacks/1
```

那：

```python
feedback_id = 1
```

```python
feedback = db.query(Feedback).filter(Feedback.id == feedback_id).first()
```

- 根据主键 id 查一条反馈。

```python
if feedback is None:
    raise HTTPException(status_code=404, detail="Feedback not found")
```

- 如果找不到，返回 404。

### 15.8 理解 PATCH /api/feedbacks/{feedback_id}

```python
@router.patch("/{feedback_id}", response_model=FeedbackRead)
```

- 根据 id 更新反馈。
- 用于“处理反馈”弹窗保存状态和备注。

```python
payload: FeedbackUpdate
```

- 请求 body。
- 可以传 `status`，也可以传 `remark`。

例如：

```json
{
  "status": "resolved",
  "remark": "已核对，数据口径已修正"
}
```

```python
if payload.status is not None:
    feedback.status = payload.status
```

- 如果传了状态，就更新状态。

```python
if payload.status == "resolved":
    feedback.handled_at = datetime.now(timezone.utc)
```

- 如果状态改为已处理，就记录处理时间。

```python
elif payload.status == "pending":
    feedback.handled_at = None
```

- 如果状态改回待处理，就清空处理时间。

```python
if payload.remark is not None:
    feedback.remark = payload.remark
```

- 如果传了备注，就更新备注。

```python
db.commit()
db.refresh(feedback)
return feedback
```

- 提交更新。
- 刷新数据库对象。
- 返回更新后的反馈。

### 15.9 在 main.py 挂载反馈路由

修改文件：

```txt
backend/app/main.py
```

把导入改成：

```python
from app.routers import feedbacks, settings
```

再增加：

```python
app.include_router(feedbacks.router)
```

完整结构类似：

```python
from fastapi import FastAPI

from app.db.session import check_database_connection
from app.routers import feedbacks, settings

app = FastAPI(title="Full Stack Demo API")

app.include_router(settings.router)
app.include_router(feedbacks.router)
```

注意：

- 如果忘了 `app.include_router(feedbacks.router)`，访问 `/api/feedbacks` 会 404。

### 15.10 检查语法

执行：

```bash
cd ~/Desktop/full-stack-demo/backend
source .venv/bin/activate
python -m compileall app
```

如果没有报错，说明语法正确。

### 15.11 测试创建反馈

打开 Swagger：

```txt
http://127.0.0.1:8000/docs
```

找到：

```txt
POST /api/feedbacks
```

Request body 填：

```json
{
  "user_name": "管理员",
  "question": "北京代表处今年达成情况",
  "ai_answer": "北京代表处整体同比下降3%",
  "message_id": null
}
```

点击 `Execute`。

如果成功，返回状态码是 200，响应里会有：

```json
"id": 1,
"status": "pending"
```

### 15.12 测试反馈列表

访问：

```txt
http://127.0.0.1:8000/api/feedbacks
```

应该看到：

```json
{
  "total": 1,
  "page": 1,
  "page_size": 10,
  "items": [
    {
      "id": 1,
      "user_name": "管理员",
      "question": "北京代表处今年达成情况",
      "status": "pending"
    }
  ]
}
```

测试搜索：

```txt
http://127.0.0.1:8000/api/feedbacks?question=北京
```

测试用户：

```txt
http://127.0.0.1:8000/api/feedbacks?user=管理员
```

测试状态：

```txt
http://127.0.0.1:8000/api/feedbacks?status=pending
```

测试分页：

```txt
http://127.0.0.1:8000/api/feedbacks?page=1&page_size=5
```

### 15.13 测试反馈详情

访问：

```txt
http://127.0.0.1:8000/api/feedbacks/1
```

应该返回 id 为 1 的反馈详情。

### 15.14 测试处理反馈

Swagger 中找到：

```txt
PATCH /api/feedbacks/{feedback_id}
```

`feedback_id` 填：

```txt
1
```

Request body 填：

```json
{
  "status": "resolved",
  "remark": "已核对，数据口径已修正"
}
```

点击 `Execute`。

如果成功，返回里应该看到：

```json
"status": "resolved",
"remark": "已核对，数据口径已修正",
"handled_at": "..."
```

### 15.15 常见错误

#### 404 Not Found

可能原因：

- 没有在 `main.py` 里挂载 `feedbacks.router`。
- 访问的反馈 id 不存在。

#### 422 Unprocessable Entity

可能原因：

- `page=0`，但页码要求大于等于 1。
- 请求 body 字段类型不对。
- POST 时少传了 `user_name`、`question` 或 `ai_answer`。

#### 500 Internal Server Error

可能原因：

- 数据库没启动。
- `feedbacks` 表没创建。
- `message_id` 传了一个不存在的 `chat_messages.id`，触发外键问题。

你现在要做：

1. 修改 `backend/app/schemas/feedback.py`，增加 `FeedbackListResponse`。
2. 创建 `backend/app/routers/feedbacks.py`。
3. 修改 `backend/app/main.py`，挂载 feedbacks router。
4. 执行 `python -m compileall app`。
5. 用 Swagger 测试 `POST /api/feedbacks`。
6. 测试 `GET /api/feedbacks`。
7. 测试 `GET /api/feedbacks/{feedback_id}`。
8. 测试 `PATCH /api/feedbacks/{feedback_id}`。
9. 把结果发给我。

## 第 15 步验收结果：回复校对接口已完成

你已经用 Swagger 验证过：

- `POST /api/feedbacks`：可以创建一条待处理反馈。
- `GET /api/feedbacks`：可以分页查询反馈列表。
- `GET /api/feedbacks?question=北京`：可以按问题关键字筛选。
- `GET /api/feedbacks?user=管理员`：可以按用户筛选。
- `GET /api/feedbacks?status=pending`：可以按状态筛选。
- `GET /api/feedbacks/1`：可以查询反馈详情。
- `PATCH /api/feedbacks/1`：可以把反馈处理成 `resolved`，并写入备注和处理时间。

这一页对应原型里的「反馈管理 / 回复校对」。到这里为止，我们已经有了一个完整的 CRUD 模块：

- C：创建反馈。
- R：查询列表和详情。
- U：处理反馈。
- D：这个页面原型里不需要删除，所以暂时不做。

## 第 16 步：创建智能问数接口

这一页对应第一张原型图，也就是左侧有「近30天记录」，中间可以问问题，AI 返回表格、统计和图表。

这一阶段先做“模拟 AI 回复”，不直接接真实大模型。

原因：

- 面试 demo 的重点是证明你能打通前端、后端、数据库、Docker 这条链路。
- 真实 AI 接口需要 API Key、费用、网络稳定性，容易让 demo 变复杂。
- 我们先把接口结构设计成真实业务能扩展的样子，后面把 `mock_ai.py` 替换成真实模型调用即可。

前端类比：

- `ChatSession` 像左侧的一条会话记录。
- `ChatMessage` 像聊天窗口里的一条消息气泡。
- `answer_data` 像后端返回给前端渲染表格、统计、图表的 JSON 配置。
- `routers/chat.py` 像前端里的 `api/chat.ts`，负责把功能暴露成 HTTP 接口。

本轮只做一件事：

```txt
先创建 backend/app/services/mock_ai.py
```

先不要急着写 `routers/chat.py`，也先不要改 `main.py`。

原因：

- `mock_ai.py` 是业务逻辑层，先把“AI 应该返回什么数据结构”定下来。
- `routers/chat.py` 是接口层，下一步再把这个业务逻辑暴露成 HTTP 接口。
- 如果把业务逻辑和接口混在一个文件里，后面接真实 AI 或前端联调时会很乱。

前端类比：

- `mock_ai.py` 像前端项目里的 `mock/chat.ts` 或 `services/chatMock.ts`。
- `routers/chat.py` 像前端项目里的接口封装 `api/chat.ts`。
- 页面组件不应该直接写死假数据，后端接口也不应该把所有业务逻辑都堆在 router 里。

### 16.1 创建模拟 AI 服务

创建文件：

```txt
backend/app/services/mock_ai.py
```

写入：

```python
from __future__ import annotations

import time
from typing import Any


BUSINESS_TARGET_ROWS = [
    {"business_unit": "北京代表处", "year": 2026, "business_target": 7950, "solution_target": 1200},
    {"business_unit": "上海代表处", "year": 2026, "business_target": 7070, "solution_target": 980},
    {"business_unit": "浙江代表处", "year": 2026, "business_target": 6460, "solution_target": 860},
    {"business_unit": "江苏代表处", "year": 2026, "business_target": 5560, "solution_target": 720},
    {"business_unit": "山东代表处", "year": 2026, "business_target": 4090, "solution_target": 650},
]


def _build_business_target_answer() -> dict[str, Any]:
    total = sum(row["business_target"] for row in BUSINESS_TARGET_ROWS)
    average = round(total / len(BUSINESS_TARGET_ROWS))
    max_row = max(BUSINESS_TARGET_ROWS, key=lambda row: row["business_target"])
    min_row = min(BUSINESS_TARGET_ROWS, key=lambda row: row["business_target"])

    return {
        "title": "经营单元收入&完成率分析",
        "description": "2026年各经营单元商业目标与商解目标对比（单位：万元）",
        "table": {
            "columns": [
                {"key": "business_unit", "label": "经营单元"},
                {"key": "year", "label": "年度"},
                {"key": "business_target", "label": "商业目标(万)"},
                {"key": "solution_target", "label": "商解目标(万)"},
            ],
            "rows": BUSINESS_TARGET_ROWS,
        },
        "stats": [
            {"label": "总记录数", "value": f"{len(BUSINESS_TARGET_ROWS)} 条"},
            {"label": "平均值", "value": f"¥{average:,}万"},
            {"label": "最大值", "value": f"¥{max_row['business_target']:,}万（{max_row['business_unit']}）"},
            {"label": "最小值", "value": f"¥{min_row['business_target']:,}万（{min_row['business_unit']}）"},
        ],
        "chart": {
            "type": "bar",
            "title": "经营单元目标对比",
            "x_key": "business_unit",
            "series": [
                {"key": "business_target", "name": "商业目标", "color": "#2563eb"},
                {"key": "solution_target", "name": "商解目标", "color": "#10b981"},
            ],
        },
        "suggestions": ["目标差异是什么？", "目标如何设定？", "未来趋势如何？"],
    }


def generate_mock_answer(question: str) -> dict[str, Any]:
    started_at = time.perf_counter()
    answer_data = _build_business_target_answer()

    content = "已生成经营单元收入与完成率分析，包含数据表格、统计结果和目标对比图。"
    if "经营单元" not in question and "完成率" not in question:
        content = "我先按经营单元收入与完成率分析场景返回一份演示数据，后续可以继续扩展问题分类。"

    elapsed_ms = int((time.perf_counter() - started_at) * 1000)

    return {
        "content": content,
        "answer_data": answer_data,
        "elapsed_ms": max(elapsed_ms, 1),
        "token_count": len(question) + len(content),
    }
```

这里的 `mock_ai.py` 可以理解成前端里的 `mock.ts`：

- 现在先返回固定数据。
- 以后接真实 AI 时，只需要保持返回结构不变。
- 前端页面不需要知道数据是真 AI 生成的，还是 mock 生成的。

这段代码重点理解这些地方：

- `BUSINESS_TARGET_ROWS`：模拟数据库或 AI 计算出来的业务数据，先写死成数组。
- `_build_business_target_answer()`：把原始数据整理成前端能直接渲染的结构。
- `table.columns`：告诉前端表格有哪些列。
- `table.rows`：告诉前端表格有哪些行。
- `stats`：对应截图里的「总记录数、平均值、最大值、最小值」。
- `chart`：对应截图里的柱状图配置。
- `suggestions`：对应截图底部的快捷追问按钮。
- `generate_mock_answer(question)`：对外暴露的函数，后面 router 只调用这个函数，不关心内部怎么生成答案。
- `elapsed_ms`：模拟耗时，后面可以显示“耗时 0.6s”。
- `token_count`：模拟 token 数，后面可以显示“Token:342”。

### 16.1.1 Python 写法逐行解释

先看文件顶部：

```python
from __future__ import annotations

import time
from typing import Any
```

#### from __future__ import annotations

这句可以先理解成 Python 的“兼容性设置”。

它让类型标注的处理更灵活，尤其是项目慢慢变复杂后，类型之间互相引用时不容易出问题。

前端类比：

```ts
// 有点像开启一种更现代、更宽容的类型处理方式
```

现阶段你不需要死记它，知道它不是业务逻辑即可。

#### import time

```python
import time
```

这是导入 Python 内置的 `time` 模块。

后面会用：

```python
time.perf_counter()
```

来计算这次模拟 AI 回复花了多少时间。

前端类比：

```ts
const startedAt = performance.now()
```

#### from typing import Any

```python
from typing import Any
```

`Any` 表示“任意类型”。

这里会用在：

```python
def _build_business_target_answer() -> dict[str, Any]:
```

意思是：这个函数返回一个字典，key 是字符串，value 可以是任意类型。

为什么 value 要用 `Any`？

因为返回的数据里有字符串、数组、对象、数字，结构比较复杂：

```python
{
    "title": "经营单元收入&完成率分析",
    "table": {...},
    "stats": [...],
    "chart": {...},
}
```

前端类比：

```ts
function buildBusinessTargetAnswer(): Record<string, any> {
  return {
    title: "...",
    table: {},
    stats: [],
    chart: {},
  }
}
```

#### def 是什么

Python 用 `def` 定义函数：

```python
def _build_business_target_answer() -> dict[str, Any]:
```

前端类比：

```ts
function buildBusinessTargetAnswer(): Record<string, any> {
}
```

注意 Python 函数后面有一个冒号：

```python
:
```

函数内部代码靠缩进表示，不用 `{}`。

前端写法：

```ts
function test() {
  const a = 1
}
```

Python 写法：

```python
def test():
    a = 1
```

所以 Python 对缩进很敏感。

#### -> dict[str, Any] 是什么

```python
def _build_business_target_answer() -> dict[str, Any]:
```

`-> dict[str, Any]` 是返回值类型标注。

意思是：

```txt
这个函数预计返回一个 dict
dict 的 key 是 str
dict 的 value 可以是 Any
```

它类似 TypeScript 的返回类型：

```ts
function buildBusinessTargetAnswer(): Record<string, any> {
}
```

注意：

- Python 的类型标注默认主要是给开发者和编辑器看的。
- 它不像 TypeScript 那样在编译阶段强制拦截所有类型错误。
- 但是写上类型标注，代码更容易读，也更像正规后端项目。

下面这一段是第一次看 Python 时最容易卡住的地方：

```python
total = sum(row["business_target"] for row in BUSINESS_TARGET_ROWS)
average = round(total / len(BUSINESS_TARGET_ROWS))
max_row = max(BUSINESS_TARGET_ROWS, key=lambda row: row["business_target"])
min_row = min(BUSINESS_TARGET_ROWS, key=lambda row: row["business_target"])
```

先看数据结构。

`BUSINESS_TARGET_ROWS` 是一个列表，类似 JavaScript 里的数组：

```python
BUSINESS_TARGET_ROWS = [
    {"business_unit": "北京代表处", "year": 2026, "business_target": 7950, "solution_target": 1200},
    {"business_unit": "上海代表处", "year": 2026, "business_target": 7070, "solution_target": 980},
]
```

前端类比：

```ts
const BUSINESS_TARGET_ROWS = [
  { business_unit: "北京代表处", year: 2026, business_target: 7950, solution_target: 1200 },
  { business_unit: "上海代表处", year: 2026, business_target: 7070, solution_target: 980 },
]
```

Python 里的 `{}` 是字典 `dict`，很像 JS 里的普通对象。

取值方式是：

```python
row["business_target"]
```

前端类比：

```ts
row.business_target
// 或
row["business_target"]
```

#### total 这一行

```python
total = sum(row["business_target"] for row in BUSINESS_TARGET_ROWS)
```

意思是：

1. 遍历 `BUSINESS_TARGET_ROWS` 里的每一条数据。
2. 每一条临时叫做 `row`。
3. 从每个 `row` 里拿出 `business_target`。
4. 用 `sum(...)` 把这些数字加起来。

展开写就是：

```python
total = 0

for row in BUSINESS_TARGET_ROWS:
    total = total + row["business_target"]
```

前端类比：

```ts
const total = BUSINESS_TARGET_ROWS.reduce((sum, row) => {
  return sum + row.business_target
}, 0)
```

这里的：

```python
row["business_target"] for row in BUSINESS_TARGET_ROWS
```

叫“生成器表达式”，可以先简单理解成 Python 里的轻量版 `map`。

前端类比：

```ts
BUSINESS_TARGET_ROWS.map(row => row.business_target)
```

区别是：

- `map` 会先生成一个新数组。
- Python 这个写法不会立刻生成完整列表，而是边遍历边给 `sum` 用。
- 现在不用深究性能，先理解成“遍历并取出某个字段”即可。

#### average 这一行

```python
average = round(total / len(BUSINESS_TARGET_ROWS))
```

拆开看：

```python
len(BUSINESS_TARGET_ROWS)
```

表示列表长度。

前端类比：

```ts
BUSINESS_TARGET_ROWS.length
```

所以：

```python
total / len(BUSINESS_TARGET_ROWS)
```

就是：

```txt
总数 / 条数
```

也就是平均值。

`round(...)` 表示四舍五入。

前端类比：

```ts
Math.round(total / BUSINESS_TARGET_ROWS.length)
```

注意：

- Python 里的 `/` 是普通除法，结果可能是小数。
- `round(...)` 会把结果取整。

#### max_row 这一行

```python
max_row = max(BUSINESS_TARGET_ROWS, key=lambda row: row["business_target"])
```

这行的意思是：

```txt
从 BUSINESS_TARGET_ROWS 里找出 business_target 最大的那一整条数据
```

不是只返回最大数字，而是返回整条 row。

比如结果会是：

```python
{"business_unit": "北京代表处", "year": 2026, "business_target": 7950, "solution_target": 1200}
```

`max(...)` 是 Python 内置函数，用来找最大值。

如果列表里全是数字，可以直接写：

```python
max([1, 3, 2])
```

结果是：

```txt
3
```

但现在列表里不是数字，而是一堆字典。

Python 不知道应该按哪个字段比较，所以我们要告诉它：

```python
key=lambda row: row["business_target"]
```

意思是：

```txt
比较大小时，请用每一条 row 的 business_target 字段作为比较依据
```

前端类比：

```ts
const maxRow = BUSINESS_TARGET_ROWS.reduce((max, row) => {
  return row.business_target > max.business_target ? row : max
})
```

#### lambda 是什么

```python
lambda row: row["business_target"]
```

`lambda` 是 Python 里的匿名函数。

前端类比：

```ts
(row) => row.business_target
```

所以这句：

```python
key=lambda row: row["business_target"]
```

可以类比成：

```ts
key: (row) => row.business_target
```

如果不用 `lambda`，也可以写成普通函数：

```python
def get_business_target(row):
    return row["business_target"]


max_row = max(BUSINESS_TARGET_ROWS, key=get_business_target)
```

这和下面这句效果一样：

```python
max_row = max(BUSINESS_TARGET_ROWS, key=lambda row: row["business_target"])
```

所以你可以把 `lambda` 先理解成：

```txt
只用一次的小函数
```

#### min_row 这一行

```python
min_row = min(BUSINESS_TARGET_ROWS, key=lambda row: row["business_target"])
```

和 `max_row` 完全一样，只是找最小值。

意思是：

```txt
从 BUSINESS_TARGET_ROWS 里找出 business_target 最小的那一整条数据
```

前端类比：

```ts
const minRow = BUSINESS_TARGET_ROWS.reduce((min, row) => {
  return row.business_target < min.business_target ? row : min
})
```

#### 为什么 max_row 和 min_row 返回整条数据

因为页面统计里不只是要显示数字，还要显示这个数字属于谁。

比如截图里要显示：

```txt
最大值：¥7,950万（北京代表处）
最小值：¥4,090万（山东代表处）
```

如果只拿到最大数字 `7950`，就不知道它对应哪个经营单元。

所以我们要拿整条数据：

```python
max_row["business_target"]
max_row["business_unit"]
```

前端类比：

```ts
maxRow.business_target
maxRow.business_unit
```

#### f-string 是什么

后面还有这种写法：

```python
f"¥{average:,}万"
```

这是 Python 的字符串模板，叫 f-string。

前端类比：

```ts
`¥${average}万`
```

其中：

```python
{average:,}
```

里的 `:,` 表示加千分位分隔符。

例如：

```python
average = 6226
f"¥{average:,}万"
```

结果是：

```txt
¥6,226万
```

#### generate_mock_answer 里的计时

```python
started_at = time.perf_counter()
```

这句记录开始时间。

前端类比：

```ts
const startedAt = performance.now()
```

后面这句：

```python
elapsed_ms = int((time.perf_counter() - started_at) * 1000)
```

意思是：

1. 再调用一次 `time.perf_counter()` 拿到当前时间。
2. 当前时间减去开始时间，得到耗时，单位是秒。
3. 乘以 `1000`，变成毫秒。
4. `int(...)` 转成整数。

前端类比：

```ts
const elapsedMs = Math.floor((performance.now() - startedAt))
```

这里为什么要算耗时？

因为原型图底部有类似：

```txt
耗时0.6s Token:342
```

我们现在先模拟这个字段，后面前端就可以直接显示。

#### if ... not in ... 是什么

```python
if "经营单元" not in question and "完成率" not in question:
    content = "我先按经营单元收入与完成率分析场景返回一份演示数据，后续可以继续扩展问题分类。"
```

这句的意思是：

```txt
如果用户问题里不包含“经营单元”，并且也不包含“完成率”，就换一段更通用的回复文案。
```

`in` 表示“是否包含”。

前端类比：

```ts
if (!question.includes("经营单元") && !question.includes("完成率")) {
  content = "我先按经营单元收入与完成率分析场景返回一份演示数据，后续可以继续扩展问题分类。"
}
```

#### max(elapsed_ms, 1) 是什么

```python
"elapsed_ms": max(elapsed_ms, 1),
```

意思是：

```txt
elapsed_ms 和 1 之间取更大的那个
```

为什么要这样？

因为 mock 函数执行太快了，有可能耗时是 `0ms`。

为了页面展示不奇怪，我们至少返回 `1ms`。

前端类比：

```ts
elapsed_ms: Math.max(elapsedMs, 1)
```

#### len(question) + len(content) 是什么

```python
"token_count": len(question) + len(content),
```

这里不是严格真实的 token 计算，只是 demo 里模拟一个 token 数。

`len(question)` 表示问题字符串长度。

`len(content)` 表示回答字符串长度。

前端类比：

```ts
token_count: question.length + content.length
```

真实接大模型时，token 通常由模型服务返回；现在只是为了让页面先有数据可以展示。

为什么函数名前面有一个 `_`：

- `_build_business_target_answer` 前面的 `_` 表示“这个函数主要给当前文件内部使用”。
- Python 不会强制禁止外部调用它，但这是一个约定。
- 前端里类似你不会导出一个内部 helper，只导出真正给外面用的函数。

本轮验收标准：

1. 文件 `backend/app/services/mock_ai.py` 创建完成。
2. 执行下面命令不报错：

```bash
cd ~/Desktop/full-stack-demo/backend
source .venv/bin/activate
python -m compileall app
```

如果这一步通过，把终端结果发给我，我们再继续写 `routers/chat.py`。

### 16.2 创建会话接口文件

现在开始写：

```txt
backend/app/routers/chat.py
```

这一轮只创建这个文件，并执行语法检查。

先不要改 `main.py`，也先不要去 Swagger 测试。

原因：

- `chat.py` 是接口文件，负责定义“有哪些 HTTP 接口”。
- `main.py` 是应用入口，负责把接口文件挂载到 FastAPI 应用里。
- 先写接口文件并确认语法正确，下一步再挂载，问题更容易定位。

前端类比：

- `chat.py` 类似你写一个 `api/chat.ts` 或一个页面路由模块。
- `main.py` 类似统一的路由入口，比如把页面放进 `router.tsx`。
- 文件写好了不代表页面已经能访问，还需要挂载。

### 16.2.1 创建文件

创建文件：

```txt
backend/app/routers/chat.py
```

写入：

```python
from datetime import datetime, timezone

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session, selectinload

from app.db.session import get_db
from app.models.chat import ChatMessage, ChatSession
from app.schemas.chat import ChatMessageCreate, ChatSessionCreate, ChatSessionRead
from app.services.mock_ai import generate_mock_answer

import app.models


router = APIRouter(prefix="/api/sessions", tags=["sessions"])


def _get_session_with_messages(db: Session, session_id: int) -> ChatSession | None:
    return (
        db.query(ChatSession)
        .options(selectinload(ChatSession.messages))
        .filter(ChatSession.id == session_id)
        .first()
    )


@router.post("", response_model=ChatSessionRead)
def create_session(payload: ChatSessionCreate, db: Session = Depends(get_db)):
    session = ChatSession(title=payload.title)
    db.add(session)
    db.commit()
    db.refresh(session)
    return session


@router.get("", response_model=list[ChatSessionRead])
def list_sessions(db: Session = Depends(get_db)):
    return (
        db.query(ChatSession)
        .options(selectinload(ChatSession.messages))
        .order_by(ChatSession.updated_at.desc())
        .all()
    )


@router.get("/{session_id}", response_model=ChatSessionRead)
def get_session(session_id: int, db: Session = Depends(get_db)):
    session = _get_session_with_messages(db, session_id)
    if session is None:
        raise HTTPException(status_code=404, detail="session not found")
    return session


@router.post("/{session_id}/messages", response_model=ChatSessionRead)
def send_message(
    session_id: int,
    payload: ChatMessageCreate,
    db: Session = Depends(get_db),
):
    session = db.query(ChatSession).filter(ChatSession.id == session_id).first()
    if session is None:
        raise HTTPException(status_code=404, detail="session not found")

    if payload.role != "user":
        raise HTTPException(status_code=400, detail="only user messages can be sent")

    user_message = ChatMessage(
        session_id=session.id,
        role="user",
        content=payload.content,
    )

    mock_result = generate_mock_answer(payload.content)
    assistant_message = ChatMessage(
        session_id=session.id,
        role="assistant",
        content=mock_result["content"],
        answer_data=mock_result["answer_data"],
        elapsed_ms=mock_result["elapsed_ms"],
        token_count=mock_result["token_count"],
    )

    session.updated_at = datetime.now(timezone.utc)

    db.add_all([user_message, assistant_message])
    db.commit()

    updated_session = _get_session_with_messages(db, session.id)
    if updated_session is None:
        raise HTTPException(status_code=404, detail="session not found")
    return updated_session
```

### 16.2.2 这段代码整体在做什么

这个文件提供 4 个接口：

```txt
POST /api/sessions
GET /api/sessions
GET /api/sessions/{session_id}
POST /api/sessions/{session_id}/messages
```

对应页面行为：

- `POST /api/sessions`：点击「开启新对话」。
- `GET /api/sessions`：左侧「近30天记录」列表。
- `GET /api/sessions/{session_id}`：点开某一条历史会话。
- `POST /api/sessions/{session_id}/messages`：用户输入问题并发送。

一次发送问题时，后端会做这些事：

1. 查找这条会话是否存在。
2. 保存一条用户消息，`role="user"`。
3. 调用 `generate_mock_answer()` 生成模拟 AI 回复。
4. 保存一条 AI 消息，`role="assistant"`。
5. 更新会话的 `updated_at`。
6. 返回完整会话和消息列表。

### 16.2.3 import 部分解释

```python
from datetime import datetime, timezone
```

导入时间相关工具。

后面会用：

```python
datetime.now(timezone.utc)
```

生成当前 UTC 时间，用来更新会话的 `updated_at`。

前端类比：

```ts
new Date()
```

区别是这里明确用了 `timezone.utc`，表示 UTC 时区。

```python
from fastapi import APIRouter, Depends, HTTPException
```

这里导入 FastAPI 的 3 个核心工具：

- `APIRouter`：创建一组接口。
- `Depends`：声明依赖，比如“这个接口需要数据库连接”。
- `HTTPException`：主动返回 HTTP 错误，比如 404、400。

前端类比：

- `APIRouter` 像一个路由模块。
- `Depends(get_db)` 像“调用接口前先准备好 db 实例”。
- `HTTPException` 像你在接口里 `return res.status(404).json(...)`。

```python
from sqlalchemy.orm import Session, selectinload
```

这里导入 SQLAlchemy ORM 的工具：

- `Session`：数据库会话，可以理解成一次数据库操作上下文。
- `selectinload`：查询会话时，顺便把它下面的消息列表也查出来。

前端类比：

- `Session` 有点像你封装好的 `request` 客户端，但它面向数据库。
- `selectinload` 有点像接口返回详情时顺便 include 子数据。

```python
from app.db.session import get_db
```

`get_db` 是我们之前写的数据库依赖。

接口函数里写：

```python
db: Session = Depends(get_db)
```

FastAPI 就会自动帮你拿到一个数据库连接。

```python
from app.models.chat import ChatMessage, ChatSession
```

导入数据库模型。

前端类比：

- `ChatSession` 像会话表的 ORM 版本。
- `ChatMessage` 像消息表的 ORM 版本。
- 你操作它们，就相当于操作数据库表。

```python
from app.schemas.chat import ChatMessageCreate, ChatSessionCreate, ChatSessionRead
```

导入接口入参和出参结构。

前端类比：

```ts
type ChatSessionCreate = {
  title: string
}

type ChatMessageCreate = {
  role: string
  content: string
}
```

```python
from app.services.mock_ai import generate_mock_answer
```

导入上一步写好的模拟 AI 函数。

`chat.py` 不自己生成答案，而是调用 service 层。

这样分层更清晰：

```txt
router 负责接口
service 负责业务逻辑
model 负责数据库表
schema 负责请求/响应格式
```

```python
import app.models
```

这句的作用是确保 `app.models.__init__.py` 被执行，让模型都注册到 SQLAlchemy。

你之前遇到的外键找不到表问题，本质上就是模型没有完整注册。

### 16.2.4 router 是什么

```python
router = APIRouter(prefix="/api/sessions", tags=["sessions"])
```

这句创建一个接口分组。

`prefix="/api/sessions"` 表示这个文件里的接口都以 `/api/sessions` 开头。

比如：

```python
@router.post("")
```

最终路径就是：

```txt
POST /api/sessions
```

再比如：

```python
@router.post("/{session_id}/messages")
```

最终路径就是：

```txt
POST /api/sessions/{session_id}/messages
```

`tags=["sessions"]` 是 Swagger 文档里的分组名称。

### 16.2.5 _get_session_with_messages 是什么

```python
def _get_session_with_messages(db: Session, session_id: int) -> ChatSession | None:
```

这是一个内部辅助函数。

前面的 `_` 表示这个函数主要给当前文件内部使用。

它接收两个参数：

- `db`：数据库会话。
- `session_id`：要查询的会话 id。

返回值：

```python
ChatSession | None
```

意思是：

- 找到了，就返回 `ChatSession`。
- 没找到，就返回 `None`。

前端类比：

```ts
function getSessionWithMessages(id: number): ChatSession | null {
}
```

这一段：

```python
return (
    db.query(ChatSession)
    .options(selectinload(ChatSession.messages))
    .filter(ChatSession.id == session_id)
    .first()
)
```

可以拆开理解：

```python
db.query(ChatSession)
```

表示从 `chat_sessions` 表开始查询。

```python
.options(selectinload(ChatSession.messages))
```

表示顺便加载这条会话下面的 `messages`。

```python
.filter(ChatSession.id == session_id)
```

表示只要 id 等于传入 `session_id` 的那条。

```python
.first()
```

表示取第一条结果；如果没有结果，就返回 `None`。

前端类比：

```ts
const session = sessions.find(item => item.id === sessionId)
```

只是这里查的是数据库，不是前端数组。

### 16.2.6 创建会话接口

```python
@router.post("", response_model=ChatSessionRead)
def create_session(payload: ChatSessionCreate, db: Session = Depends(get_db)):
```

这一段定义：

```txt
POST /api/sessions
```

`payload: ChatSessionCreate` 表示请求 body 的结构。

也就是前端要传：

```json
{
  "title": "经营单元收入&完成率分析"
}
```

`response_model=ChatSessionRead` 表示响应结构。

FastAPI 会按 `ChatSessionRead` 的格式返回数据。

这一句：

```python
session = ChatSession(title=payload.title)
```

创建一条会话对象。

它还没有真正保存到数据库，只是在 Python 内存里创建了一个对象。

```python
db.add(session)
```

把对象加入数据库会话，意思是“准备保存”。

```python
db.commit()
```

真正提交到数据库。

前端类比：

```ts
await request.post("/api/sessions", data)
```

但后端这里是更底层的数据库保存。

```python
db.refresh(session)
```

提交后，数据库会生成 `id`、`created_at`、`updated_at`。

`refresh` 的作用是把数据库生成的新值同步回 Python 对象。

如果不 `refresh`，你可能拿不到最新的 `id` 或时间字段。

### 16.2.7 查询会话列表接口

```python
@router.get("", response_model=list[ChatSessionRead])
def list_sessions(db: Session = Depends(get_db)):
```

这一段定义：

```txt
GET /api/sessions
```

返回值是：

```python
list[ChatSessionRead]
```

意思是返回一个数组，数组里每一项都是 `ChatSessionRead`。

前端类比：

```ts
Promise<ChatSessionRead[]>
```

查询部分：

```python
db.query(ChatSession)
.options(selectinload(ChatSession.messages))
.order_by(ChatSession.updated_at.desc())
.all()
```

拆开看：

- `db.query(ChatSession)`：查询会话表。
- `selectinload(ChatSession.messages)`：顺便加载消息。
- `order_by(ChatSession.updated_at.desc())`：按更新时间倒序排列。
- `.all()`：返回所有结果。

`desc()` 是 descending 的缩写，表示倒序。

前端类比：

```ts
sessions.sort((a, b) => b.updated_at.localeCompare(a.updated_at))
```

为什么按 `updated_at` 倒序？

因为左侧「近30天记录」通常要把最近对话排在最上面。

### 16.2.8 查询会话详情接口

```python
@router.get("/{session_id}", response_model=ChatSessionRead)
def get_session(session_id: int, db: Session = Depends(get_db)):
```

这一段定义：

```txt
GET /api/sessions/1
```

`{session_id}` 是路径参数。

前端类比：

```txt
/api/sessions/:sessionId
```

FastAPI 会自动把 URL 里的 `1` 传给函数参数：

```python
session_id: int
```

然后查询：

```python
session = _get_session_with_messages(db, session_id)
```

如果没查到：

```python
if session is None:
    raise HTTPException(status_code=404, detail="session not found")
```

这会让接口返回 404。

前端类比：

```ts
if (!session) {
  throw new Response("session not found", { status: 404 })
}
```

### 16.2.9 发送消息接口

```python
@router.post("/{session_id}/messages", response_model=ChatSessionRead)
def send_message(
    session_id: int,
    payload: ChatMessageCreate,
    db: Session = Depends(get_db),
):
```

这一段定义：

```txt
POST /api/sessions/1/messages
```

它同时接收：

- URL 里的 `session_id`。
- body 里的 `payload`。
- FastAPI 注入的数据库连接 `db`。

请求 body 长这样：

```json
{
  "role": "user",
  "content": "经营单元收入&完成率分析"
}
```

先查会话：

```python
session = db.query(ChatSession).filter(ChatSession.id == session_id).first()
```

如果会话不存在，返回 404。

再判断：

```python
if payload.role != "user":
    raise HTTPException(status_code=400, detail="only user messages can be sent")
```

为什么只允许 `user`？

因为这个接口是“用户发送问题”。

AI 回复应该由后端生成，前端不能自己传一个 `assistant` 消息进来。

接着创建用户消息：

```python
user_message = ChatMessage(
    session_id=session.id,
    role="user",
    content=payload.content,
)
```

这条消息还没有保存，只是在内存里创建了一个 ORM 对象。

然后调用模拟 AI：

```python
mock_result = generate_mock_answer(payload.content)
```

`mock_result` 大概长这样：

```python
{
    "content": "已生成经营单元收入与完成率分析，包含数据表格、统计结果和目标对比图。",
    "answer_data": {...},
    "elapsed_ms": 1,
    "token_count": 50,
}
```

再创建 AI 消息：

```python
assistant_message = ChatMessage(
    session_id=session.id,
    role="assistant",
    content=mock_result["content"],
    answer_data=mock_result["answer_data"],
    elapsed_ms=mock_result["elapsed_ms"],
    token_count=mock_result["token_count"],
)
```

注意这里的取值方式：

```python
mock_result["content"]
```

因为 `mock_result` 是 Python 字典。

前端类比：

```ts
mockResult.content
```

更新会话时间：

```python
session.updated_at = datetime.now(timezone.utc)
```

这样左侧会话列表排序时，这条会话会排到前面。

保存两条消息：

```python
db.add_all([user_message, assistant_message])
db.commit()
```

`add_all` 表示一次加入多个对象。

前端类比：

```ts
messages.push(userMessage, assistantMessage)
```

只是这里最终会保存到数据库。

提交后重新查询：

```python
updated_session = _get_session_with_messages(db, session.id)
```

为什么要重新查询？

因为我们希望返回给前端的是完整会话，包括刚刚新增的两条消息。

### 16.2.10 本轮验收标准

这一轮只验证 Python 语法，不测试接口。

执行：

```bash
cd ~/Desktop/full-stack-demo/backend
source .venv/bin/activate
python -m compileall app
```

如果没有报错，就把终端结果发给我。

下一轮我们再修改：

```txt
backend/app/main.py
```

把 `chat.router` 挂载到 FastAPI 应用里，然后去 Swagger 测试接口。

本轮你现在只做：

1. 创建 `backend/app/routers/chat.py`。
2. 把 16.2.1 的代码写进去。
3. 执行 `python -m compileall app`。
4. 把终端结果发给我。

### 16.2.11 验收结果

已完成：

- `backend/app/routers/chat.py` 已创建。
- 语法检查通过。
- `chat.py` 还没有挂载到 `main.py`。
- Swagger 里暂时还看不到 `/api/sessions`，这是正常的。

下一步：

```txt
第 16.3：在 main.py 挂载 chat router
```

回家后从这里继续，不要直接跳到前端。

### 16.3 在 main.py 挂载 chat router

这一步把 `backend/app/routers/chat.py` 里写好的智能问数接口，正式注册到 FastAPI 应用里。

原因：上一轮只是创建了接口文件，并确认语法没问题。但 FastAPI 不会自动扫描 `routers/` 目录。一个 router 文件写好了以后，还必须在 `main.py` 里通过：

```python
app.include_router(...)
```

挂到主应用上。

否则会出现这种情况：

- `python -m compileall app` 可以通过。
- 代码文件也确实存在。
- 但是 Swagger 里看不到 `/api/sessions`。
- 浏览器访问 `/api/sessions` 返回 404。

这不是接口代码错，而是还没有把 router 注册进 FastAPI。

前端类比：

- `routers/chat.py` 像你写好了一个页面组件。
- `main.py` 里的 `app.include_router(chat.router)` 像你把这个页面配置进前端路由表。
- 组件写好了但没配置路由，浏览器自然访问不到。

#### 16.3.1 修改 main.py

修改文件：

```txt
backend/app/main.py
```

目标代码：

```python
from fastapi import FastAPI

from app.db.session import check_database_connection
from app.routers import chat, feedbacks, settings

app = FastAPI(title="Full Stack Demo API")

app.include_router(settings.router)
app.include_router(feedbacks.router)
app.include_router(chat.router)


@app.get("/health")
def health_check():
    return {"status": "ok"}


@app.get("/health/db")
def database_health_check():
    check_database_connection()
    return {"database": "ok"}
```

重点只有两处。

第一处：

```python
from app.routers import chat, feedbacks, settings
```

解释：

- 从 `app/routers/` 目录里导入 3 个路由模块。
- `settings` 对应应用配置接口。
- `feedbacks` 对应回复校对接口。
- `chat` 对应智能问数会话接口。

第二处：

```python
app.include_router(chat.router)
```

解释：

- 把 `chat.py` 里的 `router` 注册到 FastAPI 应用。
- 注册后，`chat.py` 里的这些接口才真正生效：

```txt
POST /api/sessions
GET  /api/sessions
GET  /api/sessions/{session_id}
POST /api/sessions/{session_id}/messages
```

#### 16.3.2 检查语法

执行：

```bash
cd ~/Desktop/full-stack-demo/backend
source .venv/bin/activate
python -m compileall app
```

如果没有报错，说明 Python 语法没问题。

注意：

- `compileall` 只能证明语法正确。
- 它不能证明接口真的能访问。
- 所以后面还要打开 Swagger 测试。

#### 16.3.3 启动后端

如果后端没启动，执行：

```bash
python -m uvicorn app.main:app --reload
```

如果后端已经启动了，保存 `main.py` 后，Uvicorn 通常会自动 reload。

终端看到类似：

```txt
Application startup complete.
```

说明后端已经重新加载。

#### 16.3.4 打开 Swagger

浏览器打开：

```txt
http://127.0.0.1:8000/docs
```

检查是否出现：

```txt
sessions
```

这个分组。

如果能看到 `sessions` 分组，说明 `chat.router` 已经挂载成功。

如果看不到：

- 检查 `main.py` 是否导入了 `chat`。
- 检查是否写了 `app.include_router(chat.router)`。
- 检查后端是否已经 reload。

#### 16.3.5 测试创建会话

在 Swagger 里找到：

```txt
POST /api/sessions
```

点击 `Try it out`。

Request body 填：

```json
{
  "title": "新对话"
}
```

点击 `Execute`。

成功后应该返回类似：

```json
{
  "id": 1,
  "title": "新对话",
  "created_at": "2026-06-29T...",
  "updated_at": "2026-06-29T...",
  "messages": []
}
```

这里为什么只传 `title`：

- `id` 是数据库自动生成的。
- `created_at` 是数据库自动生成的。
- `updated_at` 是数据库自动生成的。
- 新会话刚创建时还没有消息，所以 `messages` 是空数组。

当前阶段可以先用：

```txt
新对话
```

作为默认标题。

后面前端接入时也可以用用户第一条问题的前 20 个字作为标题。

#### 16.3.6 测试会话列表

找到：

```txt
GET /api/sessions
```

点击 `Try it out`，再点 `Execute`。

应该返回一个数组，里面包含刚创建的会话。

用途：

- 对应智能问数页面左侧的“近30天记录”。

#### 16.3.7 测试会话详情

找到：

```txt
GET /api/sessions/{session_id}
```

假设刚才创建会话返回的 `id` 是 `1`，那 `session_id` 填：

```txt
1
```

点击 `Execute`。

应该返回 id 为 1 的会话详情。

用途：

- 对应点击历史会话后，加载这条会话里的消息。

#### 16.3.8 测试发送消息

找到：

```txt
POST /api/sessions/{session_id}/messages
```

`session_id` 填刚才创建的会话 id，例如：

```txt
1
```

Request body 填：

```json
{
  "role": "user",
  "content": "2026年各经营单元的收入和完成率分别是多少？"
}
```

点击 `Execute`。

成功后应该返回这个会话，并且 `messages` 里应该有两条消息：

```txt
user 消息
assistant 消息
```

原因：

- 用户发送一条消息后，后端会先保存用户消息。
- 然后调用 `generate_mock_answer(...)` 生成一条模拟 AI 回复。
- 再保存 assistant 消息。
- 最后返回完整会话。

你应该能在返回结果里看到：

```json
"role": "user"
```

以及：

```json
"role": "assistant"
```

assistant 消息里还会有：

```json
"answer_data": {
  "table": "...",
  "stats": "...",
  "chart": "...",
  "suggestions": "..."
}
```

这些数据后面会给前端渲染表格、统计项、柱状图和下一步问题建议。

#### 16.3.9 可选测试：错误角色

仍然测试：

```txt
POST /api/sessions/{session_id}/messages
```

Request body 改成：

```json
{
  "role": "assistant",
  "content": "这是一条错误测试"
}
```

预期返回：

```txt
400
```

错误信息类似：

```json
{
  "detail": "only user messages can be sent"
}
```

原因：

- 这个接口是用户发送问题用的。
- assistant 回复应该由后端自动生成，不应该由前端直接提交。

#### 16.3.10 本轮验收标准

这一轮完成后，应该确认：

1. `python -m compileall app` 通过。
2. Swagger 里出现 `sessions` 分组。
3. `POST /api/sessions` 能创建会话。
4. `GET /api/sessions` 能看到会话列表。
5. `GET /api/sessions/{session_id}` 能看到会话详情。
6. `POST /api/sessions/{session_id}/messages` 能返回用户消息和模拟 AI 回复。

你现在要做：

1. 确认 `backend/app/main.py` 已挂载 `chat.router`。
2. 执行 `python -m compileall app`。
3. 打开 `http://127.0.0.1:8000/docs`。
4. 按 16.3.5 到 16.3.8 依次测试。
5. 把测试结果发给我。

#### 16.3.11 关于两个 GET 请求能不能合并

你刚刚问到：

```txt
GET /api/sessions
GET /api/sessions/{session_id}
```

这两个接口能不能合并成一个？

答案是：

```txt
技术上可以合并，但当前不建议合并。
```

原因不是因为代码做不到，而是因为这两个接口表达的是两类不同的资源读取动作。

第一个：

```txt
GET /api/sessions
```

表示“读取会话集合”。

它对应前端左侧历史列表，比如：

```txt
近30天记录
```

前端拿到它以后，一般用于渲染：

- 会话标题。
- 会话 id。
- 更新时间。
- 可能还有分页、搜索、排序。

它的返回值通常是一个数组：

```json
[
  {
    "id": 1,
    "title": "新对话"
  },
  {
    "id": 2,
    "title": "经营分析"
  }
]
```

第二个：

```txt
GET /api/sessions/{session_id}
```

表示“读取某一个具体会话”。

它对应前端点击某条历史记录后，加载这条会话的完整内容。

它的返回值通常是一个对象：

```json
{
  "id": 1,
  "title": "新对话",
  "messages": []
}
```

这两个接口如果强行合并，可能会变成：

```txt
GET /api/sessions?id=1
```

或者：

```txt
GET /api/sessions?mode=detail&id=1
```

这样虽然能工作，但会带来几个问题。

第一个问题：接口语义会变模糊。

```txt
GET /api/sessions
```

本来很清楚地表示“会话列表”。

```txt
GET /api/sessions/1
```

本来很清楚地表示“id 为 1 的会话”。

如果全部塞进一个接口，前端和后端都需要额外判断参数，读代码时也没那么直观。

第二个问题：返回数据结构可能不稳定。

如果一个接口有时候返回数组：

```json
[]
```

有时候返回对象：

```json
{}
```

前端 TypeScript 类型会变复杂。

你可能需要写成：

```ts
ChatSession[] | ChatSession
```

这样后面每次使用都要判断：

```ts
Array.isArray(data)
```

对于当前项目没有必要。

第三个问题：列表接口和详情接口后期优化方向不同。

真实项目里，列表接口通常不应该返回完整消息内容。

比如左侧历史列表只需要：

```txt
id
title
updated_at
```

不一定需要每个会话下面全部 messages。

否则如果用户有 100 个会话，每个会话 20 条消息，打开页面时就会一次性加载 2000 条消息。

这会让接口变慢，也会浪费前端内存。

所以更常见的设计是：

```txt
GET /api/sessions
```

返回轻量列表。

```txt
GET /api/sessions/{session_id}
```

返回某一个会话的完整详情。

当前 demo 里 `GET /api/sessions` 也返回了 `messages`，这是为了前期少写几个 schema，让你先把主流程跑通。

后面如果要更贴近真实业务，可以再拆成：

```txt
ChatSessionListItem
ChatSessionRead
```

也就是：

- 列表接口用 `ChatSessionListItem`，只返回轻量字段。
- 详情接口用 `ChatSessionRead`，返回完整消息。

但这属于后续优化，不影响现在继续往前走。

前端类比一下：

```txt
GET /api/sessions
```

像是拿“文章列表”。

```txt
GET /api/sessions/1
```

像是点进某一篇文章，拿“文章详情”。

文章列表和文章详情当然可以都叫一个接口，但分开会更清楚，也更方便维护。

所以当前结论：

```txt
保留两个 GET。
```

当前页面会这样使用：

- 页面首次打开：调用 `GET /api/sessions`，渲染左侧历史列表。
- 用户点击某条历史会话：调用 `GET /api/sessions/{session_id}`，渲染中间聊天内容。
- 用户发送问题：调用 `POST /api/sessions/{session_id}/messages`，保存用户消息并返回 AI 回复。

#### 16.3.12 你这轮已经完成的验收结果

从你发的截图看，这一轮已经完成：

1. `POST /api/sessions` 创建会话成功。
2. `GET /api/sessions` 获取会话列表成功。
3. `GET /api/sessions/{session_id}` 获取单个会话成功。
4. `POST /api/sessions/{session_id}/messages` 发送用户消息成功。
5. 后端自动生成了 assistant 回复。
6. 返回结果里包含 `answer_data`，后面可以给前端渲染表格、统计项、图表和建议问题。

到这里，后端的核心业务闭环已经跑通：

```txt
创建会话 -> 查询会话 -> 发送问题 -> 保存用户消息 -> 生成模拟 AI 回复 -> 返回完整会话
```

下一步可以开始做前端和后端的连接层。

---

## 第 17 步：前端接入后端前的 API 基础层

这一轮先不急着改页面。

先做一件基础但很重要的事：

```txt
让前端有一个统一的地方负责请求后端接口。
```

前端类比：

如果你在每个组件里都直接写：

```ts
fetch("http://127.0.0.1:8000/api/settings")
```

短期可以跑，长期会很乱。

因为后面会有很多接口：

```txt
/api/settings
/api/settings/{code}
/api/feedbacks
/api/sessions
/api/sessions/{session_id}
/api/sessions/{session_id}/messages
```

如果每个页面都自己拼 URL、自己处理 JSON、自己处理错误，代码会很快散掉。

所以第 17 步先做三件事：

1. 在 Vite 里配置后端代理。
2. 新建统一的 HTTP 请求工具。
3. 新建前端 API 类型和接口函数。

### 17.1 为什么需要 Vite proxy

现在后端运行在：

```txt
http://127.0.0.1:8000
```

前端 Vite 通常运行在：

```txt
http://127.0.0.1:5173
```

浏览器会认为它们是两个不同来源：

```txt
端口不同 = 来源不同
```

如果前端直接请求：

```ts
fetch("http://127.0.0.1:8000/api/settings")
```

可能会遇到跨域问题，也会让代码写死后端地址。

更好的做法是在开发环境让 Vite 代理：

```txt
前端请求 /api/settings
Vite 转发到 http://127.0.0.1:8000/api/settings
```

这样前端代码只需要写：

```ts
fetch("/api/settings")
```

它不关心后端具体跑在哪个端口。

### 17.2 修改 frontend/vite.config.ts

打开：

```txt
frontend/vite.config.ts
```

改成：

```ts
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      "/api": {
        target: "http://127.0.0.1:8000",
        changeOrigin: true,
      },
    },
  },
});
```

这里每一段的意思：

```ts
server
```

表示 Vite 开发服务器配置。

```ts
proxy
```

表示代理规则。

```ts
"/api"
```

表示所有以 `/api` 开头的请求都交给代理。

```ts
target: "http://127.0.0.1:8000"
```

表示真实后端地址。

```ts
changeOrigin: true
```

表示转发请求时，把请求来源调整成目标服务更容易接受的形式。

你可以简单理解为：

```txt
让 Vite 帮前端把请求转发给 FastAPI。
```

### 17.3 新建 frontend/src/api/http.ts

新建目录：

```txt
frontend/src/api
```

新建文件：

```txt
frontend/src/api/http.ts
```

写入：

```ts
type RequestOptions = {
  method?: "GET" | "POST" | "PATCH" | "DELETE";
  body?: unknown;
};

async function request<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const response = await fetch(path, {
    method: options.method ?? "GET",
    headers: {
      "Content-Type": "application/json",
    },
    body: options.body === undefined ? undefined : JSON.stringify(options.body),
  });

  if (!response.ok) {
    const message = await response.text();
    throw new Error(message || `Request failed: ${response.status}`);
  }

  return response.json() as Promise<T>;
}

export const http = {
  get<T>(path: string) {
    return request<T>(path);
  },
  post<T>(path: string, body: unknown) {
    return request<T>(path, { method: "POST", body });
  },
  patch<T>(path: string, body: unknown) {
    return request<T>(path, { method: "PATCH", body });
  },
};
```

这个文件的作用：

```txt
统一处理 fetch、JSON、错误状态。
```

以后组件里不直接写 fetch。

组件只调用：

```ts
http.get(...)
http.post(...)
http.patch(...)
```

### 17.4 新建 frontend/src/api/types.ts

新建文件：

```txt
frontend/src/api/types.ts
```

写入：

```ts
export type AppSetting = {
  id: number;
  code: string;
  name: string;
  description: string;
  enabled: boolean;
  config: Record<string, unknown>;
  updated_at: string;
};

export type ChatMessage = {
  id: number;
  session_id: number;
  role: "user" | "assistant";
  content: string;
  answer_data: Record<string, unknown> | null;
  elapsed_ms: number | null;
  token_count: number | null;
  created_at: string;
};

export type ChatSession = {
  id: number;
  title: string;
  created_at: string;
  updated_at: string;
  messages: ChatMessage[];
};

export type Feedback = {
  id: number;
  user_name: string;
  question: string;
  ai_answer: string;
  status: string;
  remark: string | null;
  message_id: number | null;
  created_at: string;
  handled_at: string | null;
};
```

这里为什么时间字段先写成 `string`：

后端返回的是 JSON。

JSON 没有真正的 `Date` 类型。

所以后端的：

```python
datetime
```

传到前端后会变成：

```ts
string
```

例如：

```txt
2026-06-29T11:49:40.589012Z
```

后面前端展示时，再决定要不要格式化成：

```txt
2026-06-29 19:49
```

### 17.5 新建 frontend/src/api/settings.ts

新建文件：

```txt
frontend/src/api/settings.ts
```

写入：

```ts
import { http } from "./http";
import type { AppSetting } from "./types";

export function getSettings() {
  return http.get<AppSetting[]>("/api/settings");
}

export function updateSetting(
  code: string,
  payload: Pick<AppSetting, "enabled" | "config">,
) {
  return http.patch<AppSetting>(`/api/settings/${code}`, payload);
}
```

这里先接入 settings，是因为它最简单：

```txt
GET /api/settings
PATCH /api/settings/{code}
```

能验证前端代理和请求封装是否可用。

### 17.6 新建 frontend/src/api/chat.ts

新建文件：

```txt
frontend/src/api/chat.ts
```

写入：

```ts
import { http } from "./http";
import type { ChatSession } from "./types";

export function createSession(title: string) {
  return http.post<ChatSession>("/api/sessions", { title });
}

export function getSessions() {
  return http.get<ChatSession[]>("/api/sessions");
}

export function getSession(sessionId: number) {
  return http.get<ChatSession>(`/api/sessions/${sessionId}`);
}

export function sendMessage(sessionId: number, content: string) {
  return http.post<ChatSession>(`/api/sessions/${sessionId}/messages`, {
    role: "user",
    content,
  });
}
```

这几个函数和刚刚 Swagger 里测过的接口一一对应。

前端后面会这样用：

```ts
const session = await createSession("新对话");
const updatedSession = await sendMessage(session.id, "2026年各经营单元的收入和完成率分别是多少？");
```

### 17.7 检查前端能否编译

进入前端目录：

```bash
cd frontend
```

执行：

```bash
pnpm build
```

如果成功，说明：

- TypeScript 类型没有明显错误。
- 新增的 API 文件语法正确。
- Vite 项目仍然能正常构建。

### 17.8 这一轮暂时不验证接口请求

这一轮先只验证编译。

原因：

这些 API 函数还没有被页面调用。

真正的接口联调会放到下一步：

```txt
第 18 步：用前端页面调用 /api/settings，确认前后端连通
```

到时候会在页面里临时展示 settings 数据，确认：

```txt
React -> Vite proxy -> FastAPI -> PostgreSQL
```

这条链路完整打通。

### 17.9 本轮验收标准

完成第 17 步后，应该满足：

1. `frontend/vite.config.ts` 已配置 `/api` 代理。
2. 存在 `frontend/src/api/http.ts`。
3. 存在 `frontend/src/api/types.ts`。
4. 存在 `frontend/src/api/settings.ts`。
5. 存在 `frontend/src/api/chat.ts`。
6. 在 `frontend` 目录执行 `pnpm build` 通过。

你现在要做：

1. 按 17.2 到 17.6 新增和修改文件。
2. 执行 `cd frontend`。
3. 执行 `pnpm build`。
4. 把结果发给我。

### 17.10 你这轮已经完成的验收结果

你已经完成第 17 步。

从截图和提交前复查结果看：

1. `frontend/vite.config.ts` 已配置 `/api` 代理。
2. `frontend/src/api/http.ts` 已创建。
3. `frontend/src/api/types.ts` 已创建。
4. `frontend/src/api/settings.ts` 已创建。
5. `frontend/src/api/chat.ts` 已创建。
6. `pnpm build` 已通过。

提交前还修正了两个小点：

1. `/api/settings` 后端返回的是数组，所以前端函数命名和类型使用 `getSettings(): Promise<AppSetting[]>`。
2. 后端会返回 `null` 的字段，前端类型也写成 `xxx | null`，这样更贴近真实接口。

---

## 第 18 步：用前端页面调用 `/api/settings`，确认前后端连通

第 17 步只是把“前端请求层”准备好了。

但这些函数还没有真的被 React 页面调用。

第 18 步要验证完整链路：

```txt
React 页面
  -> getSettings()
  -> http.get("/api/settings")
  -> Vite proxy
  -> FastAPI /api/settings
  -> PostgreSQL app_settings
  -> 返回数据给 React
```

这一步不是做最终页面。

它只是一个联调页，目标是确认：

```txt
前端真的能拿到后端数据库里的配置数据。
```

### 18.1 启动后端

先确认 PostgreSQL 正在运行。

在项目根目录执行：

```bash
docker compose ps
```

如果 `postgres` 没启动，执行：

```bash
docker compose up -d postgres
```

然后启动后端。

进入后端目录：

```bash
cd backend
```

激活虚拟环境：

```bash
source .venv/bin/activate
```

启动 FastAPI：

```bash
python -m uvicorn app.main:app --reload
```

后端应该运行在：

```txt
http://127.0.0.1:8000
```

可以先打开：

```txt
http://127.0.0.1:8000/api/settings
```

确认后端本身能返回配置列表。

### 18.2 启动前端

新开一个终端。

进入前端目录：

```bash
cd frontend
```

启动 Vite：

```bash
pnpm dev
```

前端通常运行在：

```txt
http://127.0.0.1:5173
```

### 18.3 修改 `frontend/src/App.tsx`

先把 Vite 默认模板换成一个临时联调页面。

打开：

```txt
frontend/src/App.tsx
```

临时改成：

```tsx
import { useEffect, useState } from "react";
import "./App.css";
import { getSettings } from "./api/settings";
import type { AppSetting } from "./api/types";

function App() {
  const [settings, setSettings] = useState<AppSetting[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    getSettings()
      .then((data) => {
        setSettings(data);
      })
      .catch((err: unknown) => {
        setError(err instanceof Error ? err.message : "请求失败");
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  return (
    <main className="page">
      <section className="panel">
        <h1>前后端联调</h1>
        <p className="description">
          当前页面会通过 Vite proxy 调用 FastAPI 的 /api/settings 接口。
        </p>

        {loading && <p>加载中...</p>}
        {error && <p className="error">{error}</p>}

        {!loading && !error && (
          <div className="settings-list">
            {settings.map((item) => (
              <article className="setting-card" key={item.code}>
                <div>
                  <h2>{item.name}</h2>
                  <p>{item.description}</p>
                </div>
                <span className={item.enabled ? "badge enabled" : "badge disabled"}>
                  {item.enabled ? "已开启" : "已关闭"}
                </span>
              </article>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}

export default App;
```

这里几个点要理解：

```tsx
useEffect(...)
```

表示组件首次渲染后，执行一次请求。

类比前端里常见的：

```txt
页面 mounted 后请求接口
```

```tsx
useState<AppSetting[]>([])
```

表示 `settings` 是一个数组，数组里的每一项符合 `AppSetting` 类型。

```tsx
getSettings()
```

就是第 17 步封装的 API 函数。

组件不用关心真实请求地址，也不用直接写 `fetch`。

```tsx
loading
error
settings
```

这是前端请求接口时最常见的三个状态：

- `loading`：正在加载。
- `error`：请求失败。
- `settings`：请求成功后的数据。

### 18.4 临时修改 `frontend/src/App.css`

打开：

```txt
frontend/src/App.css
```

为了这一步联调，可以先把原来的 Vite 模板样式替换成：

```css
.page {
  min-height: 100vh;
  background: #f6f7fb;
  color: #172033;
  padding: 40px;
  box-sizing: border-box;
}

.panel {
  max-width: 920px;
  margin: 0 auto;
}

.description {
  color: #667085;
  margin-bottom: 24px;
}

.settings-list {
  display: grid;
  gap: 12px;
}

.setting-card {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 24px;
  border: 1px solid #d8deea;
  border-radius: 8px;
  background: #fff;
  padding: 18px 20px;
}

.setting-card h2 {
  font-size: 18px;
  margin: 0 0 6px;
}

.setting-card p {
  margin: 0;
  color: #667085;
}

.badge {
  flex: 0 0 auto;
  border-radius: 999px;
  padding: 4px 10px;
  font-size: 14px;
}

.badge.enabled {
  background: #dcfce7;
  color: #166534;
}

.badge.disabled {
  background: #fee2e2;
  color: #991b1b;
}

.error {
  color: #b42318;
}
```

这只是临时联调样式。

等真正做页面时，还会重新整理整体布局和视觉。

### 18.5 浏览器验收

打开：

```txt
http://127.0.0.1:5173
```

如果成功，你应该能看到配置项列表，例如：

```txt
对话开场白
下一步问题建议
文字转语音
语音转文字
模型配置
常问设置
```

如果页面显示这些内容，说明链路已经通了：

```txt
React -> FastAPI -> PostgreSQL
```

### 18.6 常见错误

如果页面报错：

```txt
Failed to fetch
```

先检查后端是否启动。

如果页面报错：

```txt
Unexpected token
```

可能是接口返回了 HTML 错误页，而不是 JSON。

这时打开浏览器开发者工具，看 Network 里的 `/api/settings` 请求。

如果 `/api/settings` 返回 404：

检查：

1. 后端是否运行在 `http://127.0.0.1:8000`。
2. `frontend/vite.config.ts` 里 `/api` proxy 是否配置正确。
3. 修改 Vite 配置后是否重新启动过 `pnpm dev`。

注意：

```txt
修改 vite.config.ts 后，要重启 pnpm dev。
```

### 18.7 本轮验收标准

完成第 18 步后，应该满足：

1. 后端正在运行。
2. 前端正在运行。
3. 浏览器打开 `http://127.0.0.1:5173`。
4. 页面能显示从 `/api/settings` 返回的配置列表。
5. 浏览器 Network 里能看到 `/api/settings` 请求状态是 `200`。

你下一次要做：

1. 按第 18 步修改 `App.tsx` 和 `App.css`。
2. 同时启动后端和前端。
3. 打开页面检查配置列表。
4. 把页面截图或报错发给我。

### 18.8 验收结果

已完成：

- 页面能正常显示 `/api/settings` 返回的配置列表。
- 浏览器 Network 里能看到 `/api/settings` 请求状态是 `200`。
- 说明这条链路已经通了：

```txt
React
  -> Vite proxy
  -> FastAPI
  -> PostgreSQL
```

注意：

- 开发环境下 Network 里可能看到两次 `/api/settings`。
- 这是 React `StrictMode` 在开发环境中重复执行 effect，用来检查副作用是否安全。
- 当前是只读 GET 请求，所以重复一次不会破坏数据。

## 第 19 步：在前端调用 `PATCH /api/settings/{code}`，验证写操作

第 18 步验证的是读取数据：

```txt
GET /api/settings
```

第 19 步要验证修改数据：

```txt
PATCH /api/settings/{code}
```

这一轮仍然不是做正式页面。

本轮目标只是：

```txt
点击页面上的开关按钮
  -> 前端调用 updateSetting()
  -> Vite proxy 转发到 FastAPI
  -> FastAPI 修改 PostgreSQL
  -> 前端页面显示最新状态
```

为什么现在要做这一步：

- 第 18 步只证明前端能读后端数据。
- 面试任务里“应用配置”页面有开关，所以必须证明前端也能写后端数据。
- 读写都跑通后，再做正式页面会稳很多。

前端类比：

- `GET /api/settings` 像进入页面时拉列表。
- `PATCH /api/settings/{code}` 像点击开关后更新某一条配置。
- `settings.map(...)` 替换某一项，类似前端列表状态里的局部更新。

### 19.1 修改 `frontend/src/App.tsx`

打开：

```txt
frontend/src/App.tsx
```

把这一行：

```tsx
import { getSettings } from './api/settings'
```

改成：

```tsx
import { getSettings, updateSetting } from './api/settings'
```

然后在已有状态下面增加：

```tsx
const [updatingCode, setUpdatingCode] = useState<string | null>(null)
```

完整状态区域大概是：

```tsx
const [settings, setSettings] = useState<AppSetting[]>([])
const [loading, setLoading] = useState(true)
const [error, setError] = useState<string | null>(null)
const [updatingCode, setUpdatingCode] = useState<string | null>(null)
```

这里的 `updatingCode` 用来记录“当前哪一个配置正在提交更新”。

比如你点击了 `tts`，那：

```txt
updatingCode = "tts"
```

前端就可以只禁用 `tts` 这一项的按钮，避免用户连续点很多次。

前端类比：

```tsx
const [loadingId, setLoadingId] = useState<string | null>(null)
```

### 19.2 增加切换函数

在 `useEffect` 下面、`return` 上面增加：

```tsx
  const handleToggle = async (item: AppSetting) => {
    setUpdatingCode(item.code)
    setError(null)

    try {
      const updated = await updateSetting(item.code, {
        enabled: !item.enabled,
        config: item.config,
      })

      setSettings(currentSettings =>
        currentSettings.map(current =>
          current.code === updated.code ? updated : current,
        ),
      )
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : '更新失败')
    } finally {
      setUpdatingCode(null)
    }
  }
```

这段代码的流程是：

1. 记录当前正在更新哪一项。
2. 清掉旧错误。
3. 调用 `updateSetting(...)`。
4. 后端返回更新后的配置。
5. 用返回的新配置替换前端列表里的旧配置。
6. 不管成功失败，都清掉 `updatingCode`。

### 19.3 `async / await` 是什么

```tsx
const handleToggle = async (item: AppSetting) => {
```

`async` 表示这个函数里面可以使用 `await`。

```tsx
const updated = await updateSetting(...)
```

`await` 的意思是：

```txt
等 updateSetting 请求完成，再继续执行后面的代码。
```

前端类比你应该熟悉：

```tsx
fetch(...).then(...)
```

和：

```tsx
const data = await fetch(...)
```

本质都是处理异步请求。

这里用 `async / await` 是因为点击按钮的流程有成功、失败、最终收尾，用 `try / catch / finally` 更清楚。

### 19.4 为什么 payload 里要传 `config`

调用接口时写的是：

```tsx
const updated = await updateSetting(item.code, {
  enabled: !item.enabled,
  config: item.config,
})
```

`enabled: !item.enabled` 表示把当前开关状态反过来。

如果现在是：

```txt
enabled = true
```

点击后就传：

```txt
enabled = false
```

如果现在是：

```txt
enabled = false
```

点击后就传：

```txt
enabled = true
```

`config: item.config` 表示配置内容保持不变。

后端的 `PATCH` Schema 是：

```python
class AppSettingUpdate(BaseModel):
    enabled: bool | None = None
    config: dict[str, Any] | None = None
```

其实只传 `enabled` 也可以，因为后端只有在 `config is not None` 时才更新 config。

但是当前前端 API 函数定义是：

```ts
payload: Pick<AppSetting, "enabled" | "config">
```

所以现在先按类型要求同时传 `enabled` 和 `config`。

后面如果想更优雅，可以把类型改成：

```ts
Partial<Pick<AppSetting, "enabled" | "config">>
```

这样就允许只传：

```tsx
{ enabled: !item.enabled }
```

但这不是本轮重点，先不改。

### 19.5 为什么要用 `settings.map(...)`

更新成功后：

```tsx
setSettings(currentSettings =>
  currentSettings.map(current =>
    current.code === updated.code ? updated : current,
  ),
)
```

意思是：

```txt
遍历当前 settings 列表
如果这一项 code 等于后端返回的 updated.code，就替换成 updated
否则保持原来的 current
```

前端类比：

```tsx
const nextSettings = settings.map(item => {
  if (item.code === updated.code) {
    return updated
  }

  return item
})
```

为什么不直接重新请求 `getSettings()`？

两种方式都可以。

现在用局部替换，是因为：

- 后端已经返回了更新后的那条数据。
- 没必要为了一个开关再请求整个列表。
- 页面响应会更快。

但是正式业务里，如果列表数据很复杂，也可以选择更新成功后重新拉一遍列表，确保和后端完全一致。

### 19.6 修改按钮显示

在 `settings.map(...)` 里面，把原来的：

```tsx
<span className={item.enabled ? 'badge enabled' : 'badge disabled'}>
  {item.enabled ? '已开启' : '已关闭'}
</span>
```

改成：

```tsx
<button
  className={item.enabled ? 'toggle enabled' : 'toggle disabled'}
  disabled={updatingCode === item.code}
  onClick={() => handleToggle(item)}
>
  {updatingCode === item.code
    ? '更新中...'
    : item.enabled
      ? '已开启'
      : '已关闭'}
</button>
```

这里的：

```tsx
onClick={() => handleToggle(item)}
```

表示点击按钮时，把当前这一项配置传给 `handleToggle`。

不要写成：

```tsx
onClick={handleToggle(item)}
```

因为这样会在渲染时立刻执行函数，而不是点击时再执行。

前端类比：

```tsx
onClick={() => doSomething(id)}
```

这是 React 里给事件函数传参数的常见写法。

### 19.7 修改 `frontend/src/App.css`

把原来的 `.badge`、`.badge.enabled`、`.badge.disabled` 可以先保留。

在下面追加：

```css
.toggle {
  flex: 0 0 auto;
  border: 0;
  border-radius: 999px;
  padding: 6px 12px;
  font-size: 14px;
  cursor: pointer;
}

.toggle:disabled {
  cursor: not-allowed;
  opacity: 0.7;
}

.toggle.enabled {
  background: #dcfce7;
  color: #166534;
}

.toggle.disabled {
  background: #fee2e2;
  color: #991b1b;
}
```

### 19.8 验收方式

确认后端和前端都在运行。

浏览器打开：

```txt
http://127.0.0.1:5173
```

点击任意一个配置开关，比如：

```txt
文字转语音
```

预期结果：

1. 按钮短暂显示 `更新中...`。
2. 状态从 `已关闭` 变成 `已开启`，或者反过来。
3. 浏览器 Network 里能看到：

```txt
PATCH /api/settings/tts
```

4. 这个请求状态是 `200`。
5. 刷新页面后，开关状态仍然保持刚才更新后的结果。

刷新后还能保持，说明不是只改了前端状态，而是真的写进 PostgreSQL 了。

### 19.9 本轮验收标准

完成第 19 步后，应该满足：

1. 页面仍然能显示配置列表。
2. 点击开关会调用 `PATCH /api/settings/{code}`。
3. Network 里 PATCH 请求返回 `200`。
4. 刷新页面后，状态仍然是更新后的值。

你现在只做：

1. 修改 `frontend/src/App.tsx`。
2. 修改 `frontend/src/App.css`。
3. 点击一个开关测试。
4. 把页面截图和 Network 结果发给我。

### 19.10 验收结果

已完成：

- 页面仍然能显示配置列表。
- 点击开关后会调用 `PATCH /api/settings/{code}`。
- Network 里能看到 `PATCH /api/settings/greeting`，状态是 `200`。
- 页面状态能更新。

这说明前端已经打通了读写闭环：

```txt
GET /api/settings
  -> 从 PostgreSQL 读取配置

PATCH /api/settings/{code}
  -> 写入 PostgreSQL
```

到这里为止，临时联调页的使命完成了。

## 第 20 步：把临时联调页升级成正式「应用配置」页面第一版

这一页对应原型里的：

```txt
系统管理 / 应用配置
```

第 18、19 步只是临时联调页，页面标题还是：

```txt
前后端联调
```

第 20 步开始把它整理成正式页面。

但本轮仍然只做一个页面：

```txt
应用配置页
```

先不要做：

- 智能问数首页。
- 回复校对页。
- 路由系统。
- 复杂弹窗配置。

原因：

- 你已经验证了 `GET` 和 `PATCH`。
- 应用配置页正好只依赖 `getSettings()` 和 `updateSetting()`。
- 先把一个页面做完整，后面再按同样方式做另外两个页面。

### 20.1 安装图标库

正式页面需要图标。

我们不手写 SVG，使用常见的 React 图标库：

```bash
cd ~/Desktop/full-stack-demo/frontend
pnpm add lucide-react
```

为什么用 `lucide-react`：

- 它是 React 图标组件库。
- 用法简单，直接 `import { Bot } from "lucide-react"`。
- 图标可以像普通 React 组件一样传 `size`、`strokeWidth`。
- 比手写 SVG 更利于维护。

前端类比：

```tsx
import { Bot } from "lucide-react"

<Bot size={20} />
```

就像你使用一个普通组件。

安装后，`package.json` 和 `pnpm-lock.yaml` 会变化，这是正常的。

### 20.2 替换 `frontend/src/App.tsx`

打开：

```txt
frontend/src/App.tsx
```

替换为：

```tsx
import { useEffect, useMemo, useState } from 'react'
import {
  Bot,
  Flame,
  ListChecks,
  MessageCircle,
  Mic,
  Settings,
  Volume2,
} from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import { getSettings, updateSetting } from './api/settings'
import type { AppSetting } from './api/types'
import './App.css'

type SettingMeta = {
  Icon: LucideIcon
  tone: 'blue' | 'yellow' | 'green' | 'purple' | 'indigo' | 'orange'
  configurable: boolean
}

const settingMetaMap: Record<string, SettingMeta> = {
  greeting: {
    Icon: MessageCircle,
    tone: 'blue',
    configurable: true,
  },
  suggestions: {
    Icon: ListChecks,
    tone: 'yellow',
    configurable: false,
  },
  tts: {
    Icon: Volume2,
    tone: 'green',
    configurable: false,
  },
  stt: {
    Icon: Mic,
    tone: 'purple',
    configurable: false,
  },
  model_config: {
    Icon: Bot,
    tone: 'indigo',
    configurable: true,
  },
  hot_recommend: {
    Icon: Flame,
    tone: 'orange',
    configurable: true,
  },
}

function App() {
  const [settings, setSettings] = useState<AppSetting[]>([])
  const [updatingCode, setUpdatingCode] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    getSettings()
      .then(data => {
        setSettings(data)
      })
      .catch((err: unknown) => {
        setError(err instanceof Error ? err.message : '请求失败')
      })
      .finally(() => {
        setLoading(false)
      })
  }, [])

  const enabledCount = useMemo(() => {
    return settings.filter(item => item.enabled).length
  }, [settings])

  const handleToggle = async (item: AppSetting) => {
    setUpdatingCode(item.code)
    setError(null)

    try {
      const updated = await updateSetting(item.code, {
        enabled: !item.enabled,
        config: item.config,
      })

      setSettings(currentSettings =>
        currentSettings.map(current => (current.code === updated.code ? updated : current)),
      )
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : '更新失败')
    } finally {
      setUpdatingCode(null)
    }
  }

  return (
    <main className="app-page">
      <div className="page-shell">
        <nav className="breadcrumb" aria-label="面包屑">
          <span>系统管理</span>
          <span>/</span>
          <strong>应用配置</strong>
        </nav>

        <header className="page-header">
          <div>
            <h1>应用配置</h1>
            <p>管理智能问数相关能力开关。</p>
          </div>
          <div className="summary">
            <span>{enabledCount}</span>
            <small>已开启</small>
          </div>
        </header>

        {loading && <p className="state-text">加载中...</p>}
        {error && <p className="state-text error">{error}</p>}

        {!loading && !error && (
          <section className="settings-grid" aria-label="应用配置列表">
            {settings.map(item => {
              const meta = settingMetaMap[item.code] ?? {
                Icon: Settings,
                tone: 'blue' as const,
                configurable: false,
              }
              const { Icon } = meta

              return (
                <article className="setting-card" key={item.code}>
                  <div className={`setting-icon ${meta.tone}`} aria-hidden="true">
                    <Icon size={22} strokeWidth={2.2} />
                  </div>

                  <div className="setting-content">
                    <div className="setting-title-row">
                      <h2>{item.name}</h2>
                      <div className="setting-actions">
                        {meta.configurable && (
                          <button
                            className="icon-button"
                            type="button"
                            aria-label={`${item.name}配置`}
                          >
                            <Settings size={18} strokeWidth={2.2} />
                          </button>
                        )}
                        <button
                          className={item.enabled ? 'switch is-on' : 'switch'}
                          type="button"
                          role="switch"
                          aria-checked={item.enabled}
                          disabled={updatingCode === item.code}
                          onClick={() => handleToggle(item)}
                        >
                          <span />
                        </button>
                      </div>
                    </div>
                    <p>{item.description}</p>
                  </div>
                </article>
              )
            })}
          </section>
        )}
      </div>
    </main>
  )
}

export default App
```

### 20.3 这段 TSX 里新东西解释

#### `LucideIcon` 是什么

```tsx
import type { LucideIcon } from 'lucide-react'
```

`LucideIcon` 是图标组件的类型。

因为我们要把图标组件放进配置对象：

```tsx
const settingMetaMap = {
  greeting: {
    Icon: MessageCircle,
  },
}
```

这里的 `Icon` 本质上是一个 React 组件。

所以类型里写：

```tsx
Icon: LucideIcon
```

意思是：

```txt
Icon 这个字段必须是 lucide-react 图标组件。
```

#### `settingMetaMap` 为什么放在前端

后端返回的是业务数据：

```txt
code
name
description
enabled
config
```

但图标颜色、是否显示齿轮按钮，属于前端展示逻辑。

所以我们在前端写：

```tsx
const settingMetaMap = {
  greeting: {
    Icon: MessageCircle,
    tone: 'blue',
    configurable: true,
  },
}
```

不要把这些 UI 展示细节放进数据库。

前端类比：

```tsx
const statusMap = {
  pending: { label: '待处理', color: 'orange' },
  resolved: { label: '已处理', color: 'green' },
}
```

#### `useMemo` 是什么

```tsx
const enabledCount = useMemo(() => {
  return settings.filter(item => item.enabled).length
}, [settings])
```

`enabledCount` 表示当前开启了多少个配置。

不用 `useMemo` 也可以直接写：

```tsx
const enabledCount = settings.filter(item => item.enabled).length
```

这里写 `useMemo` 是为了演示一种常见写法：

```txt
当 settings 没变时，不重复计算 enabledCount。
```

这个列表很小，性能差异不重要。

你可以先理解成：

```txt
根据 settings 派生出来的一个值。
```

#### `role="switch"` 和 `aria-checked`

```tsx
<button
  role="switch"
  aria-checked={item.enabled}
>
```

这是无障碍语义。

因为这个按钮不是普通按钮，而是一个开关。

`role="switch"` 告诉浏览器和辅助工具：

```txt
这是一个开关控件。
```

`aria-checked={item.enabled}` 告诉它当前是开还是关。

正式项目里，这种细节能体现前端专业度。

#### 为什么齿轮按钮现在没有点击事件

```tsx
<button className="icon-button" type="button" aria-label={`${item.name}配置`}>
```

这一轮只做开关。

齿轮按钮先显示出来，匹配原型视觉。

后面如果要做配置弹窗，再给它加 `onClick`。

不要在这一轮把弹窗也做了，否则步骤太大。

### 20.4 替换 `frontend/src/App.css`

打开：

```txt
frontend/src/App.css
```

替换为：

```css
.app-page {
  min-height: 100vh;
  background: #f4f6fa;
  color: #172033;
  padding: 28px;
  box-sizing: border-box;
}

.page-shell {
  width: 100%;
}

.breadcrumb {
  display: flex;
  align-items: center;
  gap: 8px;
  color: #8a94a6;
  font-size: 15px;
  margin-bottom: 22px;
}

.breadcrumb strong {
  color: #475467;
}

.page-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 22px;
}

.page-header h1 {
  margin: 0;
  color: #111827;
  font-size: 24px;
}

.page-header p {
  margin: 6px 0 0;
  color: #667085;
}

.summary {
  min-width: 96px;
  border: 1px solid #dbe3ef;
  border-radius: 8px;
  background: #fff;
  padding: 10px 14px;
  text-align: center;
}

.summary span {
  display: block;
  color: #2563eb;
  font-size: 22px;
  font-weight: 700;
  line-height: 1;
}

.summary small {
  color: #667085;
  font-size: 13px;
}

.settings-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 16px;
}

.setting-card {
  display: grid;
  grid-template-columns: 40px minmax(0, 1fr);
  gap: 12px;
  min-height: 104px;
  border: 1px solid #dbe3ef;
  border-radius: 8px;
  background: #fff;
  padding: 16px 18px;
  box-sizing: border-box;
}

.setting-icon {
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 8px;
}

.setting-icon.blue {
  background: #e8f0ff;
  color: #2563eb;
}

.setting-icon.yellow {
  background: #fff3cf;
  color: #d97706;
}

.setting-icon.green {
  background: #dcfce7;
  color: #16a34a;
}

.setting-icon.purple {
  background: #f3e8ff;
  color: #9333ea;
}

.setting-icon.indigo {
  background: #e0e7ff;
  color: #4f46e5;
}

.setting-icon.orange {
  background: #ffedd5;
  color: #ea580c;
}

.setting-content {
  min-width: 0;
}

.setting-title-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  margin-bottom: 12px;
}

.setting-title-row h2 {
  margin: 0;
  color: #111827;
  font-size: 17px;
}

.setting-content p {
  margin: 0;
  color: #98a2b3;
  font-size: 15px;
  line-height: 1.6;
}

.setting-actions {
  display: flex;
  align-items: center;
  gap: 10px;
}

.icon-button {
  width: 28px;
  height: 28px;
  border: 0;
  border-radius: 6px;
  background: transparent;
  color: #98a2b3;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
}

.icon-button:hover {
  background: #f2f4f7;
  color: #667085;
}

.switch {
  width: 38px;
  height: 22px;
  border: 0;
  border-radius: 999px;
  background: #d8dde6;
  padding: 2px;
  cursor: pointer;
  transition: background 0.16s ease;
}

.switch span {
  display: block;
  width: 18px;
  height: 18px;
  border-radius: 999px;
  background: #fff;
  transform: translateX(0);
  transition: transform 0.16s ease;
  box-shadow: 0 1px 2px rgb(16 24 40 / 18%);
}

.switch.is-on {
  background: #3152f4;
}

.switch.is-on span {
  transform: translateX(16px);
}

.switch:disabled {
  cursor: not-allowed;
  opacity: 0.7;
}

.state-text {
  color: #667085;
}

.state-text.error {
  color: #b42318;
}

@media (max-width: 1080px) {
  .settings-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

@media (max-width: 720px) {
  .app-page {
    padding: 18px;
  }

  .page-header {
    align-items: flex-start;
    flex-direction: column;
    gap: 12px;
  }

  .settings-grid {
    grid-template-columns: 1fr;
  }
}
```

### 20.5 验收方式

执行：

```bash
cd ~/Desktop/full-stack-demo/frontend
pnpm build
```

如果 build 通过，再打开：

```txt
http://127.0.0.1:5173
```

检查：

1. 页面标题变成 `应用配置`。
2. 顶部有 `系统管理 / 应用配置`。
3. 配置项变成 3 列卡片布局。
4. 每个卡片有图标、标题、描述、开关。
5. 点击开关仍然能触发 `PATCH /api/settings/{code}`。
6. Network 里 PATCH 请求返回 `200`。

### 20.6 本轮验收标准

完成第 20 步后，应该满足：

1. `pnpm build` 通过。
2. 页面视觉接近原型里的「系统管理 / 应用配置」。
3. 开关功能仍然能更新数据库。

你现在只做：

1. 执行 `pnpm add lucide-react`。
2. 替换 `frontend/src/App.tsx`。
3. 替换 `frontend/src/App.css`。
4. 执行 `pnpm build`。
5. 打开页面测试一个开关。
6. 把页面截图和构建结果发给我。

### 20.7 验收结果

已完成：

- `lucide-react` 已安装。
- 页面已经变成正式「系统管理 / 应用配置」样式。
- `pnpm build` 通过。
- 开关仍然能调用 `PATCH /api/settings/{code}`。

当前 `App.tsx` 里还放着完整应用配置页代码。

这在只有一个页面时没问题，但后面还要做：

- 智能问数页。
- 回复校对页。

所以下一步要先整理前端结构。

## 第 21 步：接入 React Router，并把应用配置页拆成独立页面组件

这一轮不新增业务功能。

目标是整理前端结构：

```txt
App.tsx
  -> 只负责路由入口

pages/AppConfigPage.tsx
  -> 放应用配置页代码
```

为什么要做这一步：

- 后面有 3 个页面，不能一直把所有页面都写在 `App.tsx`。
- `App.tsx` 应该像项目入口，负责路由和整体框架。
- 每个页面应该放到 `pages/` 里，方便后面维护。

前端类比：

```txt
App.tsx 像 routes.tsx
pages/AppConfigPage.tsx 像一个真正的页面组件
```

这一轮只接一个路由：

```txt
/settings
```

先不要做：

- `/feedbacks`
- `/chat`
- 侧边栏导航
- 正式菜单系统

### 21.1 安装 React Router

在前端目录执行：

```bash
cd ~/Desktop/full-stack-demo/frontend
pnpm add react-router-dom
```

为什么需要它：

- 现在只有一个页面，直接渲染 `App` 可以。
- 后面有多个页面，需要根据 URL 显示不同页面。
- `react-router-dom` 是 React 项目里常见的路由库。

安装后，`package.json` 和 `pnpm-lock.yaml` 会变化，这是正常的。

### 21.2 创建页面目录

创建目录：

```txt
frontend/src/pages
```

然后创建文件：

```txt
frontend/src/pages/AppConfigPage.tsx
```

### 21.3 把应用配置页代码移到 `AppConfigPage.tsx`

把当前 `frontend/src/App.tsx` 里的页面代码移动到：

```txt
frontend/src/pages/AppConfigPage.tsx
```

注意导入路径要改。

原来在 `App.tsx` 里：

```tsx
import { getSettings, updateSetting } from './api/settings'
import type { AppSetting } from './api/types'
```

移动到 `pages/AppConfigPage.tsx` 后，要改成：

```tsx
import { getSettings, updateSetting } from '../api/settings'
import type { AppSetting } from '../api/types'
```

因为 `AppConfigPage.tsx` 比 `App.tsx` 多了一层目录。

前端类比：

```txt
./api/settings
```

表示当前文件同级目录下找 `api/settings`。

```txt
../api/settings
```

表示先回到上一层，再找 `api/settings`。

`frontend/src/pages/AppConfigPage.tsx` 完整代码：

```tsx
import { useEffect, useMemo, useState } from 'react'
import {
  Bot,
  Flame,
  ListChecks,
  MessageCircle,
  Mic,
  Settings,
  Volume2,
} from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import { getSettings, updateSetting } from '../api/settings'
import type { AppSetting } from '../api/types'

type SettingMeta = {
  Icon: LucideIcon
  tone: 'blue' | 'yellow' | 'green' | 'purple' | 'indigo' | 'orange'
  configurable: boolean
}

const settingMetaMap: Record<string, SettingMeta> = {
  greeting: {
    Icon: MessageCircle,
    tone: 'blue',
    configurable: true,
  },
  suggestions: {
    Icon: ListChecks,
    tone: 'yellow',
    configurable: false,
  },
  tts: {
    Icon: Volume2,
    tone: 'green',
    configurable: false,
  },
  stt: {
    Icon: Mic,
    tone: 'purple',
    configurable: false,
  },
  model_config: {
    Icon: Bot,
    tone: 'indigo',
    configurable: true,
  },
  hot_recommend: {
    Icon: Flame,
    tone: 'orange',
    configurable: true,
  },
}

export function AppConfigPage() {
  const [settings, setSettings] = useState<AppSetting[]>([])
  const [updatingCode, setUpdatingCode] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    getSettings()
      .then(data => {
        setSettings(data)
      })
      .catch((err: unknown) => {
        setError(err instanceof Error ? err.message : '请求失败')
      })
      .finally(() => {
        setLoading(false)
      })
  }, [])

  const enabledCount = useMemo(() => {
    return settings.filter(item => item.enabled).length
  }, [settings])

  const handleToggle = async (item: AppSetting) => {
    setUpdatingCode(item.code)
    setError(null)

    try {
      const updated = await updateSetting(item.code, {
        enabled: !item.enabled,
        config: item.config,
      })

      setSettings(currentSettings =>
        currentSettings.map(current => (current.code === updated.code ? updated : current)),
      )
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : '更新失败')
    } finally {
      setUpdatingCode(null)
    }
  }

  return (
    <main className="app-page">
      <div className="page-shell">
        <nav className="breadcrumb" aria-label="面包屑">
          <span>系统管理</span>
          <span>/</span>
          <strong>应用配置</strong>
        </nav>

        <header className="page-header">
          <div>
            <h1>应用配置</h1>
            <p>管理智能问数相关能力开关。</p>
          </div>
          <div className="summary">
            <span>{enabledCount}</span>
            <small>已开启</small>
          </div>
        </header>

        {loading && <p className="state-text">加载中...</p>}
        {error && <p className="state-text error">{error}</p>}

        {!loading && !error && (
          <section className="settings-grid" aria-label="应用配置列表">
            {settings.map(item => {
              const meta = settingMetaMap[item.code] ?? {
                Icon: Settings,
                tone: 'blue' as const,
                configurable: false,
              }
              const { Icon } = meta

              return (
                <article className="setting-card" key={item.code}>
                  <div className={`setting-icon ${meta.tone}`} aria-hidden="true">
                    <Icon size={22} strokeWidth={2.2} />
                  </div>

                  <div className="setting-content">
                    <div className="setting-title-row">
                      <h2>{item.name}</h2>
                      <div className="setting-actions">
                        {meta.configurable && (
                          <button
                            className="icon-button"
                            type="button"
                            aria-label={`${item.name}配置`}
                          >
                            <Settings size={18} strokeWidth={2.2} />
                          </button>
                        )}
                        <button
                          className={item.enabled ? 'switch is-on' : 'switch'}
                          type="button"
                          role="switch"
                          aria-checked={item.enabled}
                          disabled={updatingCode === item.code}
                          onClick={() => handleToggle(item)}
                        >
                          <span />
                        </button>
                      </div>
                    </div>
                    <p>{item.description}</p>
                  </div>
                </article>
              )
            })}
          </section>
        )}
      </div>
    </main>
  )
}
```

### 21.4 替换 `frontend/src/App.tsx`

把 `frontend/src/App.tsx` 改成路由入口：

```tsx
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import './App.css'
import { AppConfigPage } from './pages/AppConfigPage'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/settings" replace />} />
        <Route path="/settings" element={<AppConfigPage />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
```

这里几个点要理解：

```tsx
<BrowserRouter>
```

表示启用浏览器路由。

```tsx
<Routes>
```

表示一组路由规则。

```tsx
<Route path="/settings" element={<AppConfigPage />} />
```

表示访问：

```txt
/settings
```

时渲染：

```tsx
<AppConfigPage />
```

```tsx
<Route path="/" element={<Navigate to="/settings" replace />} />
```

表示访问首页 `/` 时，自动跳转到 `/settings`。

`replace` 的意思是：

```txt
不要在浏览器历史记录里额外留下一条 /。
```

这样用户按返回键时不会在 `/` 和 `/settings` 之间来回跳。

### 21.5 本轮不改 `App.css`

这一轮不需要改 CSS。

因为应用配置页的 DOM 结构和 className 没变，只是从 `App.tsx` 移到了 `pages/AppConfigPage.tsx`。

`App.tsx` 仍然导入：

```tsx
import './App.css'
```

所以样式仍然生效。

### 21.6 验收方式

执行：

```bash
cd ~/Desktop/full-stack-demo/frontend
pnpm build
```

如果 build 通过，打开：

```txt
http://127.0.0.1:5173
```

你应该会被自动跳转到：

```txt
http://127.0.0.1:5173/settings
```

页面视觉应该和第 20 步完全一样。

再测试一个开关：

- Network 里仍然应该出现 `PATCH /api/settings/{code}`。
- 请求状态仍然应该是 `200`。

### 21.7 本轮验收标准

完成第 21 步后，应该满足：

1. `pnpm build` 通过。
2. 访问 `/` 会跳转到 `/settings`。
3. `/settings` 页面仍然显示应用配置。
4. 开关功能仍然可用。

你现在只做：

1. 执行 `pnpm add react-router-dom`。
2. 创建 `frontend/src/pages/AppConfigPage.tsx`。
3. 把应用配置页代码移进去。
4. 替换 `frontend/src/App.tsx`。
5. 执行 `pnpm build`。
6. 打开 `/settings` 验证页面和开关。
7. 把结果发给我。

### 21.8 验收结果

已完成：

- `react-router-dom` 已安装。
- `frontend/src/pages/AppConfigPage.tsx` 已创建。
- `frontend/src/App.tsx` 已变成路由入口。
- 访问 `/settings` 可以正常显示应用配置页。
- 页面视觉和第 20 步保持一致。

当前前端结构已经从：

```txt
App.tsx 直接写页面
```

变成：

```txt
App.tsx
  -> 路由入口

pages/AppConfigPage.tsx
  -> 应用配置页
```

下一步可以开始为第二个页面「回复校对」准备前端 API。

## 第 22 步：创建回复校对前端 API 层

这一轮先不画页面。

只创建：

```txt
frontend/src/api/feedbacks.ts
```

并补充 `frontend/src/api/types.ts` 里的反馈相关类型。

为什么先做 API 层：

- 后端已经有 `/api/feedbacks`。
- 回复校对页面需要列表、筛选、分页、详情、处理反馈。
- 如果页面组件里直接写 `fetch`，后面会很乱。
- 先把 API 函数封装好，页面只调用函数，不关心 URL 怎么拼。

前端类比：

```txt
pages/FeedbackReviewPage.tsx
  -> 负责渲染页面

api/feedbacks.ts
  -> 负责请求后端
```

这和我们之前做 `settings.ts` 是一样的。

### 22.1 修改 `frontend/src/api/types.ts`

打开：

```txt
frontend/src/api/types.ts
```

在现有 `Feedback` 类型下面追加：

```ts
export type FeedbackStatus = 'pending' | 'resolved'

export type FeedbackListResponse = {
  total: number
  page: number
  page_size: number
  items: Feedback[]
}

export type FeedbackQuery = {
  question?: string
  user?: string
  status?: FeedbackStatus
  page?: number
  page_size?: number
}

export type FeedbackCreatePayload = {
  user_name: string
  question: string
  ai_answer: string
  message_id: number | null
}

export type FeedbackUpdatePayload = {
  status?: FeedbackStatus
  remark?: string
}
```

### 22.2 类型解释

#### `FeedbackStatus`

```ts
export type FeedbackStatus = 'pending' | 'resolved'
```

表示反馈状态只能是这两个值之一：

```txt
pending  待处理
resolved 已处理
```

为什么不直接写 `string`？

因为写成联合类型后，TypeScript 会帮你防止拼错。

例如下面这种会报错：

```ts
const status: FeedbackStatus = 'resolve'
```

因为正确值是：

```txt
resolved
```

#### `FeedbackListResponse`

后端 `GET /api/feedbacks` 返回的不是单纯数组，而是：

```json
{
  "total": 6,
  "page": 1,
  "page_size": 10,
  "items": []
}
```

所以前端类型要写成：

```ts
export type FeedbackListResponse = {
  total: number
  page: number
  page_size: number
  items: Feedback[]
}
```

这和应用配置不同。

应用配置接口：

```txt
GET /api/settings
```

直接返回数组：

```ts
AppSetting[]
```

反馈列表接口：

```txt
GET /api/feedbacks
```

返回分页对象：

```ts
FeedbackListResponse
```

#### `FeedbackQuery`

```ts
export type FeedbackQuery = {
  question?: string
  user?: string
  status?: FeedbackStatus
  page?: number
  page_size?: number
}
```

这里每个字段后面都有 `?`。

意思是：

```txt
这些查询条件都是可选的。
```

你可以只传：

```ts
{ page: 1, page_size: 10 }
```

也可以传：

```ts
{ question: '北京', status: 'pending', page: 1, page_size: 10 }
```

#### `FeedbackCreatePayload`

这个类型对应：

```txt
POST /api/feedbacks
```

当前回复校对页暂时不创建反馈，但后面智能问数页里可能会用到：

```txt
用户标记 AI 回答有误
  -> 创建一条反馈
```

所以 API 层先补上。

#### `FeedbackUpdatePayload`

这个类型对应：

```txt
PATCH /api/feedbacks/{feedback_id}
```

页面点击「处理」时，会传：

```ts
{
  status: 'resolved',
  remark: '已核对，数据口径已修正'
}
```

### 22.3 创建 `frontend/src/api/feedbacks.ts`

创建文件：

```txt
frontend/src/api/feedbacks.ts
```

写入：

```ts
import { http } from './http'
import type {
  Feedback,
  FeedbackCreatePayload,
  FeedbackListResponse,
  FeedbackQuery,
  FeedbackUpdatePayload,
} from './types'

const buildFeedbackQuery = (query: FeedbackQuery = {}) => {
  const searchParams = new URLSearchParams()

  if (query.question) {
    searchParams.set('question', query.question)
  }

  if (query.user) {
    searchParams.set('user', query.user)
  }

  if (query.status) {
    searchParams.set('status', query.status)
  }

  if (query.page) {
    searchParams.set('page', String(query.page))
  }

  if (query.page_size) {
    searchParams.set('page_size', String(query.page_size))
  }

  const queryString = searchParams.toString()

  return queryString ? `?${queryString}` : ''
}

export const getFeedbacks = (query: FeedbackQuery = {}) => {
  return http.get<FeedbackListResponse>(`/api/feedbacks${buildFeedbackQuery(query)}`)
}

export const getFeedback = (feedbackId: number) => {
  return http.get<Feedback>(`/api/feedbacks/${feedbackId}`)
}

export const createFeedback = (payload: FeedbackCreatePayload) => {
  return http.post<Feedback>('/api/feedbacks', payload)
}

export const updateFeedback = (feedbackId: number, payload: FeedbackUpdatePayload) => {
  return http.patch<Feedback>(`/api/feedbacks/${feedbackId}`, payload)
}
```

### 22.4 `URLSearchParams` 是什么

```ts
const searchParams = new URLSearchParams()
```

`URLSearchParams` 是浏览器内置 API，用来拼查询参数。

比如你写：

```ts
searchParams.set('question', '北京')
searchParams.set('page', '1')
```

最后：

```ts
searchParams.toString()
```

会得到：

```txt
question=%E5%8C%97%E4%BA%AC&page=1
```

也就是 URL 编码后的查询字符串。

为什么不用字符串拼接？

不要写成：

```ts
`?question=${query.question}&page=${query.page}`
```

因为中文、空格、特殊字符都需要编码。

`URLSearchParams` 会自动帮你处理。

前端类比：

```ts
new URLSearchParams({ question: '北京' }).toString()
```

就是更安全的 query string 生成方式。

### 22.5 为什么 `page` 要转成字符串

```ts
searchParams.set('page', String(query.page))
```

`URLSearchParams.set()` 的第二个参数必须是字符串。

但我们的 `page` 类型是数字：

```ts
page?: number
```

所以要用：

```ts
String(query.page)
```

把数字转成字符串。

前端类比：

```ts
String(1) // "1"
```

### 22.6 为什么返回值可能是空字符串

```ts
return queryString ? `?${queryString}` : ''
```

如果没有任何查询条件：

```ts
getFeedbacks()
```

那请求地址应该是：

```txt
/api/feedbacks
```

而不是：

```txt
/api/feedbacks?
```

虽然多一个 `?` 通常也能工作，但写干净一点更好。

如果有查询条件：

```ts
getFeedbacks({ status: 'pending', page: 1 })
```

请求地址就是：

```txt
/api/feedbacks?status=pending&page=1
```

### 22.7 本轮验收方式

执行：

```bash
cd ~/Desktop/full-stack-demo/frontend
pnpm build
```

如果 build 通过，说明类型和语法没问题。

这一轮没有页面变化，所以不用截图页面。

### 22.8 本轮验收标准

完成第 22 步后，应该满足：

1. 新增 `frontend/src/api/feedbacks.ts`。
2. `frontend/src/api/types.ts` 新增反馈列表、查询、创建、更新类型。
3. `pnpm build` 通过。

你现在只做：

1. 修改 `frontend/src/api/types.ts`。
2. 创建 `frontend/src/api/feedbacks.ts`。
3. 执行 `pnpm build`。
4. 把构建结果发给我。

### 22.9 验收结果

已完成：

- `frontend/src/api/types.ts` 已补充反馈相关类型。
- 反馈 API 文件已创建。
- `pnpm build` 通过。

注意：

计划里原本写的是：

```txt
frontend/src/api/feedbacks.ts
```

你实际创建的是：

```txt
frontend/src/api/feedback.ts
```

这不是功能错误。

我们后续就按当前实际文件名继续：

```ts
import { getFeedbacks } from '../api/feedback'
```

原因：

- 文件名只是模块命名。
- 只要导入路径和实际文件一致，代码就能正常工作。
- 现在没必要为了一个 `s` 来回改名，先保持当前项目状态继续推进。

## 第 23 步：创建「回复校对」页面第一版，只展示反馈列表

这一页对应原型里的：

```txt
反馈管理 / 回复校对
```

本轮只做第一版：

```txt
读取反馈列表
  -> 显示表格
```

先不要做：

- 搜索问题。
- 搜索用户。
- 状态筛选。
- 分页切换。
- 点击处理按钮。
- 处理弹窗。

原因：

- 我们刚创建了反馈 API 层。
- 下一步应该先验证页面能调用 `getFeedbacks()`。
- 列表能显示后，再逐步加筛选、分页和处理操作。

前端类比：

```txt
第 22 步：写 api/feedback.ts
第 23 步：写 pages/FeedbackReviewPage.tsx 调用它
```

### 23.1 创建页面文件

创建文件：

```txt
frontend/src/pages/FeedbackReviewPage.tsx
```

写入：

```tsx
import { useEffect, useState } from 'react'
import { getFeedbacks } from '../api/feedback'
import type { Feedback, FeedbackListResponse } from '../api/types'

const formatStatus = (status: Feedback['status']) => {
  if (status === 'resolved') {
    return '已处理'
  }

  return '待处理'
}

const formatDateTime = (value: string) => {
  return new Date(value).toLocaleString('zh-CN', {
    hour12: false,
  })
}

function FeedbackReviewPage() {
  const [feedbacks, setFeedbacks] = useState<Feedback[]>([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    getFeedbacks({
      page: 1,
      page_size: 10,
    })
      .then((data: FeedbackListResponse) => {
        setFeedbacks(data.items)
        setTotal(data.total)
      })
      .catch((err: unknown) => {
        setError(err instanceof Error ? err.message : '请求失败')
      })
      .finally(() => {
        setLoading(false)
      })
  }, [])

  return (
    <main className="app-page">
      <div className="page-shell">
        <nav className="breadcrumb" aria-label="面包屑">
          <span>反馈管理</span>
          <span>/</span>
          <strong>回复校对</strong>
        </nav>

        <header className="page-header">
          <div>
            <h1>回复校对</h1>
            <p>查看用户标记为 AI 回复有误的信息数据。</p>
          </div>
          <div className="summary">
            <span>{total}</span>
            <small>共计</small>
          </div>
        </header>

        {loading && <p className="state-text">加载中...</p>}
        {error && <p className="state-text error">{error}</p>}

        {!loading && !error && (
          <section className="table-card" aria-label="回复校对列表">
            <div className="table-toolbar">
              <strong>反馈列表</strong>
              <span>共 {total} 条</span>
            </div>

            <div className="table-wrap">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>序号</th>
                    <th>用户</th>
                    <th>问题</th>
                    <th>反馈时间</th>
                    <th>状态</th>
                  </tr>
                </thead>
                <tbody>
                  {feedbacks.map((item, index) => (
                    <tr key={item.id}>
                      <td>{index + 1}</td>
                      <td>{item.user_name}</td>
                      <td>{item.question}</td>
                      <td>{formatDateTime(item.created_at)}</td>
                      <td>
                        <span className={item.status === 'resolved' ? 'status-tag resolved' : 'status-tag pending'}>
                          {formatStatus(item.status)}
                        </span>
                      </td>
                    </tr>
                  ))}

                  {feedbacks.length === 0 && (
                    <tr>
                      <td className="empty-cell" colSpan={5}>
                        暂无反馈数据
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </section>
        )}
      </div>
    </main>
  )
}

export default FeedbackReviewPage
```

### 23.2 这段代码在做什么

页面加载时：

```tsx
useEffect(() => {
  getFeedbacks({
    page: 1,
    page_size: 10,
  })
  ...
}, [])
```

它会调用：

```txt
GET /api/feedbacks?page=1&page_size=10
```

后端返回：

```ts
{
  total: number
  page: number
  page_size: number
  items: Feedback[]
}
```

我们把：

```tsx
data.items
```

放进：

```tsx
feedbacks
```

把：

```tsx
data.total
```

放进：

```tsx
total
```

### 23.3 为什么要有 `formatStatus`

后端返回的状态是英文：

```txt
pending
resolved
```

页面要显示中文：

```txt
待处理
已处理
```

所以写一个转换函数：

```tsx
const formatStatus = (status: Feedback['status']) => {
  if (status === 'resolved') {
    return '已处理'
  }

  return '待处理'
}
```

这里的：

```tsx
Feedback['status']
```

表示取 `Feedback` 类型里的 `status` 字段类型。

前端类比：

```ts
type Status = Feedback['status']
```

这样如果以后 `Feedback.status` 类型改了，这里也能跟着变。

### 23.4 为什么要有 `formatDateTime`

后端返回的时间通常是 ISO 字符串：

```txt
2026-06-29T07:44:15.313295Z
```

页面上直接显示不好看。

所以用：

```tsx
new Date(value).toLocaleString('zh-CN', {
  hour12: false,
})
```

把它转成中文地区更容易读的时间格式。

`hour12: false` 表示使用 24 小时制。

### 23.5 为什么第一版不做筛选和分页

原型里有：

- 搜索问题。
- 搜索用户。
- 状态下拉。
- 分页。
- 处理按钮。

这些都要做，但不要一次塞进去。

本轮只验证：

```txt
页面能不能调用 getFeedbacks()
表格能不能显示数据
```

下一轮再加筛选。

### 23.6 修改路由

打开：

```txt
frontend/src/App.tsx
```

增加导入：

```tsx
import FeedbackReviewPage from './pages/FeedbackReviewPage'
```

然后在 `Routes` 里增加：

```tsx
<Route path="/feedbacks" element={<FeedbackReviewPage />} />
```

完整结构类似：

```tsx
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import AppConfigPage from './pages/AppConfigPage'
import FeedbackReviewPage from './pages/FeedbackReviewPage'
import './App.css'

const APP = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/settings" replace />} />
        <Route path="/settings" element={<AppConfigPage />} />
        <Route path="/feedbacks" element={<FeedbackReviewPage />} />
      </Routes>
    </BrowserRouter>
  )
}

export default APP
```

### 23.7 追加样式

打开：

```txt
frontend/src/App.css
```

在文件底部追加：

```css
.table-card {
  border: 1px solid #dbe3ef;
  border-radius: 8px;
  background: #fff;
  overflow: hidden;
}

.table-toolbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  border-bottom: 1px solid #e4e9f2;
  padding: 14px 18px;
  color: #667085;
}

.table-toolbar strong {
  color: #111827;
}

.table-wrap {
  overflow-x: auto;
}

.data-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 15px;
}

.data-table th {
  background: #f4f6fa;
  color: #475467;
  font-weight: 600;
  text-align: left;
  padding: 14px 16px;
  border-bottom: 1px solid #e4e9f2;
  white-space: nowrap;
}

.data-table td {
  color: #344054;
  padding: 14px 16px;
  border-bottom: 1px solid #eef2f7;
  white-space: nowrap;
}

.data-table tbody tr:hover {
  background: #f8faff;
}

.status-tag {
  display: inline-flex;
  align-items: center;
  border-radius: 6px;
  padding: 3px 8px;
  font-size: 14px;
}

.status-tag.pending {
  background: #fff7e6;
  color: #d97706;
}

.status-tag.resolved {
  background: #dcfce7;
  color: #166534;
}

.empty-cell {
  color: #98a2b3;
  text-align: center;
}
```

### 23.8 验收方式

执行：

```bash
cd ~/Desktop/full-stack-demo/frontend
pnpm build
```

如果 build 通过，打开：

```txt
http://127.0.0.1:5173/feedbacks
```

检查：

1. 页面标题是 `回复校对`。
2. 顶部有 `反馈管理 / 回复校对`。
3. 页面显示反馈表格。
4. Network 里能看到：

```txt
GET /api/feedbacks?page=1&page_size=10
```

5. 请求状态是 `200`。

如果表格显示“暂无反馈数据”，说明你当前数据库里没有反馈记录，不代表页面错了。

可以先不管，下一步我们再补筛选和处理操作。

### 23.9 本轮验收标准

完成第 23 步后，应该满足：

1. `pnpm build` 通过。
2. `/feedbacks` 路由能打开。
3. 页面能请求 `GET /api/feedbacks?page=1&page_size=10`。
4. 表格能显示反馈数据，或者在无数据时显示“暂无反馈数据”。

你现在只做：

1. 创建 `frontend/src/pages/FeedbackReviewPage.tsx`。
2. 修改 `frontend/src/App.tsx`，增加 `/feedbacks` 路由。
3. 修改 `frontend/src/App.css`，追加表格样式。
4. 执行 `pnpm build`。
5. 打开 `/feedbacks` 验证。
6. 把构建结果和页面截图发给我。

## 第 24 步：创建智能问数页面壳子

这一轮只做页面入口，不写业务逻辑。

原因：智能问数页面是 3 个页面里最复杂的，里面会涉及会话列表、消息列表、发送问题、结构化 AI 回复、反馈创建。我们不要一下子全写，否则你二面讲的时候会很难把数据流讲清楚。

这一步的目标只有两个：

1. 新增一个空的智能问数页面组件。
2. 在路由里能通过 `/chat` 打开它。

### 24.1 创建页面文件

创建文件：

```txt
frontend/src/pages/ChatPage.tsx
```

写入：

```tsx
const ChatPage = () => {
  return (
    <main className="app-page">
      <div className="page-shell">
        <nav className="breadcrumb" aria-label="面包屑">
          <span>智能问数</span>
          <span>/</span>
          <strong>经营单元收入&完成率分析</strong>
        </nav>

        <header className="page-header">
          <div>
            <h1>智能问数</h1>
            <p>通过自然语言问题查看经营数据分析结果。</p>
          </div>
        </header>
      </div>
    </main>
  )
}

export default ChatPage
```

解释：

- `ChatPage` 是一个普通 React 页面组件。
- 现在先复用已有的 `app-page`、`page-shell`、`breadcrumb`、`page-header` 样式。
- 这一步不请求接口，是为了先确认路由和页面入口没问题。

前端类比：

- 这相当于你先把一个新页面注册进路由，页面里先放静态结构。
- 后面再一点点往里面加状态、接口请求和交互。

### 24.2 修改路由

打开：

```txt
frontend/src/App.tsx
```

增加导入：

```tsx
import ChatPage from './pages/ChatPage'
```

然后在 `Routes` 里增加：

```tsx
<Route path="/chat" element={<ChatPage />} />
```

同时可以把首页重定向从 `/settings` 改成 `/chat`：

```tsx
<Route path="/" element={<Navigate to="/chat" replace />} />
```

完整结构类似：

```tsx
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import AppConfigPage from './pages/AppConfigPage'
import ChatPage from './pages/ChatPage'
import FeedbackReviewPage from './pages/FeedbackReviewPage'
import './App.css'

const APP = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/chat" replace />} />
        <Route path="/chat" element={<ChatPage />} />
        <Route path="/settings" element={<AppConfigPage />} />
        <Route path="/feedbacks" element={<FeedbackReviewPage />} />
      </Routes>
    </BrowserRouter>
  )
}

export default APP
```

解释：

- `BrowserRouter` 负责监听浏览器地址变化。
- `Routes` 里面放所有页面规则。
- `Route path="/chat"` 表示访问 `/chat` 时渲染 `ChatPage`。
- `Navigate` 是重定向，访问 `/` 时自动跳到 `/chat`。

### 24.3 验收方式

执行：

```bash
cd ~/Desktop/full-stack-demo/frontend
pnpm build
pnpm dev
```

浏览器打开：

```txt
http://localhost:5173/chat
```

检查：

1. 页面能打开。
2. 页面标题是 `智能问数`。
3. 面包屑是 `智能问数 / 经营单元收入&完成率分析`。
4. `pnpm build` 通过。

你现在只做：

1. 创建 `frontend/src/pages/ChatPage.tsx`。
2. 修改 `frontend/src/App.tsx`，增加 `/chat` 路由。
3. 执行 `pnpm build`。
4. 打开 `/chat` 验证。
5. 把构建结果和页面截图发给我。

## 第 25 步：搭建智能问数静态布局

这一轮只写静态 UI，不接后端接口。

原因：智能问数页面后面会接会话列表、消息发送、AI 回复数据和反馈创建。先把页面区域拆清楚，后面每接一个接口，都能知道数据应该落到哪个区域。

这一步要做 3 件事：

1. 把 `ChatPage` 改成“左侧会话 + 右侧对话区”的布局。
2. 新增单独的 `chat.css`。
3. 在 `App.css` 中引入 `chat.css`。

### 25.1 修改 `ChatPage.tsx`

打开：

```txt
frontend/src/pages/ChatPage.tsx
```

替换为：

```tsx
import { Plus, Send } from 'lucide-react'

const ChatPage = () => {
  return (
    <main className="chat-page">
      <aside className="chat-sidebar">
        <div className="chat-sidebar-header">
          <strong>近30天记录</strong>
        </div>

        <button className="new-chat-button" type="button">
          <Plus size={18} />
          开启新对话
        </button>

        <nav className="chat-history" aria-label="历史对话">
          <button className="chat-history-item active" type="button">
            经营单元收入&完成率...
          </button>
          <button className="chat-history-item" type="button">
            政企行业收入筛选
          </button>
          <button className="chat-history-item" type="button">
            产品型号销售统计
          </button>
        </nav>
      </aside>

      <section className="chat-main">
        <header className="chat-header">
          <h1>经营单元收入&完成率分析</h1>
        </header>

        <div className="chat-content">
          <article className="assistant-card">
            <h2>经营单元收入&完成率分析</h2>
            <p>这里后面会展示后端返回的 AI 回复内容。</p>
          </article>
        </div>

        <form className="chat-input-bar">
          <input placeholder="请写下您的想法..." />
          <button type="button" aria-label="发送">
            <Send size={18} />
          </button>
        </form>
      </section>
    </main>
  )
}

export default ChatPage
```

说明：

- `chat-page`：整个智能问数页面容器。
- `chat-sidebar`：左侧会话列表区域。
- `chat-main`：右侧主对话区域。
- `chat-content`：消息滚动区域。
- `chat-input-bar`：底部输入框区域。

这一步的按钮暂时都没有事件，因为现在只做布局。后面会逐个加：

- `开启新对话`：调用 `POST /api/sessions`
- 点击历史对话：切换当前会话
- 输入框发送：调用 `POST /api/sessions/{session_id}/messages`

### 25.2 新增 `chat.css`

创建文件：

```txt
frontend/src/styles/chat.css
```

写入：

```css
.chat-page {
  min-height: 100vh;
  display: grid;
  grid-template-columns: 200px minmax(0, 1fr);
  background: #f4f6fa;
  color: #172033;
}

.chat-sidebar {
  border-right: 1px solid #dbe3ef;
  background: #f8fbff;
  padding: 18px 12px;
  box-sizing: border-box;
}

.chat-sidebar-header {
  color: #18365f;
  margin-bottom: 16px;
}

.new-chat-button {
  width: 100%;
  height: 42px;
  border: 0;
  border-radius: 8px;
  background: #ede7ff;
  color: #5b21f3;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  font-size: 15px;
  font-weight: 700;
  cursor: pointer;
}

.chat-history {
  display: grid;
  gap: 6px;
  margin-top: 12px;
}

.chat-history-item {
  width: 100%;
  border: 0;
  border-radius: 8px;
  background: transparent;
  color: #18365f;
  padding: 10px;
  text-align: left;
  cursor: pointer;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.chat-history-item:hover,
.chat-history-item.active {
  background: #dbeafe;
}

.chat-main {
  min-width: 0;
  display: grid;
  grid-template-rows: 48px minmax(0, 1fr) auto;
  background: linear-gradient(90deg, #fff 0%, #fff 84%, #eef1f6 100%);
}

.chat-header {
  border-bottom: 2px solid #2563eb;
  background: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0 24px;
}

.chat-header h1 {
  margin: 0;
  color: #18365f;
  font-size: 16px;
  font-weight: 700;
}

.chat-content {
  min-height: 0;
  overflow: auto;
  padding: 24px 36px 96px;
  box-sizing: border-box;
}

.assistant-card {
  max-width: 1068px;
  border: 1px solid #e5eaf2;
  border-radius: 8px;
  background: #fff;
  padding: 18px;
  box-sizing: border-box;
  box-shadow: 0 8px 24px rgba(17, 24, 39, 0.05);
}

.assistant-card h2 {
  margin: 0 0 8px;
  color: #18365f;
  font-size: 16px;
}

.assistant-card p {
  color: #667085;
}

.chat-input-bar {
  width: min(640px, calc(100% - 72px));
  display: grid;
  grid-template-columns: minmax(0, 1fr) 42px;
  gap: 8px;
  justify-self: center;
  margin-bottom: 18px;
  border: 1px solid #cbd6e6;
  border-radius: 999px;
  background: #fff;
  padding: 7px 8px 7px 18px;
  box-shadow: 0 10px 30px rgba(37, 99, 235, 0.12);
}

.chat-input-bar input {
  min-width: 0;
  border: 0;
  outline: 0;
  color: #172033;
  font-size: 14px;
  background: transparent;
}

.chat-input-bar input::placeholder {
  color: #98a2b3;
}

.chat-input-bar button {
  width: 42px;
  height: 42px;
  border: 0;
  border-radius: 999px;
  background: #2563eb;
  color: #fff;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
}

@media (max-width: 760px) {
  .chat-page {
    grid-template-columns: 1fr;
  }

  .chat-sidebar {
    border-right: 0;
    border-bottom: 1px solid #dbe3ef;
  }

  .chat-history {
    display: flex;
    overflow-x: auto;
  }

  .chat-history-item {
    flex: 0 0 180px;
  }

  .chat-content {
    padding: 18px 18px 96px;
  }

  .chat-input-bar {
    width: calc(100% - 36px);
  }
}
```

### 25.3 在 `App.css` 引入样式

打开：

```txt
frontend/src/App.css
```

改成：

```css
@import './styles/layout.css';
@import './styles/chat.css';
@import './styles/settings.css';
@import './styles/feedback.css';
```

### 25.4 验收方式

执行：

```bash
cd ~/Desktop/full-stack-demo/frontend
pnpm build
```

然后打开：

```txt
http://localhost:5173/chat
```

检查：

1. 左侧有 `近30天记录` 和 `开启新对话`。
2. 右侧顶部标题是 `经营单元收入&完成率分析`。
3. 中间有一张占位回复卡片。
4. 底部有输入框和发送按钮。
5. `pnpm build` 通过。

你现在只做：

1. 修改 `frontend/src/pages/ChatPage.tsx`。
2. 创建 `frontend/src/styles/chat.css`。
3. 修改 `frontend/src/App.css` 引入 `chat.css`。
4. 执行 `pnpm build`。
5. 把构建结果和页面截图发给我。

## 第 26 步：接入会话列表接口

这一轮只接一个接口：

```txt
GET /api/sessions
```

目标：把左侧写死的历史对话，替换成后端数据库里的会话列表。

暂时不做：

- 不新建会话
- 不发送问题
- 不展示真实消息
- 不渲染 AI 表格/图表

原因：这是智能问数页面的第一个真实数据流。先把“页面加载 -> 请求接口 -> 渲染列表 -> 点击选中”的读流程跑通，后面再加写操作会更清楚。

前端类比：

- 这一步类似你做管理后台时，先把列表页的 `GET list` 接上。
- `POST create`、`PATCH update`、详情渲染都先不碰。

### 26.1 确认已有接口方法

打开：

```txt
frontend/src/api/chat.ts
```

确认里面有：

```ts
import { http } from './http'
import type { ChatSession } from './types'

export function getSessions() {
  return http.get<ChatSession[]>('/api/sessions')
}
```

如果你的文件里已经有 `getSessions`，这一步不用改。

解释：

- `getSessions` 是前端 API 方法。
- 它只负责调用后端接口，不负责页面状态。
- 返回类型是 `Promise<ChatSession[]>`。

### 26.2 修改 `ChatPage.tsx`

打开：

```txt
frontend/src/pages/ChatPage.tsx
```

替换为：

```tsx
import { useMemo, useState } from 'react'
import { Plus, Send } from 'lucide-react'
import { getSessions } from '../api/chat'
import type { ChatSession } from '../api/types'
import { useAsyncData } from '../hooks/useAsyncData'

const defaultTitle = '经营单元收入&完成率分析'

const formatDateTime = (value: string) => {
  return new Date(value).toLocaleString('zh-CN', {
    hour12: false,
  })
}

const ChatPage = () => {
  const {
    data: sessions,
    loading,
    error,
  } = useAsyncData<ChatSession[]>(getSessions, [])
  const [selectedSessionId, setSelectedSessionId] = useState<number | null>(null)
  const activeSessionId = selectedSessionId ?? sessions[0]?.id ?? null

  const activeSession = useMemo(() => {
    return sessions.find(session => session.id === activeSessionId) ?? null
  }, [activeSessionId, sessions])

  const pageTitle = activeSession?.title ?? defaultTitle

  return (
    <main className="chat-page">
      <aside className="chat-sidebar">
        <div className="chat-sidebar-header">
          <strong>近30天记录</strong>
        </div>

        <button className="new-chat-button" type="button">
          <Plus size={18} />
          开启新对话
        </button>

        <nav className="chat-history" aria-label="历史对话">
          {loading && <p className="chat-history-state">加载中...</p>}
          {error && <p className="chat-history-state error">{error}</p>}

          {!loading &&
            !error &&
            sessions.map(session => (
              <button
                className={
                  session.id === activeSessionId
                    ? 'chat-history-item active'
                    : 'chat-history-item'
                }
                key={session.id}
                type="button"
                onClick={() => setSelectedSessionId(session.id)}
              >
                <span>{session.title}</span>
                <small>{formatDateTime(session.updated_at)}</small>
              </button>
            ))}

          {!loading && !error && sessions.length === 0 && (
            <p className="chat-history-state">暂无历史对话</p>
          )}
        </nav>
      </aside>

      <section className="chat-main">
        <header className="chat-header">
          <h1>{pageTitle}</h1>
        </header>

        <div className="chat-content">
          <article className="assistant-card">
            <h2>{pageTitle}</h2>
            <p>
              {activeSession
                ? '已选中该历史对话。下一步会展示这个会话里的消息。'
                : '当前还没有历史对话。下一步会实现开启新对话。'}
            </p>
          </article>
        </div>

        <form className="chat-input-bar">
          <input placeholder="请写下您的想法..." />
          <button type="button" aria-label="发送">
            <Send size={18} />
          </button>
        </form>
      </section>
    </main>
  )
}

export default ChatPage
```

### 26.3 这段代码在做什么

重点看这句：

```tsx
const {
  data: sessions,
  loading,
  error,
} = useAsyncData<ChatSession[]>(getSessions, [])
```

意思是：

- 页面加载时调用 `getSessions`。
- 请求成功后，数据放到 `sessions`。
- 请求中，`loading` 是 `true`。
- 请求失败，错误文案放到 `error`。
- 初始值是空数组 `[]`。

前端类比：

- `useAsyncData(getSessions, [])` 可以理解成一个简化版的“列表请求 hook”。
- 它把常见的 `data/loading/error` 统一封装起来，页面不用每次都手写一遍 `try/catch/finally`。

再看这句：

```tsx
const activeSessionId = selectedSessionId ?? sessions[0]?.id ?? null
```

意思是：

- 如果用户点击过某个会话，就用用户选中的 `selectedSessionId`。
- 如果用户还没选过，并且接口返回了会话，就默认用第一条会话的 id。
- 如果接口还没有数据，或者数据库里没有会话，就是 `null`。

这里的第一条由后端决定。我们后端接口里按 `updated_at desc` 排序，所以第一条通常是最近更新的会话。

为什么不在 `useEffect` 里写 `setActiveSessionId(sessions[0].id)`：

- 新版本 React 的 lint 会提示：不要在 effect 里同步 setState 来派生状态。
- 因为这个值本来就能从 `selectedSessionId` 和 `sessions` 算出来。
- 直接派生可以少一次额外渲染，也能避免状态重复。

再看这段：

```tsx
const activeSession = useMemo(() => {
  return sessions.find(session => session.id === activeSessionId) ?? null
}, [activeSessionId, sessions])
```

意思是：

- 根据 `activeSessionId` 从 `sessions` 数组里找到当前选中的会话。
- 找不到就返回 `null`。

为什么用 `useMemo`：

- 这里不是必须用。
- 但它能表达一个清楚的关系：`activeSession` 是由 `sessions + activeSessionId` 派生出来的数据。
- 面试时可以说：真正的源状态只有 `sessions` 和 `selectedSessionId`，`activeSessionId`、`activeSession` 都是派生数据，不单独存一份，避免状态重复。

### 26.4 补充样式

打开：

```txt
frontend/src/styles/chat.css
```

在 `.chat-history-item` 后面追加：

```css
.chat-history-item span,
.chat-history-item small {
  display: block;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.chat-history-item span {
  font-size: 14px;
  font-weight: 600;
}

.chat-history-item small {
  margin-top: 4px;
  color: #718096;
  font-size: 12px;
}

.chat-history-state {
  margin: 0;
  color: #8a94a6;
  font-size: 13px;
  padding: 10px;
}

.chat-history-state.error {
  color: #b42318;
}
```

解释：

- `span` 放会话标题。
- `small` 放更新时间。
- 两个都加省略号，避免长标题把侧边栏撑乱。
- `chat-history-state` 用来显示加载、错误、空数据状态。

### 26.5 验收方式

这一步需要后端和前端都启动。

后端：

```bash
cd ~/Desktop/full-stack-demo/backend
source .venv/bin/activate
uvicorn app.main:app --reload
```

前端：

```bash
cd ~/Desktop/full-stack-demo/frontend
pnpm dev
```

构建检查：

```bash
cd ~/Desktop/full-stack-demo/frontend
pnpm build
```

浏览器打开：

```txt
http://localhost:5173/chat
```

打开 DevTools 的 Network，检查是否有：

```txt
GET /api/sessions
```

预期：

- 状态码是 `200`。
- 如果数据库里有会话，左侧显示真实会话。
- 如果数据库里没有会话，左侧显示 `暂无历史对话`。

说明：

- 如果开发环境里看到请求发了两次，大概率是 React StrictMode 的开发行为，不代表代码写错。
- 这个接口是读操作，重复请求不会新增数据，所以是安全的。

你现在只做：

1. 确认 `frontend/src/api/chat.ts` 里有 `getSessions`。
2. 修改 `frontend/src/pages/ChatPage.tsx`。
3. 修改 `frontend/src/styles/chat.css`。
4. 执行 `pnpm build`。
5. 打开 `/chat`，确认 Network 里有 `GET /api/sessions`。
6. 把构建结果和页面截图发给我。

## 第 27 步：实现开启新对话

这一轮只接一个写接口：

```txt
POST /api/sessions
```

目标：点击左侧 `开启新对话` 后，后端创建一条会话，前端把新会话显示到左侧列表并选中。

暂时不做：

- 不发送问题
- 不展示消息列表
- 不生成 AI 回复
- 不创建反馈

原因：上一轮已经完成 `GET /api/sessions`，这是读操作。现在补 `POST /api/sessions`，让智能问数页面先具备最小 CRUD 里的 `Create + Read`。

前端类比：

- `GET /api/sessions` 像列表查询。
- `POST /api/sessions` 像新增一条列表数据。
- 成功后前端不一定要重新请求列表，可以直接把接口返回的新数据插到当前列表最前面。

### 27.1 确认已有 API 方法

打开：

```txt
frontend/src/api/chat.ts
```

确认里面有：

```ts
export function createSession(title: string) {
  return http.post<ChatSession>('/api/sessions', { title })
}
```

如果你的文件里已经有 `createSession`，这一步不用改。

解释：

- 后端 `POST /api/sessions` 需要一个 `title`。
- 前端传 `{ title }`，后端创建一条 `chat_sessions` 数据。
- 后端返回新建好的 `ChatSession`，里面会有数据库生成的 `id`、`created_at`、`updated_at`。

### 27.2 修改 `ChatPage.tsx`

打开：

```txt
frontend/src/pages/ChatPage.tsx
```

把导入改成：

```tsx
import { useMemo, useState } from 'react'
import { Plus, Send } from 'lucide-react'
import { createSession, getSessions } from '../api/chat'
import type { ChatSession } from '../api/types'
import { useAsyncData } from '../hooks/useAsyncData'
import { toAsyncResult } from '../utils/asyncResult'
```

在 `defaultTitle` 下面增加：

```tsx
const newSessionTitle = '新的智能问数'
```

把 `useAsyncData` 这一段改成：

```tsx
const {
  data: sessions,
  setData: setSessions,
  loading,
  error,
  setError,
} = useAsyncData<ChatSession[]>(getSessions, [])
```

解释：

- 原来只需要读取 `sessions`。
- 现在创建成功后，要主动更新左侧列表，所以需要拿到 `setData`。
- 为了名字更清楚，我们重命名成 `setSessions`。

在 `selectedSessionId` 下面增加创建状态：

```tsx
const [creatingSession, setCreatingSession] = useState(false)
```

在 `pageTitle` 下面增加函数：

```tsx
const handleCreateSession = async () => {
  if (creatingSession) {
    return
  }

  setCreatingSession(true)
  setError(null)

  const result = await toAsyncResult(createSession(newSessionTitle))

  if (result.ok === false) {
    setError(result.error)
    setCreatingSession(false)
    return
  }

  setSessions(currentSessions => [result.data, ...currentSessions])
  setSelectedSessionId(result.data.id)
  setCreatingSession(false)
}
```

把按钮：

```tsx
<button className="new-chat-button" type="button">
  <Plus size={18} />
  开启新对话
</button>
```

改成：

```tsx
<button
  className="new-chat-button"
  type="button"
  disabled={creatingSession}
  onClick={() => void handleCreateSession()}
>
  <Plus size={18} />
  {creatingSession ? '创建中...' : '开启新对话'}
</button>
```

### 27.3 这段代码在做什么

重点看这个函数：

```tsx
const handleCreateSession = async () => {
  if (creatingSession) {
    return
  }

  setCreatingSession(true)
  setError(null)

  const result = await toAsyncResult(createSession(newSessionTitle))

  if (result.ok === false) {
    setError(result.error)
    setCreatingSession(false)
    return
  }

  setSessions(currentSessions => [result.data, ...currentSessions])
  setSelectedSessionId(result.data.id)
  setCreatingSession(false)
}
```

逐句解释：

```tsx
if (creatingSession) {
  return
}
```

防止用户连续点按钮导致重复创建。

```tsx
setCreatingSession(true)
setError(null)
```

进入创建中状态，并清掉上一次错误。

```tsx
const result = await toAsyncResult(createSession(newSessionTitle))
```

调用后端 `POST /api/sessions`。

这里用 `toAsyncResult`，是为了不用在每个事件函数里写一大段 `try/catch`。

成功时结果类似：

```ts
{
  ok: true,
  data: 新会话
}
```

失败时结果类似：

```ts
{
  ok: false,
  error: '错误信息'
}
```

```tsx
if (result.ok === false) {
  setError(result.error)
  setCreatingSession(false)
  return
}
```

如果失败，把错误显示到页面上，然后结束函数。

```tsx
setSessions(currentSessions => [result.data, ...currentSessions])
```

把新会话插到左侧列表最前面。

这里用了函数式更新，因为新列表依赖旧列表：

```tsx
currentSessions => [result.data, ...currentSessions]
```

前端类比：

- 和你写 `setList(prev => [newItem, ...prev])` 是一样的。
- 比直接写 `setSessions([result.data, ...sessions])` 更稳，因为它拿到的是 React 当前最新状态。

```tsx
setSelectedSessionId(result.data.id)
```

创建后自动选中新会话。

```tsx
setCreatingSession(false)
```

退出创建中状态。

### 27.4 为什么这个 POST 放在点击事件里

`POST /api/sessions` 会真的往数据库新增数据，所以它是一个有副作用的写操作。

这种操作应该放在用户明确触发的事件里：

```tsx
onClick={() => void handleCreateSession()}
```

不要放到 `useEffect` 里。

原因：

- React 开发环境可能会重复执行 effect。
- 如果把 POST 放进 effect，可能自动创建两条会话。
- 放在点击事件里，语义更清楚：用户点一次，创建一次。

### 27.5 补充按钮禁用样式

打开：

```txt
frontend/src/styles/chat.css
```

在 `.new-chat-button` 后面追加：

```css
.new-chat-button:disabled {
  cursor: not-allowed;
  opacity: 0.6;
}
```

解释：

- 创建中禁用按钮，避免重复点击。
- 视觉上让用户知道按钮暂时不可用。

### 27.6 验收方式

后端和前端都保持启动。

前端构建检查：

```bash
cd ~/Desktop/full-stack-demo/frontend
pnpm build
```

浏览器打开：

```txt
http://localhost:5173/chat
```

然后点击：

```txt
开启新对话
```

打开 DevTools 的 Network，检查是否有：

```txt
POST /api/sessions
```

预期：

1. `POST /api/sessions` 状态码是 `200`。
2. 左侧出现一条 `新的智能问数`。
3. 页面顶部标题变成 `新的智能问数`。
4. 刷新页面后，这条会话仍然存在。

为什么刷新后还在：

- 因为这条会话不是只存在前端 state 里。
- 后端已经写入 PostgreSQL。
- 刷新后前端重新请求 `GET /api/sessions`，又从数据库把它查出来了。

你现在只做：

1. 修改 `frontend/src/pages/ChatPage.tsx`。
2. 修改 `frontend/src/styles/chat.css`。
3. 执行 `pnpm build`。
4. 点击 `开启新对话`。
5. 确认 Network 里有 `POST /api/sessions`。
6. 刷新页面，确认新会话还在。
7. 把构建结果和页面截图发给我。

## 第 28 步：发送问题并展示消息

这一轮只接一个接口：

```txt
POST /api/sessions/{session_id}/messages
```

目标：在当前选中的会话里输入问题，点击发送后，后端保存用户问题并生成一条模拟 AI 回复，前端把这个会话里的消息展示出来。

暂时不做：

- 不渲染 AI 回复里的表格
- 不渲染统计信息
- 不渲染柱状图
- 不做“数据有误”反馈

原因：这一步先跑通“用户输入 -> 后端生成回复 -> 前端展示消息”的主链路。结构化数据展示留到下一步，否则一次改动太大。

### 28.1 确认已有 API 方法

打开：

```txt
frontend/src/api/chat.ts
```

确认里面有：

```ts
export function sendMessage(sessionId: number, content: string) {
  return http.post<ChatSession>(`/api/sessions/${sessionId}/messages`, {
    role: 'user',
    content,
  })
}
```

如果你的文件里已经有 `sendMessage`，这一步不用改。

解释：

- `sessionId`：告诉后端这条消息属于哪个会话。
- `content`：用户输入的问题。
- `role: 'user'`：告诉后端这是用户发出的消息。

后端会做两件事：

1. 保存一条用户消息。
2. 再生成并保存一条 `assistant` 消息。

所以这个接口返回的不是单条消息，而是更新后的整个 `ChatSession`。

### 28.2 修改 `ChatPage.tsx` 导入

打开：

```txt
frontend/src/pages/ChatPage.tsx
```

把顶部导入改成：

```tsx
import { useMemo, useState } from 'react'
import { Plus, Send } from 'lucide-react'
import { createSession, getSessions, sendMessage } from '../api/chat'
import type { ChatSession } from '../api/types'
import { useAsyncData } from '../hooks/useAsyncData'
import { toAsyncResult } from '../utils/asyncResult'
```

解释：

- `sendMessage` 是这一步要调用的新接口方法。

### 28.3 增加输入框和发送状态

在：

```tsx
const [creatingSession, setCreatingSession] = useState(false)
```

下面增加：

```tsx
const [question, setQuestion] = useState('')
const [sendingMessage, setSendingMessage] = useState(false)
```

解释：

- `question`：输入框当前内容。
- `sendingMessage`：是否正在发送。

这就是一个标准受控输入框：

- 输入框的 `value` 来自 React state。
- 用户输入时通过 `onChange` 更新 state。

### 28.4 增加 messages 派生数据

在：

```tsx
const pageTitle = activeSession?.title ?? defaultTitle
```

下面增加：

```tsx
const messages = useMemo(() => {
  return [...(activeSession?.messages ?? [])].sort((prev, next) => prev.id - next.id)
}, [activeSession])
```

解释：

- `activeSession?.messages ?? []`：如果当前有选中会话，就取它的消息；否则用空数组。
- `[...数组]`：复制一份数组，避免直接修改原数组。
- `.sort((prev, next) => prev.id - next.id)`：按消息 id 从小到大排序。

为什么要复制后再排序：

- `sort` 会修改原数组。
- React state 里的数据不要直接改。
- 所以先 `[...messages]` 复制，再排序。

前端类比：

```ts
const sortedList = [...list].sort(...)
```

这是你平时处理列表排序时很常见的写法。

### 28.5 增加发送函数

在 `handleCreateSession` 下面增加：

```tsx
const handleSendMessage = async (event: FormEvent<HTMLFormElement>) => {
  event.preventDefault()

  const content = question.trim()

  if (!activeSessionId || !content || sendingMessage) {
    return
  }

  setSendingMessage(true)
  setError(null)

  const result = await toAsyncResult(sendMessage(activeSessionId, content))

  if (result.ok === false) {
    setError(result.error)
    setSendingMessage(false)
    return
  }

  setSessions(currentSessions => [
    result.data,
    ...currentSessions.filter(session => session.id !== result.data.id),
  ])
  setSelectedSessionId(result.data.id)
  setQuestion('')
  setSendingMessage(false)
}
```

逐句解释：

```tsx
event.preventDefault()
```

阻止表单默认刷新页面。

如果不写，点击发送按钮时浏览器可能会按传统 HTML 表单行为提交并刷新页面。

```tsx
const content = question.trim()
```

去掉输入内容前后的空格。

```tsx
if (!activeSessionId || !content || sendingMessage) {
  return
}
```

三种情况不发送：

- 当前没有选中会话。
- 输入内容为空。
- 已经在发送中，避免重复点击。

```tsx
const result = await toAsyncResult(sendMessage(activeSessionId, content))
```

调用后端发送消息接口。

这里后端会返回更新后的整个会话，里面包含用户消息和 AI 回复消息。

```tsx
setSessions(currentSessions => [
  result.data,
  ...currentSessions.filter(session => session.id !== result.data.id),
])
```

把更新后的会话放到左侧列表最前面，并删除旧的同 id 会话。

为什么不是简单 `map`：

- 发送消息后，这个会话的 `updated_at` 会更新。
- 最近更新的会话应该排到最前面。
- 所以用 `[result.data, ...其他会话]`。

```tsx
setQuestion('')
```

发送成功后清空输入框。

### 28.6 替换消息展示区域

把原来的：

```tsx
<div className="chat-content">
  <article className="assistant-card">
    <h2>{pageTitle}</h2>
    <p>
      {activeSession
        ? '已选中该历史对话。下一步会展示这个会话里的消息。'
        : '当前还没有历史对话。下一步会实现开启新对话。'}
    </p>
  </article>
</div>
```

替换成：

```tsx
<div className="chat-content">
  {messages.length === 0 && (
    <article className="assistant-card">
      <h2>{pageTitle}</h2>
      <p>
        {activeSession
          ? '当前会话还没有消息，请在下方输入问题。'
          : '当前还没有历史对话，请先开启新对话。'}
      </p>
    </article>
  )}

  {messages.map(message => (
    <article
      className={message.role === 'user' ? 'message-row user' : 'message-row assistant'}
      key={message.id}
    >
      <div className="message-bubble">
        <strong>{message.role === 'user' ? '你' : 'AI'}</strong>
        <p>{message.content}</p>
      </div>
    </article>
  ))}
</div>
```

解释：

- 没有消息时显示提示卡片。
- 有消息时遍历 `messages`。
- `role === 'user'` 的消息靠右。
- `role === 'assistant'` 的消息靠左。

### 28.7 替换输入框表单

把原来的：

```tsx
<form className="chat-input-bar">
  <input placeholder="请写下您的想法..." />
  <button type="button" aria-label="发送">
    <Send size={18} />
  </button>
</form>
```

替换成：

```tsx
<form className="chat-input-bar" onSubmit={handleSendMessage}>
  <input
    value={question}
    disabled={!activeSessionId || sendingMessage}
    placeholder={activeSessionId ? '请写下您的想法...' : '请先开启新对话'}
    onChange={event => setQuestion(event.target.value)}
  />
  <button type="submit" disabled={!activeSessionId || !question.trim() || sendingMessage} aria-label="发送">
    <Send size={18} />
  </button>
</form>
```

解释：

- `onSubmit={handleSendMessage}`：表单提交时发送消息。
- `value={question}`：输入框内容由 React state 控制。
- `onChange`：用户输入时更新 `question`。
- 没有会话时禁用输入框。
- 输入为空时禁用发送按钮。

### 28.8 补充消息样式

打开：

```txt
frontend/src/styles/chat.css
```

在 `.assistant-card p` 后面追加：

```css
.message-row {
  max-width: 1068px;
  display: flex;
  margin-bottom: 14px;
}

.message-row.user {
  justify-content: flex-end;
}

.message-row.assistant {
  justify-content: flex-start;
}

.message-bubble {
  max-width: 68%;
  border: 1px solid #e5eaf2;
  border-radius: 8px;
  background: #fff;
  padding: 12px 14px;
  box-sizing: border-box;
  text-align: left;
  box-shadow: 0 8px 24px rgba(17, 24, 39, 0.05);
}

.message-row.user .message-bubble {
  border-color: #2563eb;
  background: #2563eb;
  color: #fff;
}

.message-bubble strong {
  display: block;
  margin-bottom: 6px;
  font-size: 13px;
}

.message-bubble p {
  margin: 0;
  line-height: 1.7;
}
```

在 `.chat-input-bar button` 后面追加：

```css
.chat-input-bar input:disabled,
.chat-input-bar button:disabled {
  cursor: not-allowed;
  opacity: 0.6;
}
```

### 28.9 验收方式

后端和前端都保持启动。

前端构建检查：

```bash
cd ~/Desktop/full-stack-demo/frontend
pnpm build
```

浏览器打开：

```txt
http://localhost:5173/chat
```

操作：

1. 选中一条会话。
2. 在输入框输入：

```txt
经营单元收入&完成率分析
```

3. 点击发送按钮。

Network 里应该看到：

```txt
POST /api/sessions/{session_id}/messages
```

预期：

1. 状态码是 `200`。
2. 页面出现一条用户消息。
3. 页面出现一条 AI 回复消息。
4. 输入框发送成功后被清空。
5. 刷新页面后，消息仍然存在。

为什么刷新后消息仍然存在：

- 后端把用户消息和 AI 回复都写进了 `chat_messages` 表。
- 刷新页面后，`GET /api/sessions` 会把会话和消息一起查出来。

你现在只做：

1. 修改 `frontend/src/pages/ChatPage.tsx`。
2. 修改 `frontend/src/styles/chat.css`。
3. 执行 `pnpm build`。
4. 在 `/chat` 页面发送一个问题。
5. 确认 Network 里有 `POST /api/sessions/{session_id}/messages`。
6. 刷新页面，确认消息还在。
7. 把构建结果和页面截图发给我。

## 第 29 步：渲染 AI 结构化回复

这一轮只做前端展示，不新增后端接口。

目标：把 AI 回复里的 `answer_data` 展示出来，包括：

1. 数据表格
2. 数据统计
3. 简易柱状图
4. 下一步问题建议

原因：后端现在返回的 AI 回复不是只有 `content` 文本，还包含 `answer_data`。这类结构化数据正是这个 demo 的亮点，二面可以讲：后端把分析结果组织成 JSON，前端根据 JSON 渲染成表格、统计和图表。

### 29.1 补充 `answer_data` 类型

打开：

```txt
frontend/src/api/types.ts
```

在 `// 对话` 下面、`ChatMessage` 上面增加：

```ts
export type ChatAnswerTableColumn = {
  key: string
  label: string
}

export type ChatAnswerTableRow = Record<string, string | number>

export type ChatAnswerStat = {
  label: string
  value: string
}

export type ChatAnswerChartSeries = {
  key: string
  name: string
  color: string
}

export type ChatAnswerData = {
  title: string
  description: string
  table: {
    columns: ChatAnswerTableColumn[]
    rows: ChatAnswerTableRow[]
  }
  stats: ChatAnswerStat[]
  chart: {
    type: string
    title: string
    x_key: string
    series: ChatAnswerChartSeries[]
  }
  suggestions: string[]
}
```

然后把 `ChatMessage` 里的：

```ts
answer_data: Record<string, unknown> | null
```

改成：

```ts
answer_data: ChatAnswerData | null
```

解释：

- 原来的 `Record<string, unknown>` 太宽泛，前端不知道里面有什么字段。
- 改成 `ChatAnswerData` 后，TS 能提示 `table`、`stats`、`chart`、`suggestions`。
- 这更接近真实业务：后端响应结构稳定后，前端应该把类型补准确。

### 29.2 创建 components 目录

创建目录：

```txt
frontend/src/components
```

然后创建文件：

```txt
frontend/src/components/AnswerDataView.tsx
```

原因：`ChatPage` 已经负责会话列表、输入框、发送消息、选中会话这些页面状态。如果再把表格、统计、图表都写进去，文件会越来越重。

拆成组件后：

- `ChatPage`：负责页面状态和接口动作。
- `AnswerDataView`：负责展示 AI 回复里的结构化数据。

### 29.3 编写 `AnswerDataView.tsx`

打开：

```txt
frontend/src/components/AnswerDataView.tsx
```

写入：

```tsx
import type { ChatAnswerData } from '../api/types'

type AnswerDataViewProps = {
  answerData: ChatAnswerData
  onSuggestionClick: (suggestion: string) => void
}

const formatCellValue = (value: string | number | undefined) => {
  if (typeof value === 'number') {
    return value.toLocaleString('zh-CN')
  }

  return value ?? '-'
}

const getChartMaxValue = (answerData: ChatAnswerData) => {
  const values = answerData.table.rows.flatMap(row =>
    answerData.chart.series.map(series => Number(row[series.key]) || 0),
  )

  return Math.max(1, ...values)
}

const AnswerDataView = ({ answerData, onSuggestionClick }: AnswerDataViewProps) => {
  const maxValue = getChartMaxValue(answerData)

  return (
    <div className="answer-data">
      <section className="answer-section">
        <h3>数据表格</h3>
        <div className="answer-table-wrap">
          <table className="answer-table">
            <thead>
              <tr>
                {answerData.table.columns.map(column => (
                  <th key={column.key}>{column.label}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {answerData.table.rows.map((row, rowIndex) => (
                <tr key={`${row.business_unit ?? rowIndex}`}>
                  {answerData.table.columns.map(column => (
                    <td key={column.key}>{formatCellValue(row[column.key])}</td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="answer-section">
        <h3>数据统计</h3>
        <ul className="answer-stats">
          {answerData.stats.map(stat => (
            <li key={stat.label}>
              <span>{stat.label}</span>
              <strong>{stat.value}</strong>
            </li>
          ))}
        </ul>
      </section>

      <section className="answer-section">
        <h3>数据可视化</h3>
        <p>{answerData.description}</p>

        <div className="mini-chart" aria-label={answerData.chart.title}>
          <strong>{answerData.chart.title}</strong>
          <div className="mini-chart-grid">
            {answerData.table.rows.map((row, rowIndex) => (
              <div className="mini-chart-group" key={`${row.business_unit ?? rowIndex}`}>
                <div className="mini-chart-bars">
                  {answerData.chart.series.map(series => {
                    const value = Number(row[series.key]) || 0
                    const height = Math.max(8, Math.round((value / maxValue) * 104))

                    return (
                      <span
                        key={series.key}
                        title={`${series.name}: ${value.toLocaleString('zh-CN')}`}
                        style={{
                          height,
                          backgroundColor: series.color,
                        }}
                      />
                    )
                  })}
                </div>
                <small>{formatCellValue(row[answerData.chart.x_key])}</small>
              </div>
            ))}
          </div>

          <div className="mini-chart-legend">
            {answerData.chart.series.map(series => (
              <span key={series.key}>
                <i style={{ backgroundColor: series.color }} />
                {series.name}
              </span>
            ))}
          </div>
        </div>
      </section>

      <div className="suggestion-list" aria-label="下一步问题建议">
        {answerData.suggestions.map(suggestion => (
          <button key={suggestion} type="button" onClick={() => onSuggestionClick(suggestion)}>
            {suggestion}
          </button>
        ))}
      </div>
    </div>
  )
}

export default AnswerDataView
```

解释：

- `formatCellValue`：表格单元格格式化。数字加千分位，空值显示 `-`。
- `flatMap`：先遍历每一行，再取出每个图表系列对应的数值，最后拍平成一个数组。
- `Math.max(1, ...values)`：找最大值，用来计算柱状图高度。放一个 `1` 是为了避免最大值为 `0` 时除以 0。
- `AnswerDataView` 只负责展示 `answerData`，不请求接口，不改父组件状态。
- 点击建议问题时，通过 `onSuggestionClick` 把问题交给 `ChatPage` 继续发送。

### 29.4 修改 `ChatPage.tsx` 导入

打开：

```txt
frontend/src/pages/ChatPage.tsx
```

增加导入：

```tsx
import AnswerDataView from '../components/AnswerDataView'
```

`ChatPage` 里不需要导入 `ChatAnswerData`，因为这个类型只在 `AnswerDataView` 组件内部使用。

### 29.5 改造发送函数，支持建议问题

把当前的：

```tsx
const handleSendMessage = async () => {
  const content = question.trim()
```

改成：

```tsx
const handleSendMessage = async (nextQuestion?: string) => {
  const content = (nextQuestion ?? question).trim()
```

其他逻辑不变。

解释：

- 正常发送时，不传参数，使用输入框里的 `question`。
- 点击建议问题时，传入 `suggestion`，直接发送这个建议问题。

### 29.6 在 AI 消息里渲染 `AnswerDataView`

找到当前消息渲染里的：

```tsx
<div className="message-bubble">
  <strong>{message.role === 'user' ? '你' : 'AI'}</strong>
  <p>{message.content}</p>
</div>
```

改成：

```tsx
<div className="message-bubble">
  <strong>{message.role === 'user' ? '你' : 'AI'}</strong>
  <p>{message.content}</p>

  {message.role === 'assistant' && message.answer_data && (
    <AnswerDataView
      answerData={message.answer_data}
      onSuggestionClick={suggestion => void handleSendMessage(suggestion)}
    />
  )}
</div>
```

解释：

- 只有 AI 消息才可能有 `answer_data`。
- 用户消息只展示文本。
- `message.answer_data && ...` 是条件渲染，避免空数据时报错。

### 29.7 补充结构化回复样式

打开：

```txt
frontend/src/styles/chat.css
```

在文件里追加：

```css
.message-row.assistant .message-bubble {
  width: min(100%, 760px);
  max-width: 82%;
}

.answer-data {
  display: grid;
  gap: 16px;
  border-top: 1px solid #edf1f6;
  margin-top: 14px;
  padding-top: 14px;
}

.answer-section h3 {
  margin: 0 0 10px;
  color: #18365f;
  font-size: 15px;
}

.answer-section p {
  margin: 0 0 8px;
  color: #667085;
  font-size: 14px;
}

.answer-table-wrap {
  overflow-x: auto;
}

.answer-table {
  width: 100%;
  min-width: 640px;
  border-collapse: collapse;
  table-layout: fixed;
}

.answer-table th {
  background: #f3f6fa;
  color: #18365f;
  font-size: 14px;
  font-weight: 700;
  padding: 9px 12px;
  text-align: left;
}

.answer-table td {
  border-top: 1px solid #e5eaf2;
  color: #344054;
  padding: 9px 12px;
  font-size: 14px;
}

.answer-stats {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 10px;
  margin: 0;
  padding: 0;
  list-style: none;
}

.answer-stats li {
  border: 1px solid #e5eaf2;
  border-radius: 8px;
  background: #f8fbff;
  padding: 10px 12px;
}

.answer-stats span {
  display: block;
  color: #667085;
  font-size: 13px;
}

.answer-stats strong {
  display: block;
  margin-top: 4px;
  color: #111827;
  font-size: 15px;
}

.mini-chart {
  border-radius: 8px;
  background: #f8fafc;
  padding: 14px 16px;
}

.mini-chart > strong {
  display: block;
  color: #475467;
  font-size: 13px;
  text-align: center;
}

.mini-chart-grid {
  min-height: 146px;
  display: grid;
  grid-template-columns: repeat(5, minmax(80px, 1fr));
  align-items: end;
  gap: 14px;
  padding-top: 14px;
}

.mini-chart-group {
  min-width: 0;
  display: grid;
  justify-items: center;
  gap: 8px;
}

.mini-chart-bars {
  height: 112px;
  display: flex;
  align-items: end;
  gap: 6px;
}

.mini-chart-bars span {
  width: 12px;
  border-radius: 4px 4px 0 0;
}

.mini-chart-group small {
  max-width: 100%;
  overflow: hidden;
  color: #667085;
  font-size: 12px;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.mini-chart-legend,
.suggestion-list {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 10px;
}

.mini-chart-legend {
  justify-content: center;
  margin-top: 8px;
}

.mini-chart-legend span {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  color: #667085;
  font-size: 12px;
}

.mini-chart-legend i {
  width: 8px;
  height: 8px;
  border-radius: 2px;
}

.suggestion-list button {
  border: 0;
  border-radius: 999px;
  background: #eef3f9;
  color: #475467;
  padding: 7px 12px;
  font-size: 13px;
  cursor: pointer;
}

.suggestion-list button:hover {
  color: #2563eb;
  background: #dbeafe;
}
```

### 29.8 验收方式

执行：

```bash
cd ~/Desktop/full-stack-demo/frontend
pnpm build
```

打开：

```txt
http://localhost:5173/chat
```

发送：

```txt
经营单元收入&完成率分析
```

预期：

1. AI 回复下面显示数据表格。
2. 显示数据统计。
3. 显示简易柱状图。
4. 显示下一步问题建议。
5. 点击建议问题，会继续发送一条新问题。

你现在只做：

1. 修改 `frontend/src/api/types.ts`。
2. 创建 `frontend/src/components/AnswerDataView.tsx`。
3. 修改 `frontend/src/pages/ChatPage.tsx`，导入并使用 `AnswerDataView`。
4. 修改 `frontend/src/styles/chat.css`。
5. 执行 `pnpm build`。
6. 在页面发送问题并截图给我。

## 第 30 步：从 AI 回复创建反馈

这一轮接智能问数页和回复校对页的业务闭环。

目标：在 AI 回复下面加一个 `数据有误` 按钮。点击后调用：

```txt
POST /api/feedbacks
```

创建成功后，去 `/feedbacks` 页面能看到一条 `待处理` 反馈。

原因：这个功能能把两个页面串起来：

- 智能问数页：用户发现 AI 回复有误。
- 回复校对页：运营/管理员处理这条反馈。

这在二面里很好讲，因为它不是孤立页面，而是一个真实业务流。

### 30.1 确认已有 API 方法

打开：

```txt
frontend/src/api/feedback.ts
```

确认里面有：

```ts
export const createFeedback = (payload: FeedbackCreatePayload) => {
  return http.post<Feedback>('/api/feedbacks', payload)
}
```

如果已经有，这一步不用改。

### 30.2 修改 `ChatPage.tsx` 导入

打开：

```txt
frontend/src/pages/ChatPage.tsx
```

把图标导入：

```tsx
import { Plus, Send } from 'lucide-react'
```

改成：

```tsx
import { ClipboardCheck, Plus, Send } from 'lucide-react'
```

增加反馈 API 导入：

```tsx
import { createFeedback } from '../api/feedback'
```

### 30.3 增加反馈状态

在：

```tsx
const [sendingMessage, setSendingMessage] = useState(false)
```

下面增加：

```tsx
const [feedbackMessageId, setFeedbackMessageId] = useState<number | null>(null)
const [feedbackDoneIds, setFeedbackDoneIds] = useState<number[]>([])
```

解释：

- `feedbackMessageId`：当前正在提交反馈的消息 id，用来禁用按钮。
- `feedbackDoneIds`：已经提交过反馈的消息 id，用来显示 `已反馈`，避免重复提交。

### 30.4 增加查找上一条用户问题的函数

在 `messages` 下面增加：

```tsx
const getPreviousUserQuestion = (messageIndex: number) => {
  const previousUserMessage = [...messages]
    .slice(0, messageIndex)
    .reverse()
    .find(message => message.role === 'user')

  return previousUserMessage?.content ?? pageTitle
}
```

解释：

- AI 回复本身只知道它自己的 `content`。
- 创建反馈时，后端需要保存 `question` 和 `ai_answer`。
- 所以我们从当前 AI 消息前面往回找最近一条用户消息，把它当成问题。

这里用到几个数组方法：

```ts
slice(0, messageIndex)
```

取当前 AI 消息之前的所有消息。

```ts
reverse()
```

倒过来，从最近的消息开始找。

```ts
find(message => message.role === 'user')
```

找到最近一条用户消息。

### 30.5 增加创建反馈函数

在 `handleSendMessage` 下面增加：

```tsx
const handleCreateFeedback = async (messageId: number, messageIndex: number, aiAnswer: string) => {
  if (feedbackDoneIds.includes(messageId) || feedbackMessageId === messageId) {
    return
  }

  setFeedbackMessageId(messageId)
  setError(null)

  const result = await toAsyncResult(
    createFeedback({
      user_name: '管理员',
      question: getPreviousUserQuestion(messageIndex),
      ai_answer: aiAnswer,
      message_id: messageId,
    }),
  )

  if (result.ok === false) {
    setError(result.error)
    setFeedbackMessageId(null)
    return
  }

  setFeedbackDoneIds(currentIds => [...currentIds, messageId])
  setFeedbackMessageId(null)
}
```

解释：

```tsx
feedbackDoneIds.includes(messageId)
```

表示这条 AI 消息已经提交过反馈，不再重复提交。

```tsx
feedbackMessageId === messageId
```

表示这条消息正在提交中，也不重复提交。

```tsx
createFeedback({
  user_name: '管理员',
  question: getPreviousUserQuestion(messageIndex),
  ai_answer: aiAnswer,
  message_id: messageId,
})
```

这里对应后端 `feedbacks` 表：

- `user_name`：反馈人，demo 里先写死 `管理员`。
- `question`：用户原始问题。
- `ai_answer`：AI 回复摘要。
- `message_id`：关联到哪条 AI 消息。

### 30.6 修改消息 map，拿到 index

把：

```tsx
{messages.map(message => (
```

改成：

```tsx
{messages.map((message, index) => (
```

原因：创建反馈时要根据当前 AI 消息位置，往前找最近一条用户问题。

### 30.7 在 AI 消息下面加反馈按钮

在：

```tsx
{message.role === 'assistant' && message.answer_data && (
  <AnswerDataView
    answerData={message.answer_data}
    onSuggestionClick={suggestion => void handleSendMessage(suggestion)}
  />
)}
```

下面增加：

```tsx
{message.role === 'assistant' && (
  <div className="message-actions">
    <button
      type="button"
      disabled={feedbackMessageId === message.id || feedbackDoneIds.includes(message.id)}
      onClick={() => void handleCreateFeedback(message.id, index, message.content)}
    >
      <ClipboardCheck size={16} />
      {feedbackDoneIds.includes(message.id) ? '已反馈' : '数据有误'}
    </button>
  </div>
)}
```

解释：

- 只有 AI 消息显示 `数据有误`。
- 用户消息不显示。
- 提交中或者已提交后禁用按钮。

### 30.8 补充样式

打开：

```txt
frontend/src/styles/chat.css
```

追加：

```css
.message-actions {
  display: flex;
  justify-content: flex-end;
  border-top: 1px solid #edf1f6;
  margin-top: 14px;
  padding-top: 12px;
}

.message-actions button {
  border: 0;
  border-radius: 999px;
  background: #eef3f9;
  color: #475467;
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 7px 12px;
  font-size: 13px;
  cursor: pointer;
}

.message-actions button:hover {
  color: #2563eb;
  background: #dbeafe;
}

.message-actions button:disabled {
  cursor: not-allowed;
  color: #0f9f6e;
  background: #dff8ec;
}
```

### 30.9 验收方式

执行：

```bash
cd ~/Desktop/full-stack-demo/frontend
pnpm build
```

打开：

```txt
http://localhost:5173/chat
```

操作：

1. 找到一条 AI 回复。
2. 点击 `数据有误`。
3. Network 里确认有：

```txt
POST /api/feedbacks
```

4. 打开：

```txt
http://localhost:5173/feedbacks
```

预期：

1. `POST /api/feedbacks` 状态码是 `200`。
2. 按钮变成 `已反馈`。
3. 回复校对页出现一条新的 `待处理` 数据。

你现在只做：

1. 修改 `frontend/src/pages/ChatPage.tsx`。
2. 修改 `frontend/src/styles/chat.css`。
3. 执行 `pnpm build`。
4. 点击一条 AI 回复的 `数据有误`。
5. 去 `/feedbacks` 验证数据出现。
6. 把截图发给我。

## 第 31 步：按 `demo.html` 对齐回复校对

原型里的回复校对页有两个关键点：

1. 表格顶部有筛选区：搜索问题、搜索用户、状态筛选、总条数。
2. 处理弹窗不是简单备注框，而是左右两栏：
   - 左侧展示用户提问和 AI 回复。
   - 右侧可以选择处理状态，并填写处理备注。

所以这一轮要做：

- `GET /api/feedbacks` 增加筛选和分页参数。
- 表格增加操作列。
- 点击处理打开弹窗。
- 弹窗里可以选择 `待处理` 或 `已处理`。
- 保存时调用 `PATCH /api/feedbacks/{feedback_id}`。

### 31.1 状态值映射

后端状态是英文：

```txt
pending
resolved
```

页面显示是中文：

```txt
待处理
已处理
```

所以前端要做映射：

```tsx
const statusOptions = [
  { label: '全部状态', value: '' },
  { label: '待处理', value: 'pending' },
  { label: '已处理', value: 'resolved' },
] as const
```

解释：

- UI 上给用户看中文。
- 接口里传英文。
- 这样不会把展示文案和数据库状态混在一起。

### 31.2 修改 `FeedbackReviewPage.tsx` 导入

打开：

```txt
frontend/src/pages/FeedbackReviewPage.tsx
```

顶部改成：

```tsx
import { useMemo, useState } from 'react'
import { getFeedbacks, updateFeedback } from '../api/feedback'
import type { Feedback, FeedbackListResponse, FeedbackStatus } from '../api/types'
import { useAsyncData } from '../hooks/useAsyncData'
import { toAsyncResult } from '../utils/asyncResult'
```

### 31.3 增加筛选状态

在 `initialFeedbackResponse` 下面增加：

```tsx
const pageSize = 10

const statusOptions = [
  { label: '全部状态', value: '' },
  { label: '待处理', value: 'pending' },
  { label: '已处理', value: 'resolved' },
] as const
```

在组件里增加：

```tsx
const [questionKeyword, setQuestionKeyword] = useState('')
const [userKeyword, setUserKeyword] = useState('')
const [statusFilter, setStatusFilter] = useState<FeedbackStatus | ''>('')
const [page, setPage] = useState(1)
```

解释：

- `questionKeyword` 对应原型里的“搜索问题...”。
- `userKeyword` 对应原型里的“搜索用户...”。
- `statusFilter` 对应原型里的状态下拉。
- `page` 对应分页。

### 31.4 让列表请求带筛选参数

把原来的：

```tsx
const loadInitialFeedbacks = () => {
  return getFeedbacks({
    page: 1,
    page_size: 10,
  })
}
```

删掉。

在组件里增加：

```tsx
const loadFeedbacks = useMemo(() => {
  return () =>
    getFeedbacks({
      question: questionKeyword.trim() || undefined,
      user: userKeyword.trim() || undefined,
      status: statusFilter || undefined,
      page,
      page_size: pageSize,
    })
}, [page, questionKeyword, statusFilter, userKeyword])
```

然后把：

```tsx
const { data, loading, error } = useAsyncData(loadInitialFeedbacks, initialFeedbackResponse)
```

改成：

```tsx
const {
  data,
  setData,
  loading,
  error,
  setError,
} = useAsyncData(loadFeedbacks, initialFeedbackResponse)
```

说明：

- 筛选条件变化时，`loadFeedbacks` 会变化。
- `useAsyncData` 会重新请求列表。
- 这就对应原型里的输入框 `oninput` 和状态筛选 `onchange`。
- 但是不要用 `loading` 把整块表格卸载掉，否则输入筛选条件时页面会闪动。

页面里不要再写这种结构：

```tsx
{loading && <p className="state-text">加载中...</p>}
{error && <p className="state-text error">{error}</p>}

{!loading && !error && (
  <section className="table-card">
    ...
  </section>
)}
```

原因：

- 每次输入搜索词，`loading` 会变成 `true`。
- `!loading && ...` 会让整块表格先消失。
- 请求完成后表格再出现，所以你看到的是整个屏幕闪动。

改成：

```tsx
{error && <p className="state-text error">{error}</p>}

<section className="table-card" aria-label="回复校对列表">
  ...
</section>
```

也就是说：

- 表格容器始终存在。
- 筛选时保留当前表格内容。
- loading 状态只在表格内部局部提示。

### 31.5 增加弹窗状态

在组件里增加：

```tsx
const [activeFeedback, setActiveFeedback] = useState<Feedback | null>(null)
const [statusDraft, setStatusDraft] = useState<FeedbackStatus>('pending')
const [remark, setRemark] = useState('')
const [submitting, setSubmitting] = useState(false)
```

解释：

- `activeFeedback`：当前正在处理哪条反馈。
- `statusDraft`：弹窗里选择的处理状态。
- `remark`：处理备注。
- `submitting`：保存中状态。

### 31.6 打开弹窗时回填原数据

增加：

```tsx
const openHandleDialog = (feedback: Feedback) => {
  setActiveFeedback(feedback)
  setStatusDraft(feedback.status === 'resolved' ? 'resolved' : 'pending')
  setRemark(feedback.remark ?? '')
  setError(null)
}

const closeHandleDialog = () => {
  if (submitting) {
    return
  }

  setActiveFeedback(null)
  setRemark('')
  setStatusDraft('pending')
}
```

这和原型里的逻辑一致：

```js
remarkFeedbackText.value = r.remark || ''
remarkFeedbackStatus.value = r.status || '待处理'
```

### 31.7 保存时使用弹窗选择的状态

增加：

```tsx
const handleSubmitFeedback = async () => {
  if (!activeFeedback || submitting) {
    return
  }

  setSubmitting(true)
  setError(null)

  const result = await toAsyncResult(
    updateFeedback(activeFeedback.id, {
      status: statusDraft,
      remark: remark.trim(),
    }),
  )

  if (result.ok === false) {
    setError(result.error)
    setSubmitting(false)
    return
  }

  setData(currentData => ({
    ...currentData,
    items: currentData.items.map(item => (item.id === result.data.id ? result.data : item)),
  }))

  setActiveFeedback(null)
  setRemark('')
  setStatusDraft('pending')
  setSubmitting(false)
}
```

重点：这里不能固定写：

```tsx
status: 'resolved'
```

因为原型允许在弹窗里选择 `待处理` 或 `已处理`。

### 31.8 表格顶部筛选区

把表格 toolbar 改成类似：

```tsx
<div className="feedback-panel-header">
  <div>
    <strong>回复校对</strong>
    <span>此列表为用户标注AI回复数据有误的信息数据</span>
  </div>

  <div className="feedback-filters">
    <input
      value={questionKeyword}
      placeholder="搜索问题..."
      onChange={event => {
        setPage(1)
        setQuestionKeyword(event.target.value)
      }}
    />
    <input
      value={userKeyword}
      placeholder="搜索用户..."
      onChange={event => {
        setPage(1)
        setUserKeyword(event.target.value)
      }}
    />
    <select
      value={statusFilter}
      onChange={event => {
        setPage(1)
        setStatusFilter(event.target.value as FeedbackStatus | '')
      }}
    >
      {statusOptions.map(option => (
        <option key={option.value || 'all'} value={option.value}>
          {option.label}
        </option>
      ))}
    </select>
    <span className="table-count">{loading ? '更新中...' : `共 ${total} 条`}</span>
  </div>
</div>
```

这对应原型里的：

- 搜索问题
- 搜索用户
- 全部状态 / 待处理 / 已处理
- 共 N 条

### 31.9 表格列要对齐原型

表格列应该是：

```txt
序号 / 用户 / 问题 / 反馈时间 / 状态 / 操作
```

`colgroup` 增加操作列：

```tsx
<col className="feedback-col-action" />
```

表头增加：

```tsx
<th>操作</th>
```

每行增加：

```tsx
<td className="table-action">
  <button type="button" onClick={() => openHandleDialog(item)}>
    处理
  </button>
</td>
```

注意：原型里即使是已处理，也还是显示“处理”，点击后可以查看/修改备注和状态。所以这里不要禁用已处理行。

空数据：

```tsx
{loading && feedbacks.length === 0 && (
  <tr>
    <td className="empty-cell" colSpan={6}>
      加载中...
    </td>
  </tr>
)}

{!loading && feedbacks.length === 0 && (
  <tr>
    <td className="empty-cell" colSpan={6}>
      暂无反馈数据
    </td>
  </tr>
)}
```

如果 `loading === true` 但 `feedbacks.length > 0`，就继续显示当前表格数据，只在右上角显示 `更新中...`。

这样筛选时只会局部更新表格内容，不会整屏闪动。

### 31.10 分页

在表格下面加：

```tsx
const totalPages = Math.max(1, Math.ceil(total / pageSize))
```

渲染：

```tsx
<div className="feedback-pagination">
  <span>共 {total} 条，每页 {pageSize} 条</span>
  <div>
    <button type="button" disabled={page <= 1} onClick={() => setPage(current => current - 1)}>
      上一页
    </button>
    <span>{page} / {totalPages}</span>
    <button
      type="button"
      disabled={page >= totalPages}
      onClick={() => setPage(current => current + 1)}
    >
      下一页
    </button>
  </div>
</div>
```

原型里有每页条数选择和页码按钮。我们这里先固定每页 10 条，保留分页能力，复杂度更适合当前 demo。

### 31.11 弹窗结构按原型左右两栏

弹窗内容用这个结构：

```tsx
{activeFeedback && (
  <div className="feedback-modal-backdrop" onClick={closeHandleDialog}>
    <section
      className="feedback-modal"
      role="dialog"
      aria-modal="true"
      aria-label="反馈处理"
      onClick={event => event.stopPropagation()}
    >
      <header>
        <h2>反馈处理</h2>
        <button type="button" disabled={submitting} onClick={closeHandleDialog}>
          关闭
        </button>
      </header>

      <div className="feedback-modal-body two-column">
        <div className="feedback-preview">
          <label>
            用户提问
            <p>{activeFeedback.question}</p>
          </label>

          <label>
            AI回复
            <p className="ai-reply">{activeFeedback.ai_answer || '（暂无AI回复数据）'}</p>
          </label>
        </div>

        <div className="feedback-form">
          <label>
            处理状态
            <select
              value={statusDraft}
              onChange={event => setStatusDraft(event.target.value as FeedbackStatus)}
            >
              <option value="pending">待处理</option>
              <option value="resolved">已处理</option>
            </select>
          </label>

          <label>
            处理备注
            <textarea
              value={remark}
              placeholder="请填写处理备注..."
              onChange={event => setRemark(event.target.value)}
            />
          </label>
        </div>
      </div>

      <footer>
        <button type="button" disabled={submitting} onClick={closeHandleDialog}>
          取消
        </button>
        <button type="button" disabled={submitting} onClick={() => void handleSubmitFeedback()}>
          {submitting ? '保存中...' : '确认'}
        </button>
      </footer>
    </section>
  </div>
)}
```

这里对齐原型：

- 弹窗标题：`反馈处理`
- 左侧：`用户提问`、`AI回复`
- 右侧：`处理状态`、`处理备注`
- 底部：`取消`、`确认`
- 点击遮罩关闭

### 31.12 样式重点

你的 `feedback.css` 里需要补这些类：

```css
.feedback-panel-header {
  border-bottom: 1px solid #e4e9f2;
  padding: 14px 18px 12px;
}

.feedback-panel-header > div:first-child {
  display: flex;
  align-items: baseline;
  gap: 8px;
  margin-bottom: 10px;
}

.feedback-panel-header strong {
  color: #111827;
  font-size: 15px;
}

.feedback-panel-header span {
  color: #9ca3af;
  font-size: 13px;
}

.feedback-filters {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
}

.feedback-filters input,
.feedback-filters select {
  height: 32px;
  border: 1px solid #dbe3ef;
  border-radius: 6px;
  background: #fff;
  color: #344054;
  padding: 0 10px;
  outline: 0;
}

.feedback-filters input {
  width: 180px;
}

.feedback-filters select {
  width: 120px;
}

.feedback-filters .table-count {
  margin-left: auto;
}

.feedback-col-action {
  width: 120px;
}

.table-action {
  position: sticky;
  right: 0;
  background: #fff;
  text-align: center;
  box-shadow: -2px 0 4px rgb(15 23 42 / 4%);
}

.table-action button {
  border: 0;
  background: transparent;
  color: #2563eb;
  font-weight: 600;
  cursor: pointer;
}

.feedback-pagination {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 16px;
  padding: 12px 18px 16px;
  color: #8a94a6;
  font-size: 14px;
}

.feedback-pagination > div {
  display: flex;
  align-items: center;
  gap: 8px;
}

.feedback-pagination button {
  border: 1px solid #dbe3ef;
  border-radius: 6px;
  background: #fff;
  color: #475467;
  padding: 6px 10px;
  cursor: pointer;
}

.feedback-pagination button:disabled {
  cursor: not-allowed;
  color: #b8c0cc;
  background: #f5f7fb;
}

.feedback-modal-body.two-column {
  display: grid;
  grid-template-columns: minmax(0, 1fr) 220px;
  gap: 20px;
}

.feedback-preview,
.feedback-form {
  display: grid;
  gap: 14px;
  align-content: start;
}

.feedback-modal-body label {
  display: grid;
  gap: 6px;
  color: #6b7280;
  font-size: 14px;
  font-weight: 600;
}

.feedback-modal-body p {
  border-radius: 8px;
  background: #f9fafb;
  color: #374151;
  padding: 10px 12px;
  font-size: 15px;
  font-weight: 400;
  line-height: 1.5;
}

.feedback-modal-body p.ai-reply {
  border: 1px solid #fde68a;
  background: #fff8f0;
  color: #92400e;
}

.feedback-modal-body select,
.feedback-modal-body textarea {
  border: 1px solid #d1d5db;
  border-radius: 6px;
  background: #fafbfc;
  color: #344054;
  font: inherit;
  outline: 0;
}

.feedback-modal-body select {
  height: 36px;
  padding: 0 10px;
}

.feedback-modal-body textarea {
  height: 180px;
  resize: vertical;
  padding: 10px;
}
```

如果你原来已经有 `.feedback-modal-backdrop`、`.feedback-modal`、`.feedback-modal header/footer` 这些样式，可以保留，只把 body 改成上面这种左右两栏。

### 31.13 验收方式

执行：

```bash
cd ~/Desktop/full-stack-demo/frontend
pnpm build
```

打开：

```txt
http://localhost:5173/feedbacks
```

检查：

1. 顶部有搜索问题、搜索用户、状态筛选。
2. 表格列是：序号、用户、问题、反馈时间、状态、操作。
3. 操作列右侧固定，按钮是 `处理`。
4. 点击处理后，弹窗左侧显示用户提问和 AI 回复。
5. 弹窗右侧能选择处理状态、填写处理备注。
6. 保存后调用 `PATCH /api/feedbacks/{id}`。
7. 刷新后状态和备注仍然存在。

你现在只做：

1. 修改 `frontend/src/pages/FeedbackReviewPage.tsx`。
2. 修改 `frontend/src/styles/feedback.css`。
3. 执行 `pnpm build`。
4. 截图给我。

## 第 32 步：组件化弹窗，并按 `demo.html` 补应用配置弹窗

这一轮处理两件事：

1. 把已有的回复校对处理弹窗拆成组件。
2. 按 `demo.html` 补应用配置页里的两个配置弹窗。

只补原型里已有的两个应用配置弹窗：

1. `对话开场白`
2. `常问设置`

不做：

- 不新增模型配置页。
- 不给语音能力加额外交互。
- 不新增 `demo.html` 里没有的功能。

原因：`demo.html` 里应用配置页的齿轮行为是：

- `对话开场白`：打开开场白配置弹窗。
- `模型配置`：跳转到单独的模型配置页。
- `常问设置`：打开常问设置弹窗。

这次任务只要求三个页面，所以不新增第四个模型配置页。

### 32.1 为什么弹窗要拆组件

页面组件应该主要负责：

- 拉取数据。
- 保存状态。
- 调接口。
- 决定显示哪个弹窗。

弹窗组件应该主要负责：

- 弹窗标题。
- 表单结构。
- 按钮区域。
- 输入框、下拉框、文本域这些 UI。

前端类比：

- `AppConfigPage.tsx` 像页面容器。
- `GreetingConfigModal.tsx` 像一个业务表单组件。
- `AppModal.tsx` 像通用 Dialog 组件。

这样做的好处：

- 页面 JSX 不会越来越长。
- 回复校对和应用配置可以共用同一个弹窗壳。
- 二面讲代码时能说清楚“通用组件”和“业务组件”的边界。

### 32.2 新增通用弹窗组件

创建：

```txt
frontend/src/components/AppModal.tsx
```

作用：

- 统一弹窗遮罩。
- 统一标题栏。
- 统一底部按钮区域。
- 统一关闭逻辑。

它不关心业务字段，所以里面不会出现 `feedback`、`greeting`、`threshold` 这些业务词。

### 32.3 新增三个业务弹窗组件

创建：

```txt
frontend/src/components/FeedbackHandleModal.tsx
frontend/src/components/GreetingConfigModal.tsx
frontend/src/components/HotRecommendConfigModal.tsx
```

分别负责：

- `FeedbackHandleModal.tsx`：回复校对的处理弹窗。
- `GreetingConfigModal.tsx`：对话开场白配置弹窗。
- `HotRecommendConfigModal.tsx`：常问设置弹窗。

注意：

- 组件里只处理展示和输入事件。
- 保存接口仍然放在页面里。

前端类比：

- 这类似表单组件接收 `value`、`onChange`、`onSave`。
- 组件自己不直接请求接口，页面决定怎么保存。

### 32.4 当前后端配置字段

后端 `app_settings.config` 是 JSON。

对话开场白：

```ts
code: 'greeting'
config: {
  text: string
  questions: string[]
}
```

常问设置：

```ts
code: 'hot_recommend'
config: {
  threshold: number
}
```

保存仍然调用已有接口：

```txt
PATCH /api/settings/{code}
```

### 32.5 修改应用配置页

修改：

```txt
frontend/src/pages/AppConfigPage.tsx
```

增加两个弹窗组件导入：

```tsx
import GreetingConfigModal from '../components/GreetingConfigModal'
import HotRecommendConfigModal from '../components/HotRecommendConfigModal'
```

页面里新增状态：

```tsx
const [activeConfig, setActiveConfig] = useState<AppSetting | null>(null)
const [greetingText, setGreetingText] = useState('')
const [greetingQuestions, setGreetingQuestions] = useState<string[]>([])
const [hotThreshold, setHotThreshold] = useState(3)
const [savingConfig, setSavingConfig] = useState(false)
```

解释：

- `activeConfig`：当前打开哪个配置弹窗。
- `greetingText`：开场白文案。
- `greetingQuestions`：开场问题列表。
- `hotThreshold`：常问阈值。
- `savingConfig`：保存中状态。

### 32.6 为什么要写读取 config 的小工具

`config` 在前端类型里是：

```ts
Record<string, unknown>
```

意思是：

- 它是对象。
- key 是字符串。
- value 目前不知道具体类型。

所以不能直接把 `config.text` 当成 `string` 用。

需要先判断：

```tsx
const getStringConfig = (config: AppSetting['config'], key: string, fallback = '') => {
  const value = config[key]

  return typeof value === 'string' ? value : fallback
}
```

前端类比：

- 这就像你从接口拿到一个 `unknown`，用之前先做类型收窄。
- 判断后 TypeScript 才知道它确实是 `string`。

### 32.7 页面保存逻辑

保存配置时：

1. 根据当前打开的是 `greeting` 还是 `hot_recommend` 组装 `nextConfig`。
2. 调用 `updateSetting(activeConfig.code, ...)`。
3. 用接口返回的新数据更新当前页面列表。
4. 关闭弹窗。

核心规则：

- `greeting` 保存 `text` 和 `questions`。
- `hot_recommend` 保存 `threshold`。
- 保存时保留原来的 `enabled` 状态。

### 32.8 齿轮按钮逻辑

齿轮按钮只打开这两个弹窗：

```tsx
onClick={() => openConfigModal(item)}
```

`openConfigModal` 内部会判断：

```tsx
if (item.code !== 'greeting' && item.code !== 'hot_recommend') {
  return
}
```

所以：

- 点击 `对话开场白` 齿轮会打开弹窗。
- 点击 `常问设置` 齿轮会打开弹窗。
- 点击 `模型配置` 齿轮不会新增第四页。

### 32.9 修改回复校对页

修改：

```txt
frontend/src/pages/FeedbackReviewPage.tsx
```

把页面里的内联弹窗 JSX 替换成：

```tsx
{activeFeedback && (
  <FeedbackHandleModal
    feedback={activeFeedback}
    status={statusDraft}
    remark={remark}
    submitting={submitting}
    onStatusChange={setStatusDraft}
    onRemarkChange={setRemark}
    onClose={closeHandleDialog}
    onConfirm={() => void handleSubmitFeedback()}
  />
)}
```

解释：

- `FeedbackReviewPage.tsx` 继续负责保存接口。
- `FeedbackHandleModal.tsx` 只负责弹窗 UI。
- 这一步不改变功能，只调整代码结构。

### 32.10 样式拆分

新增：

```txt
frontend/src/styles/modal.css
```

放通用弹窗样式：

- `.app-modal-backdrop`
- `.app-modal`
- `.app-modal-header`
- `.app-modal-body`
- `.app-modal-footer`

继续使用：

```txt
frontend/src/styles/settings.css
frontend/src/styles/feedback.css
```

分别放业务样式：

- `settings.css`：开场问题、常问阈值这些配置弹窗内部样式。
- `feedback.css`：回复校对弹窗内部两栏布局、AI 回复高亮等样式。

最后在：

```txt
frontend/src/App.css
```

引入：

```css
@import './styles/modal.css';
```

### 32.11 验收方式

执行：

```bash
cd ~/Desktop/full-stack-demo/frontend
pnpm build
```

打开：

```txt
http://localhost:5173/settings
```

检查：

1. `/feedbacks` 点击 `处理`，能打开 `反馈处理` 弹窗。
2. 回复校对弹窗仍然是左侧问题和 AI 回复，右侧状态和备注。
3. `/settings` 点击 `对话开场白` 的齿轮，出现 `对话开场白` 弹窗。
4. 弹窗里有开场白文案、开场问题、添加开场问题、取消、保存。
5. 保存后 Network 里有 `PATCH /api/settings/greeting`。
6. 点击 `常问设置` 的齿轮，出现 `常问设置` 弹窗。
7. 弹窗里有问题频次阈值、取消、保存。
8. 保存后 Network 里有 `PATCH /api/settings/hot_recommend`。
9. 刷新页面后配置仍然保留。

你现在只做：

1. 创建 `frontend/src/components/AppModal.tsx`。
2. 创建三个业务弹窗组件。
3. 修改 `frontend/src/pages/AppConfigPage.tsx`。
4. 修改 `frontend/src/pages/FeedbackReviewPage.tsx`。
5. 创建 `frontend/src/styles/modal.css`。
6. 修改 `frontend/src/styles/settings.css` 和 `feedback.css`。
7. 执行 `pnpm build`。
8. 截图给我。

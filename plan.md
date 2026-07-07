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

### 32.12 当前状态更新

第 32 步代码已经在远程完成。

当前已经有：

```txt
frontend/src/components/AppModal.tsx
frontend/src/components/FeedbackHandleModal.tsx
frontend/src/components/GreetingConfigModal.tsx
frontend/src/components/HotRecommendConfigModal.tsx
```

并且已经有三个正式页面：

```txt
/chat
/settings
/feedbacks
```

当前先不做浏览器人工验收，继续推进下一步。

---

## 第 33 步：补齐 `demo.html` 的左侧主导航和页面外壳

这一轮只做一件事：

```txt
给 React 应用补一个公共 Layout，让三个页面都有和 demo.html 类似的左侧主导航。
```

当前 React 已经有三个页面：

```txt
ChatPage
AppConfigPage
FeedbackReviewPage
```

但是它们现在更像是三个独立页面。

而 `demo.html` 里不是这样。

`demo.html` 的结构更接近：

```txt
左侧系统菜单
  - 智能问数
  - 系统管理
    - 应用配置
  - 反馈管理
    - 回复校对

右侧页面内容
  - 当前页面自己的内容
```

所以第 33 步先补公共外壳。

这一步不做：

- 不改后端。
- 不改接口。
- 不改弹窗保存逻辑。
- 不新增模型配置页。
- 不接真实大模型。

只做：

- 新增公共 layout。
- 修改路由嵌套。
- 增加左侧菜单样式。
- 让 `/chat`、`/settings`、`/feedbacks` 都在同一个系统外壳里展示。

### 33.1 为什么先做 Layout

如果后面直接在三个页面里分别补左侧菜单，会出现重复代码。

例如三个页面都写一遍：

```txt
智能问数
应用配置
回复校对
```

后面要改菜单文案、图标、选中态，就要改三处。

更好的做法是抽一个公共 layout：

```txt
Layout
```

它只负责：

- 左侧主导航。
- 右侧内容区域。
- 当前路由高亮。

页面组件继续只负责自己的业务：

- `ChatPage` 负责聊天。
- `AppConfigPage` 负责配置卡片和配置弹窗。
- `FeedbackReviewPage` 负责反馈表格和处理弹窗。

前端类比：

```txt
Layout = 后台系统的页面骨架
Outlet = 当前路由页面插槽
```

### 33.2 新建 `frontend/src/layout/index.tsx`

创建文件：

```txt
frontend/src/layout/index.tsx
```

注意：

这里不放在：

```txt
frontend/src/components
```

而是放在：

```txt
frontend/src/layout
```

原因：

- `components` 更适合放页面里的可复用组件，比如弹窗、表格展示、业务小卡片。
- `layout` 更适合放路由级页面骨架，比如系统外壳、侧边栏、页面插槽。

这个文件用 `index.tsx`，这样导入时可以直接写：

```tsx
import Layout from './layout'
```

`Layout` 负责包住多个页面，不是某个页面内部的小组件，所以放在 `layout` 更准确。

写入：

```tsx
import { Bot, MessageCircleWarning, SlidersHorizontal } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import { NavLink, Outlet } from 'react-router-dom'

type NavItem = {
  label: string
  path: string
  Icon: LucideIcon
}

const primaryNavItems: NavItem[] = [
  {
    label: '智能问数',
    path: '/chat',
    Icon: Bot,
  },
]

const systemNavItems: NavItem[] = [
  {
    label: '应用配置',
    path: '/settings',
    Icon: SlidersHorizontal,
  },
]

const feedbackNavItems: NavItem[] = [
  {
    label: '回复校对',
    path: '/feedbacks',
    Icon: MessageCircleWarning,
  },
]

const renderNavItem = (item: NavItem) => {
  const { Icon } = item

  return (
    <NavLink className="side-nav-link" to={item.path} key={item.path}>
      <Icon size={17} strokeWidth={2.2} />
      <span>{item.label}</span>
    </NavLink>
  )
}

const Layout = () => {
  return (
    <div className="app-layout">
      <aside className="side-nav">
        <div className="side-brand">
          <div className="side-brand-logo">AI</div>
          <div>
            <strong>智能运营平台</strong>
            <span>Full Stack Demo</span>
          </div>
        </div>

        <nav className="side-nav-section" aria-label="主导航">
          {primaryNavItems.map(renderNavItem)}
        </nav>

        <nav className="side-nav-section" aria-label="系统管理">
          <p>系统管理</p>
          {systemNavItems.map(renderNavItem)}
        </nav>

        <nav className="side-nav-section" aria-label="反馈管理">
          <p>反馈管理</p>
          {feedbackNavItems.map(renderNavItem)}
        </nav>
      </aside>

      <section className="app-layout-content">
        <Outlet />
      </section>
    </div>
  )
}

export default Layout
```

这里重点理解：

```tsx
NavLink
```

是 `react-router-dom` 里的导航组件。

它比普通的 `a` 标签更适合 React 路由。

原因：

- 点击后不会整页刷新。
- 当前地址匹配时会自动带上 `active` class。

例如当前在：

```txt
/settings
```

那么：

```tsx
<NavLink to="/settings" />
```

最终会带上：

```txt
active
```

所以 CSS 里可以写：

```css
.side-nav-link.active
```

来控制选中态。

```tsx
Outlet
```

表示“子路由页面显示在这里”。

你可以理解成：

```txt
Layout 负责外框
Outlet 负责把当前页面塞进右侧内容区
```

### 33.3 修改 `frontend/src/App.tsx`

打开：

```txt
frontend/src/App.tsx
```

把路由改成嵌套路由。

目标结构：

```tsx
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import Layout from './layout'
import AppConfigPage from './pages/AppConfigPage'
import FeedbackReviewPage from './pages/FeedbackReviewPage'
import ChatPage from './pages/ChatPage'
import './App.css'

const App = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<Layout />}>
          <Route path="/" element={<Navigate to="/chat" replace />} />
          <Route path="/settings" element={<AppConfigPage />} />
          <Route path="/feedbacks" element={<FeedbackReviewPage />} />
          <Route path="/chat" element={<ChatPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}

export default App
```

这里的变化是：

原来每个页面直接挂在 `Routes` 下面。

现在它们都放进：

```tsx
<Route element={<Layout />}>
```

里面。

意思是：

```txt
这些页面共用 Layout。
```

### 33.4 修改 `frontend/src/styles/layout.css`

打开：

```txt
frontend/src/styles/layout.css
```

在文件顶部补充公共外壳样式：

```css
.app-layout {
  min-height: 100vh;
  display: grid;
  grid-template-columns: 224px minmax(0, 1fr);
  background: #f4f6fa;
  color: #172033;
}

.side-nav {
  min-height: 100vh;
  border-right: 1px solid #dbe3ef;
  background: #ffffff;
  padding: 18px 12px;
  box-sizing: border-box;
}

.side-brand {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 6px 8px 20px;
  border-bottom: 1px solid #eef2f7;
  margin-bottom: 16px;
}

.side-brand-logo {
  width: 34px;
  height: 34px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border-radius: 8px;
  background: #2563eb;
  color: #fff;
  font-size: 13px;
  font-weight: 800;
}

.side-brand strong,
.side-brand span {
  display: block;
}

.side-brand strong {
  color: #18365f;
  font-size: 15px;
}

.side-brand span {
  color: #98a2b3;
  font-size: 12px;
  margin-top: 2px;
}

.side-nav-section {
  display: grid;
  gap: 4px;
  margin-bottom: 18px;
}

.side-nav-section p {
  margin: 0 0 6px;
  padding: 0 10px;
  color: #98a2b3;
  font-size: 12px;
}

.side-nav-link {
  min-height: 36px;
  display: flex;
  align-items: center;
  gap: 8px;
  border-radius: 8px;
  color: #475467;
  padding: 0 10px;
  text-decoration: none;
  font-size: 14px;
  font-weight: 600;
}

.side-nav-link:hover {
  background: #f4f7fb;
  color: #2563eb;
}

.side-nav-link.active {
  background: #e8f0ff;
  color: #2563eb;
}

.app-layout-content {
  min-width: 0;
}
```

然后检查原来的：

```css
.app-page
```

不要再写：

```css
min-height: 100vh;
```

因为现在整屏高度由 `.app-layout` 负责。

可以调整成：

```css
.app-page {
  min-height: 100%;
  background: #f4f6fa;
  color: #172033;
  padding: 28px;
  box-sizing: border-box;
}
```

### 33.5 调整 `frontend/src/styles/chat.css`

打开：

```txt
frontend/src/styles/chat.css
```

当前 `ChatPage` 自己已经有一列“近30天记录”。

第 33 步加的是更外层的系统主导航。

所以最终结构会变成：

```txt
系统主导航
  + 智能问数页面内部的近30天记录
  + 聊天主区域
```

这和 `demo.html` 的结构更接近。

检查：

```css
.chat-page
```

里面的：

```css
min-height: 100vh;
```

这一行暂时保留。

原因：

- `chat-page` 是一个完整的业务工作区。
- 里面还有自己的左侧历史会话栏。
- 保留整屏高度可以让聊天区和输入框更稳定。

但要注意：

- 不要把 `.chat-sidebar` 当成系统主导航。
- `.chat-sidebar` 只是智能问数页面内部的历史记录。

### 33.6 本轮不处理移动端

这次不需要考虑移动端。

原因：

- 当前项目是面试用后台管理 Demo。
- `demo.html` 本身主要是桌面端后台布局。
- 第 33 步的目标是先对齐桌面端左侧主导航和页面外壳。

所以本轮不新增：

```css
@media (...)
```

先保持桌面端结构清晰。

### 33.7 执行构建

进入前端目录：

```bash
cd frontend
```

执行：

```bash
pnpm build
```

如果你当前终端没有 `pnpm`，说明 Node 版本管理环境没有加载。

可以先执行：

```bash
nvm use
```

或者重新打开一个终端。

### 33.8 本轮验收标准

完成第 33 步后，应该确认：

1. `frontend/src/layout/index.tsx` 已创建。
2. `frontend/src/App.tsx` 使用嵌套路由和 `Layout`。
3. `/chat`、`/settings`、`/feedbacks` 都能看到左侧主导航。
4. 当前路由对应菜单有选中态。
5. `/chat` 仍然保留“近30天记录”这一列。
6. `/settings` 和 `/feedbacks` 不再像孤立页面，而是在系统外壳中展示。
7. `pnpm build` 通过。

你现在只做：

1. 新建 `frontend/src/layout/index.tsx`。
2. 修改 `frontend/src/App.tsx`。
3. 修改 `frontend/src/styles/layout.css`。
4. 执行 `pnpm build`。
5. 把结果截图或构建输出发给我。

### 33.9 当前状态更新

第 33 步已经完成。

从截图看，当前 `/chat` 已经具备：

1. 左侧系统主导航。
2. 品牌区 `智能运营平台 / Full Stack Demo`。
3. 当前路由 `智能问数` 的选中态。
4. 智能问数页内部的 `近30天记录`。
5. 右侧聊天主区域。
6. 用户消息和 AI 回复内容正常展示。

当前结构已经符合这一层级：

```txt
Layout
  左侧系统主导航
  右侧当前页面
    ChatPage
      近30天记录
      聊天内容
```

这一步到这里可以继续往下走。

---

## 第 34 步：清理 Vite 默认全局样式，统一桌面后台基础样式

第 34 步先不继续加功能。

这一轮处理一个基础问题：

```txt
清理 frontend/src/index.css 里残留的 Vite 模板样式。
```

原因：

项目现在已经不是 Vite 默认欢迎页了。

但是 `index.css` 里还保留了一些模板样式，例如：

```css
#root {
  text-align: center;
  border-inline: 1px solid var(--border);
}
```

还有：

```css
h1 {
  font-size: 56px;
}
```

这些样式对后台系统页面不合适。

后台页面应该由：

```txt
layout.css
settings.css
feedback.css
chat.css
modal.css
```

这些业务样式控制。

`index.css` 只保留最基础的全局规则。

### 34.1 修改 `frontend/src/index.css`

打开：

```txt
frontend/src/index.css
```

把里面的 Vite 模板样式替换成：

```css
:root {
  font-family: system-ui, 'Segoe UI', Roboto, sans-serif;
  color: #172033;
  background: #f4f6fa;
  font-synthesis: none;
  text-rendering: optimizeLegibility;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

* {
  box-sizing: border-box;
}

html,
body,
#root {
  min-height: 100%;
}

body {
  min-width: 1280px;
  margin: 0;
  background: #f4f6fa;
}

button,
input,
textarea,
select {
  font: inherit;
}

button {
  color: inherit;
}
```

这里重点是：

```css
body {
  min-width: 1280px;
}
```

因为你已经明确说：

```txt
不需要考虑移动端
```

所以这里可以按桌面后台来处理。

桌面后台页如果窗口太窄，可以横向滚动，不需要在这一轮适配手机。

### 34.2 为什么要删全局 h1 / h2

原来的 `index.css` 里有：

```css
h1 {
  font-size: 56px;
}
```

这适合 Vite 欢迎页，不适合后台系统。

后台系统里不同位置的标题大小不一样：

- 页面标题一般 24px 左右。
- 卡片标题一般 16px 到 18px。
- 弹窗标题一般 18px。
- 聊天顶部标题一般 16px。

如果在 `index.css` 里全局写死：

```css
h1 {
  font-size: 56px;
}
```

后面每个页面都要写更多 CSS 去覆盖它。

所以更好的做法是：

```txt
index.css 不控制具体业务标题大小。
具体标题由页面样式文件控制。
```

### 34.3 为什么要删 `#root` 的居中和边框

原来的 Vite 模板适合居中的展示页，所以会写：

```css
#root {
  text-align: center;
  border-inline: 1px solid var(--border);
}
```

但现在项目是后台系统。

后台系统的布局由：

```css
.app-layout
```

控制。

如果 `#root` 继续控制居中、边框、flex 布局，容易和页面 layout 打架。

所以 `#root` 只保留：

```css
#root {
  min-height: 100%;
}
```

### 34.4 修改 `frontend/src/styles/layout.css`

打开：

```txt
frontend/src/styles/layout.css
```

如果文件底部还有移动端相关代码，例如：

```css
@media (max-width: 720px) {
  ...
}
```

这一轮可以删掉。

原因：

- 当前项目不考虑移动端。
- 先保持桌面端样式清晰。
- 后续也不用因为窄屏去调整页面结构。

保留桌面端规则即可。

### 34.5 执行构建

进入前端目录：

```bash
cd frontend
```

执行：

```bash
pnpm build
```

### 34.6 本轮验收标准

完成第 34 步后，应该确认：

1. `frontend/src/index.css` 已经没有 Vite 欢迎页残留样式。
2. `#root` 不再控制居中、边框、flex 布局。
3. 全局不再写死 `h1`、`h2` 的业务字体大小。
4. `body` 设置了桌面后台最小宽度。
5. `layout.css` 里不再为了移动端写额外 `@media`。
6. `/chat` 页面视觉没有明显变化。
7. `pnpm build` 通过。

你现在只做：

1. 修改 `frontend/src/index.css`。
2. 清理 `frontend/src/styles/layout.css` 里移动端相关的 `@media`。
3. 执行 `pnpm build`。
4. 把构建结果或页面截图发给我。

### 34.7 当前状态更新

第 34 步已经完成。

当前已经完成：

1. `frontend/src/index.css` 清掉了 Vite 默认欢迎页样式。
2. 全局不再写死 `h1`、`h2` 的业务字号。
3. `#root` 不再控制居中、边框和 flex 布局。
4. `layout.css` 已经去掉移动端 `@media`。

下一步继续做样式还原。

---

## 第 35 步：按原型还原左侧侧边栏样式

这一轮只处理左侧侧边栏。

不处理：

- AI 回复数据展示。
- 聊天表格格式。
- 应用配置卡片。
- 回复校对表格。
- 后端接口。

原因：

当前截图里最明显的不一致是侧边栏。

原型里的侧边栏结构是：

```txt
智能问数

系统管理 v
  应用配置

反馈管理 v
  回复校对
```

而不是：

```txt
品牌区
智能问数
系统管理
应用配置
反馈管理
回复校对
```

所以第 35 步先把侧边栏还原到原型风格。

### 35.1 修改 `frontend/src/layout/index.tsx`

调整方向：

1. 去掉顶部品牌区 `智能运营平台 / Full Stack Demo`。
2. `智能问数` 作为第一个大号主菜单。
3. `系统管理` 作为分组标题，不是普通小标题。
4. `应用配置` 作为系统管理下面的缩进子菜单。
5. `反馈管理` 作为分组标题。
6. `回复校对` 作为反馈管理下面的缩进子菜单。

分组标题右侧用 CSS 画下拉箭头即可，不需要再引入额外图标。

### 35.2 修改 `frontend/src/styles/layout.css`

样式目标：

1. `.side-nav` 保持白底和右边框。
2. `/chat` 选中时，`智能问数` 是大号蓝色圆角块。
3. 分组标题字号更大，接近原型里的 `系统管理`、`反馈管理`。
4. 子菜单缩进，接近原型里的 `应用配置`、`回复校对`。
5. `/settings` 或 `/feedbacks` 选中时，子菜单用浅蓝背景和蓝色文字提示当前页。

注意：

`智能问数` 不能永远是蓝色。

只有当前路由是：

```txt
/chat
```

时才是蓝色。

当前路由是：

```txt
/settings
```

或：

```txt
/feedbacks
```

时，对应的子菜单应该有选中态。

### 35.3 本轮验收标准

完成第 35 步后，应该确认：

1. 侧边栏顶部不再显示品牌区。
2. `/chat` 页面里 `智能问数` 是蓝色大号主菜单。
3. `系统管理` 和 `反馈管理` 是分组标题，并且右侧有下拉箭头。
4. `应用配置` 和 `回复校对` 是缩进子菜单。
5. 切到 `/settings` 时，`应用配置` 有选中态。
6. 切到 `/feedbacks` 时，`回复校对` 有选中态。
7. `pnpm build` 通过。

你现在只做：

1. 修改 `frontend/src/layout/index.tsx`。
2. 修改 `frontend/src/styles/layout.css`。
3. 执行 `pnpm build`。
4. 把侧边栏截图发给我。

### 35.4 当前状态更新

第 35 步代码已经完成。

当前已调整：

1. 去掉侧边栏顶部品牌区。
2. `智能问数` 改成大号主菜单。
3. `系统管理` 改成分组标题。
4. `应用配置` 改成系统管理下的缩进子菜单。
5. `反馈管理` 改成分组标题。
6. `回复校对` 改成反馈管理下的缩进子菜单。
7. `/chat` 选中时，`智能问数` 才显示蓝色大块。
8. `/settings` 和 `/feedbacks` 选中时，对应子菜单显示浅蓝选中态。

已验证：

```bash
node_modules/.bin/tsc -b
node_modules/.bin/vite build
```

结果：通过。


### 35.5 二次修正：侧边栏尺寸和换行问题

第一次侧边栏还原后，出现了明显问题：

```txt
菜单文字被挤到两行，尺寸和原型不一致。
```

原因：

- 侧边栏总宽度仍然是桌面后台的固定宽度。
- 但主菜单、分组标题、子菜单的字号和左右 padding 拉得太大。
- 图标、文字、间距加起来超过了侧边栏可用宽度。

已修正：

1. 保持侧边栏宽度不乱扩。
2. 收回主菜单字号、图标尺寸和左右 padding。
3. 收回分组标题字号和箭头尺寸。
4. 收回子菜单字号、图标尺寸和缩进距离。
5. 给菜单文字统一增加：

```css
white-space: nowrap;
overflow: hidden;
text-overflow: ellipsis;
```

这样可以避免：

```txt
智能问数
应用配置
反馈管理
回复校对
```

这些四字菜单再被拆成两行。

再次验证：

```bash
node_modules/.bin/tsc -b
node_modules/.bin/vite build
```

结果：通过。


### 35.6 三次修正：按 `demo.html` 原始侧边栏 CSS 对齐

再次对照 `demo.html` 后确认，原型侧边栏真实尺寸不是 20px 或 18px 字号，而是：

```css
.sidebar-menu .menu-item {
  height: var(--h-nav); /* 48px */
  font-size: 16px;
  font-weight: 500;
  gap: 12px;
  padding: 0 16px;
  margin: 0 8px;
  border-radius: 6px;
}

.sidebar-menu .sub-menu .menu-item {
  height: 40px;
  padding-left: 36px;
  font-size: 16px;
  font-weight: 400;
  gap: 8px;
}
```

所以本次已经把 React 侧边栏回调到这组原型数值：

1. 主菜单高度：`48px`。
2. 主菜单字号：`16px`。
3. 主菜单字重：`500`，选中时 `600`。
4. 主菜单左右边距：`margin: 0 8px`。
5. 主菜单内边距：`padding: 0 16px`。
6. 主菜单圆角：`6px`。
7. 子菜单高度：`40px`。
8. 子菜单字号：`16px`。
9. 子菜单字重：`400`。
10. 子菜单缩进：`padding-left: 36px`。
11. 子菜单图标宽度接近原型：`14px`。

这次不再按截图目测放大字号，而是以 `demo.html` 的真实 CSS 为准。

再次验证：

```bash
node_modules/.bin/tsc -b
node_modules/.bin/vite build
```

结果：通过。

### 35.7 补充交互：父级菜单支持折叠和展开

本次补的是侧边栏里“带子节点”的父级菜单交互。

涉及父级：

1. `系统管理`
2. `反馈管理`

原来这两个父级只是静态展示：

```tsx
<div className="side-nav-group-title">...</div>
```

所以点击父级不会发生任何变化。

现在改成：

```tsx
<button
  className={`side-nav-group-title ${openGroups.system ? "is-open" : ""}`}
  type="button"
  aria-expanded={openGroups.system}
  onClick={() => toggleGroup("system")}
>
  ...
</button>
```

核心逻辑：

```tsx
const [openGroups, setOpenGroups] = useState<Record<NavGroupKey, boolean>>({
  system: true,
  feedback: true,
});
```

含义：

1. 页面初始时，`系统管理` 和 `反馈管理` 默认展开。
2. 点击父级标题时，对应分组在展开和收起之间切换。
3. 展开时渲染子菜单。
4. 收起时不渲染子菜单。
5. 父级使用 `button`，并加上 `aria-expanded`，语义上比 `div` 更适合点击交互。

同时补了样式：

1. 重置 `button` 默认边框、背景、字体。
2. 保持父级菜单仍然是 `48px` 高度、`16px` 字号。
3. 箭头在收起和展开时改变方向。
4. 子菜单用 `.side-nav-submenu` 包起来，后续如果要加动画也更方便。

已验证：

```bash
node_modules/.bin/tsc -b
node_modules/.bin/vite build
```

结果：通过。

### 35.8 补充动画：子菜单收起时逐渐消失

第 35.7 里最初的写法是：

```tsx
{openGroups.system ? (
  <div className="side-nav-submenu">...</div>
) : null}
```

这种写法的问题是：

```txt
收起时，子菜单 DOM 会被立刻删除。
```

所以浏览器没有机会播放“逐渐消失”的动画。

本次改成：

```tsx
<div
  className={`side-nav-submenu ${openGroups.system ? "is-open" : ""}`}
  aria-hidden={!openGroups.system}
>
  <div className="side-nav-submenu-content">...</div>
</div>
```

也就是：

1. 子菜单一直保留在 DOM 中。
2. 展开时加 `.is-open`。
3. 收起时去掉 `.is-open`。
4. 通过 CSS 控制高度、透明度和位移过渡。

核心 CSS：

```css
.side-nav-submenu {
  display: grid;
  grid-template-rows: 0fr;
  opacity: 0;
  transform: translateY(-4px);
  visibility: hidden;
  transition:
    grid-template-rows 0.18s ease,
    opacity 0.16s ease,
    transform 0.18s ease,
    visibility 0s linear 0.18s;
}

.side-nav-submenu.is-open {
  grid-template-rows: 1fr;
  opacity: 1;
  transform: translateY(0);
  visibility: visible;
}
```

这里用 `grid-template-rows: 0fr -> 1fr`，是为了让高度可以平滑收起和展开。

同时用：

```css
.side-nav-submenu-content {
  min-height: 0;
  overflow: hidden;
}
```

是为了让内部内容真的能被压缩到 `0` 高度。

已验证：

```bash
node_modules/.bin/tsc -b
node_modules/.bin/vite build
```

结果：通过。

---

## 第 36 步：按原型补顶部 Nav Bar

这一轮只补顶部 nav bar。

参考 `demo.html` 里的原型结构：

```html
<div class="top-bar">
  <div class="brand"><i class="fas fa-chart-line"></i> 经管之星</div>
  <div class="top-right">
    <div class="icon-btn" title="消息通知">
      <i class="fas fa-bell"></i>
      <span class="badge-dot"></span>
    </div>
    <div class="avatar">管</div>
  </div>
</div>
```

原型里的真实 CSS 关键值：

```css
.top-bar {
  height: 56px;
  min-height: 56px;
  background: var(--surface);
  display: flex;
  align-items: center;
  padding: 0 24px;
  justify-content: space-between;
  border-bottom: 1px solid var(--border);
}

.top-bar .brand {
  display: flex;
  align-items: center;
  gap: 8px;
  color: var(--primary);
  font-size: 15px;
  font-weight: 600;
  letter-spacing: .5px;
}
```

所以第 36 步不要凭感觉设计新的顶部栏，直接按原型补。

### 36.1 当前布局为什么要调整

当前 React 的 layout 结构大概是：

```txt
app-layout
  side-nav
  app-layout-content
```

它是左右两列。

但原型是：

```txt
app-layout
  top-bar
  body
    sidebar
    main
```

也就是：

```txt
顶部 nav bar 横跨整页
下面再分左侧菜单和右侧内容
```

所以第 36 步要把结构调整成：

```txt
app-layout
  top-bar
  app-body
    side-nav
    app-layout-content
```

注意：

顶部栏高度是 `56px`。

下面主体区域高度应该是：

```css
calc(100vh - 56px)
```

否则页面会比视口多出一个顶部栏高度，容易出现不必要的滚动。

### 36.2 修改 `frontend/src/layout/index.tsx`

打开：

```txt
frontend/src/layout/index.tsx
```

增加顶部栏。

建议使用 `lucide-react` 里已确认存在的图标：

```tsx
ChartLine
Bell
User
GitBranch
LogOut
```

目标结构：

```tsx
import { useState } from 'react'
import {
  Bell,
  Bot,
  ChartLine,
  CircleAlert,
  Flag,
  GitBranch,
  LogOut,
  Settings,
  SlidersHorizontal,
  User,
} from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import { NavLink, Outlet } from 'react-router-dom'
```

`Layout` 里增加用户菜单状态：

```tsx
const [userMenuOpen, setUserMenuOpen] = useState(false)
```

然后结构改成：

```tsx
const Layout = () => {
  const [userMenuOpen, setUserMenuOpen] = useState(false)

  return (
    <div className="app-layout">
      <header className="top-bar">
        <div className="top-brand">
          <ChartLine size={18} strokeWidth={2.4} />
          <span>经管之星</span>
        </div>

        <div className="top-right">
          <button className="top-icon-button" type="button" title="消息通知">
            <Bell size={18} strokeWidth={2.2} />
            <span className="badge-dot" />
          </button>

          <div className="top-avatar-wrap">
            <button
              className="top-avatar"
              type="button"
              onClick={() => setUserMenuOpen(open => !open)}
            >
              管
            </button>

            {userMenuOpen && (
              <div className="top-dropdown">
                <button type="button">
                  <User size={15} />
                  个人信息
                </button>
                <div className="top-dropdown-version">
                  <GitBranch size={15} />
                  v1.0.0
                </div>
                <button className="danger" type="button">
                  <LogOut size={15} />
                  退出登录
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      <div className="app-body">
        <aside className="side-nav">
          ...
        </aside>

        <section className="app-layout-content">
          <Outlet />
        </section>
      </div>
    </div>
  )
}
```

注意：

- `top-bar` 放在 `side-nav` 外面。
- `side-nav` 和 `app-layout-content` 放在 `app-body` 里面。
- 不要把顶部栏写进某一个页面里。
- 顶部栏属于 layout，不属于 `ChatPage`、`AppConfigPage` 或 `FeedbackReviewPage`。

### 36.3 修改 `frontend/src/styles/layout.css`

打开：

```txt
frontend/src/styles/layout.css
```

把当前 `.app-layout` 从左右 grid 改成上下结构：

```css
.app-layout {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  background: #ffffff;
  color: #172033;
}

.top-bar {
  height: 56px;
  min-height: 56px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  border-bottom: 1px solid #e5e7eb;
  background: #ffffff;
  padding: 0 24px;
}

.top-brand {
  display: flex;
  align-items: center;
  gap: 8px;
  color: #2f54eb;
  font-size: 15px;
  font-weight: 600;
  letter-spacing: 0.5px;
}

.top-right {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-left: auto;
}

.top-icon-button {
  width: 40px;
  height: 40px;
  position: relative;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border: 0;
  border-radius: 999px;
  background: transparent;
  color: #9ca3af;
  cursor: pointer;
}

.top-icon-button:hover {
  background: #f3f4f6;
  color: #4b5563;
}

.badge-dot {
  width: 6px;
  height: 6px;
  position: absolute;
  top: 10px;
  right: 10px;
  border: 2px solid #ffffff;
  border-radius: 999px;
  background: #ef4444;
}

.top-avatar-wrap {
  position: relative;
}

.top-avatar {
  width: 36px;
  height: 36px;
  border: 0;
  border-radius: 999px;
  background: #2f54eb;
  color: #ffffff;
  font-size: 15px;
  font-weight: 600;
  cursor: pointer;
}

.top-avatar:hover {
  box-shadow: 0 0 0 3px #e0e7ff;
}

.top-dropdown {
  min-width: 160px;
  position: absolute;
  top: 44px;
  right: 0;
  z-index: 20;
  overflow: hidden;
  border: 1px solid #e5e7eb;
  border-radius: 12px;
  background: #ffffff;
  box-shadow: 0 8px 24px rgb(0 0 0 / 12%);
  padding: 6px 0;
}

.top-dropdown button,
.top-dropdown-version {
  width: 100%;
  height: 40px;
  display: flex;
  align-items: center;
  gap: 8px;
  border: 0;
  background: transparent;
  color: #4b5563;
  padding: 0 16px;
  font-size: 15px;
  text-align: left;
}

.top-dropdown button {
  cursor: pointer;
}

.top-dropdown button:hover {
  background: #f3f4f6;
  color: #111827;
}

.top-dropdown-version {
  color: #9ca3af;
  cursor: default;
}

.top-dropdown .danger {
  border-top: 1px solid #e5e7eb;
  color: #ef4444;
}

.app-body {
  height: calc(100vh - 56px);
  min-height: 0;
  display: grid;
  grid-template-columns: 224px minmax(0, 1fr);
  overflow: hidden;
  background: #f4f6fa;
}
```

然后调整侧边栏：

```css
.side-nav {
  min-height: 0;
  height: 100%;
  border-right: 1px solid #dbe3ef;
  background: #ffffff;
  padding: 8px 0;
  box-sizing: border-box;
}
```

再调整右侧内容：

```css
.app-layout-content {
  min-width: 0;
  min-height: 0;
  overflow: auto;
}
```

### 36.4 修改 `frontend/src/styles/chat.css`

打开：

```txt
frontend/src/styles/chat.css
```

当前如果还有：

```css
.chat-page {
  min-height: 100vh;
}
```

需要改成：

```css
.chat-page {
  height: 100%;
  min-height: 0;
}
```

原因：

现在顶部栏已经占用了 `56px`。

如果聊天页继续用：

```css
min-height: 100vh;
```

整个页面就会变成：

```txt
56px top-bar + 100vh chat-page
```

会多出一截高度。

所以聊天页应该占满右侧内容区，而不是重新占满整个浏览器高度。

### 36.5 本轮不做的事

第 36 步只补顶部栏。

不做：

- 不做真实通知列表。
- 不做真实登录退出。
- 不改后端鉴权。
- 不做顶部栏响应式。
- 不改三个页面业务逻辑。

用户头像下拉只是原型 UI 还原。

### 36.6 执行构建

进入前端目录：

```bash
cd frontend
```

执行：

```bash
pnpm build
```

### 36.7 本轮验收标准

完成第 36 步后，应该确认：

1. 页面顶部出现 `56px` 高度的 nav bar。
2. 左侧显示 `经管之星` 品牌。
3. 右侧显示通知按钮和用户头像 `管`。
4. 点击用户头像可以看到 `个人信息 / v1.0.0 / 退出登录`。
5. 侧边栏从顶部栏下方开始，而不是顶到浏览器最上面。
6. `/chat` 页面没有因为顶部栏多出额外纵向滚动。
7. `/settings` 和 `/feedbacks` 仍然正常显示。
8. `pnpm build` 通过。

你现在只做：

1. 修改 `frontend/src/layout/index.tsx`。
2. 修改 `frontend/src/styles/layout.css`。
3. 修改 `frontend/src/styles/chat.css`。
4. 执行 `pnpm build`。
5. 把顶部 nav bar 截图发给我。

---

### 36.8 当前状态更新：顶部 Nav Bar 已完成

用户反馈：

```txt
顶部 navbar 已经改完了。
```

所以后续不再把“补顶部 Nav Bar”当作下一步。

当前布局已经进入：

```txt
top-bar
app-body
  side-nav
  app-layout-content
```

这种结构。

接下来优先处理聊天页的滚动问题。

---

## 第 37 步：修复聊天页滚动结构，让输入框始终停在底部

这一轮只修聊天页滚动。

当前问题：

```txt
对话内容区和左侧历史记录区跟着整个页面一起滚动。
消息一多时，输入框被挤到最底下，需要滚动页面才能看到。
```

目标效果：

```txt
整个聊天页面本身不滚动。
左侧历史记录自己滚动。
右侧消息内容自己滚动。
顶部会话标题固定在右侧顶部。
底部输入框始终显示在右侧底部。
```

注意：

这里不要用：

```css
position: fixed;
```

原因：

- 输入框属于右侧聊天区域，不应该脱离 layout。
- 如果用 `fixed`，它会相对浏览器视口定位，容易盖住侧边栏、顶部栏或其他页面。
- 更好的做法是让 `chat-main` 自己成为一个固定高度的三行布局：

```txt
chat-main
  chat-header    固定高度
  chat-content   占剩余空间，并且自己滚动
  chat-input-bar 固定在底部
```

### 37.1 先理解为什么现在会一起滚

当前聊天页大致结构是：

```tsx
<main className="chat-page">
  <aside className="chat-sidebar">
    <div className="chat-sidebar-header">近30天记录</div>
    <button className="new-chat-button">开启新对话</button>
    <nav className="chat-history">...</nav>
  </aside>

  <section className="chat-main">
    <header className="chat-header">...</header>
    <div className="chat-content">...</div>
    <div className="chat-input-bar">...</div>
  </section>
</main>
```

这个结构本身是对的。

真正的问题通常出在 CSS 的高度链路没有锁住：

```txt
app-body
app-layout-content
chat-page
chat-sidebar
chat-main
chat-content
```

这些父级里，只要有一层没有：

```css
height: 100%;
min-height: 0;
overflow: hidden;
```

子级的 `overflow: auto` 就可能失效。

结果就是：

```txt
不是 chat-content 自己滚，
而是外层页面整体滚。
```

### 37.2 修改 `frontend/src/styles/layout.css`

打开：

```txt
frontend/src/styles/layout.css
```

确认外层主区域是固定在视口内的。

如果现在是顶部栏结构，重点检查：

```css
.app-layout {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

.app-body {
  height: calc(100vh - 56px);
  min-height: 0;
  display: grid;
  grid-template-columns: 224px minmax(0, 1fr);
  overflow: hidden;
}
```

然后把右侧内容容器改成不负责滚动：

```css
.app-layout-content {
  min-width: 0;
  min-height: 0;
  overflow: hidden;
}
```

原因：

`app-layout-content` 是所有页面的容器。

如果这里写：

```css
overflow: auto;
```

那么聊天页很容易变成“整个右侧页面一起滚”，输入框就会被内容往下挤。

聊天页应该由内部的 `.chat-content` 和 `.chat-history` 各自滚动。

### 37.3 修改 `frontend/src/styles/chat.css`：锁住聊天页本身

打开：

```txt
frontend/src/styles/chat.css
```

先确认 `.chat-page`：

```css
.chat-page {
  height: 100%;
  min-height: 0;
  display: grid;
  grid-template-columns: 200px minmax(0, 1fr);
  overflow: hidden;
  background: #f4f6fa;
  color: #172033;
}
```

关键是：

```css
height: 100%;
min-height: 0;
overflow: hidden;
```

含义：

1. `height: 100%`：聊天页只占满右侧内容区域。
2. `min-height: 0`：允许里面的 grid 子项被压缩。
3. `overflow: hidden`：聊天页自己不滚动，把滚动交给内部区域。

### 37.4 修改左侧历史记录区：只有历史列表滚动

当前左侧结构是：

```txt
chat-sidebar
  chat-sidebar-header
  new-chat-button
  chat-history
```

目标是：

```txt
标题和新建按钮固定
只有 chat-history 滚动
```

建议改成：

```css
.chat-sidebar {
  min-height: 0;
  display: grid;
  grid-template-rows: auto auto minmax(0, 1fr);
  border-right: 1px solid #dbe3ef;
  background: #f8fbff;
  padding: 18px 12px;
  box-sizing: border-box;
  overflow: hidden;
}

.chat-history {
  min-height: 0;
  display: grid;
  align-content: start;
  gap: 6px;
  margin-top: 12px;
  overflow: auto;
}
```

注意：

`chat-history` 需要：

```css
align-content: start;
```

否则当历史记录比较少时，grid 容器有可能把子项分布得不自然。

### 37.5 修改右侧主聊天区：消息滚动，输入框固定在底部

当前右侧结构是：

```txt
chat-main
  chat-header
  chat-content
  chat-input-bar
```

目标 CSS：

```css
.chat-main {
  min-width: 0;
  min-height: 0;
  display: grid;
  grid-template-rows: 48px minmax(0, 1fr) auto;
  overflow: hidden;
  background: linear-gradient(90deg, #fff 0%, #fff 84%, #eef1f6 100%);
}
```

关键是：

```css
grid-template-rows: 48px minmax(0, 1fr) auto;
```

含义：

1. 第一行 `48px`：会话标题栏固定高度。
2. 第二行 `minmax(0, 1fr)`：消息区吃掉剩余空间。
3. 第三行 `auto`：输入框按自身高度显示在底部。

然后消息内容区：

```css
.chat-content {
  min-height: 0;
  overflow: auto;
  padding: 24px 36px 24px;
  box-sizing: border-box;
}
```

这里要把原来的底部大 padding 收回来。

如果现在是：

```css
padding: 24px 36px 96px;
```

可以改成：

```css
padding: 24px 36px 24px;
```

原因：

以前可能是为了给底部输入框留空间。

但现在输入框已经是 grid 的第三行，不会覆盖消息内容，所以不需要额外留 `96px`。

### 37.6 输入框保持在底部，不被内容挤走

当前输入框可以继续作为 `.chat-main` 的第三行。

建议只微调：

```css
.chat-input-bar {
  width: min(640px, calc(100% - 72px));
  display: grid;
  grid-template-columns: minmax(0, 1fr) 42px;
  gap: 8px;
  justify-self: center;
  margin: 0 0 18px;
  border: 1px solid #cbd6e6;
  border-radius: 999px;
  background: #fff;
  padding: 7px 8px 7px 18px;
  box-shadow: 0 10px 30px rgba(37, 99, 235, 0.12);
}
```

重点是：

```css
margin: 0 0 18px;
```

不要让它依赖外层页面滚动。

如果想保持水平居中，继续用：

```css
justify-self: center;
```

### 37.7 本轮不做的事

这一轮只修滚动结构。

不做：

- 不改聊天接口。
- 不改消息发送逻辑。
- 不改回答数据渲染。
- 不改侧边栏主菜单。
- 不改顶部 Nav Bar。
- 不做移动端适配。

### 37.8 执行构建

进入前端目录：

```bash
cd frontend
```

执行：

```bash
pnpm build
```

如果当前环境里 `pnpm` 不可用，也可以用本地脚本：

```bash
node_modules/.bin/tsc -b
node_modules/.bin/vite build
```

### 37.9 本轮验收标准

完成第 37 步后，应该确认：

1. 页面整体不再因为消息变多而滚动。
2. 左侧 `近30天记录` 和 `开启新对话` 保持可见。
3. 左侧历史记录多的时候，只有 `.chat-history` 自己滚动。
4. 右侧顶部会话标题保持可见。
5. 右侧消息多的时候，只有 `.chat-content` 自己滚动。
6. 底部输入框始终显示在聊天区域底部。
7. 输入框不会被消息内容挤到页面最底下。
8. `/settings`、`/feedbacks` 页面不被这次改动破坏。
9. 构建通过。

你现在只做：

1. 修改 `frontend/src/styles/layout.css`。
2. 修改 `frontend/src/styles/chat.css`。
3. 不改 `ChatPage.tsx`，除非 CSS 无法解决。
4. 执行构建。
5. 把聊天页滚动修复后的截图发给我。

### 37.10 当前状态更新：滚动问题已由用户完成

用户反馈：

```txt
我以我自己的经验把滚动修好了，跟你的不太一样，但是你要按我的来，不要动我的代码。
```

所以第 37 步后续不再按上面 `37.2 ~ 37.6` 的建议 CSS 重新改。

当前原则：

1. 滚动问题以用户当前实现为准。
2. 后续不要为了“贴合 plan 旧写法”回滚或重写用户已经改好的滚动代码。
3. 如果后续新增展开/收起功能需要动到布局，只做最小增量，不破坏现有滚动结构。
4. 如果发现 plan 旧方案和当前源码不一致，以当前源码为准，再把 plan 补充说明清楚。

当前滚动验收状态：

1. 输入框已经能保持在页面底部。
2. 对话内容和历史记录滚动问题已经由用户自行修复。
3. 下一步不再处理滚动，而是处理对话界面里缺失的展开/收起交互。

---

## 第 38 步：按原型补齐对话界面的展开/收起交互

这一轮只做截图红圈里的展开/收起。

当前项目已经改成 Flex 布局，本轮全程按 Flex 方案实现。

本轮只做 2 个功能按钮：

1. 最左侧系统主导航底部按钮：收起/展开系统主导航。
2. 对话历史栏开关按钮：同一个按钮互斥出现在两个位置。

对话历史栏开关按钮的交互规则：

```txt
历史记录栏展开时：按钮显示在“近30天记录”顶部右侧。
点击后：历史记录栏收起。

历史记录栏收起时：按钮显示在对话容器标题栏左侧。
点击后：历史记录栏展开。
```

也就是说，历史栏开关不是两个常驻按钮，而是一个功能按钮在两个位置互斥出现。

原型里的系统主导航关键实现：

```css
.sidebar {
  width: 224px;
  min-width: 224px;
  display: flex;
  flex-direction: column;
  height: calc(100vh - 56px);
  overflow: hidden;
  transition: width .25s, min-width .25s;
}

.sidebar.collapsed {
  width: 60px;
  min-width: 60px;
}

.sidebar.collapsed .menu-item span,
.sidebar.collapsed .menu-item .arrow {
  display: none;
}

.sidebar.collapsed .sub-menu {
  max-height: 0 !important;
  overflow: hidden;
}

.sidebar.collapsed .sidebar-footer {
  justify-content: center;
}

.sidebar.collapsed .sidebar-footer .sidebar-toggle {
  transform: rotate(180deg);
}
```

原型里的行为是切换 collapsed class。React 里不用直接操作 DOM，统一用 state 控制 class。

### 38.1 本轮边界

这一轮不动第 37 步滚动实现。

不改：

```txt
chat-content 的滚动逻辑
chat-history 的滚动逻辑
chat-input-bar 的底部定位逻辑
app-layout-content 的 overflow 方案
```

只改：

```txt
收起状态
展开状态
宽度动画
按钮图标
按钮位置
文字隐藏
```

### 38.2 系统主导航收起/展开

修改文件：

```txt
frontend/src/layout/index.tsx
frontend/src/styles/layout.css
```

状态：

```tsx
const [mainNavCollapsed, setMainNavCollapsed] = useState(false)
```

结构：

```tsx
<aside className={`side-nav ${mainNavCollapsed ? "is-collapsed" : ""}`}>
  ...
  <div className="side-nav-footer">
    <button
      className="side-nav-collapse-button"
      type="button"
      title={mainNavCollapsed ? "展开侧边栏" : "收起侧边栏"}
      onClick={() => setMainNavCollapsed(collapsed => !collapsed)}
    >
      <ChevronLeft size={18} strokeWidth={2.2} />
    </button>
  </div>
</aside>
```

`.app-body` 使用 Flex：

```css
.app-body {
  height: calc(100vh - 56px);
  min-height: 0;
  display: flex;
  overflow: hidden;
  background: #f4f6fa;
}

.side-nav {
  flex: 0 0 224px;
  width: 224px;
  min-width: 224px;
  min-height: 0;
  height: 100%;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  border-right: 1px solid #dbe3ef;
  background: #ffffff;
  padding: 8px 0;
  box-sizing: border-box;
  transition:
    flex-basis 0.25s ease,
    width 0.25s ease,
    min-width 0.25s ease;
}

.side-nav.is-collapsed {
  flex-basis: 60px;
  width: 60px;
  min-width: 60px;
}

.app-layout-content {
  flex: 1 1 auto;
  min-width: 0;
  min-height: 0;
  overflow: hidden;
}
```

收起后的菜单表现：

```css
.side-nav.is-collapsed .side-nav-link,
.side-nav.is-collapsed .side-nav-group-title {
  justify-content: center;
  margin: 0 4px;
  padding: 0 8px;
}

.side-nav.is-collapsed .side-nav-link span,
.side-nav.is-collapsed .side-nav-group-title span,
.side-nav.is-collapsed .side-nav-group-title i {
  display: none;
}

.side-nav.is-collapsed .side-nav-submenu {
  max-height: 0;
  opacity: 0;
  pointer-events: none;
  visibility: hidden;
}

.side-nav-footer {
  margin-top: auto;
  padding: 8px 12px;
  border-top: 1px solid #e5e7eb;
  display: flex;
  justify-content: flex-end;
}

.side-nav-collapse-button {
  width: 32px;
  height: 32px;
  border: 0;
  border-radius: 6px;
  background: transparent;
  color: #8a94a6;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  transition:
    background 0.15s,
    color 0.15s,
    transform 0.25s ease;
}

.side-nav-collapse-button:hover {
  background: #f3f4f6;
  color: #172033;
}

.side-nav.is-collapsed .side-nav-footer {
  justify-content: center;
}

.side-nav.is-collapsed .side-nav-collapse-button {
  transform: rotate(180deg);
}
```

### 38.3 对话历史栏互斥开关

修改文件：

```txt
frontend/src/pages/ChatPage.tsx
frontend/src/styles/chat.css
```

状态：

```tsx
const [historyCollapsed, setHistoryCollapsed] = useState(false)
```

图标统一用用户截图里的样式含义。

两个位置的图标方向要相反：

```txt
历史记录栏展开时：按钮在历史栏顶部右侧，表示“把历史栏收起来”。
历史记录栏收起时：按钮在对话标题栏左侧，表示“把历史栏展开回来”。
```

所以第二个位置的图标需要做 180 度镜像。

```tsx
<PanelLeftClose size={18} strokeWidth={2.2} />
<PanelLeftOpen size={18} strokeWidth={2.2} />
```

结构：

```tsx
<main className={`chat-page ${historyCollapsed ? "is-history-collapsed" : ""}`}>
  <aside className="chat-sidebar" aria-hidden={historyCollapsed}>
    <div className="chat-sidebar-header">
      <strong>近30天记录</strong>

      {!historyCollapsed && (
        <button
          className="chat-history-toggle-button"
          type="button"
          title="收起历史记录"
          onClick={() => setHistoryCollapsed(true)}
        >
          <PanelLeftClose size={18} strokeWidth={2.2} />
        </button>
      )}
    </div>

    ...
  </aside>

  <section className="chat-main">
    <header className="chat-header">
      <div className="chat-header-left">
        {historyCollapsed && (
          <button
            className="chat-history-toggle-button is-mirrored"
            type="button"
            title="展开历史记录"
            onClick={() => setHistoryCollapsed(false)}
          >
            <PanelLeftOpen size={18} strokeWidth={2.2} />
          </button>
        )}
      </div>

      <h1>{pageTitle}</h1>

      <div className="chat-header-right" />
    </header>

    ...
  </section>
</main>
```

关键点：

1. `historyCollapsed === false` 时，只渲染历史栏顶部右侧按钮。
2. `historyCollapsed === true` 时，只渲染对话标题栏左侧按钮。
3. 两个位置不会同时出现按钮。
4. 两个按钮控制同一个状态。
5. 对话标题栏左侧按钮需要相对历史栏顶部右侧按钮做 180 度镜像。
6. 历史栏收起后，当前会话和消息不丢失。

### 38.4 对话历史栏 Flex 动画

CSS：

```css
.chat-page {
  height: 100%;
  display: flex;
  background: #f4f6fa;
  color: #172033;
}

.chat-sidebar {
  flex: 0 0 200px;
  width: 200px;
  min-width: 200px;
  min-height: 0;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  border-right: 1px solid #dbe3ef;
  background: #f8fbff;
  padding: 18px 12px;
  box-sizing: border-box;
  opacity: 1;
  transition:
    flex-basis 0.25s ease,
    width 0.25s ease,
    min-width 0.25s ease,
    opacity 0.2s ease,
    padding 0.25s ease;
}

.chat-page.is-history-collapsed .chat-sidebar {
  flex-basis: 0;
  width: 0;
  min-width: 0;
  padding-left: 0;
  padding-right: 0;
  opacity: 0;
  pointer-events: none;
  border-right: 0;
}

.chat-main {
  flex: 1 1 auto;
  min-width: 750px;
  display: flex;
  flex-direction: column;
  align-items: center;
  background: linear-gradient(90deg, #fff 0%, #fff 84%, #eef1f6 100%);
}
```

历史栏 header：

```css
.chat-sidebar-header {
  height: 32px;
  flex: 0 0 32px;
  display: flex;
  align-items: center;
  gap: 8px;
  color: #18365f;
  margin-bottom: 16px;
}

.chat-sidebar-header strong {
  flex: 1 1 auto;
  min-width: 0;
}
```

互斥按钮统一样式：

```css
.chat-history-toggle-button {
  width: 32px;
  height: 32px;
  border: 0;
  border-radius: 6px;
  background: transparent;
  color: #4b5563;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  transition:
    background 0.15s,
    color 0.15s;
}

.chat-history-toggle-button:hover {
  background: #e5e7eb;
  color: #2563eb;
}

.chat-history-toggle-button.is-mirrored svg {
  transform: rotate(180deg);
}
```

标题栏用 Flex 保持标题居中：

```css
.chat-header {
  flex: 0 0 48px;
  width: 100%;
  border-bottom: 2px solid #2563eb;
  background: #fff;
  display: flex;
  align-items: center;
  padding: 0 12px;
  box-sizing: border-box;
}

.chat-header-left,
.chat-header-right {
  flex: 0 0 40px;
  display: flex;
  align-items: center;
}

.chat-header-left {
  justify-content: flex-start;
}

.chat-header-right {
  justify-content: flex-end;
}

.chat-header h1 {
  flex: 1 1 auto;
  min-width: 0;
  margin: 0;
  color: #18365f;
  font-size: 16px;
  font-weight: 700;
  text-align: center;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
```

### 38.5 状态持久化

本轮主导航收起状态不持久化。

对话历史栏收起状态不持久化。

每次刷新后：

```txt
系统主导航默认展开
对话历史栏默认展开
```

后续如果要做刷新记忆，再单独加 `localStorage`。

### 38.6 本轮不做的事

这一轮只做：

```txt
系统主导航收起/展开
对话历史栏互斥开关
```

不做：

- 不改后端接口。
- 不改消息发送逻辑。
- 不改历史记录数据接口。
- 不重写第 37 步滚动实现。
- 不做移动端适配。
- 不做快捷提问面板。
- 不做分析过程展开。
- 不做会话上下文菜单。

### 38.7 构建命令

进入前端目录：

```bash
cd frontend
```

执行：

```bash
pnpm build
```

如果当前环境里 `pnpm` 不可用，执行：

```bash
node_modules/.bin/tsc -b
node_modules/.bin/vite build
```

### 38.8 验收标准

完成第 38 步后，逐项确认：

1. 最左侧系统主导航底部按钮可以收起主导航。
2. 系统主导航收起过程有宽度动画。
3. 系统主导航收起后宽度是窄栏，图标保留，文字隐藏。
4. 系统主导航收起后，子菜单区域不展开，不挤占空间。
5. 系统主导航收起后，底部按钮居中，箭头旋转。
6. 再次点击底部按钮，系统主导航展开，文字恢复。
7. 历史记录栏展开时，历史栏顶部右侧显示开关按钮。
8. 历史记录栏展开时，对话标题栏左侧不显示这个开关按钮。
9. 点击历史栏顶部右侧按钮后，历史记录栏收起。
10. 历史记录栏收起过程有宽度和透明度动画。
11. 历史记录栏收起后，右侧对话区占满释放出来的宽度。
12. 历史记录栏收起时，对话标题栏左侧显示同一个开关按钮。
13. 点击对话标题栏左侧按钮后，历史记录栏展开。
14. 历史栏开关不会在两个位置同时出现。
15. 两个位置的历史栏开关图标方向相反，呈 180 度镜像关系。
16. 历史栏展开/收起时，当前会话和消息不丢失。
17. 对话标题仍然视觉居中。
18. 第 37 步已经修好的滚动效果不被破坏。
19. 输入框仍然停在底部。
20. `/settings` 和 `/feedbacks` 页面不被主导航收起功能破坏。
21. 构建通过。

你现在只做：

1. 保留当前 Flex 布局。
2. 不动第 37 步滚动实现。
3. 补系统主导航 Flex 收起/展开。
4. 补对话历史栏互斥开关。
5. 执行构建。
6. 截图确认按钮互斥出现并且能正常展开/收起。

### 38.9 当前状态更新

第 38 步已经完成。

当前已完成：

1. 系统主导航支持 Flex 收起/展开。
2. 对话历史栏支持互斥开关。
3. 历史栏展开时，开关显示在 `近30天记录` 顶部右侧。
4. 历史栏收起时，开关显示在对话标题栏左侧。
5. 两个位置不会同时出现历史栏开关。
6. 两个位置的图标方向呈 180 度镜像关系。
7. 第 37 步已修好的滚动效果保持不变。

下一步处理会话标题生成逻辑。

---

## 第 39 步：首次提问后用第一句话覆盖默认会话标题

这一轮只处理智能问数的会话标题。

目标效果：

```txt
1. 用户点击“开启新对话”。
2. 新会话先显示默认标题，例如“新的智能问数”。
3. 用户发送第一条消息。
4. 后端把这条用户消息内容生成会话标题。
5. 历史记录里的标题从默认标题变成第一句话。
6. 后续继续发送第二条、第三条消息时，标题不再变化。
```

举例：

```txt
新建会话标题：新的智能问数
第一句话：帮我筛选政企行业收入3000万-5000万的数据，按收入从高到低排序
历史记录标题：帮我筛选政企行业收入3000万-5000万的数据，按收入从高到低排序
第二句话：再用饼图展示
历史记录标题：不变
```

### 39.1 为什么放在后端做

标题是会话数据的一部分。

会话数据保存在数据库表：

```txt
chat_sessions
```

所以标题覆盖逻辑要放在后端接口里。

不能只在前端临时改：

```txt
setSessions(...)
```

否则刷新页面后，标题还是数据库里的旧标题。

当前前端发送消息后已经会用后端返回的 `ChatSession` 更新列表，所以只要后端把标题改好，前端历史记录会自动刷新。

### 39.2 当前相关代码

前端默认标题在：

```txt
frontend/src/pages/ChatPage.tsx
```

当前类似：

```tsx
const newSessionTitle = "新的智能问数";
```

新建会话时：

```tsx
createSession(newSessionTitle)
```

后端创建会话在：

```txt
backend/app/routers/chat.py
```

当前类似：

```py
@router.post("", response_model=ChatSessionRead)
def create_session(payload: ChatSessionCreate, db: Session = Depends(get_db)):
    session = ChatSession(title=payload.title)
    db.add(session)
    db.commit()
    db.refresh(session)
    return session
```

发送消息接口在：

```py
@router.post("/{session_id}/messages", response_model=ChatSessionRead)
def send_message(...):
    ...
```

标题覆盖逻辑就加在 `send_message` 里。

### 39.3 后端标题生成规则

规则：

```txt
如果当前会话还没有任何消息：
    用本次用户输入内容生成标题
否则：
    不修改标题
```

判断是否第一条消息：

```py
existing_message = (
    db.query(ChatMessage.id)
    .filter(ChatMessage.session_id == session.id)
    .first()
)
```

如果 `existing_message is None`，说明这是当前会话第一条消息。

### 39.4 新增标题处理函数

在 `backend/app/routers/chat.py` 里加一个小函数：

```py
def _build_session_title(content: str) -> str:
    title = " ".join(content.strip().split())
    return title or "新的智能问数"
```

含义：

1. `content.strip()` 去掉首尾空格。
2. `.split()` 再 `" ".join(...)`，把连续空白压成单个空格。
3. 不在后端做 UI 层面的打点省略。
4. 极端情况下如果内容为空，仍然兜底为 `新的智能问数`。

注意：

接口前面已经会校验空内容或前端会 trim，但后端兜底更稳。

标题在数据库里的字段是：

```py
title: Mapped[str] = mapped_column(String(200), nullable=False)
```

所以后端最多只需要考虑数据库字段长度兜底，不负责前端显示省略。

如果后续担心用户第一句话超过 200 个字符，可以把函数改成：

```py
def _build_session_title(content: str) -> str:
    title = " ".join(content.strip().split())
    return (title or "新的智能问数")[:200]
```

这里的 `[:200]` 是为了避免超过数据库字段长度，不是为了 UI 打点。

### 39.5 修改 `send_message`

在创建 `user_message` 之前加：

```py
existing_message = (
    db.query(ChatMessage.id)
    .filter(ChatMessage.session_id == session.id)
    .first()
)

if existing_message is None:
    session.title = _build_session_title(payload.content)
```

整体位置：

```py
if payload.role != "user":
    raise HTTPException(status_code=400, detail="only user messages can be sent")

existing_message = (
    db.query(ChatMessage.id)
    .filter(ChatMessage.session_id == session.id)
    .first()
)

if existing_message is None:
    session.title = _build_session_title(payload.content)

user_message = ChatMessage(
    session_id=session.id,
    role="user",
    content=payload.content,
)
```

这样第一次发送消息时，`session.title` 会和两条消息一起在同一次提交里保存。

这里不需要再写：

```py
db.add(session)
```

原因：

`session` 是前面通过查询拿到的：

```py
session = db.query(ChatSession).filter(ChatSession.id == session_id).first()
```

这个对象已经处在 SQLAlchemy 当前数据库会话 `db` 的管理中。

所以当执行：

```py
session.title = _build_session_title(payload.content)
```

SQLAlchemy 会记录这个对象被修改了。

后面执行：

```py
db.commit()
```

时，SQLAlchemy 会自动把 `session.title` 的变化更新到数据库。

`db.add(...)` 主要用于：

1. 新建对象，例如 `ChatMessage(...)`。
2. 一个对象还没有被当前 `db` 追踪。

这里的 `session` 已经被当前 `db` 追踪，所以不用再 `add`。

### 39.6 前端不需要额外接口

当前前端发送消息后已经做了：

```tsx
setSessions((currentSessions) => [
  result.data,
  ...currentSessions.filter((session) => session.id !== result.data.id),
]);
```

`result.data` 是后端返回的更新后会话。

所以只要后端返回的 `result.data.title` 已经变成第一句话，历史记录就会自动更新。

前端最多只需要确认：

1. 新建会话时继续使用默认标题。
2. 发送第一条消息后，列表里显示后端返回的新标题。
3. 后续发送消息不会再次改标题。
4. 历史记录标题过长时，由前端 CSS 做单行省略。

历史记录打点放在前端做。

当前样式里应该保持类似：

```css
.chat-history-item span {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
```

原因：

1. 后端保存的是数据本身。
2. 前端决定数据怎么显示。
3. 如果后端为了显示把标题截成 `xxx...`，原始标题就永久丢失了。
4. 不同位置可能有不同宽度，应该由各自 UI 自己决定省略长度。

### 39.7 本轮不做的事

这一轮只做标题覆盖逻辑。

不做：

- 不改聊天 UI 样式。
- 不改历史栏展开/收起。
- 不改消息渲染。
- 不改 AI 回复逻辑。
- 不新增手动重命名会话功能。
- 不新增删除会话功能。

### 39.8 构建和检查

后端先做语法检查：

```bash
cd backend
python -m compileall app
```

前端如果没有改代码，可以不构建。

如果顺手改了前端，再执行：

```bash
cd frontend
pnpm build
```

或者：

```bash
node_modules/.bin/tsc -b
node_modules/.bin/vite build
```

### 39.9 验收标准

完成第 39 步后，确认：

1. 点击 `开启新对话` 后，新会话标题先是默认标题。
2. 新会话未发送消息前，历史记录显示默认标题。
3. 输入第一句话并发送后，历史记录标题变成第一句话生成的标题。
4. 标题会保存到数据库，刷新页面后仍然是第一句话标题。
5. 第二次发送消息后，标题不再变化。
6. 第三次发送消息后，标题仍然不变化。
7. 如果第一句话很长，数据库里保存的是清理后的标题内容，不为了 UI 提前加 `...`。
8. 历史记录里长标题由前端单行省略展示，不撑破历史记录。
9. `python -m compileall app` 通过。

你现在只做：

1. 修改 `backend/app/routers/chat.py`。
2. 增加 `_build_session_title`。
3. 在 `send_message` 里判断第一条消息并覆盖标题。
4. 执行后端语法检查。
5. 在页面里手动验证一次新建会话和首次提问标题变化。

### 39.10 当前状态更新

第 39 步已经完成。

当前已完成：

1. 新建会话先显示默认标题。
2. 首次发送消息后，会话标题改成第一句话。
3. 后续继续发送消息时，标题不再变化。
4. 标题持久化在数据库里。
5. 历史记录长标题由前端单行省略展示，不由后端提前加 `...`。

下一步处理历史记录项的更多操作。

---

## 第 40 步：历史记录项 hover 操作栏、重命名、置顶和删除

这一轮只处理智能问数左侧历史记录列表里的单条记录操作。

目标效果：

```txt
鼠标 hover 到某一条历史记录上：右侧出现无边框三个点图标按钮。
点击或 hover 三点按钮区域：出现操作菜单。
操作菜单包含：重命名、置顶/取消置顶、删除。
重命名和删除必须使用项目里抽离的 AppModal。
```

这一步的文档按“一个功能一整块”组织。

不要再把删除的函数、删除弹窗、删除样式拆到三个地方写。

本轮顺序：

```txt
40.1 公共基础
40.2 历史记录项和三点菜单基础结构
40.3 重命名完整闭环
40.4 置顶 / 取消置顶完整闭环
40.5 删除完整闭环
40.6 ChatPage 最终挂载结构
40.7 本轮不做的事
40.8 构建和检查
40.9 总体验收标准
40.10 这一步真正的执行顺序
```

注意：

原型里重命名和删除可能用了浏览器原生弹窗。

本项目不要使用：

```txt
window.prompt
window.confirm
alert
```

重命名和删除都必须使用：

```txt
frontend/src/components/AppModal.tsx
```

当前已有弹窗用法参考：

```txt
frontend/src/components/GreetingConfigModal.tsx
frontend/src/components/HotRecommendConfigModal.tsx
frontend/src/components/FeedbackHandleModal.tsx
```

`AppModal` 的 props：

```tsx
type AppModalProps = {
  title: string
  width?: 'sm' | 'md' | 'lg'
  children: ReactNode
  footer: ReactNode
  closeDisabled?: boolean
  className?: string
  onClose: () => void
}
```

### 40.1 公共基础

这一小节只放三个功能都会用到的基础能力。

这里不写重命名细节，不写置顶细节，不写删除细节。

#### 40.1.1 后端会话更新能力

新增接口：

```txt
PATCH /api/sessions/{session_id}
```

这个接口同时服务两个功能：

```txt
重命名
置顶 / 取消置顶
```

修改：

```txt
backend/app/schemas/chat.py
```

新增：

```py
class ChatSessionUpdate(BaseModel):
    title: str | None = None
    pinned: bool | None = None
```

修改：

```txt
backend/app/routers/chat.py
```

导入：

```py
from app.schemas.chat import (
    ChatMessageCreate,
    ChatSessionCreate,
    ChatSessionRead,
    ChatSessionUpdate,
)
```

接口骨架：

```py
@router.patch("/{session_id}", response_model=ChatSessionRead)
def update_session(
    session_id: int,
    payload: ChatSessionUpdate,
    db: Session = Depends(get_db),
):
    session = _get_session_with_messages(db, session_id)
    if session is None:
        raise HTTPException(status_code=404, detail="session not found")

    if payload.title is not None:
        title = " ".join(payload.title.strip().split())
        if not title:
            raise HTTPException(status_code=400, detail="title cannot be empty")
        session.title = title[:200]

    if payload.pinned is not None:
        session.pinned = payload.pinned

    session.updated_at = datetime.now(timezone.utc)
    db.commit()

    updated_session = _get_session_with_messages(db, session.id)
    if updated_session is None:
        raise HTTPException(status_code=404, detail="session not found")
    return updated_session
```

解释：

1. `payload.title is not None` 说明本次请求要改标题。
2. `payload.pinned is not None` 说明本次请求要改置顶状态。
3. `title[:200]` 是数据库字段长度兜底，不是前端省略展示。
4. `session.updated_at = datetime.now(timezone.utc)` 让历史记录排序能反映这次操作。
5. 返回更新后的完整会话，前端用它替换旧会话。

#### 40.1.2 前端会话更新 API

修改：

```txt
frontend/src/api/types.ts
```

确认类型里有：

```ts
export type ChatSession = {
  id: number
  title: string
  pinned: boolean
  created_at: string
  updated_at: string
  messages: ChatMessage[]
}

export type UpdateSessionPayload = {
  title?: string
  pinned?: boolean
}
```

修改：

```txt
frontend/src/api/chat.ts
```

确认有：

```ts
export const updateSession = (sessionId: number, payload: UpdateSessionPayload) => {
  return http.patch<ChatSession>(`/api/sessions/${sessionId}`, payload)
}
```

`deleteSession` 放到删除功能那一整块里写。

#### 40.1.3 ChatPage 共享状态

修改：

```txt
frontend/src/pages/ChatPage.tsx
```

新增这些状态：

```tsx
const [openActionSessionId, setOpenActionSessionId] = useState<number | null>(null)
const [renamingSession, setRenamingSession] = useState<ChatSession | null>(null)
const [deletingSession, setDeletingSession] = useState<ChatSession | null>(null)
const [sessionActionLoading, setSessionActionLoading] = useState(false)
```

每个状态只管一件事：

```txt
openActionSessionId
  只管哪个三点菜单打开。

renamingSession
  只管当前正在重命名哪条会话。

deletingSession
  只管当前准备删除哪条会话。

sessionActionLoading
  只管重命名、置顶、删除提交中的 loading。
```

不要把这几个状态合成一个大对象。

原因：

```txt
这几个状态生命周期不同。
菜单打开不等于弹窗打开。
删除弹窗打开不等于重命名弹窗打开。
loading 也不是某一条记录自己的 UI 状态。
```

#### 40.1.4 排序 helper

把排序函数放在 `ChatPage` 组件外面：

```ts
const sortSessions = (items: ChatSession[]) => {
  return [...items].sort((prev, next) => {
    if (prev.pinned !== next.pinned) {
      return Number(next.pinned) - Number(prev.pinned)
    }

    return new Date(next.updated_at).getTime() - new Date(prev.updated_at).getTime()
  })
}
```

含义：

1. 先复制数组，避免直接改 React state。
2. 置顶的排前面。
3. 同样置顶状态下，按更新时间倒序。

#### 40.1.5 选择历史记录时关闭菜单

新增或修改：

```tsx
const handleSelectSession = useCallback((sessionId: number) => {
  setSelectedSessionId(sessionId)
  setOpenActionSessionId(null)
}, [])
```

原因：

```txt
用户切换会话后，原来那条历史记录的操作菜单不应该继续开着。
```

#### 40.1.6 打开和关闭三点菜单

新增两个函数：

```tsx
const handleOpenActionMenu = useCallback((sessionId: number) => {
  setOpenActionSessionId(sessionId)
}, [])

const handleCloseActionMenu = useCallback(() => {
  setOpenActionSessionId(null)
}, [])
```

含义：

1. 鼠标进入三点按钮区域时，打开当前会话的菜单。
2. 鼠标离开三点按钮和菜单区域时，关闭菜单。
3. 点击重命名、置顶、删除时，也由对应 handler 主动关闭菜单。
4. 永远只允许一个菜单打开。

注意：

菜单显示不要直接交给 CSS `:hover`。

正确关系是：

```txt
CSS hover
  只负责让三点按钮出现。

React state openActionSessionId
  负责让操作菜单出现或消失。
```

原因：

如果写成：

```css
.chat-history-more-wrap:hover .chat-history-menu {
  display: grid;
}
```

点击“重命名”后，即使执行了：

```tsx
setOpenActionSessionId(null)
```

只要鼠标还停在菜单区域，CSS hover 仍然会把菜单强行显示出来。

所以菜单显示只能看 `.menu-open` 状态。

### 40.2 历史记录项和三点菜单基础结构

这一节只写“历史记录行”和“三点菜单容器”的基础结构。

三个业务动作的具体逻辑放到后面三个独立块里。

#### 40.2.1 新增 ChatHistoryItem 组件

新增：

```txt
frontend/src/components/ChatHistoryItem.tsx
```

组件 props：

```tsx
type ChatHistoryItemProps = {
  session: ChatSession
  isActive: boolean
  isMenuOpen: boolean
  actionLoading: boolean
  onSelectSession: (sessionId: number) => void
  onOpenMenu: (sessionId: number) => void
  onCloseMenu: () => void
  onRename: (session: ChatSession) => void
  onUp: (session: ChatSession) => void
  onDelete: (session: ChatSession) => void
}
```

注意：

1. `ChatHistoryItem` 不调接口。
2. `ChatHistoryItem` 不更新 `sessions`。
3. `ChatHistoryItem` 只负责展示一行、展示菜单、把点击事件交给父组件。

#### 40.2.2 不要再用 button 套 button

不要写成：

```tsx
<button className="chat-history-item">
  <span>{session.title}</span>
  <button>...</button>
</button>
```

原因：

```txt
button 里面嵌套 button 是不合法的 HTML 结构。
```

改成：

```tsx
<div className={`chat-history-item ${isActive ? 'active' : ''} ${isMenuOpen ? 'menu-open' : ''}`}>
  <button
    className="chat-history-select"
    type="button"
    onClick={() => onSelectSession(session.id)}
  >
    <span className="chat-history-title">{session.title}</span>
  </button>

  <div
    className="chat-history-more-wrap"
    onMouseEnter={() => onOpenMenu(session.id)}
    onMouseLeave={onCloseMenu}
    onClick={event => event.stopPropagation()}
  >
    <button
      className="chat-history-more-button"
      type="button"
      aria-label="更多操作"
      aria-expanded={isMenuOpen}
      onClick={event => {
        event.stopPropagation()
        onOpenMenu(session.id)
      }}
    >
      <MoreHorizontal size={16} />
    </button>

    <div className="chat-history-menu">
      ...三个菜单项放这里...
    </div>
  </div>
</div>
```

如果使用的图标是竖向三个点，也可以用：

```tsx
<MoreVertical size={16} />
```

按照原型视觉选择即可。

#### 40.2.3 三点菜单基础样式

修改：

```txt
frontend/src/styles/chat.css
```

基础样式：

```css
.chat-history-item {
  position: relative;
  min-height: 40px;
  display: flex;
  align-items: center;
  gap: 4px;
  border-radius: 8px;
  overflow: visible;
}

.chat-history-select {
  min-width: 0;
  flex: 1 1 auto;
  height: 40px;
  display: flex;
  align-items: center;
  gap: 6px;
  border: 0;
  border-radius: 8px;
  background: transparent;
  color: inherit;
  padding: 0 8px;
  text-align: left;
  cursor: pointer;
}

.chat-history-item:hover .chat-history-select,
.chat-history-item.active .chat-history-select {
  background: #dbeafe;
}

.chat-history-title {
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.chat-history-more-wrap {
  position: relative;
  flex: 0 0 28px;
  width: 28px;
  height: 28px;
  opacity: 0;
  pointer-events: none;
}

.chat-history-item:hover .chat-history-more-wrap,
.chat-history-item.menu-open .chat-history-more-wrap {
  opacity: 1;
  pointer-events: auto;
}

.chat-history-more-button {
  width: 28px;
  height: 28px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border: 0;
  border-radius: 6px;
  background: transparent;
  color: #475467;
  padding: 0;
  cursor: pointer;
}

.chat-history-more-button:hover,
.chat-history-more-button[aria-expanded='true'] {
  background: #eef3ff;
  color: #2563eb;
}

.chat-history-menu {
  position: absolute;
  top: calc(100% + 6px);
  right: 0;
  z-index: 30;
  min-width: 132px;
  display: none;
  grid-template-columns: 1fr;
  gap: 2px;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  background: #fff;
  box-shadow: 0 8px 24px rgb(15 23 42 / 12%);
  padding: 4px;
  white-space: nowrap;
}

.chat-history-item.menu-open .chat-history-menu {
  display: grid;
}

.chat-history-menu button {
  height: 32px;
  display: flex;
  align-items: center;
  gap: 8px;
  border: 0;
  border-radius: 6px;
  background: transparent;
  color: #344054;
  padding: 0 10px;
  font-size: 14px;
  text-align: left;
  cursor: pointer;
}

.chat-history-menu button:hover {
  background: #f3f6ff;
  color: #2563eb;
}

.chat-history-menu button:disabled {
  cursor: not-allowed;
  opacity: 0.6;
}
```

关键点：

1. `.chat-history-item` 不要写 `overflow: hidden`。
2. 标题省略放到 `.chat-history-title` 上。
3. 菜单浮层靠 `.chat-history-menu` 定位。
4. 三点按钮默认透明，hover 当前行时出现。
5. 菜单默认 `display: none`，只在 `.chat-history-item.menu-open` 时显示。
6. 不要再写 `.chat-history-more-wrap:hover .chat-history-menu`。

### 40.3 重命名完整闭环

这一节只写重命名，从菜单项到弹窗、函数、样式和验收全部放在一起。

#### 40.3.1 重命名菜单项

在 `ChatHistoryItem` 的菜单里放：

```tsx
<button
  type="button"
  disabled={actionLoading}
  onClick={event => {
    event.stopPropagation()
    onRename(session)
  }}
>
  <Pencil size={14} />
  <span>重命名</span>
</button>
```

点击后只打开弹窗，不直接调接口。

#### 40.3.2 ChatPage 入口函数：handleRename

在 `ChatPage.tsx` 中写：

```tsx
const handleRename = useCallback((session: ChatSession) => {
  setOpenActionSessionId(null)
  setRenamingSession(session)
}, [])
```

职责：

1. 关闭三点菜单。
2. 记录当前正在重命名哪条会话。
3. 触发 `RenameSessionModal` 打开。

#### 40.3.3 重命名确认函数：handleConfirmRename

在 `ChatPage.tsx` 中写：

```tsx
const handleConfirmRename = useCallback(async (title: string) => {
  if (!renamingSession || sessionActionLoading) {
    return
  }

  const nextTitle = title.trim().replace(/\s+/g, ' ')

  if (!nextTitle) {
    return
  }

  setSessionActionLoading(true)
  setError(null)

  const result = await toAsyncResult(
    updateSession(renamingSession.id, { title: nextTitle })
  )

  if (result.ok === false) {
    setError(result.error)
    setSessionActionLoading(false)
    return
  }

  setSessions(currentSessions =>
    sortSessions(
      currentSessions.map(session =>
        session.id === result.data.id ? result.data : session
      )
    )
  )
  setRenamingSession(null)
  setSessionActionLoading(false)
}, [renamingSession, sessionActionLoading, setError, setSessions])
```

成功流转：

```txt
点击重命名
打开 RenameSessionModal
用户输入标题
点击保存
PATCH /api/sessions/{id}
用返回的会话替换 sessions 中的旧会话
重新排序
关闭弹窗
```

失败流转：

```txt
setError(result.error)
setSessionActionLoading(false)
弹窗不关闭
用户输入不丢失
```

#### 40.3.4 RenameSessionModal 组件

新增或完善：

```txt
frontend/src/components/RenameSessionModal.tsx
```

文件顶部导入：

```tsx
import { useState } from 'react'
import AppModal from './AppModal'
import type { ChatSession } from '../api/types'
```

组件 props：

```tsx
type RenameSessionModalProps = {
  session: ChatSession
  loading: boolean
  onClose: () => void
  onConfirm: (title: string) => void
}
```

组件内部状态：

```tsx
const [title, setTitle] = useState(session.title)
```

不要在这个组件里写：

```tsx
useEffect(() => {
  setTitle(session.title)
}, [session.title])
```

原因：

```txt
这个 useEffect 里同步 setTitle 会触发 React 的 lint 提示：
Calling setState synchronously within an effect can trigger cascading renders.
```

这里不需要用 effect 同步 props。

后面在 `ChatPage` 使用弹窗时，加：

```tsx
key={renamingSession.id}
```

这样每次切换不同会话重命名时，React 会重新创建 `RenameSessionModal`，`useState(session.title)` 自然会拿到最新标题。

确认按钮条件：

```tsx
const normalizedTitle = title.trim().replace(/\s+/g, ' ')
const originTitle = session.title.trim().replace(/\s+/g, ' ')
const canSubmit = normalizedTitle.length > 0 && normalizedTitle !== originTitle && !loading
```

弹窗结构：

```tsx
const RenameSessionModal = ({
  session,
  loading,
  onClose,
  onConfirm,
}: RenameSessionModalProps) => {
  const [title, setTitle] = useState(session.title)
  const normalizedTitle = title.trim().replace(/\s+/g, ' ')
  const originTitle = session.title.trim().replace(/\s+/g, ' ')
  const canSubmit = normalizedTitle.length > 0 && normalizedTitle !== originTitle && !loading

  return (
    <AppModal
      title="重命名会话"
      width="sm"
      closeDisabled={loading}
      onClose={onClose}
      footer={
        <>
          <button type="button" disabled={loading} onClick={onClose}>
            取消
          </button>
          <button
            type="button"
            disabled={!canSubmit}
            onClick={() => onConfirm(normalizedTitle)}
          >
            {loading ? '保存中...' : '保存'}
          </button>
        </>
      }
    >
      <label className="rename-session-field">
        <span>会话名称</span>
        <input
          className="rename-session-input"
          value={title}
          disabled={loading}
          maxLength={200}
          autoFocus
          onChange={event => setTitle(event.target.value)}
          onKeyDown={event => {
            if (event.key === 'Enter' && canSubmit) {
              onConfirm(normalizedTitle)
            }
          }}
        />
      </label>
    </AppModal>
  )
}
```

注意：

1. `RenameSessionModal` 不直接调接口。
2. 它只负责输入、校验、把最终标题交给 `onConfirm`。
3. 接口调用、更新 `sessions`、关闭弹窗都在 `ChatPage`。
4. 不使用 `window.prompt`。

#### 40.3.5 在 ChatPage 里使用 RenameSessionModal

创建完 `RenameSessionModal` 后，必须在 `ChatPage.tsx` 里接上使用逻辑。

否则只是有组件文件，页面不会显示弹窗。

第一步，导入组件：

```tsx
import RenameSessionModal from '../components/RenameSessionModal'
```

第二步，在 `ChatPage` 的 `return` 最外层使用 `Fragment` 包起来。

原来如果是：

```tsx
return (
  <main className={`chat-page ${historyCollapsed ? 'is-history-collapsed' : ''}`}>
    ...
  </main>
)
```

改成：

```tsx
return (
  <>
    <main className={`chat-page ${historyCollapsed ? 'is-history-collapsed' : ''}`}>
      ...
    </main>

    {renamingSession && (
      <RenameSessionModal
        key={renamingSession.id}
        session={renamingSession}
        loading={sessionActionLoading}
        onClose={() => setRenamingSession(null)}
        onConfirm={title => void handleConfirmRename(title)}
      />
    )}
  </>
)
```

这里每个 prop 的意思：

```txt
key={renamingSession.id}
  换不同会话重命名时，强制重新创建弹窗，避免用 useEffect 同步标题。

session={renamingSession}
  把当前正在重命名的会话传给弹窗。

loading={sessionActionLoading}
  保存中禁用输入框和按钮。

onClose={() => setRenamingSession(null)}
  关闭弹窗，本质就是清空 renamingSession。

onConfirm={title => void handleConfirmRename(title)}
  点击保存时，把弹窗里的标题交给 ChatPage，由 ChatPage 调接口。
```

完整重命名链路：

```txt
ChatHistoryItem 点击“重命名”
-> onRename(session)
-> ChatPage.handleRename(session)
-> setRenamingSession(session)
-> ChatPage 渲染 RenameSessionModal
-> 用户输入标题
-> RenameSessionModal 调 onConfirm(title)
-> ChatPage.handleConfirmRename(title)
-> updateSession(...)
-> 更新 sessions
-> setRenamingSession(null)
-> 弹窗关闭
```

#### 40.3.6 重命名弹窗样式

修改：

```txt
frontend/src/styles/modal.css
```

增加：

```css
.rename-session-field {
  display: grid;
  gap: 8px;
  color: #344054;
  font-size: 14px;
}

.rename-session-input {
  width: 100%;
  height: 38px;
  border: 1px solid #d0d5dd;
  border-radius: 6px;
  color: #172033;
  padding: 0 10px;
  outline: none;
}

.rename-session-input:focus {
  border-color: #2563eb;
  box-shadow: 0 0 0 3px rgb(37 99 235 / 12%);
}

.rename-session-input:disabled {
  background: #f9fafb;
  cursor: not-allowed;
}
```

#### 40.3.7 重命名验收

完成后确认：

1. 点击三点菜单里的重命名，会打开 `AppModal` 弹窗。
2. 弹窗初始值是当前会话标题。
3. 空标题不能保存。
4. 和原标题一样不能保存。
5. 保存中按钮禁用并显示 `保存中...`。
6. 保存成功后历史记录标题更新。
7. 保存失败时弹窗不关闭。
8. 没有使用 `window.prompt`。

### 40.4 置顶 / 取消置顶完整闭环

这一节只写置顶，从数据库字段到菜单项、函数、排序、样式和验收全部放在一起。

#### 40.4.1 后端模型增加 pinned

修改：

```txt
backend/app/models/chat.py
```

补导入：

```py
from sqlalchemy import Boolean, DateTime, ForeignKey, Integer, String, Text, func
```

在 `ChatSession` 增加：

```py
pinned: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)
```

如果本地数据库已经存在旧表，需要手动补字段：

```sql
ALTER TABLE chat_sessions
ADD COLUMN pinned BOOLEAN NOT NULL DEFAULT FALSE;
```

当前项目还没有 Alembic，所以开发阶段先用手动 `ALTER TABLE` 或重建开发数据库处理。

#### 40.4.2 Schema 返回 pinned

修改：

```txt
backend/app/schemas/chat.py
```

`ChatSessionRead` 增加：

```py
pinned: bool = False
```

这样前端历史记录才能知道某条会话是否置顶。

#### 40.4.3 后端列表排序

修改：

```txt
backend/app/routers/chat.py
```

`GET /api/sessions` 排序改为：

```py
.order_by(ChatSession.pinned.desc(), ChatSession.updated_at.desc())
```

规则：

```txt
置顶在前。
同样置顶状态下，按 updated_at 倒序。
```

#### 40.4.4 置顶菜单项

在 `ChatHistoryItem` 菜单里放：

```tsx
<button
  type="button"
  disabled={actionLoading}
  onClick={event => {
    event.stopPropagation()
    onUp(session)
  }}
>
  {session.pinned ? <PinOff size={14} /> : <Pin size={14} />}
  <span>{session.pinned ? '取消置顶' : '置顶'}</span>
</button>
```

点击后直接调接口，不需要弹窗。

#### 40.4.5 ChatPage 置顶函数：handleUp

这里函数名按当前 plan 叫 `handleUp`。

如果代码里已经叫 `handleTogglePinned`，也可以保持现有命名。

核心逻辑必须是：

```tsx
const handleUp = useCallback(
  async (session: ChatSession) => {
    if (sessionActionLoading) {
      return
    }

    setOpenActionSessionId(null)
    setSessionActionLoading(true)
    setError(null)

    const result = await toAsyncResult(
      updateSession(session.id, { pinned: !session.pinned })
    )

    if (result.ok === false) {
      setError(result.error)
      setSessionActionLoading(false)
      return
    }

    setSessions(currentSessions =>
      sortSessions(
        currentSessions.map(currentSession =>
          currentSession.id === result.data.id ? result.data : currentSession
        )
      )
    )
    setSessionActionLoading(false)
  },
  [sessionActionLoading, setError, setSessions]
)
```

成功流转：

```txt
点击置顶 / 取消置顶
关闭菜单
PATCH /api/sessions/{id}
用返回的会话替换旧会话
sortSessions
列表重新排序
```

失败流转：

```txt
setError(result.error)
setSessionActionLoading(false)
sessions 不变
```

这里不做乐观更新。

原因：

```txt
置顶会影响排序，等后端返回完整会话后再更新更稳。
```

#### 40.4.6 置顶样式

如果要在标题前显示置顶状态，在 `ChatHistoryItem` 里加：

```tsx
{session.pinned && <Pin size={12} className="chat-history-pin" />}
```

样式放到：

```txt
frontend/src/styles/chat.css
```

```css
.chat-history-pin {
  flex: 0 0 auto;
  color: #2563eb;
}
```

如果暂时不想额外显示置顶图标，也可以只通过排序体现置顶。

菜单项图标已经能体现当前状态。

#### 40.4.7 置顶验收

完成后确认：

1. 未置顶会话菜单显示 `置顶`。
2. 已置顶会话菜单显示 `取消置顶`。
3. 点击置顶后，该会话移动到历史记录顶部。
4. 点击取消置顶后，该会话回到普通排序位置。
5. 刷新页面后置顶状态仍然存在。
6. 置顶操作不打开任何弹窗。

### 40.5 删除完整闭环

这一节只写删除，从后端接口、前端 API、http 空响应、函数、弹窗、样式和验收全部放在一起。

#### 40.5.1 后端 DELETE 接口

修改：

```txt
backend/app/routers/chat.py
```

新增：

```py
@router.delete("/{session_id}", status_code=204)
def delete_session(session_id: int, db: Session = Depends(get_db)):
    session = db.query(ChatSession).filter(ChatSession.id == session_id).first()
    if session is None:
        raise HTTPException(status_code=404, detail="session not found")

    db.delete(session)
    db.commit()
    return None
```

因为 `ChatSession.messages` 已经配置：

```py
cascade="all, delete-orphan"
```

所以删除会话时，属于这个会话的消息也会一起删除。

#### 40.5.2 前端 http 处理 204

删除接口成功时返回 `204 No Content`，没有 response body。

如果 `frontend/src/api/http.ts` 成功后永远执行：

```ts
return response.json() as Promise<T>
```

删除成功反而会因为空 body 报错。

所以先修改：

```txt
frontend/src/api/http.ts
```

把成功响应处理改成：

```ts
if (response.status === 204) {
  return undefined as T
}

const text = await response.text()

if (!text) {
  return undefined as T
}

return JSON.parse(text) as T
```

完整 `request` 结构：

```ts
const request = async <T>(path: string, options: RequestOptions = {}): Promise<T> => {
  const response = await fetch(path, {
    method: options.method ?? 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
    body: options.body === undefined ? undefined : JSON.stringify(options.body),
  })

  if (!response.ok) {
    const message = await response.text()
    throw new Error(message || `Request failed: ${response.status}`)
  }

  if (response.status === 204) {
    return undefined as T
  }

  const text = await response.text()

  if (!text) {
    return undefined as T
  }

  return JSON.parse(text) as T
}
```

#### 40.5.3 前端删除 API

修改：

```txt
frontend/src/api/chat.ts
```

新增或确认：

```ts
export const deleteSession = (sessionId: number) => {
  return http.delete<void>(`/api/sessions/${sessionId}`)
}
```

#### 40.5.4 删除菜单项

在 `ChatHistoryItem` 菜单里放：

```tsx
<button
  className="danger"
  type="button"
  disabled={actionLoading}
  onClick={event => {
    event.stopPropagation()
    onDelete(session)
  }}
>
  <Trash2 size={14} />
  <span>删除</span>
</button>
```

点击后只打开删除确认弹窗，不直接删除。

#### 40.5.5 删除菜单样式

修改：

```txt
frontend/src/styles/chat.css
```

增加：

```css
.chat-history-menu button.danger {
  color: #d92d20;
}

.chat-history-menu button.danger:hover {
  background: #fef3f2;
  color: #b42318;
}
```

#### 40.5.6 ChatPage 删除入口函数：handleDelete

在 `ChatPage.tsx` 中写：

```tsx
const handleDelete = useCallback((session: ChatSession) => {
  setOpenActionSessionId(null)
  setDeletingSession(session)
}, [])
```

职责：

1. 关闭三点菜单。
2. 记录当前准备删除哪条会话。
3. 触发 `DeleteSessionModal` 打开。

#### 40.5.7 删除确认函数：handleConfirmDelete

在 `ChatPage.tsx` 中写：

```tsx
const handleConfirmDelete = useCallback(async () => {
  if (!deletingSession || sessionActionLoading) {
    return
  }

  setSessionActionLoading(true)
  setError(null)

  const deletedSessionId = deletingSession.id
  const result = await toAsyncResult(deleteSession(deletedSessionId))

  if (result.ok === false) {
    setError(result.error)
    setSessionActionLoading(false)
    return
  }

  const nextSessions = sessions.filter(session => session.id !== deletedSessionId)

  setSessions(nextSessions)

  if (activeSessionId === deletedSessionId) {
    setSelectedSessionId(nextSessions[0]?.id ?? null)
  }

  setDeletingSession(null)
  setSessionActionLoading(false)
}, [
  deletingSession,
  sessions,
  activeSessionId,
  sessionActionLoading,
  setError,
  setSessions,
])
```

这里必须用 `activeSessionId` 判断，不用 `selectedSessionId` 判断。

原因：

```tsx
const activeSessionId = selectedSessionId ?? sessions[0]?.id ?? null
```

当用户还没有手动点过历史记录时，`selectedSessionId` 可能是 `null`，但页面实际展示的是 `sessions[0]`。

如果删除的正好是当前展示的第一条会话，用 `selectedSessionId` 会判断不到。

成功流转：

```txt
点击删除
打开 DeleteSessionModal
点击确认删除
DELETE /api/sessions/{id}
过滤 sessions
如果删除的是 activeSessionId，选中 nextSessions[0]?.id ?? null
关闭弹窗
```

失败流转：

```txt
setError(result.error)
setSessionActionLoading(false)
弹窗不关闭
sessions 不变
```

#### 40.5.8 DeleteSessionModal 组件

新增：

```txt
frontend/src/components/DeleteSessionModal.tsx
```

文件顶部导入：

```tsx
import AppModal from './AppModal'
import type { ChatSession } from '../api/types'
```

组件 props：

```tsx
type DeleteSessionModalProps = {
  session: ChatSession
  loading: boolean
  onClose: () => void
  onConfirm: () => void
}
```

弹窗结构：

```tsx
const DeleteSessionModal = ({
  session,
  loading,
  onClose,
  onConfirm,
}: DeleteSessionModalProps) => {
  return (
    <AppModal
      title="删除会话"
      width="sm"
      closeDisabled={loading}
      onClose={onClose}
      footer={
        <>
          <button type="button" disabled={loading} onClick={onClose}>
            取消
          </button>
          <button
            className="danger"
            type="button"
            disabled={loading}
            onClick={onConfirm}
          >
            {loading ? '删除中...' : '删除'}
          </button>
        </>
      }
    >
      <p className="delete-session-warning">
        删除后，该会话及其消息记录将无法恢复。
      </p>
      <div className="delete-session-title">{session.title}</div>
    </AppModal>
  )
}
```

注意：

1. `DeleteSessionModal` 不直接调接口。
2. 真正删除逻辑全部放在 `handleConfirmDelete`。
3. 删除提交中禁止关闭弹窗。
4. 不使用 `window.confirm`。

#### 40.5.9 在 ChatPage 里使用 DeleteSessionModal

创建完 `DeleteSessionModal` 后，也必须在 `ChatPage.tsx` 里接上使用逻辑。

第一步，导入组件：

```tsx
import DeleteSessionModal from '../components/DeleteSessionModal'
```

第二步，在 `ChatPage` 的 `return` 最外层挂载删除弹窗。

如果前面已经因为重命名弹窗把 `return` 改成了 `Fragment`，这里直接把删除弹窗放在 `RenameSessionModal` 后面：

```tsx
return (
  <>
    <main className={`chat-page ${historyCollapsed ? 'is-history-collapsed' : ''}`}>
      ...
    </main>

    {renamingSession && (
      <RenameSessionModal
        key={renamingSession.id}
        session={renamingSession}
        loading={sessionActionLoading}
        onClose={() => setRenamingSession(null)}
        onConfirm={title => void handleConfirmRename(title)}
      />
    )}

    {deletingSession && (
      <DeleteSessionModal
        session={deletingSession}
        loading={sessionActionLoading}
        onClose={() => setDeletingSession(null)}
        onConfirm={() => void handleConfirmDelete()}
      />
    )}
  </>
)
```

这里每个 prop 的意思：

```txt
session={deletingSession}
  把当前准备删除的会话传给弹窗，用来展示会话标题。

loading={sessionActionLoading}
  删除中禁用关闭和确认按钮。

onClose={() => setDeletingSession(null)}
  关闭弹窗，本质就是清空 deletingSession。

onConfirm={() => void handleConfirmDelete()}
  点击确认删除时，由 ChatPage 里的 handleConfirmDelete 调接口。
```

完整删除链路：

```txt
ChatHistoryItem 点击“删除”
-> onDelete(session)
-> ChatPage.handleDelete(session)
-> setDeletingSession(session)
-> ChatPage 渲染 DeleteSessionModal
-> 用户点击确认删除
-> DeleteSessionModal 调 onConfirm()
-> ChatPage.handleConfirmDelete()
-> deleteSession(...)
-> 更新 sessions
-> 如果删除的是 activeSessionId，切换到下一条
-> setDeletingSession(null)
-> 弹窗关闭
```

#### 40.5.10 删除弹窗样式

修改：

```txt
frontend/src/styles/modal.css
```

增加：

```css
.delete-session-warning {
  margin: 0 0 12px;
  color: #475467;
  font-size: 14px;
  line-height: 1.6;
}

.delete-session-title {
  border: 1px solid #fee4e2;
  border-radius: 6px;
  background: #fffbfa;
  color: #b42318;
  padding: 10px 12px;
  font-size: 14px;
  word-break: break-all;
}

.app-modal-footer .danger {
  background: #d92d20;
  color: #fff;
}

.app-modal-footer .danger:hover:not(:disabled) {
  background: #b42318;
}
```

如果 `.app-modal-footer` 里已经有按钮样式，保留现有结构，只补危险按钮状态即可。

#### 40.5.11 删除验收

完成后确认：

1. 点击三点菜单里的删除，会打开 `AppModal` 确认弹窗。
2. 弹窗展示当前会话标题。
3. 点击取消不会删除。
4. 点击删除时显示 `删除中...`。
5. 删除成功后历史记录消失。
6. 删除当前正在展示的会话后，自动选中剩余第一条。
7. 删除最后一条会话后，页面进入无会话状态。
8. 删除失败时弹窗不关闭。
9. 没有使用 `window.confirm`。

### 40.6 ChatPage 最终挂载结构

这一节只写最后怎么把 `ChatHistoryItem` 和两个弹窗接到页面里。

#### 40.6.1 历史记录列表渲染

把原来的简单按钮列表替换成：

```tsx
{sessions.map(session => (
  <ChatHistoryItem
    key={session.id}
    session={session}
    isActive={session.id === activeSessionId}
    isMenuOpen={openActionSessionId === session.id}
    actionLoading={sessionActionLoading}
    onSelectSession={handleSelectSession}
    onOpenMenu={handleOpenActionMenu}
    onCloseMenu={handleCloseActionMenu}
    onRename={handleRename}
    onUp={handleUp}
    onDelete={handleDelete}
  />
))}
```

#### 40.6.2 弹窗挂载位置核对

两个弹窗的具体使用逻辑已经分别写在：

```txt
40.3.5 在 ChatPage 里使用 RenameSessionModal
40.5.9 在 ChatPage 里使用 DeleteSessionModal
```

这里再做一次最终核对。

两个弹窗都必须挂在 `ChatPage` return 的最外层。

不要放进 `ChatHistoryItem`。

不要放进历史记录列表内部。

结构：

```tsx
return (
  <>
    <main className={`chat-page ${historyCollapsed ? 'is-history-collapsed' : ''}`}>
      ...页面内容...
    </main>

    {renamingSession && (
      <RenameSessionModal
        key={renamingSession.id}
        session={renamingSession}
        loading={sessionActionLoading}
        onClose={() => setRenamingSession(null)}
        onConfirm={title => void handleConfirmRename(title)}
      />
    )}

    {deletingSession && (
      <DeleteSessionModal
        session={deletingSession}
        loading={sessionActionLoading}
        onClose={() => setDeletingSession(null)}
        onConfirm={() => void handleConfirmDelete()}
      />
    )}
  </>
)
```

#### 40.6.3 loading 时关闭按钮处理

如果 `sessionActionLoading` 为 `true`：

1. 重命名弹窗的保存按钮禁用。
2. 删除弹窗的删除按钮禁用。
3. 弹窗关闭按钮禁用。
4. 三点菜单里的菜单项禁用。

这样避免重复提交。

### 40.7 本轮不做的事

这一轮只做历史记录项操作。

不做：

1. 不改消息发送逻辑。
2. 不改首次提问生成标题逻辑。
3. 不改历史栏展开/收起逻辑。
4. 不改用户已经修好的聊天区滚动结构。
5. 不改输入框固定在底部的实现。
6. 不做拖拽排序。
7. 不做批量删除。
8. 不做移动端适配。
9. 不把 `AppModal` 换成原生弹窗。

### 40.8 构建和检查

后端检查：

```bash
cd backend
python -m compileall app
```

前端构建：

```bash
cd frontend
pnpm build
```

如果 `pnpm` 不可用：

```bash
node_modules/.bin/tsc -b
node_modules/.bin/vite build
```

### 40.9 总体验收标准

完成第 40 步后，确认：

1. 鼠标 hover 历史记录项时，右侧出现无边框三点按钮。
2. 点击三点按钮后，出现操作菜单。
3. 操作菜单包含：重命名、置顶/取消置顶、删除。
4. 点击历史记录主体区域能正常切换会话。
5. 点击三点按钮和菜单项不会误触发切换会话。
6. 重命名使用 `RenameSessionModal`，不使用 `window.prompt`。
7. 删除使用 `DeleteSessionModal`，不使用 `window.confirm`。
8. 置顶不弹窗，直接调用接口并重新排序。
9. 删除当前会话后能自动切到下一条。
10. 删除最后一条后进入无会话状态。
11. `DELETE 204` 不会导致前端 JSON 解析报错。
12. `python -m compileall app` 通过。
13. `pnpm build` 通过。

### 40.10 这一步真正的执行顺序

按这个顺序做，不要跳：

1. 补公共基础：`ChatSessionUpdate`、`updateSession`、共享状态、`sortSessions`。
2. 补 `ChatHistoryItem` 和三点菜单基础样式。
3. 做重命名整块：菜单项、`handleRename`、`handleConfirmRename`、`RenameSessionModal`、重命名样式。
4. 做置顶整块：`pinned` 字段、列表排序、菜单项、`handleUp`、置顶样式。
5. 做删除整块：后端 DELETE、`http.ts` 204、`deleteSession`、菜单项、`handleDelete`、`handleConfirmDelete`、`DeleteSessionModal`、删除样式。
6. 把两个弹窗挂到 `ChatPage` 最外层。
7. 执行后端检查和前端构建。

## 第 41 步：前端测试和提交前校验

第 41 步直接写前端测试代码，不只写测试思路。

目标：

```txt
安装 Vitest 和 Testing Library。
补测试配置。
写 4 个测试文件。
增加 pnpm test / pnpm check 命令。
最后用 pnpm check 把 lint、test、build 串起来。
```

这一步先不做后端测试，不做 E2E。

这一步要加 Husky 和 GitHub Actions：

```txt
Husky
  负责本地提交/推送前自动检查。

GitHub Actions
  负责远程仓库里的最终 CI 校验。
```

原因：

```txt
当前是讲解 demo，先把前端关键组件和请求封装测起来。
Husky 和 GitHub Actions 只接前端 check，不把后端测试和 E2E 一起塞进来。
```

### 41.1 安装测试依赖

前端测试依赖安装在 `frontend` 目录：

```bash
cd frontend
pnpm add -D vitest jsdom @testing-library/react @testing-library/jest-dom @testing-library/user-event
```

这些包的作用：

| 包 | 作用 |
| --- | --- |
| `vitest` | 跑测试 |
| `jsdom` | 模拟浏览器 DOM |
| `@testing-library/react` | 渲染和查询 React 组件 |
| `@testing-library/jest-dom` | 增加 DOM 断言，比如 `toBeInTheDocument` |
| `@testing-library/user-event` | 模拟用户点击、输入、hover |

Husky 不装在 `frontend` 里。

原因：

```txt
Husky 管的是 Git hooks。
Git hooks 属于整个 Git 仓库。
这个项目的 .git 在 full-stack-demo 根目录。
所以 Husky 放在仓库根目录更合理。
```

### 41.2 新增 Vitest 配置

新增文件：

```txt
frontend/vitest.config.ts
```

代码：

```ts
import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: './src/test/setup.ts',
    css: true,
  },
})
```

说明：

```txt
environment: 'jsdom'
  让组件测试能使用 document、window、HTMLElement。

globals: true
  测试里可以直接写 describe / it / expect，不用每个文件都 import。

setupFiles
  统一加载 jest-dom 断言。

css: true
  允许组件测试里 import css。
```

### 41.3 新增测试 setup

新增文件：

```txt
frontend/src/test/setup.ts
```

代码：

```ts
import '@testing-library/jest-dom/vitest'
```

### 41.4 修改 tsconfig.app.json

修改：

```txt
frontend/tsconfig.app.json
```

当前里面有：

```json
"types": ["vite/client"]
```

改成：

```json
"types": ["vite/client", "vitest/globals", "@testing-library/jest-dom"]
```

原因：

```txt
让 TypeScript 认识 describe、it、expect、toBeInTheDocument、toBeDisabled 等测试 API。
```

### 41.5 修改 package.json scripts

修改：

```txt
frontend/package.json
```

把 scripts 改成包含这些命令：

```json
{
  "dev": "vite",
  "build": "tsc -b && vite build",
  "lint": "eslint .",
  "preview": "vite preview",
  "test": "vitest run",
  "test:watch": "vitest",
  "check": "pnpm lint && pnpm test && pnpm build"
}
```

命令含义：

```txt
pnpm test
  跑一次全部测试。

pnpm test:watch
  开发时监听文件变化。

pnpm check
  提交前跑完整前端校验：lint -> test -> build。
```

业务里一般会把 `pnpm check` 放到 CI 里。

本轮还会在仓库根目录把 `frontend` 的 `pnpm check` 接到 Husky 和 GitHub Actions 里。

### 41.6 测试 http.ts

新增文件：

```txt
frontend/src/api/http.test.ts
```

完整代码：

```ts
import { afterEach, describe, expect, it, vi } from 'vitest'
import { http } from './http'

const mockFetch = (response: Response) => {
  const fetchMock = vi.fn().mockResolvedValue(response)
  vi.stubGlobal('fetch', fetchMock)
  return fetchMock
}

describe('http', () => {
  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it('parses JSON response', async () => {
    const fetchMock = mockFetch(
      new Response(JSON.stringify({ database: 'ok' }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      }),
    )

    await expect(http.get<{ database: string }>('/api/health')).resolves.toEqual({
      database: 'ok',
    })

    expect(fetchMock).toHaveBeenCalledWith(
      '/api/health',
      expect.objectContaining({
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      }),
    )
  })

  it('returns undefined for 204 response', async () => {
    mockFetch(new Response(null, { status: 204 }))

    await expect(http.delete<void>('/api/sessions/1')).resolves.toBeUndefined()
  })

  it('returns undefined for empty successful response body', async () => {
    mockFetch(new Response('', { status: 200 }))

    await expect(http.get<void>('/api/empty')).resolves.toBeUndefined()
  })

  it('throws error when response is not ok', async () => {
    mockFetch(new Response('session not found', { status: 404 }))

    await expect(http.get('/api/sessions/999')).rejects.toThrow('session not found')
  })
})
```

这个文件重点测的是：

```txt
DELETE 204 没有 body 时，http.delete 不会因为 response.json() 报错。
```

### 41.7 测试 ChatHistoryItem

新增文件：

```txt
frontend/src/components/ChatHistoryItem.test.tsx
```

完整代码：

```tsx
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import ChatHistoryItem from './ChatHistoryItem'
import type { ComponentProps } from 'react'
import type { ChatSession } from '../api/types'

type ChatHistoryItemProps = ComponentProps<typeof ChatHistoryItem>

const session: ChatSession = {
  id: 1,
  title: '政企行业收入筛选',
  pinned: false,
  created_at: '2026-07-02T10:00:00Z',
  updated_at: '2026-07-02T10:00:00Z',
  messages: [],
}

const renderItem = (overrideProps: Partial<ChatHistoryItemProps> = {}) => {
  const props = {
    session,
    isActive: false,
    isMenuOpen: true,
    actionLoading: false,
    onSelectSession: vi.fn(),
    onOpenMenu: vi.fn(),
    onCloseMenu: vi.fn(),
    onRename: vi.fn(),
    onUp: vi.fn(),
    onDelete: vi.fn(),
    ...overrideProps,
  }

  const view = render(<ChatHistoryItem {...props} />)

  return {
    ...view,
    props,
  }
}

describe('ChatHistoryItem', () => {
  it('renders session title', () => {
    renderItem()

    expect(screen.getByText('政企行业收入筛选')).toBeInTheDocument()
  })

  it('adds active class when current session is active', () => {
    const { container } = renderItem({ isActive: true })

    expect(container.querySelector('.chat-history-item')).toHaveClass('active')
  })

  it('opens and closes action menu on hover area', async () => {
    const user = userEvent.setup()
    const { props } = renderItem()
    const moreButton = screen.getByLabelText('更多操作')
    const moreWrap = moreButton.parentElement as HTMLElement

    await user.hover(moreWrap)
    expect(props.onOpenMenu).toHaveBeenCalledWith(session.id)

    await user.unhover(moreWrap)
    expect(props.onCloseMenu).toHaveBeenCalled()
  })

  it('selects session when clicking history item body', async () => {
    const user = userEvent.setup()
    const { props } = renderItem()

    await user.click(screen.getByText('政企行业收入筛选'))

    expect(props.onSelectSession).toHaveBeenCalledWith(session.id)
  })

  it('calls rename callback and does not select session', async () => {
    const user = userEvent.setup()
    const { props } = renderItem()

    await user.click(screen.getByRole('button', { name: '重命名' }))

    expect(props.onRename).toHaveBeenCalledWith(session)
    expect(props.onSelectSession).not.toHaveBeenCalled()
  })

  it('calls pin callback and does not select session', async () => {
    const user = userEvent.setup()
    const { props } = renderItem()

    await user.click(screen.getByRole('button', { name: '置顶' }))

    expect(props.onUp).toHaveBeenCalledWith(session)
    expect(props.onSelectSession).not.toHaveBeenCalled()
  })

  it('calls delete callback and does not select session', async () => {
    const user = userEvent.setup()
    const { props } = renderItem()

    await user.click(screen.getByRole('button', { name: '删除' }))

    expect(props.onDelete).toHaveBeenCalledWith(session)
    expect(props.onSelectSession).not.toHaveBeenCalled()
  })

  it('disables menu actions when action is loading', () => {
    renderItem({ actionLoading: true })

    expect(screen.getByRole('button', { name: '重命名' })).toBeDisabled()
    expect(screen.getByRole('button', { name: '置顶' })).toBeDisabled()
    expect(screen.getByRole('button', { name: '删除' })).toBeDisabled()
  })

  it('shows cancel pin text when session is pinned', () => {
    renderItem({
      session: {
        ...session,
        pinned: true,
      },
    })

    expect(screen.getByRole('button', { name: '取消置顶' })).toBeInTheDocument()
  })
})
```

注意：

这里测的是 `ChatHistoryItem` 是否正确把事件交给父组件。

不在这里测接口。

### 41.8 测试 RenameSessionModal

新增文件：

```txt
frontend/src/components/RenameSessionModal.test.tsx
```

完整代码：

```tsx
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import RenameSessionModal from './RenameSessionModal'
import type { ComponentProps } from 'react'

type RenameSessionModalProps = ComponentProps<typeof RenameSessionModal>

const renderModal = (props?: Partial<RenameSessionModalProps>) => {
  const defaultProps = {
    oldTitle: '旧会话标题',
    loading: false,
    onClose: vi.fn(),
    onConfirm: vi.fn(),
  }

  const mergedProps = {
    ...defaultProps,
    ...props,
  }

  render(<RenameSessionModal {...mergedProps} />)

  return mergedProps
}

describe('RenameSessionModal', () => {
  it('renders old title as input value', () => {
    renderModal()

    expect(screen.getByLabelText('会话名称')).toHaveValue('旧会话标题')
  })

  it('disables save button when title is unchanged', () => {
    renderModal()

    expect(screen.getByRole('button', { name: '保存' })).toBeDisabled()
  })

  it('disables save button when title is empty', async () => {
    const user = userEvent.setup()
    renderModal()

    await user.clear(screen.getByLabelText('会话名称'))

    expect(screen.getByRole('button', { name: '保存' })).toBeDisabled()
  })

  it('calls onConfirm with normalized title', async () => {
    const user = userEvent.setup()
    const props = renderModal()
    const input = screen.getByLabelText('会话名称')

    await user.clear(input)
    await user.type(input, '  新   会话   标题  ')
    await user.click(screen.getByRole('button', { name: '保存' }))

    expect(props.onConfirm).toHaveBeenCalledWith('新 会话 标题')
  })

  it('calls onConfirm when pressing Enter with valid title', async () => {
    const user = userEvent.setup()
    const props = renderModal()
    const input = screen.getByLabelText('会话名称')

    await user.clear(input)
    await user.type(input, '新标题{Enter}')

    expect(props.onConfirm).toHaveBeenCalledWith('新标题')
  })

  it('calls onClose when clicking cancel', async () => {
    const user = userEvent.setup()
    const props = renderModal()

    await user.click(screen.getByRole('button', { name: '取消' }))

    expect(props.onClose).toHaveBeenCalled()
  })

  it('disables input and buttons while loading', () => {
    renderModal({ loading: true })

    expect(screen.getByLabelText('会话名称')).toBeDisabled()
    expect(screen.getByRole('button', { name: '取消' })).toBeDisabled()
    expect(screen.getByRole('button', { name: '保存中...' })).toBeDisabled()
    expect(screen.getByRole('button', { name: '关闭' })).toBeDisabled()
  })
})
```

### 41.9 测试 DeleteSessionModal

新增文件：

```txt
frontend/src/components/DeleteSessionModal.test.tsx
```

完整代码：

```tsx
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import DeleteSessionModal from './DeleteSessionModal'
import type { ComponentProps } from 'react'

type DeleteSessionModalProps = ComponentProps<typeof DeleteSessionModal>

const renderModal = (props?: Partial<DeleteSessionModalProps>) => {
  const defaultProps = {
    title: '待删除会话',
    loading: false,
    onClose: vi.fn(),
    onConfirm: vi.fn(),
  }

  const mergedProps = {
    ...defaultProps,
    ...props,
  }

  render(<DeleteSessionModal {...mergedProps} />)

  return mergedProps
}

describe('DeleteSessionModal', () => {
  it('renders session title', () => {
    renderModal()

    expect(screen.getByText('待删除会话')).toBeInTheDocument()
    expect(screen.getByText('删除后，该会话及其消息记录将无法恢复。')).toBeInTheDocument()
  })

  it('calls onClose when clicking cancel', async () => {
    const user = userEvent.setup()
    const props = renderModal()

    await user.click(screen.getByRole('button', { name: '取消' }))

    expect(props.onClose).toHaveBeenCalled()
  })

  it('calls onConfirm when clicking delete', async () => {
    const user = userEvent.setup()
    const props = renderModal()

    await user.click(screen.getByRole('button', { name: '删除' }))

    expect(props.onConfirm).toHaveBeenCalled()
  })

  it('disables buttons while loading', () => {
    renderModal({ loading: true })

    expect(screen.getByRole('button', { name: '取消' })).toBeDisabled()
    expect(screen.getByRole('button', { name: '删除中...' })).toBeDisabled()
    expect(screen.getByRole('button', { name: '关闭' })).toBeDisabled()
  })
})
```

### 41.10 配置 Husky 本地 Git hooks

这一轮把本地提交校验也加上。

Husky 放在仓库根目录，不放在 `frontend` 目录。

原因：

```txt
Git hooks 是整个仓库级别的。
当前仓库的 .git 在 full-stack-demo 根目录。
所以 .husky 也应该在 full-stack-demo/.husky。
```

注意：

```txt
Husky 是本地辅助门禁。
它可以帮你少提交坏代码，但它不是最终门禁。
最终门禁还是 GitHub Actions 这种远程 CI。
```

#### 41.10.1 初始化 Husky

先在仓库根目录新增：

```txt
package.json
```

如果根目录已经有 `package.json`，就在原文件里合并下面的 scripts 和 devDependencies。

根目录 `package.json`：

```json
{
  "private": true,
  "scripts": {
    "prepare": "husky",
    "frontend:lint": "pnpm --dir frontend lint",
    "frontend:test": "pnpm --dir frontend test",
    "frontend:build": "pnpm --dir frontend build",
    "frontend:check": "pnpm --dir frontend check",
    "check": "pnpm frontend:check"
  },
  "devDependencies": {
    "husky": "^9.1.7"
  }
}
```

解释：

```txt
prepare
  pnpm install 后初始化 Husky。

pnpm --dir frontend ...
  在仓库根目录执行命令，但让 pnpm 进入 frontend 目录运行对应 script。

check
  根目录统一入口，当前只跑 frontend:check。
```

然后在仓库根目录执行：

```bash
pnpm install
pnpm exec husky init
```

执行后会生成：

```txt
.husky/pre-commit
```

默认里面可能是：

```sh
npm test
```

把它改成：

```sh
pnpm frontend:lint
```

也就是：

```txt
.husky/pre-commit
```

代码：

```sh
pnpm frontend:lint
```

为什么 pre-commit 只跑 lint：

```txt
commit 要尽量快。
lint 比 test + build 快很多。
太慢的 pre-commit 会影响开发体验。
```

#### 41.10.2 增加 pre-push

新增文件：

```txt
.husky/pre-push
```

代码：

```sh
pnpm frontend:check
```

含义：

```txt
git push 前自动跑完整前端检查：lint -> test -> build。
```

如果文件没有执行权限，执行：

```bash
chmod +x .husky/pre-push
```

#### 41.10.3 关于 hook 运行目录

因为 Husky 配在仓库根目录，所以 hook 里的命令也从仓库根目录执行。

正确写：

```sh
pnpm frontend:lint
pnpm frontend:check
```

不要写：

```sh
pnpm lint
pnpm check
```

原因：

```txt
根目录没有前端 lint/test/build 的直接实现。
真正的前端命令在 frontend/package.json 里。
所以根目录 hook 要通过 pnpm --dir frontend 转发。
```

### 41.11 配置 GitHub Actions

GitHub Actions 作为远程 CI。

新增目录和文件：

```txt
.github/workflows/frontend-check.yml
```

完整代码：

```yml
name: Frontend Check

on:
  push:
    branches:
      - main
  pull_request:
    branches:
      - main

jobs:
  frontend-check:
    runs-on: ubuntu-latest

    defaults:
      run:
        working-directory: frontend

    steps:
      - name: Checkout
        uses: actions/checkout@v4

      - name: Setup pnpm
        uses: pnpm/action-setup@v4
        with:
          version: 11.9.0

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: 22
          cache: pnpm
          cache-dependency-path: frontend/pnpm-lock.yaml

      - name: Install dependencies
        run: pnpm install --frozen-lockfile

      - name: Run frontend check
        run: pnpm check
```

#### 41.11.1 这个文件放在哪里

文件路径：

```txt
.github/workflows/frontend-check.yml
```

含义：

```txt
.github/workflows
  GitHub Actions 约定读取 workflow 的目录。

frontend-check.yml
  这个 workflow 的配置文件名，可以自定义。
```

只要这个文件被提交到 GitHub，GitHub 就会自动识别它。

#### 41.11.2 name

```yml
name: Frontend Check
```

含义：

```txt
这个 workflow 在 GitHub Actions 页面显示的名字。
```

比如 GitHub 页面里会看到：

```txt
Frontend Check
```

这个名字只影响展示，不影响执行逻辑。

#### 41.11.3 on：什么时候触发

```yml
on:
  push:
    branches:
      - main
  pull_request:
    branches:
      - main
```

`on` 表示这个 workflow 什么时候运行。

这里配置了两种触发方式。

第一种：

```yml
push:
  branches:
    - main
```

含义：

```txt
只要有代码 push 到 main 分支，就运行这个 CI。
```

第二种：

```yml
pull_request:
  branches:
    - main
```

含义：

```txt
如果有人提交 PR，并且目标分支是 main，也运行这个 CI。
```

所以这个 workflow 会在这两种场景跑：

```txt
直接 push main
提交/更新合并到 main 的 PR
```

#### 41.11.4 jobs：要跑哪些任务

```yml
jobs:
  frontend-check:
```

`jobs` 表示这一套 workflow 里有哪些任务。

这里目前只有一个任务：

```txt
frontend-check
```

这个名字可以自定义。

如果以后要加后端检查，可以继续加：

```yml
jobs:
  frontend-check:
    ...

  backend-check:
    ...
```

当前第 41 步只做前端，所以只保留 `frontend-check`。

#### 41.11.5 runs-on：运行环境

```yml
runs-on: ubuntu-latest
```

含义：

```txt
让 GitHub 提供一台临时的 Ubuntu Linux 虚拟机来跑这个任务。
```

它不是你的电脑。

每次 CI 运行时，GitHub 都会准备一个干净环境：

```txt
拉代码
装 Node
装 pnpm
装依赖
跑检查
任务结束后销毁环境
```

为什么用 `ubuntu-latest`：

```txt
前端构建和测试不依赖 macOS。
Ubuntu 速度快、成本低，也是 CI 最常见选择。
```

#### 41.11.6 defaults.run.working-directory

```yml
defaults:
  run:
    working-directory: frontend
```

含义：

```txt
后面所有 run 命令，默认都在 frontend 目录执行。
```

所以这里：

```yml
- name: Install dependencies
  run: pnpm install --frozen-lockfile

- name: Run frontend check
  run: pnpm check
```

实际等价于：

```bash
cd frontend
pnpm install --frozen-lockfile
pnpm check
```

为什么要这样写：

```txt
因为当前前端 package.json 在 frontend 目录。
pnpm check 也是 frontend/package.json 里的 script。
```

如果不写 `working-directory: frontend`，CI 会在仓库根目录执行：

```bash
pnpm check
```

但如果根目录没有对应脚本，就会失败。

#### 41.11.7 steps：任务里的具体步骤

```yml
steps:
```

`steps` 表示这个 job 里按顺序执行哪些步骤。

每个 step 都会从上往下执行。

当前顺序是：

```txt
1. Checkout
2. Setup pnpm
3. Setup Node.js
4. Install dependencies
5. Run frontend check
```

#### 41.11.8 Checkout

```yml
- name: Checkout
  uses: actions/checkout@v4
```

含义：

```txt
把 GitHub 仓库里的代码拉到 CI 虚拟机里。
```

如果没有这一步，后面的 CI 环境里没有你的项目代码。

`uses` 表示使用别人已经写好的 GitHub Action。

这里用的是官方 action：

```txt
actions/checkout@v4
```

`@v4` 是版本号。

#### 41.11.9 Setup pnpm

```yml
- name: Setup pnpm
  uses: pnpm/action-setup@v4
  with:
    version: 11.9.0
```

含义：

```txt
在 CI 机器里安装 pnpm。
```

为什么要装：

```txt
GitHub 的 Ubuntu 环境默认不一定有你项目需要的 pnpm 版本。
```

这里指定：

```yml
version: 11.9.0
```

是为了和你本地当前 pnpm 版本保持一致。

#### 41.11.10 Setup Node.js

```yml
- name: Setup Node.js
  uses: actions/setup-node@v4
  with:
    node-version: 22
    cache: pnpm
    cache-dependency-path: frontend/pnpm-lock.yaml
```

含义：

```txt
安装 Node.js 22。
并开启 pnpm 依赖缓存。
```

`node-version: 22`：

```txt
指定 CI 使用 Node 22。
```

`cache: pnpm`：

```txt
告诉 GitHub Actions 缓存 pnpm 下载过的依赖。
下次 CI 可以更快。
```

`cache-dependency-path: frontend/pnpm-lock.yaml`：

```txt
告诉 GitHub：用 frontend/pnpm-lock.yaml 判断缓存是否需要更新。
```

如果 `pnpm-lock.yaml` 变化，说明依赖可能变了，缓存就会刷新。

#### 41.11.11 Install dependencies

```yml
- name: Install dependencies
  run: pnpm install --frozen-lockfile
```

因为前面设置了：

```yml
working-directory: frontend
```

所以这一步实际在执行：

```bash
cd frontend
pnpm install --frozen-lockfile
```

`--frozen-lockfile` 的意思：

```txt
严格按照 pnpm-lock.yaml 安装。
如果 package.json 和 pnpm-lock.yaml 对不上，直接失败。
```

为什么 CI 要这样：

```txt
CI 应该验证仓库里提交的锁文件是否完整可靠。
不能让 CI 自动改 lockfile。
```

如果你本地新增依赖后忘了提交 `pnpm-lock.yaml`，这一步会失败。

这正是它的价值。

#### 41.11.12 Run frontend check

```yml
- name: Run frontend check
  run: pnpm check
```

因为前面设置了 `working-directory: frontend`，所以实际执行：

```bash
cd frontend
pnpm check
```

而 `frontend/package.json` 里：

```json
"check": "pnpm lint && pnpm test && pnpm build"
```

所以 CI 最终会按顺序跑：

```txt
pnpm lint
pnpm test
pnpm build
```

也就是：

```txt
代码规范检查
前端测试
TypeScript + Vite 构建
```

任何一步失败，GitHub Actions 都会失败。

#### 41.11.13 整个 workflow 的执行流程

完整流程可以理解成：

```txt
push / PR 到 main
-> GitHub 创建 Ubuntu 临时机器
-> Checkout 拉代码
-> 安装 pnpm
-> 安装 Node 22
-> 进入 frontend 目录
-> pnpm install --frozen-lockfile
-> pnpm check
-> lint/test/build 都通过，CI 成功
-> 任意一步失败，CI 失败
```

#### 41.11.14 和 Husky 的区别

Husky：

```txt
在你本机运行。
commit / push 前触发。
可以被跳过。
依赖你本机环境。
```

GitHub Actions：

```txt
在 GitHub 服务器运行。
push / PR 后触发。
更适合当团队最终门禁。
环境更干净。
```

所以两者关系是：

```txt
Husky 提前帮你发现问题。
GitHub Actions 最终确认远程代码没问题。
```

简短解释：

```txt
defaults.run.working-directory: frontend
  后面的 pnpm install 和 pnpm check 都在 frontend 目录执行。

pnpm install --frozen-lockfile
  CI 里严格按照 pnpm-lock.yaml 安装，防止依赖漂移。

pnpm check
  统一跑 lint、test、build。
```

为什么还要 CI：

```txt
Husky 是本地检查，可以被跳过。
GitHub Actions 是远程检查，团队协作时更可靠。
```

### 41.12 运行测试和校验

本地先执行：

```bash
cd frontend
pnpm test
pnpm check
```

然后测试 Husky：

```bash
git add frontend plan.md
git commit -m "Add frontend tests"
```

预期：

```txt
commit 前自动跑 pnpm frontend:lint。
```

再测试 pre-push：

```bash
git push
```

预期：

```txt
push 前自动跑 pnpm check。
```

注意：

如果只是想本地验证 hook，不一定真的要提交最终代码。
可以等第 41 步全部完成后统一提交。

### 41.13 这一轮不做的事

这一步不做：

1. 不写后端测试。
2. 不写 E2E 测试。
3. 不接真实后端。
4. 不追求覆盖率数字。
5. 不配置覆盖率上传服务。

### 41.14 验收标准

完成后确认：

1. `pnpm test` 通过。
2. `pnpm check` 通过。
3. `http.ts` 的 204 空响应有测试。
4. `ChatHistoryItem` 的 hover、重命名、置顶、删除回调有测试。
5. `RenameSessionModal` 的输入、保存、取消、loading 有测试。
6. `DeleteSessionModal` 的标题展示、取消、确认删除、loading 有测试。
7. 测试代码没有连接真实后端。
8. 测试代码没有依赖接口服务启动。
9. 根目录 `package.json` 存在，并提供 `frontend:lint`、`frontend:check`、`check`、`prepare`。
10. `.husky/pre-commit` 存在，并执行 `pnpm frontend:lint`。
11. `.husky/pre-push` 存在，并执行 `pnpm frontend:check`。
12. `.github/workflows/frontend-check.yml` 存在。
13. GitHub Actions 里会执行 `pnpm check`。

## 第 42 步：后端测试和接口校验

第 41 步已经把前端测试基本接起来了。

第 42 步开始补后端测试。

后端测试和前端测试最大的区别是：

```txt
前端测试：
  主要验证组件、交互、请求函数。
  多数情况下不需要真实后端。

后端测试：
  主要验证接口、数据库写入、数据库读取、异常状态码。
  通常需要一个独立的测试数据库。
```

这一轮先不把测试做得很复杂。

目标是：

```txt
用 pytest + FastAPI TestClient 测三个页面的核心接口。
用独立 PostgreSQL 测试库，不污染开发库。
把后端测试接进本地 check 和 GitHub Actions。
```

### 42.1 这一轮要测什么

这一轮后端测试要覆盖三个页面：

```txt
智能问数页
应用配置页
回复校对页
```

对应后端就是三组 router：

```txt
chat.py
settings.py
feedbacks.py
```

第一组：智能问数页，对应 `chat.py`：

```txt
POST   /api/sessions
GET    /api/sessions
GET    /api/sessions/{session_id}
PATCH  /api/sessions/{session_id}
DELETE /api/sessions/{session_id}
POST   /api/sessions/{session_id}/messages
```

这些接口覆盖了当前前端正在用的主要能力：

```txt
创建会话
读取历史记录
读取单个会话
发送用户消息
生成 mock AI 回复
第一条用户消息覆盖默认标题
重命名会话
置顶会话
删除会话
```

第二组：应用配置页，对应 `settings.py`：

```txt
GET   /api/settings
PATCH /api/settings/{code}
```

这些接口覆盖：

```txt
读取应用配置列表
更新某个配置的 enabled
更新某个配置的 config
配置不存在时返回 404
```

第三组：回复校对页，对应 `feedbacks.py`：

```txt
POST  /api/feedbacks
GET   /api/feedbacks
GET   /api/feedbacks/{feedback_id}
PATCH /api/feedbacks/{feedback_id}
```

这些接口覆盖：

```txt
创建一条待处理反馈
分页读取反馈列表
按问题关键字筛选
按用户筛选
按状态筛选
读取反馈详情
把反馈处理为 resolved
把反馈改回 pending
保存处理备注
```

所以第 42 步不是只测聊天接口，而是按三个页面拆成三组测试。

文件也按页面拆开：

```txt
test_chat_api.py
test_settings_api.py
test_feedback_api.py
```

这样后面哪个页面出问题，就看对应测试文件。

暂时不测：

```txt
真实 AI
浏览器 E2E
覆盖率阈值
```

原因很简单：

```txt
现在先测三个页面的核心业务。
不把真实 AI、浏览器自动化、覆盖率门槛一起塞进来。
```

### 42.2 后端测试用什么工具

这一步用：

```txt
pytest
FastAPI TestClient
httpx
SQLAlchemy
PostgreSQL 测试库
```

分别解释一下。

`pytest`：

```txt
Python 里最常用的测试框架。
负责发现 test_ 开头的测试文件和测试函数，然后执行它们。
```

`FastAPI TestClient`：

```txt
FastAPI 提供的测试客户端。
它可以在不启动 uvicorn 的情况下，直接请求 FastAPI app。
```

也就是说，测试里可以这样写：

```py
response = client.post("/api/sessions", json={"title": "新的智能问数"})
```

它看起来像真的 HTTP 请求。

但实际上：

```txt
没有打开浏览器。
没有启动 8000 端口。
没有真的走网络。
```

它是直接调用 FastAPI 应用内部的路由逻辑。

`httpx`：

```txt
TestClient 底层依赖的 HTTP 客户端库。
不直接写 httpx 代码，但需要安装它。
```

`SQLAlchemy`：

```txt
项目当前 ORM。
测试时用它创建测试数据库连接、建表、清表。
```

`PostgreSQL 测试库`：

```txt
专门给测试用的数据库。
每次测试前清空并重新建表。
```

### 42.3 为什么后端测试不要直接用开发数据库

不要让测试直接连现在开发用的：

```txt
fullstack_demo
```

原因：

```txt
测试会创建数据。
测试会删除数据。
测试为了保证结果稳定，经常会清空表。
```

如果直接连开发库，可能把你手动调接口产生的数据清掉。

所以要单独建一个：

```txt
fullstack_demo_test
```

开发库：

```txt
fullstack_demo
  给你平时启动后端、Swagger 调接口、前端联调用。
```

测试库：

```txt
fullstack_demo_test
  只给 pytest 用。
  可以随时 drop table、create table。
  数据丢了也无所谓。
```

### 42.4 为什么这里不建议用 SQLite 内存数据库

很多教程会用：

```txt
sqlite:///:memory:
```

但是这个项目不适合直接这么做。

因为当前模型里用了 PostgreSQL 专属字段：

```py
from sqlalchemy.dialects.postgresql import JSONB
```

例如：

```py
answer_data: Mapped[dict | None] = mapped_column(JSONB, nullable=True)
config: Mapped[dict] = mapped_column(JSONB, default=dict, nullable=False)
```

`JSONB` 是 PostgreSQL 的类型。

SQLite 没有真正的 `JSONB`。

如果强行用 SQLite，会有两个问题：

```txt
1. 建表可能失败。
2. 即使绕过去，也测不到 PostgreSQL 真实行为。
```

所以这一步用 PostgreSQL 测试库。

这样虽然多一步数据库准备，但更接近真实项目。

### 42.5 添加后端测试依赖

新增文件：

```txt
backend/requirements-dev.txt
```

内容：

```txt
-r requirements.txt
pytest
httpx
```

解释：

```txt
-r requirements.txt
  表示先安装后端正式依赖。

pytest
  测试框架。

httpx
  FastAPI TestClient 底层需要。
```

安装命令：

```bash
cd backend
source .venv/bin/activate
python -m pip install -r requirements-dev.txt
```

这里用 `requirements-dev.txt` 的原因是：

```txt
requirements.txt
  放运行项目必须要的依赖。

requirements-dev.txt
  放开发和测试时才需要的依赖。
```

比如 `pytest` 只在开发测试时需要。

线上运行后端服务不一定需要它。

### 42.6 准备 PostgreSQL 测试数据库

先确认数据库容器启动：

```bash
docker compose up -d postgres
```

然后创建测试数据库：

```bash
docker compose exec postgres createdb -U archer fullstack_demo_test
```

如果提示：

```txt
database "fullstack_demo_test" already exists
```

说明之前已经创建过。

可以不用管。

如果想重建测试库，可以执行：

```bash
docker compose exec postgres dropdb -U archer --if-exists fullstack_demo_test
docker compose exec postgres createdb -U archer fullstack_demo_test
```

注意：

```txt
这里只能删 fullstack_demo_test。
不要删 fullstack_demo。
```

测试库连接地址是：

```txt
postgresql+psycopg://archer:123456@localhost:5432/fullstack_demo_test
```

和开发库的区别只有数据库名：

```txt
开发库：fullstack_demo
测试库：fullstack_demo_test
```

### 42.7 新建测试目录结构

新增：

```txt
backend/tests/
backend/tests/conftest.py
backend/tests/test_chat_api.py
backend/tests/test_settings_api.py
backend/tests/test_feedback_api.py
```

目录含义：

```txt
tests/
  放后端测试代码。

conftest.py
  pytest 的公共配置文件。
  这里放测试数据库连接、建表、TestClient。

test_chat_api.py
  专门测试聊天会话接口。

test_settings_api.py
  专门测试应用配置接口。

test_feedback_api.py
  专门测试回复校对接口。
```

`conftest.py` 是 pytest 的特殊文件。

它里面定义的 fixture，可以在测试函数里直接使用。

比如测试函数写：

```py
def test_create_session(client):
    ...
```

这里的 `client` 不需要手动 import。

pytest 会自动从 `conftest.py` 里找到它。

### 42.8 编写 conftest.py

新增文件：

```txt
backend/tests/conftest.py
```

代码：

```py
import os
from collections.abc import Generator

import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import Session, sessionmaker

from app.db.base import Base
from app.db.session import get_db
from app.main import app
from app.models import AppSetting, ChatMessage, ChatSession, Feedback  # noqa: F401


TEST_DATABASE_URL = os.getenv(
    "TEST_DATABASE_URL",
    "postgresql+psycopg://archer:123456@localhost:5432/fullstack_demo_test",
)

test_engine = create_engine(TEST_DATABASE_URL, echo=False)
TestingSessionLocal = sessionmaker(
    bind=test_engine,
    autoflush=False,
    autocommit=False,
)


@pytest.fixture()
def db_session() -> Generator[Session, None, None]:
    Base.metadata.drop_all(bind=test_engine)
    Base.metadata.create_all(bind=test_engine)

    db = TestingSessionLocal()
    try:
        yield db
    finally:
        db.close()
        Base.metadata.drop_all(bind=test_engine)


@pytest.fixture()
def client(db_session: Session) -> Generator[TestClient, None, None]:
    def override_get_db() -> Generator[Session, None, None]:
        yield db_session

    app.dependency_overrides[get_db] = override_get_db

    with TestClient(app) as test_client:
        yield test_client

    app.dependency_overrides.clear()
```

这一段很重要，拆开解释。

#### 42.8.1 TEST_DATABASE_URL

```py
TEST_DATABASE_URL = os.getenv(
    "TEST_DATABASE_URL",
    "postgresql+psycopg://archer:123456@localhost:5432/fullstack_demo_test",
)
```

含义：

```txt
如果环境变量里有 TEST_DATABASE_URL，就用环境变量。
如果没有，就用本地默认测试库地址。
```

本地跑测试时，一般不用传环境变量。

GitHub Actions 跑测试时，可以显式传：

```txt
TEST_DATABASE_URL=postgresql+psycopg://archer:123456@localhost:5432/fullstack_demo_test
```

这样本地和 CI 都能用同一套测试代码。

#### 42.8.2 test_engine

```py
test_engine = create_engine(TEST_DATABASE_URL, echo=False)
```

这个是测试专用数据库 engine。

不要用 `app.db.session` 里的 `engine`。

因为原来的 `engine` 默认连的是开发库：

```txt
fullstack_demo
```

测试这里要连：

```txt
fullstack_demo_test
```

#### 42.8.3 TestingSessionLocal

```py
TestingSessionLocal = sessionmaker(
    bind=test_engine,
    autoflush=False,
    autocommit=False,
)
```

这个是测试专用 Session 工厂。

接口里平时用的是：

```py
SessionLocal
```

测试里用：

```py
TestingSessionLocal
```

这样测试的数据库读写就不会跑到开发库。

#### 42.8.4 db_session fixture

```py
@pytest.fixture()
def db_session() -> Generator[Session, None, None]:
    Base.metadata.drop_all(bind=test_engine)
    Base.metadata.create_all(bind=test_engine)

    db = TestingSessionLocal()
    try:
        yield db
    finally:
        db.close()
        Base.metadata.drop_all(bind=test_engine)
```

这段负责每个测试函数开始前：

```txt
删除测试库里的表
重新创建测试库里的表
创建一个数据库 session
```

测试函数结束后：

```txt
关闭 session
删除测试库里的表
```

这样每个测试都是干净的。

例如：

```txt
test_create_session 创建了 id=1 的会话。
test_delete_session 不会受到上一条数据影响。
```

#### 42.8.5 为什么要 import models

```py
from app.models import AppSetting, ChatMessage, ChatSession, Feedback  # noqa: F401
```

这行看起来没有直接用。

但是它很重要。

原因是：

```txt
SQLAlchemy 的 Base.metadata 需要知道有哪些模型。
模型被 import 之后，表结构才会注册到 Base.metadata 里。
```

如果不 import 模型，可能出现：

```txt
Base.metadata.create_all 执行了，但没有创建表。
```

`# noqa: F401` 的意思是：

```txt
告诉 lint：我知道这些 import 看起来没用，但这里是故意的。
```

#### 42.8.6 client fixture

```py
@pytest.fixture()
def client(db_session: Session) -> Generator[TestClient, None, None]:
    def override_get_db() -> Generator[Session, None, None]:
        yield db_session

    app.dependency_overrides[get_db] = override_get_db

    with TestClient(app) as test_client:
        yield test_client

    app.dependency_overrides.clear()
```

后端接口里现在大量使用：

```py
db: Session = Depends(get_db)
```

正常启动服务时，`get_db` 会创建开发库 session。

测试时不能用开发库 session。

所以这里用：

```py
app.dependency_overrides[get_db] = override_get_db
```

意思是：

```txt
测试期间，只要接口想调用 get_db，
就改用 override_get_db。
```

而 `override_get_db` 返回的是：

```txt
db_session
```

也就是测试库 session。

这就是 FastAPI 测试里非常常用的依赖替换。

### 42.9 编写 chat API 测试

新增文件：

```txt
backend/tests/test_chat_api.py
```

代码：

```py
from fastapi.testclient import TestClient


def create_session(client: TestClient, title: str = "新的智能问数") -> dict:
    response = client.post("/api/sessions", json={"title": title})
    assert response.status_code == 200
    return response.json()


def test_create_session(client: TestClient):
    data = create_session(client)

    assert data["title"] == "新的智能问数"
    assert data["pinned"] is False
    assert data["messages"] == []
    assert "id" in data
    assert "created_at" in data
    assert "updated_at" in data


def test_list_sessions_returns_created_sessions(client: TestClient):
    first = create_session(client, "第一个会话")
    second = create_session(client, "第二个会话")

    response = client.get("/api/sessions")

    assert response.status_code == 200
    data = response.json()
    ids = [item["id"] for item in data]

    assert second["id"] in ids
    assert first["id"] in ids


def test_get_session_by_id(client: TestClient):
    session = create_session(client, "会话详情")

    response = client.get(f"/api/sessions/{session['id']}")

    assert response.status_code == 200
    data = response.json()
    assert data["id"] == session["id"]
    assert data["title"] == "会话详情"


def test_send_first_message_updates_default_title(client: TestClient):
    session = create_session(client)

    response = client.post(
        f"/api/sessions/{session['id']}/messages",
        json={
            "role": "user",
            "content": "  2026年各经营单元的收入和完成率分别是多少？  ",
        },
    )

    assert response.status_code == 200
    data = response.json()

    assert data["title"] == "2026年各经营单元的收入和完成率分别是多少？"
    assert len(data["messages"]) == 2
    assert data["messages"][0]["role"] == "user"
    assert data["messages"][0]["content"] == "  2026年各经营单元的收入和完成率分别是多少？  "
    assert data["messages"][1]["role"] == "assistant"
    assert data["messages"][1]["answer_data"] is not None


def test_send_second_message_does_not_change_title(client: TestClient):
    session = create_session(client)

    first_response = client.post(
        f"/api/sessions/{session['id']}/messages",
        json={
            "role": "user",
            "content": "政企行业收入筛选",
        },
    )
    first_title = first_response.json()["title"]

    second_response = client.post(
        f"/api/sessions/{session['id']}/messages",
        json={
            "role": "user",
            "content": "产品型号销售统计",
        },
    )

    assert second_response.status_code == 200
    data = second_response.json()
    assert data["title"] == first_title
    assert len(data["messages"]) == 4


def test_send_message_rejects_non_user_role(client: TestClient):
    session = create_session(client)

    response = client.post(
        f"/api/sessions/{session['id']}/messages",
        json={
            "role": "assistant",
            "content": "这条消息不应该由前端直接发送",
        },
    )

    assert response.status_code == 400
    assert response.json()["detail"] == "only user messages can be sent"


def test_update_session_title_and_pinned(client: TestClient):
    session = create_session(client)

    response = client.patch(
        f"/api/sessions/{session['id']}",
        json={
            "title": "  政企行业收入筛选  ",
            "pinned": True,
        },
    )

    assert response.status_code == 200
    data = response.json()
    assert data["title"] == "政企行业收入筛选"
    assert data["pinned"] is True


def test_update_session_rejects_empty_title(client: TestClient):
    session = create_session(client)

    response = client.patch(
        f"/api/sessions/{session['id']}",
        json={"title": "   "},
    )

    assert response.status_code == 400
    assert response.json()["detail"] == "title cannot be empty"


def test_pinned_session_is_listed_first(client: TestClient):
    normal_session = create_session(client, "普通会话")
    pinned_session = create_session(client, "置顶会话")

    client.patch(
        f"/api/sessions/{pinned_session['id']}",
        json={"pinned": True},
    )

    response = client.get("/api/sessions")

    assert response.status_code == 200
    data = response.json()
    assert data[0]["id"] == pinned_session["id"]
    assert data[0]["pinned"] is True
    assert normal_session["id"] in [item["id"] for item in data]


def test_delete_session(client: TestClient):
    session = create_session(client, "准备删除的会话")

    delete_response = client.delete(f"/api/sessions/{session['id']}")

    assert delete_response.status_code == 204
    assert delete_response.content == b""

    get_response = client.get(f"/api/sessions/{session['id']}")

    assert get_response.status_code == 404
    assert get_response.json()["detail"] == "session not found"
```

### 42.10 编写 settings API 测试

新增文件：

```txt
backend/tests/test_settings_api.py
```

应用配置页要测的是：

```txt
GET   /api/settings
PATCH /api/settings/{code}
```

这里有一个点要注意：

```txt
settings 没有 POST 创建接口。
真实业务里配置数据是通过 seed 脚本初始化的。
```

所以测试里不通过 API 创建配置，而是直接用 `db_session` 往测试数据库插入配置。

代码：

```py
from fastapi.testclient import TestClient
from sqlalchemy.orm import Session

from app.models import AppSetting


def create_setting(
    db_session: Session,
    code: str = "greeting",
    name: str = "对话开场白",
    enabled: bool = True,
    config: dict | None = None,
) -> AppSetting:
    setting = AppSetting(
        code=code,
        name=name,
        description=f"{name}说明",
        enabled=enabled,
        config={} if config is None else config,
    )
    db_session.add(setting)
    db_session.commit()
    db_session.refresh(setting)
    return setting


def test_list_settings(client: TestClient, db_session: Session):
    first = create_setting(
        db_session,
        code="greeting",
        name="对话开场白",
        config={"text": "欢迎使用智能AI问数"},
    )
    second = create_setting(
        db_session,
        code="tts",
        name="文字转语音",
        enabled=False,
    )

    response = client.get("/api/settings")

    assert response.status_code == 200
    data = response.json()
    assert len(data) == 2
    assert data[0]["id"] == first.id
    assert data[0]["code"] == "greeting"
    assert data[0]["config"]["text"] == "欢迎使用智能AI问数"
    assert data[1]["id"] == second.id
    assert data[1]["code"] == "tts"
    assert data[1]["enabled"] is False


def test_update_setting_enabled_and_config(client: TestClient, db_session: Session):
    create_setting(
        db_session,
        code="hot_recommend",
        name="常问设置",
        enabled=True,
        config={"threshold": 3},
    )

    response = client.patch(
        "/api/settings/hot_recommend",
        json={
            "enabled": False,
            "config": {"threshold": 5},
        },
    )

    assert response.status_code == 200
    data = response.json()
    assert data["code"] == "hot_recommend"
    assert data["enabled"] is False
    assert data["config"] == {"threshold": 5}


def test_update_setting_can_only_change_enabled(client: TestClient, db_session: Session):
    create_setting(
        db_session,
        code="suggestions",
        name="下一步问题建议",
        enabled=False,
        config={"max": 3},
    )

    response = client.patch(
        "/api/settings/suggestions",
        json={"enabled": True},
    )

    assert response.status_code == 200
    data = response.json()
    assert data["enabled"] is True
    assert data["config"] == {"max": 3}


def test_update_setting_can_only_change_config(client: TestClient, db_session: Session):
    create_setting(
        db_session,
        code="model_config",
        name="模型配置",
        enabled=True,
        config={"model_name": "mock-analysis-v1"},
    )

    response = client.patch(
        "/api/settings/model_config",
        json={"config": {"model_name": "mock-analysis-v2"}},
    )

    assert response.status_code == 200
    data = response.json()
    assert data["enabled"] is True
    assert data["config"] == {"model_name": "mock-analysis-v2"}


def test_update_setting_returns_404_when_code_not_found(client: TestClient):
    response = client.patch(
        "/api/settings/not-exist",
        json={"enabled": True},
    )

    assert response.status_code == 404
    assert response.json()["detail"] == "setting not found"
```

### 42.11 编写 feedback API 测试

新增文件：

```txt
backend/tests/test_feedback_api.py
```

回复校对页要测的是：

```txt
POST  /api/feedbacks
GET   /api/feedbacks
GET   /api/feedbacks/{feedback_id}
PATCH /api/feedbacks/{feedback_id}
```

和 settings 不一样，feedback 本身有创建接口。

所以测试里直接用：

```txt
POST /api/feedbacks
```

创建测试数据。

代码：

```py
from fastapi.testclient import TestClient


def create_feedback(
    client: TestClient,
    user_name: str = "张三",
    question: str = "北京代表处收入是多少？",
    ai_answer: str = "北京代表处收入为 7950 万元。",
) -> dict:
    response = client.post(
        "/api/feedbacks",
        json={
            "user_name": user_name,
            "question": question,
            "ai_answer": ai_answer,
        },
    )
    assert response.status_code == 200
    return response.json()


def test_create_feedback(client: TestClient):
    data = create_feedback(client)

    assert data["user_name"] == "张三"
    assert data["question"] == "北京代表处收入是多少？"
    assert data["ai_answer"] == "北京代表处收入为 7950 万元。"
    assert data["status"] == "pending"
    assert data["remark"] is None
    assert data["handled_at"] is None
    assert "id" in data
    assert "created_at" in data


def test_list_feedbacks_with_pagination(client: TestClient):
    create_feedback(client, question="北京代表处收入是多少？")
    create_feedback(client, question="上海代表处收入是多少？")
    create_feedback(client, question="浙江代表处收入是多少？")

    response = client.get("/api/feedbacks?page=1&page_size=2")

    assert response.status_code == 200
    data = response.json()
    assert data["total"] == 3
    assert data["page"] == 1
    assert data["page_size"] == 2
    assert len(data["items"]) == 2


def test_filter_feedbacks_by_question(client: TestClient):
    matched = create_feedback(client, question="北京代表处收入是多少？")
    create_feedback(client, question="上海代表处收入是多少？")

    response = client.get("/api/feedbacks?question=北京")

    assert response.status_code == 200
    data = response.json()
    assert data["total"] == 1
    assert data["items"][0]["id"] == matched["id"]


def test_filter_feedbacks_by_user(client: TestClient):
    matched = create_feedback(client, user_name="李四")
    create_feedback(client, user_name="王五")

    response = client.get("/api/feedbacks?user=李四")

    assert response.status_code == 200
    data = response.json()
    assert data["total"] == 1
    assert data["items"][0]["id"] == matched["id"]


def test_filter_feedbacks_by_status(client: TestClient):
    pending = create_feedback(client, question="待处理问题")
    resolved = create_feedback(client, question="已处理问题")

    client.patch(
        f"/api/feedbacks/{resolved['id']}",
        json={
            "status": "resolved",
            "remark": "已确认回答正确",
        },
    )

    response = client.get("/api/feedbacks?status=pending")

    assert response.status_code == 200
    data = response.json()
    assert data["total"] == 1
    assert data["items"][0]["id"] == pending["id"]


def test_get_feedback_by_id(client: TestClient):
    feedback = create_feedback(client, question="查询单条反馈")

    response = client.get(f"/api/feedbacks/{feedback['id']}")

    assert response.status_code == 200
    data = response.json()
    assert data["id"] == feedback["id"]
    assert data["question"] == "查询单条反馈"


def test_update_feedback_to_resolved(client: TestClient):
    feedback = create_feedback(client)

    response = client.patch(
        f"/api/feedbacks/{feedback['id']}",
        json={
            "status": "resolved",
            "remark": "已重新核对数据，回答正确。",
        },
    )

    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "resolved"
    assert data["remark"] == "已重新核对数据，回答正确。"
    assert data["handled_at"] is not None


def test_update_feedback_back_to_pending_clears_handled_at(client: TestClient):
    feedback = create_feedback(client)

    client.patch(
        f"/api/feedbacks/{feedback['id']}",
        json={
            "status": "resolved",
            "remark": "先标记为已处理",
        },
    )

    response = client.patch(
        f"/api/feedbacks/{feedback['id']}",
        json={
            "status": "pending",
            "remark": "重新打开处理",
        },
    )

    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "pending"
    assert data["remark"] == "重新打开处理"
    assert data["handled_at"] is None


def test_get_feedback_returns_404_when_not_found(client: TestClient):
    response = client.get("/api/feedbacks/999")

    assert response.status_code == 404
    assert response.json()["detail"] == "feedback not found"
```

### 42.12 这些测试分别在验证什么

`test_create_session`：

```txt
验证 POST /api/sessions 能创建会话。
验证默认 pinned 是 false。
验证新会话 messages 是空数组。
```

`test_list_sessions_returns_created_sessions`：

```txt
验证 GET /api/sessions 能返回已经创建过的会话。
```

这里不强行验证完整排序。

因为这个测试只关心：

```txt
创建后的数据能不能被列表接口读出来。
```

排序单独交给置顶测试验证。

`test_get_session_by_id`：

```txt
验证 GET /api/sessions/{id} 能读取单条会话。
```

`test_send_first_message_updates_default_title`：

```txt
验证第一次发送用户消息时，会话标题会从默认标题改成用户第一句话。
验证后端会同时创建 user 消息和 assistant mock 回复。
```

这正好对应前面做过的逻辑：

```txt
一开始新建会话有默认标题。
用户输入第一句话后，用第一句话覆盖默认标题。
后续不再覆盖。
```

`test_send_second_message_does_not_change_title`：

```txt
验证第二次发送消息不会继续覆盖标题。
```

这个测试很关键。

因为如果这里写错，历史记录标题会随着每次提问变化。

`test_send_message_rejects_non_user_role`：

```txt
验证前端不能直接向接口发送 assistant 消息。
```

当前业务规则是：

```txt
用户只能提交 role=user。
assistant 消息由后端 mock AI 生成。
```

`test_update_session_title_and_pinned`：

```txt
验证 PATCH 可以同时改标题和置顶状态。
验证标题前后空格会被清理。
```

`test_update_session_rejects_empty_title`：

```txt
验证重命名不能为空。
```

`test_pinned_session_is_listed_first`：

```txt
验证置顶会话在列表里排在前面。
```

对应后端代码：

```py
.order_by(ChatSession.pinned.desc(), ChatSession.updated_at.desc())
```

`test_delete_session`：

```txt
验证 DELETE 删除会话返回 204。
验证删除后再查询会返回 404。
```

这里还检查：

```py
assert delete_response.content == b""
```

因为 204 的意思就是：

```txt
请求成功，但没有响应 body。
```

`test_list_settings`：

```txt
验证 GET /api/settings 能返回应用配置列表。
验证列表按 id 排序。
验证 config 这种 JSONB 字段可以正常返回。
```

这里的配置数据不是通过 API 创建的，而是测试里直接写入测试数据库。

原因是：

```txt
应用配置真实业务里来自 seed 初始化。
后端没有提供 POST /api/settings。
```

`test_update_setting_enabled_and_config`：

```txt
验证 PATCH /api/settings/{code} 可以同时更新 enabled 和 config。
```

比如：

```txt
常问设置 threshold 从 3 改成 5。
enabled 从 true 改成 false。
```

`test_update_setting_can_only_change_enabled`：

```txt
验证只传 enabled 时，只改开关，不破坏原来的 config。
```

`test_update_setting_can_only_change_config`：

```txt
验证只传 config 时，只改配置内容，不破坏原来的 enabled。
```

`test_update_setting_returns_404_when_code_not_found`：

```txt
验证更新不存在的配置 code 时返回 404。
```

这对应真实页面里的情况：

```txt
前端如果传错 code，后端不能静默成功。
```

`test_create_feedback`：

```txt
验证 POST /api/feedbacks 能创建反馈。
验证新反馈默认 status 是 pending。
验证 remark 和 handled_at 初始为空。
```

`test_list_feedbacks_with_pagination`：

```txt
验证 GET /api/feedbacks 支持 page 和 page_size。
验证 total 是总数量。
验证 items 是当前页数据。
```

`test_filter_feedbacks_by_question`：

```txt
验证能按 question 关键字筛选。
```

对应接口：

```txt
GET /api/feedbacks?question=北京
```

`test_filter_feedbacks_by_user`：

```txt
验证能按 user_name 筛选。
```

对应接口：

```txt
GET /api/feedbacks?user=李四
```

`test_filter_feedbacks_by_status`：

```txt
验证能按 pending / resolved 状态筛选。
```

对应接口：

```txt
GET /api/feedbacks?status=pending
```

`test_get_feedback_by_id`：

```txt
验证 GET /api/feedbacks/{feedback_id} 能读取单条反馈详情。
```

`test_update_feedback_to_resolved`：

```txt
验证 PATCH /api/feedbacks/{id} 可以把反馈处理为 resolved。
验证处理后会写入 remark。
验证处理后 handled_at 不为空。
```

`test_update_feedback_back_to_pending_clears_handled_at`：

```txt
验证反馈可以从 resolved 改回 pending。
验证改回 pending 后 handled_at 会清空。
```

`test_get_feedback_returns_404_when_not_found`：

```txt
验证查询不存在的反馈 id 时返回 404。
```

### 42.13 先不测试 /health/db

本轮可以测：

```txt
GET /health
```

但先不要测：

```txt
GET /health/db
```

原因是 `/health/db` 当前代码走的是：

```py
check_database_connection()
```

而 `check_database_connection()` 里面用的是 `app.db.session` 里全局创建的：

```py
engine
```

它不走：

```py
Depends(get_db)
```

所以 `dependency_overrides[get_db]` 替换不到它。

如果要严谨测试 `/health/db`，后面可以做一次小重构：

```txt
让 health/db 也通过可替换的数据库依赖去检查连接。
```

但第 42 步先不做。

现在先集中测三个页面的核心业务接口。

### 42.14 本地运行后端测试

先启动数据库：

```bash
docker compose up -d postgres
```

进入后端：

```bash
cd backend
source .venv/bin/activate
```

安装测试依赖：

```bash
python -m pip install -r requirements-dev.txt
```

运行测试：

```bash
python -m pytest
```

如果只想看详细一点的输出：

```bash
python -m pytest -v
```

如果只想跑聊天接口测试：

```bash
python -m pytest tests/test_chat_api.py -v
```

如果只想跑应用配置接口测试：

```bash
python -m pytest tests/test_settings_api.py -v
```

如果只想跑回复校对接口测试：

```bash
python -m pytest tests/test_feedback_api.py -v
```

如果只想跑某一个测试：

```bash
python -m pytest tests/test_chat_api.py::test_delete_session -v
```

### 42.15 后端编译检查

后端除了跑测试，也可以保留之前用过的编译检查：

```bash
python -m compileall app
```

它能检查：

```txt
Python 文件有没有基础语法错误。
import 语句有没有明显语法问题。
```

它不能替代测试。

区别是：

```txt
compileall：
  只检查代码能不能被 Python 编译。

pytest：
  真正调用接口，验证接口结果。
```

第 42 步后端本地 check 可以组合成：

```bash
python -m compileall app
python -m pytest
```

### 42.16 更新根目录 package.json

第 41 步根目录已经有：

```json
{
  "scripts": {
    "frontend:check": "pnpm --dir frontend check",
    "check": "pnpm frontend:check"
  }
}
```

第 42 步把后端也接进来：

```json
{
  "scripts": {
    "prepare": "husky",
    "frontend:lint": "pnpm --dir frontend lint",
    "frontend:test": "pnpm --dir frontend test",
    "frontend:build": "pnpm --dir frontend build",
    "frontend:check": "pnpm --dir frontend check",
    "backend:compile": "cd backend && .venv/bin/python -m compileall app",
    "backend:test": "cd backend && .venv/bin/python -m pytest",
    "backend:check": "pnpm backend:compile && pnpm backend:test",
    "check": "pnpm frontend:check && pnpm backend:check"
  }
}
```

这样根目录可以直接跑：

```bash
pnpm backend:test
pnpm backend:check
pnpm check
```

解释一下：

```txt
pnpm backend:test
  只跑后端测试。

pnpm backend:check
  先 compileall，再 pytest。

pnpm check
  前端 lint/test/build + 后端 compileall/pytest。
```

这里脚本用了：

```txt
backend/.venv/bin/python
```

所以本地要保证：

```txt
backend/.venv 已经创建好。
requirements-dev.txt 已经安装好。
```

### 42.17 更新 Husky

第 41 步的策略是：

```txt
pre-commit 跑轻量检查。
pre-push 跑完整前端检查。
```

第 42 步可以改成：

```txt
pre-commit：
  仍然只跑 frontend lint。

pre-push：
  跑完整 pnpm check，也就是前端 + 后端。
```

原因：

```txt
commit 经常发生，不能太慢。
push 频率低一些，更适合跑完整校验。
```

`.husky/pre-commit` 保持：

```sh
pnpm frontend:lint
```

`.husky/pre-push` 改成：

```sh
pnpm check
```

这样你 push 前会自动跑：

```txt
前端 lint
前端 test
前端 build
后端 compileall
后端 pytest
```

### 42.18 添加 GitHub Actions 后端检查

第 41 步已经有：

```txt
.github/workflows/frontend-check.yml
```

第 42 步新增：

```txt
.github/workflows/backend-check.yml
```

内容：

```yml
name: Backend Check

on:
  push:
    branches:
      - main
  pull_request:
    branches:
      - main

jobs:
  backend-check:
    runs-on: ubuntu-latest

    services:
      postgres:
        image: postgres:16
        env:
          POSTGRES_DB: fullstack_demo_test
          POSTGRES_USER: archer
          POSTGRES_PASSWORD: 123456
        ports:
          - 5432:5432
        options: >-
          --health-cmd "pg_isready -U archer -d fullstack_demo_test"
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5

    defaults:
      run:
        working-directory: backend

    steps:
      - name: Checkout
        uses: actions/checkout@v4

      - name: Setup Python
        uses: actions/setup-python@v5
        with:
          python-version: "3.12"
          cache: pip
          cache-dependency-path: backend/requirements-dev.txt

      - name: Install dependencies
        run: python -m pip install -r requirements-dev.txt

      - name: Compile backend
        run: python -m compileall app

      - name: Run backend tests
        run: python -m pytest
        env:
          DATABASE_URL: postgresql+psycopg://archer:123456@localhost:5432/fullstack_demo_test
          TEST_DATABASE_URL: postgresql+psycopg://archer:123456@localhost:5432/fullstack_demo_test
```

### 42.19 后端 GitHub Actions 逐段解释

`name: Backend Check`：

```txt
这个 workflow 在 GitHub Actions 页面显示的名字。
```

`on.push.branches.main`：

```txt
push 到 main 分支时运行。
```

`on.pull_request.branches.main`：

```txt
有人向 main 发 PR 时运行。
```

`runs-on: ubuntu-latest`：

```txt
GitHub 创建一台 Ubuntu 临时机器跑测试。
```

`services.postgres`：

```txt
给 CI 临时启动一个 PostgreSQL 容器。
```

因为后端测试需要数据库，所以 CI 不能只装 Python。

它还要启动数据库。

这一段：

```yml
env:
  POSTGRES_DB: fullstack_demo_test
  POSTGRES_USER: archer
  POSTGRES_PASSWORD: 123456
```

意思是：

```txt
CI 里的 PostgreSQL 启动时自动创建 fullstack_demo_test 数据库。
用户名 archer。
密码 123456。
```

`ports`：

```yml
ports:
  - 5432:5432
```

意思是：

```txt
把 PostgreSQL 容器里的 5432 端口映射到 CI 机器的 5432 端口。
```

这样 pytest 里连：

```txt
localhost:5432
```

就能连到 CI 里的 PostgreSQL。

`options`：

```yml
options: >-
  --health-cmd "pg_isready -U archer -d fullstack_demo_test"
  --health-interval 10s
  --health-timeout 5s
  --health-retries 5
```

意思是：

```txt
让 GitHub Actions 等 PostgreSQL 真正启动成功后，再继续执行后面的步骤。
```

否则可能出现：

```txt
Python 测试已经开始跑了。
但 PostgreSQL 还没准备好。
然后连接失败。
```

`defaults.run.working-directory: backend`：

```txt
后面的 run 命令默认都在 backend 目录执行。
```

所以：

```yml
run: python -m pytest
```

实际等于：

```bash
cd backend
python -m pytest
```

`actions/setup-python@v5`：

```txt
安装 Python。
```

`python-version: "3.12"`：

```txt
CI 使用 Python 3.12。
```

这和你之前因为依赖要求升级 Python 的方向一致。

`cache: pip`：

```txt
缓存 pip 下载过的依赖。
下次 CI 可以更快。
```

`cache-dependency-path: backend/requirements-dev.txt`：

```txt
当 requirements-dev.txt 变化时，刷新 pip 缓存。
```

`Install dependencies`：

```yml
run: python -m pip install -r requirements-dev.txt
```

意思是：

```txt
安装后端正式依赖 + 测试依赖。
```

`Compile backend`：

```yml
run: python -m compileall app
```

意思是：

```txt
检查 app 目录里的 Python 文件能不能正常编译。
```

`Run backend tests`：

```yml
run: python -m pytest
```

意思是：

```txt
执行 backend/tests 里的测试。
```

这里传了两个环境变量：

```yml
DATABASE_URL: postgresql+psycopg://archer:123456@localhost:5432/fullstack_demo_test
TEST_DATABASE_URL: postgresql+psycopg://archer:123456@localhost:5432/fullstack_demo_test
```

`TEST_DATABASE_URL`：

```txt
给 conftest.py 用。
明确告诉测试连哪个数据库。
```

`DATABASE_URL`：

```txt
给项目本身的配置兜底。
避免某些代码不小心读默认开发库地址。
```

### 42.20 常见报错和处理

#### 42.20.1 database does not exist

如果本地运行 pytest 报：

```txt
database "fullstack_demo_test" does not exist
```

说明测试库还没创建。

执行：

```bash
docker compose exec postgres createdb -U archer fullstack_demo_test
```

#### 42.20.2 connection refused

如果报：

```txt
connection refused
```

通常是 PostgreSQL 容器没启动。

执行：

```bash
docker compose up -d postgres
```

#### 42.20.3 ModuleNotFoundError: No module named 'app'

如果报：

```txt
ModuleNotFoundError: No module named 'app'
```

通常是 pytest 运行目录不对。

要从 `backend` 目录运行：

```bash
cd backend
python -m pytest
```

不要从项目根目录直接：

```bash
python -m pytest
```

除非你额外配置了 `PYTHONPATH`。

#### 42.20.4 TestClient 相关错误

如果报 `TestClient` 或 `httpx` 相关错误，通常是测试依赖没装。

执行：

```bash
cd backend
source .venv/bin/activate
python -m pip install -r requirements-dev.txt
```

#### 42.20.5 relation does not exist

如果报：

```txt
relation "chat_sessions" does not exist
```

说明测试表没有创建成功。

重点检查：

```txt
conftest.py 是否 import 了 app.models。
Base.metadata.create_all(bind=test_engine) 是否执行。
TEST_DATABASE_URL 是否连到了正确的 PostgreSQL。
```

### 42.21 这一轮不做的事

第 42 步不做：

1. 不引入 Alembic 迁移测试。
2. 不做覆盖率门槛。
3. 不测试真实 AI。
4. 不做 Playwright E2E。
5. 不测试 `/health/db`。
6. 不测试 seed 脚本的每一条默认配置内容。
7. 不测试反馈筛选条件的所有排列组合。

这些后面都可以加。

但现在要把三个页面的核心接口都测通。

### 42.22 验收标准

完成后确认：

1. `backend/requirements-dev.txt` 存在。
2. `backend/tests/conftest.py` 存在。
3. `backend/tests/test_chat_api.py` 存在。
4. `backend/tests/test_settings_api.py` 存在。
5. `backend/tests/test_feedback_api.py` 存在。
6. 本地存在 `fullstack_demo_test` 测试数据库。
7. `cd backend && python -m pytest` 通过。
8. `cd backend && python -m compileall app` 通过。
9. `pnpm backend:check` 通过。
10. `pnpm check` 能同时跑前端和后端校验。
11. `.husky/pre-push` 执行 `pnpm check`。
12. `.github/workflows/backend-check.yml` 存在。
13. GitHub Actions 会启动 PostgreSQL service。
14. GitHub Actions 会执行 `python -m pytest`。
15. 智能问数接口测试覆盖创建、列表、详情、发消息、标题更新、重命名、置顶、删除。
16. 应用配置接口测试覆盖列表、更新 enabled、更新 config、不存在 code 返回 404。
17. 回复校对接口测试覆盖创建、列表分页、筛选、详情、处理为 resolved、改回 pending、不存在 id 返回 404。
18. 测试不会写入 `fullstack_demo` 开发库。
19. 测试数据只出现在 `fullstack_demo_test` 测试库。

## 第 43 步：接入真实大模型，并保留多模型通道

当前后端回答来自：

```txt
backend/app/services/mock_ai.py
```

也就是固定 mock 数据。

这一轮目标是：

```txt
保留 mock，用于本地测试和 CI。
新增真实大模型 provider，先接通义千问。
预留 OpenAI、DeepSeek、其它 OpenAI-compatible 模型通道。
```

不要直接在 `chat.py` 里写通义千问请求代码。

原因：

```txt
chat.py 是业务流程：
保存用户消息 -> 调 AI -> 保存 assistant 消息 -> 返回会话。

调用哪家模型，是服务实现细节。
如果把通义千问代码直接写进 chat.py，
后面换 OpenAI / DeepSeek / 其它模型时，chat.py 会越来越乱。
```

这一轮要拆成：

```txt
chat.py
  只调用 generate_ai_answer(...)

ai_service.py
  根据 AI_PROVIDER 选择具体 provider

providers/
  mock_provider.py
  openai_compatible_provider.py
```

### 43.1 为什么优先用 OpenAI-compatible 接口

通义千问的百炼服务支持 OpenAI 兼容接口。

官方文档的核心意思是：

```txt
把 API Key、BASE_URL、model 名称换成阿里云百炼的配置，
就可以用 OpenAI SDK 调用千问模型。
```

这对我们很有价值。

因为很多模型服务现在都提供类似接口：

```txt
OpenAI
通义千问 / 阿里云百炼
DeepSeek
Moonshot / Kimi
智谱 GLM
部分本地模型网关
```

它们虽然供应商不同，但调用形态大多类似：

```py
client.chat.completions.create(
    model="xxx",
    messages=[...],
)
```

所以我们可以先做一个通用 provider：

```txt
OpenAICompatibleProvider
```

以后换模型时优先改配置：

```env
AI_PROVIDER=qwen
AI_MODEL=qwen-plus
AI_BASE_URL=https://xxx/compatible-mode/v1
AI_API_KEY=sk-xxx
```

而不是到处改代码。

### 43.2 需要新增的依赖

修改：

```txt
backend/requirements.txt
```

新增：

```txt
openai
```

说明：

```txt
这里不是只为了 OpenAI。
通义千问百炼也可以通过 OpenAI SDK 的兼容接口调用。
```

安装：

```bash
cd backend
source .venv/bin/activate
python -m pip install openai
python -m pip freeze > requirements.txt
```

注意：

```txt
不要把 API Key 写进 requirements.txt、代码、测试文件、GitHub。
```

### 43.3 配置环境变量

修改：

```txt
backend/.env.example
backend/app/core/config.py
```

`.env.example` 增加：

```env
AI_PROVIDER=mock
AI_MODEL=qwen-plus
AI_BASE_URL=https://dashscope.aliyuncs.com/compatible-mode/v1
AI_API_KEY=
AI_TEMPERATURE=0.2
AI_TIMEOUT_SECONDS=30
```

含义：

```txt
AI_PROVIDER
  当前使用哪个模型供应商。
  mock：继续使用本地 mock。
  qwen：使用通义千问。
  openai：预留 OpenAI。
  deepseek：预留 DeepSeek。
  custom：预留其它 OpenAI-compatible 服务。

AI_MODEL
  模型名称。
  通义千问可以先用 qwen-plus。

AI_BASE_URL
  OpenAI-compatible 服务地址。
  通义千问百炼是 compatible-mode/v1 结尾。

AI_API_KEY
  模型服务 API Key。
  本地写在 .env，不能提交到 Git。

AI_TEMPERATURE
  控制回答随机性。
  业务分析类回答建议低一点，比如 0.2。

AI_TIMEOUT_SECONDS
  模型请求超时时间。
```

`backend/app/core/config.py` 增加：

```py
AI_PROVIDER = os.getenv("AI_PROVIDER", "mock")
AI_MODEL = os.getenv("AI_MODEL", "qwen-plus")
AI_BASE_URL = os.getenv("AI_BASE_URL", "")
AI_API_KEY = os.getenv("AI_API_KEY", "")
AI_TEMPERATURE = float(os.getenv("AI_TEMPERATURE", "0.2"))
AI_TIMEOUT_SECONDS = float(os.getenv("AI_TIMEOUT_SECONDS", "30"))
```

注意：

```txt
本地开发默认 AI_PROVIDER=mock。
这样没有 API Key 时，项目仍然能跑。
CI 也不会因为没有真实大模型 Key 而失败。
```

### 43.4 定义统一返回结构

新增文件：

```txt
backend/app/services/ai_types.py
```

代码方向：

```py
from typing import Any, TypedDict


class AIAnswer(TypedDict):
    content: str
    answer_data: dict[str, Any] | None
    elapsed_ms: int
    token_count: int | None
```

为什么要定义这个？

因为现在 `mock_ai.generate_mock_answer` 返回的是：

```py
{
    "content": ...,
    "answer_data": ...,
    "elapsed_ms": ...,
    "token_count": ...,
}
```

真实大模型也要返回同样结构。

这样 `chat.py` 不需要关心回答来自 mock 还是真实模型。

### 43.5 保留 mock provider

新增目录：

```txt
backend/app/services/ai_providers/
```

新增文件：

```txt
backend/app/services/ai_providers/mock_provider.py
```

先把原来的：

```txt
backend/app/services/mock_ai.py
```

保留或移动成：

```txt
backend/app/services/ai_providers/mock_provider.py
```

对外暴露：

```py
def generate_answer(question: str, history: list[dict[str, str]] | None = None) -> AIAnswer:
    ...
```

这里的 `history` 先预留。

当前 mock 可以暂时不用它。

原因：

```txt
真实大模型需要上下文 messages。
mock 不需要，但函数签名保持一致。
```

### 43.6 新增 OpenAI-compatible provider

新增文件：

```txt
backend/app/services/ai_providers/openai_compatible_provider.py
```

代码方向：

```py
import time

from openai import OpenAI

from app.core.config import (
    AI_API_KEY,
    AI_BASE_URL,
    AI_MODEL,
    AI_TEMPERATURE,
    AI_TIMEOUT_SECONDS,
)
from app.services.ai_types import AIAnswer


SYSTEM_PROMPT = """
你是一个企业经营数据分析助手。
请用简洁中文回答用户问题。
如果问题涉及数据分析，请给出清晰结论。
"""


def _build_messages(question: str, history: list[dict[str, str]] | None) -> list[dict[str, str]]:
    messages = [{"role": "system", "content": SYSTEM_PROMPT.strip()}]

    if history:
        messages.extend(history)

    messages.append({"role": "user", "content": question})
    return messages


def generate_answer(question: str, history: list[dict[str, str]] | None = None) -> AIAnswer:
    if not AI_API_KEY:
        raise RuntimeError("AI_API_KEY is required when using real AI provider")

    started_at = time.perf_counter()

    client = OpenAI(
        api_key=AI_API_KEY,
        base_url=AI_BASE_URL,
        timeout=AI_TIMEOUT_SECONDS,
    )

    completion = client.chat.completions.create(
        model=AI_MODEL,
        messages=_build_messages(question, history),
        temperature=AI_TEMPERATURE,
    )

    content = completion.choices[0].message.content or ""
    usage = completion.usage
    elapsed_ms = int((time.perf_counter() - started_at) * 1000)

    return {
        "content": content,
        "answer_data": None,
        "elapsed_ms": max(elapsed_ms, 1),
        "token_count": usage.total_tokens if usage else None,
    }
```

解释：

- `OpenAI`：OpenAI SDK 客户端。
- `base_url`：供应商地址。通义千问百炼填 compatible-mode/v1 地址。
- `model`：模型名，比如 `qwen-plus`。
- `messages`：对话上下文。
- `temperature`：回答随机性。
- `completion.choices[0].message.content`：模型回复文本。
- `completion.usage.total_tokens`：token 用量，如果供应商返回了就记录。

这一步先让真实模型返回纯文本。

`answer_data` 先返回 `None`。

原因：

```txt
当前前端的图表结构 answer_data 是我们 mock 出来的固定格式。
真实大模型默认只会返回自然语言。

如果要让真实模型也生成表格 / 统计 / 图表，
下一步再做“结构化输出 JSON schema”。
```

### 43.7 新增 AI service 入口

新增文件：

```txt
backend/app/services/ai_service.py
```

代码方向：

```py
from app.core.config import AI_PROVIDER
from app.services.ai_types import AIAnswer
from app.services.ai_providers import mock_provider, openai_compatible_provider


def generate_ai_answer(
    question: str,
    history: list[dict[str, str]] | None = None,
) -> AIAnswer:
    if AI_PROVIDER == "mock":
        return mock_provider.generate_answer(question, history)

    if AI_PROVIDER in {"qwen", "openai", "deepseek", "custom"}:
        return openai_compatible_provider.generate_answer(question, history)

    raise RuntimeError(f"Unsupported AI_PROVIDER: {AI_PROVIDER}")
```

解释：

```txt
chat.py 以后只 import generate_ai_answer。
AI_PROVIDER 决定具体走哪个 provider。
```

这里为什么把 `qwen/openai/deepseek/custom` 都先走同一个 provider？

因为它们都可以按 OpenAI-compatible 方式接入。

差异主要通过环境变量控制：

```txt
AI_BASE_URL
AI_API_KEY
AI_MODEL
```

以后如果某个供应商有特殊逻辑，再单独拆 provider。

### 43.8 修改 chat.py

修改：

```txt
backend/app/routers/chat.py
```

把：

```py
from app.services.mock_ai import generate_mock_answer
```

改成：

```py
from app.services.ai_service import generate_ai_answer
```

把：

```py
mock_result = generate_mock_answer(payload.content)
```

改成：

```py
history_messages = [
    {"role": message.role, "content": message.content}
    for message in session.messages
    if message.role in {"user", "assistant"}
]

ai_result = generate_ai_answer(payload.content, history_messages)
```

然后 assistant message 改用：

```py
assistant_message = ChatMessage(
    session_id=session.id,
    role="assistant",
    content=ai_result["content"],
    answer_data=ai_result["answer_data"],
    elapsed_ms=ai_result["elapsed_ms"],
    token_count=ai_result["token_count"],
)
```

注意：

```txt
这里需要让 session 查询带上 messages。
否则 session.messages 可能没加载。
```

可以把发送消息开头的查询改成：

```py
session = _get_session_with_messages(db, session_id)
```

### 43.9 异常处理策略

真实大模型会出现这些问题：

```txt
API Key 没配
网络超时
模型服务限流
余额不足
供应商接口返回错误
```

这一轮先用简单策略：

```py
try:
    ai_result = generate_ai_answer(payload.content, history_messages)
except Exception as exc:
    raise HTTPException(status_code=502, detail="AI service unavailable") from exc
```

解释：

- `502` 表示后端作为网关调用外部 AI 服务失败。
- 不要把真实 API Key、供应商原始报错完整返回给前端。
- 真实项目里还应该加日志，这个 demo 先不展开。

### 43.10 本地 .env 示例

本地继续 mock：

```env
AI_PROVIDER=mock
```

切通义千问：

```env
AI_PROVIDER=qwen
AI_MODEL=qwen-plus
AI_BASE_URL=https://dashscope.aliyuncs.com/compatible-mode/v1
AI_API_KEY=你的百炼APIKey
AI_TEMPERATURE=0.2
AI_TIMEOUT_SECONDS=30
```

如果使用百炼新版业务空间专属域名，`AI_BASE_URL` 按控制台地域和 WorkspaceId 调整。

例如北京地域官方文档形态是：

```txt
https://{WorkspaceId}.cn-beijing.maas.aliyuncs.com/compatible-mode/v1
```

### 43.11 测试策略

这一轮测试仍然默认跑 mock。

原因：

```txt
CI 不能依赖真实大模型。
真实模型有费用、网络、限流、API Key 风险。
```

所以测试环境保持：

```env
AI_PROVIDER=mock
```

已有 chat API 测试不应该因为接入真实模型而变慢或不稳定。

可以新增一个轻量测试：

```txt
AI_PROVIDER=mock 时，send message 仍然返回 assistant 消息。
```

不要在 CI 里测真实 Qwen。

真实 Qwen 只做本地手动验证。

### 43.12 手动验证步骤

1. 安装依赖：

```bash
cd backend
source .venv/bin/activate
python -m pip install -r requirements.txt
```

2. `.env` 切换：

```env
AI_PROVIDER=qwen
AI_MODEL=qwen-plus
AI_BASE_URL=https://dashscope.aliyuncs.com/compatible-mode/v1
AI_API_KEY=你的百炼APIKey
```

3. 重启后端：

```bash
uvicorn app.main:app --reload
```

4. 前端发一条问题：

```txt
请分析北京代表处今年的收入完成情况
```

5. 观察：

```txt
assistant 消息是否变成真实模型回复。
elapsed_ms 是否有值。
token_count 是否有值或为 null。
```

### 43.13 本轮不做的事

这一轮不做：

1. 不做流式输出。
2. 不做 RAG。
3. 不做 embedding。
4. 不做工具调用 function calling。
5. 不做结构化图表 JSON 生成。
6. 不把 API Key 存数据库。
7. 不在 CI 调真实模型。
8. 不做模型供应商管理页面。

这些可以后面拆。

下一轮如果要继续增强，可以做：

```txt
第 44 步：让真实大模型返回结构化 answer_data，恢复表格、统计、图表渲染。
```

### 43.14 验收标准

完成后确认：

1. `backend/requirements.txt` 包含 `openai`。
2. `backend/.env.example` 包含 AI 相关环境变量。
3. `backend/app/core/config.py` 读取 AI 相关环境变量。
4. `backend/app/services/ai_types.py` 存在。
5. `backend/app/services/ai_providers/mock_provider.py` 存在。
6. `backend/app/services/ai_providers/openai_compatible_provider.py` 存在。
7. `backend/app/services/ai_service.py` 存在。
8. `chat.py` 不再直接 import `mock_ai`。
9. `chat.py` 只调用 `generate_ai_answer`。
10. `AI_PROVIDER=mock` 时，现有测试继续通过。
11. `AI_PROVIDER=qwen` 且配置 API Key 后，本地可以得到真实模型回复。
12. `.env` 不提交 API Key。

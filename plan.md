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
docker compose exec postgres psql -U demo_user -d fullstack_demo
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

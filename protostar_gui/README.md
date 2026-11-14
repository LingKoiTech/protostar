# protostar-gui

Next.js 14 App Router 前端，展示健康状态、需求详情、批准操作与运行结果。

## 页面

| 路径 | 说明 |
|---|---|
| `/` | 服务端健康状态（server/db/worker） |
| `/requirements` | 按 ID 查询需求；链接到新建页 |
| `/requirements/new` | 新建需求表单 |
| `/requirements/[id]` | 需求详情 |
| `/approvals` | 按 requirement_id 加载 spec/plan/tasks 并逐项批准 |
| `/runs/[id]` | 运行结果：stdout/stderr/exit_code/work_dir |

无组织/成员/OIDC 入口（SC-005/FR-010）。

## 环境变量

| 变量 | 说明 |
|---|---|
| `NEXT_PUBLIC_SERVER_URL` | 服务端 API 基址，默认 `http://127.0.0.1:8000/api/v1` |

## 启动

```bash
cd protostar_gui
npm install
npm run dev
```

浏览器访问 `http://localhost:3000`。

## 依赖

无图表/流程图库，仅 Next.js 14、React 18、TypeScript。

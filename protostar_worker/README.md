# protostar-worker

Worker 进程，轮询服务端获取任务，使用 OMP 在隔离目录执行，回传结果。

## 用途

无第三方运行时依赖。全部使用 Python stdlib：`subprocess`（执行 OMP）、`sqlite3`（本地状态）、`urllib.request`（调用服务端 API）、`tempfile`（隔离工作目录）。

## 环境变量

| 变量 | 必须 | 说明 |
|---|---|---|
| `OMP_PATH` | ✓ | OMP 可执行文件路径；缺失时进程立即非 0 退出 |
| `OMP_ARGS` | 否 | 附加参数（空格分隔，追加在 `task_ref` 之前） |

## 启动

```bash
cd protostar_worker
OMP_PATH=/path/to/omp uv run python -m worker.main --server http://127.0.0.1:8000/api/v1
```

启动后输出 `Worker ready, polling server...`，每 5 秒轮询一次。Ctrl+C 干净退出。

## 本地状态

运行记录缓存于 `worker/local_state.db`（SQLite），已被 `.gitignore` 覆盖。

## 无第三方依赖

`pyproject.toml` 的 `dependencies = []`。HTTP 调用使用 stdlib `urllib.request`，不引入 `httpx`/`requests`。

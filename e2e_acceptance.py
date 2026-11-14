"""
002 端到端验收（T029）：登录 → 需求 → 产物 → 逐层批准 → 越序拒绝 → 启动 Run
→ worker 领取并执行 002-healthcheck → 校验 stdout/exit_code → T027 loopback 绑定。

前置：protostar_server 已在 127.0.0.1:8000 运行（用 bootstrap_server.py 启动）。

用法：.venv/Scripts/python.exe e2e_acceptance.py
"""
import os
import pathlib
import socket
import subprocess
import sys
import tempfile
import time
import uuid

import httpx

REPO = pathlib.Path(__file__).resolve().parent
SRVDIR = REPO / "protostar_server"
WORKERDIR = REPO / "protostar_worker"
VENV_PY = REPO / ".venv" / "Scripts" / "python.exe"
PGDATA = pathlib.Path("C:/protostar-pgdata")

HOST = "127.0.0.1"
PORT = 8000
BASE = f"http://{HOST}:{PORT}/api/v1"
_raw_pw = os.environ.get("ADMIN_PASSWORD")
if not _raw_pw:
    print("ERROR: ADMIN_PASSWORD not set. Load .env before running this script.", file=sys.stderr)
    sys.exit(1)
ADMIN_PASSWORD = _raw_pw
TASK_REF = "002-healthcheck"
EXPECTED_STDOUT = "002 bootstrap healthcheck OK"
RUN_TIMEOUT = 30.0


def step(text: str) -> None:
    print(f"\n=== {text} ===", flush=True)


def check(name: str, ok: bool, detail: str = "") -> None:
    suffix = f"  [{detail}]" if detail else ""
    if ok:
        print(f"PASS  {name}{suffix}", flush=True)
    else:
        print(f"FAIL  {name}{suffix}", flush=True)
        print("E2E FAILED", flush=True)
        sys.exit(1)


def _database_uri() -> str:
    """优先用环境变量；否则通过 pgserver 句柄读取（不改变 server 进程持有的实例）。"""
    uri = os.environ.get("DATABASE_URL")
    if uri:
        return uri.replace("postgresql+psycopg://", "postgresql://")
    import pgserver

    handle = pgserver.get_server(pgdata=PGDATA, cleanup_mode=None)
    return handle.get_uri("protostar_dev")


def cleanup_database() -> None:
    """清空 002 业务数据，保留 projects / local_users / sessions。

    worker_sessions 必须一并清空：单 worker 约束下 register 遇到任何既有
    WorkerSession 会返回 409，worker 将无法启动。
    """
    import psycopg
    from urllib.parse import urlparse

    uri = _database_uri()
    host = urlparse(uri).hostname or ""
    if host not in ("127.0.0.1", "localhost"):
        print(
            f"ERROR: cleanup_database 拒绝对非本机数据库（{host}）执行。"
            " 请将 DATABASE_URL 指向本机独立测试库再运行验收脚本。",
            file=sys.stderr,
        )
        sys.exit(1)

    with psycopg.connect(uri, autocommit=True) as conn:
        for table in (
            "run_outputs",
            "runs",
            "approval_records",
            "artifacts",
            "requirements",
            "worker_sessions",
        ):
            conn.execute(f"DELETE FROM {table}")
            print(f"  cleared {table}", flush=True)


def approve(client: httpx.Client, artifact_id: str, decision: str = "approved") -> httpx.Response:
    return client.post("/approvals", json={"artifact_id": artifact_id, "decision": decision})


def _lan_ip() -> str | None:
    sock = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
    try:
        sock.connect(("8.8.8.8", 80))
        return sock.getsockname()[0]
    except OSError:
        return None
    finally:
        sock.close()


def check_loopback_binding() -> None:
    binds: set[str] | None = None
    try:
        import psutil

        binds = {
            conn.laddr.ip
            for conn in psutil.net_connections(kind="inet")
            if conn.status == psutil.CONN_LISTEN
            and conn.laddr is not None
            and conn.laddr.port == PORT
        }
    except Exception as exc:  # pragma: no cover - 权限受限时退回连接探测
        print(f"  (psutil 不可用，改用连接探测: {exc})", flush=True)

    if binds is not None:
        check(
            f"T027 端口 {PORT} 仅监听 127.0.0.1",
            binds == {"127.0.0.1"},
            f"listen={sorted(binds)}",
        )

    lan_ip = _lan_ip()
    if lan_ip and not lan_ip.startswith("127."):
        reachable = False
        try:
            with socket.create_connection((lan_ip, PORT), timeout=2):
                reachable = True
        except OSError:
            pass
        check(f"T027 非 loopback {lan_ip}:{PORT} 不可达", not reachable)
    else:
        print("SKIP  非 loopback 探测（未取得局域网地址）", flush=True)


def main() -> None:
    print(f"E2E against {BASE}", flush=True)

    client = httpx.Client(base_url=BASE, timeout=10.0)

    step("[1/10] 清理 dev 库业务数据")
    try:
        cleanup_database()
    except Exception as exc:
        print(f"FAIL  数据库清理失败: {exc}", flush=True)
        sys.exit(1)
    check("数据库可连接且已清空 002 表", True)

    step("[2/10] §6 登录（admin）")
    resp = client.post("/auth/login", json={"username": "admin", "password": ADMIN_PASSWORD})
    check("POST /auth/login → 200 且下发 ps_session", resp.status_code == 200 and "ps_session" in client.cookies,
          f"status={resp.status_code}")

    step("[3/10] §7 登记需求")
    resp = client.post("/requirements", json={"title": "002 e2e acceptance", "scope": "minimum bootstrap loop"})
    check("POST /requirements → 201", resp.status_code == 201, f"status={resp.status_code}")
    requirement = resp.json()
    requirement_id = requirement["id"]
    resp = client.get(f"/requirements/{requirement_id}")
    check("GET /requirements/{id} 回读 status=active",
          resp.status_code == 200 and resp.json()["status"] == "active",
          f"status={resp.status_code}")

    step("[4/10] §8.1 上传 spec / plan / tasks")
    artifact_ids: dict[str, str] = {}
    for artifact_type in ("spec", "plan", "tasks"):
        resp = client.put(
            f"/artifacts/{artifact_type}",
            json={
                "requirement_id": requirement_id,
                "file_path": f"specs/002-minimum-bootstrap-loop/{artifact_type}.md",
            },
        )
        check(f"PUT /artifacts/{artifact_type} → 201", resp.status_code == 201, f"status={resp.status_code}")
        artifact_ids[artifact_type] = resp.json()["id"]

    step("[5/10] §8.3 越序批准拒绝")
    resp = approve(client, artifact_ids["tasks"])
    check("spec/plan 未批准时批准 tasks → 403", resp.status_code == 403, f"status={resp.status_code}")
    resp = approve(client, str(uuid.uuid4()))
    check("批准不存在的 artifact → 404", resp.status_code == 404, f"status={resp.status_code}")

    step("[6/10] §8.2/§8.4 逐层批准 spec → plan → tasks")
    approval_ids: dict[str, str] = {}
    for artifact_type in ("spec", "plan", "tasks"):
        resp = approve(client, artifact_ids[artifact_type])
        check(f"POST /approvals ({artifact_type}) → 201", resp.status_code == 201, f"status={resp.status_code}")
        record = resp.json()
        check(f"批准记录含 approver/decision/decided_at ({artifact_type})",
              record["approver"] == "admin" and record["decision"] == "approved" and bool(record["decided_at"]),
              f"approver={record['approver']}")
        approval_ids[artifact_type] = record["id"]

    step("[7/10] §9 创建 Run")
    resp = client.post("/runs", json={"task_ref": TASK_REF, "tasks_approval_id": str(uuid.uuid4())})
    check("无效 approval_id 启动 Run → 403", resp.status_code == 403, f"status={resp.status_code}")
    resp = client.post("/runs", json={"task_ref": TASK_REF, "tasks_approval_id": approval_ids["tasks"]})
    check("合法 tasks approval 启动 Run → 201", resp.status_code == 201, f"status={resp.status_code}")
    run = resp.json()
    run_id = run["id"]
    check("Run 初始 status=running", run["status"] == "running", f"status={run['status']}")

    step("[8/10] §9 启动 worker 并等待 Run 结束")
    worker_env = os.environ.copy()
    worker_env["OMP_PATH"] = str(VENV_PY)  # 契约要求该变量存在；002-healthcheck 命令由 server 下发
    worker_env["PYTHONUNBUFFERED"] = "1"
    worker_log = tempfile.TemporaryFile(mode="w+", encoding="utf-8", errors="replace")
    worker = subprocess.Popen(
        [str(VENV_PY), "-m", "worker.main", "--server", BASE],
        cwd=str(WORKERDIR),
        env=worker_env,
        stdout=worker_log,
        stderr=subprocess.STDOUT,
        text=True,
    )
    print(f"  worker pid={worker.pid}", flush=True)

    status = "running"
    deadline = time.time() + RUN_TIMEOUT
    try:
        while time.time() < deadline:
            if worker.poll() is not None:
                break
            resp = client.get(f"/runs/{run_id}")
            if resp.status_code != 200:
                break
            status = resp.json()["status"]
            if status != "running":
                break
            time.sleep(0.5)

        worker_log.seek(0)
        worker_text = worker_log.read()
        if status == "running":
            print(f"  worker log:\n{worker_text[-2000:]}", flush=True)
        check("Run 在 30s 内离开 running", status in ("completed", "failed"), f"status={status}")
    finally:
        worker.terminate()
        try:
            worker.wait(timeout=5)
        except subprocess.TimeoutExpired:
            worker.kill()
            worker.wait()
        worker_log.close()

    step("[9/10] §10 校验运行结果")
    resp = client.get(f"/runs/{run_id}")
    finished = resp.json()
    check("Run status=completed 且 finished_at 已填充",
          finished["status"] == "completed" and finished["finished_at"] is not None,
          f"status={finished['status']}")

    resp = client.get(f"/runs/{run_id}/output")
    check("GET /runs/{id}/output → 200", resp.status_code == 200, f"status={resp.status_code}")
    output = resp.json()
    check(f"stdout 含 {EXPECTED_STDOUT!r}", EXPECTED_STDOUT in (output.get("stdout") or ""),
          f"stdout={(output.get('stdout') or '').strip()!r}")
    check("exit_code == 0", output.get("exit_code") == 0, f"exit_code={output.get('exit_code')}")
    check("无 failure_reason", not output.get("failure_reason"), f"failure_reason={output.get('failure_reason')}")

    step("[10/10] T027 / SC-004 loopback 绑定验证")
    resp = client.get("/health")
    check("GET /health → 200 且 db=ok",
          resp.status_code == 200 and resp.json().get("db") == "ok",
          f"status={resp.status_code}")
    check_loopback_binding()

    print("\nALL PASS", flush=True)


if __name__ == "__main__":
    main()

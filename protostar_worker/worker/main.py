import argparse
import time

from worker.local_state import mark_claimed, mark_uploaded
from worker.omp_runner import run_omp
from worker.server_client import ServerClient

_POLL_INTERVAL = 5


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--server", default="http://127.0.0.1:8000/api/v1")
    args = parser.parse_args()

    client = ServerClient(base_url=args.server)
    reg = client.register()
    client.token = reg["token"]
    print("Worker ready, polling server...", flush=True)

    try:
        while True:
            try:
                client.heartbeat()
            except Exception as e:
                print(f"heartbeat error: {e}", flush=True)

            task = None
            try:
                task = client.tasks_next()
            except Exception as e:
                print(f"tasks/next error: {e}", flush=True)

            if task is None:
                time.sleep(_POLL_INTERVAL)
                continue

            run_id = task["run_id"]
            task_ref = task["task_ref"]
            # server 已把 task_ref 解析为可直接执行的命令（002-healthcheck → python + 脚本路径）
            command = task["command"] or task_ref

            mark_claimed(task_ref, run_id)
            result = run_omp(command)

            try:
                client.patch_run(run_id, model=None, session_id=None, work_dir=result["work_dir"])
            except Exception as e:
                print(f"patch_run error: {e}", flush=True)

            try:
                client.post_output(
                    run_id,
                    stdout=result["stdout"],
                    stderr=result["stderr"],
                    exit_code=result["exit_code"],
                    failure_reason=result["failure_reason"],
                )
                mark_uploaded(run_id)
                print(f"run {run_id} ({task_ref}) done exit={result['exit_code']}", flush=True)
            except Exception as e:
                print(f"post_output error: {e}", flush=True)

    except KeyboardInterrupt:
        print("Worker shutting down.", flush=True)


if __name__ == "__main__":
    main()

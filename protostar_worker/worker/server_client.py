import json
import urllib.request
import urllib.error
from typing import Optional


class ServerClient:
    def __init__(self, base_url: str, token: Optional[str] = None, timeout: int = 10):
        self.base_url = base_url.rstrip("/")
        self.token = token
        self.timeout = timeout

    def _request(self, method: str, path: str, body=None) -> tuple:
        url = f"{self.base_url}{path}"
        data = json.dumps(body).encode() if body is not None else None
        headers = {"Content-Type": "application/json"}
        if self.token:
            headers["Authorization"] = f"Bearer {self.token}"
        req = urllib.request.Request(url, data=data, headers=headers, method=method)
        try:
            with urllib.request.urlopen(req, timeout=self.timeout) as resp:
                raw = resp.read()
                return resp.status, json.loads(raw) if raw else None
        except urllib.error.HTTPError as e:
            raw = e.read()
            return e.code, json.loads(raw) if raw else None

    def register(self) -> dict:
        status, body = self._request("POST", "/worker/register")
        if status != 201:
            raise RuntimeError(f"register failed: {status} {body}")
        return body

    def heartbeat(self) -> None:
        status, _ = self._request("POST", "/worker/heartbeat")
        if status != 200:
            raise RuntimeError(f"heartbeat failed: {status}")

    def tasks_next(self) -> Optional[dict]:
        status, body = self._request("GET", "/worker/tasks/next")
        if status == 204:
            return None
        if status != 200:
            raise RuntimeError(f"tasks/next failed: {status} {body}")
        return body

    def patch_run(self, run_id: str, model: Optional[str], session_id: Optional[str], work_dir: str) -> None:
        status, body = self._request("PATCH", f"/worker/runs/{run_id}", {
            "model": model,
            "session_id": session_id,
            "work_dir": work_dir,
        })
        if status != 200:
            raise RuntimeError(f"patch_run failed: {status} {body}")

    def post_output(self, run_id: str, stdout: str, stderr: str, exit_code, failure_reason) -> None:
        status, body = self._request("POST", f"/worker/runs/{run_id}/output", {
            "stdout": stdout,
            "stderr": stderr,
            "exit_code": exit_code,
            "failure_reason": failure_reason,
        })
        if status not in (200, 201):
            raise RuntimeError(f"post_output failed: {status} {body}")

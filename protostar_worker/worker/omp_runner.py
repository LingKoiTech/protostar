import shlex
import subprocess
import tempfile

_OUTPUT_LIMIT = 8192
_TRUNC_SUFFIX = "\n[truncated]"


def _truncate(s: str) -> str:
    if len(s) > _OUTPUT_LIMIT:
        return s[:_OUTPUT_LIMIT] + _TRUNC_SUFFIX
    return s


def run_omp(command: str, timeout: int = 300) -> dict:
    work_dir = tempfile.mkdtemp(prefix="protostar-run-")
    failure_reason = None
    exit_code = None
    stdout_str = ""
    stderr_str = ""

    try:
        args = shlex.split(command)
        proc = subprocess.Popen(
            args,
            cwd=work_dir,
            stdout=subprocess.PIPE,
            stderr=subprocess.PIPE,
            text=True,
            encoding="utf-8",
            errors="replace",
        )
        try:
            stdout_raw, stderr_raw = proc.communicate(timeout=timeout)
            exit_code = proc.returncode
            stdout_str = _truncate(stdout_raw)
            stderr_str = _truncate(stderr_raw)
        except subprocess.TimeoutExpired:
            proc.kill()
            proc.communicate()
            failure_reason = "timeout"
    except Exception as e:
        failure_reason = str(e)

    return {
        "stdout": stdout_str,
        "stderr": stderr_str,
        "exit_code": exit_code,
        "failure_reason": failure_reason,
        "work_dir": work_dir,
    }

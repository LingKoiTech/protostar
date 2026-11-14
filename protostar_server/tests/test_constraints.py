import pytest
import pytest_asyncio
from httpx import ASGITransport, AsyncClient


@pytest.mark.asyncio
async def test_approve_plan_without_spec_returns_403(client, session_cookie, active_requirement):
    """FR-003 场景：spec 未批时批 plan → 403。"""
    req_id = active_requirement["id"]
    # 上传 spec（不批准）
    r_spec = await client.put("/api/v1/artifacts/spec",
                              json={"requirement_id": req_id, "file_path": "spec.md"},
                              headers={"Cookie": session_cookie})
    assert r_spec.status_code in (200, 201)
    # 上传 plan
    r_plan = await client.put("/api/v1/artifacts/plan",
                              json={"requirement_id": req_id, "file_path": "plan.md"},
                              headers={"Cookie": session_cookie})
    assert r_plan.status_code in (200, 201)
    plan_id = r_plan.json()["id"]
    # 直接批准 plan（spec 未批）→ 403
    r = await client.post("/api/v1/approvals",
                          json={"artifact_id": plan_id, "decision": "approved"},
                          headers={"Cookie": session_cookie})
    assert r.status_code == 403


@pytest.mark.asyncio
async def test_worker_bearer_cannot_approve(client, session_cookie, active_requirement, worker_token):
    """FR-004：worker Bearer token 调用 POST /approvals → 401。"""
    req_id = active_requirement["id"]
    r_spec = await client.put("/api/v1/artifacts/spec",
                              json={"requirement_id": req_id, "file_path": "spec.md"},
                              headers={"Cookie": session_cookie})
    spec_id = r_spec.json()["id"]
    # 用不含 ps_session cookie 的独立 client 发 Bearer 请求
    from app.main import app
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as bare_client:
        r = await bare_client.post("/api/v1/approvals",
                                   json={"artifact_id": spec_id, "decision": "approved"},
                                   headers={"Authorization": f"Bearer {worker_token}"})
    assert r.status_code == 401


@pytest.mark.asyncio
async def test_second_active_requirement_returns_409(client, session_cookie, active_requirement):
    """FR-002：同 project 第二条 active 需求 → 409。"""
    r = await client.post("/api/v1/requirements",
                          json={"title": "second req", "scope": "scope"},
                          headers={"Cookie": session_cookie})
    assert r.status_code == 409


@pytest.mark.asyncio
async def test_concurrent_run_start_returns_409(client, session_cookie, approved_tasks):
    """FR-009：同 task_ref 第二次 POST /runs → 409。"""
    approval_id = approved_tasks["approval_id"]
    r1 = await client.post("/api/v1/runs",
                           json={"task_ref": "test-task", "tasks_approval_id": approval_id},
                           headers={"Cookie": session_cookie})
    assert r1.status_code == 201
    r2 = await client.post("/api/v1/runs",
                           json={"task_ref": "test-task", "tasks_approval_id": approval_id},
                           headers={"Cookie": session_cookie})
    assert r2.status_code == 409


@pytest.mark.asyncio
async def test_run_without_approved_tasks_returns_403(client, session_cookie, approved_spec):
    """FR-005：tasks 未批准时 POST /runs → 403（使用 spec 的 approval_id）。"""
    spec_approval_id = approved_spec["approval_id"]
    r = await client.post("/api/v1/runs",
                          json={"task_ref": "some-task", "tasks_approval_id": spec_approval_id},
                          headers={"Cookie": session_cookie})
    assert r.status_code == 403


@pytest.mark.asyncio
async def test_stdout_truncated_at_8kb(client, session_cookie, approved_tasks, worker_token):
    """FR-007：stdout 超 8KB 时截断并含 [truncated]。"""
    approval_id = approved_tasks["approval_id"]
    # 创建 run
    r_run = await client.post("/api/v1/runs",
                              json={"task_ref": "trunc-task", "tasks_approval_id": approval_id},
                              headers={"Cookie": session_cookie})
    assert r_run.status_code == 201
    run_id = r_run.json()["id"]

    # worker 领取
    r_next = await client.get("/api/v1/worker/tasks/next",
                               headers={"Authorization": f"Bearer {worker_token}"})
    assert r_next.status_code == 200
    assert r_next.json()["run_id"] == run_id

    # 提交超 8KB 的 stdout
    big_stdout = "x" * 10000
    r_out = await client.post(f"/api/v1/worker/runs/{run_id}/output",
                               json={"stdout": big_stdout, "stderr": "",
                                     "exit_code": 0, "failure_reason": None},
                               headers={"Authorization": f"Bearer {worker_token}"})
    assert r_out.status_code == 201

    # 查询结果
    r_get = await client.get(f"/api/v1/runs/{run_id}/output",
                              headers={"Cookie": session_cookie})
    assert r_get.status_code == 200
    body = r_get.json()
    assert len(body["stdout"]) <= 8192 + len("\n[truncated]") + 10  # 截断后长度合理
    assert "[truncated]" in body["stdout"]

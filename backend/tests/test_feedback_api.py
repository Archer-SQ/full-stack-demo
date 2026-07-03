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

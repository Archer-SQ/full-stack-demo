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


def test_list_sessions_returns_created_session(client: TestClient):
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
    assert (
        data["messages"][0]["content"]
        == "  2026年各经营单元的收入和完成率分别是多少？  "
    )
    assert data["messages"][1]["role"] == "assistant"
    assert data["messages"][1]["answer_data"] is not None


def test_secend_message_does_not_change_title(client: TestClient):
    session = create_session(client)

    first_response = client.post(
        f"/api/sessions/{session['id']}/messages",
        json={"role": "user", "content": "政企行业收入筛选"},
    )
    first_title = first_response.json()["title"]

    second_response = client.post(
        f"/api/sessions/{session['id']}/messages",
        json={"role": "user", "content": "产品型号销售统计"},
    )
    second_title = second_response.json()["title"]

    assert second_response.status_code == 200
    assert first_title == second_title
    assert len(second_response.json()["messages"]) == 4


def test_send_message_rejects_non_user_role(client: TestClient):
    session = create_session(client)

    response = client.post(
        f"/api/sessions/{session['id']}/messages",
        json={"role": "assistant", "content": "这条消息不应该由前端直接发送 "},
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

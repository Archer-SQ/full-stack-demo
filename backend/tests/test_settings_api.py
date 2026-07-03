from fastapi.testclient import TestClient
from sqlalchemy.orm import Session

from app.models import AppSetting


def create_setting(
    db_session: Session,
    code: str = "greeting",
    name: str = "对话开场白",
    enabled: bool = True,
    config: dict | None = None,
) -> AppSetting:
    setting = AppSetting(
        code=code,
        name=name,
        description=f"{name}说明",
        enabled=enabled,
        config={} if config is None else config,
    )
    db_session.add(setting)
    db_session.commit()
    db_session.refresh(setting)
    return setting


def test_list_settings(client: TestClient, db_session: Session):
    first = create_setting(
        db_session,
        code="greeting",
        name="对话开场白",
        config={"text": "欢迎使用智能AI问数"},
    )
    second = create_setting(
        db_session,
        code="tts",
        name="文字转语音",
        enabled=False,
    )

    response = client.get("/api/settings")

    assert response.status_code == 200
    data = response.json()
    assert len(data) == 2
    assert data[0]["id"] == first.id
    assert data[0]["code"] == "greeting"
    assert data[0]["config"]["text"] == "欢迎使用智能AI问数"
    assert data[1]["id"] == second.id
    assert data[1]["code"] == "tts"
    assert data[1]["enabled"] is False


def test_update_setting_enabled_and_config(client: TestClient, db_session: Session):
    create_setting(
        db_session,
        code="hot_recommend",
        name="常问设置",
        enabled=True,
        config={"threshold": 3},
    )

    response = client.patch(
        "/api/settings/hot_recommend",
        json={
            "enabled": False,
            "config": {"threshold": 5},
        },
    )

    assert response.status_code == 200
    data = response.json()
    assert data["code"] == "hot_recommend"
    assert data["enabled"] is False
    assert data["config"] == {"threshold": 5}


def test_update_setting_can_only_change_enabled(
    client: TestClient, db_session: Session
):
    create_setting(
        db_session,
        code="suggestions",
        name="下一步问题建议",
        enabled=False,
        config={"max": 3},
    )

    response = client.patch(
        "/api/settings/suggestions",
        json={"enabled": True},
    )

    assert response.status_code == 200
    data = response.json()
    assert data["enabled"] is True
    assert data["config"] == {"max": 3}


def test_update_setting_can_only_change_config(client: TestClient, db_session: Session):
    create_setting(
        db_session,
        code="model_config",
        name="模型配置",
        enabled=True,
        config={"model_name": "mock-analysis-v1"},
    )

    response = client.patch(
        "/api/settings/model_config",
        json={"config": {"model_name": "mock-analysis-v2"}},
    )

    assert response.status_code == 200
    data = response.json()
    assert data["enabled"] is True
    assert data["config"] == {"model_name": "mock-analysis-v2"}


def test_update_setting_returns_404_when_code_not_found(client: TestClient):
    response = client.patch(
        "/api/settings/not-exist",
        json={"enabled": True},
    )

    assert response.status_code == 404
    assert response.json()["detail"] == "setting not found"

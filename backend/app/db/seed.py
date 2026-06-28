from sqlalchemy.orm import Session

from app.db.session import SessionLocal
from app.models.setting import AppSetting

DEFAULT_SETTINGS = [
    {
        "code": "greeting",
        "name": "对话开场白",
        "description": "开启后，新对话将自动显示开场白引导语。",
        "enabled": True,
        "config": {
            "text": "欢迎使用智能AI问数，您可以向我咨询经营数据、报表分析相关问题。",
            "questions": [
                "各产品线销售情况",
                "北京的产品线收入情况",
                "深圳的产品销售情况",
            ],
        },
    },
    {
        "code": "suggestions",
        "name": "下一步问题建议",
        "description": "开启后，AI回复下方自动生成相关延伸问题提示。",
        "enabled": True,
        "config": {},
    },
    {
        "code": "tts",
        "name": "文字转语音",
        "description": "开启后，AI回答支持语音播报功能。",
        "enabled": False,
        "config": {},
    },
    {
        "code": "stt",
        "name": "语音转文字",
        "description": "开启后，支持通过语音输入问题。",
        "enabled": False,
        "config": {},
    },
    {
        "code": "model_config",
        "name": "模型配置",
        "description": "配置智能问数使用的AI模型。",
        "enabled": True,
        "config": {
            "model_name": "mock-analysis-v1",
        },
    },
    {
        "code": "hot_recommend",
        "name": "常问设置",
        "description": "根据经常提问频次，在快捷提问中展示常问问题。",
        "enabled": True,
        "config": {
            "threshold": 3,
        },
    },
]


def seed_app_settings(db: Session) -> None:
    for item in DEFAULT_SETTINGS:
        exists = db.query(AppSetting).filter(AppSetting.code == item["code"]).first()
        if exists:
            continue

        db.add(AppSetting(**item))

    db.commit()


def seed_db() -> None:
    db = SessionLocal()
    try:
        seed_app_settings(db)
    finally:
        db.close()


if __name__ == "__main__":
    seed_db()
    print("Database seed data inserted.")

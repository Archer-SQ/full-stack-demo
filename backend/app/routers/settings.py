from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.models.setting import AppSetting
from app.schemas.setting import AppSettingRead, AppSettingUpdate

router = APIRouter(prefix="/api/settings", tags=["settings"])


@router.get("", response_model=list[AppSettingRead])
def list_settings(db: Session = Depends(get_db)):
    return db.query(AppSetting).order_by(AppSetting.id).all()


@router.patch("/{code}", response_model=AppSettingRead)
def update_setting(
    code: str,
    payload: AppSettingUpdate,
    db: Session = Depends(get_db),
):
    setting = db.query(AppSetting).filter(AppSetting.code == code).first()
    if setting is None:
        raise HTTPException(status_code=404, detail="setting not found")

    if payload.enabled is not None:
        setting.enabled = payload.enabled

    if payload.config is not None:
        setting.config = payload.config

    db.commit()
    db.refresh(setting)

    return setting

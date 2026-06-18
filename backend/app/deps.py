from fastapi import Depends, Header, HTTPException, status
from sqlalchemy import select
from sqlalchemy.orm import Session

from .database import get_db
from .models import User


def get_current_user(
    x_device_id: str | None = Header(default=None, alias="X-Device-Id"),
    db: Session = Depends(get_db),
) -> User:
    """
    Anonymous device-based identity. The client generates a UUID on first
    launch and sends it as the `X-Device-Id` header. We upsert a User for it.
    No signup/login is ever required.
    """
    if not x_device_id:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Missing X-Device-Id header",
        )

    user = db.scalar(select(User).where(User.device_uuid == x_device_id))
    if user is None:
        user = User(device_uuid=x_device_id)
        db.add(user)
        db.commit()
        db.refresh(user)
    return user

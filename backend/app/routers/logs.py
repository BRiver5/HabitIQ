from datetime import date

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from .. import crud
from ..database import get_db
from ..deps import get_current_user
from ..models import User
from ..schemas import HabitLogCreate, HabitLogOut

router = APIRouter(prefix="/logs", tags=["logs"])


@router.get("", response_model=list[HabitLogOut])
def list_logs(
    habit_id: str | None = None,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    return crud.list_logs(db, user, habit_id)


@router.put("", response_model=HabitLogOut)
def upsert_log(
    data: HabitLogCreate,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    habit = crud.get_habit(db, user, data.habit_id)
    if not habit:
        raise HTTPException(status_code=404, detail="Habit not found")
    return crud.upsert_log(db, data)


@router.delete("", status_code=status.HTTP_204_NO_CONTENT)
def delete_log(
    habit_id: str,
    log_date: date,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    removed = crud.delete_log(db, user, habit_id, log_date)
    if not removed:
        raise HTTPException(status_code=404, detail="Log not found")

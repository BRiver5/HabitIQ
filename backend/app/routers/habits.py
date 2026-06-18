from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from .. import crud
from ..database import get_db
from ..deps import get_current_user
from ..models import User
from ..schemas import (
    HabitCreate,
    HabitOut,
    HabitStatsOut,
    HabitUpdate,
    ReorderRequest,
)
from ..stats import compute_stats

router = APIRouter(prefix="/habits", tags=["habits"])


@router.get("", response_model=list[HabitOut])
def list_habits(db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    return crud.list_habits(db, user)


@router.post("", response_model=HabitOut, status_code=status.HTTP_201_CREATED)
def create_habit(
    data: HabitCreate,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    return crud.create_habit(db, user, data)


@router.get("/{habit_id}", response_model=HabitOut)
def get_habit(
    habit_id: str,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    habit = crud.get_habit(db, user, habit_id)
    if not habit:
        raise HTTPException(status_code=404, detail="Habit not found")
    return habit


@router.patch("/{habit_id}", response_model=HabitOut)
def update_habit(
    habit_id: str,
    data: HabitUpdate,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    habit = crud.get_habit(db, user, habit_id)
    if not habit:
        raise HTTPException(status_code=404, detail="Habit not found")
    return crud.update_habit(db, habit, data)


@router.delete("/{habit_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_habit(
    habit_id: str,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    habit = crud.get_habit(db, user, habit_id)
    if not habit:
        raise HTTPException(status_code=404, detail="Habit not found")
    crud.delete_habit(db, habit)


@router.post("/reorder", status_code=status.HTTP_204_NO_CONTENT)
def reorder(
    body: ReorderRequest,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    crud.reorder_habits(db, user, body.ordered_ids)


@router.get("/{habit_id}/stats", response_model=HabitStatsOut)
def habit_stats(
    habit_id: str,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    habit = crud.get_habit(db, user, habit_id)
    if not habit:
        raise HTTPException(status_code=404, detail="Habit not found")
    logs = crud.list_logs(db, user, habit_id)
    return compute_stats(habit, logs)

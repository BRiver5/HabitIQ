from datetime import datetime, timezone

from sqlalchemy import select
from sqlalchemy.orm import Session

from .models import Habit, HabitLog, User
from .schemas import HabitCreate, HabitLogCreate, HabitUpdate


# --- Habits ---

def list_habits(db: Session, user: User) -> list[Habit]:
    return list(
        db.scalars(
            select(Habit)
            .where(Habit.user_id == user.id)
            .order_by(Habit.sort_order, Habit.created_at)
        )
    )


def get_habit(db: Session, user: User, habit_id: str) -> Habit | None:
    return db.scalar(
        select(Habit).where(Habit.id == habit_id, Habit.user_id == user.id)
    )


def create_habit(db: Session, user: User, data: HabitCreate) -> Habit:
    habit = Habit(
        id=data.id,
        user_id=user.id,
        name=data.name,
        icon=data.icon,
        color=data.color,
        target_frequency=data.target_frequency,
        weekly_target=data.weekly_target,
        weekdays=data.weekdays,
        reminder_time=data.reminder_time,
        sort_order=data.sort_order,
        created_at=data.created_at or datetime.now(timezone.utc),
        archived_at=data.archived_at,
    )
    db.merge(habit)
    db.commit()
    return get_habit(db, user, data.id)  # type: ignore[return-value]


def update_habit(db: Session, habit: Habit, data: HabitUpdate) -> Habit:
    for field, value in data.model_dump(exclude_unset=True).items():
        setattr(habit, field, value)
    db.commit()
    db.refresh(habit)
    return habit


def delete_habit(db: Session, habit: Habit) -> None:
    db.delete(habit)
    db.commit()


def reorder_habits(db: Session, user: User, ordered_ids: list[str]) -> None:
    for index, habit_id in enumerate(ordered_ids):
        habit = get_habit(db, user, habit_id)
        if habit:
            habit.sort_order = index
    db.commit()


# --- Logs ---

def list_logs(db: Session, user: User, habit_id: str | None = None) -> list[HabitLog]:
    stmt = select(HabitLog).join(Habit).where(Habit.user_id == user.id)
    if habit_id:
        stmt = stmt.where(HabitLog.habit_id == habit_id)
    return list(db.scalars(stmt.order_by(HabitLog.date)))


def upsert_log(db: Session, data: HabitLogCreate) -> HabitLog:
    existing = db.scalar(
        select(HabitLog).where(
            HabitLog.habit_id == data.habit_id, HabitLog.date == data.date
        )
    )
    if existing:
        existing.completed = data.completed
        existing.mood = data.mood
        existing.note = data.note
        db.commit()
        db.refresh(existing)
        return existing

    log = HabitLog(
        id=data.id or f"{data.habit_id}_{data.date.isoformat()}",
        habit_id=data.habit_id,
        date=data.date,
        completed=data.completed,
        mood=data.mood,
        note=data.note,
    )
    db.add(log)
    db.commit()
    db.refresh(log)
    return log


def delete_log(db: Session, user: User, habit_id: str, log_date) -> bool:
    log = db.scalar(
        select(HabitLog)
        .join(Habit)
        .where(
            Habit.user_id == user.id,
            HabitLog.habit_id == habit_id,
            HabitLog.date == log_date,
        )
    )
    if not log:
        return False
    db.delete(log)
    db.commit()
    return True

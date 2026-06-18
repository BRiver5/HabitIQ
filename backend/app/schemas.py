from datetime import date, datetime

from pydantic import BaseModel, ConfigDict, Field


class HabitBase(BaseModel):
    name: str = Field(min_length=1, max_length=120)
    icon: str = "check-circle"
    color: str = "#2F5DFF"
    target_frequency: str = "daily"
    weekly_target: int = 7
    weekdays: str = "[0,1,2,3,4,5,6]"
    reminder_time: str | None = None
    sort_order: int = 0


class HabitCreate(HabitBase):
    id: str
    created_at: datetime | None = None
    archived_at: datetime | None = None


class HabitUpdate(BaseModel):
    name: str | None = None
    icon: str | None = None
    color: str | None = None
    target_frequency: str | None = None
    weekly_target: int | None = None
    weekdays: str | None = None
    reminder_time: str | None = None
    sort_order: int | None = None
    archived_at: datetime | None = None


class HabitOut(HabitBase):
    model_config = ConfigDict(from_attributes=True)

    id: str
    created_at: datetime
    archived_at: datetime | None = None


class HabitLogBase(BaseModel):
    date: date
    completed: bool = True
    mood: str | None = None
    note: str | None = None


class HabitLogCreate(HabitLogBase):
    id: str | None = None
    habit_id: str


class HabitLogOut(HabitLogBase):
    model_config = ConfigDict(from_attributes=True)

    id: str
    habit_id: str
    created_at: datetime


class HabitStatsOut(BaseModel):
    habit_id: str
    current_streak: int
    longest_streak: int
    total_completions: int
    completion_rate: float
    days_tracked: int


class ReorderRequest(BaseModel):
    ordered_ids: list[str]

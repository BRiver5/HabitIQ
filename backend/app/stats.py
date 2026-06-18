from datetime import date, timedelta

from .models import Habit, HabitLog
from .schemas import HabitStatsOut


def _completed_dates(logs: list[HabitLog]) -> set[date]:
    return {log.date for log in logs if log.completed}


def _current_streak(completed: set[date]) -> int:
    if not completed:
        return 0
    cursor = date.today()
    if cursor not in completed:
        cursor = cursor - timedelta(days=1)
        if cursor not in completed:
            return 0
    streak = 0
    while cursor in completed:
        streak += 1
        cursor -= timedelta(days=1)
    return streak


def _longest_streak(completed: set[date]) -> int:
    if not completed:
        return 0
    ordered = sorted(completed)
    longest = run = 1
    for prev, cur in zip(ordered, ordered[1:]):
        run = run + 1 if (cur - prev).days == 1 else 1
        longest = max(longest, run)
    return longest


def compute_stats(habit: Habit, logs: list[HabitLog]) -> HabitStatsOut:
    completed = _completed_dates(logs)
    total = len(completed)
    created = habit.created_at.date() if habit.created_at else date.today()
    days_tracked = max(1, (date.today() - created).days + 1)

    expected = days_tracked
    if habit.target_frequency == "weekly":
        expected = max(1, round((days_tracked / 7) * habit.weekly_target))

    rate = min(100.0, round((total / max(1, expected)) * 100, 1))

    return HabitStatsOut(
        habit_id=habit.id,
        current_streak=_current_streak(completed),
        longest_streak=_longest_streak(completed),
        total_completions=total,
        completion_rate=rate,
        days_tracked=days_tracked,
    )

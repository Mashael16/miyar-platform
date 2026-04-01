from django.utils import timezone
from django.db.models import Avg
from ..models import Evaluation, Attendance, Breach

def get_monthly_performance(user):

    today = timezone.now()

    monthly_task_score = Evaluation.objects.filter(
        task__assigned_to=user,
        created_at__month=today.month,
        created_at__year=today.year
    ).aggregate(avg_score=Avg("final_score"))["avg_score"] or 0

    total_days = Attendance.objects.filter(
        user=user,
        date__month=today.month,
        date__year=today.year
    ).count()

    attendance_rate = 100 if total_days > 0 else 0

    breach_avg = Breach.objects.filter(
        user=user,
        date__month=today.month,
        date__year=today.year
    ).aggregate(avg_level=Avg("level"))["avg_level"] or 0

    return {
        "monthly_task_score": round(monthly_task_score, 2),
        "attendance_rate": attendance_rate,
        "breach_average": round(breach_avg, 2),
    }


def get_annual_performance(user):

    today = timezone.now()

    yearly_task_score = Evaluation.objects.filter(
        task__assigned_to=user,
        created_at__year=today.year
    ).aggregate(avg_score=Avg("final_score"))["avg_score"] or 0

    yearly_attendance = Attendance.objects.filter(
        user=user,
        date__year=today.year
    ).count()

    yearly_breach_avg = Breach.objects.filter(
        user=user,
        date__year=today.year
    ).aggregate(avg_level=Avg("level"))["avg_level"] or 0

    return {
        "annual_task_score": round(yearly_task_score, 2),
        "annual_attendance": yearly_attendance,
        "annual_breach_average": round(yearly_breach_avg, 2),
    }
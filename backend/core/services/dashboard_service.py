from django.db.models import Count
from ..models import Task, Evaluation

def get_dashboard_summary(user):

    if user.role == 'employee':
        tasks = Task.objects.filter(assigned_to=user)
        evaluations = Evaluation.objects.filter(task__assigned_to=user)
    else:
        tasks = Task.objects.all()
        evaluations = Evaluation.objects.all()

    return {
        "total_tasks": tasks.count(),
        "completed_tasks": tasks.filter(status='completed').count(),
        "evaluations": evaluations.count()
    }
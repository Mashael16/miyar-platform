from django.shortcuts import get_object_or_404
from ..models import Task, Evaluation

def create_evaluation(task_id, user, data, serializer_class):

    task = get_object_or_404(Task, id=task_id)

    if Evaluation.objects.filter(task=task).exists():
        return None, "Evaluation already exists"

    serializer = serializer_class(data=data)

    if serializer.is_valid():
        serializer.save(task=task, evaluator=user)
        return serializer.data, None

    return None, serializer.errors

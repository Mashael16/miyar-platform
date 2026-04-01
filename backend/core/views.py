# This code defines a ViewSet, which is a high-level component that automatically handles the logic for standard CRUD operations (Create, Retrieve, Update, Delete)
#  by combining a data source (queryset) with a translator (serializer_class),
# effectively creating all the necessary API endpoints for the Task model in just a few lines of code.

from rest_framework import viewsets,permissions,filters
from .models import Task,Evaluation ,Attendance, Breach,User
from .serializers import TaskSerializer ,EvaluationSerializer,DashboardSummarySerializer,RegisterSerializer
from .permissions import IsManager,IsEvaluationOwner
from rest_framework.exceptions import PermissionDenied
from rest_framework.permissions import IsAuthenticated
from rest_framework.views import APIView
from rest_framework.response import Response
from django.shortcuts import get_object_or_404
from rest_framework import status
from django.db.models import Count
from .services.dashboard_service import get_dashboard_summary
from .services.evaluation_service import create_evaluation
from drf_spectacular.utils import extend_schema
from django_filters.rest_framework import DjangoFilterBackend
from .filters import EvaluationFilter
from .services.performance_summary_service import (
    get_monthly_performance,
    get_annual_performance
)
from .services.scoring import ruleBase 
from django.utils import timezone
from datetime import time
from google import genai
from django.conf import settings

class RegisterView(APIView):
    def post(self, request):
        serializer = RegisterSerializer(data=request.data)

        if serializer.is_valid():
            serializer.save()
            return Response(
                {"message": "Account created successfully"},
                status=status.HTTP_201_CREATED
            )

        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        
class TaskViewSet(viewsets.ModelViewSet):
    filter_backends = [filters.SearchFilter,filters.OrderingFilter]
    search_fields=["title", "description", "assigned_to__username", "assigned_to__first_name"]
    
    serializer_class = TaskSerializer

    def get_queryset(self):
        user=self.request.user
        print("USER:", user)
        print("ROLE:", getattr(user, "role", None))
        qs=Task.objects.select_related("assigned_to")
        

        if user.role =='manager':
            return qs
        return qs.filter(assigned_to=user)

    def get_permissions(self):
        if self.action == "create":
            return [IsManager()]
        return [permissions.IsAuthenticated()]
    




class EvaluationViewSet(viewsets.ModelViewSet):
    # queryset =  Evaluation.objects.select_related("task","evaluator")
    serializer_class = EvaluationSerializer
    filter_backends=[DjangoFilterBackend]
    filterset_class = EvaluationFilter

    def get_queryset(self):
        user = self.request.user

        qs = Evaluation.objects.select_related("task", "evaluator")

        if user.role == "manager":
            return qs

        return qs.filter(task__assigned_to=user)

    def get_permissions(self):
        if self.action in ["create", "update", "partial_update", "destroy"]:
            return[IsManager()]
        return[IsEvaluationOwner()]
    
    def perform_create(self, serializer):
        serializer.save(evaluator=self.request.user)

class TaskEvaluation(APIView):
    permission_classes = [IsAuthenticated]
    @extend_schema(
        responses=EvaluationSerializer
    )
    def get(self, request, task_id):
        task = get_object_or_404(Task, id=task_id)

        if request.user.role == 'employee':
            if task.assigned_to != request.user:
                return Response(
                    {"error": "You can only view your own evaluations"},
                    status=403
                )

        evaluation = get_object_or_404(Evaluation, task=task)
        serializer = EvaluationSerializer(evaluation)
        return Response(serializer.data)
    @extend_schema(
        request=EvaluationSerializer,
        responses=EvaluationSerializer
    )
    def post(self, request, task_id):

        if request.user.role != 'manager':
            return Response(
                {"error": "Only managers can create evaluations"},
                status=403
            )

        data, error = create_evaluation(
        task_id=task_id,
        user=request.user,
        data=request.data,
        serializer_class=EvaluationSerializer
    )
        
        if error:
            return Response({"error": error}, status=400)

        return Response(data, status=201)
        


class MyTasksView(APIView):
    permission_classes = [IsAuthenticated]
    
    @extend_schema(
        responses=TaskSerializer(many=True)
    )
    def get(self, request):
        user=request.user

        if user.role == 'employee':
            queryset = Task.objects.filter(assigned_to=user)

        else: 
            queryset = Task.objects.all()

        serializer = TaskSerializer(queryset, many=True)
        return Response(serializer.data)

class MyEvaluationsView(APIView):
    permission_classes = [IsAuthenticated]
    @extend_schema(
            responses=EvaluationSerializer(Evaluation,many=True)
    )
    def get(self, request):

        if request.user.role == 'employee':
            evaluations = Evaluation.objects.filter(
                task__assigned_to=request.user
            )
        else:  
            evaluations = Evaluation.objects.all()

        serializer = EvaluationSerializer(evaluations, many=True)
        return Response(serializer.data)




class DashboardSummaryView(APIView):
    permission_classes = [IsAuthenticated]

    @extend_schema(
        responses=DashboardSummarySerializer
    )
    def get(self, request):
        data = get_dashboard_summary(request.user)
        return Response(data)


class CurrentUserView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        return Response({
            "id": request.user.id,
            "username": request.user.username,
            "role": request.user.role  
        })



class PerformanceSummaryView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):

        user = request.user

        monthly = get_monthly_performance(user)
        annual = get_annual_performance(user)

        return Response({
            "monthly": monthly,
            "annual": annual
        })



class UserRadarMetricsView(APIView):

    permission_classes = [IsAuthenticated]
    def get(self, request, user_id):
        user = get_object_or_404(User, id=user_id)
        today = timezone.now().date()

        tasks = Task.objects.filter(assigned_to=user, evaluation__isnull=False)
        tasks_count = tasks.count()

        if tasks_count == 0:
            return Response([
                {"metric": "Time Management", "score": 0, "fullMark": 100},
                {"metric": "Task Quality", "score": 0, "fullMark": 100},
                {"metric": "Attendance", "score": 0, "fullMark": 100},
                {"metric": "Compliance", "score": 0, "fullMark": 100},
                {"metric": "Task Importance", "score": 0, "fullMark": 100}
            ])

        breach = Breach.objects.filter(user=user, date__month=today.month, date__year=today.year).order_by("-date").first()
        attendance = Attendance.objects.filter(user=user, date=today).first()

        total_time = 0
        total_quality = 0
        total_attendance = 0
        total_compliance = 0
        total_importance = 0

        for task in tasks:
            eval_obj = task.evaluation
            
            data = {
                "submissionTime": task.completed_at if task.completed_at else timezone.now(),                "deadline": task.deadline,
                "taskNum": 1, 
                "taskComplateAVR": eval_obj.objective_score or 0,
                "startWork": time(8, 0), # وقت بداية الدوام 
                "endWork": time(16, 0),  # وقت نهاية الدوام 
                "arrivalTime": attendance.arrival_time if attendance else time(8, 0),
                "startMeeting": time(9, 0), 
                "endMeeting": time(10, 0),
                "arrivalMeeting": time(9, 0),
                "breachLevel": breach.level if breach else None,
                "importanceDegree": task.importance_degree,
            }

            rule = ruleBase(data)

            #
            total_time += rule.submissionAverage()
            total_quality += rule.taskComplateScore()
            total_attendance += rule.workTimeAverage()
            total_compliance += rule.Breaches()
            total_importance += rule.importance()

        radar_data = [
            {"metric": "Time Management", "score": round(total_time / tasks_count, 1), "fullMark": 100},
            {"metric": "Task Quality", "score": round(total_quality / tasks_count, 1), "fullMark": 100},
            {"metric": "Attendance", "score": round(total_attendance / tasks_count, 1), "fullMark": 100},
            {"metric": "Compliance", "score": round(total_compliance / tasks_count, 1), "fullMark": 100},
            {"metric": "Task Importance", "score": round(total_importance / tasks_count, 1), "fullMark": 100}
        ]

        return Response(radar_data)

import json
import re

class GenerateInsightsView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        data = request.data
        employee_name = data.get("employee_name", "the employee")
        radar_metrics = data.get("metrics", [])
        completion_rate = data.get("completion_rate", "N/A")

        prompt = f"""
        You are an expert HR Manager. Analyze the following performance metrics for {employee_name}:
        - Task Completion Rate: {completion_rate}%
        - Radar Metrics (out of 100): {radar_metrics}
        
        Return EXACTLY a JSON object with these three keys. NO markdown, NO formatting, ONLY raw JSON:
        {{
            "summary": "Short summary...",
            "strengths": ["Strength 1"],
            "areas_for_improvement": ["Area 1"]
        }}
        """

        try:
            client = genai.Client(api_key=settings.GEMINI_API_KEY)
            response = client.models.generate_content(
                model='gemini-2.5-flash',
                contents=prompt,
            )
            
            raw_text = response.text.strip()
            if raw_text.startswith("```json"):
                raw_text = raw_text.replace("```json", "").replace("```", "").strip()
            elif raw_text.startswith("```"):
                raw_text = raw_text.replace("```", "").strip()

            ai_data = json.loads(raw_text)
            return Response({"insights": ai_data}, status=status.HTTP_200_OK)
            
        except json.JSONDecodeError:
            return Response({"insights": response.text}, status=status.HTTP_200_OK)
        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
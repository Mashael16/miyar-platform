from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import CurrentUserView,RegisterView,TaskViewSet,EvaluationViewSet,TaskEvaluation,MyTasksView,MyEvaluationsView,DashboardSummaryView,UserRadarMetricsView,GenerateInsightsView



router = DefaultRouter()
router.register('tasks', TaskViewSet, basename='task')
router.register('evaluations', EvaluationViewSet, basename='evaluation')


urlpatterns = [
   
    path('', include(router.urls)), 
    path("me/", CurrentUserView.as_view()),
    path("register/", RegisterView.as_view()),
    path('tasks/<int:task_id>/evaluation/', TaskEvaluation.as_view(), name='task-evaluation'),
    path('my-tasks/', MyTasksView.as_view()),
    path('my-evaluations/', MyEvaluationsView.as_view()),
    path('dashboard-summary/', DashboardSummaryView.as_view()),
    path('users/<int:user_id>/radar/', UserRadarMetricsView.as_view(), name='user-radar-metrics'),
    path('generate-insights/', GenerateInsightsView.as_view(), name='generate-insights'),
]
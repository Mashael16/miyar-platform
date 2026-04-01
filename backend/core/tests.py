from django.test import TestCase
from django.utils import timezone
from django.contrib.auth import get_user_model
from django.urls import reverse
from rest_framework import status
from rest_framework.test import APITestCase
from .models import Task, Evaluation
from .services.dashboard_service import get_dashboard_summary
from core.permissions import IsEmployee
from rest_framework.test import APIRequestFactory

User = get_user_model()

class TaskModelTest(TestCase):
    def setUp(self):
        # 1. First, create a user because 'assigned_to' is mandatory
        self.user = User.objects.create_user(
            username="testuser",
            password="password123",
            role="employee"
        )

        # 2. Now create the task with all required fields
        self.task = Task.objects.create(
            title="CI System Test",
            description="Testing GitHub Actions workflow",
            assigned_to=self.user,
            deadline=timezone.now() + timezone.timedelta(days=1)
        )

    def test_task_creation(self):
        self.assertEqual(self.task.title, "CI System Test")
        self.assertEqual(self.task.assigned_to.username, "testuser")
        self.assertTrue(isinstance(self.task, Task))

    def test_model_str_methods(self):
        self.assertEqual(str(self.user), f"{self.user.username} (employee)")
        
        self.assertEqual(str(self.task), "CI System Test")
        
        evaluation = Evaluation.objects.create(
            task=self.task,
            objective_score=90
        )
        self.assertEqual(str(evaluation), f"Evaluation for {self.task.title}")

class PerformancePlatformTest(TestCase):
    def setUp(self):
        
        self.user = User.objects.create_user(
            username="mashael_dev",
            password="securepassword",
            role="employee"
        )

        
        self.task = Task.objects.create(
            title="Final Project CI",
            description="Testing full workflow",
            assigned_to=self.user,
            deadline=timezone.now() + timezone.timedelta(days=1)
        )

    def test_task_creation(self):
        self.assertEqual(self.task.title, "Final Project CI")
        self.assertTrue(isinstance(self.task, Task))

    def test_evaluation_link(self):
        
        evaluation = Evaluation.objects.create(
            task=self.task,
            evaluator=self.user,
            objective_score=95.0,
            subjective_score=90.0,
            feedback="Excellent progress in CI/CD implementation"
        )
        self.assertEqual(evaluation.task.title, "Final Project CI")
        self.assertEqual(self.task.evaluation.objective_score, 95.0)


class PerformancePermissionsTest(APITestCase):
    def setUp(self):
        # 1. Create a Manager
        self.manager = User.objects.create_user(
            username="manager_user",
            password="password123",
            role="manager"
        )
        
        # 2. Create an Employee
        self.employee = User.objects.create_user(
            username="employee_user",
            password="password123",
            role="employee"
        )

        # 3. Create a Task assigned to the employee
        self.task = Task.objects.create(
            title="Final Project Task",
            description="Fixing backend bugs",
            assigned_to=self.employee,
            deadline=timezone.now() + timezone.timedelta(days=1)
        )
        self.eval_url = reverse('evaluation-list')

    def test_task_creation_logic(self):
        self.assertEqual(self.task.title, "Final Project Task")
        self.assertEqual(self.task.assigned_to.role, "employee")

    def test_employee_cannot_create_evaluation(self):
        # Log in as employee
        self.client.force_authenticate(user=self.employee)
        

        data = {
            "task": self.task.id,
            "objective_score": 90,
            "subjective_score": 85,
            "feedback": "Trying to evaluate myself"
        }
        
        response = self.client.post(self.eval_url, data)
        
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)
        
    def test_manager_can_create_evaluation(self):
        self.client.force_authenticate(user=self.manager)
        
        data = {
            "task": self.task.id,
            # "evaluator": self.manager.id,
            "objective_score": 95,
            "subjective_score": 90,
            "feedback": "Great work"
        }
        
        response = self.client.post(self.eval_url, data)
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)

    def test_cannot_create_duplicate_evaluation(self):
        self.client.force_authenticate(user=self.manager)

        data = {
            "task": self.task.id,
            "objective_score": 90,
            "subjective_score": 85,
            "feedback": "First evaluation"
        }

        # First creation
        self.client.post(self.eval_url, data)

        # Second creation (should fail)
        response = self.client.post(self.eval_url, data)

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_unauthenticated_user_cannot_create_evaluation(self):
        data = {
            "task": self.task.id,
            "objective_score": 90,
            "subjective_score": 85,
            "feedback": "No auth"
        }

        response = self.client.post(self.eval_url, data)

        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_create_evaluation_invalid_task(self):
        self.client.force_authenticate(user=self.manager)

        data = {
            "task": 9999,
            "objective_score": 90,
            "subjective_score": 85,
            "feedback": "Invalid task"
        }

        response = self.client.post(self.eval_url, data)

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        
    def test_employee_cannot_view_other_employee_evaluation(self):

        # Create another employee
        employee_b = User.objects.create_user(
            username="employee_b",
            password="123",
            role="employee"
        )

        # Create task for employee B
        task_b = Task.objects.create(
            title="Task B",
            description="Other employee task",
            assigned_to=employee_b,
            deadline=timezone.now()
        )

        # Manager creates evaluation for employee B
        evaluation = Evaluation.objects.create(
            task=task_b,
            evaluator=self.manager,
            objective_score=90,
            subjective_score=85,
            feedback="Good"
        )

        # Log in as employee A
        self.client.force_authenticate(user=self.employee)

        url = reverse("task-evaluation", args=[task_b.id])

        response = self.client.get(url)

        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)
    
    def test_is_employee_permission(self):
        
        factory = APIRequestFactory()
        request = factory.get('/') 
        request.user = self.employee 
        
        permission = IsEmployee()
        self.assertTrue(permission.has_permission(request, None))
        
    def test_is_employee_permission_fail(self):
        
        factory = APIRequestFactory()
        request = factory.get('/')
        request.user = self.manager 
        
        permission = IsEmployee()
        self.assertFalse(permission.has_permission(request, None))


class DashboardServiceTest(TestCase):

    def setUp(self):
        self.manager = User.objects.create_user(
            username="manager_test",
            password="123",
            role="manager"
        )

        self.employee = User.objects.create_user(
            username="employee_test",
            password="123",
            role="employee"
        )

        # Task for employee
        Task.objects.create(
            title="Employee Task",
            description="Task for employee",
            assigned_to=self.employee,
            deadline=timezone.now()
        )

    def test_employee_dashboard_summary(self):
        summary = get_dashboard_summary(self.employee)

        self.assertEqual(summary["total_tasks"], 1)
        self.assertEqual(summary["evaluations"], 0)

    def test_manager_dashboard_summary(self):
        summary = get_dashboard_summary(self.manager)

        self.assertEqual(summary["total_tasks"], 1)
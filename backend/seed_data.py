import random
from datetime import date, datetime, timedelta, time
from django.utils import timezone
from django.db import transaction
from core.models import User, Task, Evaluation, Attendance, Breach
from faker import Faker

fake = Faker()

@transaction.atomic
def seed_database_2025():
    print("🗑️ Cleaning up old data...")
    Evaluation.objects.all().delete()
    Attendance.objects.all().delete()
    Breach.objects.all().delete()
    Task.objects.all().delete()
    User.objects.filter(role='employee').delete()
    print("✅ Database cleaned!")

    print("🌱 Starting massive database seeding for the year 2025...")

    manager, created = User.objects.get_or_create(
        username='manager_2025',
        defaults={'email': 'manager@smartmethods.com', 'role': 'manager'}
    )
    if created:
        manager.set_password('123456')
        manager.save()

    print("⏳ Creating 200 employees...")
    employees = []
    for i in range(200):
        username = f"emp_{i}_{fake.user_name()}"
        emp = User(
            username=username,
            email=fake.email(),
            role='employee',
            gender=random.choice(['male', 'female'])
        )
        emp.set_password('password123')
        employees.append(emp)

    User.objects.bulk_create(employees, ignore_conflicts=True)
    db_employees = list(User.objects.filter(role='employee'))
    print(f"✅ Created {len(db_employees)} fake employees.")

    start_date = date(2025, 1, 1)
    end_date = date(2025, 12, 31)
    total_days = (end_date - start_date).days + 1

    tasks_to_create = []
    attendances_to_create = []
    breaches_to_create = []

    print("⏳ Generating Tasks, Attendance, and Breaches for the entire year...")

    for emp in db_employees:
        # --- الحضور ---
        for day_offset in range(total_days):
            current_date = start_date + timedelta(days=day_offset)

            if current_date.weekday() in [4, 5]: # استثناء الويكند
                continue

            rand_chance = random.random()
            if rand_chance < 0.05:
                arrival_time = None
            elif rand_chance < 0.20:
                arrival_time = time(random.choice([8, 9]), random.choice([15, 30, 45]))
            else:
                arrival_time = time(random.choice([7, 8]), random.choice([0, 15, 30, 45]))
                if arrival_time.hour == 8 and arrival_time.minute > 14:
                    arrival_time = time(7, 45)

            attendances_to_create.append(
                Attendance(
                    user=emp,
                    date=current_date,
                    arrival_time=arrival_time # 🎯 هذا هو الحقل الوحيد الموجود في models.py
                )
            )

        # --- المهام ---
        for _ in range(random.randint(15, 25)):
            random_day_offset = random.randint(0, total_days - 30)
            task_created_date = start_date + timedelta(days=random_day_offset)
            task_deadline_date = task_created_date + timedelta(days=random.randint(3, 10))

            status = random.choices(['completed', 'in_progress', 'pending'], weights=[80, 15, 5])[0]

            tasks_to_create.append(
                Task(
                    title=fake.catch_phrase(),
                    description=fake.text(max_nb_chars=100),
                    assigned_to=emp,
                    importance_degree=random.choice([1, 2, 3]), # 🎯 الاسم الصحيح حسب models
                    status=status,
                    deadline=timezone.make_aware(datetime.combine(task_deadline_date, time(23, 59)))
                )
            )

        # --- المخالفات ---
        for _ in range(random.randint(0, 3)):
            breach_date = start_date + timedelta(days=random.randint(0, total_days - 1))
            breaches_to_create.append(
                Breach(
                    user=emp,
                    level=random.choice([1, 2, 3]), # 🎯 الاسم الصحيح في models.py هو level
                    date=breach_date
                )
            )

    print("🚀 Inserting data into database (Bulk Create)...")

    Attendance.objects.bulk_create(attendances_to_create, batch_size=5000)
    print(f"✅ Inserted {len(attendances_to_create)} attendance records.")

    Breach.objects.bulk_create(breaches_to_create, batch_size=5000)
    print(f"✅ Inserted {len(breaches_to_create)} breach records.")

    Task.objects.bulk_create(tasks_to_create, batch_size=5000)
    print(f"✅ Inserted {len(tasks_to_create)} tasks.")

    print("⏳ Generating Evaluations for completed tasks...")
    evaluations_to_create = []
    completed_tasks = Task.objects.filter(status='completed')
    
    for t in completed_tasks:
        evaluations_to_create.append(
            Evaluation(
                task=t,
                evaluator=manager,
                objective_score=random.uniform(50, 100), # 🎯 تمرير النسبة للحقل
                subjective_score=random.uniform(60, 100),
                feedback=fake.sentence()
            )
        )

    Evaluation.objects.bulk_create(evaluations_to_create, batch_size=5000)
    print(f"✅ Inserted {len(evaluations_to_create)} evaluations.")

    print("🎉 BOOM! 2025 Database successfully seeded with massive realistic data!")

seed_database_2025()
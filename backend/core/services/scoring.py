from datetime import timedelta , time , datetime
import math

class ruleBase:

    def __init__(self,data):

        self.submissionTime =data["submissionTime"]
        self.deadline = data["deadline"]
        self.taskNum = data ["taskNum"]
        self.submissionScore = 0
        self.totalTaskScore = 0
        self.taskComplateAVR = data["taskComplateAVR"]
        self.ComplateScore = 0
        self.startWork =data["startWork"]
        self.endWork = data["endWork"]
        self.arrivalTime = data["arrivalTime"]
        self.startMeeting = data["startMeeting"]
        self.endMeeting = data["endMeeting"]
        self.arrivalMeeting = data["arrivalMeeting"]
        self.attendanceScore = 0
        self.dayNum = 0
        self.breachLevel = data ["breachLevel"]
        self.breachNum = 0
        self.totalBreachScore = 0
        self.importanceDegree = data["importanceDegree"]

    # فنكشن لمعيار الالتزام بوقت التسليم
    def submissionTimeRule(self):

        # حساب فرق الوقت والأيام
        timeDifferent = self.submissionTime - self.deadline
        # يحسب أجزاء اليوم ويقربها ليوم ( لو عندي تأخير يوم وساعتين يعتبر تأخير يومين)
        daysLate = math.ceil(timeDifferent.total_seconds() /(24*3600))

        # في حال التسليم في الوقت يحصل على 100 نقطة
        if self.submissionTime <= self.deadline:
            return 100
        elif timeDifferent <= timedelta(hours = 24):
            return 97 # 100 - 3
        elif 2 <= daysLate <= 4:
            score = 100 - 3 - ((daysLate-1)*4)
            return max(0, score) # 🎯 يمنع النزول تحت الصفر
        elif 5 <= daysLate <= 7:
            score = 100 - 15 - ((daysLate-4)*5)
            return max(0, score) # 🎯 يمنع النزول تحت الصفر
        else:
            score = 100 - 30 - ((daysLate-7)*10)
            return max(0, score) # 🎯 يمنع النزول تحت الصفر


    # حساب معدل نقاط وقت التسليم خلال الشهر
    def submissionAverage(self):
        if self.taskNum == 1:
            self.submissionScore = 0
        self.submissionScore += self.submissionTimeRule() # تحسب مجموع النقاط
        submissionAVR = self.submissionScore / self.taskNum # تحسب المعدل للنقاط بناء على عدد المهام
        return submissionAVR


   # فنكشن تتحقق من اكتمال متطلبات المهمة
    def taskComplate (self):
        # اذا كمل 95 %
       if self.taskComplateAVR >=0.95:
           return 100

       elif 0.85 <= self.taskComplateAVR < 0.95 :
           return 100 - 10

       elif  0.75 <= self.taskComplateAVR < 0.85 :
            return 100 - 20

       elif  0.5 <= self.taskComplateAVR < 0.75 :
           return 100 - 35

       else :
           return 100 - 50


    # حساب معيار مدى أهمية المهمة لتحديد نسبة الخصم على الأداء والاكتمال
    def taskComplateScore (self):
        if self.taskNum == 1:
            self.ComplateScore = 0

        self.ComplateScore += self.taskComplate() # تحسب مجموع النقاط
        taskComplateScoreAVR = self.ComplateScore / self.taskNum # تحسب المعدل للنقاط بناء على عدد المهام
        return taskComplateScoreAVR


    # حساب معيار مدى أهمية المهمة
    def importance(self):
        #حساب عدد النقاط المخصومة من كل معيار
        submissionDeducation = 100 - self.submissionTimeRule()
        taskComplateDeducation = 100 - self.taskComplate()
        # مجموع نقاط الخصم
        totalDeducation = submissionDeducation + taskComplateDeducation
        # تصفير العداد اذا كانت أول مهمة في الشهر
        if self.taskNum == 1:
              self.totalTaskScore = 0
       # حساب نقاط الخصم لمعيار الأهمية بحسب درجة الأهمية
        if self.importanceDegree == 1:
           taskImportanceDeducation = totalDeducation * 0.20
        elif self.importanceDegree == 2:
           taskImportanceDeducation = totalDeducation * 0.10
        else:
           taskImportanceDeducation = 0
        # حساب النقاط بعد الخصم
        importanceScore = 100 - taskImportanceDeducation # قيمة النقاط بعد الخصم

        #حساب معدل النقاط خلال الشهر
        self.totalTaskScore += importanceScore
        importanceAVR = self.totalTaskScore / self.taskNum
        return importanceAVR
# معيار حساب التأخير عن العمل والاجتماعات والغياب
    def workTime(self):
        today = datetime.today().date()
        start_datetime = datetime.combine(today, self.startWork)
        start_meetingtime = datetime.combine(today, self.startMeeting)

        # 1. حالة الغياب الكامل عن العمل (ما نقدر نحسب شيء ثاني)
        if self.arrivalTime is None:
            return 70  # خصم 30 نقطة مثل ما حددتي

        # إذا داوم، نبدأ برصيد 100 نقطة ونخصم منه المخالفات
        final_score = 100

        # --- حساب خصم الدوام ---
        arrival_datetime = datetime.combine(today, self.arrivalTime)
        workDelay = arrival_datetime - start_datetime

        if workDelay >= timedelta(minutes=15):
            delayMinutes = workDelay.total_seconds() / 60
            timeDelay = math.ceil(delayMinutes / 15)
            final_score -= (timeDelay * 3) # يخصم 3 نقاط عن كل ربع ساعة

        # --- حساب خصم الاجتماع ---
        if self.arrivalMeeting is None:
            final_score -= 20 # خصم 20 نقطة (لأن كودك القديم كان يرجع 80)
        else:
            arrival_meetingtime = datetime.combine(today, self.arrivalMeeting)
            meetingDelay = arrival_meetingtime - start_meetingtime
            
            if timedelta(minutes=5) <= meetingDelay <= timedelta(minutes=10):
                final_score -= 10 # كان يرجع 90
            elif meetingDelay > timedelta(minutes=10):
                final_score -= 15 # كان يرجع 85

        # 🎯 أخيراً: نضمن إن الدرجة التراكمية ما تنزل تحت الصفر أبداً
        return max(0, final_score)

    #حساب معدل الالتزام بالحضور خلال الشهر
    def workTimeAverage(self):
        #كل بداية شهر يتم حساب معدل حضور جديد
        # التحقق مما إذا كان اليوم هو أول يوم في الشهر الميلادي لتصفير العدادات
        if datetime.now().day== 1:
            self.attendanceScore = 0
            self.dayNum = 0

        self.attendanceScore += self.workTime()
        self.dayNum += 1
        attendanceAVR = self.attendanceScore / self.dayNum
        return attendanceAVR


   # حساب خصومات الالتزام بسياسة الشركة
    def Breaches (self):
        # اذا ما فيه مخالفات
        if self.breachLevel is None :
            breachScore  = 100
            # مخالفة درجة أولى high
        elif self.breachLevel == 1:
            breachScore = 20
            #  moderate مخالفة درجة ثانية
        elif self.breachLevel == 2:
            breachScore = 70
            # مخالفة درجة ثالثة low
        elif self.breachLevel == 3:
            breachScore = 85
            
        # التحقق مما إذا كان اليوم هو أول يوم في الشهر الميلادي لتصفير العدادات
        # استخدمنا .day لأننا نحتاج رقم اليوم فقط من التاريخ الكامل.
        if datetime.now().day == 1:
            self.totalBreachScore = 0
            self.breachNum = 0

        self.totalBreachScore += breachScore
        self.breachNum +=1
        breachScoreAVR = self.totalBreachScore / self.breachNum
        return breachScoreAVR

    #نتيجة الscore النهائي
    def resultScore(self):
        # حساب محموع نقاط المهام المسلمة
        score_100 = (self.submissionAverage() * 0.20) + (self.taskComplateScore() * 0.20)+ (self.workTimeAverage() * 0.20) + (self.Breaches()* 0.20) + (self.importance() * 0.20)
        score_5 = score_100 / 20
        return score_5
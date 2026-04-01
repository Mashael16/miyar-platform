from rest_framework import filters
from .models import Evaluation
from django_filters.rest_framework import DjangoFilterBackend
import django_filters

class EvaluationFilter(django_filters.FilterSet):

    date_from = django_filters.DateFilter(

        field_name="created_at", lookup_expr="gte"

    )

    date_to = django_filters.DateFilter(

        field_name="created_at", lookup_expr="lte"

    )

    class Meta:

        model = Evaluation

        fields = ["task"]
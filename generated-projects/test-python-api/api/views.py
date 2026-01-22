from rest_framework import viewsets
from .models import SampleModel
from .serializers import SampleSerializer

class SampleViewSet(viewsets.ModelViewSet):
    queryset = SampleModel.objects.all()
    serializer_class = SampleSerializer

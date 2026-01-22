from django.test import TestCase
from .models import SampleModel

class SampleModelTestCase(TestCase):
    def setUp(self):
        SampleModel.objects.create(name="Test Item", description="Test Description")
    
    def test_sample_creation(self):
        item = SampleModel.objects.get(name="Test Item")
        self.assertEqual(item.description, "Test Description")

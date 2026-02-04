from django.urls import path
from .views import SurveySubmissionView, QuestionListView, CustomLoginView, RegisterView, SurveyResponseListView

urlpatterns = [
    path('submit/', SurveySubmissionView.as_view(), name='submit_survey'),
    path('questions/', QuestionListView.as_view(), name='list_questions'),
    path('responses/', SurveyResponseListView.as_view(), name='list_responses'),
    path('login/', CustomLoginView.as_view(), name='api_login'),
    path('register/', RegisterView.as_view(), name='api_register'),
]

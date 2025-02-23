from django.urls import path
from . import views

urlpatterns = [
    path('api/ai/', views.ai_response, name='ai_response'),
    path('api/subject/<str:subject_name>/', views.subject_notes_api, name='subject_notes_api'),
    path('api/question_paper/<int:pk>/download/', views.download_question_paper, name='download_question_paper'),
]
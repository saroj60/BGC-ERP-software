from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import ProjectViewSet, TaskViewSet, ProjectDocumentViewSet

router = DefaultRouter()
router.register(r'tasks', TaskViewSet, basename='task')
router.register(r'documents', ProjectDocumentViewSet, basename='project-document')
router.register(r'', ProjectViewSet)

urlpatterns = [
    path('', include(router.urls)),
]

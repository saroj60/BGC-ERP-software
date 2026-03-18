from django.urls import path
from .views import DashboardStatsView, AnalyticsView

urlpatterns = [
    path('stats/', DashboardStatsView.as_view(), name='dashboard-stats'),
    path('analytics/', AnalyticsView.as_view(), name='analytics'),
]

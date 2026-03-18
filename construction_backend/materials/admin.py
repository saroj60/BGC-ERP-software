from django.contrib import admin
from .models import MaterialRequest

@admin.register(MaterialRequest)
class MaterialRequestAdmin(admin.ModelAdmin):
    list_display = ('project', 'material_name', 'quantity', 'unit', 'status', 'requested_by')
    list_filter = ('status', 'project', 'requested_by')
    search_fields = ('material_name', 'project__name')

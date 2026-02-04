from django.contrib import admin
import csv
from django.http import HttpResponse
from django.utils.html import format_html, format_html_join
import json
from .models import SurveyResponse, Question

@admin.register(SurveyResponse)
class SurveyResponseAdmin(admin.ModelAdmin):
    list_display = ('id', 'get_house_no', 'surveyor', 'created_at')
    readonly_fields = ('formatted_answers',)
    exclude = ('answers', 'name', 'age', 'gender', 'occupation', 'household_size') # Hide raw JSON and legacy fields

    def get_house_no(self, obj):
        # specific key for the House No question
        key = "House D/No."
        return obj.answers.get(key, "-")
    get_house_no.short_description = "House D/No."

    def formatted_answers(self, obj):
        if not obj.answers:
            return "No answers submitted."
        
        rows = format_html_join(
            '',
            "<tr><td style='padding:8px; border:1px solid #ddd;'>{}</td><td style='padding:8px; border:1px solid #ddd; font-weight:bold;'>{}</td></tr>",
            obj.answers.items()
        )
        
        return format_html(
            "<table style='width:100%; border-collapse: collapse;'>"
            "<thead><tr style='background:#f3f4f6; text-align:left;'>"
            "<th style='padding:8px; border:1px solid #ddd;'>Question</th>"
            "<th style='padding:8px; border:1px solid #ddd;'>Answer</th>"
            "</tr></thead>"
            "<tbody>{}</tbody></table>",
            rows
        )
    
    formatted_answers.short_description = "Survey Responses"

    actions = ['export_as_csv']

    def export_as_csv(self, request, queryset):
        meta = self.model._meta
        response = HttpResponse(content_type='text/csv')
        response['Content-Disposition'] = 'attachment; filename={}.csv'.format(meta.verbose_name)
        writer = csv.writer(response)

        # Get all unique questions from all selected responses to make headers
        all_keys = set()
        for obj in queryset:
            if obj.answers:
                all_keys.update(obj.answers.keys())
        
        sorted_keys = sorted(list(all_keys))
        
        # Header: ID, Date, [Question 1, Question 2...]
        headers = ['ID', 'Created At'] + sorted_keys
        writer.writerow(headers)

        for obj in queryset:
            row = [obj.id, obj.created_at]
            for key in sorted_keys:
                row.append(obj.answers.get(key, ''))
            writer.writerow(row)

        return response

    export_as_csv.short_description = "Export Selected to CSV"


@admin.register(Question)
class QuestionAdmin(admin.ModelAdmin):
    list_display = ('text', 'field_type', 'order', 'is_active')
    list_editable = ('order', 'is_active')
    list_filter = ('field_type', 'is_active')
    search_fields = ('text',)
    ordering = ('order',)

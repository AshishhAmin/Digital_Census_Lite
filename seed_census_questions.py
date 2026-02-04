import os
import django
import sys

sys.path.append(os.path.join(os.getcwd(), 'backend'))
os.environ.setdefault("DJANGO_SETTINGS_MODULE", "census_backend.settings")
django.setup()

from api.models import Question

# Clean existing questions
print("Cleaning existing questions...")
Question.objects.all().delete()

# Questions Data
questions_data = [
    # Section A
    {"text": "1. Name of the Head of the Family", "field_type": "text", "order": 1},
    {"text": "2. Mobile Number of the Head of the Family", "field_type": "number", "order": 2},
    {"text": "3. Complete Residential Address", "field_type": "text", "order": 3},
    
    # Section B
    {"text": "4. Total Number of Family Members", "field_type": "number", "order": 4},
    {"text": "5. Number of Male Members", "field_type": "number", "order": 5},
    {"text": "6. Number of Female Members", "field_type": "number", "order": 6},
    {"text": "7. Number of Children (Below 18 Years)", "field_type": "number", "order": 7},

    # Section C
    {"text": "8. Religion of the Family", "field_type": "dropdown", "options": "Hindu,Muslim,Christian,Sikh,Jain,Buddhist,Other", "order": 8},
    {"text": "9. Category / Social Group", "field_type": "dropdown", "options": "General,OBC,SC,ST,Other", "order": 9},

    # Section D
    {"text": "10. Highest Educational Qualification", "field_type": "dropdown", "options": "No Formal Education,Primary,Secondary,Graduate,Post-Graduate,Other", "order": 10},
    {"text": "11. Primary Occupation", "field_type": "dropdown", "options": "Government Employee,Private Employee,Self-Employed,Farmer,Daily Wage Worker,Business,Unemployed,Other", "order": 11},

    # Section E
    {"text": "12. Primary Source of Family Income", "field_type": "dropdown", "options": "Salary,Agriculture,Business,Pension,Daily Wages,Other", "order": 12},
    {"text": "13. Approximate Monthly Family Income Range", "field_type": "dropdown", "options": "Below ₹10k,₹10k – ₹25k,₹25k – ₹50k,Above ₹50k", "order": 13},

    # Section F
    {"text": "14. Type of House", "field_type": "dropdown", "options": "Kutcha,Semi-Pucca,Pucca,Apartment", "order": 14},
    {"text": "15. Availability of Basic Amenities", "field_type": "dropdown", "options": "Drinking Water,Electricity,Toilet Facility,All of the Above", "order": 15},
]

print("Seeding new questions...")
for q in questions_data:
    Question.objects.create(
        text=q["text"],
        field_type=q["field_type"],
        options=q.get("options", ""),
        order=q["order"]
    )
print("Seeding Complete!")

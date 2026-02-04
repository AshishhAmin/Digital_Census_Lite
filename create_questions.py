import os
import django
import sys

sys.path.append(os.path.join(os.getcwd(), 'backend'))
os.environ.setdefault("DJANGO_SETTINGS_MODULE", "census_backend.settings")
django.setup()

from api.models import Question

def create_question():
    if not Question.objects.filter(text="Do you own a smartphone?").exists():
        Question.objects.create(
            text="Do you own a smartphone?",
            field_type="dropdown",
            options="Yes,No",
            order=1
        )
        print("Created Question: Do you own a smartphone?")
    else:
        print("Question already exists.")

if __name__ == "__main__":
    create_question()

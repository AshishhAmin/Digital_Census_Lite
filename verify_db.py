import os
import django
import sys

# Setup Django Environment
sys.path.append(os.path.join(os.getcwd(), 'backend'))
os.environ.setdefault("DJANGO_SETTINGS_MODULE", "census_backend.settings")
django.setup()

from api.models import SurveyResponse

def verify_records():
    print("Checking Database Records...")
    count = SurveyResponse.objects.count()
    print(f"Total Records: {count}")
    
    if count > 0:
        latest = SurveyResponse.objects.last()
        print(f"Latest Record: {latest.name} ({latest.occupation}) - {latest.gender}")
        
        if latest.name == "CLI Tester" and latest.occupation == "Script Runner":
            print("VERIFICATION PASSED: Latest record matches CLI submission.")
        else:
            print("VERIFICATION WARNING: Latest record does not match expected CLI data.")
    else:
        print("No records found.")

if __name__ == "__main__":
    verify_records()

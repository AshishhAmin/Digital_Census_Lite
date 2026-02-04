from django.http import HttpResponse

def home(request):
    return HttpResponse("""
    <h1>Digital Census Backend is Running</h1>
    <p>This is the API Server.</p>
    <p>Please access the Frontend Application at: <a href="http://localhost:5173">http://localhost:5173</a> (or the port shown in your terminal)</p>
    """)

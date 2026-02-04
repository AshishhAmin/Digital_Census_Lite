from rest_framework import status
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.authtoken.models import Token
from rest_framework.authtoken.views import ObtainAuthToken
from rest_framework.permissions import IsAuthenticated, IsAdminUser
from rest_framework.authentication import TokenAuthentication
from django.contrib.auth import authenticate
from .models import SurveyResponse, Question
from .serializers import SurveyResponseSerializer, QuestionSerializer, UserSerializer

class CustomLoginView(ObtainAuthToken):
    def post(self, request, *args, **kwargs):
        serializer = self.serializer_class(data=request.data, context={'request': request})
        serializer.is_valid(raise_exception=True)
        user = serializer.validated_data['user']
        token, created = Token.objects.get_or_create(user=user)
        return Response({
            'token': token.key,
            'user_id': user.pk,
            'username': user.username,
            'is_staff': user.is_staff
        })

class RegisterView(APIView):
    def post(self, request):
        serializer = UserSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class QuestionListView(APIView):
    authentication_classes = [TokenAuthentication]
    # Allow read-only for authenticated, but POST for admin
    
    def get_permissions(self):
        if self.request.method == 'POST':
            return [IsAdminUser()]
        return [IsAuthenticated()]

    def get(self, request):
        questions = Question.objects.filter(is_active=True)
        serializer = QuestionSerializer(questions, many=True)
        return Response(serializer.data)

    def post(self, request):
        serializer = QuestionSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class SurveySubmissionView(APIView):
    authentication_classes = [TokenAuthentication]
    permission_classes = [IsAuthenticated]

    def post(self, request):
        serializer = SurveyResponseSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save(surveyor=request.user)
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class SurveyResponseListView(APIView):
    authentication_classes = [TokenAuthentication]
    permission_classes = [IsAdminUser]

    def get(self, request):
        responses = SurveyResponse.objects.all().order_by('-created_at')
        serializer = SurveyResponseSerializer(responses, many=True)
        return Response(serializer.data)

class SurveyorListView(APIView):
    authentication_classes = [TokenAuthentication]
    permission_classes = [IsAdminUser]

    def get(self, request):
        from django.contrib.auth.models import User
        users = User.objects.all()
        serializer = UserSerializer(users, many=True)
        return Response(serializer.data)

class QuestionDetailView(APIView):
    authentication_classes = [TokenAuthentication]
    permission_classes = [IsAdminUser]

    def get_object(self, pk):
        try:
            return Question.objects.get(pk=pk)
        except Question.DoesNotExist:
            return None

    def put(self, request, pk):
        question = self.get_object(pk)
        if not question:
            return Response(status=status.HTTP_404_NOT_FOUND)
        
        serializer = QuestionSerializer(question, data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def delete(self, request, pk):
        question = self.get_object(pk)
        if not question:
            return Response(status=status.HTTP_404_NOT_FOUND)
        
        question.delete() # Or question.is_active = False if specific requirements
        return Response(status=status.HTTP_204_NO_CONTENT)

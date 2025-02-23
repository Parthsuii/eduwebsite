from django.shortcuts import get_object_or_404
from django.http import JsonResponse, HttpResponse, Http404
from django.views.decorators.csrf import csrf_exempt
from .models import Subject, Note, QuestionPaper
from google.generativeai import GenerativeModel # type: ignore # type: ignore, GenerativeModelError
from decouple import config # type: ignore
import json
import os
import logging
from django.core.exceptions import ObjectDoesNotExist
from django.views.decorators.cache import cache_page
from django.core.cache import cache

logger = logging.getLogger(__name__)

@csrf_exempt
def ai_response(request):
    if request.method != 'POST':
        return JsonResponse({'error': 'Method not allowed'}, status=405)

    try:
        data = json.loads(request.body.decode('utf-8'))
        question = data.get('question', '').strip()

        if not question:
            return JsonResponse({'error': 'Question is required'}, status=400)

        genai_api_key = config('GEMINI_API_KEY')
        if not genai_api_key:
            raise ValueError("GEMINI_API_KEY is not configured in .env")

        genai = GenerativeModel(api_key=genai_api_key, model_name="gemini-1.5-flash")
        model = genai

        cache_key = f"ai_response_{question}"
        cached_response = cache.get(cache_key)
        if cached_response:
            logger.info(f"Retrieved cached response for question: {question}")
            return JsonResponse({'answer': cached_response})

        try:
            result = model.generate_content(
                f"You are an educational AI assistant for EduLearn, providing clear, concise, and accurate step-by-step answers for students across all subjects (math, science, history, literature, languages, etc.). Answer the following question with detailed steps and explanations where applicable: {question}"
            )
            response = result.text.strip()
            cache.set(cache_key, response, timeout=3600)  # Cache for 1 hour
            logger.info(f"Successfully processed AI response for question: {question}")
        except GenerativeModelError as e: # type: ignore
            logger.error(f"Gemini API error for question '{question}': {str(e)}")
            return JsonResponse({'error': f"Gemini API error: {str(e)}"}, status=500)

        return JsonResponse({'answer': response})

    except json.JSONDecodeError as e:
        logger.error(f"Invalid JSON in request body: {str(e)}")
        return JsonResponse({'error': 'Invalid JSON format in request body'}, status=400)
    except Exception as e:
        logger.error(f"Unexpected error in ai_response: {str(e)}")
        return JsonResponse({'error': f"Unexpected error: {str(e)}"}, status=500)

@cache_page(60)  # Cache for 60 seconds
def subject_notes_api(request, subject_name):
    try:
        subject_name = subject_name.lower().strip()
        if subject_name not in [s[0] for s in Subject.SUBJECT_CHOICES]:
            raise Http404(f"Subject '{subject_name}' not found")

        subject = get_object_or_404(Subject, name=subject_name)
        notes = Note.objects.filter(subject=subject).select_related('subject').values('id', 'title', 'content', 'created_at')
        question_papers = QuestionPaper.objects.filter(subject=subject).select_related('subject').values('id', 'title', 'created_at')

        response_data = {
            'subject': subject.name,
            'notes': list(notes),
            'question_papers': list(question_papers),
            'message': f"Resources for {subject.name.capitalize()}!"
        }
        logger.info(f"Retrieved resources for subject: {subject.name}")
        return JsonResponse(response_data)

    except ObjectDoesNotExist:
        logger.error(f"Subject '{subject_name}' does not exist in the database")
        raise Http404(f"Subject '{subject_name}' not found")
    except Exception as e:
        logger.error(f"Error retrieving resources for subject '{subject_name}': {str(e)}")
        return JsonResponse({'error': f"Error retrieving resources: {str(e)}"}, status=500)

def download_question_paper(request, pk):
    try:
        question_paper = get_object_or_404(QuestionPaper, pk=pk)
        file_path = question_paper.file.path

        if not os.path.exists(file_path):
            logger.error(f"Question paper file not found: {file_path}")
            raise Http404("Question paper file not found")

        with open(file_path, 'rb') as file:
            response = HttpResponse(file.read(), content_type='application/pdf')
            response['Content-Disposition'] = f'attachment; filename="{question_paper.file.name}"'
            logger.info(f"Successfully downloaded question paper: {question_paper.title}")
            return response

    except ObjectDoesNotExist:
        logger.error(f"Question paper with ID {pk} does not exist")
        raise Http404("Question paper not found")
    except Exception as e:
        logger.error(f"Error downloading question paper {pk}: {str(e)}")
        return HttpResponse(f"Error downloading file: {str(e)}", status=500)

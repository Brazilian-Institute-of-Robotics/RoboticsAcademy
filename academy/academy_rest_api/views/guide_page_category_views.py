from django.http import JsonResponse
from exercises.models import GuidePageCategory

def get_all(request):
    if request.method == 'GET':
        try:
            categories = list(GuidePageCategory.objects.all().values())
            return JsonResponse(list(categories), safe=False)
        except Exception as e:
            return JsonResponse({'error': 'Error to find list of guide paga category.'}, status=500)
    else:
        return JsonResponse({
            'status': 'error', 
            'message': "Method not permited, must be GET."}
        , status=405)
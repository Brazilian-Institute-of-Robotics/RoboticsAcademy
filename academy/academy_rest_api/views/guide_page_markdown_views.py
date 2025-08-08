from django.http import JsonResponse
import os 

def get_base_file(request):
    if request.method == 'GET':
        try:
            base_path = '/GuidePages/_pages/exercises'
            hal_path = os.path.join(base_path, 'base.md')

            with open(hal_path, "r") as f:
                file_content = f.read()

            return JsonResponse({'file_content': file_content})
        
        except Exception as e:
            return JsonResponse({'error': 'Error to find markdown base file.'}, status=500)
    else:
        return JsonResponse({
            'status': 'error', 
            'message': "Method not permited, must be GET."}
        , status=405)
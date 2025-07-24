from django.http import JsonResponse
from exercises.models import NodeType

def get_all_nodes(request):
    if request.method == 'GET':
        nodes = list(NodeType.objects.all().values())
        return JsonResponse(list(nodes), safe=False)
    else:
        return JsonResponse({
            'status': 'error', 
            'message': "Method not permited, must be GET."}
        , status=405)
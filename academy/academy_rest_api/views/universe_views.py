from django.http import JsonResponse
from exercises.models import Universe, World


def check_name_availability(request,name):
    if request.method == "GET":
        if not name:
            return JsonResponse({'error': 'Universe name is required.'}, status=400)
        try:
            #Verify if universe and world with give name exists, the search is case insensitive
            universe_exists = Universe.objects.filter(name__iexact=name).exists()
            world_exists = World.objects.filter(name__iexact=name).exists()
            
            #Both are verify because on exercise creation, universe's name is used
            #as world name too
            exists = universe_exists or world_exists

            return JsonResponse({'message': 'Universe found.', 'exists': exists})
        except Exception as e:
            print(e)
            return JsonResponse({'error': 'Fail to find universe by name.'}, status=500)
    else:
        return JsonResponse({'error': 'Method not permited, must be GET.'}, status=405)
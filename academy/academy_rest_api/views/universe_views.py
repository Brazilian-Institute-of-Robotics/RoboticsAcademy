from django.http import JsonResponse
from exercises.models import Universe, World


def check_name_availability(request,name):
    if request.method == "GET":
        if not name:
            return JsonResponse({'error': 'Universe name is required.'}, status=400)
        try:
            universe_exists = Universe.objects.filter(name__iexact=name).exists()
            if universe_exists:
                return JsonResponse({'message': 'Check universe name realized.', 'exists': universe_exists})
            
            world_name_exits = World.objects.filter(name__iexact=name).exists()
            if world_name_exits:
                return JsonResponse({'message': 'Check universe realized.', 'exists': world_name_exits})

            launcher_path = f'/opt/jderobot/Launchers/{name.lower().replace(" ", "_")}.launch.py'
            world_launcher_exits = World.objects.filter(launch_file_path=launcher_path).exists()
            if world_launcher_exits:
                return JsonResponse({'message': 'Check universe realized.', 'exists': world_launcher_exits})
            
            return JsonResponse({'message': 'Check universe realized.', 'exists': False})
        
        except Exception as e:
            return JsonResponse({'error': 'Fail to find universe by name.'}, status=500)
    else:
        return JsonResponse({'error': 'Method not permited, must be GET.'}, status=405)

def get_universe_list(request):
    if request.method == "GET":
        try:
            universes = list(Universe.objects.all().order_by("name").values())
            return JsonResponse(list(universes), safe=False)
        except Exception as e:
            return JsonResponse({'error': 'Fail to find universe by name.'}, status=500)

    else:
        return JsonResponse({'error': 'Method not permited, must be GET.'}, status=405)
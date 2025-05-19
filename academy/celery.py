import os
from celery import Celery
from celery.schedules import crontab

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'academy.settings')

app = Celery('academy')
app.config_from_object('django.conf:settings', namespace='CELERY')
app.autodiscover_tasks()

#EXECUTE TASK EVERY DAY AT MIDNIGHT
app.conf.beat_schedule = {
    'remove-expired-containers-every-24h': {
        'task': 'academy.academy_rest_api.tasks.remove_expired_containers',
        'schedule': crontab(hour=0, minute=0),
    },
}

from celery import shared_task
from datetime import datetime, timezone
import docker
from zoneinfo import ZoneInfo

@shared_task
def remove_expired_containers():
    client = docker.from_env()
    now = datetime.now(ZoneInfo("America/Sao_Paulo"))

    for container in client.containers.list(all=True, filters={"label": "expired_at"}):
        expired_at_str = container.labels.get("expired_at")
        if not expired_at_str:
            continue
        try:
            expired_at = datetime.fromisoformat(expired_at_str)
            if expired_at < now:
                container.stop()
                container.remove(force=True)
        except Exception as e:
            print(f"Error to delete container {container.name}: {e}")
            continue
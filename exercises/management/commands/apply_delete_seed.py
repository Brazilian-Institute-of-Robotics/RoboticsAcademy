import json
from pathlib import Path
from django.core.management.base import BaseCommand, CommandError
from django.apps import apps

#Command used on webapp container to execute one deleting seed
class Command(BaseCommand):
    help = "Apply deletion seed e JSON format"

    def add_arguments(self, parser):
        parser.add_argument("path", type=str, help="Path to file *_delete.json")

    def handle(self, *args, **opts):
        path = Path(opts["path"])
        if not path.is_file():
            raise CommandError(f"File not found: {path}")

        try:
            payload = json.loads(path.read_text(encoding="utf-8"))
        except Exception as e:
            raise CommandError(f"Error to read JSON {path}: {e}")

        # If there is only operation in JSON, it's normalized to a list of one item
        if isinstance(payload, dict):
            payload = [payload]

        if not isinstance(payload, list):
            raise CommandError(f"Invalid format in {path}: waiting a object or a list of objects")

        for op in payload:

            model_label = op.get("model")
            criteria = op.get("by")
            if not model_label or not criteria:
                raise CommandError(f"Invalid operation in {path}: missing model or by")

            app_label, model_name = model_label.split(".")
            Model = apps.get_model(app_label, model_name)

            deleted, _ = Model.objects.filter(**criteria).delete()
            self.stdout.write(
                self.style.SUCCESS(f"[run_seeds] row removed from {model_label} with {criteria}")
            )

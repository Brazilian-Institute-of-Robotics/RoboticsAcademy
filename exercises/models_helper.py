from django.db import models

class ExerciseHelper(models.Manager):
    def get_by_natural_key(self, exercise_id):
        return self.get(exercise_id=exercise_id)

class UniverseHelper(models.Manager):
    def get_by_natural_key(self, name):
        return self.get(name=name)

class WorldHelper(models.Manager):
    def get_by_natural_key(self, name):
        return self.get(name=name)

class RobotHelper(models.Manager):
    def get_by_natural_key(self, name):
        return self.get(name=name)

class GuidePageCategoryHelper(models.Manager):
    def get_by_natural_key(self, name):
        return self.get(name=name)
from girder.models.model_base import Model


class Base(Model):
    def validate(self, model):
        return model

    def findByItem(self, item):
        return self.find(query={'itemId': item['_id']})

    def imported(self, item):
        return True if self.findByItem(item).count() else False

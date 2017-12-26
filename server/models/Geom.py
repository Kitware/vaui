from girder.models.model_base import Model


class Geom(Model):

    def initialize(self):
        self.name = 'geom'
        self.ensureIndex('itemId')

    def validate(self, geom):
        return geom

    def findByItem(self, item):
        return self.find(query={'itemId': item['_id']})

    def imported(self, item):
        return True if self.findByItem(item).count() else False

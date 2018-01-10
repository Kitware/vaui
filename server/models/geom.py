from girder.plugins.vaui.models.base import Base


class Geom(Base):

    def initialize(self):
        self.name = 'geom'
        self.ensureIndex('itemId')

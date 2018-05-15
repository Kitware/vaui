from girder.plugins.vaui.models.base import Base


class Types(Base):

    def initialize(self):
        self.name = 'types'
        self.ensureIndex('assignmentId')

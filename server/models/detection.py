from girder.plugins.vaui.models.base import Base


class Detection(Base):

    def initialize(self):
        self.name = 'detection'
        self.ensureIndex('assignmentId')

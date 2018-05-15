from girder.plugins.vaui.models.base import Base


class Activities(Base):

    def initialize(self):
        self.name = 'activities'
        self.ensureIndex('assignmentId')

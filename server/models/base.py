from girder.models.model_base import Model
from girder.models.folder import Folder


class Base(Model):
    def validate(self, model):
        return model

    def findByFolder(self, folder):
        items = list(Folder().childItems(folder, filters={
            'name': folder['name'] + '.' + self.name + '.yml'
        }))
        if items:
            item = items[0]
            if self.find(query={'itemId': item['_id']}).count() != 0:
                print 'Data migrating'
                self.update(query={'itemId': item['_id']}, update={'$unset': {
                            'itemId': ''}, '$set': {'folderId': folder['_id']}})

        return self.find(query={'folderId': folder['_id']})

    def recordCount(self, folder):
        return self.findByFolder(folder).count()

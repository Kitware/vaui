import tempfile
import json

from girder_worker_utils.transforms.girder_io import GirderClientTransform
from girder_worker_utils.transforms.girder_io import GirderClientResultTransform


class PrepareInterpolate(GirderClientTransform):
#Placeholder for actual needed transform logic

    def __init__(self, detections, **kwargs):
        super(PrepareInterpolate, self).__init__(**kwargs)
        self.detections = detections

    def transform(self, *args, **kwargs):
        # do any proper transform with self.gc (girderclient)
        return self.detections

    def cleanup(self):
        pass

class SaveResultToItem(GirderClientResultTransform):
    # Maybe able to use GirderUploadToItem from
    # girder_worker_utils.transforms.girder_io directly

    def __init__(self, itemId, **kwargs):
        super(SaveResultToItem, self).__init__(**kwargs)
        self.item_id = str(itemId)

    def transform(self, detections, *args, **kwargs):
        with tempfile.NamedTemporaryFile() as f:
            f.write(json.dumps(detections))
            f.flush()
            self.gc.uploadFileToItem(self.item_id, f.name)
        return self.item_id

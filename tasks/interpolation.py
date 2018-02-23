from girder_worker.app import app
from girder_worker.utils import girder_job


@girder_job()
@app.task(bind=True)
def interpolate(self, kwargs):
    return 1

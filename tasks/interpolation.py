import json

from girder_worker.app import app
from girder_worker.utils import girder_job


@girder_job()
@app.task(bind=True)
def interpolate(self, detections):
    newDetections = []
    for i in range(1, len(detections)):
        newDetections.append(detections[i - 1])
        if(detections[i]['ts0'] - 1 > detections[i - 1]['ts0']):
            newDetections += _interpolateDetactionToDetection(detections[i - 1], detections[i])
        newDetections.append(detections[i])
    return newDetections

def _interpolateDetactionToDetection(a, b):
    startTs = a['ts0']
    steps = b['ts0'] - startTs - 1
    start1 = a['g0'][0][0]
    start2 = a['g0'][0][1]
    start3 = a['g0'][1][0]
    start4 = a['g0'][1][1]
    d1 = (b['g0'][0][0] - start1) / float(steps)
    d2 = (b['g0'][0][1] - start2) / float(steps)
    d3 = (b['g0'][1][0] - start3) / float(steps)
    d4 = (b['g0'][1][1] - start4) / float(steps)
    newDetections = []
    for i in range(1, steps + 1):
        newDetections.append({
            "src": 'linear-interpolation',
            "g0": [
                [
                    int(start1 + i * d1),
                    int(start2 + i * d2)
                ],
                [
                    int(start3 + i * d3),
                    int(start4 + i * d4)
                ]
            ],
            "keyValues": {
            },
            "ts0": startTs + i
        })
    return newDetections

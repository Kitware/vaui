import boto3

import sys
if len(sys.argv) != 3:
    sys.stderr.write('Needs a folder id for video and an item id for activity group as parameters\n')
    sys.exit()

folderId = sys.argv[1]
activityGroupItemId = sys.argv[2]

client = boto3.client('mturk',
                      endpoint_url='https://mturk-requester-sandbox.us-east-1.amazonaws.com')

externalQuestion = """<?xml version="1.0"?>
<ExternalQuestion xmlns="http://mechanicalturk.amazonaws.com/AWSMechanicalTurkDataSchemas/2006-07-14/ExternalQuestion.xsd">
    <ExternalURL>https://mturk.kitware.com/?folderId=""" + folderId + """&amp;activityGroupItemId=""" + activityGroupItemId + """</ExternalURL>
    <FrameHeight>800</FrameHeight>
</ExternalQuestion>"""

response = client.create_hit(
    MaxAssignments=1,
    LifetimeInSeconds=3600,
    AssignmentDurationInSeconds=15 * 60,
    Reward='0.20',
    Title='Image annotation',
    Keywords='annotation,image,draw',
    Description='Annotation vehicles on an image',
    Question=externalQuestion
)

print response

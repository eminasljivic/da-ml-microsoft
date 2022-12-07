import json, sys, logging
from json import JSONEncoder
import azure.functions as func
import numpy as np
from pdf2image import convert_from_bytes

sys.path.insert(1, '../utils')
from utils.boundingbox import BoundingBoxes

# https://stackoverflow.com/questions/50916422/python-typeerror-object-of-type-int64-is-not-json-serializable
class NumpyArrayEncoder(JSONEncoder):
    def default(self, obj):
        if isinstance(obj, np.integer):
            return int(obj)
        return JSONEncoder.default(self, obj)

def main(req: func.HttpRequest) -> func.HttpResponse:
    try:
        logging.info('Bounds HTTP functions registered a request.')
        
        body = req.get_body()
        pages = convert_from_bytes(body)
        image = np.array(pages[0])

        if body:
            bounding_boxes = BoundingBoxes()

            bounds = bounding_boxes.get_bounding_boxes_from_img(image, dist_limit=20)
            return func.HttpResponse(json.dumps(bounds, cls=NumpyArrayEncoder), mimetype="application/json")
        else:
            return func.HttpResponse('Request does not contain a body.', status_code=400)
    except Exception as e:
        print(e)
        return func.HttpResponse("An error occurred while processing the request", status_code=500)
    
import json
import logging
from json import JSONEncoder

import azure.functions as func
import easyocr
import numpy
from pdf2image import convert_from_bytes


# https://stackoverflow.com/questions/50916422/python-typeerror-object-of-type-int64-is-not-json-serializable
class NumpyArrayEncoder(JSONEncoder):
    def default(self, obj):
        if isinstance(obj, numpy.integer):
            return int(obj)
        return JSONEncoder.default(self, obj)

def main(req: func.HttpRequest) -> func.HttpResponse:
    logging.info('Bounds HTTP functions registered a request.')

    reader = easyocr.Reader(['de'])
    body = req.get_body()

    image = convert_from_bytes(body, dpi=300)

    if body:
        bounds = reader.readtext(numpy.array(image[0]))
        return func.HttpResponse(json.dumps(bounds, cls=NumpyArrayEncoder), mimetype="application/json")
    else:
        return func.HttpResponse('Request is missing a body :D', status_code=400)
    

import logging

import azure.functions as func
from pdf2image import convert_from_bytes
import json


def main(req: func.HttpRequest) -> func.HttpResponse:
    logging.info('Size HTTP functions registered a request.')

    body = req.get_body()
    image = convert_from_bytes(body, dpi=300)
    logging.info(image[0].size)

    return func.HttpResponse(json.dumps(image[0].size))
    

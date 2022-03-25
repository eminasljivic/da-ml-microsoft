import azure.functions
import easyocr
import numpy as np


def main(req: azure.functions.HttpRequest):
    reader = easyocr.Reader(['de'])
    return reader.readtext(np.array(req.get_body()))

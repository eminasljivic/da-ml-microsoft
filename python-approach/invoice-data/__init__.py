import json, sys, logging
import azure.functions as func
import numpy as np
from pdf2image import convert_from_bytes

sys.path.insert(1, '../utils')
from utils.invoicedata import InvoiceData

def main(req: func.HttpRequest) -> func.HttpResponse:
    try:
        logging.info('Invoice data registered a request.')
        
        body = req.get_body()
        pages = convert_from_bytes(body)
        image = np.array(pages[0])

        if body:
            invoice_data = InvoiceData()

            data = invoice_data.get_invoice_data(image, 'model/model-best')
            return func.HttpResponse(json.dumps(data), mimetype="application/json")
        else:
            return func.HttpResponse('Request does not contain a body.', status_code=400)
    except Exception as e:
        return func.HttpResponse("An error occurred while processing the request", status_code=500)
    
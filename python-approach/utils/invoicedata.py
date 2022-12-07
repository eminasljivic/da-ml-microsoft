from io import StringIO
import sys
import pandas as pd
import spacy
sys.path.insert(1, '../utils')
from utils.text import Text

class InvoiceData:
    def get_invoice_data(self, image, modelPath):
        textUtil = Text()

        nlp_ner = spacy.load(modelPath)

        text = textUtil.get_text(image)
        formatted_text_lines = textUtil.get_text_formatted(image).split('\n')

        op_dict = {}
        doc = nlp_ner(text)
        for ent in doc.ents:      
            op_dict[ent.label_] = ent.text

        header_fields = {'item-header', 'qty-header', 'rate-header', 'total-header'}
        header_rows = []
        for header_field in header_fields:
            header_rows.append(list(map(lambda l: op_dict[header_field] in l, formatted_text_lines)).index(True))

        header_row = max(set(header_rows), key=header_rows.count)
        table = formatted_text_lines[header_row:]
        text = '\n'.join(table)

        df = pd.read_csv(StringIO(text), sep='\s{3,}', engine='python', index_col=False).dropna()
        
        items = []
        for i in range(0, df.shape[0]):
            item = {}
            for header_field in header_fields:
                item[op_dict.get(header_field)] = df.loc[i][op_dict.get(header_field)]
            items.append(item)
        op_dict['items'] = items

        for header_field in header_fields:
            op_dict.pop(header_field)

        return op_dict
    
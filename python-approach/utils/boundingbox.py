from pdf2image import convert_from_path
import numpy as np
import pytesseract
from pytesseract import Output
import cv2

class BoundingBoxes:
    def get_bounding_boxes_from_img(self, img, min_text_height_limit=6, max_text_height_limit=40, dist_limit = 10, cell_threshold=50):
        img = self.pre_process_image(img)
        boxes = []

        d = pytesseract.image_to_data(img, output_type=Output.DICT)
        for i in range(len(d['level'])):
            (x, y, w, h, text) = (d['left'][i], d['top'][i], d['width'][i], d['height'][i], d['text'][i])

            if min_text_height_limit < h < max_text_height_limit and d['text'][i].strip():
                boxes.append([x, y, w, h, text])

        return self.__merge(boxes, dist_limit=dist_limit, cell_threshold= cell_threshold)
    
    def pre_process_image(self, img, morph_size=(1, 1)):
        pre = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
        pre = cv2.threshold(pre, 240, 255, cv2.THRESH_BINARY)[1]
        # dilate the text to make it solid spot
        cpy = pre.copy()
        struct = cv2.getStructuringElement(cv2.MORPH_RECT, morph_size)
        cpy = cv2.dilate(~cpy, struct, anchor=(-1, -1), iterations=1)
        pre = ~cpy
        return pre

    #Generate two text boxes a larger one that covers them
    def __merge_boxes(self, box1, box2):
        (x1, y1, w1, h1, text1) = box1
        (x2, y2, w2, h2, text2) = box2

        return [min(x1, x2), 
            min(y1, y2), 
            w1 + w2 + self.__calc_horizontal_distance(box1, box2),
            max(h1, h2),
            text1 + ' ' + text2]


    def __calc_horizontal_distance(self, box1, box2):
        (x1, y1, w1, h1, text1) = box1
        (x2, y2, w2, h2, text2) = box2

        return abs(min(x1+w1-x2,x2+w2-x1))

    def __get_rows(self, boxes, cell_threshold=50):
        rows = {}

        # Clustering the bounding boxes by their positions
        for box in boxes:
            (x, y, w, h, text) = box
            row_key = y // cell_threshold
            rows[row_key] = [box] if row_key not in rows else rows[row_key] + [box]

        return rows

    def __merge(self, boxes, dist_limit = 10, cell_threshold=50):
        rows = self.__get_rows(boxes, cell_threshold)
        for row in rows.values():
            i=0
            while i<len(row)-1:
                if self.__calc_horizontal_distance(row[i], row[i+1]) <= dist_limit:
                    row[i] = self.__merge_boxes(row[i], row[i+1])
                    row.pop(i+1)
                else:
                    i += 1
        return [item for sublist in list(rows.values()) for item in sublist]


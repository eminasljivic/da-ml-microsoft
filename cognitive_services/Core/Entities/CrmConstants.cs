using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Core.Entities
{
    public class CrmConstants
    {
        public static string ENTITY_INVOICE = "new_invoice";
        public static string ENTITY_ITEM = "new_item";
        public static string ENTITY_PERFORMANCEMETRIC = "new_performancemetric";
        public static string ENTITY_PERFORMANCELINE = "new_performanceline";

        public static string ATTR_INVOICE_COMPANYADDRESS = "new_companyaddress";
        public static string ATTR_INVOICE_ID = "new_invoiceid";
        public static string ATTR_INVOICE_COMPANYNAME = "new_companyname";
        public static string ATTR_INVOICE_INVOICEDATE = "new_invoicedate";
        public static string ATTR_INVOICE_INVOICENUMBER = "new_invoicenumber";
        public static string ATTR_INVOICE_TOTALVALUE = "new_totalvalue";

        public static string ATTR_ITEM_INVOICEID = "new_invoiceid";
        public static string ATTR_ITEM_DESCRIPTION = "new_description";
        public static string ATTR_ITEM_QUANTITY = "new_qantity";
        public static string ATTR_ITEM_TOTALPRICE = "new_totalprice";
        public static string ATTR_ITEM_UNIT = "new_unit";
        public static string ATTR_ITEM_UNITPRICE = "new_unitprice";

        public static string ATTR_PERFORMANCEMETRIC_INVOICEID = "new_invoiceid";
        public static string ATTR_PERFORMANCEMETRIC_ID = "new_performancemetricid";
        public static string ATTR_PERFORMANCEMETRIC_BEGIN = "new_begin";
        public static string ATTR_PERFORMANCEMETRIC_END = "new_end";
        public static string ATTR_PERFORMANCEMETRIC_TYPE = "new_type";
        public static string ATTR_PERFORMANCEMETRIC_DURATION = "new_duration";

        public static string ATTR_PERFORMANCELINE_PERFORMANCEMETRICID = "new_performancemetricid";
        public static string ATTR_PERFORMANCELINE_FIELDCONFIDENCE = "new_fieldconfidence";
        public static string ATTR_PERFORMANCELINE_FIELDNAME = "new_fieldname";
        public static string ATTR_PERFORMANCELINE_FIELDVALUE = "new_fieldvalue";
    }
}

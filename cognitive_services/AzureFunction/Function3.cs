using System;
using System.IO;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Azure.WebJobs;
using Microsoft.Azure.WebJobs.Extensions.Http;
using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Logging;
using Newtonsoft.Json;
using Microsoft.PowerPlatform.Dataverse.Client;
using Microsoft.Xrm.Sdk;
using Microsoft.Xrm.Sdk.Query;
using System.Collections.Generic;
using Core.DTO;
using Core;
using System.Linq;
using cognitive_services;
using Core.Entities;
using Microsoft.Crm.Sdk.Messages;
using System.Globalization;

namespace AzureFunction
{
    public class Function3
    {
        private readonly IOrganizationServiceAsync2 _crm;
        private EntityCollection invoices;
        private EntityCollection invoiceItems;
        private EntityCollection performanceMetrics;
        private EntityCollection performanceMetricLines;
        public Function3(IOrganizationServiceAsync2 crm)
        {
            _crm = crm;
            invoices = new EntityCollection();
            invoiceItems = new EntityCollection();  
            performanceMetrics = new EntityCollection();    
            performanceMetricLines = new EntityCollection();
        }
        [FunctionName("GetMetrics")]
        public async Task<IActionResult> Run([HttpTrigger(AuthorizationLevel.Anonymous, "get", "post", Route = "GetMetrics/type={type}")] HttpRequest req,ILogger log,string type)
        {

            QueryExpression performanceQuery = new QueryExpression(CrmConstants.ENTITY_PERFORMANCEMETRIC);
            performanceQuery.ColumnSet = new ColumnSet(CrmConstants.ATTR_PERFORMANCEMETRIC_BEGIN,
                CrmConstants.ATTR_PERFORMANCEMETRIC_END,
                CrmConstants.ATTR_PERFORMANCEMETRIC_TYPE,
                CrmConstants.ATTR_PERFORMANCEMETRIC_DURATION,
                CrmConstants.ATTR_PERFORMANCEMETRIC_INVOICEID);
            if (type != "all")
            {
                performanceQuery.Criteria.AddCondition(CrmConstants.ATTR_PERFORMANCEMETRIC_TYPE, ConditionOperator.Equal, type.ToUpper());
            }
            performanceMetrics = await _crm.RetrieveMultipleAsync(performanceQuery);

            var invoiceQuery = new QueryExpression(CrmConstants.ENTITY_INVOICE);
            invoiceQuery.ColumnSet = new ColumnSet(CrmConstants.ATTR_INVOICE_COMPANYADDRESS,
                CrmConstants.ATTR_INVOICE_NAME,
                CrmConstants.ATTR_INVOICE_COMPANYNAME,
                CrmConstants.ATTR_INVOICE_INVOICENUMBER,
                CrmConstants.ATTR_INVOICE_INVOICEDATE,
                CrmConstants.ATTR_INVOICE_TOTALVALUE);
            invoices = await _crm.RetrieveMultipleAsync(invoiceQuery);

            QueryExpression invoiceItemQuery = new QueryExpression(CrmConstants.ENTITY_ITEM);
            invoiceItemQuery.ColumnSet = new ColumnSet(CrmConstants.ATTR_ITEM_DESCRIPTION, 
                CrmConstants.ATTR_ITEM_QUANTITY, 
                CrmConstants.ATTR_ITEM_UNIT, 
                CrmConstants.ATTR_ITEM_UNITPRICE, 
                CrmConstants.ATTR_ITEM_TOTALPRICE,
                CrmConstants.ATTR_INVOICE_ID);
            invoiceItems = await _crm.RetrieveMultipleAsync(invoiceItemQuery);
            
            QueryExpression performanceLineQuery = new QueryExpression(CrmConstants.ENTITY_PERFORMANCELINE);
            performanceLineQuery.ColumnSet = new ColumnSet(CrmConstants.ATTR_PERFORMANCELINE_FIELDNAME, 
                CrmConstants.ATTR_PERFORMANCELINE_FIELDVALUE, 
                CrmConstants.ATTR_PERFORMANCELINE_FIELDCONFIDENCE, 
                CrmConstants.ATTR_PERFORMANCELINE_PERFORMANCEMETRICID);
            performanceMetricLines = await _crm.RetrieveMultipleAsync(performanceLineQuery);

            return new OkObjectResult(GetMetricDtos());
        }

        private List<MetricDto> GetMetricDtos()
        {
            List<MetricDto> metricDtos = new List<MetricDto>();

            foreach (var p in performanceMetrics.Entities)
            {

                PerformanceMetric pm = new()
                {
                    Begin = p[CrmConstants.ATTR_PERFORMANCEMETRIC_BEGIN].ToString(),
                    Type = p[CrmConstants.ATTR_PERFORMANCEMETRIC_TYPE].ToString(),
                    End = p[CrmConstants.ATTR_PERFORMANCEMETRIC_END].ToString(),
                    Duration = p[CrmConstants.ATTR_PERFORMANCEMETRIC_DURATION].ToString(),
                    InvoiceId = (p[CrmConstants.ATTR_PERFORMANCEMETRIC_INVOICEID] as EntityReference).Id,
                    OverAllConfidence = performanceMetricLines.Entities.Where(e => Double.Parse(e[CrmConstants.ATTR_PERFORMANCELINE_FIELDCONFIDENCE].ToString()) != 0 && (e[CrmConstants.ATTR_PERFORMANCELINE_PERFORMANCEMETRICID] as EntityReference).Id == p.Id)
                    .Select(e => Double.Parse(e[CrmConstants.ATTR_PERFORMANCELINE_FIELDCONFIDENCE].ToString()))
                    .Average().ToString(),
                    Lines = performanceMetricLines.Entities
                        .Where(pml => (pml[CrmConstants.ATTR_PERFORMANCELINE_PERFORMANCEMETRICID] as EntityReference).Id == p.Id)
                        .Select(e => new PerformanceMetricLine()
                        {
                            FieldConfidence = e[CrmConstants.ATTR_PERFORMANCELINE_FIELDCONFIDENCE].ToString(),
                            FieldName = e[CrmConstants.ATTR_PERFORMANCELINE_FIELDNAME].ToString(),
                            FieldValue = e[CrmConstants.ATTR_PERFORMANCELINE_FIELDVALUE].ToString(),
                        }).ToList()
                };

                Invoice i = invoices.Entities
                    .Select(i => new Invoice()
                    {
                        Id = i.Id,
                        Name = i[CrmConstants.ATTR_INVOICE_NAME].ToString(),
                        CompanyAddress = i[CrmConstants.ATTR_INVOICE_COMPANYADDRESS].ToString(),
                        CompanyName = i[CrmConstants.ATTR_INVOICE_COMPANYNAME].ToString(),
                        InvoiceDate = i[CrmConstants.ATTR_INVOICE_INVOICEDATE].ToString(),
                        InvoiceId = i[CrmConstants.ATTR_INVOICE_INVOICENUMBER].ToString(),
                        TotalValue = i[CrmConstants.ATTR_INVOICE_TOTALVALUE].ToString(),
                        Items = this.invoiceItems.Entities
                                .Where(en => (en[CrmConstants.ATTR_ITEM_INVOICEID] as EntityReference).Id == i.Id)
                                .Select(e => new Item()
                                {
                                    Description = e[CrmConstants.ATTR_ITEM_DESCRIPTION].ToString(),
                                    Quantity = e[CrmConstants.ATTR_ITEM_QUANTITY].ToString(),
                                    TotalPrice = e[CrmConstants.ATTR_ITEM_TOTALPRICE].ToString(),
                                    Unit = e[CrmConstants.ATTR_ITEM_UNIT].ToString(),
                                    UnitPrice = e[CrmConstants.ATTR_ITEM_UNITPRICE].ToString(),
                                }).ToList()
                    }).Single(inv => inv.Id == pm.InvoiceId);

                //Invoice inv = new()
                //{
                //    CompanyAddress = i[CrmConstants.ATTR_INVOICE_COMPANYADDRESS].ToString(),
                //    CompanyName = i[CrmConstants.ATTR_INVOICE_COMPANYNAME].ToString(),
                //    InvoiceDate = i[CrmConstants.ATTR_INVOICE_INVOICEDATE].ToString(),
                //    InvoiceId = i[CrmConstants.ATTR_INVOICE_INVOICENUMBER].ToString(),
                //    TotalValue = i[CrmConstants.ATTR_INVOICE_TOTALVALUE].ToString(),
                //    Items = this.invoiceItems.Entities
                //        .Where(en => (en[CrmConstants.ATTR_ITEM_INVOICEID] as EntityReference).Id == i.Id)
                //        .Select(e => new Item()
                //        {
                //            Description = e[CrmConstants.ATTR_ITEM_DESCRIPTION].ToString(),
                //            Quantity = e[CrmConstants.ATTR_ITEM_QUANTITY].ToString(),
                //            TotalPrice = e[CrmConstants.ATTR_ITEM_TOTALPRICE].ToString(),
                //            Unit = e[CrmConstants.ATTR_ITEM_UNIT].ToString(),
                //            UnitPrice = e[CrmConstants.ATTR_ITEM_UNITPRICE].ToString(),
                //        }).ToList()
                //};
                //List<PerformanceMetric> pm = this.performanceMetrics.Entities
                //    .Where(perf => (perf[CrmConstants.ATTR_PERFORMANCEMETRIC_INVOICEID] as EntityReference).Id == i.Id)
                //    .Select(p => new PerformanceMetric()
                //    {
                //        Begin = p[CrmConstants.ATTR_PERFORMANCEMETRIC_BEGIN].ToString(),
                //        Type = p[CrmConstants.ATTR_PERFORMANCEMETRIC_TYPE].ToString(),
                //        End = p[CrmConstants.ATTR_PERFORMANCEMETRIC_END].ToString(),
                //        Duration = p[CrmConstants.ATTR_PERFORMANCEMETRIC_DURATION].ToString(),
                //        Lines = performanceMetricLines.Entities
                //        .Where(pml => (pml[CrmConstants.ATTR_PERFORMANCELINE_PERFORMANCEMETRICID] as EntityReference).Id == p.Id)
                //        .Select(e => new PerformanceMetricLine()
                //        {
                //            FieldConfidence = (float?)0.0,//float.Parse(e[CrmConstants.ATTR_PERFORMANCELINE_FIELDNAME].ToString(), NumberStyles.Float, CultureInfo.InvariantCulture),
                //            FieldName = e[CrmConstants.ATTR_PERFORMANCELINE_FIELDNAME].ToString(),
                //            FieldValue = e[CrmConstants.ATTR_PERFORMANCELINE_FIELDVALUE].ToString(),
                //        }).ToList()

                //    }).ToList();
                metricDtos.Add(new MetricDto(i, pm));
            }

            return metricDtos;
        }
    }
}

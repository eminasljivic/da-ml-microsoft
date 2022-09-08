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
        public async Task<IActionResult> Run([HttpTrigger(AuthorizationLevel.Anonymous, "get", "post", Route = null)] HttpRequest req,ILogger log)
        {
            //var invoiceQuery = new QueryExpression
            //{
            //    ColumnSet = new ColumnSet(CrmConstants.ATTR_INVOICE_COMPANYADDRESS, CrmConstants.ATTR_INVOICE_COMPANYNAME, CrmConstants.ATTR_INVOICE_INVOICENUMBER, CrmConstants.ATTR_INVOICE_INVOICEDATE, CrmConstants.ATTR_INVOICE_TOTALVALUE),
            //    EntityName = CrmConstants.ENTITY_INVOICE,
            //    LinkEntities = {
            //        new LinkEntity(CrmConstants.ENTITY_INVOICE, CrmConstants.ENTITY_ITEM, CrmConstants.ATTR_INVOICE_ID, CrmConstants.ATTR_ITEM_INVOICEID, JoinOperator.Inner)
            //        {
            //            Columns = new ColumnSet(CrmConstants.ATTR_ITEM_DESCRIPTION, CrmConstants.ATTR_ITEM_QUANTITY, CrmConstants.ATTR_ITEM_UNIT, CrmConstants.ATTR_ITEM_UNITPRICE, CrmConstants.ATTR_ITEM_TOTALPRICE)
            //        },
            //        new LinkEntity(CrmConstants.ENTITY_INVOICE, CrmConstants.ENTITY_PERFORMANCEMETRIC, CrmConstants.ATTR_INVOICE_ID, CrmConstants.ATTR_PERFORMANCEMETRIC_INVOICEID, JoinOperator.Inner)
            //        {
            //            Columns = new ColumnSet(CrmConstants.ATTR_PERFORMANCEMETRIC_BEGIN, CrmConstants.ATTR_PERFORMANCEMETRIC_END, CrmConstants.ATTR_PERFORMANCEMETRIC_TYPE, CrmConstants.ATTR_PERFORMANCEMETRIC_DURATION){
            //            },
            //            LinkEntities = {
            //                new LinkEntity(CrmConstants.ENTITY_PERFORMANCEMETRIC, CrmConstants.ENTITY_PERFORMANCELINE, CrmConstants.ATTR_PERFORMANCEMETRIC_ID, CrmConstants.ATTR_PERFORMANCELINE_PERFORMANCEMETRICID, JoinOperator.Inner)
            //                {
            //                    Columns = new ColumnSet(CrmConstants.ATTR_PERFORMANCELINE_FIELDNAME, CrmConstants.ATTR_PERFORMANCELINE_FIELDVALUE, CrmConstants.ATTR_PERFORMANCELINE_FIELDCONFIDENCE)
            //                }
            //            }

            //        },
            //    }
            //};

            //invoices = await _crm.RetrieveMultipleAsync(invoiceQuery);
            //Console.WriteLine();

            var invoiceQuery = new QueryExpression(CrmConstants.ENTITY_INVOICE);
            invoiceQuery.ColumnSet = new ColumnSet(CrmConstants.ATTR_INVOICE_COMPANYADDRESS,
                CrmConstants.ATTR_INVOICE_COMPANYNAME,
                CrmConstants.ATTR_INVOICE_INVOICENUMBER,
                CrmConstants.ATTR_INVOICE_INVOICEDATE,
                CrmConstants.ATTR_INVOICE_TOTALVALUE);

            invoices = await _crm.RetrieveMultipleAsync(invoiceQuery);
            Console.WriteLine();

            QueryExpression invoiceItemQuery = new QueryExpression(CrmConstants.ENTITY_ITEM);
            invoiceItemQuery.ColumnSet = new ColumnSet(CrmConstants.ATTR_ITEM_DESCRIPTION, 
                CrmConstants.ATTR_ITEM_QUANTITY, 
                CrmConstants.ATTR_ITEM_UNIT, 
                CrmConstants.ATTR_ITEM_UNITPRICE, 
                CrmConstants.ATTR_ITEM_TOTALPRICE,
                CrmConstants.ATTR_INVOICE_ID);
            invoiceItems = await _crm.RetrieveMultipleAsync(invoiceItemQuery);

            QueryExpression performanceQuery = new QueryExpression(CrmConstants.ENTITY_PERFORMANCEMETRIC);
            performanceQuery.ColumnSet = new ColumnSet(CrmConstants.ATTR_PERFORMANCEMETRIC_BEGIN, 
                CrmConstants.ATTR_PERFORMANCEMETRIC_END, 
                CrmConstants.ATTR_PERFORMANCEMETRIC_TYPE, 
                CrmConstants.ATTR_PERFORMANCEMETRIC_DURATION,
                CrmConstants.ATTR_PERFORMANCEMETRIC_INVOICEID);
            performanceMetrics = await _crm.RetrieveMultipleAsync(performanceQuery);

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

            foreach (var i in invoices.Entities)
            {
                Invoice inv = new()
                {
                    CompanyAddress = i[CrmConstants.ATTR_INVOICE_COMPANYADDRESS].ToString(),
                    CompanyName = i[CrmConstants.ATTR_INVOICE_COMPANYNAME].ToString(),
                    InvoiceDate = i["new_invoicedate"].ToString(),
                    InvoiceId = i["new_invoicenumber"].ToString(),
                    TotalValue = i["new_totalvalue"].ToString(),
                    Items = this.invoiceItems.Entities
                        .Where(en => (en[CrmConstants.ATTR_ITEM_INVOICEID] as EntityReference).Id == i.Id)
                        .Select(e => new Item()
                        {
                            Description = e["new_description"].ToString(),
                            Quantity = e["new_qantity"].ToString(),
                            TotalPrice = e["new_totalprice"].ToString(),
                            Unit = e["new_unit"].ToString(),
                            UnitPrice = e["new_unitprice"].ToString(),
                        }).ToList()
                };
                List<PerformanceMetric> pm = performanceMetrics.Entities
                    .Where(perf => (perf[CrmConstants.ATTR_PERFORMANCEMETRIC_INVOICEID] as EntityReference).Id == i.Id)
                    .Select(p => new PerformanceMetric()
                    {
                        Begin = p[CrmConstants.ATTR_PERFORMANCEMETRIC_BEGIN].ToString(),
                        Type = p[CrmConstants.ATTR_PERFORMANCEMETRIC_TYPE].ToString(),
                        End = p[CrmConstants.ATTR_PERFORMANCEMETRIC_END].ToString(),
                        Duration = p[CrmConstants.ATTR_PERFORMANCEMETRIC_DURATION].ToString(),
                        Lines = performanceMetricLines.Entities
                        .Where(pml => (pml[CrmConstants.ATTR_PERFORMANCELINE_PERFORMANCEMETRICID] as EntityReference).Id == p.Id)
                        .Select(e => new PerformanceMetricLine()
                        {
                            FieldConfidence = float.Parse(e[CrmConstants.ATTR_PERFORMANCELINE_FIELDCONFIDENCE].ToString()),
                            FieldName = e[CrmConstants.ATTR_PERFORMANCELINE_FIELDNAME].ToString(),
                            //FieldValue = e[CrmConstants.ATTR_PERFORMANCELINE_FIELDVALUE].ToString(),
                        }).ToList()

                    }).ToList();
                metricDtos.Add(new MetricDto(inv, pm));
            }

            return metricDtos;
        }
    }
}

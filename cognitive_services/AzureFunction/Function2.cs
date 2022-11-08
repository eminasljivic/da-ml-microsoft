using System;
using System.IO;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Azure.WebJobs;
using Microsoft.Azure.WebJobs.Extensions.Http;
using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Logging;
using System.Text.Json;
using Newtonsoft.Json;
using cognitive_services;
using Microsoft.PowerPlatform.Dataverse.Client;
using Microsoft.Xrm.Sdk;
using Core.DTO;
using JsonSerializer = System.Text.Json.JsonSerializer;
using System.Reflection;
using Microsoft.AspNetCore.Http.Features;
using System.Runtime.Serialization.Formatters;
using System.Runtime.Caching.Hosting;

namespace AzureFunction
{
    public class Function2
    {
        private readonly IOrganizationServiceAsync2 _crm;
        public Function2(IOrganizationServiceAsync2 crm)
        {
            _crm = crm;
        }
        [FunctionName("SaveMetrics")]
        public async Task<IActionResult> Run(
            [HttpTrigger(AuthorizationLevel.Anonymous, "get", "post", Route = null)] HttpRequest req,
            ILogger log)
        {
     
            string json = await req.ReadAsStringAsync();
            InvoiceDto i = JsonConvert.DeserializeObject<InvoiceDto>(json);

            var id = await AddEntityToCRM(i);
            await SaveMetricsToCRM(i, id);
            

            return new OkObjectResult(i);
        }

        private async Task<Guid> AddEntityToCRM(InvoiceDto i)
        {
            var invoice = new Entity("new_invoice")
            {
                ["new_bezeichnung"] = i.Name,
                ["new_companyname"] = i.Invoice.CompanyName,
                ["new_companyaddress"] = i.Invoice.CompanyAddress,
                ["new_invoicenumber"] = i.Invoice.InvoiceId,
                ["new_invoicedate"] = i.Invoice.InvoiceDate,
                ["new_totalvalue"] = i.Invoice.TotalValue,
            };
            var id = await _crm.CreateAsync(invoice);

            var count = 1;
            foreach (Item it in i.Invoice.Items)
            {
                var item = new Entity("new_item")
                {
                    ["new_name"] = $"{i.Name} Item {count}",
                    ["new_description"] = it.Description,
                    ["new_unit"] = it.Unit,
                    ["new_qantity"] = it.Quantity,
                    ["new_unitprice"] = it.UnitPrice,
                    ["new_totalprice"] = it.TotalPrice,
                    ["new_invoiceid"] = new EntityReference("new_invoice", id)
                };
                count++;
                await _crm.CreateAsync(item);
            }

            return id;
        }

        private async Task SaveMetricsToCRM(InvoiceDto i, Guid invoiceId)
        {
            var measurement = new Entity("new_performancemetric")
            {
                ["new_name"] = $"{i.Name} PerformanceMetric",
                ["new_begin"] = i.Begin,
                ["new_end"] = i.End,
                ["new_type"] = i.Type,
                ["new_duration"] = i.Duration,
                ["new_invoiceId"] = new EntityReference("new_invoice", invoiceId)
            };

            var id = await _crm.CreateAsync(measurement);
            var count = 1;
            foreach (PropertyInfo item in i.Invoice.GetType().GetProperties(BindingFlags.Public | BindingFlags.Instance))
            {
                if (item.Name != "Id" && item.Name != "Items" && item.Name != "Name")
                {
                    var line = new Entity("new_performanceline")
                    {
                        ["new_name"] = $"{measurement["new_name"]} Line {count}",
                        ["new_fieldname"] = item.Name,
                        ["new_fieldconfidence"] = i.Invoice.Confidences[item.Name],
                        ["new_fieldvalue"] = item.GetValue(i.Invoice).ToString(),
                        ["new_performancemetricid"] = new EntityReference("new_performancemetric", id)
                    };
                    count++;
                    await _crm.CreateAsync(line);
                }
            }

            if (i.Invoice.Items != null)
            {
                count = 0;
                foreach (var item in i.Invoice.Items)
                {
                    foreach (PropertyInfo iitem in item.GetType().GetProperties(BindingFlags.Public | BindingFlags.Instance))
                    {
                        var line = new Entity("new_performanceline")
                        {
                            ["new_name"] = $"{measurement["new_name"]} Line {count+1}",
                            ["new_fieldname"] = iitem.Name,
                            ["new_fieldconfidence"] = i.Invoice.Items[count].Confidences[iitem.Name],
                            ["new_fieldvalue"] = iitem.GetValue(item) != null? iitem.GetValue(item).ToString() : "",
                            ["new_performancemetricid"] = new EntityReference("new_performancemetric", id)
                        };

                        await _crm.CreateAsync(line);
                    }
                    count++;
                }

            }
            
        }
    }
}

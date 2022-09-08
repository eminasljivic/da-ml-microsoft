using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Azure.WebJobs;
using Microsoft.Azure.WebJobs.Extensions.Http;
using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Logging;
using cognitive_services;
using Microsoft.PowerPlatform.Dataverse.Client;
using Core.DTO;
using Microsoft.Xrm.Sdk;
using System.IO;
using System;
using Core;

namespace AzureFunction
{
    public class Function1
    {
        private InvoiceRecognizer _invoiceRecognizer;
        private readonly IOrganizationServiceAsync2 _crm;
        public Function1(InvoiceRecognizer invoiceRecognizer, IOrganizationServiceAsync2 crm)
        {
            _invoiceRecognizer = invoiceRecognizer;
            _crm = crm;
        }

        [FunctionName("getInvoiceDetails")]
        public async Task<IActionResult> Run(
            [HttpTrigger(AuthorizationLevel.Function, "get", "post", Route = null)] HttpRequest req,
            ILogger log)
        {
            var body = req.Body;
            Invoice i = await _invoiceRecognizer.AnalyzeDocument(body);
            
            return new OkObjectResult(i);
        }
    }
}

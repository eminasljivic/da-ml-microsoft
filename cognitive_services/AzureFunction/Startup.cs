using AzureFunction;
using cognitive_services;
using Microsoft.Azure.Functions.Extensions.DependencyInjection;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.PowerPlatform.Dataverse.Client;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

[assembly: FunctionsStartup(typeof(Startup))]
namespace AzureFunction
{
    public class Startup : FunctionsStartup
    {
        public override void Configure(IFunctionsHostBuilder builder)
        {
            builder.Services.AddSingleton<InvoiceRecognizer>();

            string conn = builder.GetContext().Configuration.GetConnectionString("DataverseConnectionString");

            builder.Services
                .AddScoped<IOrganizationServiceAsync2>(_ =>
                    new ServiceClient(conn));
        }
    }
}

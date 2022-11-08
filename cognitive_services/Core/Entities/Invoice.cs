#if NET
using Azure.AI.FormRecognizer.DocumentAnalysis;
using cognitive_services;
using Microsoft.AspNetCore.Authentication.OAuth.Claims;
using System;
using System.Collections.Generic;
using System.Drawing;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Core
{
    public class Invoice
    {
        public Guid Id { get; set; }
        public string? Name { get; set; }
        public string? CompanyAddress { get; set; }
        public string? CompanyName { get; set; }
        public string? InvoiceId { get; set; }
        public string? InvoiceDate { get; set; }
        public string? TotalValue { get; set; }
        public List<Item> Items { get; set; } = new List<Item>();
        public Dictionary<string, float?> Confidences;

        public Invoice()
        {
            Confidences = new Dictionary<string, float?>();
        }
    }
}
#endif
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

namespace Core.DTO
{
    public class InvoiceDto
    {
        public string? Name { get; set; }
        public string? Begin { get; set; }
        public string? End { get; set; }
        public string? Type { get; set; }
        public string? Duration { get; set; }
        public Invoice? Invoice { get; set; }
        public InvoiceDto()
        {
        }
    }
}
#endif
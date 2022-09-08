#if NET
using Azure;
using Azure.AI.FormRecognizer.DocumentAnalysis;
using Core;
using Core.DTO;
using Microsoft.Extensions.Azure;
using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Reflection.Metadata;
using System.Text.Encodings.Web;
using System.Threading.Tasks;

namespace cognitive_services
{
    public class InvoiceRecognizer
    {
        private static readonly string endpoint = "";
        private static readonly string key = "";
        private static AzureKeyCredential credential = new AzureKeyCredential(key);
        private DocumentAnalysisClient client = new DocumentAnalysisClient(new Uri(endpoint), credential);
        
        public InvoiceRecognizer()
        {}

        public async Task<Invoice> AnalyzeDocument(Stream file)
        {
            AnalyzeDocumentOperation operation = await client.StartAnalyzeDocumentAsync("2b0faf62-b2fa-49af-bd95-ccf1b0f91a23", file);

            await operation.WaitForCompletionAsync();

            AnalyzeResult result = operation.Value;

            
            Invoice invoice = new Invoice();
            try
            {
                for (int i = 0; i < result.Documents.Count; i++)
                {
                    Console.WriteLine($"Document {i}:");

                    AnalyzedDocument document = result.Documents[i];

                    if (document.Fields.TryGetValue("CompanyName", out DocumentField? companyNameField))
                    {
                        if (companyNameField.ValueType == DocumentFieldType.String)
                        {
                            invoice.CompanyName = companyNameField.AsString();
                            invoice.Confidences.Add("CompanyName", companyNameField.Confidence);
                            //dto.boundings.Add("CompanyName", companyNameField.BoundingRegions.Select(br => br.BoundingPolygon).ToArray());
                        }
                    }

                    if (document.Fields.TryGetValue("CompanyAddress", out DocumentField? companyAddressField))
                    {
                        if (companyAddressField.ValueType == DocumentFieldType.String)
                        {
                            invoice.CompanyAddress = companyAddressField.AsString();
                            //dto.boundings.Add("CompanyAddress", companyAddressField.BoundingRegions.Select(br => br.BoundingPolygon).ToArray());
                            invoice.Confidences.Add("CompanyAddress", companyAddressField.Confidence);
                        }
                    }

                    if (document.Fields.TryGetValue("InvoiceId", out DocumentField? invoiceIdField))
                    {
                        if (invoiceIdField.ValueType == DocumentFieldType.String)
                        {
                            invoice.InvoiceId = invoiceIdField.AsString();
                            invoice.Confidences.Add("InvoiceId", invoiceIdField.Confidence);
                            //dto.boundings.Add("InvoiceId", invoiceIdField.BoundingRegions.Select(br => br.BoundingPolygon).ToArray());
                        }
                    }
                    if (document.Fields.TryGetValue("InvoiceDate", out DocumentField? invoiceDateField))
                    {
                        if (invoiceDateField.ValueType == DocumentFieldType.String)
                        {
                            invoice.InvoiceDate = invoiceDateField.AsString();
                            invoice.Confidences.Add("InvoiceDate", companyNameField.Confidence);
                            //dto.boundings.Add("InvoiceDate", invoiceDateField.BoundingRegions.Select(br => br.BoundingPolygon).ToArray());
                        }
                    }

                    if (document.Fields.TryGetValue("TotalValue", out DocumentField? totalValueField))
                    {
                        if (totalValueField.ValueType == DocumentFieldType.String)
                        {
                            invoice.TotalValue = totalValueField.AsString();
                            invoice.Confidences.Add("TotalValue", totalValueField.Confidence);
                            //dto.boundings.Add("TotalValue", totalValueField.BoundingRegions.Select(br => br.BoundingPolygon).ToArray());
                        }
                    }

                    if (document.Fields.TryGetValue("Items", out DocumentField? itemsField))
                    {
                        if (itemsField.ValueType == DocumentFieldType.List)
                        {
                            foreach (DocumentField itemField in itemsField.AsList())
                            {
                                Console.WriteLine("Item:");
                                Item item = new Item();
                                if (itemField.ValueType == DocumentFieldType.Dictionary)
                                {
                                    IReadOnlyDictionary<string, DocumentField> itemFields = itemField.AsDictionary();

                                    if (itemFields.TryGetValue("Description", out DocumentField? itemDescriptionField))
                                    {
                                        if (itemDescriptionField.ValueType == DocumentFieldType.String)
                                        {
                                            item.Description = itemDescriptionField.AsString();
                                            item.Confidences.Add("Description", itemDescriptionField.Confidence);
                                            //dto.boundings.Add("ItemDescription", itemDescriptionField.BoundingRegions.Select(br => br.BoundingPolygon).ToArray());
                                        }
                                    }

                                    if (itemFields.TryGetValue("Quantity", out DocumentField? QuantityField))
                                    {
                                        if (QuantityField.ValueType == DocumentFieldType.String)
                                        {
                                            item.Quantity = QuantityField.AsString();
                                            item.Confidences.Add("Quantity", QuantityField.Confidence);
                                            //dto.boundings.Add("ItemQuantity", QuantityField.BoundingRegions.Select(br => br.BoundingPolygon).ToArray());
                                        }
                                    }

                                    if (itemFields.TryGetValue("Unit", out DocumentField? UnitField))
                                    {
                                        if (UnitField.ValueType == DocumentFieldType.String)
                                        {
                                            item.Unit = UnitField.AsString();
                                            item.Confidences.Add("Unit", UnitField.Confidence);
                                            //dto.boundings.Add("ItemUnit", UnitField.BoundingRegions.Select(br => br.BoundingPolygon).ToArray());
                                        }
                                    }

                                    if (itemFields.TryGetValue("UnitPrice", out DocumentField? UnitPriceField))
                                    {
                                        if (UnitPriceField.ValueType == DocumentFieldType.String)
                                        {
                                            item.UnitPrice = UnitPriceField.AsString();
                                            item.Confidences.Add("UnitPrice", UnitPriceField.Confidence);
                                            //dto.boundings.Add("ItemUnitPrice", UnitPriceField.BoundingRegions.Select(br => br.BoundingPolygon).ToArray());
                                        }
                                    }

                                    if (itemFields.TryGetValue("TotalPrice", out DocumentField? TotalPriceField))
                                    {
                                        if (TotalPriceField.ValueType == DocumentFieldType.String)
                                        {
                                            item.TotalPrice = TotalPriceField.AsString();
                                            item.Confidences.Add("TotalPrice", TotalPriceField.Confidence);
                                            //dto.boundings.Add("ItemTotalPrice", TotalPriceField.BoundingRegions.Select(br => br.BoundingPolygon).ToArray());
                                        }
                                    }
                                }
                                invoice.Items.Add(item);
                            }
                        }
                    }
                }
            }
            catch (Exception e)
            {
                Console.WriteLine(e.StackTrace); 
            }
            return invoice;
        }

    }
}
#endif
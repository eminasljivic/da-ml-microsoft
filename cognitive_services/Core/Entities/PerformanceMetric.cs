using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Text.Json.Serialization;
using System.Threading.Tasks;

namespace Core.Entities
{
    public class PerformanceMetric
    {
        public string? OverAllConfidence { get; set; }
        public string? Begin { get; set; }
        public string? End { get; set; }
        public string? Duration { get; set; }
        public string? Type { get; set; }
        [JsonIgnore]
        public Guid? InvoiceId { get; set; }
        public List<PerformanceMetricLine>? Lines { get; set; } = new List<PerformanceMetricLine>();
    }
}

using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Core.Entities
{
    public class PerformanceMetric
    {
        public string? Begin { get; set; }
        public string? End { get; set; }
        public string? Duration { get; set; }
        public string? Type { get; set; }
        public List<PerformanceMetricLine>? Lines { get; set; } = new List<PerformanceMetricLine>();
    }
}

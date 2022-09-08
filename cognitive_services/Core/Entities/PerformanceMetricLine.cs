using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Core.Entities
{
    public class PerformanceMetricLine
    {
        public string? FieldName { get; set; }
        public string? FieldValue { get; set; }
        public float? FieldConfidence { get; set; }
    }
}

using Core.Entities;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Core.DTO
{
    public class MetricDto
    {
        public Invoice Invoice { get; set; }
        public PerformanceMetric PerformanceMetric { get; set; }
        public MetricDto(Invoice invoice, PerformanceMetric performanceMetrics)
        {
            Invoice = invoice;
            PerformanceMetric = performanceMetrics;
        }
    }
}

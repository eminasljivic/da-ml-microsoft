#if NET
namespace cognitive_services
{
    public class Item
    {
        public Dictionary<string, float?> Confidences = new Dictionary<string, float?>();
        public string? Description { get; set; }
        public string? Quantity { get; set; }
        public string? Unit { get; set; }
        public string? UnitPrice { get; set; }
        public string? TotalPrice { get; set; }
    }
}
#endif
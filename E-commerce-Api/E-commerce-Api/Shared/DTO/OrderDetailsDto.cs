using System;

namespace Shared.DTO
{
    public record OrderDetailsDto
    {
        public int ProductId { get; set; }
        public int UnitPrice { get; set; }
        public int Amount { get; set; }
        public ProductDto Product { get; set; }
    }
}

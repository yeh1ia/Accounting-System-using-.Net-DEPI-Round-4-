using System.ComponentModel.DataAnnotations;

namespace Accounting.Data.Domain.Accounting;
public class Currency : AuditableEntity
{
    [Key]
    public string Name { get; set; } = null!;
    public decimal Rate { get; set; }
    public int DecimalPlaces { get; set; } = 2;
    public string? Symbol { get; set; }
    public bool SymbolFirst { get; set; } = true;
    public string? DecimalMark { get; set; } = ".";
    public string? ThousandsSeparator { get; set; } = ",";
    public bool Enabled { get; set; } = true;

    public ICollection<Account> Accounts { get; set; } = [];
    public ICollection<JournalEntry> JournalEntries { get; set; } = [];
}

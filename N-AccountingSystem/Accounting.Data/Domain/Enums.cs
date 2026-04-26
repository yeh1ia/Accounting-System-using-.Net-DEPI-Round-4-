namespace Accounting.Data.Domain;

public enum AccountType
{
    Asset,
    Liability,  
    Equity,    
    Income,    
    Expense    
}

public enum CategoryType
{
    Income,
    Expense
}

public enum ContactType
{
    Customer,   
    Vendor      
}

public enum JournalEntryStatus
{
    Draft,
    Posted
}

public enum DocumentStatus
{
    Draft,
    Sent,
    Partial,
    Paid,
    Cancelled
}

public enum DiscountType
{
    Percent,
    Fixed   
}

package com.banking;

public class Transaction {
    private int id;
    private String accountId;
    private String type;
    private double amount;
    private double balanceAfter;
    private String description;
    private String reference;
    private String timestamp;

    public Transaction(int id, String accountId, String type, double amount,
                       double balanceAfter, String description, String reference, String timestamp) {
        this.id = id;
        this.accountId = accountId;
        this.type = type;
        this.amount = amount;
        this.balanceAfter = balanceAfter;
        this.description = description;
        this.reference = reference;
        this.timestamp = timestamp;
    }

    public int getId() { return id; }
    public void setId(int id) { this.id = id; }
    public String getAccountId() { return accountId; }
    public void setAccountId(String accountId) { this.accountId = accountId; }
    public String getType() { return type; }
    public void setType(String type) { this.type = type; }
    public double getAmount() { return amount; }
    public void setAmount(double amount) { this.amount = amount; }
    public double getBalanceAfter() { return balanceAfter; }
    public void setBalanceAfter(double balanceAfter) { this.balanceAfter = balanceAfter; }
    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }
    public String getReference() { return reference; }
    public void setReference(String reference) { this.reference = reference; }
    public String getTimestamp() { return timestamp; }
    public void setTimestamp(String timestamp) { this.timestamp = timestamp; }
}

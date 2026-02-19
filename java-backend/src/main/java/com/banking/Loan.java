package com.banking;

public class Loan {
    private String id;
    private String accountId;
    private double principal;
    private double rate;
    private int term;
    private double remaining;
    private double monthly;
    private String status;
    private String created;

    public Loan(String id, String accountId, double principal, double rate, int term,
                double remaining, double monthly, String status, String created) {
        this.id = id;
        this.accountId = accountId;
        this.principal = principal;
        this.rate = rate;
        this.term = term;
        this.remaining = remaining;
        this.monthly = monthly;
        this.status = status;
        this.created = created;
    }

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }
    public String getAccountId() { return accountId; }
    public void setAccountId(String accountId) { this.accountId = accountId; }
    public double getPrincipal() { return principal; }
    public void setPrincipal(double principal) { this.principal = principal; }
    public double getRate() { return rate; }
    public void setRate(double rate) { this.rate = rate; }
    public int getTerm() { return term; }
    public void setTerm(int term) { this.term = term; }
    public double getRemaining() { return remaining; }
    public void setRemaining(double remaining) { this.remaining = remaining; }
    public double getMonthly() { return monthly; }
    public void setMonthly(double monthly) { this.monthly = monthly; }
    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
    public String getCreated() { return created; }
    public void setCreated(String created) { this.created = created; }
}

package com.banking;

public class Account {
    private String id;
    private String name;
    private double balance;
    private String type;
    private int active;
    private String created;

    public Account(String id, String name, double balance, String type, int active, String created) {
        this.id = id;
        this.name = name;
        this.balance = balance;
        this.type = type;
        this.active = active;
        this.created = created;
    }

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }
    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
    public double getBalance() { return balance; }
    public void setBalance(double balance) { this.balance = balance; }
    public String getType() { return type; }
    public void setType(String type) { this.type = type; }
    public int getActive() { return active; }
    public void setActive(int active) { this.active = active; }
    public String getCreated() { return created; }
    public void setCreated(String created) { this.created = created; }
}

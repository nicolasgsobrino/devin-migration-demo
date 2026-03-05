package com.banking;

import java.io.BufferedReader;
import java.io.FileReader;
import java.io.IOException;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.List;

public class LegacyBackend {

    private final List<Account> accounts = new ArrayList<>();
    private final List<Loan> loans = new ArrayList<>();
    private final List<Transaction> transactions = new ArrayList<>();
    private String currentDateTime;

    public static void main(String[] args) {
        LegacyBackend backend = new LegacyBackend();
        String inputPath = (args.length > 0 && !args[0].trim().isEmpty()) ? args[0] : "input.dat";
        backend.run(inputPath);
    }

    public void run(String inputPath) {
        getCurrentTimestamp();
        try (BufferedReader reader = new BufferedReader(new FileReader(inputPath))) {
            String line;
            while ((line = reader.readLine()) != null) {
                if (!line.trim().isEmpty()) {
                    processLine(line);
                }
            }
        } catch (IOException e) {
            System.out.println("{ \"status\": \"ERROR\", \"message\": \"Cannot open input file\" }");
        }
    }

    private void getCurrentTimestamp() {
        LocalDateTime now = LocalDateTime.now();
        DateTimeFormatter formatter = DateTimeFormatter.ofPattern("yyyy-MM-dd'T'HH:mm:ss'Z'");
        currentDateTime = now.format(formatter);
    }

    private void processLine(String line) {
        String[] parts = line.split("\\|", -1);
        String operation = parts.length > 0 ? parts[0].trim() : "";
        String field1 = parts.length > 1 ? parts[1].trim() : "";
        String field2 = parts.length > 2 ? parts[2].trim() : "";
        String field3 = parts.length > 3 ? parts[3].trim() : "";
        String field4 = parts.length > 4 ? parts[4].trim() : "";
        String field5 = parts.length > 5 ? parts[5].trim() : "";

        switch (operation) {
            case "CREATE_ACCOUNT":
                opCreateAccount(field1, field2, field3, field4);
                break;
            case "DELETE_ACCOUNT":
                opDeleteAccount(field1);
                break;
            case "UPDATE_ACCOUNT":
                opUpdateAccount(field1, field2);
                break;
            case "CHECK_ACCOUNT":
                opCheckAccount(field1);
                break;
            case "LIST_ACCOUNTS":
                opListAccounts();
                break;
            case "DEPOSIT":
                opDeposit(field1, field2);
                break;
            case "WITHDRAW":
                opWithdraw(field1, field2);
                break;
            case "TRANSFER":
                opTransfer(field1, field2, field3);
                break;
            case "CREATE_LOAN":
                opCreateLoan(field1, field2, field3, field4, field5);
                break;
            case "PAY_LOAN":
                opPayLoan(field1, field2, field3);
                break;
            case "CHECK_LOAN":
                opCheckLoan(field1);
                break;
            case "LIST_LOANS":
                opListLoans(field1);
                break;
            case "CALCULATE_SCORE":
                opCalculateScore(field1, field2, field3, field4);
                break;
            case "TRANSACTION_HISTORY":
                opTransactionHistory(field1);
                break;
            case "DASHBOARD":
                opDashboard();
                break;
            default:
                System.out.println("{ \"status\": \"ERROR\", \"message\": \"Unknown operation: " + operation + "\" }");
                break;
        }
    }

    private int findAccount(String accountId) {
        for (int i = 0; i < accounts.size(); i++) {
            if (accounts.get(i).getId().equals(accountId) && accounts.get(i).getActive() == 1) {
                return i;
            }
        }
        return -1;
    }

    private int findAccountAny(String accountId) {
        for (int i = 0; i < accounts.size(); i++) {
            if (accounts.get(i).getId().equals(accountId)) {
                return i;
            }
        }
        return -1;
    }

    private void recordTransaction(String accountId, String type, double amount,
                                   double balanceAfter, String description, String reference) {
        int txnId = transactions.size() + 1;
        transactions.add(new Transaction(txnId, accountId, type, amount, balanceAfter,
                description, reference, currentDateTime));
    }

    private String formatBalance(double value) {
        if (value < 0) {
            return String.format("-%.2f", Math.abs(value));
        }
        return String.format("%.2f", value);
    }

    private String formatCount(int count, int width) {
        return String.format("%0" + width + "d", count);
    }

    private void opCreateAccount(String accountId, String accountName, String accountType, String balanceStr) {
        if (accountId.isEmpty()) {
            System.out.println("{ \"status\": \"ERROR\", \"message\": \"Account ID is required\" }");
            return;
        }

        int existIdx = findAccountAny(accountId);
        if (existIdx >= 0) {
            System.out.println("{ \"status\": \"ERROR\", \"message\": \"Account already exists: " + accountId + "\" }");
            return;
        }

        double balance = 0.0;
        if (!balanceStr.isEmpty()) {
            balance = Double.parseDouble(balanceStr);
        }

        String type = accountType.isEmpty() ? "CHECKING" : accountType;

        Account acct = new Account(accountId, accountName, balance, type, 1, currentDateTime);
        accounts.add(acct);

        if (balance > 0) {
            recordTransaction(accountId, "INITIAL_DEPOSIT", balance, balance,
                    "Account opening deposit", "");
        }

        System.out.println("{ \"status\": \"OK\", \"message\": \"Account created\", \"account_id\": \""
                + accountId + "\", \"name\": \"" + accountName + "\", \"type\": \"" + type
                + "\", \"balance\": " + formatBalance(balance) + " }");
    }

    private void opDeleteAccount(String accountId) {
        if (accountId.isEmpty()) {
            System.out.println("{ \"status\": \"ERROR\", \"message\": \"Account ID is required\" }");
            return;
        }

        int idx = findAccount(accountId);
        if (idx < 0) {
            System.out.println("{ \"status\": \"ERROR\", \"message\": \"Account not found: " + accountId + "\" }");
            return;
        }

        accounts.get(idx).setActive(0);
        recordTransaction(accountId, "ACCOUNT_CLOSED", 0.0, 0.0, "Account closed", "");

        System.out.println("{ \"status\": \"OK\", \"message\": \"Account deleted: " + accountId + "\" }");
    }

    private void opUpdateAccount(String accountId, String newName) {
        if (accountId.isEmpty()) {
            System.out.println("{ \"status\": \"ERROR\", \"message\": \"Account ID is required\" }");
            return;
        }
        if (newName.isEmpty()) {
            System.out.println("{ \"status\": \"ERROR\", \"message\": \"New name is required\" }");
            return;
        }

        int idx = findAccount(accountId);
        if (idx < 0) {
            System.out.println("{ \"status\": \"ERROR\", \"message\": \"Account not found: " + accountId + "\" }");
            return;
        }

        accounts.get(idx).setName(newName);
        System.out.println("{ \"status\": \"OK\", \"message\": \"Account updated\", \"account_id\": \""
                + accountId + "\", \"name\": \"" + newName + "\" }");
    }

    private void opCheckAccount(String accountId) {
        if (accountId.isEmpty()) {
            System.out.println("{ \"status\": \"ERROR\", \"message\": \"Account ID is required\" }");
            return;
        }

        int idx = findAccount(accountId);
        if (idx >= 0) {
            Account a = accounts.get(idx);
            System.out.println("{ \"status\": \"OK\", \"message\": \"Account found\", \"account_id\": \""
                    + accountId + "\", \"name\": \"" + a.getName() + "\", \"type\": \"" + a.getType()
                    + "\", \"balance\": " + formatBalance(a.getBalance())
                    + ", \"active\": " + a.getActive()
                    + ", \"created\": \"" + a.getCreated() + "\" }");
        } else {
            System.out.println("{ \"status\": \"NOT_FOUND\", \"message\": \"Account not found: " + accountId + "\" }");
        }
    }

    private void opListAccounts() {
        int listCount = 0;
        boolean firstItem = true;
        System.out.println("{ \"status\": \"OK\", \"accounts\": [");
        for (Account a : accounts) {
            if (a.getActive() == 1) {
                listCount++;
                if (firstItem) {
                    firstItem = false;
                    System.out.println("{ \"account_id\": \"" + a.getId()
                            + "\", \"name\": \"" + a.getName()
                            + "\", \"type\": \"" + a.getType()
                            + "\", \"balance\": " + formatBalance(a.getBalance()) + " }");
                } else {
                    System.out.println(", { \"account_id\": \"" + a.getId()
                            + "\", \"name\": \"" + a.getName()
                            + "\", \"type\": \"" + a.getType()
                            + "\", \"balance\": " + formatBalance(a.getBalance()) + " }");
                }
            }
        }
        System.out.println("], \"count\": " + formatCount(listCount, 3) + " }");
    }

    private void opDeposit(String accountId, String amountStr) {
        if (accountId.isEmpty()) {
            System.out.println("{ \"status\": \"ERROR\", \"message\": \"Account ID is required\" }");
            return;
        }
        if (amountStr.isEmpty()) {
            System.out.println("{ \"status\": \"ERROR\", \"message\": \"Amount is required\" }");
            return;
        }

        double amount = Double.parseDouble(amountStr);
        if (amount <= 0) {
            System.out.println("{ \"status\": \"ERROR\", \"message\": \"Amount must be positive\" }");
            return;
        }

        int idx = findAccount(accountId);
        if (idx < 0) {
            System.out.println("{ \"status\": \"ERROR\", \"message\": \"Account not found: " + accountId + "\" }");
            return;
        }

        Account a = accounts.get(idx);
        a.setBalance(a.getBalance() + amount);
        recordTransaction(accountId, "DEPOSIT", amount, a.getBalance(), "Cash deposit", "");

        System.out.println("{ \"status\": \"OK\", \"message\": \"Deposit successful\", \"account_id\": \""
                + accountId + "\", \"deposited\": " + formatBalance(amount)
                + ", \"new_balance\": " + formatBalance(a.getBalance()) + " }");
    }

    private void opWithdraw(String accountId, String amountStr) {
        if (accountId.isEmpty()) {
            System.out.println("{ \"status\": \"ERROR\", \"message\": \"Account ID is required\" }");
            return;
        }
        if (amountStr.isEmpty()) {
            System.out.println("{ \"status\": \"ERROR\", \"message\": \"Amount is required\" }");
            return;
        }

        double amount = Double.parseDouble(amountStr);
        if (amount <= 0) {
            System.out.println("{ \"status\": \"ERROR\", \"message\": \"Amount must be positive\" }");
            return;
        }

        int idx = findAccount(accountId);
        if (idx < 0) {
            System.out.println("{ \"status\": \"ERROR\", \"message\": \"Account not found: " + accountId + "\" }");
            return;
        }

        Account a = accounts.get(idx);
        if (a.getBalance() < amount) {
            System.out.println("{ \"status\": \"ERROR\", \"message\": \"Insufficient funds\" }");
            return;
        }

        a.setBalance(a.getBalance() - amount);
        recordTransaction(accountId, "WITHDRAWAL", amount, a.getBalance(), "Cash withdrawal", "");

        System.out.println("{ \"status\": \"OK\", \"message\": \"Withdrawal successful\", \"account_id\": \""
                + accountId + "\", \"withdrawn\": " + formatBalance(amount)
                + ", \"new_balance\": " + formatBalance(a.getBalance()) + " }");
    }

    private void opTransfer(String fromAccount, String toAccount, String amountStr) {
        if (fromAccount.isEmpty() || toAccount.isEmpty()) {
            System.out.println("{ \"status\": \"ERROR\", \"message\": \"Both account IDs required\" }");
            return;
        }
        if (amountStr.isEmpty()) {
            System.out.println("{ \"status\": \"ERROR\", \"message\": \"Amount is required\" }");
            return;
        }

        double amount = Double.parseDouble(amountStr);
        if (amount <= 0) {
            System.out.println("{ \"status\": \"ERROR\", \"message\": \"Amount must be positive\" }");
            return;
        }
        if (fromAccount.equals(toAccount)) {
            System.out.println("{ \"status\": \"ERROR\", \"message\": \"Cannot transfer to same account\" }");
            return;
        }

        int fromIdx = findAccount(fromAccount);
        if (fromIdx < 0) {
            System.out.println("{ \"status\": \"ERROR\", \"message\": \"Source not found: " + fromAccount + "\" }");
            return;
        }

        Account fromAcct = accounts.get(fromIdx);
        if (fromAcct.getBalance() < amount) {
            System.out.println("{ \"status\": \"ERROR\", \"message\": \"Insufficient funds\" }");
            return;
        }

        int toIdx = findAccount(toAccount);
        if (toIdx < 0) {
            System.out.println("{ \"status\": \"ERROR\", \"message\": \"Dest not found: " + toAccount + "\" }");
            return;
        }

        Account toAcct = accounts.get(toIdx);
        fromAcct.setBalance(fromAcct.getBalance() - amount);
        toAcct.setBalance(toAcct.getBalance() + amount);

        recordTransaction(fromAccount, "TRANSFER_OUT", amount, fromAcct.getBalance(),
                "Transfer to " + toAccount, toAccount);
        recordTransaction(toAccount, "TRANSFER_IN", amount, toAcct.getBalance(),
                "Transfer from " + fromAccount, fromAccount);

        System.out.println("{ \"status\": \"OK\", \"message\": \"Transfer successful\", \"from\": \""
                + fromAccount + "\", \"to\": \"" + toAccount
                + "\", \"amount\": " + formatBalance(amount) + " }");
    }

    private void opCreateLoan(String accountId, String loanId, String principalStr,
                              String rateStr, String termStr) {
        if (accountId.isEmpty()) {
            System.out.println("{ \"status\": \"ERROR\", \"message\": \"Account ID is required\" }");
            return;
        }
        if (loanId.isEmpty()) {
            System.out.println("{ \"status\": \"ERROR\", \"message\": \"Loan ID is required\" }");
            return;
        }
        if (principalStr.isEmpty()) {
            System.out.println("{ \"status\": \"ERROR\", \"message\": \"Principal is required\" }");
            return;
        }

        int acctIdx = findAccount(accountId);
        if (acctIdx < 0) {
            System.out.println("{ \"status\": \"ERROR\", \"message\": \"Account not found: " + accountId + "\" }");
            return;
        }

        for (Loan l : loans) {
            if (l.getId().equals(loanId)) {
                System.out.println("{ \"status\": \"ERROR\", \"message\": \"Loan exists: " + loanId + "\" }");
                return;
            }
        }

        double principal = Double.parseDouble(principalStr);
        double rate = rateStr.isEmpty() ? 5.00 : Double.parseDouble(rateStr);
        int term = termStr.isEmpty() ? 12 : (int) Double.parseDouble(termStr);

        double monthlyRate = rate / 100.0 / 12.0;
        double monthly;
        if (monthlyRate > 0) {
            monthly = principal * monthlyRate / (1.0 - (1.0 / Math.pow(1.0 + monthlyRate, term)));
        } else {
            monthly = principal / term;
        }
        monthly = Math.floor(monthly * 100.0) / 100.0;

        Loan loan = new Loan(loanId, accountId, principal, rate, term, principal, monthly, "ACTIVE", currentDateTime);
        loans.add(loan);

        Account acct = accounts.get(acctIdx);
        acct.setBalance(acct.getBalance() + principal);

        recordTransaction(accountId, "LOAN_DISBURSEMENT", principal, acct.getBalance(),
                "Loan disbursement: " + loanId, loanId);

        String rateFormatted = String.format("%05.2f", rate);
        String termFormatted = String.format("%03d", term);
        System.out.println("{ \"status\": \"OK\", \"message\": \"Loan created\", \"loan_id\": \""
                + loanId + "\", \"account_id\": \"" + accountId
                + "\", \"principal\": " + formatBalance(principal)
                + ", \"rate\": " + rateFormatted
                + ", \"term_months\": " + termFormatted
                + ", \"monthly_payment\": " + formatBalance(monthly) + " }");
    }

    private void opPayLoan(String accountId, String loanId, String amountStr) {
        if (accountId.isEmpty()) {
            System.out.println("{ \"status\": \"ERROR\", \"message\": \"Account ID is required\" }");
            return;
        }
        if (loanId.isEmpty()) {
            System.out.println("{ \"status\": \"ERROR\", \"message\": \"Loan ID is required\" }");
            return;
        }

        int acctIdx = findAccount(accountId);
        if (acctIdx < 0) {
            System.out.println("{ \"status\": \"ERROR\", \"message\": \"Account not found: " + accountId + "\" }");
            return;
        }

        int loanIdx = -1;
        for (int i = 0; i < loans.size(); i++) {
            if (loans.get(i).getId().equals(loanId)) {
                loanIdx = i;
            }
        }

        if (loanIdx < 0) {
            System.out.println("{ \"status\": \"ERROR\", \"message\": \"Loan not found: " + loanId + "\" }");
            return;
        }

        Loan loan = loans.get(loanIdx);
        if (loan.getStatus().equals("PAID")) {
            System.out.println("{ \"status\": \"ERROR\", \"message\": \"Loan already fully paid\" }");
            return;
        }

        double amount;
        if (!amountStr.isEmpty()) {
            amount = Double.parseDouble(amountStr);
        } else {
            amount = loan.getMonthly();
        }

        if (amount > loan.getRemaining()) {
            amount = loan.getRemaining();
        }

        Account acct = accounts.get(acctIdx);
        if (acct.getBalance() < amount) {
            System.out.println("{ \"status\": \"ERROR\", \"message\": \"Insufficient funds for loan payment\" }");
            return;
        }

        acct.setBalance(acct.getBalance() - amount);
        loan.setRemaining(loan.getRemaining() - amount);

        if (loan.getRemaining() <= 0) {
            loan.setRemaining(0);
            loan.setStatus("PAID");
        }

        recordTransaction(accountId, "LOAN_PAYMENT", amount, acct.getBalance(),
                "Loan payment: " + loanId, loanId);

        System.out.println("{ \"status\": \"OK\", \"message\": \"Payment successful\", \"loan_id\": \""
                + loanId + "\", \"paid\": " + formatBalance(amount)
                + ", \"remaining\": " + formatBalance(loan.getRemaining())
                + ", \"loan_status\": \"" + loan.getStatus() + "\" }");
    }

    private void opCheckLoan(String loanId) {
        if (loanId.isEmpty()) {
            System.out.println("{ \"status\": \"ERROR\", \"message\": \"Loan ID is required\" }");
            return;
        }

        int loanIdx = -1;
        for (int i = 0; i < loans.size(); i++) {
            if (loans.get(i).getId().equals(loanId)) {
                loanIdx = i;
            }
        }

        if (loanIdx < 0) {
            System.out.println("{ \"status\": \"NOT_FOUND\", \"message\": \"Loan not found: " + loanId + "\" }");
            return;
        }

        Loan l = loans.get(loanIdx);
        String rateFormatted = String.format("%05.2f", l.getRate());
        String termFormatted = String.format("%03d", l.getTerm());
        System.out.println("{ \"status\": \"OK\", \"loan_id\": \"" + loanId
                + "\", \"account_id\": \"" + l.getAccountId()
                + "\", \"principal\": " + formatBalance(l.getPrincipal())
                + ", \"rate\": " + rateFormatted
                + ", \"term_months\": " + termFormatted
                + ", \"remaining\": " + formatBalance(l.getRemaining())
                + ", \"status\": \"" + l.getStatus() + "\" }");
    }

    private void opListLoans(String accountId) {
        int listCount = 0;
        boolean firstItem = true;

        if (accountId.isEmpty()) {
            System.out.println("{ \"status\": \"OK\", \"loans\": [");
            for (Loan l : loans) {
                listCount++;
                if (firstItem) {
                    firstItem = false;
                    System.out.println("{ \"loan_id\": \"" + l.getId()
                            + "\", \"account_id\": \"" + l.getAccountId()
                            + "\", \"principal\": " + formatBalance(l.getPrincipal())
                            + ", \"remaining\": " + formatBalance(l.getRemaining())
                            + ", \"status\": \"" + l.getStatus() + "\" }");
                } else {
                    System.out.println(", { \"loan_id\": \"" + l.getId()
                            + "\", \"account_id\": \"" + l.getAccountId()
                            + "\", \"principal\": " + formatBalance(l.getPrincipal())
                            + ", \"remaining\": " + formatBalance(l.getRemaining())
                            + ", \"status\": \"" + l.getStatus() + "\" }");
                }
            }
            System.out.println("], \"count\": " + formatCount(listCount, 3) + " }");
        } else {
            int acctIdx = findAccount(accountId);
            if (acctIdx < 0) {
                System.out.println("{ \"status\": \"ERROR\", \"message\": \"Account not found: " + accountId + "\" }");
                return;
            }
            System.out.println("{ \"status\": \"OK\", \"loans\": [");
            for (Loan l : loans) {
                if (l.getAccountId().equals(accountId)) {
                    listCount++;
                    if (firstItem) {
                        firstItem = false;
                        System.out.println("{ \"loan_id\": \"" + l.getId()
                                + "\", \"principal\": " + formatBalance(l.getPrincipal())
                                + ", \"remaining\": " + formatBalance(l.getRemaining())
                                + ", \"status\": \"" + l.getStatus() + "\" }");
                    } else {
                        System.out.println(", { \"loan_id\": \"" + l.getId()
                                + "\", \"principal\": " + formatBalance(l.getPrincipal())
                                + ", \"remaining\": " + formatBalance(l.getRemaining())
                                + ", \"status\": \"" + l.getStatus() + "\" }");
                    }
                }
            }
            System.out.println("], \"count\": " + formatCount(listCount, 3) + " }");
        }
    }

    private void opCalculateScore(String accountId, String accountName, String incomeStr, String debtStr) {
        if (accountId.isEmpty()) {
            System.out.println("{ \"status\": \"ERROR\", \"message\": \"Account ID is required\" }");
            return;
        }

        int score = 300;

        double income = incomeStr.isEmpty() ? 0.0 : Double.parseDouble(incomeStr);
        double debt = debtStr.isEmpty() ? 0.0 : Double.parseDouble(debtStr);

        if (income > 0) {
            if (income >= 100000) {
                score += 200;
            } else if (income >= 50000) {
                score += 150;
            } else if (income >= 25000) {
                score += 100;
            } else {
                score += 50;
            }

            if (debt > 0) {
                double ratio = (debt / income) * 100.0;
                if (ratio > 50) {
                    score -= 100;
                } else if (ratio > 30) {
                    score -= 50;
                } else if (ratio > 10) {
                    score -= 25;
                }
            }
        }

        double totalLoans = 0;
        for (Loan l : loans) {
            if (l.getAccountId().equals(accountId) && l.getStatus().equals("ACTIVE")) {
                totalLoans += l.getRemaining();
            }
        }
        if (totalLoans > 100000) {
            score -= 50;
        } else if (totalLoans > 50000) {
            score -= 25;
        }

        if (score > 850) score = 850;
        if (score < 100) score = 100;

        System.out.println("{ \"status\": \"OK\", \"account\": \"" + accountId
                + "\", \"score\": " + score + ", \"message\": \"Score calculated\" }");
    }

    private void opTransactionHistory(String accountId) {
        if (accountId.isEmpty()) {
            System.out.println("{ \"status\": \"ERROR\", \"message\": \"Account ID is required\" }");
            return;
        }

        int acctIdx = findAccountAny(accountId);
        if (acctIdx < 0) {
            System.out.println("{ \"status\": \"ERROR\", \"message\": \"Account not found: " + accountId + "\" }");
            return;
        }

        int listCount = 0;
        boolean firstItem = true;
        System.out.println("{ \"status\": \"OK\", \"account_id\": \"" + accountId + "\", \"transactions\": [");
        for (Transaction t : transactions) {
            if (t.getAccountId().equals(accountId)) {
                listCount++;
                String txnIdFormatted = String.format("%05d", t.getId());
                if (firstItem) {
                    firstItem = false;
                    System.out.println("{ \"txn_id\": " + txnIdFormatted
                            + ", \"type\": \"" + t.getType()
                            + "\", \"amount\": " + formatBalance(t.getAmount())
                            + ", \"balance_after\": " + formatBalance(t.getBalanceAfter())
                            + ", \"description\": \"" + t.getDescription() + "\" }");
                } else {
                    System.out.println(", { \"txn_id\": " + txnIdFormatted
                            + ", \"type\": \"" + t.getType()
                            + "\", \"amount\": " + formatBalance(t.getAmount())
                            + ", \"balance_after\": " + formatBalance(t.getBalanceAfter())
                            + ", \"description\": \"" + t.getDescription() + "\" }");
                }
            }
        }
        System.out.println("], \"count\": " + formatCount(listCount, 3) + " }");
    }

    private void opDashboard() {
        int activeCount = 0;
        double totalBalance = 0;
        double totalLoans = 0;
        int loanCount = 0;

        for (Account a : accounts) {
            if (a.getActive() == 1) {
                activeCount++;
                totalBalance += a.getBalance();
            }
        }

        for (Loan l : loans) {
            if (l.getStatus().equals("ACTIVE")) {
                loanCount++;
                totalLoans += l.getRemaining();
            }
        }

        String txnCountFormatted = String.format("%05d", transactions.size());
        System.out.println("{ \"status\": \"OK\", \"active_accounts\": " + formatCount(activeCount, 3)
                + ", \"total_balance\": " + formatBalance(totalBalance)
                + ", \"active_loans\": " + formatCount(loanCount, 3)
                + ", \"total_loan_balance\": " + formatBalance(totalLoans)
                + ", \"total_transactions\": " + txnCountFormatted + " }");
    }
}

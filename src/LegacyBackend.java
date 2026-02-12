import java.io.BufferedReader;
import java.io.FileReader;
import java.io.IOException;
import java.math.BigDecimal;
import java.math.RoundingMode;

public class LegacyBackend {

    private static final int MAX_ACCOUNTS = 100;
    private static final int BASE_SCORE = 300;

    private static String[] acctIds = new String[MAX_ACCOUNTS];
    private static String[] acctNames = new String[MAX_ACCOUNTS];
    private static BigDecimal[] acctBalances = new BigDecimal[MAX_ACCOUNTS];
    private static int acctCount = 0;

    public static void main(String[] args) {
        String inputPath = (args.length > 0 && !args[0].trim().isEmpty())
            ? args[0]
            : "data/input.dat";

        try (BufferedReader reader = new BufferedReader(new FileReader(inputPath))) {
            String line;
            while ((line = reader.readLine()) != null) {
                if (line.trim().isEmpty()) {
                    continue;
                }
                processLine(line);
            }
        } catch (IOException e) {
            System.out.println("{ \"status\": \"ERROR\", \"message\": \"Cannot open input file\" }");
        }
    }

    private static void processLine(String line) {
        String[] fields = new String[5];
        for (int i = 0; i < 5; i++) {
            fields[i] = "";
        }

        String[] parts = line.split("\\|", -1);
        for (int i = 0; i < parts.length && i < 5; i++) {
            fields[i] = parts[i].trim();
        }

        String operation = fields[0];
        String accountId = fields[1];
        String accountName = fields[2];
        String field4 = fields[3];
        String field5 = fields[4];

        BigDecimal accountBalance = BigDecimal.ZERO;
        BigDecimal income = BigDecimal.ZERO;
        BigDecimal debt = BigDecimal.ZERO;

        if (!field4.isEmpty()) {
            if (operation.equals("CALCULATE_SCORE")) {
                income = new BigDecimal(field4);
            } else {
                accountBalance = new BigDecimal(field4);
            }
        }

        if (!field5.isEmpty()) {
            debt = new BigDecimal(field5);
        }

        switch (operation) {
            case "CREATE_ACCOUNT":
                opCreateAccount(accountId, accountName, accountBalance);
                break;
            case "CHECK_ACCOUNT":
                opCheckAccount(accountId);
                break;
            case "CALCULATE_SCORE":
                opCalculateScore(accountId, income, debt);
                break;
            default:
                System.out.println("{ \"status\": \"ERROR\", \"message\": \"Unknown operation: " + operation + "\" }");
                break;
        }
    }

    private static void opCreateAccount(String accountId, String accountName, BigDecimal balance) {
        if (accountId.isEmpty()) {
            System.out.println("{ \"status\": \"ERROR\", \"message\": \"Account ID is required\" }");
            return;
        }

        boolean found = false;
        for (int i = 0; i < acctCount; i++) {
            if (acctIds[i].equals(accountId)) {
                found = true;
                break;
            }
        }

        if (found) {
            System.out.println("{ \"status\": \"ERROR\", \"message\": \"Account already exists: " + accountId + "\" }");
        } else {
            acctIds[acctCount] = accountId;
            acctNames[acctCount] = accountName;
            acctBalances[acctCount] = balance;
            acctCount++;
            System.out.println("{ \"status\": \"OK\", \"message\": \"Account created: " + accountId + "\" }");
        }
    }

    private static void opCheckAccount(String accountId) {
        if (accountId.isEmpty()) {
            System.out.println("{ \"status\": \"ERROR\", \"message\": \"Account ID is required\" }");
            return;
        }

        boolean found = false;
        int foundIdx = -1;
        for (int i = 0; i < acctCount; i++) {
            if (acctIds[i].equals(accountId)) {
                found = true;
                foundIdx = i;
            }
        }

        if (found) {
            String formattedBalance = formatBalance(acctBalances[foundIdx]);
            System.out.println("{ \"status\": \"OK\", \"message\": \"Account found: " + accountId
                + "\", \"name\": \"" + acctNames[foundIdx]
                + "\", \"balance\": \"" + formattedBalance + "\" }");
        } else {
            System.out.println("{ \"status\": \"NOT_FOUND\", \"message\": \"Account not found: " + accountId + "\" }");
        }
    }

    private static String formatBalance(BigDecimal balance) {
        BigDecimal scaled = balance.setScale(2, RoundingMode.DOWN);
        String raw = scaled.toPlainString();

        int dotIndex = raw.indexOf('.');
        String intPart = (dotIndex >= 0) ? raw.substring(0, dotIndex) : raw;
        String decPart = (dotIndex >= 0) ? raw.substring(dotIndex + 1) : "00";

        while (intPart.length() < 10) {
            intPart = "0" + intPart;
        }
        while (decPart.length() < 2) {
            decPart = decPart + "0";
        }

        return intPart + "." + decPart;
    }

    private static void opCalculateScore(String accountId, BigDecimal income, BigDecimal debt) {
        if (accountId.isEmpty()) {
            System.out.println("{ \"status\": \"ERROR\", \"message\": \"Account ID is required\" }");
            return;
        }

        int score = BASE_SCORE;

        if (income.compareTo(BigDecimal.ZERO) > 0) {
            if (income.compareTo(new BigDecimal("100000")) >= 0) {
                score += 200;
            } else if (income.compareTo(new BigDecimal("50000")) >= 0) {
                score += 150;
            } else if (income.compareTo(new BigDecimal("25000")) >= 0) {
                score += 100;
            } else {
                score += 50;
            }

            if (debt.compareTo(BigDecimal.ZERO) > 0) {
                BigDecimal ratio = debt.multiply(new BigDecimal("100"))
                    .divide(income, 2, RoundingMode.DOWN);
                if (ratio.compareTo(new BigDecimal("50")) > 0) {
                    score -= 100;
                } else if (ratio.compareTo(new BigDecimal("30")) > 0) {
                    score -= 50;
                } else if (ratio.compareTo(new BigDecimal("10")) > 0) {
                    score -= 25;
                }
            }
        }

        if (score > 850) {
            score = 850;
        }
        if (score < 100) {
            score = 100;
        }

        System.out.println("{ \"status\": \"OK\", \"account\": \"" + accountId
            + "\", \"score\": " + score
            + ", \"message\": \"Score calculated\" }");
    }
}

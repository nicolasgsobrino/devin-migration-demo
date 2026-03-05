# COBOL Legacy Backend - Migration Demo

A minimal COBOL (GnuCOBOL) program that simulates a legacy banking backend. This project serves as a POC for testing logic-preserving migration from COBOL to Java.

## Requirements

- **GnuCOBOL 3.x** (`cobc` compiler)
- **Bash** (for build/run scripts)

### Install GnuCOBOL

**Ubuntu / Debian:**

```bash
sudo apt-get update && sudo apt-get install -y gnucobol
```

**macOS (Homebrew):**

```bash
brew install gnucobol
```

## Project Structure

```
.
├── src/
│   └── legacy-backend.cbl    # Main COBOL program
├── data/
│   ├── input.dat              # Sample input operations
│   └── expected-output.txt    # Expected output for verification
├── scripts/
│   ├── build.sh               # Compile the COBOL program
│   ├── run.sh                 # Run with an input file
│   └── verify.sh              # Compare actual output vs expected
└── README.md
```

## Build & Run

### Compile

```bash
./scripts/build.sh
```

This compiles `src/legacy-backend.cbl` into `bin/legacy-backend`.

### Run

```bash
./scripts/run.sh                     # uses default data/input.dat
./scripts/run.sh path/to/input.dat   # uses a custom input file
```

### Verify output

```bash
./scripts/verify.sh
```

Compares actual program output against `data/expected-output.txt` and reports PASS/FAIL.

## Supported Operations

The program reads a pipe-delimited (`|`) input file. Each line is one operation.

| Operation | Format | Description |
|---|---|---|
| `CREATE_ACCOUNT` | `CREATE_ACCOUNT\|<id>\|<name>\|<balance>` | Creates an account in memory |
| `CHECK_ACCOUNT` | `CHECK_ACCOUNT\|<id>` | Looks up an account by ID |
| `CALCULATE_SCORE` | `CALCULATE_SCORE\|<id>\|<name>\|<income>\|<debt>` | Computes a credit score |

## Business Logic

### CREATE_ACCOUNT

- Stores the account (id, name, balance) in an in-memory table (up to 100 entries).
- Returns `ERROR` if the account ID already exists.

### CHECK_ACCOUNT

- Searches the in-memory table by account ID.
- Returns account details (name, balance) if found, or `NOT_FOUND`.

### CALCULATE_SCORE

Deterministic credit score algorithm:

1. **Base score**: 300
2. **Income bonus** (added to base):
   - income >= 100,000 &rarr; +200
   - income >= 50,000 &rarr; +150
   - income >= 25,000 &rarr; +100
   - income < 25,000 &rarr; +50
   - income = 0 &rarr; no bonus (score stays at 300)
3. **Debt penalty** (subtracted, only when income > 0):
   - debt/income ratio > 50% &rarr; -100
   - debt/income ratio > 30% &rarr; -50
   - debt/income ratio > 10% &rarr; -25
4. **Clamped** to range [100, 850].

## Functional Behavior

### Sample Input (`data/input.dat`)

```
CREATE_ACCOUNT|ACC001|Alice Johnson|50000.00
CREATE_ACCOUNT|ACC002|Bob Smith|120000.00
CREATE_ACCOUNT|ACC003|Carol White|0.00
CHECK_ACCOUNT|ACC001
CHECK_ACCOUNT|ACC999
CALCULATE_SCORE|ACC001|Alice Johnson|75000.00|10000.00
CALCULATE_SCORE|ACC002|Bob Smith|120000.00|70000.00
CALCULATE_SCORE|ACC003|Carol White|20000.00|5000.00
CALCULATE_SCORE|ACC004|Dave Brown|0.00|0.00
CREATE_ACCOUNT|ACC001|Alice Duplicate|999.00
INVALID_OP|X123
```

### Expected Output (`data/expected-output.txt`)

```
{ "status": "OK", "message": "Account created: ACC001" }
{ "status": "OK", "message": "Account created: ACC002" }
{ "status": "OK", "message": "Account created: ACC003" }
{ "status": "OK", "message": "Account found: ACC001", "name": "Alice Johnson", "balance": "0000050000.00" }
{ "status": "NOT_FOUND", "message": "Account not found: ACC999" }
{ "status": "OK", "account": "ACC001", "score": 425, "message": "Score calculated" }
{ "status": "OK", "account": "ACC002", "score": 400, "message": "Score calculated" }
{ "status": "OK", "account": "ACC003", "score": 325, "message": "Score calculated" }
{ "status": "OK", "account": "ACC004", "score": 300, "message": "Score calculated" }
{ "status": "ERROR", "message": "Account already exists: ACC001" }
{ "status": "ERROR", "message": "Unknown operation: INVALID_OP" }
```

### Score Calculation Examples

| Account | Income | Debt | Ratio | Base | Income Bonus | Debt Penalty | Final Score |
|---|---|---|---|---|---|---|---|
| ACC001 | 75,000 | 10,000 | 13.3% | 300 | +150 | -25 | **425** |
| ACC002 | 120,000 | 70,000 | 58.3% | 300 | +200 | -100 | **400** |
| ACC003 | 20,000 | 5,000 | 25.0% | 300 | +50 | -25 | **325** |
| ACC004 | 0 | 0 | N/A | 300 | +0 | -0 | **300** |

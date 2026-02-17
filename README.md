# COBOL Banking System - Professional Edition

A full-stack professional banking system powered by a COBOL backend, Python Flask API middleware, and React frontend. Supports 15 banking operations including account management, financial transactions, loans, credit scoring, and analytics.

## Architecture

```
+------------------+     +------------------+     +------------------+
|  React Frontend  | --> |  Flask API       | --> |  COBOL Backend   |
|  (Port 3000)     |     |  (Port 5000)     |     |  (Binary)        |
|                  |     |                  |     |                  |
|  - Dashboard     |     |  - REST API      |     |  - 100 Accounts  |
|  - Clients       |     |  - JSON I/O      |     |  - 50 Loans      |
|  - Operations    |     |  - Process exec  |     |  - 500 Txn log   |
|  - Loans         |     |                  |     |  - Credit scoring |
|  - Reports       |     |                  |     |                  |
+------------------+     +------------------+     +------------------+
```

## Requirements

- **GnuCOBOL 3.x** (`cobc` compiler)
- **Python 3.8+** with pip
- **Node.js 16+** with npm
- **Bash** (for build/run scripts)

### Install Dependencies

**Ubuntu / Debian:**

```bash
sudo apt-get update && sudo apt-get install -y gnucobol python3 python3-pip nodejs npm
```

**macOS (Homebrew):**

```bash
brew install gnucobol python node
```

## Project Structure

```
.
├── src/
│   └── legacy-backend.cbl    # COBOL backend (1300+ lines, 15 operations)
├── api/
│   ├── app.py                 # Flask REST API middleware
│   └── requirements.txt       # Python dependencies
├── frontend/
│   ├── public/
│   │   └── index.html
│   ├── src/
│   │   ├── App.js             # Main app with routing
│   │   ├── index.js           # Entry point
│   │   ├── index.css          # Professional banking styles
│   │   ├── services/
│   │   │   └── api.js         # API client
│   │   └── pages/
│   │       ├── Dashboard.js   # Overview with stats
│   │       ├── Accounts.js    # Client management (CRUD)
│   │       ├── Operations.js  # Deposit/Withdraw/Transfer
│   │       ├── Loans.js       # Loan management
│   │       └── Reports.js     # Credit score & history
│   └── package.json
├── data/
│   ├── input.dat              # Sample input operations
│   └── expected-output.txt    # Expected output for verification
├── scripts/
│   ├── build.sh               # Compile COBOL
│   ├── run.sh                 # Run COBOL with input
│   ├── verify.sh              # Verify output
│   ├── run-api.sh             # Start Flask API
│   ├── run-frontend.sh        # Start React frontend
│   └── run-all.sh             # Start full stack
└── README.md
```

## Quick Start

### 1. Build COBOL Backend

```bash
./scripts/build.sh
```

### 2. Start Full Stack

```bash
./scripts/run-all.sh
```

Or start components individually:

```bash
./scripts/run-api.sh        # Flask API on port 5000
./scripts/run-frontend.sh   # React on port 3000
```

### 3. Run COBOL Directly

```bash
./scripts/run.sh                     # uses default data/input.dat
./scripts/run.sh path/to/input.dat   # uses a custom input file
```

### Verify Output

```bash
./scripts/verify.sh
```

## Supported Operations (15)

The COBOL backend reads pipe-delimited (`|`) input. Each line is one operation. All output is JSON.

### Account Management

| Operation | Format | Description |
|---|---|---|
| `CREATE_ACCOUNT` | `CREATE_ACCOUNT\|<id>\|<name>\|<type>\|<balance>` | Create account (CHECKING/SAVINGS) |
| `CHECK_ACCOUNT` | `CHECK_ACCOUNT\|<id>` | Look up account details |
| `UPDATE_ACCOUNT` | `UPDATE_ACCOUNT\|<id>\|<new_name>` | Update account holder name |
| `DELETE_ACCOUNT` | `DELETE_ACCOUNT\|<id>` | Delete an account |
| `LIST_ACCOUNTS` | `LIST_ACCOUNTS` | List all active accounts |

### Financial Operations

| Operation | Format | Description |
|---|---|---|
| `DEPOSIT` | `DEPOSIT\|<id>\|<amount>` | Deposit funds |
| `WITHDRAW` | `WITHDRAW\|<id>\|<amount>` | Withdraw funds (checks balance) |
| `TRANSFER` | `TRANSFER\|<from_id>\|<to_id>\|<amount>` | Transfer between accounts |

### Loan Management

| Operation | Format | Description |
|---|---|---|
| `CREATE_LOAN` | `CREATE_LOAN\|<acc_id>\|<loan_id>\|<principal>\|<rate>\|<term>` | Create loan with amortization |
| `PAY_LOAN` | `PAY_LOAN\|<acc_id>\|<loan_id>\|<amount>` | Make loan payment |
| `CHECK_LOAN` | `CHECK_LOAN\|<loan_id>` | Check loan details |
| `LIST_LOANS` | `LIST_LOANS` | List all active loans |

### Analytics

| Operation | Format | Description |
|---|---|---|
| `CALCULATE_SCORE` | `CALCULATE_SCORE\|<id>\|<name>\|<income>\|<debt>` | Compute credit score (100-850) |
| `TRANSACTION_HISTORY` | `TRANSACTION_HISTORY\|<id>` | View account transaction log |
| `DASHBOARD` | `DASHBOARD` | System-wide analytics summary |

## REST API Endpoints

| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/health` | Health check |
| GET | `/api/accounts` | List all accounts |
| POST | `/api/accounts` | Create account |
| GET | `/api/accounts/:id` | Get account details |
| PUT | `/api/accounts/:id` | Update account |
| DELETE | `/api/accounts/:id` | Delete account |
| POST | `/api/accounts/:id/deposit` | Make deposit |
| POST | `/api/accounts/:id/withdraw` | Make withdrawal |
| POST | `/api/transfer` | Transfer funds |
| GET | `/api/loans` | List loans |
| POST | `/api/loans` | Create loan |
| GET | `/api/loans/:id` | Get loan details |
| POST | `/api/loans/:id/pay` | Make loan payment |
| GET | `/api/accounts/:id/score` | Calculate credit score |
| GET | `/api/accounts/:id/transactions` | Transaction history |
| GET | `/api/dashboard` | Dashboard analytics |

## Business Logic

### Credit Scoring Algorithm

1. **Base score**: 300
2. **Income bonus**: +200 (>=100K), +150 (>=50K), +100 (>=25K), +50 (<25K)
3. **Debt penalty**: -100 (ratio >50%), -50 (>30%), -25 (>10%)
4. **Clamped** to [100, 850]

### Loan Amortization

Monthly payment calculated using standard amortization formula:
`M = P * [r(1+r)^n] / [(1+r)^n - 1]`

Where P = principal, r = monthly rate, n = term in months.

### Transaction Logging

All financial operations are recorded with: transaction ID, type, amount, balance after, description, and timestamp. Up to 500 transactions stored.

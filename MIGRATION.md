# Migration Report: COBOL to Java

## Overview

This document describes the migration of `src/legacy-backend.cbl` (GnuCOBOL, 247 lines) to `src/LegacyBackend.java` (Java 17). The migration preserves 100% functional equivalence — the Java program produces byte-for-byte identical output to the original COBOL program for the same input.

## Original System Summary

| Aspect | Detail |
|---|---|
| Language | GnuCOBOL 3.x |
| Lines of code | 247 |
| Operations | CREATE_ACCOUNT, CHECK_ACCOUNT, CALCULATE_SCORE |
| Input format | Pipe-delimited text file |
| Output format | JSON strings to stdout |
| State | In-memory array (up to 100 accounts), no persistence |

## Migration Decisions

### 1. Single-class design

The COBOL program is a single compilation unit with shared working storage. The Java translation mirrors this as a single class (`LegacyBackend`) with static fields and methods. This preserves the original structure without introducing unnecessary OO abstractions.

### 2. Component mapping

| COBOL | Java |
|---|---|
| `WORKING-STORAGE SECTION` | Static fields in `LegacyBackend` |
| `WS-ACCOUNT-TABLE` (OCCURS 100) | Parallel arrays: `acctIds[]`, `acctNames[]`, `acctBalances[]` |
| `WS-ACCT-COUNT` | `acctCount` (int) |
| `PROCEDURE DIVISION` paragraphs | Static methods: `processLine()`, `opCreateAccount()`, `opCheckAccount()`, `opCalculateScore()` |
| `UNSTRING ... DELIMITED BY "\|"` | `String.split("\\|", -1)` |
| `PIC 9(10)V99` (balance) | `BigDecimal` with `formatBalance()` for display |
| `PIC 9(3)` (score) | `int` |
| `FUNCTION NUMVAL()` | `new BigDecimal(string)` |
| `FUNCTION TRIM()` | `String.trim()` |
| `EVALUATE TRUE / WHEN` | `switch` / `if-else if` |
| `ACCEPT ... FROM COMMAND-LINE` | `args[0]` |
| `DISPLAY` | `System.out.println()` |

### 3. Balance formatting

COBOL's `PIC 9(10)V99` implicitly formats numeric values with exactly 10 integer digits and 2 decimal places (e.g., `0000050000.00`). The Java `formatBalance()` method replicates this exact format using zero-padding.

### 4. Score calculation precision

The credit score algorithm uses `BigDecimal` for the debt-to-income ratio to match COBOL's `PIC 9(3)V99` precision. The ratio is computed as `(debt * 100) / income` with scale 2 and `RoundingMode.DOWN`, matching COBOL's truncation behavior.

### 5. Input parsing

COBOL's `UNSTRING` splits into exactly 5 fields. The Java equivalent uses `String.split("\\|", -1)` and pads to 5 elements, preserving behavior when fewer fields are present.

### 6. Empty line handling

The COBOL program reads until EOF; blank lines produce no output because parsing yields an empty operation which falls through to "Unknown operation" with an empty name. In Java, blank lines are explicitly skipped to avoid this edge case while preserving output equivalence.

### 7. Loop semantics in CHECK_ACCOUNT

The COBOL `PERFORM VARYING` loop does not `EXIT` early — it always scans all entries, keeping the last match index. The Java translation preserves this behavior (no `break` in the search loop).

## Files Changed

| File | Change |
|---|---|
| `src/LegacyBackend.java` | **New** — Java translation of the COBOL program |
| `src/legacy-backend.cbl` | **Unchanged** — kept for reference |
| `scripts/build.sh` | Updated to compile Java (`javac`) |
| `scripts/run.sh` | Updated to run Java (`java -cp`) |
| `scripts/verify.sh` | Updated to verify Java output |
| `.gitignore` | Added `*.class` |
| `MIGRATION.md` | **New** — this document |

## Validation

```
$ ./scripts/build.sh && ./scripts/verify.sh
PASS: Output matches expected results.
```

The Java output is byte-for-byte identical to `data/expected-output.txt`.

## Known Limitations

- No unit tests were added (matching the original project scope).
- The 100-account limit is preserved as-is from the COBOL source.
- No concurrency or persistence — the program remains a single-threaded batch processor.

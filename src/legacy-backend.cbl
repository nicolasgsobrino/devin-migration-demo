       IDENTIFICATION DIVISION.
       PROGRAM-ID. LEGACY-BACKEND.
       AUTHOR. MIGRATION-DEMO.

       ENVIRONMENT DIVISION.
       INPUT-OUTPUT SECTION.
       FILE-CONTROL.
           SELECT INPUT-FILE ASSIGN TO WS-INPUT-PATH
               ORGANIZATION IS LINE SEQUENTIAL
               FILE STATUS IS WS-FILE-STATUS.

       DATA DIVISION.
       FILE SECTION.
       FD INPUT-FILE.
       01 INPUT-RECORD               PIC X(300).

       WORKING-STORAGE SECTION.
       01 WS-INPUT-PATH              PIC X(256).
       01 WS-FILE-STATUS             PIC XX.
       01 WS-EOF                     PIC 9 VALUE 0.

       01 WS-INPUT-LINE              PIC X(300).
       01 WS-OPERATION               PIC X(30).
       01 WS-FIELD1                  PIC X(50).
       01 WS-FIELD2                  PIC X(50).
       01 WS-FIELD3                  PIC X(50).
       01 WS-FIELD4                  PIC X(50).
       01 WS-FIELD5                  PIC X(50).
       01 WS-FIELD6                  PIC X(50).

       01 WS-ACCOUNT-ID              PIC X(20).
       01 WS-ACCOUNT-NAME            PIC X(50).
       01 WS-ACCOUNT-TYPE            PIC X(20).
       01 WS-ACCOUNT-BALANCE         PIC S9(10)V99.
       01 WS-AMOUNT                  PIC S9(10)V99.
       01 WS-INCOME                  PIC 9(10)V99.
       01 WS-DEBT                    PIC 9(10)V99.
       01 WS-FROM-ACCOUNT            PIC X(20).
       01 WS-TO-ACCOUNT              PIC X(20).

       01 WS-SCORE                   PIC 9(3).
       01 WS-RATIO                   PIC 9(3)V99.
       01 WS-BASE-SCORE              PIC 9(3) VALUE 300.

       01 WS-ACCOUNT-TABLE.
          05 WS-ACCT-ENTRY OCCURS 100 TIMES.
             10 WS-ACCT-ID           PIC X(20).
             10 WS-ACCT-NAME         PIC X(50).
             10 WS-ACCT-BALANCE      PIC S9(10)V99.
             10 WS-ACCT-TYPE         PIC X(20).
             10 WS-ACCT-ACTIVE       PIC 9 VALUE 0.
             10 WS-ACCT-CREATED      PIC X(26).
       01 WS-ACCT-COUNT              PIC 9(3) VALUE 0.
       01 WS-ACCT-IDX                PIC 9(3).
       01 WS-FOUND                   PIC 9 VALUE 0.
       01 WS-FOUND-IDX               PIC 9(3).

       01 WS-LOAN-TABLE.
          05 WS-LOAN-ENTRY OCCURS 50 TIMES.
             10 WS-LOAN-ID           PIC X(20).
             10 WS-LOAN-ACCT-ID      PIC X(20).
             10 WS-LOAN-PRINCIPAL    PIC S9(10)V99.
             10 WS-LOAN-RATE         PIC 9(2)V99.
             10 WS-LOAN-TERM         PIC 9(3).
             10 WS-LOAN-REMAINING    PIC S9(10)V99.
             10 WS-LOAN-MONTHLY      PIC S9(10)V99.
             10 WS-LOAN-STATUS       PIC X(10).
             10 WS-LOAN-CREATED      PIC X(26).
       01 WS-LOAN-COUNT              PIC 9(3) VALUE 0.
       01 WS-LOAN-IDX                PIC 9(3).
       01 WS-LOAN-FOUND              PIC 9 VALUE 0.
       01 WS-LOAN-FOUND-IDX          PIC 9(3).

       01 WS-TXN-TABLE.
          05 WS-TXN-ENTRY OCCURS 500 TIMES.
             10 WS-TXN-ID            PIC 9(5).
             10 WS-TXN-ACCT-ID       PIC X(20).
             10 WS-TXN-TYPE          PIC X(20).
             10 WS-TXN-AMOUNT        PIC S9(10)V99.
             10 WS-TXN-BALANCE-AF    PIC S9(10)V99.
             10 WS-TXN-DESC          PIC X(50).
             10 WS-TXN-REF           PIC X(20).
             10 WS-TXN-TIMESTAMP     PIC X(26).
       01 WS-TXN-COUNT               PIC 9(5) VALUE 0.
       01 WS-TXN-IDX                 PIC 9(5).

       01 WS-FOUND2-IDX              PIC 9(3).
       01 WS-MONTHLY-RATE            PIC 9V9(6).
       01 WS-LIST-COUNT              PIC 9(3).
       01 WS-FIRST-ITEM              PIC 9 VALUE 1.
       01 WS-CURRENT-DATE-TIME       PIC X(26).
       01 WS-DATE-INT                PIC 9(8).
       01 WS-TIME-INT                PIC 9(8).
       01 WS-LOAN-ID-INPUT           PIC X(20).
       01 WS-NEW-NAME                PIC X(50).
       01 WS-DISPLAY-BAL             PIC -(10)9.99.
       01 WS-DISPLAY-AMT             PIC -(10)9.99.
       01 WS-TOTAL-LOANS             PIC S9(10)V99.
       01 WS-TOTAL-BALANCE           PIC S9(10)V99.
       01 WS-ACTIVE-COUNT            PIC 9(3).

       PROCEDURE DIVISION.
       MAIN-PROGRAM.
           ACCEPT WS-INPUT-PATH FROM COMMAND-LINE
           IF WS-INPUT-PATH = SPACES
               MOVE "input.dat" TO WS-INPUT-PATH
           END-IF

           PERFORM GET-CURRENT-TIMESTAMP

           OPEN INPUT INPUT-FILE
           IF WS-FILE-STATUS NOT = "00"
               DISPLAY '{ "status": "ERROR", '
                   '"message": "Cannot open input file" }'
               STOP RUN
           END-IF

           PERFORM UNTIL WS-EOF = 1
               READ INPUT-FILE INTO WS-INPUT-LINE
                   AT END
                       MOVE 1 TO WS-EOF
                   NOT AT END
                       PERFORM PROCESS-LINE
               END-READ
           END-PERFORM

           CLOSE INPUT-FILE
           STOP RUN.

       GET-CURRENT-TIMESTAMP.
           ACCEPT WS-DATE-INT FROM DATE YYYYMMDD
           ACCEPT WS-TIME-INT FROM TIME
           STRING
               WS-DATE-INT(1:4) "-"
               WS-DATE-INT(5:2) "-"
               WS-DATE-INT(7:2) "T"
               WS-TIME-INT(1:2) ":"
               WS-TIME-INT(3:2) ":"
               WS-TIME-INT(5:2) "Z"
               DELIMITED BY SIZE
               INTO WS-CURRENT-DATE-TIME
           END-STRING.

       PROCESS-LINE.
           MOVE SPACES TO WS-OPERATION
           MOVE SPACES TO WS-FIELD1
           MOVE SPACES TO WS-FIELD2
           MOVE SPACES TO WS-FIELD3
           MOVE SPACES TO WS-FIELD4
           MOVE SPACES TO WS-FIELD5
           MOVE SPACES TO WS-FIELD6
           MOVE 0 TO WS-ACCOUNT-BALANCE
           MOVE 0 TO WS-AMOUNT
           MOVE 0 TO WS-INCOME
           MOVE 0 TO WS-DEBT

           UNSTRING WS-INPUT-LINE DELIMITED BY "|"
               INTO WS-OPERATION
                    WS-FIELD1
                    WS-FIELD2
                    WS-FIELD3
                    WS-FIELD4
                    WS-FIELD5
                    WS-FIELD6
           END-UNSTRING

           MOVE FUNCTION TRIM(WS-OPERATION)
               TO WS-OPERATION

           EVALUATE TRUE
               WHEN WS-OPERATION = "CREATE_ACCOUNT"
                   PERFORM OP-CREATE-ACCOUNT
               WHEN WS-OPERATION = "DELETE_ACCOUNT"
                   PERFORM OP-DELETE-ACCOUNT
               WHEN WS-OPERATION = "UPDATE_ACCOUNT"
                   PERFORM OP-UPDATE-ACCOUNT
               WHEN WS-OPERATION = "CHECK_ACCOUNT"
                   PERFORM OP-CHECK-ACCOUNT
               WHEN WS-OPERATION = "LIST_ACCOUNTS"
                   PERFORM OP-LIST-ACCOUNTS
               WHEN WS-OPERATION = "DEPOSIT"
                   PERFORM OP-DEPOSIT
               WHEN WS-OPERATION = "WITHDRAW"
                   PERFORM OP-WITHDRAW
               WHEN WS-OPERATION = "TRANSFER"
                   PERFORM OP-TRANSFER
               WHEN WS-OPERATION = "CREATE_LOAN"
                   PERFORM OP-CREATE-LOAN
               WHEN WS-OPERATION = "PAY_LOAN"
                   PERFORM OP-PAY-LOAN
               WHEN WS-OPERATION = "CHECK_LOAN"
                   PERFORM OP-CHECK-LOAN
               WHEN WS-OPERATION = "LIST_LOANS"
                   PERFORM OP-LIST-LOANS
               WHEN WS-OPERATION = "CALCULATE_SCORE"
                   PERFORM OP-CALCULATE-SCORE
               WHEN WS-OPERATION = "TRANSACTION_HISTORY"
                   PERFORM OP-TRANSACTION-HISTORY
               WHEN WS-OPERATION = "DASHBOARD"
                   PERFORM OP-DASHBOARD
               WHEN OTHER
                   DISPLAY '{ "status": "ERROR", '
                       '"message": "Unknown operation: '
                       FUNCTION TRIM(WS-OPERATION)
                       '" }'
           END-EVALUATE.

       FIND-ACCOUNT.
           MOVE 0 TO WS-FOUND
           MOVE 0 TO WS-FOUND-IDX
           PERFORM VARYING WS-ACCT-IDX FROM 1 BY 1
               UNTIL WS-ACCT-IDX > WS-ACCT-COUNT
               IF WS-ACCT-ID(WS-ACCT-IDX) =
                   WS-ACCOUNT-ID
                   AND WS-ACCT-ACTIVE(WS-ACCT-IDX) = 1
                   MOVE 1 TO WS-FOUND
                   MOVE WS-ACCT-IDX TO WS-FOUND-IDX
               END-IF
           END-PERFORM.

       FIND-ACCOUNT-ANY.
           MOVE 0 TO WS-FOUND
           MOVE 0 TO WS-FOUND-IDX
           PERFORM VARYING WS-ACCT-IDX FROM 1 BY 1
               UNTIL WS-ACCT-IDX > WS-ACCT-COUNT
               IF WS-ACCT-ID(WS-ACCT-IDX) =
                   WS-ACCOUNT-ID
                   MOVE 1 TO WS-FOUND
                   MOVE WS-ACCT-IDX TO WS-FOUND-IDX
               END-IF
           END-PERFORM.

       RECORD-TRANSACTION.
           ADD 1 TO WS-TXN-COUNT
           MOVE WS-TXN-COUNT TO WS-TXN-ID(WS-TXN-COUNT)
           MOVE WS-ACCOUNT-ID
               TO WS-TXN-ACCT-ID(WS-TXN-COUNT)
           MOVE WS-CURRENT-DATE-TIME
               TO WS-TXN-TIMESTAMP(WS-TXN-COUNT).

       OP-CREATE-ACCOUNT.
           MOVE FUNCTION TRIM(WS-FIELD1) TO WS-ACCOUNT-ID
           MOVE FUNCTION TRIM(WS-FIELD2) TO WS-ACCOUNT-NAME
           MOVE FUNCTION TRIM(WS-FIELD3) TO WS-ACCOUNT-TYPE

           IF WS-ACCOUNT-ID = SPACES
               DISPLAY '{ "status": "ERROR", '
                   '"message": "Account ID is required" }'
           ELSE
               PERFORM FIND-ACCOUNT-ANY
               IF WS-FOUND = 1
                   DISPLAY '{ "status": "ERROR", '
                       '"message": "Account already exists: '
                       FUNCTION TRIM(WS-ACCOUNT-ID)
                       '" }'
               ELSE
                   ADD 1 TO WS-ACCT-COUNT
                   MOVE WS-ACCOUNT-ID
                       TO WS-ACCT-ID(WS-ACCT-COUNT)
                   MOVE WS-ACCOUNT-NAME
                       TO WS-ACCT-NAME(WS-ACCT-COUNT)
                   IF WS-FIELD4 NOT = SPACES
                       COMPUTE WS-ACCOUNT-BALANCE =
                           FUNCTION NUMVAL(
                               FUNCTION TRIM(WS-FIELD4))
                   ELSE
                       MOVE 0 TO WS-ACCOUNT-BALANCE
                   END-IF
                   MOVE WS-ACCOUNT-BALANCE
                       TO WS-ACCT-BALANCE(WS-ACCT-COUNT)
                   IF WS-ACCOUNT-TYPE = SPACES
                       MOVE "CHECKING"
                           TO WS-ACCT-TYPE(WS-ACCT-COUNT)
                   ELSE
                       MOVE WS-ACCOUNT-TYPE
                           TO WS-ACCT-TYPE(WS-ACCT-COUNT)
                   END-IF
                   MOVE 1 TO WS-ACCT-ACTIVE(WS-ACCT-COUNT)
                   MOVE WS-CURRENT-DATE-TIME
                       TO WS-ACCT-CREATED(WS-ACCT-COUNT)

                   IF WS-ACCOUNT-BALANCE > 0
                       MOVE "INITIAL_DEPOSIT"
                           TO WS-TXN-TYPE(WS-TXN-COUNT + 1)
                       MOVE WS-ACCOUNT-BALANCE
                           TO WS-TXN-AMOUNT(
                               WS-TXN-COUNT + 1)
                       MOVE WS-ACCOUNT-BALANCE
                           TO WS-TXN-BALANCE-AF(
                               WS-TXN-COUNT + 1)
                       MOVE "Account opening deposit"
                           TO WS-TXN-DESC(WS-TXN-COUNT + 1)
                       MOVE SPACES
                           TO WS-TXN-REF(WS-TXN-COUNT + 1)
                       PERFORM RECORD-TRANSACTION
                   END-IF

                   MOVE WS-ACCT-BALANCE(WS-ACCT-COUNT)
                       TO WS-DISPLAY-BAL
                   DISPLAY '{ "status": "OK", '
                       '"message": "Account created", '
                       '"account_id": "'
                       FUNCTION TRIM(WS-ACCOUNT-ID)
                       '", "name": "'
                       FUNCTION TRIM(WS-ACCOUNT-NAME)
                       '", "type": "'
                       FUNCTION TRIM(
                           WS-ACCT-TYPE(WS-ACCT-COUNT))
                       '", "balance": '
                       FUNCTION TRIM(WS-DISPLAY-BAL)
                       ' }'
               END-IF
           END-IF.

       OP-DELETE-ACCOUNT.
           MOVE FUNCTION TRIM(WS-FIELD1) TO WS-ACCOUNT-ID

           IF WS-ACCOUNT-ID = SPACES
               DISPLAY '{ "status": "ERROR", '
                   '"message": "Account ID is required" }'
           ELSE
               PERFORM FIND-ACCOUNT
               IF WS-FOUND = 0
                   DISPLAY '{ "status": "ERROR", '
                       '"message": "Account not found: '
                       FUNCTION TRIM(WS-ACCOUNT-ID)
                       '" }'
               ELSE
                   MOVE 0 TO
                       WS-ACCT-ACTIVE(WS-FOUND-IDX)
                   MOVE "ACCOUNT_CLOSED"
                       TO WS-TXN-TYPE(WS-TXN-COUNT + 1)
                   MOVE 0
                       TO WS-TXN-AMOUNT(WS-TXN-COUNT + 1)
                   MOVE 0
                       TO WS-TXN-BALANCE-AF(
                           WS-TXN-COUNT + 1)
                   MOVE "Account closed"
                       TO WS-TXN-DESC(WS-TXN-COUNT + 1)
                   MOVE SPACES
                       TO WS-TXN-REF(WS-TXN-COUNT + 1)
                   PERFORM RECORD-TRANSACTION

                   DISPLAY '{ "status": "OK", '
                       '"message": "Account deleted: '
                       FUNCTION TRIM(WS-ACCOUNT-ID)
                       '" }'
               END-IF
           END-IF.

       OP-UPDATE-ACCOUNT.
           MOVE FUNCTION TRIM(WS-FIELD1) TO WS-ACCOUNT-ID
           MOVE FUNCTION TRIM(WS-FIELD2) TO WS-NEW-NAME

           IF WS-ACCOUNT-ID = SPACES
               DISPLAY '{ "status": "ERROR", '
                   '"message": "Account ID is required" }'
           ELSE IF WS-NEW-NAME = SPACES
               DISPLAY '{ "status": "ERROR", '
                   '"message": "New name is required" }'
           ELSE
               PERFORM FIND-ACCOUNT
               IF WS-FOUND = 0
                   DISPLAY '{ "status": "ERROR", '
                       '"message": "Account not found: '
                       FUNCTION TRIM(WS-ACCOUNT-ID)
                       '" }'
               ELSE
                   MOVE WS-NEW-NAME
                       TO WS-ACCT-NAME(WS-FOUND-IDX)
                   DISPLAY '{ "status": "OK", '
                       '"message": "Account updated", '
                       '"account_id": "'
                       FUNCTION TRIM(WS-ACCOUNT-ID)
                       '", "name": "'
                       FUNCTION TRIM(WS-NEW-NAME)
                       '" }'
               END-IF
           END-IF.

       OP-CHECK-ACCOUNT.
           MOVE FUNCTION TRIM(WS-FIELD1) TO WS-ACCOUNT-ID

           IF WS-ACCOUNT-ID = SPACES
               DISPLAY '{ "status": "ERROR", '
                   '"message": "Account ID is required" }'
           ELSE
               PERFORM FIND-ACCOUNT
               IF WS-FOUND = 1
                   MOVE WS-ACCT-BALANCE(WS-FOUND-IDX)
                       TO WS-DISPLAY-BAL
                   DISPLAY '{ "status": "OK", '
                       '"message": "Account found", '
                       '"account_id": "'
                       FUNCTION TRIM(WS-ACCOUNT-ID)
                       '", "name": "'
                       FUNCTION TRIM(
                           WS-ACCT-NAME(WS-FOUND-IDX))
                       '", "type": "'
                       FUNCTION TRIM(
                           WS-ACCT-TYPE(WS-FOUND-IDX))
                       '", "balance": '
                       FUNCTION TRIM(WS-DISPLAY-BAL)
                       ', "active": '
                       WS-ACCT-ACTIVE(WS-FOUND-IDX)
                       ', "created": "'
                       FUNCTION TRIM(
                           WS-ACCT-CREATED(WS-FOUND-IDX))
                       '" }'
               ELSE
                   DISPLAY '{ "status": "NOT_FOUND", '
                       '"message": "Account not found: '
                       FUNCTION TRIM(WS-ACCOUNT-ID)
                       '" }'
               END-IF
           END-IF.

       OP-LIST-ACCOUNTS.
           MOVE 0 TO WS-LIST-COUNT
           MOVE 1 TO WS-FIRST-ITEM
           DISPLAY '{ "status": "OK", "accounts": ['
           PERFORM VARYING WS-ACCT-IDX FROM 1 BY 1
               UNTIL WS-ACCT-IDX > WS-ACCT-COUNT
               IF WS-ACCT-ACTIVE(WS-ACCT-IDX) = 1
                   ADD 1 TO WS-LIST-COUNT
                   MOVE WS-ACCT-BALANCE(WS-ACCT-IDX)
                       TO WS-DISPLAY-BAL
                   IF WS-FIRST-ITEM = 1
                       MOVE 0 TO WS-FIRST-ITEM
                       DISPLAY '{ "account_id": "'
                           FUNCTION TRIM(
                               WS-ACCT-ID(WS-ACCT-IDX))
                           '", "name": "'
                           FUNCTION TRIM(
                               WS-ACCT-NAME(WS-ACCT-IDX))
                           '", "type": "'
                           FUNCTION TRIM(
                               WS-ACCT-TYPE(WS-ACCT-IDX))
                           '", "balance": '
                           FUNCTION TRIM(WS-DISPLAY-BAL)
                           ' }'
                   ELSE
                       DISPLAY ', { "account_id": "'
                           FUNCTION TRIM(
                               WS-ACCT-ID(WS-ACCT-IDX))
                           '", "name": "'
                           FUNCTION TRIM(
                               WS-ACCT-NAME(WS-ACCT-IDX))
                           '", "type": "'
                           FUNCTION TRIM(
                               WS-ACCT-TYPE(WS-ACCT-IDX))
                           '", "balance": '
                           FUNCTION TRIM(WS-DISPLAY-BAL)
                           ' }'
                   END-IF
               END-IF
           END-PERFORM
           DISPLAY '], "count": ' WS-LIST-COUNT ' }'.

       OP-DEPOSIT.
           MOVE FUNCTION TRIM(WS-FIELD1) TO WS-ACCOUNT-ID

           IF WS-ACCOUNT-ID = SPACES
               DISPLAY '{ "status": "ERROR", '
                   '"message": "Account ID is required" }'
           ELSE IF WS-FIELD2 = SPACES
               DISPLAY '{ "status": "ERROR", '
                   '"message": "Amount is required" }'
           ELSE
               COMPUTE WS-AMOUNT =
                   FUNCTION NUMVAL(
                       FUNCTION TRIM(WS-FIELD2))
               IF WS-AMOUNT <= 0
                   DISPLAY '{ "status": "ERROR", '
                       '"message": "Amount must be positive"}'
               ELSE
                   PERFORM FIND-ACCOUNT
                   IF WS-FOUND = 0
                       DISPLAY '{ "status": "ERROR", '
                           '"message": "Account not found: '
                           FUNCTION TRIM(WS-ACCOUNT-ID)
                           '" }'
                   ELSE
                       ADD WS-AMOUNT TO
                           WS-ACCT-BALANCE(WS-FOUND-IDX)
                       MOVE "DEPOSIT"
                           TO WS-TXN-TYPE(
                               WS-TXN-COUNT + 1)
                       MOVE WS-AMOUNT
                           TO WS-TXN-AMOUNT(
                               WS-TXN-COUNT + 1)
                       MOVE WS-ACCT-BALANCE(WS-FOUND-IDX)
                           TO WS-TXN-BALANCE-AF(
                               WS-TXN-COUNT + 1)
                       MOVE "Cash deposit"
                           TO WS-TXN-DESC(
                               WS-TXN-COUNT + 1)
                       MOVE SPACES
                           TO WS-TXN-REF(
                               WS-TXN-COUNT + 1)
                       PERFORM RECORD-TRANSACTION

                       MOVE WS-ACCT-BALANCE(WS-FOUND-IDX)
                           TO WS-DISPLAY-BAL
                       MOVE WS-AMOUNT TO WS-DISPLAY-AMT
                       DISPLAY '{ "status": "OK", '
                           '"message": "Deposit successful",'
                           ' "account_id": "'
                           FUNCTION TRIM(WS-ACCOUNT-ID)
                           '", "deposited": '
                           FUNCTION TRIM(WS-DISPLAY-AMT)
                           ', "new_balance": '
                           FUNCTION TRIM(WS-DISPLAY-BAL)
                           ' }'
                   END-IF
               END-IF
           END-IF.

       OP-WITHDRAW.
           MOVE FUNCTION TRIM(WS-FIELD1) TO WS-ACCOUNT-ID

           IF WS-ACCOUNT-ID = SPACES
               DISPLAY '{ "status": "ERROR", '
                   '"message": "Account ID is required" }'
           ELSE IF WS-FIELD2 = SPACES
               DISPLAY '{ "status": "ERROR", '
                   '"message": "Amount is required" }'
           ELSE
               COMPUTE WS-AMOUNT =
                   FUNCTION NUMVAL(
                       FUNCTION TRIM(WS-FIELD2))
               IF WS-AMOUNT <= 0
                   DISPLAY '{ "status": "ERROR", '
                       '"message": "Amount must be positive"}'
               ELSE
                   PERFORM FIND-ACCOUNT
                   IF WS-FOUND = 0
                       DISPLAY '{ "status": "ERROR", '
                           '"message": "Account not found: '
                           FUNCTION TRIM(WS-ACCOUNT-ID)
                           '" }'
                   ELSE
                       IF WS-ACCT-BALANCE(WS-FOUND-IDX) <
                           WS-AMOUNT
                           DISPLAY '{ "status": "ERROR", '
                               '"message":'
                               ' "Insufficient funds" }'
                       ELSE
                           SUBTRACT WS-AMOUNT FROM
                               WS-ACCT-BALANCE(WS-FOUND-IDX)
                           MOVE "WITHDRAWAL"
                               TO WS-TXN-TYPE(
                                   WS-TXN-COUNT + 1)
                           MOVE WS-AMOUNT
                               TO WS-TXN-AMOUNT(
                                   WS-TXN-COUNT + 1)
                           MOVE WS-ACCT-BALANCE(WS-FOUND-IDX)
                               TO WS-TXN-BALANCE-AF(
                                   WS-TXN-COUNT + 1)
                           MOVE "Cash withdrawal"
                               TO WS-TXN-DESC(
                                   WS-TXN-COUNT + 1)
                           MOVE SPACES
                               TO WS-TXN-REF(
                                   WS-TXN-COUNT + 1)
                           PERFORM RECORD-TRANSACTION

                           MOVE WS-ACCT-BALANCE(WS-FOUND-IDX)
                               TO WS-DISPLAY-BAL
                           MOVE WS-AMOUNT TO WS-DISPLAY-AMT
                           DISPLAY '{ "status": "OK", '
                               '"message":'
                               ' "Withdrawal successful", '
                               '"account_id": "'
                               FUNCTION TRIM(WS-ACCOUNT-ID)
                               '", "withdrawn": '
                               FUNCTION TRIM(WS-DISPLAY-AMT)
                               ', "new_balance": '
                               FUNCTION TRIM(WS-DISPLAY-BAL)
                               ' }'
                       END-IF
                   END-IF
               END-IF
           END-IF.

       OP-TRANSFER.
           MOVE FUNCTION TRIM(WS-FIELD1) TO WS-FROM-ACCOUNT
           MOVE FUNCTION TRIM(WS-FIELD2) TO WS-TO-ACCOUNT

           IF WS-FROM-ACCOUNT = SPACES OR
               WS-TO-ACCOUNT = SPACES
               DISPLAY '{ "status": "ERROR", '
                   '"message": "Both account IDs required" }'
           ELSE IF WS-FIELD3 = SPACES
               DISPLAY '{ "status": "ERROR", '
                   '"message": "Amount is required" }'
           ELSE
               COMPUTE WS-AMOUNT =
                   FUNCTION NUMVAL(
                       FUNCTION TRIM(WS-FIELD3))
               IF WS-AMOUNT <= 0
                   DISPLAY '{ "status": "ERROR", '
                       '"message": "Amount must be positive"}'
               ELSE IF WS-FROM-ACCOUNT = WS-TO-ACCOUNT
                   DISPLAY '{ "status": "ERROR", '
                       '"message": "Cannot transfer to '
                       'same account" }'
               ELSE
                   MOVE WS-FROM-ACCOUNT TO WS-ACCOUNT-ID
                   PERFORM FIND-ACCOUNT
                   IF WS-FOUND = 0
                       DISPLAY '{ "status": "ERROR", '
                           '"message": "Source not found: '
                           FUNCTION TRIM(WS-FROM-ACCOUNT)
                           '" }'
                   ELSE
                       MOVE WS-FOUND-IDX TO WS-FOUND2-IDX
                       IF WS-ACCT-BALANCE(WS-FOUND2-IDX)
                           < WS-AMOUNT
                           DISPLAY '{ "status": "ERROR", '
                               '"message":'
                               ' "Insufficient funds" }'
                       ELSE
                           MOVE WS-TO-ACCOUNT
                               TO WS-ACCOUNT-ID
                           PERFORM FIND-ACCOUNT
                           IF WS-FOUND = 0
                               DISPLAY '{ "status": '
                                   '"ERROR", '
                                   '"message": '
                                   '"Dest not found: '
                                   FUNCTION TRIM(
                                       WS-TO-ACCOUNT)
                                   '" }'
                           ELSE
                               SUBTRACT WS-AMOUNT FROM
                                   WS-ACCT-BALANCE(
                                       WS-FOUND2-IDX)
                               ADD WS-AMOUNT TO
                                   WS-ACCT-BALANCE(
                                       WS-FOUND-IDX)

                               MOVE WS-FROM-ACCOUNT
                                   TO WS-ACCOUNT-ID
                               MOVE "TRANSFER_OUT"
                                   TO WS-TXN-TYPE(
                                       WS-TXN-COUNT + 1)
                               MOVE WS-AMOUNT
                                   TO WS-TXN-AMOUNT(
                                       WS-TXN-COUNT + 1)
                               MOVE WS-ACCT-BALANCE(
                                   WS-FOUND2-IDX)
                                   TO WS-TXN-BALANCE-AF(
                                       WS-TXN-COUNT + 1)
                               STRING "Transfer to "
                                   FUNCTION TRIM(
                                       WS-TO-ACCOUNT)
                                   DELIMITED BY SIZE
                                   INTO WS-TXN-DESC(
                                       WS-TXN-COUNT + 1)
                               MOVE WS-TO-ACCOUNT
                                   TO WS-TXN-REF(
                                       WS-TXN-COUNT + 1)
                               PERFORM RECORD-TRANSACTION

                               MOVE WS-TO-ACCOUNT
                                   TO WS-ACCOUNT-ID
                               MOVE "TRANSFER_IN"
                                   TO WS-TXN-TYPE(
                                       WS-TXN-COUNT + 1)
                               MOVE WS-AMOUNT
                                   TO WS-TXN-AMOUNT(
                                       WS-TXN-COUNT + 1)
                               MOVE WS-ACCT-BALANCE(
                                   WS-FOUND-IDX)
                                   TO WS-TXN-BALANCE-AF(
                                       WS-TXN-COUNT + 1)
                               STRING "Transfer from "
                                   FUNCTION TRIM(
                                       WS-FROM-ACCOUNT)
                                   DELIMITED BY SIZE
                                   INTO WS-TXN-DESC(
                                       WS-TXN-COUNT + 1)
                               MOVE WS-FROM-ACCOUNT
                                   TO WS-TXN-REF(
                                       WS-TXN-COUNT + 1)
                               PERFORM RECORD-TRANSACTION

                               MOVE WS-AMOUNT
                                   TO WS-DISPLAY-AMT
                               DISPLAY '{ "status": "OK",'
                                   ' "message":'
                                   ' "Transfer successful",'
                                   ' "from": "'
                                   FUNCTION TRIM(
                                       WS-FROM-ACCOUNT)
                                   '", "to": "'
                                   FUNCTION TRIM(
                                       WS-TO-ACCOUNT)
                                   '", "amount": '
                                   FUNCTION TRIM(
                                       WS-DISPLAY-AMT)
                                   ' }'
                           END-IF
                       END-IF
                   END-IF
               END-IF
           END-IF.

       OP-CREATE-LOAN.
           MOVE FUNCTION TRIM(WS-FIELD1) TO WS-ACCOUNT-ID
           MOVE FUNCTION TRIM(WS-FIELD2) TO WS-LOAN-ID-INPUT

           IF WS-ACCOUNT-ID = SPACES
               DISPLAY '{ "status": "ERROR", '
                   '"message": "Account ID is required" }'
           ELSE IF WS-LOAN-ID-INPUT = SPACES
               DISPLAY '{ "status": "ERROR", '
                   '"message": "Loan ID is required" }'
           ELSE IF WS-FIELD3 = SPACES
               DISPLAY '{ "status": "ERROR", '
                   '"message": "Principal is required" }'
           ELSE
               PERFORM FIND-ACCOUNT
               IF WS-FOUND = 0
                   DISPLAY '{ "status": "ERROR", '
                       '"message": "Account not found: '
                       FUNCTION TRIM(WS-ACCOUNT-ID)
                       '" }'
               ELSE
                   MOVE 0 TO WS-LOAN-FOUND
                   PERFORM VARYING WS-LOAN-IDX FROM 1 BY 1
                       UNTIL WS-LOAN-IDX > WS-LOAN-COUNT
                       IF WS-LOAN-ID(WS-LOAN-IDX) =
                           WS-LOAN-ID-INPUT
                           MOVE 1 TO WS-LOAN-FOUND
                       END-IF
                   END-PERFORM

                   IF WS-LOAN-FOUND = 1
                       DISPLAY '{ "status": "ERROR", '
                           '"message": "Loan exists: '
                           FUNCTION TRIM(WS-LOAN-ID-INPUT)
                           '" }'
                   ELSE
                       ADD 1 TO WS-LOAN-COUNT
                       MOVE WS-LOAN-ID-INPUT
                           TO WS-LOAN-ID(WS-LOAN-COUNT)
                       MOVE WS-ACCOUNT-ID
                           TO WS-LOAN-ACCT-ID(
                               WS-LOAN-COUNT)
                       COMPUTE WS-LOAN-PRINCIPAL(
                           WS-LOAN-COUNT) =
                           FUNCTION NUMVAL(
                               FUNCTION TRIM(WS-FIELD3))
                       IF WS-FIELD4 NOT = SPACES
                           COMPUTE WS-LOAN-RATE(
                               WS-LOAN-COUNT) =
                               FUNCTION NUMVAL(
                                   FUNCTION TRIM(WS-FIELD4))
                       ELSE
                           MOVE 5.00
                               TO WS-LOAN-RATE(
                                   WS-LOAN-COUNT)
                       END-IF
                       IF WS-FIELD5 NOT = SPACES
                           COMPUTE WS-LOAN-TERM(
                               WS-LOAN-COUNT) =
                               FUNCTION NUMVAL(
                                   FUNCTION TRIM(WS-FIELD5))
                       ELSE
                           MOVE 12
                               TO WS-LOAN-TERM(
                                   WS-LOAN-COUNT)
                       END-IF
                       MOVE WS-LOAN-PRINCIPAL(WS-LOAN-COUNT)
                           TO WS-LOAN-REMAINING(
                               WS-LOAN-COUNT)
                       COMPUTE WS-MONTHLY-RATE =
                           WS-LOAN-RATE(WS-LOAN-COUNT)
                           / 100 / 12
                       IF WS-MONTHLY-RATE > 0
                           COMPUTE WS-LOAN-MONTHLY(
                               WS-LOAN-COUNT) =
                               WS-LOAN-PRINCIPAL(
                                   WS-LOAN-COUNT) *
                               WS-MONTHLY-RATE /
                               (1 - (1 /
                               (1 + WS-MONTHLY-RATE) **
                               WS-LOAN-TERM(
                                   WS-LOAN-COUNT)))
                       ELSE
                           COMPUTE WS-LOAN-MONTHLY(
                               WS-LOAN-COUNT) =
                               WS-LOAN-PRINCIPAL(
                                   WS-LOAN-COUNT) /
                               WS-LOAN-TERM(WS-LOAN-COUNT)
                       END-IF
                       MOVE "ACTIVE"
                           TO WS-LOAN-STATUS(WS-LOAN-COUNT)
                       MOVE WS-CURRENT-DATE-TIME
                           TO WS-LOAN-CREATED(
                               WS-LOAN-COUNT)

                       ADD WS-LOAN-PRINCIPAL(WS-LOAN-COUNT)
                           TO WS-ACCT-BALANCE(WS-FOUND-IDX)

                       MOVE "LOAN_DISBURSEMENT"
                           TO WS-TXN-TYPE(
                               WS-TXN-COUNT + 1)
                       MOVE WS-LOAN-PRINCIPAL(WS-LOAN-COUNT)
                           TO WS-TXN-AMOUNT(
                               WS-TXN-COUNT + 1)
                       MOVE WS-ACCT-BALANCE(WS-FOUND-IDX)
                           TO WS-TXN-BALANCE-AF(
                               WS-TXN-COUNT + 1)
                       STRING "Loan disbursement: "
                           FUNCTION TRIM(WS-LOAN-ID-INPUT)
                           DELIMITED BY SIZE
                           INTO WS-TXN-DESC(
                               WS-TXN-COUNT + 1)
                       MOVE WS-LOAN-ID-INPUT
                           TO WS-TXN-REF(
                               WS-TXN-COUNT + 1)
                       PERFORM RECORD-TRANSACTION

                       MOVE WS-LOAN-PRINCIPAL(WS-LOAN-COUNT)
                           TO WS-DISPLAY-AMT
                       MOVE WS-LOAN-MONTHLY(WS-LOAN-COUNT)
                           TO WS-DISPLAY-BAL
                       DISPLAY '{ "status": "OK", '
                           '"message": "Loan created", '
                           '"loan_id": "'
                           FUNCTION TRIM(WS-LOAN-ID-INPUT)
                           '", "account_id": "'
                           FUNCTION TRIM(WS-ACCOUNT-ID)
                           '", "principal": '
                           FUNCTION TRIM(WS-DISPLAY-AMT)
                           ', "rate": '
                           WS-LOAN-RATE(WS-LOAN-COUNT)
                           ', "term_months": '
                           WS-LOAN-TERM(WS-LOAN-COUNT)
                           ', "monthly_payment": '
                           FUNCTION TRIM(WS-DISPLAY-BAL)
                           ' }'
                   END-IF
               END-IF
           END-IF.

       OP-PAY-LOAN.
           MOVE FUNCTION TRIM(WS-FIELD1) TO WS-ACCOUNT-ID
           MOVE FUNCTION TRIM(WS-FIELD2) TO WS-LOAN-ID-INPUT

           IF WS-ACCOUNT-ID = SPACES
               DISPLAY '{ "status": "ERROR", '
                   '"message": "Account ID is required" }'
           ELSE IF WS-LOAN-ID-INPUT = SPACES
               DISPLAY '{ "status": "ERROR", '
                   '"message": "Loan ID is required" }'
           ELSE
               PERFORM FIND-ACCOUNT
               IF WS-FOUND = 0
                   DISPLAY '{ "status": "ERROR", '
                       '"message": "Account not found: '
                       FUNCTION TRIM(WS-ACCOUNT-ID)
                       '" }'
               ELSE
                   MOVE WS-FOUND-IDX TO WS-FOUND2-IDX
                   MOVE 0 TO WS-LOAN-FOUND
                   MOVE 0 TO WS-LOAN-FOUND-IDX
                   PERFORM VARYING WS-LOAN-IDX FROM 1 BY 1
                       UNTIL WS-LOAN-IDX > WS-LOAN-COUNT
                       IF WS-LOAN-ID(WS-LOAN-IDX) =
                           WS-LOAN-ID-INPUT
                           MOVE 1 TO WS-LOAN-FOUND
                           MOVE WS-LOAN-IDX
                               TO WS-LOAN-FOUND-IDX
                       END-IF
                   END-PERFORM

                   IF WS-LOAN-FOUND = 0
                       DISPLAY '{ "status": "ERROR", '
                           '"message": "Loan not found: '
                           FUNCTION TRIM(WS-LOAN-ID-INPUT)
                           '" }'
                   ELSE IF WS-LOAN-STATUS(
                       WS-LOAN-FOUND-IDX) = "PAID"
                       DISPLAY '{ "status": "ERROR", '
                           '"message": "Loan already '
                           'fully paid" }'
                   ELSE
                       IF WS-FIELD3 NOT = SPACES
                           COMPUTE WS-AMOUNT =
                               FUNCTION NUMVAL(
                                   FUNCTION TRIM(WS-FIELD3))
                       ELSE
                           MOVE WS-LOAN-MONTHLY(
                               WS-LOAN-FOUND-IDX)
                               TO WS-AMOUNT
                       END-IF

                       IF WS-AMOUNT > WS-LOAN-REMAINING(
                           WS-LOAN-FOUND-IDX)
                           MOVE WS-LOAN-REMAINING(
                               WS-LOAN-FOUND-IDX)
                               TO WS-AMOUNT
                       END-IF

                       IF WS-ACCT-BALANCE(WS-FOUND2-IDX)
                           < WS-AMOUNT
                           DISPLAY '{ "status": "ERROR", '
                               '"message":'
                               ' "Insufficient funds for'
                               ' loan payment" }'
                       ELSE
                           SUBTRACT WS-AMOUNT FROM
                               WS-ACCT-BALANCE(
                                   WS-FOUND2-IDX)
                           SUBTRACT WS-AMOUNT FROM
                               WS-LOAN-REMAINING(
                                   WS-LOAN-FOUND-IDX)

                           IF WS-LOAN-REMAINING(
                               WS-LOAN-FOUND-IDX) <= 0
                               MOVE 0 TO WS-LOAN-REMAINING(
                                   WS-LOAN-FOUND-IDX)
                               MOVE "PAID"
                                   TO WS-LOAN-STATUS(
                                       WS-LOAN-FOUND-IDX)
                           END-IF

                           MOVE "LOAN_PAYMENT"
                               TO WS-TXN-TYPE(
                                   WS-TXN-COUNT + 1)
                           MOVE WS-AMOUNT
                               TO WS-TXN-AMOUNT(
                                   WS-TXN-COUNT + 1)
                           MOVE WS-ACCT-BALANCE(
                               WS-FOUND2-IDX)
                               TO WS-TXN-BALANCE-AF(
                                   WS-TXN-COUNT + 1)
                           STRING "Loan payment: "
                               FUNCTION TRIM(
                                   WS-LOAN-ID-INPUT)
                               DELIMITED BY SIZE
                               INTO WS-TXN-DESC(
                                   WS-TXN-COUNT + 1)
                           MOVE WS-LOAN-ID-INPUT
                               TO WS-TXN-REF(
                                   WS-TXN-COUNT + 1)
                           PERFORM RECORD-TRANSACTION

                           MOVE WS-AMOUNT
                               TO WS-DISPLAY-AMT
                           MOVE WS-LOAN-REMAINING(
                               WS-LOAN-FOUND-IDX)
                               TO WS-DISPLAY-BAL
                           DISPLAY '{ "status": "OK", '
                               '"message":'
                               ' "Payment successful", '
                               '"loan_id": "'
                               FUNCTION TRIM(
                                   WS-LOAN-ID-INPUT)
                               '", "paid": '
                               FUNCTION TRIM(WS-DISPLAY-AMT)
                               ', "remaining": '
                               FUNCTION TRIM(WS-DISPLAY-BAL)
                               ', "loan_status": "'
                               FUNCTION TRIM(
                                   WS-LOAN-STATUS(
                                       WS-LOAN-FOUND-IDX))
                               '" }'
                       END-IF
                   END-IF
               END-IF
           END-IF.

       OP-CHECK-LOAN.
           MOVE FUNCTION TRIM(WS-FIELD1) TO WS-LOAN-ID-INPUT

           IF WS-LOAN-ID-INPUT = SPACES
               DISPLAY '{ "status": "ERROR", '
                   '"message": "Loan ID is required" }'
           ELSE
               MOVE 0 TO WS-LOAN-FOUND
               MOVE 0 TO WS-LOAN-FOUND-IDX
               PERFORM VARYING WS-LOAN-IDX FROM 1 BY 1
                   UNTIL WS-LOAN-IDX > WS-LOAN-COUNT
                   IF WS-LOAN-ID(WS-LOAN-IDX) =
                       WS-LOAN-ID-INPUT
                       MOVE 1 TO WS-LOAN-FOUND
                       MOVE WS-LOAN-IDX
                           TO WS-LOAN-FOUND-IDX
                   END-IF
               END-PERFORM

               IF WS-LOAN-FOUND = 0
                   DISPLAY '{ "status": "NOT_FOUND", '
                       '"message": "Loan not found: '
                       FUNCTION TRIM(WS-LOAN-ID-INPUT)
                       '" }'
               ELSE
                   MOVE WS-LOAN-PRINCIPAL(WS-LOAN-FOUND-IDX)
                       TO WS-DISPLAY-AMT
                   MOVE WS-LOAN-REMAINING(WS-LOAN-FOUND-IDX)
                       TO WS-DISPLAY-BAL
                   DISPLAY '{ "status": "OK", '
                       '"loan_id": "'
                       FUNCTION TRIM(WS-LOAN-ID-INPUT)
                       '", "account_id": "'
                       FUNCTION TRIM(
                           WS-LOAN-ACCT-ID(
                               WS-LOAN-FOUND-IDX))
                       '", "principal": '
                       FUNCTION TRIM(WS-DISPLAY-AMT)
                       ', "rate": '
                       WS-LOAN-RATE(WS-LOAN-FOUND-IDX)
                       ', "term_months": '
                       WS-LOAN-TERM(WS-LOAN-FOUND-IDX)
                       ', "remaining": '
                       FUNCTION TRIM(WS-DISPLAY-BAL)
                       ', "status": "'
                       FUNCTION TRIM(
                           WS-LOAN-STATUS(
                               WS-LOAN-FOUND-IDX))
                       '" }'
               END-IF
           END-IF.

       OP-LIST-LOANS.
           MOVE FUNCTION TRIM(WS-FIELD1) TO WS-ACCOUNT-ID
           MOVE 0 TO WS-LIST-COUNT
           MOVE 1 TO WS-FIRST-ITEM

           IF WS-ACCOUNT-ID = SPACES
               DISPLAY '{ "status": "OK", "loans": ['
               PERFORM VARYING WS-LOAN-IDX FROM 1 BY 1
                   UNTIL WS-LOAN-IDX > WS-LOAN-COUNT
                   ADD 1 TO WS-LIST-COUNT
                   MOVE WS-LOAN-REMAINING(WS-LOAN-IDX)
                       TO WS-DISPLAY-BAL
                   MOVE WS-LOAN-PRINCIPAL(WS-LOAN-IDX)
                       TO WS-DISPLAY-AMT
                   IF WS-FIRST-ITEM = 1
                       MOVE 0 TO WS-FIRST-ITEM
                       DISPLAY '{ "loan_id": "'
                           FUNCTION TRIM(
                               WS-LOAN-ID(WS-LOAN-IDX))
                           '", "account_id": "'
                           FUNCTION TRIM(
                               WS-LOAN-ACCT-ID(
                                   WS-LOAN-IDX))
                           '", "principal": '
                           FUNCTION TRIM(WS-DISPLAY-AMT)
                           ', "remaining": '
                           FUNCTION TRIM(WS-DISPLAY-BAL)
                           ', "status": "'
                           FUNCTION TRIM(
                               WS-LOAN-STATUS(WS-LOAN-IDX))
                           '" }'
                   ELSE
                       DISPLAY ', { "loan_id": "'
                           FUNCTION TRIM(
                               WS-LOAN-ID(WS-LOAN-IDX))
                           '", "account_id": "'
                           FUNCTION TRIM(
                               WS-LOAN-ACCT-ID(
                                   WS-LOAN-IDX))
                           '", "principal": '
                           FUNCTION TRIM(WS-DISPLAY-AMT)
                           ', "remaining": '
                           FUNCTION TRIM(WS-DISPLAY-BAL)
                           ', "status": "'
                           FUNCTION TRIM(
                               WS-LOAN-STATUS(WS-LOAN-IDX))
                           '" }'
                   END-IF
               END-PERFORM
               DISPLAY '], "count": ' WS-LIST-COUNT ' }'
           ELSE
               PERFORM FIND-ACCOUNT
               IF WS-FOUND = 0
                   DISPLAY '{ "status": "ERROR", '
                       '"message": "Account not found: '
                       FUNCTION TRIM(WS-ACCOUNT-ID)
                       '" }'
               ELSE
                   DISPLAY '{ "status": "OK", "loans": ['
                   PERFORM VARYING WS-LOAN-IDX FROM 1 BY 1
                       UNTIL WS-LOAN-IDX > WS-LOAN-COUNT
                       IF WS-LOAN-ACCT-ID(WS-LOAN-IDX) =
                           WS-ACCOUNT-ID
                           ADD 1 TO WS-LIST-COUNT
                           MOVE WS-LOAN-REMAINING(
                               WS-LOAN-IDX)
                               TO WS-DISPLAY-BAL
                           MOVE WS-LOAN-PRINCIPAL(
                               WS-LOAN-IDX)
                               TO WS-DISPLAY-AMT
                           IF WS-FIRST-ITEM = 1
                               MOVE 0 TO WS-FIRST-ITEM
                               DISPLAY '{ "loan_id": "'
                                   FUNCTION TRIM(
                                       WS-LOAN-ID(
                                           WS-LOAN-IDX))
                                   '", "principal": '
                                   FUNCTION TRIM(
                                       WS-DISPLAY-AMT)
                                   ', "remaining": '
                                   FUNCTION TRIM(
                                       WS-DISPLAY-BAL)
                                   ', "status": "'
                                   FUNCTION TRIM(
                                       WS-LOAN-STATUS(
                                           WS-LOAN-IDX))
                                   '" }'
                           ELSE
                               DISPLAY ', { "loan_id": "'
                                   FUNCTION TRIM(
                                       WS-LOAN-ID(
                                           WS-LOAN-IDX))
                                   '", "principal": '
                                   FUNCTION TRIM(
                                       WS-DISPLAY-AMT)
                                   ', "remaining": '
                                   FUNCTION TRIM(
                                       WS-DISPLAY-BAL)
                                   ', "status": "'
                                   FUNCTION TRIM(
                                       WS-LOAN-STATUS(
                                           WS-LOAN-IDX))
                                   '" }'
                           END-IF
                       END-IF
                   END-PERFORM
                   DISPLAY '], "count": ' WS-LIST-COUNT ' }'
               END-IF
           END-IF.

       OP-CALCULATE-SCORE.
           MOVE FUNCTION TRIM(WS-FIELD1) TO WS-ACCOUNT-ID
           MOVE FUNCTION TRIM(WS-FIELD2) TO WS-ACCOUNT-NAME

           IF WS-ACCOUNT-ID = SPACES
               DISPLAY '{ "status": "ERROR", '
                   '"message": "Account ID is required" }'
           ELSE
               MOVE WS-BASE-SCORE TO WS-SCORE

               IF WS-FIELD3 NOT = SPACES
                   COMPUTE WS-INCOME =
                       FUNCTION NUMVAL(
                           FUNCTION TRIM(WS-FIELD3))
               ELSE
                   MOVE 0 TO WS-INCOME
               END-IF

               IF WS-FIELD4 NOT = SPACES
                   COMPUTE WS-DEBT =
                       FUNCTION NUMVAL(
                           FUNCTION TRIM(WS-FIELD4))
               ELSE
                   MOVE 0 TO WS-DEBT
               END-IF

               IF WS-INCOME > 0
                   EVALUATE TRUE
                       WHEN WS-INCOME >= 100000
                           ADD 200 TO WS-SCORE
                       WHEN WS-INCOME >= 50000
                           ADD 150 TO WS-SCORE
                       WHEN WS-INCOME >= 25000
                           ADD 100 TO WS-SCORE
                       WHEN OTHER
                           ADD 50 TO WS-SCORE
                   END-EVALUATE

                   IF WS-DEBT > 0
                       COMPUTE WS-RATIO =
                           (WS-DEBT / WS-INCOME) * 100
                       EVALUATE TRUE
                           WHEN WS-RATIO > 50
                               SUBTRACT 100 FROM WS-SCORE
                           WHEN WS-RATIO > 30
                               SUBTRACT 50 FROM WS-SCORE
                           WHEN WS-RATIO > 10
                               SUBTRACT 25 FROM WS-SCORE
                       END-EVALUATE
                   END-IF
               END-IF

               MOVE 0 TO WS-TOTAL-LOANS
               PERFORM VARYING WS-LOAN-IDX FROM 1 BY 1
                   UNTIL WS-LOAN-IDX > WS-LOAN-COUNT
                   IF WS-LOAN-ACCT-ID(WS-LOAN-IDX) =
                       WS-ACCOUNT-ID
                       AND WS-LOAN-STATUS(WS-LOAN-IDX) =
                           "ACTIVE"
                       ADD WS-LOAN-REMAINING(WS-LOAN-IDX)
                           TO WS-TOTAL-LOANS
                   END-IF
               END-PERFORM
               IF WS-TOTAL-LOANS > 100000
                   SUBTRACT 50 FROM WS-SCORE
               ELSE IF WS-TOTAL-LOANS > 50000
                   SUBTRACT 25 FROM WS-SCORE
               END-IF

               IF WS-SCORE > 850
                   MOVE 850 TO WS-SCORE
               END-IF
               IF WS-SCORE < 100
                   MOVE 100 TO WS-SCORE
               END-IF

               DISPLAY '{ "status": "OK", '
                   '"account": "'
                   FUNCTION TRIM(WS-ACCOUNT-ID)
                   '", "score": ' WS-SCORE
                   ', "message": "Score calculated" }'
           END-IF.

       OP-TRANSACTION-HISTORY.
           MOVE FUNCTION TRIM(WS-FIELD1) TO WS-ACCOUNT-ID

           IF WS-ACCOUNT-ID = SPACES
               DISPLAY '{ "status": "ERROR", '
                   '"message": "Account ID is required" }'
           ELSE
               PERFORM FIND-ACCOUNT-ANY
               IF WS-FOUND = 0
                   DISPLAY '{ "status": "ERROR", '
                       '"message": "Account not found: '
                       FUNCTION TRIM(WS-ACCOUNT-ID)
                       '" }'
               ELSE
                   MOVE 0 TO WS-LIST-COUNT
                   MOVE 1 TO WS-FIRST-ITEM
                   DISPLAY '{ "status": "OK", '
                       '"account_id": "'
                       FUNCTION TRIM(WS-ACCOUNT-ID)
                       '", "transactions": ['
                   PERFORM VARYING WS-TXN-IDX FROM 1 BY 1
                       UNTIL WS-TXN-IDX > WS-TXN-COUNT
                       IF WS-TXN-ACCT-ID(WS-TXN-IDX) =
                           WS-ACCOUNT-ID
                           ADD 1 TO WS-LIST-COUNT
                           MOVE WS-TXN-AMOUNT(WS-TXN-IDX)
                               TO WS-DISPLAY-AMT
                           MOVE WS-TXN-BALANCE-AF(
                               WS-TXN-IDX)
                               TO WS-DISPLAY-BAL
                           IF WS-FIRST-ITEM = 1
                               MOVE 0 TO WS-FIRST-ITEM
                               DISPLAY '{ "txn_id": '
                                   WS-TXN-ID(WS-TXN-IDX)
                                   ', "type": "'
                                   FUNCTION TRIM(
                                       WS-TXN-TYPE(
                                           WS-TXN-IDX))
                                   '", "amount": '
                                   FUNCTION TRIM(
                                       WS-DISPLAY-AMT)
                                   ', "balance_after": '
                                   FUNCTION TRIM(
                                       WS-DISPLAY-BAL)
                                   ', "description": "'
                                   FUNCTION TRIM(
                                       WS-TXN-DESC(
                                           WS-TXN-IDX))
                                   '" }'
                           ELSE
                               DISPLAY ', { "txn_id": '
                                   WS-TXN-ID(WS-TXN-IDX)
                                   ', "type": "'
                                   FUNCTION TRIM(
                                       WS-TXN-TYPE(
                                           WS-TXN-IDX))
                                   '", "amount": '
                                   FUNCTION TRIM(
                                       WS-DISPLAY-AMT)
                                   ', "balance_after": '
                                   FUNCTION TRIM(
                                       WS-DISPLAY-BAL)
                                   ', "description": "'
                                   FUNCTION TRIM(
                                       WS-TXN-DESC(
                                           WS-TXN-IDX))
                                   '" }'
                           END-IF
                       END-IF
                   END-PERFORM
                   DISPLAY '], "count": '
                       WS-LIST-COUNT ' }'
               END-IF
           END-IF.

       OP-DASHBOARD.
           MOVE 0 TO WS-ACTIVE-COUNT
           MOVE 0 TO WS-TOTAL-BALANCE
           MOVE 0 TO WS-TOTAL-LOANS
           MOVE 0 TO WS-LIST-COUNT

           PERFORM VARYING WS-ACCT-IDX FROM 1 BY 1
               UNTIL WS-ACCT-IDX > WS-ACCT-COUNT
               IF WS-ACCT-ACTIVE(WS-ACCT-IDX) = 1
                   ADD 1 TO WS-ACTIVE-COUNT
                   ADD WS-ACCT-BALANCE(WS-ACCT-IDX)
                       TO WS-TOTAL-BALANCE
               END-IF
           END-PERFORM

           PERFORM VARYING WS-LOAN-IDX FROM 1 BY 1
               UNTIL WS-LOAN-IDX > WS-LOAN-COUNT
               IF WS-LOAN-STATUS(WS-LOAN-IDX) = "ACTIVE"
                   ADD 1 TO WS-LIST-COUNT
                   ADD WS-LOAN-REMAINING(WS-LOAN-IDX)
                       TO WS-TOTAL-LOANS
               END-IF
           END-PERFORM

           MOVE WS-TOTAL-BALANCE TO WS-DISPLAY-BAL
           MOVE WS-TOTAL-LOANS TO WS-DISPLAY-AMT
           DISPLAY '{ "status": "OK", '
               '"active_accounts": ' WS-ACTIVE-COUNT
               ', "total_balance": '
               FUNCTION TRIM(WS-DISPLAY-BAL)
               ', "active_loans": ' WS-LIST-COUNT
               ', "total_loan_balance": '
               FUNCTION TRIM(WS-DISPLAY-AMT)
               ', "total_transactions": '
               WS-TXN-COUNT ' }'.

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
       01 INPUT-RECORD               PIC X(200).

       WORKING-STORAGE SECTION.
       01 WS-INPUT-PATH              PIC X(256).
       01 WS-FILE-STATUS             PIC XX.
       01 WS-EOF                     PIC 9 VALUE 0.

       01 WS-INPUT-LINE              PIC X(200).
       01 WS-OPERATION               PIC X(20).
       01 WS-ACCOUNT-ID              PIC X(20).
       01 WS-ACCOUNT-NAME            PIC X(50).
       01 WS-FIELD4                  PIC X(50).
       01 WS-FIELD5                  PIC X(50).
       01 WS-ACCOUNT-BALANCE         PIC 9(10)V99.
       01 WS-INCOME                  PIC 9(10)V99.
       01 WS-DEBT                    PIC 9(10)V99.

       01 WS-SCORE                   PIC 9(3).
       01 WS-RATIO                   PIC 9(3)V99.
       01 WS-BASE-SCORE              PIC 9(3) VALUE 300.

       01 WS-ACCOUNT-TABLE.
          05 WS-ACCT-ENTRY OCCURS 100 TIMES.
             10 WS-ACCT-ID           PIC X(20).
             10 WS-ACCT-NAME         PIC X(50).
             10 WS-ACCT-BALANCE      PIC 9(10)V99.
             10 WS-ACCT-ACTIVE       PIC 9 VALUE 0.
       01 WS-ACCT-COUNT              PIC 9(3) VALUE 0.
       01 WS-ACCT-IDX                PIC 9(3).
       01 WS-FOUND                   PIC 9 VALUE 0.
       01 WS-FOUND-IDX               PIC 9(3).

       PROCEDURE DIVISION.
       MAIN-PROGRAM.
           ACCEPT WS-INPUT-PATH FROM COMMAND-LINE
           IF WS-INPUT-PATH = SPACES
               MOVE "input.dat" TO WS-INPUT-PATH
           END-IF

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

       PROCESS-LINE.
           MOVE SPACES TO WS-OPERATION
           MOVE SPACES TO WS-ACCOUNT-ID
           MOVE SPACES TO WS-ACCOUNT-NAME
           MOVE SPACES TO WS-FIELD4
           MOVE SPACES TO WS-FIELD5
           MOVE 0 TO WS-ACCOUNT-BALANCE
           MOVE 0 TO WS-INCOME
           MOVE 0 TO WS-DEBT

           UNSTRING WS-INPUT-LINE DELIMITED BY "|"
               INTO WS-OPERATION
                    WS-ACCOUNT-ID
                    WS-ACCOUNT-NAME
                    WS-FIELD4
                    WS-FIELD5
           END-UNSTRING

           MOVE FUNCTION TRIM(WS-OPERATION)
               TO WS-OPERATION
           MOVE FUNCTION TRIM(WS-ACCOUNT-ID)
               TO WS-ACCOUNT-ID
           MOVE FUNCTION TRIM(WS-ACCOUNT-NAME)
               TO WS-ACCOUNT-NAME

           IF WS-FIELD4 NOT = SPACES
               IF WS-OPERATION = "CALCULATE_SCORE"
                   COMPUTE WS-INCOME =
                       FUNCTION NUMVAL(
                           FUNCTION TRIM(WS-FIELD4))
               ELSE
                   COMPUTE WS-ACCOUNT-BALANCE =
                       FUNCTION NUMVAL(
                           FUNCTION TRIM(WS-FIELD4))
               END-IF
           END-IF

           IF WS-FIELD5 NOT = SPACES
               COMPUTE WS-DEBT =
                   FUNCTION NUMVAL(
                       FUNCTION TRIM(WS-FIELD5))
           END-IF

           EVALUATE TRUE
               WHEN WS-OPERATION = "CREATE_ACCOUNT"
                   PERFORM OP-CREATE-ACCOUNT
               WHEN WS-OPERATION = "CHECK_ACCOUNT"
                   PERFORM OP-CHECK-ACCOUNT
               WHEN WS-OPERATION = "CALCULATE_SCORE"
                   PERFORM OP-CALCULATE-SCORE
               WHEN OTHER
                   DISPLAY '{ "status": "ERROR", '
                       '"message": "Unknown operation: '
                       FUNCTION TRIM(WS-OPERATION)
                       '" }'
           END-EVALUATE.

       OP-CREATE-ACCOUNT.
           IF WS-ACCOUNT-ID = SPACES
               DISPLAY '{ "status": "ERROR", '
                   '"message": "Account ID is required" }'
           ELSE
               MOVE 0 TO WS-FOUND
               PERFORM VARYING WS-ACCT-IDX FROM 1 BY 1
                   UNTIL WS-ACCT-IDX > WS-ACCT-COUNT
                   IF WS-ACCT-ID(WS-ACCT-IDX) =
                       WS-ACCOUNT-ID
                       MOVE 1 TO WS-FOUND
                   END-IF
               END-PERFORM

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
                   MOVE WS-ACCOUNT-BALANCE
                       TO WS-ACCT-BALANCE(WS-ACCT-COUNT)
                   MOVE 1
                       TO WS-ACCT-ACTIVE(WS-ACCT-COUNT)
                   DISPLAY '{ "status": "OK", '
                       '"message": "Account created: '
                       FUNCTION TRIM(WS-ACCOUNT-ID)
                       '" }'
               END-IF
           END-IF.

       OP-CHECK-ACCOUNT.
           IF WS-ACCOUNT-ID = SPACES
               DISPLAY '{ "status": "ERROR", '
                   '"message": "Account ID is required" }'
           ELSE
               MOVE 0 TO WS-FOUND
               MOVE 0 TO WS-FOUND-IDX
               PERFORM VARYING WS-ACCT-IDX FROM 1 BY 1
                   UNTIL WS-ACCT-IDX > WS-ACCT-COUNT
                   IF WS-ACCT-ID(WS-ACCT-IDX) =
                       WS-ACCOUNT-ID
                       MOVE 1 TO WS-FOUND
                       MOVE WS-ACCT-IDX TO WS-FOUND-IDX
                   END-IF
               END-PERFORM

               IF WS-FOUND = 1
                   DISPLAY '{ "status": "OK", '
                       '"message": "Account found: '
                       FUNCTION TRIM(WS-ACCOUNT-ID)
                       '", "name": "'
                       FUNCTION TRIM(
                           WS-ACCT-NAME(WS-FOUND-IDX))
                       '", "balance": "'
                       FUNCTION TRIM(
                           WS-ACCT-BALANCE(WS-FOUND-IDX))
                       '" }'
               ELSE
                   DISPLAY '{ "status": "NOT_FOUND", '
                       '"message": "Account not found: '
                       FUNCTION TRIM(WS-ACCOUNT-ID)
                       '" }'
               END-IF
           END-IF.

       OP-CALCULATE-SCORE.
           IF WS-ACCOUNT-ID = SPACES
               DISPLAY '{ "status": "ERROR", '
                   '"message": "Account ID is required" }'
           ELSE
               MOVE WS-BASE-SCORE TO WS-SCORE

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

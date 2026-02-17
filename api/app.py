import json
import os
import subprocess
import tempfile
from flask import Flask, jsonify, request
from flask_cors import CORS

app = Flask(__name__)
CORS(app)

COBOL_BIN = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), 'bin', 'legacy-backend')


def run_cobol(operations):
    with tempfile.NamedTemporaryFile(mode='w', suffix='.dat', delete=False) as f:
        for op in operations:
            f.write(op + '\n')
        tmp_path = f.name

    try:
        result = subprocess.run(
            [COBOL_BIN, tmp_path],
            capture_output=True, text=True, timeout=10
        )
        output_lines = result.stdout.strip().split('\n') if result.stdout.strip() else []
        responses = []
        json_buffer = ''
        for line in output_lines:
            json_buffer += line.strip()
            try:
                parsed = json.loads(json_buffer)
                responses.append(parsed)
                json_buffer = ''
            except json.JSONDecodeError:
                continue
        return responses
    except subprocess.TimeoutExpired:
        return [{"status": "ERROR", "message": "COBOL backend timeout"}]
    except Exception as e:
        return [{"status": "ERROR", "message": str(e)}]
    finally:
        os.unlink(tmp_path)


def run_single(operation):
    results = run_cobol([operation])
    return results[0] if results else {"status": "ERROR", "message": "No response from backend"}


def run_with_context(setup_ops, target_op):
    all_ops = setup_ops + [target_op]
    results = run_cobol(all_ops)
    return results[-1] if results else {"status": "ERROR", "message": "No response"}


@app.route('/api/health', methods=['GET'])
def health():
    return jsonify({"status": "OK", "service": "COBOL Banking API", "version": "2.0"})


@app.route('/api/accounts', methods=['GET', 'POST'])
def accounts():
    if request.method == 'POST':
        data = request.get_json()
        account_id = data.get('account_id', '')
        name = data.get('name', '')
        account_type = data.get('type', 'CHECKING')
        balance = data.get('balance', '0')
        op = f"CREATE_ACCOUNT|{account_id}|{name}|{account_type}|{balance}"
        result = run_single(op)
        return jsonify(result), 201 if result.get('status') == 'OK' else 400

    op = "LIST_ACCOUNTS"
    result = run_single(op)
    return jsonify(result)


@app.route('/api/accounts/<account_id>', methods=['GET', 'PUT', 'DELETE'])
def account_detail(account_id):
    if request.method == 'GET':
        op = f"CHECK_ACCOUNT|{account_id}"
        result = run_single(op)
        status = 200 if result.get('status') == 'OK' else 404
        return jsonify(result), status

    if request.method == 'PUT':
        data = request.get_json()
        name = data.get('name', '')
        op = f"UPDATE_ACCOUNT|{account_id}|{name}"
        result = run_single(op)
        return jsonify(result)

    if request.method == 'DELETE':
        op = f"DELETE_ACCOUNT|{account_id}"
        result = run_single(op)
        return jsonify(result)


@app.route('/api/accounts/<account_id>/deposit', methods=['POST'])
def deposit(account_id):
    data = request.get_json()
    amount = data.get('amount', 0)
    setup = [f"CREATE_ACCOUNT|{account_id}|Temp|CHECKING|0"]
    op = f"DEPOSIT|{account_id}|{amount}"
    results = run_cobol([op])
    result = results[0] if results else {"status": "ERROR", "message": "No response"}
    return jsonify(result)


@app.route('/api/accounts/<account_id>/withdraw', methods=['POST'])
def withdraw(account_id):
    data = request.get_json()
    amount = data.get('amount', 0)
    op = f"WITHDRAW|{account_id}|{amount}"
    result = run_single(op)
    return jsonify(result)


@app.route('/api/transfer', methods=['POST'])
def transfer():
    data = request.get_json()
    from_account = data.get('from_account', '')
    to_account = data.get('to_account', '')
    amount = data.get('amount', 0)
    op = f"TRANSFER|{from_account}|{to_account}|{amount}"
    result = run_single(op)
    return jsonify(result)


@app.route('/api/loans', methods=['GET', 'POST'])
def loans():
    if request.method == 'POST':
        data = request.get_json()
        account_id = data.get('account_id', '')
        loan_id = data.get('loan_id', '')
        principal = data.get('principal', 0)
        rate = data.get('rate', 5.0)
        term = data.get('term_months', 12)
        op = f"CREATE_LOAN|{account_id}|{loan_id}|{principal}|{rate}|{term}"
        result = run_single(op)
        return jsonify(result), 201 if result.get('status') == 'OK' else 400

    account_id = request.args.get('account_id', '')
    op = f"LIST_LOANS|{account_id}" if account_id else "LIST_LOANS"
    result = run_single(op)
    return jsonify(result)


@app.route('/api/loans/<loan_id>', methods=['GET'])
def loan_detail(loan_id):
    op = f"CHECK_LOAN|{loan_id}"
    result = run_single(op)
    status = 200 if result.get('status') == 'OK' else 404
    return jsonify(result), status


@app.route('/api/loans/<loan_id>/pay', methods=['POST'])
def pay_loan(loan_id):
    data = request.get_json()
    account_id = data.get('account_id', '')
    amount = data.get('amount', '')
    op = f"PAY_LOAN|{account_id}|{loan_id}"
    if amount:
        op += f"|{amount}"
    result = run_single(op)
    return jsonify(result)


@app.route('/api/accounts/<account_id>/score', methods=['GET'])
def credit_score(account_id):
    name = request.args.get('name', '')
    income = request.args.get('income', '0')
    debt = request.args.get('debt', '0')
    op = f"CALCULATE_SCORE|{account_id}|{name}|{income}|{debt}"
    result = run_single(op)
    return jsonify(result)


@app.route('/api/accounts/<account_id>/transactions', methods=['GET'])
def transactions(account_id):
    op = f"TRANSACTION_HISTORY|{account_id}"
    result = run_single(op)
    return jsonify(result)


@app.route('/api/dashboard', methods=['GET'])
def dashboard():
    op = "DASHBOARD"
    result = run_single(op)
    return jsonify(result)


@app.route('/api/batch', methods=['POST'])
def batch():
    data = request.get_json()
    operations = data.get('operations', [])
    results = run_cobol(operations)
    return jsonify({"status": "OK", "results": results, "count": len(results)})


if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=True)

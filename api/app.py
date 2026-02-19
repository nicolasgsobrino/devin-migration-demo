import json
import os
import re
import subprocess
import tempfile
import threading
from flask import Flask, jsonify, request
from flask_cors import CORS

app = Flask(__name__)
CORS(app)

PROJECT_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
JAVA_CLASS_DIR = os.path.join(PROJECT_DIR, 'java-backend', 'out')
JAVA_MAIN_CLASS = 'com.banking.LegacyBackend'
STATE_DIR = os.path.join(os.path.dirname(os.path.abspath(__file__)), '.state')
STATE_FILE = os.path.join(STATE_DIR, 'operations.log')

os.makedirs(STATE_DIR, exist_ok=True)

state_lock = threading.Lock()

STATE_OPS = {
    'CREATE_ACCOUNT', 'DELETE_ACCOUNT', 'UPDATE_ACCOUNT',
    'DEPOSIT', 'WITHDRAW', 'TRANSFER',
    'CREATE_LOAN', 'PAY_LOAN',
}


def get_state_ops():
    if not os.path.exists(STATE_FILE):
        return []
    with open(STATE_FILE, 'r') as f:
        return [line.strip() for line in f if line.strip()]


def append_state_op(op):
    with open(STATE_FILE, 'a') as f:
        f.write(op + '\n')


def run_backend(operations):
    with tempfile.NamedTemporaryFile(mode='w', suffix='.dat', delete=False) as f:
        for op in operations:
            f.write(op + '\n')
        tmp_path = f.name

    try:
        result = subprocess.run(
            ['java', '-cp', JAVA_CLASS_DIR, JAVA_MAIN_CLASS, tmp_path],
            capture_output=True, text=True, timeout=30
        )
        output_lines = result.stdout.strip().split('\n') if result.stdout.strip() else []
        responses = []
        json_buffer = ''
        for line in output_lines:
            json_buffer += ' ' + line.strip()
            fixed = re.sub(r'(?<=[\s:,])0+(\d)', r'\1', json_buffer.strip())
            try:
                parsed = json.loads(fixed)
                responses.append(parsed)
                json_buffer = ''
            except json.JSONDecodeError:
                pass
        return responses
    except subprocess.TimeoutExpired:
        return [{"status": "ERROR", "message": "Java backend timeout"}]
    except Exception as e:
        return [{"status": "ERROR", "message": str(e)}]
    finally:
        os.unlink(tmp_path)


def run_with_state(operation, mutates=False):
    with state_lock:
        history = get_state_ops()
        all_ops = history + [operation]
        results = run_backend(all_ops)
        target_result = results[len(history)] if len(results) > len(history) else (
            {"status": "ERROR", "message": "No response from backend"}
        )
        if mutates and target_result.get('status') == 'OK':
            append_state_op(operation)
        return target_result


def run_query(operation):
    return run_with_state(operation, mutates=False)


def run_mutation(operation):
    return run_with_state(operation, mutates=True)


@app.route('/api/health', methods=['GET'])
def health():
    return jsonify({"status": "OK", "service": "Java Banking API", "version": "3.0"})


@app.route('/api/accounts', methods=['GET', 'POST'])
def accounts():
    if request.method == 'POST':
        data = request.get_json()
        account_id = data.get('account_id', '')
        name = data.get('name', '')
        account_type = data.get('type', 'CHECKING')
        balance = data.get('balance', '0')
        op = f"CREATE_ACCOUNT|{account_id}|{name}|{account_type}|{balance}"
        result = run_mutation(op)
        status_code = 201 if result.get('status') == 'OK' else 400
        return jsonify(result), status_code

    result = run_query("LIST_ACCOUNTS")
    return jsonify(result)


@app.route('/api/accounts/<account_id>', methods=['GET', 'PUT', 'DELETE'])
def account_detail(account_id):
    if request.method == 'GET':
        op = f"CHECK_ACCOUNT|{account_id}"
        result = run_query(op)
        status = 200 if result.get('status') == 'OK' else 404
        return jsonify(result), status

    if request.method == 'PUT':
        data = request.get_json()
        name = data.get('name', '')
        op = f"UPDATE_ACCOUNT|{account_id}|{name}"
        result = run_mutation(op)
        return jsonify(result)

    if request.method == 'DELETE':
        op = f"DELETE_ACCOUNT|{account_id}"
        result = run_mutation(op)
        return jsonify(result)


@app.route('/api/accounts/<account_id>/deposit', methods=['POST'])
def deposit(account_id):
    data = request.get_json()
    amount = data.get('amount', 0)
    op = f"DEPOSIT|{account_id}|{amount}"
    result = run_mutation(op)
    return jsonify(result)


@app.route('/api/accounts/<account_id>/withdraw', methods=['POST'])
def withdraw(account_id):
    data = request.get_json()
    amount = data.get('amount', 0)
    op = f"WITHDRAW|{account_id}|{amount}"
    result = run_mutation(op)
    return jsonify(result)


@app.route('/api/transfer', methods=['POST'])
def transfer():
    data = request.get_json()
    from_account = data.get('from_account', '')
    to_account = data.get('to_account', '')
    amount = data.get('amount', 0)
    op = f"TRANSFER|{from_account}|{to_account}|{amount}"
    result = run_mutation(op)
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
        result = run_mutation(op)
        status_code = 201 if result.get('status') == 'OK' else 400
        return jsonify(result), status_code

    result = run_query("LIST_LOANS")
    return jsonify(result)


@app.route('/api/loans/<loan_id>', methods=['GET'])
def loan_detail(loan_id):
    op = f"CHECK_LOAN|{loan_id}"
    result = run_query(op)
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
    result = run_mutation(op)
    return jsonify(result)


@app.route('/api/accounts/<account_id>/score', methods=['GET'])
def credit_score(account_id):
    name = request.args.get('name', '')
    income = request.args.get('income', '0')
    debt = request.args.get('debt', '0')
    op = f"CALCULATE_SCORE|{account_id}|{name}|{income}|{debt}"
    result = run_query(op)
    return jsonify(result)


@app.route('/api/accounts/<account_id>/transactions', methods=['GET'])
def transactions(account_id):
    op = f"TRANSACTION_HISTORY|{account_id}"
    result = run_query(op)
    return jsonify(result)


@app.route('/api/dashboard', methods=['GET'])
def dashboard():
    result = run_query("DASHBOARD")
    return jsonify(result)


@app.route('/api/reset', methods=['POST'])
def reset():
    with state_lock:
        if os.path.exists(STATE_FILE):
            os.unlink(STATE_FILE)
    return jsonify({"status": "OK", "message": "State reset"})


@app.route('/api/batch', methods=['POST'])
def batch():
    data = request.get_json()
    operations = data.get('operations', [])
    results = []
    for op in operations:
        op_type = op.split('|')[0]
        is_mutation = op_type in STATE_OPS
        result = run_mutation(op) if is_mutation else run_query(op)
        results.append(result)
    return jsonify({"status": "OK", "results": results, "count": len(results)})


if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=True)

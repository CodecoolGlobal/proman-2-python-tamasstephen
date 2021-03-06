from flask import Flask, render_template, url_for, request, session
from dotenv import load_dotenv
from werkzeug import security
from os import urandom

from util import json_response
import mimetypes
import queires

mimetypes.add_type('application/javascript', '.js')
app = Flask(__name__)
load_dotenv()
app.secret_key = urandom(16)


@app.route("/")
def index():
    """
    This is a one-pager which shows all the boards and cards
    """
    return render_template('index.html')


@app.route("/api/boards")
@json_response
def get_boards():
    """
    All the boards
    """
    return queires.get_boards()


@app.route("/api/boards/<int:board_id>/cards/")
@json_response
def get_cards_for_board(board_id: int):
    """
    All cards that belongs to a board
    :param board_id: id of the parent board
    """
    return queires.get_cards_for_board(board_id)


@app.route("/api/create_board", methods=["POST"])
@json_response
def create_new_board():
    title = request.get_json()["title"]
    return queires.create_new_board(title)


@app.route("/api/rename_board", methods=["POST"])
@json_response
def rename_the_board():
    title = request.get_json()["title"]
    board_id = request.get_json()["board_id"]
    return queires.rename_board(title, board_id)


@app.route("/api/get_statuses")
@json_response
def get_statuses():
    return queires.get_statuses()


@app.route("/api/get_default_statuses")
@json_response
def get_default_statuses():
    return queires.get_default_statuses()


@app.route("/api/get_statuses/<int:board_id>")
@json_response
def get_statuses_by_id(board_id):
    status_ids = [status['status_id'] for status in queires.get_statuses_by_board_id(board_id)]
    statuses_by_name_and_id = queires.get_statuses_by_status_id(status_ids)
    return statuses_by_name_and_id


@app.route("/api/update_status_title", methods=['POST'])
@json_response
def update_status_title():
    status_id = request.get_json()["status_id"]
    title = request.get_json()["title"]
    return queires.update_status_title(status_id, title)


@app.route("/api/status_to_board", methods=["POST"])
@json_response
def bind_status_to_board():
    data = request.get_json()
    return queires.connect_status_with_board(data)


@app.route("/api/create_status", methods=["POST"])
@json_response
def create_new_status():
    title = request.get_json()["title"]
    return queires.create_new_status(title)


@app.route("/api/create_new_card", methods=["POST"])
@json_response
def create_new_card():
    card_data = request.get_json()
    return queires.create_new_card(card_data)


@app.route("/api/set_cards_order", methods=["PUT"])
@json_response
def set_cards_order():
    cards_data = request.get_json()["cards"]
    new_data = [queires.set_cards_order(data) for data in cards_data]
    return new_data


@app.route("/api/update_status_to_board", methods=['POST'])
@json_response
def update_status_id_to_board():
    new_status_id = request.get_json()["new_status_id"]
    column_id = request.get_json()["column_id"]
    board_id = request.get_json()["board_id"]
    return queires.update_status_in_status_board(new_status_id, column_id, board_id)


@app.route("/api/update_card_status/<int:card_id>", methods=["PUT"])
@json_response
def update_card_status(card_id):
    new_card_data = request.get_json()
    return queires.update_card_status(new_card_data, card_id)


@app.route("/api/rename_card", methods=["POST"])
@json_response
def update_card():
    card_id = request.get_json()["card_id"]
    new_card_name = request.get_json()["title"]
    return queires.rename_card(card_id, new_card_name)


@app.route("/api/registration", methods=["POST"])
@json_response
def handle_registration():
    username, password = request.get_json()["username"], request.get_json()["password"]
    is_existing_username = queires.get_existing_user(username)
    if not is_existing_username:
        password_hash = security.generate_password_hash(password, method='pbkdf2:sha256', salt_length=16)
        set_user = queires.setNewUser(username, password_hash)
        session['username'] = username
        session['id'] = set_user['id']
        return set_user
    return False


@app.route("/api/login", methods=["POST"])
@json_response
def user_login():
    username, password = request.get_json()["username"], request.get_json()["password"]
    is_existing_user = queires.get_existing_user(username)
    if is_existing_user:
        hashed_password = queires.get_password_hash(is_existing_user["id"])
        is_valid_password = security.check_password_hash(hashed_password["password"], password)
        if is_valid_password:
            session["username"] = username
            session["id"] = is_existing_user["id"]
            return True
    return False


@app.route("/api/logout")
@json_response
def logout():
    username = session.pop("username")
    user_id = session.pop("id")
    return {'username': username, 'user_id': user_id}


@app.route("/api/get_user_id")
@json_response
def get_user_id():
    user_id = session.get("id")
    return user_id if user_id else -1


@app.route("/api/get_boards/<user_id>")
@json_response
def get_boards_for_user_id(user_id):
    boards = queires.get_public_boards() if user_id == "-1" else queires.get_boards_by_user_id(user_id)
    return boards


@app.route("/api/set_board_to_private", methods=["POST"])
@json_response
def set_private_board():
    user_id, board_id = request.get_json()["user_id"], request.get_json()["board_id"]
    private_board = queires.set_board_to_private(user_id, board_id)
    return private_board


@app.route("/api/delete-board", methods=["POST"])
def delete_board():
    board_id = request.get_json()["board_id"]
    queires.delete_status_by_board_id(board_id)
    deleted_relation = queires.delete_status_board_connection(board_id)
    queires.delete_board_by_id(board_id)
    return {"deleted": deleted_relation}


@app.route("/api/delete-status", methods=["POST"])
def delete_status():
    board_id, status_id = request.get_json()["board_id"], request.get_json()["status_id"]
    deleted_relation = queires.delete_status_board_connection_by_ids(board_id, status_id)
    if int(status_id) not in [1, 2, 3, 4]:
        queires.delete_status_by_id(status_id)
    return {"relation": deleted_relation}


@app.route('/api/delete-card', methods=["POST"])
@json_response
def delete_card_from_db():
    card_id = request.get_json()["cardId"]
    return queires.delete_card(int(card_id))


def main():
    app.run(debug=True,
            port=5001)

    # Serving the favicon
    with app.app_context():
        app.add_url_rule('/favicon.ico', redirect_to=url_for('static', filename='favicon/favicon.ico'))


if __name__ == '__main__':
    main()

from flask import Flask, render_template, url_for, request
from dotenv import load_dotenv
from werkzeug import security

from util import json_response
import mimetypes
import queires

mimetypes.add_type('application/javascript', '.js')
app = Flask(__name__)
load_dotenv()


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
def rename_board():
    title = request.get_json()["title"]
    board_id = request.get_json()["board_id"]
    print(request.get_json())
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


@app.route("/api/status_to_board", methods=["POST"])
@json_response
def bind_status_to_board():
    data = request.get_json()
    return queires.connect_status_with_board(data)


@app.route("/api/create_status", methods=["POST"])
@json_response
def create_new_status():
    title = request.get_json()["title"]
    print(title)
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
    print(cards_data)
    new_data = [queires.set_cards_order(data) for data in cards_data]
    return new_data


@app.route("/api/update_card_status/<int:card_id>", methods=["PUT"])
@json_response
def update_card_status(card_id):
    new_card_data = request.get_json()
    print(new_card_data)
    return queires.update_card_status(new_card_data, card_id)


@app.route("/api/registration", methods=["POST"])
@json_response
def handle_registration():
    username, password = request.get_json()["username"], request.get_json()["password"]
    is_existing_username = queires.get_existing_username(username)
    if not is_existing_username:
        password_hash = security.generate_password_hash(password, method='pbkdf2:sha256', salt_length=16)
        set_user = queires.setNewUser(username, password_hash)
        return set_user
    return False


def main():
    app.run(debug=True)

    # Serving the favicon
    with app.app_context():
        app.add_url_rule('/favicon.ico', redirect_to=url_for('static', filename='favicon/favicon.ico'))


if __name__ == '__main__':
    main()

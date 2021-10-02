from flask import Flask, render_template, url_for, request
from dotenv import load_dotenv


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


@app.route("/api/get_statuses")
@json_response
def get_statuses():
    return queires.get_statuses()


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


def main():
    app.run(debug=True)

    # Serving the favicon
    with app.app_context():
        app.add_url_rule('/favicon.ico', redirect_to=url_for('static', filename='favicon/favicon.ico'))


if __name__ == '__main__':
    main()

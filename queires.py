import data_manager
from psycopg2 import sql


def get_card_status(status_id):
    """
    Find the first status matching the given id
    :param status_id:
    :return: str
    """
    status = data_manager.execute_select(
        """
        SELECT * FROM statuses s
        WHERE s.id = %(status_id)s
        ;
        """
        , {"status_id": status_id})

    return status


def get_boards():
    """
    Gather all boards
    :return:
    """
    # remove this code once you implement the database
    # return [{"title": "board1", "id": 1}, {"title": "board2", "id": 2}]

    return data_manager.execute_select(
        """
        SELECT * FROM boards
        ;
        """
    )


def get_cards_for_board(board_id):
    # remove this code once you implement the database
    # return [{"title": "title1", "id": 1}, {"title": "board2", "id": 2}]

    matching_cards = data_manager.execute_select(
        """
        SELECT * FROM cards
        WHERE cards.board_id = %(board_id)s
        ;
        """
        , {"board_id": board_id})

    return matching_cards


def get_default_statuses():
    query = sql.SQL("""
        select * from statuses
        where id < 5; 
    """)
    return data_manager.execute_select(query)


def create_new_board(title):
    query = sql.SQL("""
        INSERT INTO boards
        (title)
        VALUES ( {title} )
        RETURNING id, title 
    """).format(title=sql.Literal(title))
    new_board = data_manager.execute_select(query, fetchall=False)
    return new_board


def rename_board(new_board_name, board_id):
    query = sql.SQL("""
    UPDATE boards
    SET title = {new_board_name}
    WHERE id = {board_id}
    RETURNING title, id
    """).format(new_board_name=sql.Literal(new_board_name),
                board_id=sql.Literal(board_id))
    return data_manager.execute_select(query)


def get_statuses_by_board_id(board_id):
    query = sql.SQL("""
    select status_id from status_board
    where board_id = {board_id} 
    """).format(board_id=sql.Literal(board_id))
    return data_manager.execute_select(query)


def get_statuses():
    return data_manager.execute_select("""
        select * from statuses 
    """)


def get_statuses_by_status_id(arr):
    query = sql.SQL("""
        select * from statuses 
        where id = any({arr}) 
    """).format(arr=sql.Literal(arr))
    return data_manager.execute_select(query)


def connect_status_with_board(data):
    query = sql.SQL("""
        insert into status_board
        (status_id, board_id)
        values ({status_id}, {board_id})
        returning *
    """).format(status_id=sql.Literal(data["status_id"]),
                board_id=sql.Literal(data["board_id"]))
    return data_manager.execute_select(query)


def create_new_status(title):
    query = sql.SQL("""
        insert into statuses
        (title)
        values ({title})
        returning * 
    """).format(title=sql.Literal(title))
    return data_manager.execute_select(query, fetchall=False)


def create_new_card(data):
    query = sql.SQL("""
        insert into cards
        (board_id, status_id, title, card_order)
        values({board_id}, {status_id}, {title}, {card_order})
        returning *
    """).format(board_id=sql.Literal(data["board_id"]),
                status_id=sql.Literal(data["status_id"]),
                title=sql.Literal(data["title"]),
                card_order=sql.Literal(data["order"]))
    return data_manager.execute_select(query, fetchall=False)


def set_cards_order(cards_data):
    query = sql.SQL("""
        UPDATE cards
        SET card_order = {new_order}
        WHERE id = {id}
        RETURNING id, card_order, title 
    """).format(id=sql.Literal(cards_data["id"]),
                new_order=sql.Literal(cards_data["order"]))
    return data_manager.execute_select(query, fetchall=False)


def update_status_title(status_id, title):
    query = sql.SQL("""
    UPDATE statuses
    SET title = {title}
    WHERE id = {status_id}
    RETURNING *
    """).format(status_id=sql.Literal(status_id),
                title=sql.Literal(title))
    return data_manager.execute_select(query, fetchall=False)


def update_status_in_status_board(status_id, column_id, board_id):
    query = sql.SQL("""
    UPDATE status_board
    SET status_id = {status_id}
    WHERE status_id = {column_id} AND board_id = {board_id}
    RETURNING *
    """).format(status_id=sql.Literal(status_id),
                column_id=sql.Literal(column_id),
                board_id=sql.Literal(board_id))
    return data_manager.execute_select(query, fetchall=False)


def update_card_status(data, card_id):
    query = sql.SQL("""
        UPDATE cards
        SET board_id = {new_board_id},
            status_id = {new_status_id}
        WHERE id = {card_id}
        RETURNING *
    """).format(new_board_id=sql.Literal(data["board_id"]),
                new_status_id=sql.Literal(data["status_id"]),
                card_id=sql.Literal(card_id))
    return data_manager.execute_select(query, fetchall=False)


def get_existing_user(username):
    query = sql.SQL("""
        SELECT * FROM users
        WHERE username = {username}
    """).format(username=sql.Literal(username))
    return data_manager.execute_select(query, fetchall=False)


def setNewUser(username, password):
    query = sql.SQL("""
        INSERT INTO users
        (username, password)
        VALUES ({username}, {password})
        RETURNING *
    """).format(username=sql.Literal(username),
                password=sql.Literal(password))
    return data_manager.execute_select(query, fetchall=False)


def get_password_hash(user_id):
    query = sql.SQL("""
        SELECT password FROM users
        WHERE id = {user_id} 
    """).format(user_id=sql.Literal(user_id))
    return data_manager.execute_select(query, fetchall=False)


def get_public_boards():
    query = sql.SQL("""
        SELECT * FROM boards
        where private = false or private is null 
    """)
    return data_manager.execute_select(query)


def get_boards_by_user_id(user_id):
    query = sql.SQL("""
        SELECT * FROM boards
        WHERE private = FALSE OR  user_id = {user_id} OR private is null
    """).format(user_id=sql.Literal(user_id))
    return data_manager.execute_select(query)


def set_board_to_private(user_id, board_id):
    query = sql.SQL("""
    UPDATE boards
        SET user_id = {user_id},
            private = true
        WHERE id = {board_id} 
        RETURNING *
    """).format(user_id=sql.Literal(user_id),
                board_id=sql.Literal(board_id))
    return data_manager.execute_select(query, fetchall=False)


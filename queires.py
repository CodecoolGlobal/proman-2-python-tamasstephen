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


def create_new_board(title):
    query = sql.SQL("""
        INSERT INTO boards
        (title)
        VALUES ( {title} )
        RETURNING id, title 
    """).format(title=sql.Literal(title))
    new_board = data_manager.execute_select(query, fetchall=False)
    return new_board


def get_statuses_by_board_id(board_id):
    query = sql.SQL("""
    select status_id from status_board
    where board_id = {board_id} 
    """).format(board_id=sql.Literal(board_id))
    return data_manager.execute_select(query)


def get_statuses_by_status_id(arr):
    query = sql.SQL("""
        select * from statuses 
        where id = any({arr}) 
    """).format(arr=sql.Literal(arr))
    return data_manager.execute_select(query)





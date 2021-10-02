DROP TABLE IF EXISTS status_board;

CREATE TABLE status_board
(id serial primary key,
board_id integer,
status_id integer,
foreign key (board_id)
    references boards(id)
        on delete cascade,
foreign key (status_id)
    references statuses(id));

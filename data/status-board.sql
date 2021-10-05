DROP TABLE IF EXISTS status_board;

CREATE TABLE status_board
(
    id        serial primary key,
    board_id  integer,
    status_id integer,
    foreign key (board_id)
        references boards (id)
        on delete cascade,
    foreign key (status_id)
        references statuses (id)
);


INSERT INTO status_board(board_id, status_id)
VALUES (1, 1),
       (1, 2),
       (1, 3),
       (1, 4);


INSERT INTO status_board(board_id, status_id)
VALUES (2, 1),
       (2, 2),
       (2, 3),
       (2, 4);
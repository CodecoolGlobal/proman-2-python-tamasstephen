CREATE TABLE users
(id SERIAL PRIMARY KEY,
username VARCHAR NOT NULL,
password VARCHAR);


ALTER TABLE boards
    ADD column user_id integer,
    ADD CONSTRAINT user_id_fk FOREIGN key (user_id) REFERENCES users (id),
    ADD column private boolean;

ALTER TABLE cards
    DROP CONSTRAINT IF EXISTS fk_cards_board_id;
ALTER TABLE cards
    DROP CONSTRAINT IF EXISTS fk_cards_status_id;

ALTER TABLE cards
    ADD CONSTRAINT fk_cards_board_id
        FOREIGN KEY(board_id)
            REFERENCES boards(id)
            ON DELETE CASCADE,
    ADD CONSTRAINT fk_cards_status_id
        FOREIGN KEY(status_id)
            REFERENCES statuses(id)
            ON DELETE CASCADE

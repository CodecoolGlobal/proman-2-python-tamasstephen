DROP TABLE IF EXISTS status_board;

CREATE TABLE users
(id SERIAL PRIMARY KEY,
username VARCHAR NOT NULL,
password VARCHAR)

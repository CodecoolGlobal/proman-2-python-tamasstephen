CREATE TABLE users
(id SERIAL PRIMARY KEY,
username VARCHAR NOT NULL,
password VARCHAR);


ALTER TABLE boards
    ADD column user_id integer,
    ADD CONSTRAINT user_id_fk FOREIGN key (user_id) REFERENCES users (id),
    ADD column private boolean;
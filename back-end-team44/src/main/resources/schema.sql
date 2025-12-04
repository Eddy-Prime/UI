-- Drop tables in dependency-safe order
DROP TABLE IF EXISTS login_response;
DROP TABLE IF EXISTS users;

-- USERS table
CREATE TABLE users (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(255),
    email VARCHAR(255),
    password VARCHAR(255)
);

--insert into users
insert into users (name, email, password) values ('Tom Boon', 'tom.boon@ucll.be', 'tom123');
insert into users (name, email, password) values ('Loick Luypaert', 'loick.luypaert@ucll.be', 'loick123');

-- LOGIN_RESPONSE table (linked to USERS)
CREATE TABLE login_response (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    token VARCHAR(255),
    expires_in BIGINT,
    user_id BIGINT NOT NULL,
    CONSTRAINT fk_loginresponse_user
        FOREIGN KEY (user_id)
        REFERENCES users(id)
        ON DELETE CASCADE
);

-- Ensure next user ID starts from 5 to make tests deterministic
ALTER TABLE users ALTER COLUMN id RESTART WITH 5;

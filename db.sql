create database bus;
use bus;
  CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255),
    user_id VARCHAR(255),
    email VARCHAR(255),
    password VARCHAR(255)
  );

CREATE TABLE pass (
    pass_id INT AUTO_INCREMENT PRIMARY KEY,
    user_id VARCHAR(255),
    location VARCHAR(255),
    duration DATE,
    isvalid INT DEFAULT 0
);

create table session (
	session_id INT AUTO_INCREMENT PRIMARY KEY,
    user_id VARCHAR(50) NOT NULL,
    name VARCHAR(255) NOT NULL
);

create table admin(
	user_id VARCHAR(255) PRIMARY KEY,
    password VARCHAR(255)
    );

CREATE TABLE issue (
    issue_id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    user_id VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

INSERT INTO admin (user_id, password) VALUES ('Admin', '21CSBADMIN');

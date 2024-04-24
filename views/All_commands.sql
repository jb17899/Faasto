CREATE TABLE users(id SERIAL,email VARCHAR(40),password VARCHAR(40),phone_number TEXT check(phone_number>1000000000),name VARCHAR(40));
CREATE TABLE restaurents(id SERIAL,name VARCHAR(40),food VARCHAR(40),availability BOOL,price INT);
CREATE TABLE orders(order_id SERIAL,user_id INT references users(id),restaurent_id INT references restaurents(id),address VARCHAR(100),price INT,times TEXT);
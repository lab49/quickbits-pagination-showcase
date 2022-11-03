DROP TABLE transactions;

CREATE TABLE transactions (
	id SERIAL UNIQUE NOT NULL,
	code TEXT,
	type TEXT,
	amount TEXT,
	description TEXT,
	date TEXT
);

insert into transactions (
    code, type, amount, description, date
)
select
	md5(random()::text),
	md5(random()::text),
	md5(random()::text),
	md5(random()::text),
	md5(random()::text)
from generate_series(1, 1000000) s(i);

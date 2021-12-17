CREATE DATABASE rarity_rmrk;
GRANT ALL PRIVILEGES ON DATABASE rarity_rmrk TO postgres;
\connect rarity_rmrk;
CREATE TABLE rarities ( id VARCHAR (200) PRIMARY KEY, rarity REAL );

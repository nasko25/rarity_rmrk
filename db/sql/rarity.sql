CREATE DATABASE rarity_rmrk;
GRANT ALL PRIVILEGES ON DATABASE rarity_rmrk TO postgres;
\connect rarity_rmrk;
CREATE TABLE nfts ( nft_id VARCHAR (200) PRIMARY KEY, collection_id VARCHAR (200) );
CREATE TABLE rarities ( id VARCHAR (200) PRIMARY KEY, rarity REAL, CONSTRAINT nft FOREIGN KEY (id) REFERENCES nfts(nft_id) ON DELETE CASCADE ON UPDATE CASCADE );
CREATE TABLE metadatas ( id VARCHAR (200) PRIMARY KEY, metadata_json TEXT /* later may have other fields, like images from the metadata */, CONSTRAINT nft FOREIGN KEY (id) REFERENCES nfts(nft_id) ON DELETE CASCADE ON UPDATE CASCADE );

CREATE TABLE kind(			-- Category Master
	id INT IDENTITY,		-- Category ID
	kind STRING				-- Category Name
);

CREATE TABLE maker(			-- Maker Master
	id INT IDENTITY,		-- Maker ID
	maker STRING			-- Maker Name
);

CREATE TABLE item(			-- Product Master
	id INT IDENTITY,		-- Product ID
	code STRING,			-- Product code
	kindId INT,				-- Category ID
	itemName STRING,		-- Details
	makerId INT,			-- Maker ID
	importPrice INT,		-- Import Price
	transProfit INT,		-- Transfering Price
	saleProfit INT,			-- Sale Profit
	unit STRING				-- Unit
);

CREATE TABLE whouse(		-- Warehouse Master
	id INT IDENTITY,		-- Warehouse ID
	name STRING,			-- Warehouse Name
	addr STRING,			-- Address (not yet used)
	tel STRING,				-- Telephone number (not yet used)
	shelves INT,
	rows INT,
	cols INT
);

CREATE TABLE stock(			-- Inventory
	id INT IDENTITY,		-- Inventory ID
	itemId INT,				-- Product ID
	whouseId INT,				-- Warehouse ID
	minimum INT,		-- Minimum Storage Level
	maximum INT,			-- Export Maximum Number
	balance INT 			-- number in stock
);

CREATE TABLE trans(			-- * Transaction
	id INT IDENTITY,		-- * Transaction ID
	stockId INT,				-- * Inventory ID
	date DATETIME,			-- * Date and Time
	qty INT,				-- * Quantity
	type INT,				-- Transaction type
	tstate INT,				-- Transaction state
	mstate INT,				-- Money State: 0 - unpaid, 1 - paid
	memo STRING				-- * Memo
);

CREATE TABLE good(
	id INT IDENTITY,
	transId INT,
	state INT,
	position STRING,
	history STRING
);

CREATE TABLE user(			-- User
	id INT IDENTITY,		-- User ID
	name STRING,			-- User Name
	pswd STRING,			-- User Password
	grp INT,				-- User group
	inv INT,				-- Inventory ID
	maker INT				-- Maker ID
);

CREATE TABLE config(
	id INT IDENTITY,		-- ID: 1 - `config`
	data STRING				-- Use JSON to save some configs
);

/*
DB Structure:
	good - trans - stock - item - kind & maker
						 - whouse
	logistic, user, config

index.initStatus();
index.update(c);
index.refresh();
index.saveConfig();

navbar.update();

Trans.newImportation(stock, qty, memo);
Trans.newExportation(stock, qty, memo);
Trans.confirmImportation(transId);
Trans.confirmExportation(transId);
Trans.refuseImportation(transId);
Trans.refuseExportation(transId);

Trans.updateBalance(transId);	// importation



trans - type: 1 - import from maker, 2 - sale export, 3 - transfer import, 4 - transfer export, 5 - other (accidents / damage)
trans-tstate: 1 - wait to deal, 2 - mapped to goods, 3 - finished, 4 - refused
good - state: 1 - ordered, 2 - producing, 3 - produced and waiting transportation, 4 - import transportating, 
			  5 - transported and waiting importation, 6 - importing, 7 - imported and waiting check, 8 - checking,
			  9 - checked and storing, [ -> 7 ]  [ 10 - waiting transfer exportation, 11 - transfer exporting,
			  12 - transfer exported and waiting transportation, 13 - transfer transporting,
			  14 - transfer transported and waiting importation, 15 - transfer importing ( -> 7,8,9 -> ) ],
			  16 - booked and waiting exportation, 17 - exporting, 18 - exported and waiting transportation,
			  19 - export transporting, 20 - export transported and waiting confirm, 21 - confirmed and finished
user - grp :  1 - general manager, 2 - inventory manager, 3 - maker, 4 - driver,
		      5 - import operator, 6 - check operator, 7 - export operator, 8 - customer
config.maximumMode: `Balance`, `Share`, `Maximum`
*/

-- Not consider the logistic fees of sending to customers
-- TRANSFER: When a tranfer transaction appears, it will be splited into two transactions
-- TODO: record all the positions in the system so that system can automatically suggest the position
-- TODO: record the time between two states, which needs a new table

importing: 3, 4, 5, 6, 
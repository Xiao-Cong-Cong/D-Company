### Makers
```
Intel
AMD
ASUS
ASRock
GIGABYTE
PATRIOT
CFD
ZOTAC
MSI
WesternDigital
Seagate
Antec
ZALMAN
Maruwa
HOZAN
E-value
```

### Inventories
```
Tokyo
Shanghai
Singapore
Delhi
```

### Previously

Because I don't know how to use requireJS, so I give up using requireJS temporarily.

### 09.14

Write the status of login in a global var and in cookies. There will be a function to handle this. Global variables: `uName`, `ugid`

The information shown on the navbar will be different, according to different states of ugid.

### 09.18

1. Design and change the database
2. Modify and fill the data to the database
3. Update the db.js
4. User can login when pressing `enter`
5. Try to build the customers' page, but not finished
6. Learned about how to use cookie and fix the bugs.

### 9.19

1. Design the states of goods (14 states -> 20 states)
2. Add `type` and `mstate` two fields into `trans` table, which indicate transaction type and money state.
3. Add a global flag `debug`.
4. Manually generate some data and fill them to the `trans` and `good`.
5. Create several JS files
6. Write the first version of `driver` page.
7. Write the first version of `import operator` page.
8. Write the first version of `export operator` page.
9. Fix the bug of login: judge the state first to avoid login repeatedly.
10. Create `good` table and modify `transaction` table in the navbar.js

### 9.20

15:50
Try to finish the page of customers.

### 9.21

Limit the maximum number people can order when submit.

Finish the order logics of customers.

Record some work flow here:

1. customers make orders    trans: wait to deal, balance is unchanged
2. inventory manager review the trans (auto send)   trans -> mapped, according goods are added to the table `good`

### 9.25

#### review the code

1. When login as a `general manager`(ugid = 1), he/she can switch the role.
    TODO: However, I need to consider about change the inventory in the future.
2. Add tstate to the `trans` table, which indicate whether the trans has mapped to the goods.
    Discuss: Map `trans` to single `good` or `bunch of goods`
3. Inventory manager can automatically handle the orders now.
4. Design and Implement the page of customer, including resize the window automatically.
    TODO: Implement the algorithm of search (may apply it to somewhere else too)
5. Add `tmpGenerate` to the `navbar`, which map `trans` to the `good`
6. Add `switch role` to the `navbar` (more work to do)

#### Continue

1. Add `inventory` field to the cookie.
    change in the `index.js`, `navbar.js`, `login.js`
    Note: When users don't login to the system, states are `'', 0, 0, 0`
    change in the `iprtr.js`, `cprtr.js`, `eprtr.js`
2. Fix a small bug in `customer` page
    Handle the condition when the `input` is not a number
3. Fix a small bug: change the default `inv` as `1`
4. Change navbar's `container` ---> `container-fluid` which use the full screen
5. Add `sidebar` to both `general manager` and `inventory manager` page
6. Add `inventory` information when login as an inventory manager.
7. Change names of `inventory manager`: `inventory1` ---> `imanager1`
8. Add functions that: inventory manager can switch roles to see what his/her employees will see.
9. Add `if clause` to the customer page.

#### Review the code

#### Continue
1. Remove the orders from the list when the quantity is 0.

### 9.26

#### Try to solve the puzzle of `transfer`
1. Change the page of customers
    a. choose the nearest inventory
    b. change `generate`: generate all items in all inventories
    c. When the maximum is 0, just show it but no input
    d. sava the config in the database
        - Create `config` table in the `tmp.sql`
        - Create `config` in the `navbar.js`
        - Build up global variable `config` in the `index.js`
        - Initialize `config` in the `index.js` after `load #navbar`
        - Use `config.shareInventory` to control ...
        - Add `saveConfig` function sync the configuration
    e. general manager can switch `config.shareInventory`
    f. show all the items in inventories, the maximum is the sum of inventories' storage
2. Fix the bug: customer order maximum
3. When customers make orders, reduce the quantity...

Notes:
    maximum is only the reference
    balance will change only when managers confirm

### 9.27

1. Format date to `DateTime`

### 9.28

#### Plan

#### Do

1. Reconstruct code in `index.js` and `navbar.js`


### 10.9

1. config.maximumMode
    use in customer, config in inventory manager (left top)
2. embellish the page of configuring the shelves
3. Improve the page of making a new order
4. Show the status of the transactions
5. Improve the page of transactions

### 10.10

- The position system


- How to transfer from other inventories
- general manager can delete the goods
- change the color, according to storage level


### 10.12

different functions for different operators:

import:
    suggest
    select
    save, place, import
export:
    show
    save, pick, export
check:
    


bug:
    it seems that import orders from different inventories will be handled all by the first import operator.


### 10.13

bug:
    
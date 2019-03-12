var Goods = {};

// Public

Goods.getNewId = function() {
    return alasql('SELECT MAX(id) as id FROM good;')[0].id + 1;
}

// Private

Goods.state = {
    1: 'ordered',
    2: 'producing',
    3: 'produced and waiting transportation',
    4: 'import transportating',
    5: 'transported and waiting importation',
    6: 'importing',
    7: 'imported and waiting check',
    8: 'checking',
    9: 'checked and storing',
    10: 'waiting transfer exportation',
    11: 'transfer exporting',
    12: 'transfer exported and waiting transportation',
    13: 'transfer transporting',
    14: 'transfer transported and waiting importation',
    15: 'transfer importing',
    16: 'booked and waiting exportation',
    17: 'exporting',
    18: 'exported and waiting transportation',
    19: 'export transporting',
    20: 'export transported and waiting confirm',
    21: 'confirmed and finished'
};

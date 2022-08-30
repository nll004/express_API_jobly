const { BadRequestError } = require('../expressError');
const {sqlForPartialUpdate: sqlFunc } = require('./sql');


describe('unittest for sqlForPartialUpdate function', function() {
    test('test returning accurate company keys/vals', function(){
        const result = sqlFunc(
            { numEmployees: 106, logoUrl: "https://google.com" },
            { numEmployees: "num_employees", logoUrl: "logo_url" });
        expect(result).toEqual(
            { setCols: '"num_employees"=$1, "logo_url"=$2',
              values: [ 106, 'https://google.com' ] });
    });
    test('additional key arg should not affect returned data', function(){
        const result = sqlFunc(
            { numEmployees: 9034 },
            { numEmployees: "num_employees", logoUrl: "logo_url" }
        );
        expect(result).toEqual({setCols: '"num_employees"=$1', values: [ 9034 ]});
    });
    test('no keys passed to function results in error', function(){
        expect(() => sqlFunc({}, {numEmployees: "num_employees"})).toThrow(BadRequestError);
    })
})

// already being tested in companies test route:
// Error code. Works from route.


// no keys throws error
// does it actually change info in database?

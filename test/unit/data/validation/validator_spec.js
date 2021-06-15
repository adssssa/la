const should = require('should');

const {validator} = require('../../../../core/server/data/validation');

const validators = ['isLength',
    'isEmpty',
    'isURL',
    'isEmail',
    'isIn',
    'isUUID',
    'isBoolean',
    'isInt',
    'isLowercase',
    'equals',
    'matches'
];

const custom = ['isTimezone', 'isEmptyOrURL', 'isSlug'];

describe('Validator', function () {
    it('should export our required functions', function () {
        should.exist(validator);

        validator.should.have.properties(validators);
        validator.should.have.properties(custom);

        Object.keys(validator).should.eql(validators.concat(custom));
    });

    describe('Custom Validators', function () {
        it('isEmptyOrUrl filters javascript urls', function () {
            validator.isEmptyOrURL('javascript:alert(0)').should.be.false();
            validator.isEmptyOrURL('http://example.com/lol/<script>lalala</script>/').should.be.false();
            validator.isEmptyOrURL('http://example.com/lol?somequery=<script>lalala</script>').should.be.false();
            validator.isEmptyOrURL('').should.be.true();
            validator.isEmptyOrURL('http://localhost:2368').should.be.true();
            validator.isEmptyOrURL('http://example.com/test/').should.be.true();
            validator.isEmptyOrURL('http://www.example.com/test/').should.be.true();
            validator.isEmptyOrURL('http://example.com/foo?somequery=bar').should.be.true();
            validator.isEmptyOrURL('example.com/test/').should.be.true();
        });
    });
});

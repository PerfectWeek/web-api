//
// Created by benar-g on 2018/05/12
//
const chai = require('chai');
const chaiHttp = require('chai-http');

chai.use(chaiHttp);
const expect = chai.expect;


describe('Test', () => {
    describe('Sub-Test 1', () => {
        it('Check if 1 === 1', () => {
            expect(1).to.eql(1);
        })
    });
});

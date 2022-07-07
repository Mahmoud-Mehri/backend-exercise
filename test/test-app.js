// *********************************************************** //
//  We could write test for each Controller module separately  //
//  as Unit Test and then go through the App module, but it    //
//  takes much more time ...                                   //
// *********************************************************** //

const supertest = require('supertest');
const { expect } = require('chai');
const { app } = require('../src/server.js');
const { seed } = require('../scripts/seedDb.js');

const agent = supertest.agent(app);

describe("Testing API Server", () => {
    before(async() => {
        await seed();
    })

    it("Should return a Contract by given ID", function(done) {
        supertest(app)
            .get('/contracts/1')
            .set('profile_id', '1')
            .expect(200, function(err, res) {
                if (err) {
                    return done(err)
                }

                const success = res.body.success;
                expect(success).to.be.equal(true);

                const belongToProfile = (res) => {
                    const contract = res.body.data;
                    const Ids = [contract.ContractId, contract.ClientId];
                    if (!(Ids.includes(1)))
                        throw new Error("Contract is not for that profile");
                }

                expect(belongToProfile);

                done();
            });
    })

    it("Should not return the Contract if it's not related to the Profile", function(done) {
        supertest(app)
            .get('/contracts/1')
            .set('profile_id', '2')
            .expect(403, function(err, res) {
                if (err) {
                    return done(err)
                }

                const success = res.body.success;
                const message = res.body.message;
                expect(success).to.be.equal(false);

                expect(message).to.be.equal("You don't have permission to retrieve this contract");

                done();
            });
    })

    it("Should return the list of Non-Terminated Contracts for given Profile", function(done) {
        supertest(app)
            .get('/contracts/')
            .set('profile_id', '5')
            .expect(200, function(err, res) {
                if (err) {
                    return done(err)
                }

                const success = res.body.success;
                const data = res.body.data;
                expect(success).to.be.equal(true);

                expect(data.length).to.be.equal(1);

                expect(data[0].status === 'in_progress');

                done();
            });
    })


    it("Should return all Unpaid Jobs related to the Profile", function(done) {
        supertest(app)
            .get('/jobs/unpaid')
            .set('profile_id', '2')
            .expect(200, function(err, res) {
                if (err) {
                    return done(err)
                }

                const success = res.body.success;
                const data = res.body.data;
                expect(success).to.be.equal(true);

                expect(data.length).to.be.equal(2);

                done();
            });
    })

    it("Client Profile should NOT be able to pay for a Job if it has NOT enough Balance", function(done) {
        supertest(app)
            .post('/jobs/7/pay')
            .set('profile_id', '4')
            .expect(200, function(err, res) {
                if (err) {
                    return done(err)
                }

                const success = res.body.success;
                const message = res.body.message;
                expect(success).to.be.equal(false);

                expect(message).to.be.equal("You don't have enough balance to pay for this Job")

                done();
            });
    })

    it("Client Profile should NOT be able to pay for a Job if the given Job is not related to it", function(done) {
        supertest(app)
            .post('/jobs/5/pay')
            .set('profile_id', '2')
            .expect(200, function(err, res) {
                if (err) {
                    return done(err)
                }

                const success = res.body.success;
                const message = res.body.message;
                expect(success).to.be.equal(false);

                expect(message).to.be.equal("You're not the Client of this contract!")

                done();
            });
    })

    it("Client Profile should be able to pay for a Job if it has enough Balance", (done) => {

        let balanceBefore;
        let balanceAfter;

        supertest(app)
            .get('/profiles/6')
            .set('profile_id', '6')
            .expect(200)
            .then((res) => {
                const success = res.body.success;
                expect(success).to.be.equal(true);

                const data = res.body.data;
                balanceBefore = data.balance;

                supertest(app)
                    .post('/jobs/4/pay')
                    .set('profile_id', '6')
                    .expect(200)
                    .then((res) => {
                        const success = res.body.success;
                        expect(success).to.be.equal(true);

                        supertest(app)
                            .get('/profiles/6')
                            .set('profile_id', '6')
                            .expect(200)
                            .then((res) => {
                                const success = res.body.success;
                                expect(success).to.be.equal(true);

                                const data = res.body.data;
                                balanceAfter = data.balance;

                                expect(balanceBefore).greaterThan(balanceAfter);

                                done();
                            }).catch(done)
                    }).catch(done)
            }).catch(done);
    }).timeout(5000);

    it("User should not be able to deposit more than 25% on total price of unpaid Jobs", function(done) {
        supertest(app)
            .post('/balances/deposit/4')
            .set('profile_id', '4')
            .send({ value: 200 })
            .expect(200, function(err, res) {
                if (err) {
                    return done(err)
                }

                const success = res.body.success;
                const message = res.body.message;
                expect(success).to.be.equal(false);

                expect(message.slice(0, 16)).to.be.equal("You have exeeded")

                done();
            });
    })

    it("Users should be able to deposite money in their balance", (done) => {

        let balanceBefore;
        let balanceAfter;

        supertest(app)
            .get('/profiles/4')
            .set('profile_id', '4')
            .expect(200)
            .then((res) => {
                const success = res.body.success;
                expect(success).to.be.equal(true);

                const data = res.body.data;
                balanceBefore = data.balance;

                supertest(app)
                    .post('/balances/deposit/4')
                    .set('profile_id', '4')
                    .send({ value: 45 })
                    .expect(200)
                    .then((res) => {
                        const success = res.body.success;
                        expect(success).to.be.equal(true);

                        supertest(app)
                            .get('/profiles/4')
                            .set('profile_id', '4')
                            .expect(200)
                            .then((res) => {
                                const success = res.body.success;
                                expect(success).to.be.equal(true);

                                const data = res.body.data;
                                balanceAfter = data.balance;

                                expect(balanceAfter).greaterThan(balanceBefore);

                                done();
                            }).catch(done)
                    }).catch(done)
            }).catch(done);
    }).timeout(5000);

    it("Should return the Best Profession in a given priod", function(done) {
        supertest(app)
            .get('/admin/best-profession?start=05/02/2020&end=06/14/2022')
            .set('profile_id', '1')
            .expect(200, function(err, res) {
                if (err) {
                    return done(err)
                }

                const success = res.body.success;
                const data = res.body.data;
                expect(success).to.be.equal(true);

                expect(data.length).to.be.equal(1);

                done();
            });
    })

    it("Should return the list of Best Clients in a given priod and in a given limit", function(done) {
        supertest(app)
            .get('/admin/best-clients?start=05/02/2020&end=06/14/2022&limit=3')
            .set('profile_id', '1')
            .expect(200, function(err, res) {
                if (err) {
                    return done(err)
                }

                const success = res.body.success;
                const data = res.body.data;
                expect(success).to.be.equal(true);

                expect(data.length).to.be.equal(3);

                done();
            });
    })

})
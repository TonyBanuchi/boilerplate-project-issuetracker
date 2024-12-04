const chaiHttp = require('chai-http');
const chai = require('chai');
const assert = chai.assert;
const server = require('../server');
const req = require('express/lib/request');
const {ObjectId} = require('mongodb')

chai.use(chaiHttp);
const siteUrl = 'https://3000-tonybanuchi-boilerplate-id29srsh42d.ws-us117.gitpod.io';
suite('Functional Tests', function () {
    let targetId1, targetId2;
    suite('Create - POST', () => {
        // Create an issue with every field: POST request to /api/issues/{project}
        test('Create New Issue - All Fields', function (done) {
            chai.request(server).keepOpen().post('/api/issues/testing').send(
                {
                    assigned_to: "Test",
                    status_text: "Test",
                    issue_title: "Test",
                    issue_text: "Test",
                    created_by: "Test",
                    project: 'testing'
                }
            ).end(
                (err, res) => {
                    assert.equal(res.status, 200, 'Response status should be 200');
                    assert.deepEqual(
                        res.body,
                        {
                            "assigned_to": "Test",
                            "status_text": "Test",
                            "open": true,
                            "_id": res.body._id,
                            "issue_title": "Test",
                            "issue_text": "Test",
                            "created_by": "Test",
                            "created_on": res.body.created_on,
                            "updated_on": res.body.updated_on
                        },
                        'Response should contain new issue object'
                    );
                    targetId1 = res.body._id;
                    done();
                }
            );
        });
        // Create an issue with only required fields: POST request to /api/issues/{project}
        test('Create New Issue - only req flds', function (done) {
            chai.request(server).keepOpen().post('/api/issues/testing').send(
                {
                    assigned_to: "",
                    status_text: "",
                    issue_title: "Test",
                    issue_text: "Test",
                    created_by: "Test"
                }
            ).end(
                (err, res) => {
                    assert.equal(res.status, 200, 'Response status should be 200');
                    assert.deepEqual(
                        res.body,
                        {
                            "assigned_to": "",
                            "status_text": "",
                            "open": true,
                            "_id": res.body._id,
                            "issue_title": "Test",
                            "issue_text": "Test",
                            "created_by": "Test",
                            "created_on": res.body.created_on,
                            "updated_on": res.body.updated_on
                        },
                        'Response should contain new issue object'
                    );
                    targetId2 = res.body._id;
                    done();
                }
            );
        });
        // Create an issue with missing required fields: POST request to /api/issues/{project}
        test('Attempt creation missing req flds', function (done) {
            chai.request(server).keepOpen().post('/api/issues/testing').send(
                {
                    assigned_to: "Test",
                    status_text: "Test",
                    issue_text: "Test",
                    created_by: "",
                }
            ).end(
                (err, res) => {
                    assert.equal(res.status, 200, 'Response status should be 200');
                    assert.deepEqual(
                        res.body,
                        { "error": "required field(s) missing" },
                        'Response should be an error on creation'
                    );
                    done();
                }
            );
        });
    }); 
    suite('Read - GET', () => {
        // View issues on a project: GET request to /api/issues/{project}
        test('View all issues on {project}', function (done) {
            chai.request(server).keepOpen().get('/api/issues/testing').end(
                (err, res) => {
                    assert.equal(res.status, 200, 'Response status should be 200');
                    assert.typeOf(res.body, 'Array', 'Should return Array of all issues from {project}');
                    done();
                }
            );
        });
        // View issues on a project with one filter: GET request to /api/issues/{project}?filter_field=value
        test('View all Items matching filter for {project}', function (done) {
            chai.request(server).keepOpen().get('/api/issues/testing?open=true').end(
                (err, res) => {
                    assert.equal(res.status, 200, 'Response status should be 200');
                    assert.typeOf(res.body, 'Array', 'Should return Array of open issues from {project}');
                    done();
                }
            );
        });
        // View issues on a project with multiple filters: GET request to /api/issues/{project}?filter_field=value&filter_field=value
        test('View Items, Multi-filter', function (done) {
            chai.request(server).keepOpen().get('/api/issues/testing?open=true&&status_text=Test').end(
                (err, res) => {
                    assert.equal(res.status, 200, 'Response status should be 200');
                    assert.typeOf(res.body, 'Array', 'Should return Array of open issues with "Test" as status_text from {project}');
                    done();
                }
            );
        });
    }); 
    
    suite('Update - PUT', () => {
        // Update one field on an issue: PUT request to /api/issues/{project}
        test('Update one field on an issue', function (done) {
            chai.request(server).keepOpen().put('/api/issues/testing').send(
                {
                    _id: targetId1,
                    assigned_to: "Tester"
                }
            ).end(
                (err, res) => {
                    assert.equal(res.status, 200, 'Response status should be 200');
                    assert.deepEqual(
                        res.body,
                        { "result": "successfully updated", "_id": targetId1 }
                        ,
                        'Response should contain confirmation object'
                    );
                    done();
                }
            );
        });
        // Update multiple fields on an issue: PUT request to /api/issues/{project}
        test('Update multiple fields on an issue', function (done) {
            chai.request(server).keepOpen().put('/api/issues/testing').send(
                {
                    _id: targetId2,
                    assigned_to: "Tester",
                    status_text: "Test",
                    issue_title: "Test",
                    issue_text: "Test",
                    created_by: "Test",
                }
            ).end(
                (err, res) => {
                    assert.equal(res.status, 200, 'Response status should be 200');
                    assert.deepEqual(
                        res.body,
                        { "result": "successfully updated", "_id": targetId2 }
                        ,
                        'Response should contain confirmation object'
                    );
                    done();
                }
            );
        });
        // Update an issue with missing _id: PUT request to /api/issues/{project}
        test('Update an issue with missing _id', function (done) {
            chai.request(server).keepOpen().put('/api/issues/testing').send(
                {
                    assigned_to: "Test",
                    status_text: "Test",
                    issue_title: "Test",
                    issue_text: "Test",
                    created_by: "Test"
                }
            ).end(
                (err, res) => {
                    assert.equal(res.status, 200, 'Response status should be 200');
                    assert.deepEqual(
                        res.body,
                        { error: 'missing _id' },
                        'Response should contain error object'
                    );
                    done();
                }
            );
        });
        // Update an issue with no fields to update: PUT request to /api/issues/{project}
        test('Update an issue with no fields to update', function (done) {
            chai.request(server).keepOpen().put('/api/issues/testing').send(
                {
                    _id: targetId1,
                    assigned_to: "",
                    status_text: "",
                    issue_title: "",
                    issue_text: "",
                    created_by: "",
                }
            ).end(
                (err, res) => {
                    assert.equal(res.status, 200, 'Response status should be 200');
                    assert.deepEqual(
                        res.body,
                        { "result": "successfully updated", "_id": targetId1 }
                        ,
                        'Response should contain confirmation object'
                    );
                    done();
                }
            );
        });
        // Update an issue with an invalid _id: PUT request to /api/issues/{project}
        test('Update an issue with an invalid _id', function (done) {
            chai.request(server).keepOpen().put('/api/issues/testing').send(
                {
                    _id: "123",
                    assigned_to: "Test",
                    status_text: "Test",
                    issue_title: "Test",
                    issue_text: "Test",
                    created_by: "Test",
                }
            ).end(
                (err, res) => {
                    assert.equal(res.status, 200, 'Response status should be 200');
                    assert.deepEqual(
                        res.body,
                        { "error": "could not update", "_id": "123" },
                        'Response should contain error object'
                    );
                    done();
                }
            );
        });
        // Update an issue with an invalid _id: PUT request to /api/issues/{project}
        test('Update an issue with an invalid _id', function (done) {
            const invalidId = new ObjectId().toString();
            chai.request(server).keepOpen().put('/api/issues/testing').send(
                {
                    _id: invalidId,
                    assigned_to: "Test",
                    status_text: "Test",
                    issue_title: "Test",
                    issue_text: "Test",
                    created_by: "Test",
                }
            ).end(
                (err, res) => {
                    assert.equal(res.status, 200, 'Response status should be 200');
                    assert.deepEqual(
                        res.body,
                        { "error": "could not update", "_id": invalidId },
                        'Response should contain error object'
                    );
                    done();
                }
            );
        });
    }); 
    
    suite('Delete - DELETE', () => {
        // Delete an issue: DELETE request to /api/issues/{project}
        test('Delete an issue', function (done) {
            chai.request(server).keepOpen().delete('/api/issues/testing').send(
                {
                    _id: targetId1
                }
            ).end(
                (err, res) => {
                    assert.equal(res.status, 200, 'Response status should be 200');
                    assert.deepEqual(
                        res.body,
                        { "result": "successfully deleted", "_id": targetId1},
                        'Response should contain delete confirmation'
                    );
                    done();
                }
            );
        });
        // Delete an issue with an invalid _id: DELETE request to /api/issues/{project}
        test('Delete an issue with an invalid _id', function (done) {
            const invalidId = '123'
            chai.request(server).keepOpen().delete('/api/issues/testing').send(
                { _id: invalidId }
            ).end(
                (err, res) => {
                    assert.equal(res.status, 200, 'Response status should be 200');
                    assert.deepEqual(
                        res.body,
                        { "error": "could not delete", "_id": invalidId },
                        'Response should contain new issue object'
                    );
                    done();
                }
            );
        });
        // Delete an issue with an invalid _id: DELETE request to /api/issues/{project}
        test('Delete an issue with an invalid _id', function (done) {
            const invalidId = new ObjectId().toString();
            chai.request(server).keepOpen().delete('/api/issues/testing').send(
                { _id: invalidId }
            ).end(
                (err, res) => {
                    assert.equal(res.status, 200, 'Response status should be 200');
                    assert.deepEqual(
                        res.body,
                        { "error": "could not delete", "_id": invalidId },
                        'Response should contain new issue object'
                    );
                    done();
                }
            );
        });
        // Delete an issue with missing _id: DELETE request to /api/issues/{project}
        test('Delete an issue with missing _id', function (done) {
            chai.request(server).keepOpen().delete('/api/issues/testing').send(
                {}
            ).end(
                (err, res) => {
                    assert.equal(res.status, 200, 'Response status should be 200');
                    assert.deepEqual(
                        res.body,
                        { error: 'missing _id' },
                        'Response should contain error object'
                    );
                    done();
                }
            );
        });
    });
});

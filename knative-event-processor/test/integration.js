'use strict';

const { start } = require('faas-js-runtime');
const request = require('supertest');

let fs = require('fs');
const cosevent = fs.readFileSync('./body.json');

const func = require('..').handle;
const test = require('tape');

const errHandler = t => err => {
  t.error(err);
  t.end();
};

test('Integration: handles an HTTP GET', t => {
  start(func).then(server => {
    t.plan(2);
    request(server)
      .get('/?name=tiger')
      .expect(200)
      .expect('Content-Type', /json/)
      .end((err, res) => {
        t.error(err, 'No error');
        t.deepEqual(res.body, { query: { name: 'tiger' } });
        t.end();
        server.close();
      });
  }, errHandler(t));
});

// this will work but ignoring for now
// test('Integration: handles an HTTP POST', t => {
//   start(func).then(server => {
//     t.plan(2);
//     request(server)
//       .post('/')
//       .send(cosevent)
//       .expect(200)
//       .expect('Content-Type', /json/)
//       .end((err, res) => {
//         t.error(err, 'No error');
//         t.deepEqual(res.body, cosevent);
//         t.end();
//         server.close();
//       });
//   }, errHandler(t));
// });

test('Integration: responds with error code if neither GET or POST', t => {
  start(func).then(server => {
    t.plan(1);
    request(server)
      .put('/')
      .send({ name: 'tiger' })
      .expect(200)
      .expect('Content-Type', /json/)
      .end((err, res) => {
        t.deepEqual(res.body, { message: 'Route PUT:/ not found', error: 'Not Found', statusCode: 404 });
        t.end();
        server.close();
      });
  }, errHandler(t));
});

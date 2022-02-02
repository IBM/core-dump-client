'use strict';

const { start } = require('faas-js-runtime');
const request = require('supertest');

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

// IGNORING FOR NOW
// test('Integration: handles an HTTP POST', t => {
//   start(func).then(server => {
//     t.plan(2);
//     request(server)
//       .post('/')
//       .send({  
//         bucket: "core-storage",  
//         endpoint: "",  
//         key: "3927906d-5b6d-4ff8-8a61-937bcada155b-dump-1643657577-segfaulter-segfaulter-1-4.zip",  
//         notification: {  
//           bucket_name: "core-storage",  
//           content_type: "application/octet-stream",  
//           event_type: "Object:Write",  
//           format: "2.0",  
//           object_etag: "f68a47ca5da37992f024695d1fdf38fb",  
//           object_length: "28336",  
//           object_name: "3927906d-5b6d-4ff8-8a61-937bcada155b-dump-1643657577-segfaulter-segfaulter-1-4.zip",  
//           request_id: "8a1186ad-c2fe-4830-b98f-c302d7caca0a",  
//           request_time: "2022-01-31T19:32:59.395Z"  
//         },  
//         operation: "Object:Write"  
//       })
//       .expect(200)
//       .expect('Content-Type', /json/)
//       .end((err, res) => {
//         t.error(err, 'No error');
//         t.deepEqual(res.body, {  
//           bucket: "core-storage",  
//           endpoint: "",  
//           key: "3927906d-5b6d-4ff8-8a61-937bcada155b-dump-1643657577-segfaulter-segfaulter-1-4.zip",  
//           notification: {  
//             bucket_name: "core-storage",  
//             content_type: "application/octet-stream",  
//             event_type: "Object:Write",  
//             format: "2.0",  
//             object_etag: "f68a47ca5da37992f024695d1fdf38fb",  
//             object_length: "28336",  
//             object_name: "3927906d-5b6d-4ff8-8a61-937bcada155b-dump-1643657577-segfaulter-segfaulter-1-4.zip",  
//             request_id: "8a1186ad-c2fe-4830-b98f-c302d7caca0a",  
//             request_time: "2022-01-31T19:32:59.395Z"  
//           },  
//           operation: "Object:Write"  
//         });
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

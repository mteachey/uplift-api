const knex = require('knex');
const app = require('../src/app')
require('dotenv').config()

const { makeUsersArray } = require('./users.fixtures.js');
const { makeConnectionsArray} = require('./connections.fixtures.js');

describe.only(`Uplift endpoints`,()=>{
    let db 

    before('make knex instance',()=>{
        db = knex({
            client: 'pg',
            connection: process.env.TEST_DATABASE_URL,
          })
          app.set('db', db)
        })

    after('disconnect from db',()=>db.destroy())

    before('clean the table', () => db.raw('TRUNCATE uplift_connections, uplift_bookmarks, uplift_connections, uplift_users RESTART IDENTITY CASCADE'))

    afterEach('cleanup',() => db.raw('TRUNCATE uplift_connections, uplift_bookmarks, uplift_connections, uplift_users RESTART IDENTITY CASCADE'))

    describe(`GET/api/connections`,()=>{
        context(`Given no connections`,()=>{
            it(`responds with 200 and an empty list`,()=>{
                return supertest(app)
                .get('/api/connections')
               // .set('Authorization', `Bearer ${process.env.API_TOKEN}`)
                .expect(200,[])
            })
        })//end of context no connections

        context('Given there are connections in the database',()=>{
            const testUsers = makeUsersArray();
            const testConnections = makeConnectionsArray();

            beforeEach(`insert users and connections`,()=>{
                return db
                .into('uplift_users')
                .insert(testUsers)
                .then(()=>{
                    return db
                        .into('uplift_connections')
                        .insert(testConnections)
                })
            })//end beforeEach

            it(`responds with all connections`,()=>{
                return supertest(app)
                .get('/api/connections')
               // .set('Authorization', `Bearer ${process.env.API_TOKEN}`)
                .expect(200)
                .expect(res=>{
                    expect(res.body.id).to.eql(testConnections.id)
                    expect(res.body.user_id).to.eql(testConnections.user_id)
                    expect(res.body.followee_id).to.eql(testConnections.followee_id)
                })
            })//end it responds with all connections

          it(`responds with error message if request for userid not there`,()=>{
                return supertest(app)
                .get('/api/connections?userid=1235')
                .expect(404, {error: {message: `That user has no connections`}})
            })
        })//end context connections in db
    })//end of GET /connections

    describe(`POST /api/connections`,()=>{
        const testUsers = makeUsersArray();
        beforeEach(`insert users`,()=>{
            return db
                .into('uplift_users')
                .insert(testUsers)
        })//end beforeEach

        it(`create a connection, responds with a 201 and the new connection`,function(){
            this.retries(3)
            const newConnection={
                "user_id":2, 
                "followee_id":3
            }

            return supertest(app)
                .post('/api/connections')
                .send(newConnection)
                .expect(res=>{
                    expect(res.body.followee_id).to.eql(newConnection.followee_id)
                    expect(res.body.user_id).to.eql(newConnection.user_id)
                })
        })//end it create connection

       const requiredFields = ['user_id', 'followee_id']

        requiredFields.forEach(field=>{
            const newConnection = {
                "user_id":2, 
                "followee_id":3
            }
        
            it(`responds with a 400 and error message when the ${field} is missing`,()=>{
                delete newConnection[field]

                return supertest(app)
                    .post(`/api/connections`)
                    .send(newConnection)
                    .expect(400, {
                        error: { message: `Missing user_id or followee_id in request body` }
                    })
            })//end of it 400
        })//end of forEach*/


    })//end describe POST /connection

    describe(`DELETE /api/connections/:connection_id`,()=>{
        context(`Given no connections in db`,()=>{
            it(`responds with 404`, () => {
                const connectionId = 123456
                  return supertest(app)
                  .delete(`/api/connections/${connectionId}`)
                  .expect(404, { error: {message: `Connection doesn't exist` } })
              })
        })//end of context no connection in db

        context(`Given connections in db`,()=>{
            const testUsers = makeUsersArray()
            const testConnections = makeConnectionsArray()

            beforeEach(`insert users and connections`,()=>{
                return db
                .into('uplift_users')
                .insert(testUsers)
                .then(()=>{
                    return db
                        .into('uplift_connections')
                        .insert(testConnections)
                })
            })//end beforeEach


            it(`responds with 204 and removes the connection`,()=>{
                const idToRemove = 2
                expectedconnections = testConnections.filter(
                    connection => connection.id !== idToRemove)

                return supertest(app)
                    .delete(`/api/connections/${idToRemove}`)
                    .expect(204)
                    .then(res =>
                        supertest(app)
                        .get(`/api/connections`)
                        .expect(res=>{
                            expect(res.body.user_id).to.eql(expectedconnections.user_id)
                            expect(res.body.followee_id).to.eql(expectedconnections.followee_id)
                        })
                    )
            })//end of it responds with 204
            
        })//end of context connections in db
    })//end of DELETE /connections/:connection_id


})//end of Uplift describe endpoints
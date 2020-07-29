const knex = require('knex');
const app = require('../src/app')
require('dotenv').config()

const { makeUsersArray } = require('./users.fixtures.js')

describe(`Uplift endpoints`,()=>{
    let db 

    before('make knex instance',()=>{
        db = knex({
            client: 'pg',
            connection: process.env.TEST_DATABASE_URL,
          })
          app.set('db', db)
        })

    after('disconnect from db',()=>db.destroy())

    before('clean the table', () => db.raw('TRUNCATE uplift_connections, uplift_bookmarks, uplift_posts, uplift_users RESTART IDENTITY CASCADE'))

    afterEach('cleanup',() => db.raw('TRUNCATE uplift_connections, uplift_bookmarks, uplift_posts, uplift_users RESTART IDENTITY CASCADE'))

    describe(`GET /`,()=>{
        context(`initial test of endpoint`,()=>{
            it(`responds with Hello, World`,()=>{
                return supertest(app)
                .get('/')
                .set('Authorization', `Bearer ${process.env.API_TOKEN}`)
                .expect('Hello, world!')
            })
        })//end context GET/
    })//end describe GET/

    describe(`GET/api/users`,()=>{
        context(`Given no users`,()=>{
            it(`responds with 200 and an empty list`,()=>{
                return supertest(app)
                .get('/api/users')
                .set('Authorization', `Bearer ${process.env.API_TOKEN}`)
                .expect(200,[])
            })
        })//end of context no users

        context('Given there are users in the database',()=>{
            const testUsers = makeUsersArray()

            beforeEach(`insert users`,()=>{
                return db
                .into('uplift_users')
                .insert(testUsers)
            })//end beforeEach

            it(`responds with all users`,()=>{
                return supertest(app)
                .get('/api/users')
                .set('Authorization', `Bearer ${process.env.API_TOKEN}`)
                .expect(200)
                .expect(res=>{
                    expect(res.body.id).to.eql(testUsers.id)
                    expect(res.body.username).to.eql(testUsers.username)
                    expect(res.body.fullname).to.eql(testUsers.fullname)
                })
            })//end it responds with all users
        })//end context users in db
    })//end of GET /users

    describe(`POST /api/users endpoint`,()=>{

        it(`creates a user, responding with 201 and the new user's fullname, username, and userid`,function(){
            this.retries(3)
            const newUser = {
                "fullname":"test FullName", 
                "username":"testNewuser5", 
                "password":"needAbetterpassword"
            }
            //changes username to lowercase
            const expectedUser = {
                "fullname":"test FullName", 
                "username":"testnewuser5", 
                "password":"needAbetterpassword"
            }
            return supertest(app)
                .post('/api/users')
                .set('Authorization', `Bearer ${process.env.API_TOKEN}`)
                .send(newUser)
                .expect(res=>{
                    expect(res.body.username).to.eql(expectedUser.username)
                    expect(res.body.fullname).to.eql(expectedUser.fullname)
                    expect(res.body).to.have.property('id')
                    expect(res.headers.location).to.eql(`/api/users/${res.body.id}`)
                })
        })//end it create user, res 201

        const requiredFields = [ 'fullname', 'username','password']

        requiredFields.forEach(field=>{
            const newUser = {
                "fullname":"test FullName", 
                "username":"testNewuser10", 
                "password":"needAbetterpassword"
            }

        
        it(`responds with 400 and error message when the ${field}`,()=>{

                delete newUser[field]

                return supertest(app)
                    .post('/api/users')
                    .set('Authorization', `Bearer ${process.env.API_TOKEN}`)
                    .send(newUser)
                    .expect(400, {
                        error:{message: `Missing '${field}' in request body`}
                    })
            })
        })//end of it no required field
 
    })//end of POST

    describe(`GET /api/users/:user_id`,()=>{
        context(`Given no users`,()=>{
            it(`returns a 404 with error message`,()=>{
                userId = 1234

                return supertest(app)
                    .get(`/api/users/${userId}`)
                    .set('Authorization', `Bearer ${process.env.API_TOKEN}`)
                    .expect(404, {error:{message: `User doesn't exist` }})
            })//end of it 404
        })//end of context no notes in db

        context(`Given notes in db`,()=>{
            
            const testUsers = makeUsersArray()

            beforeEach(`insert users`,()=>{
                return db
                .into('uplift_users')
                .insert(testUsers)
            })//end beforeEach

            it(`responds with the specified user`,()=>{
                const userId = 1

                const expectedUser = testUsers[userId - 1]

                return supertest(app)
                    .get(`/api/users/${userId}`)
                    .set('Authorization', `Bearer ${process.env.API_TOKEN}`)
                    .expect(200)
                    .expect(res=>{
                        expect(res.body.username).to.eql(expectedUser.username)
                        expect(res.body.fullname).to.eql(expectedUser.fullname)
                    })

            })//end of it responds with note
        })//end of context notes in db
    })//end of Get User by user_id

    describe(`DELETE /api/users/:user_id`,()=>{
        context(`Given no users in db`,()=>{
            it(`responds with 404`, () => {
                const userId = 123456
                  return supertest(app)
                  .delete(`/api/users/${userId}`)
                  .set('Authorization', `Bearer ${process.env.API_TOKEN}`)
                  .expect(404, { error: {message: `User doesn't exist` } })
              })
        })//end of context no users in db

        context(`Given users in db`,()=>{
            const testUsers = makeUsersArray()

            beforeEach(`insert test users`,()=>{
                return db 
                    .into('uplift_users')
                    .insert(testUsers)
            })


            it(`responds with 204 and removes the user`,()=>{
                const idToRemove = 2
                expectedUsers = testUsers.filter(
                    user => user.id !== idToRemove)

                return supertest(app)
                    .delete(`/api/users/${idToRemove}`)
                    .set('Authorization', `Bearer ${process.env.API_TOKEN}`)
                    .expect(204)
                    .then(res =>
                        supertest(app)
                        .get(`/api/users`)
                        .expect(res=>{
                            expect(res.body.username).to.eql(expectedUsers.username)
                            expect(res.body.fullname).to.eql(expectedUsers.fullname)
                        })
                    )
            })//end of it responds with 204
            
        })//end of context users in db
    })//end of DELETE /users/:user_id


})//end of Uplift describe endpoints
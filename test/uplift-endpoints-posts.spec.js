const knex = require('knex');
const app = require('../src/app')
require('dotenv').config()

const { makeUsersArray } = require('./users.fixtures.js');
const { makePostsArray} = require('./posts.fixtures.js');

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
              //  .set('Authorization', `Bearer ${process.env.API_TOKEN}`)
                .expect('Hello, world!')
            })
        })//end context GET/
    })//end describe GET/

    describe(`GET/api/posts`,()=>{
        context(`Given no posts`,()=>{
            it(`responds with 200 and an empty list`,()=>{
                return supertest(app)
                .get('/api/posts')
               // .set('Authorization', `Bearer ${process.env.API_TOKEN}`)
                .expect(200,[])
            })
        })//end of context no posts

        context('Given there are posts in the database',()=>{
            const testUsers = makeUsersArray();
            const testPosts = makePostsArray();

            beforeEach(`insert users and posts`,()=>{
                return db
                .into('uplift_users')
                .insert(testUsers)
                .then(()=>{
                    return db
                        .into('uplift_posts')
                        .insert(testPosts)
                })
            })//end beforeEach

            it(`responds with all posts`,()=>{
                return supertest(app)
                .get('/api/posts')
               // .set('Authorization', `Bearer ${process.env.API_TOKEN}`)
                .expect(200)
                .expect(res=>{
                    expect(res.body.id).to.eql(testPosts.id)
                    expect(res.body.user_id).to.eql(testPosts.user_id)
                    expect(res.body.title).to.eql(testPosts.title)
                    expect(res.body.link).to.eql(testPosts.link)
                    expect(res.body.start_date).to.eql(testPosts.start_date)
                    expect(res.body.by).to.eql(testPosts.by)
                    expect(res.body.content).to.eql(testPosts.content)
                    expect(res.body.post_type).to.eql(testPosts.post_type)
                    expect(res.body.date_created).to.eql(testPosts.date_created)
                })
            })//end it responds with all posts

          it(`responds with error message if request for userid not there`,()=>{
                return supertest(app)
                .get('/api/posts?userid=1235')
                .expect(404, {error: {message: `Posts with that username or id do not exsit`}})
            })
        })//end context posts in db
    })//end of GET /posts

    describe(`POST /api/posts`,()=>{
        const testUsers = makeUsersArray();
        beforeEach(`insert users`,()=>{
            return db
                .into('uplift_users')
                .insert(testUsers)
        })//end beforeEach

        it(`create a post, responds with a 201 and the new post`,function(){
            this.retries(3)
            const newPost={
                "user_id":2, 
                "content":"some content", "post_type":"reflection"
            }

            return supertest(app)
                .post('/api/posts')
                .send(newPost)
                .expect(res=>{
                    expect(res.body.content).to.eql(newPost.content)
                    expect(res.body.post_type).to.eql(newPost.post_type)
                    expect(res.body.user_id).to.eql(newPost.user_id)
                    expect(res.body).to.have.property('id')
                    expect(res.headers.location).to.eql(`/api/posts/${res.body.id}`)
                })
        })//end it create connection

       const requiredFields = ['user_id', 'post_type']

        requiredFields.forEach(field=>{
            const newPost = {
                "user_id":2, 
                "content":"some content", "post_type":"reflection"
            }
        
            it(`responds with a 400 and error message when the ${field} is missing`,()=>{
                delete newPost[field]

                return supertest(app)
                    .post(`/api/posts`)
                    .send(newPost)
                    .expect(400, {
                        error: { message: `Missing ${field} in request body` }
                    })
            })//end of it 400
        })//end of forEach*/

        const newPostWrongType = {
            "user_id":2, 
            "content":"some content", "post_type":"refletion"
        }
        it(`responds with a 400 and error message when the post type isn't valid`,()=>{

            return supertest(app)
                .post(`/api/posts`)
                .send(newPostWrongType)
                .expect(400, {
                    error: { message : `Post type must be either reflection, music, event ,book, or podcast` }
                })
        })//end of it 400


    })//end describe POST /posts

    describe(`GET /api/posts/:post_id`,()=>{
        context(`Given no posts`,()=>{
            it(`returns a 404 with error message`,()=>{
                postId = 1234

                return supertest(app)
                    .get(`/api/posts/${postId}`)
                    .expect(404, {error:{message: `Post doesn't exist` }})
            })//end of it 404
        })//end of context no posts in db

        context(`Given posts in db`,()=>{
            
            const testUsers = makeUsersArray()
            const testPosts = makePostsArray()

            beforeEach(`insert users and posts`,()=>{
                return db
                .into('uplift_users')
                .insert(testUsers)
                .then(()=>{
                    return db
                        .into('uplift_posts')
                        .insert(testPosts)
                })
            })//end beforeEach

            it(`responds with the specified post`,()=>{
                const postId = 1

                const expectedPost = testPosts[postId - 1]

                return supertest(app)
                    .get(`/api/posts/${postId}`)
                    .expect(200)
                    .expect(res=>{
                        expect(res.body.post_type).to.eql(expectedPost.post_type)
                        expect(res.body.user_id).to.eql(expectedPost.user_id)
                    })

            })//end of it responds with post
        })//end of context posts in db
    })//end of Get Post by post_id

    describe(`DELETE /api/posts/:post_id`,()=>{
        context(`Given no posts in db`,()=>{
            it(`responds with 404`, () => {
                const postId = 123456
                  return supertest(app)
                  .delete(`/api/posts/${postId}`)
                  .expect(404, { error: {message: `Post doesn't exist` } })
              })
        })//end of context no post in db

        context(`Given users in db`,()=>{
            const testUsers = makeUsersArray()
            const testPosts = makePostsArray()

            beforeEach(`insert users and posts`,()=>{
                return db
                .into('uplift_users')
                .insert(testUsers)
                .then(()=>{
                    return db
                        .into('uplift_posts')
                        .insert(testPosts)
                })
            })//end beforeEach


            it(`responds with 204 and removes the post`,()=>{
                const idToRemove = 2
                expectedPosts = testPosts.filter(
                    post => post.id !== idToRemove)

                return supertest(app)
                    .delete(`/api/posts/${idToRemove}`)
                    .expect(204)
                    .then(res =>
                        supertest(app)
                        .get(`/api/posts`)
                        .expect(res=>{
                            expect(res.body.post_type).to.eql(expectedPosts.post_type)
                            expect(res.body.user_id).to.eql(expectedPosts.user_id)
                        })
                    )
            })//end of it responds with 204
            
        })//end of context posts in db
    })//end of DELETE /posts/:post_id


})//end of Uplift describe endpoints
const knex = require('knex');
const app = require('../src/app')
require('dotenv').config()

const { makeUsersArray } = require('./users.fixtures.js');
const {makePostsArray } = require('./posts.fixtures.js')
const { makeBookmarksArray} = require('./bookmarks.fixtures.js');

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

    before('clean the table', () => db.raw('TRUNCATE uplift_bookmarks, uplift_connections, uplift_posts, uplift_users RESTART IDENTITY CASCADE'))

    afterEach('cleanup',() => db.raw('TRUNCATE uplift_bookmarks, uplift_connections, uplift_posts, uplift_users RESTART IDENTITY CASCADE'))

    describe(`GET/api/bookmarks`,()=>{
        context(`Given no bookmarks`,()=>{
            it(`responds with 200 and an empty list`,()=>{
                return supertest(app)
                .get('/api/bookmarks')
                .set('Authorization', `Bearer ${process.env.API_TOKEN}`)
                .expect(200,[])
            })
        })//end of context no bookmarks

        context('Given there are bookmarks in the database',()=>{
            const testUsers = makeUsersArray();
            const testPosts = makePostsArray();
            const testBookmarks = makeBookmarksArray();

            beforeEach(`insert users and bookmarks`,()=>{
                return db
                .into('uplift_users')
                .insert(testUsers)
                .then(()=>{
                    return db
                        .into('uplift_posts')
                        .insert(testPosts)
                        .then(()=>{
                            return db
                            .into('uplift_bookmarks')
                            .insert(testBookmarks)
                        })
                })
            })//end beforeEach

            it(`responds with all bookmarks`,()=>{
                return supertest(app)
                .get('/api/bookmarks')
                .set('Authorization', `Bearer ${process.env.API_TOKEN}`)
                .expect(200)
                .expect(res=>{
                    expect(res.body.id).to.eql(testBookmarks.id)
                    expect(res.body.user_id).to.eql(testBookmarks.user_id)
                    expect(res.body.post_id).to.eql(testBookmarks.post_id)
                })
            })//end it responds with all bookmarks

          it(`responds with error message if request for userid not there`,()=>{
                return supertest(app)
                .get('/api/bookmarks?userid=1235')
                .set('Authorization', `Bearer ${process.env.API_TOKEN}`)
                .expect(404, {error: {message: `That user has no bookmarks`}})
            })
        })//end context bookmarks in db
    })//end of GET /bookmarks

    describe(`POST /api/bookmarks`,()=>{
        const testUsers = makeUsersArray();
        const testPosts = makePostsArray();

        beforeEach(`insert users`,()=>{
            return db
                .into('uplift_users')
                .insert(testUsers)
                .then(()=>{
                    return db
                        .into('uplift_posts')
                        .insert(testPosts)
                })
        })//end beforeEach

        it(`create a bookmark, responds with a 201 and the new bookmark`,function(){
            this.retries(3)
            const newBookmark={
                "user_id":2, 
                "post_id":5
            }

            return supertest(app)
                .post('/api/bookmarks')
                .set('Authorization', `Bearer ${process.env.API_TOKEN}`)
                .send(newBookmark)
                .expect(res=>{
                    expect(res.body.post_id).to.eql(newBookmark.post_id)
                    expect(res.body.user_id).to.eql(newBookmark.user_id)
                })
        })//end it create bookmark

       const requiredFields = ['user_id', 'post_id']

        requiredFields.forEach(field=>{
            const newBookmark = {
                "user_id":2, 
                "post_id":5
            }
        
            it(`responds with a 400 and error message when the ${field} is missing`,()=>{
                delete newBookmark[field]

                return supertest(app)
                    .post(`/api/bookmarks`)
                    .set('Authorization', `Bearer ${process.env.API_TOKEN}`)
                    .send(newBookmark)
                    .expect(400, {
                        error: { message: `Missing user_id or post_id in request body` }
                    })
            })//end of it 400
        })//end of forEach*/


    })//end describe POST /bookmark

    describe(`DELETE /api/bookmarks/:bookmark_id`,()=>{
        context(`Given no bookmarks in db`,()=>{
            it(`responds with 404`, () => {
                const bookmarkId = 123456
                  return supertest(app)
                  .delete(`/api/bookmarks/${bookmarkId}`)
                  .set('Authorization', `Bearer ${process.env.API_TOKEN}`)
                  .expect(404, { error: {message: `Bookmark doesn't exist` } })
              })//end it 404
        })//end of context no bookmark in db

        context(`Given bookmarks in db`,()=>{
             const testUsers = makeUsersArray();
             const testPosts = makePostsArray();
             const testBookmarks = makeBookmarksArray();

             beforeEach(`insert users and bookmarks`,()=>{
                return db
                .into('uplift_users')
                .insert(testUsers)
                .then(()=>{
                    return db
                        .into('uplift_posts')
                        .insert(testPosts)
                        .then(()=>{
                            return db
                            .into('uplift_bookmarks')
                            .insert(testBookmarks)
                        })
                })
            })//end beforeEach 

           it(`responds with 204 and removes the bookmark`,()=>{
              const idToRemove = 2
              expectedbookmarks = testBookmarks.filter(
                   bookmark => bookmark.id !== idToRemove)

                return supertest(app)
                    .delete(`/api/bookmarks/${idToRemove}`)
                    .set('Authorization', `Bearer ${process.env.API_TOKEN}`)
                    .expect(204)
                    .then(res =>
                        supertest(app)
                        .get(`/api/bookmarks`)
                        .expect(res=>{
                            expect(res.body.user_id).to.eql(expectedbookmarks.user_id)
                            expect(res.body.post_id).to.eql(expectedbookmarks.post_id)
                        })
                    )
            })//end of it responds with 204
            
        })//end of context bookmarks in db
    })//end of DELETE /bookmarks/:bookmark_id


})//end of Uplift describe endpoints
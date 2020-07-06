const PostsService = {
    getAllPosts(knex){
        return knex
        .from('uplift_posts')
        .select('uplift_posts.id as post_id','post_type', 'content','title','by','link','uplift_posts.date_created','user_id', 'uplift_users.username')
        .join('uplift_users','uplift_posts.user_id', 'uplift_users.id')
        
    },

    getPostsByUserId(knex, userId){
        console.log(userId)
        return knex
        .from('uplift_posts')
        .select('uplift_posts.id as post_id','post_type', 'content','title','by','link','uplift_posts.date_created','user_id', 'uplift_users.username')
        .join('uplift_users','uplift_posts.user_id', 'uplift_users.id')
        .where('uplift_posts.user_id',userId)
    },
    getConnectionPosts(knex, userconnection){
        return knex
        .from('uplift_posts')
        .select('uplift_posts.id as post_id','post_type', 'followee_id as user_id', 'content','title','by','link','start_date','uplift_posts.date_created', 'username')
        .join('uplift_users','uplift_posts.user_id', 'uplift_users.id')
        .join('uplift_connections','uplift_connections.followee_id', 'uplift_users.id')
        .where('uplift_connections.user_id',userconnection)
       
    },
    getBookmarkPosts(knex, userbookmark){
        return knex
        .from('uplift_posts')
        .select('uplift_posts.id as post_id','post_type', 'uplift_bookmarks.user_id as user_id', 'uplift_posts.content as content','uplift_bookmarks.content as bookmark_content','title','by','link','start_date','uplift_posts.date_created')
      //  .join('uplift_users','uplift_bookmarks.user_id', 'uplift_users.id')
        .join('uplift_bookmarks','uplift_bookmarks.post_id', 'uplift_posts.id')
        .where('uplift_bookmarks.user_id',userbookmark)
       
    },
    insertNewPost(knex, newPost){
        return knex
            .insert(newPost)
            .into('uplift_posts')
            .returning('*')
            .then(rows=>{
                return rows[0]
            })
    },
    getPostByPostId(knex, id){
        return knex 
            .from('uplift_posts')
            .select('*')
            .where('id',id)
            .first()
    },
    deletePost(knex, id){
        return knex
            .from('uplift_posts')
            .where({id})
            .delete()
    }
}

module.exports = PostsService;
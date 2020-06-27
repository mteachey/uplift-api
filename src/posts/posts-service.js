const PostsService = {
    getAllPosts(knex){
        return knex
        .select('*')
        .from('uplift_posts')
    },

    getPostsByUserId(knex, userId){
        console.log(userId)
        return knex
        .select('*')
        .from('uplift_posts')
        .where('uplift_posts.user_id',userId)
    },
    getConnectionPosts(knex, userconnection){
        return knex
        .from('uplift_posts')
        .select('*')
        .join('uplift_users','uplift_posts.user_id', 'uplift_users.id')
        .join('uplift_connections','uplift_connections.followee_id', 'uplift_users.id')
        .where('uplift_connections.user_id',1)
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
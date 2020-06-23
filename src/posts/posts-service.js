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
        .where('user_id',userId)
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
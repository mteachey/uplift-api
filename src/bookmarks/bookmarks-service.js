const BookmarksService = {
    getAllBookmarks(knex){
        return knex
        .select('*')
        .from('uplift_bookmarks')
    },
    getBookmarksByUserId(knex, userId){
        return knex
        .select('*')
        .from('uplift_bookmarks')
        .where('user_id',userId)
    },
    insertNewBookmark(knex, newBookmark){
        return knex
            .insert(newBookmark)
            .into('uplift_bookmarks')
            .returning('*')
            .then(rows=>{
                return rows[0]
            })
    },
    getBookmarksByBookmarkId(knex, id){
        return knex 
            .from('uplift_bookmarks')
            .select('*')
            .where('id',id)
            .first()
    },
    deleteBookmark(knex, id){
        return knex
            .from('uplift_bookmarks')
            .where({id})
            .delete()
    }
}

module.exports = BookmarksService;
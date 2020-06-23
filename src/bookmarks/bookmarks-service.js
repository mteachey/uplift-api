const BookmarksService = {
    getAllBookmarks(knex){
        return knex
        .select('*')
        .from('uplift_bookmarks')
    },
}

//have by user_id

module.exports = BookmarksService;
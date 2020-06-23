const UsersService = {
    getAllUsers(knex){
        return knex
        .select('uplift_users.id','uplift_users.username','uplift_users.fullname')
        .from('uplift_users')
    },
    insertNewUser(knex, newUser){
        return knex
            .insert(newUser)
            .into('uplift_users')
            .returning('*')
            .then(rows=>{
                return rows[0]
            })
    },
    getUserByUserId(knex, id){
        return knex 
            .from('uplift_users')
            .select('*')
            .where('id',id)
            .first()
    },
    deleteUser(knex, id){
        return knex
            .from('uplift_users')
            .where({id})
            .delete()
    }
}

module.exports = UsersService;
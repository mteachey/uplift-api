const ConnectionsService = {
    getAllConnections(knex){
        return knex
        .select('*')
        .from('uplift_connections')
    },
    getConnectionsByUserId(knex, userId){
        return knex
        .select('*')
        .from('uplift_connections')
        .where('user_id',userId)
    },
    insertNewConnection(knex, newConnection){
        return knex
            .insert(newConnection)
            .into('uplift_connections')
            .returning('*')
            .then(rows=>{
                return rows[0]
            })
    },
    getConnectionByConnectionId(knex, id){
        return knex 
            .from('uplift_connections')
            .select('*')
            .where('id',id)
            .first()
    },
    deleteConnection(knex, id){
        return knex
            .from('uplift_connections')
            .where({id})
            .delete()
    }
}


module.exports = ConnectionsService;
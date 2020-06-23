function makeConnectionsArray() {
    return[
        {
        "id":1,
        "user_id":1,
        "followee_id":2,
       
      },
      {
        "id":2,
        "user_id":1,
        "followee_id":3,
        
      },
      {
        "id":3,
        "user_id":2,
        "followee_id":3,
        
      },
      {
        "id":4,
        "user_id":2,
        "followee_id":1,
        
      }
    ]
}

module.exports={
    makeConnectionsArray
}
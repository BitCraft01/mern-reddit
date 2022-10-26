import mongodb from "mongodb"
const ObjectId = mongodb.ObjectID

//Variable created to store a reference in database
let posts

export default class PostsDAO {
    //To initially connect to database
    static async injectDB(conn) {
        if(posts) {
            return
        }
        //In case of reference not being filled, this fills the variable with the reference to the database
        try {
            posts = await conn.db(process.env.RESTREVIEWS_NS).collection("posts")
        } catch (e) {
            console.error(
                `Unable to establish a collection handle in postsDAO: ${e}`, 
            )
        }
    }
    //function to call to get a list of all posts in the database
    static async getPosts({
        filters = null,
        page = 0,
        postsPerPage = 20,
    } = {}) {
        //Search filtering logic
        let query
        if (filters) {
        if ("name" in filters) {
            query = { $text: { $search: filters["name"] } }
        } else if ("cuisine" in filters) {
            query = {"cuisine": {$eq: filters["cuisine"]}}
        } else if ("zipcode" in filters) {
            query = {"address.zipcode": { $eq: filters["zipcode"]}}
        }
    }

    let cursor
    try {
        cursor = await posts
            .find(query)
    } catch (e) {
        console.error(`Unable to issue find command, ${e}`)
        return { postsList: [], totalNumPosts: 0 }
    }
    //Limiting number of results per page and to get to potentially specified page number
    const displayCursor = cursor.limit(postsPerPage).skip(postsPerPage * page)

    //Setting restaunrantsList to an array and return the array
    try {
        const postsList = await displayCursor.toArray()
        const totalNumPosts = await posts.countDocuments(query)

        return { postsList, totalNumPosts }
    } catch (e) {
        console.error(
            `Unable to convert cursor to array or problem counting documents, ${e}`,
        )
        return { postsList: [], totalNumPosts: 0 }
    }
  }

  static async getPostByID(id) {
    try {
      const pipeline = [
        {
            $match: {
                _id: new ObjectId(id),
            },
        },
              {
                  $lookup: {
                      from: "comments",
                      let: {
                          id: "$_id",
                      },
                      pipeline: [
                          {
                              $match: {
                                  $expr: {
                                      $eq: ["$post_id", "$$id"],
                                  },
                              },
                          },
                          {
                              $sort: {
                                  date: -1,
                              },
                          },
                      ],
                      as: "commments",
                  },
              },
              {
                  $addFields: {
                      commments: "$commments",
                  },
              },
          ]
      return await posts.aggregate(pipeline).next()
    } catch (e) {
      console.error(`Something went wrong in getPostByID: ${e}`)
      throw e
    }
  }

  static async getCuisines() {
    let cuisines = []
    try {
      cuisines = await posts.distinct("cuisine")
      return cuisines
    } catch (e) {
      console.error(`Unable to get cuisines, ${e}`)
      return cuisines
    }
  }
}

import app from "./server.js"
import mongodb from "mongodb"
import dotenv from "dotenv"
import PostsDAO from "./dao/postsDAO.js"
import CommentsDAO from "./dao/commentsDAO.js"
dotenv.config()
const MongoClient = mongodb.MongoClient

const port = process.env.PORT || 8000

MongoClient.connect(
    process.env.RESTREVIEWS_DB_URI,
    {
        maxPoolSize: 50,
        wtimeoutMS: 2500,
        useNewUrlParser: true }
)
.catch(err => {
    console.error(err.stack)
    process.exit(1)
})
.then(async client => {
    await PostsDAO.injectDB(client)
    await CommentsDAO.injectDB(client)
    app.listen(port, () => {
        console.log(`listening on port ${port}`)
    })
})

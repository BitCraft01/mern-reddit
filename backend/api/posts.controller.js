import PostsDAO from "../dao/postsDAO.js"

export default class PostsController {
  static async apiGetPosts(req, res, next) {
    const postsPerPage = req.query.postsPerPage ? parseInt(req.query.postsPerPage, 10) : 20
    const page = req.query.page ? parseInt(req.query.page, 10) : 0

    let filters = {}
    if (req.query.cuisine) {
      filters.cuisine = req.query.cuisine
    } else if (req.query.zipcode) {
      filters.zipcode = req.query.zipcode
    } else if (req.query.name) {
      filters.name = req.query.name
    }

    const { postsList, totalNumPosts } = await PostsDAO.getPosts({
      filters,
      page,
      postsPerPage,
    })

    let response = {
      posts: postsList,
      page: page,
      filters: filters,
      entries_per_page: postsPerPage,
      total_results: totalNumPosts,
    }
    res.json(response)
  }

  static async apiGetPostById(req, res, next) {
    try {
      let id = req.params.id || {}
      let post = await PostsDAO.getPostByID(id)
      if (!post) {
        res.status(404).json({ error: "Not found" })
        return
      }
      res.json(post)
    } catch (e) {
      console.log(`api, ${e}`)
      res.status(500).json({ error: e })
    }
  }

  static async apiGetPostCuisines(req, res, next) {
    try {
      let cuisines = await PostsDAO.getCuisines()
      res.json(cuisines)
    } catch (e) {
      console.log(`api, ${e}`)
      res.status(500).json({ error: e })
    }
  }
}
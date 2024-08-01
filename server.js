const express = require("express");
const fs = require("fs");
const path = require("path");
const cors = require("cors");

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

const postsFilePath = path.join(__dirname, "data", "posts.json");

// Helper function to read posts from the file
const readPosts = () => {
  const data = fs.readFileSync(postsFilePath, "utf-8");
  return JSON.parse(data);
};

// Helper function to write posts to the file
const writePosts = (posts) => {
  fs.writeFileSync(postsFilePath, JSON.stringify(posts, null, 2));
};

// Get all posts
app.get("/posts", (req, res) => {
  const posts = readPosts();
  res.json(posts);
});

// Get a single post by ID
app.get("/posts/:id", (req, res) => {
  const { id } = req.params;
  const posts = readPosts();
  const post = posts.find((p) => p.id === Number(id));
  if (post) {
    res.json(post);
  } else {
    res.status(404).json({ message: "Post not found" });
  }
});

// Create a new post
app.post("/posts", (req, res) => {
  const posts = readPosts();
  const newId = posts.length > 0 ? Math.max(...posts.map((p) => p.id)) + 1 : 1;
  const newPost = { id: newId, ...req.body, comments: [] };
  posts.push(newPost);
  writePosts(posts);
  res.status(201).json(newPost);
});

// Add a comment to a post
app.post("/posts/:id/comments", (req, res) => {
  const { id } = req.params;
  const posts = readPosts();
  const post = posts.find((p) => p.id === Number(id));
  if (post) {
    if (req.body.text) {
      const newComment = { text: req.body.text };
      post.comments.push(newComment);
      writePosts(posts);
      res.status(201).json(newComment);
    } else {
      res.status(400).json({ message: "Comment text is required" });
    }
  } else {
    res.status(404).json({ message: "Post not found" });
  }
});

// Delete all comments from a post
app.delete("/posts/:id/comments", (req, res) => {
  const { id } = req.params;
  const posts = readPosts();
  const post = posts.find((p) => p.id === Number(id));
  if (post) {
    post.comments = [];
    writePosts(posts);
    res.status(200).json({ message: "All comments deleted" });
  } else {
    res.status(404).json({ message: "Post not found" });
  }
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});

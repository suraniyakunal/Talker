import Post from '../models/postModel.js';

export const createPost = async (req, res) => {
    try {
        const { content } = req.body;
        if (!content) return res.status(400).json({ message: 'Content is required' });

        const newPost = new Post({ content, author: req.user._id });
        await newPost.save();

        const populatedPost = await newPost.populate('author', 'username profile_Pic');
        res.status(201).json(populatedPost);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const getPosts = async (req, res) => {
    try {
        const posts = await Post.find()
            .populate('author', 'username profile_Pic')
            .populate('comments.user', 'username profile_Pic')
            .sort({ createdAt: -1 });
        res.status(200).json(posts);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const likePost = async (req, res) => {
    try {
        const post = await Post.findById(req.params.id);
        if (!post) return res.status(404).json({ message: 'Post not found' });

        const isLiked = post.likes.includes(req.user._id);

        if (isLiked) {
            post.likes = post.likes.filter((id) => id.toString() !== req.user._id.toString());
        } else {
            post.likes.push(req.user._id);
        }
        await post.save();
        res.status(200).json({ message: 'Post updated', likes: post.likes });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const addComment = async (req, res) => {
    try {
        const { text } = req.body;
        const post = await Post.findById(req.params.id);
        if (!post) return res.status(404).json({ message: 'Post not found' });

        const comment = { user: req.user._id, text };
        post.comments.push(comment);
        await post.save();

        const populatedPost = await Post.findById(post._id).populate('comments.user', 'username profile_Pic');
        res.status(201).json(populatedPost.comments);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

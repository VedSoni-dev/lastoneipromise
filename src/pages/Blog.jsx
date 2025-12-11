import './Blog.css'

function Blog() {
  return (
    <div className="blog-page">
      <div className="blog-content">
        <h1 className="blog-title">Blog</h1>
        <div className="blog-section">
          <div className="blog-item">
            <div className="blog-date">January 15, 2024</div>
            <h2>Blog Post Title</h2>
            <p>
              Your blog post content goes here. Write about your thoughts, experiences, 
              technical insights, or anything you'd like to share with your audience.
            </p>
            <a href="#" className="blog-link">Read More →</a>
          </div>
          
          <div className="blog-item">
            <div className="blog-date">December 20, 2023</div>
            <h2>Another Blog Post</h2>
            <p>
              Share your knowledge, experiences, or thoughts. This is your space to 
              communicate with your readers and build your personal brand.
            </p>
            <a href="#" className="blog-link">Read More →</a>
          </div>
          
          <div className="blog-item">
            <div className="blog-date">November 10, 2023</div>
            <h2>Technical Deep Dive</h2>
            <p>
              Write about technical topics, tutorials, or insights from your projects. 
              Help others learn and showcase your expertise.
            </p>
            <a href="#" className="blog-link">Read More →</a>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Blog





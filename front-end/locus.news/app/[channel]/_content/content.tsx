import Post from "../_post/post.";

export default function Content() {
  return (
    <div style={{ flex: '1', display: 'flex', justifyContent: 'center' }}>
      <div style={{ maxWidth: '500px', width: '100%' }}>

        <Post />
        <Post />
      </div>
    </div>
  )
}
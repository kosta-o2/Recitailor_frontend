import { useLocation, useParams } from "react-router";
import PostCreate from "../components/posts/PostCreate";

const PostCreatePage = () => {
  const location = useLocation();
  const { id } = useParams();

  const initData = location.state?.initData ?? null;

  return <PostCreate key={id} initData={initData} />;
};

export default PostCreatePage;

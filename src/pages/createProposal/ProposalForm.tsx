import { useParams } from 'react-router-dom'
import './Video.css'
import CreateProposal from '../CreateProposal';


function Video() {
  const { videoId, categoryId } = useParams<{ videoId: string; categoryId: string }>();

  if (!videoId || !categoryId) {
    return <div>Error: Missing video or category ID</div>;
  }

  return (
    <div className="play-container" >
      <CreateProposal></CreateProposal>
    </div>
  )
}

export default Video
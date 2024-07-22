import { useParams } from 'react-router-dom'
import './Video.css'
import PlayVideo from '../playVideo/PlayVideo'
import Recommended from '../recommended/Recommended'
import VoteOnProposal from '../VoteOnProposal';

function Video() {
  const { videoId, categoryId } = useParams<{ videoId: string; categoryId: string }>();

  if (!videoId || !categoryId) {
    return <div>Error: Missing video or category ID</div>;
  }

  return (
    <div className="play-container" >
      <PlayVideo  videoId={videoId} />
      {/* <VoteOnProposal /> */}
      <Recommended  categoryId={categoryId}/>
    </div>
  )
}

export default Video
import React, { useEffect, useState } from "react";
import { useAnchorWallet } from "@solana/wallet-adapter-react";
import { PublicKey } from "@solana/web3.js";
import { rewardContentCreator } from "../../helpers/solana.helper";
import moment from "moment";
import { API_KEY, value_converter } from "../../data";
import "./PlayVideo.css";
import like from "../../assets/like.png";
import dislike from "../../assets/dislike.png";
import share from "../../assets/share.png";
import save from "../../assets/save.png";
import { FaHeart } from "react-icons/fa6";

interface PlayVideoProps {
  videoId: string;
}

interface Snippet {
  title: string;
  channelId: string;
  channelTitle: string;
  publishedAt: string;
  description: string;
  thumbnails: {
    default: {
      url: string;
    };
  };
}

interface Statistics {
  viewCount: number;
  likeCount: number;
  commentCount: number;
}

interface VideoData {
  id: string;
  snippet: Snippet;
  statistics: Statistics;
}

interface ChannelSnippet {
  thumbnails: {
    default: {
      url: string;
    };
  };
}

interface ChannelStatistics {
  subscriberCount: number;
}

interface ChannelData {
  snippet: ChannelSnippet;
  statistics: ChannelStatistics;
}

interface CommentSnippet {
  authorProfileImageUrl: string;
  textDisplay: string;
  likeCount: number;
  publishedAt: string;
  authorDisplayName: string;
}

interface TopLevelComment {
  snippet: CommentSnippet;
}

interface Comment {
  id: string;
  snippet: {
    topLevelComment: TopLevelComment;
  };
}

const PlayVideo: React.FC<PlayVideoProps> = ({ videoId }) => {
  const rewardContentCreatorAddress = "DgRGUJnRBRtnnUaq8GRRLEzAqbkzR4AzdiKwfSmtUtzG";
  const wallet = useAnchorWallet();
  const [recipientAddress, setRecipientAddress] = useState(rewardContentCreatorAddress);
  const [isRewarding, setIsRewarding] = useState(false);
  const [isOpenTransaction, setIsOpenTransaction] = useState(false);
  const [rewardError, setRewardError] = useState<string | null>(null);
  const [transactionSignature, setTransactionSignature] = useState<string | null>(null);
  const [apiData, setApiData] = useState<VideoData | null>(null);
  const [channelData, setChannelData] = useState<ChannelData | null>(null);
  const [commentsData, setCommentsData] = useState<Comment[]>([]);
  const [likeCount, setLikeCount] = useState<number>(0);

  useEffect(() => {
    const fetchVideoData = async () => {
      try {
        const videoListUrl = `https://youtube.googleapis.com/youtube/v3/videos?part=snippet,contentDetails,statistics&id=${videoId}&key=${API_KEY}`;
        const response = await fetch(videoListUrl);
        const result = await response.json();
        if (result.items.length > 0) {
          setApiData(result.items[0]);
          setLikeCount(parseInt(result.items[0].statistics.likeCount, 10));
        }
      } catch (error) {
        console.error("Error fetching video data:", error);
      }
    };
    fetchVideoData();
  }, [videoId]);

  useEffect(() => {
    const fetchChannelData = async () => {
      if (apiData?.snippet.channelId) {
        try {
          const channelListUrl = `https://youtube.googleapis.com/youtube/v3/channels?part=snippet,contentDetails,statistics&id=${apiData.snippet.channelId}&key=${API_KEY}`;
          const response = await fetch(channelListUrl);
          const result = await response.json();
          if (result.items.length > 0) {
            setChannelData(result.items[0]);
          }
        } catch (error) {
          console.error("Error fetching channel data:", error);
        }
      }
    };
    fetchChannelData();
  }, [apiData]);

  useEffect(() => {
    const fetchCommentsData = async () => {
      try {
        const commentsListUrl = `https://youtube.googleapis.com/youtube/v3/commentThreads?part=snippet,replies&videoId=${videoId}&key=${API_KEY}`;
        const response = await fetch(commentsListUrl);
        const result = await response.json();
        setCommentsData(result.items);
      } catch (error) {
        console.error("Error fetching comments data:", error);
      }
    };
    fetchCommentsData();
  }, [videoId]);

  const handleLike = async () => {
    if (!wallet) {
      setRewardError("Wallet not connected");
      return;
    }

    if (!recipientAddress) {
      setRewardError("Please enter a recipient address");
      return;
    }
    setIsOpenTransaction(true);
    setRewardError(null);
    setTransactionSignature(null);
    setIsRewarding(true);

    try {
      const recipientPubkey = new PublicKey(recipientAddress);
      const signature = await rewardContentCreator(wallet, recipientPubkey);

      if (signature) {
        setTransactionSignature(signature);
      } else {
        setRewardError("Failed to send reward. Check console for details.");
      }
    } catch (error) {
      setRewardError(`Error sending reward: ${error instanceof Error ? error.message : String(error)}`);
    } finally {
      setIsRewarding(false);
    }
    setLikeCount((prev) => prev + 1);
  };

  return (
    <div className="play-video">
      <iframe
        src={`https://www.youtube.com/embed/${videoId}?autoplay=1`}
        frameBorder="0"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
        referrerPolicy="strict-origin-when-cross-origin"
        allowFullScreen
      ></iframe>
      <h3>{apiData?.snippet.title}</h3>
      <div className="play-video-info">
        <>
          {apiData ? value_converter(apiData.statistics.viewCount) : ""} vues &bull; {moment(apiData?.snippet.publishedAt).fromNow()}
        </>
        <div>
          <span>
            <FaHeart onClick={handleLike} className={isRewarding ? "likeIcon active" : "likeIcon"} />
            {likeCount}
          </span>

          <span>
            <img src={share} alt="Share" />
            Share
          </span>

          <span>
            <img src={save} alt="Save" />
            Save
          </span>
        </div>
      </div>
      {isOpenTransaction && (
        <div>
          <hr />
          <h4>Rewarding Content Creator</h4>
          {isRewarding ? (
            <p>Sending Reward...</p>
          ) : (
            transactionSignature && <p>Reward sent! Transaction signature: {transactionSignature}</p>
          )}
        </div>
      )}
      {rewardError && (
        <div>
          <hr />
          <p style={{ color: "red" }}>{rewardError}</p>
        </div>
      )}

      <hr />
      <div className="publisher">
        <img src={channelData?.snippet.thumbnails.default.url} alt="Channel" />
        <div>
          <p>{apiData?.snippet.channelTitle}</p>
          <span>{channelData ? value_converter(channelData.statistics.subscriberCount) : ""} abonnés</span>
        </div>
        <button>S'abonner</button>
      </div>
      <div className="vid-description">
        <p>{apiData?.snippet.description}</p>
        <hr />
        <h4>{apiData ? value_converter(apiData.statistics.commentCount) : ""} commentaire</h4>
        {commentsData.map((comment) => (
          <div key={comment.id} className="comment">
            <img src={comment.snippet.topLevelComment.snippet.authorProfileImageUrl} alt="Author" />
            <div>
              <h3>
                {comment.snippet.topLevelComment.snippet.authorDisplayName}
                <span>{moment(comment.snippet.topLevelComment.snippet.publishedAt).fromNow()}</span>
              </h3>
              <p>{comment.snippet.topLevelComment.snippet.textDisplay}</p>
              <div className="comment-action">
                <img src={like} alt="Like" />
                <span>{value_converter(comment.snippet.topLevelComment.snippet.likeCount)}</span>
                <img src={dislike} alt="Dislike" />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default PlayVideo;

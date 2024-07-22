import React, { useEffect, useState } from "react";
import "./PlayVideo.css";
import like from "../../assets/like.png";
import dislike from "../../assets/dislike.png";
import share from "../../assets/share.png";
import save from "../../assets/save.png";
import { API_KEY, value_converter } from "../../data";
import moment from "moment";

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
  const [apiData, setApiData] = useState<VideoData | null>(null);
  const [channelData, setChannelData] = useState<ChannelData | null>(null);
  const [commentsData, setCommentsData] = useState<Comment[]>([]);

  useEffect(() => {
    const fetchVideoData = async () => {
      const videoListUrl = `https://youtube.googleapis.com/youtube/v3/videos?part=snippet%2CcontentDetails%2Cstatistics&id=${videoId}&key=${API_KEY}`;
      const response = await fetch(videoListUrl);
      const result = await response.json();
      setApiData(result.items[0]);
    };
    fetchVideoData();
  }, [videoId]);

  useEffect(() => {
    const fetchChannelData = async () => {
      if (apiData?.snippet.channelId) {
        const channelListUrl = `https://youtube.googleapis.com/youtube/v3/channels?part=snippet%2CcontentDetails%2Cstatistics&id=${apiData.snippet.channelId}&key=${API_KEY}`;
        const response = await fetch(channelListUrl);
        const result = await response.json();
        setChannelData(result.items[0]);
      }
    };
    fetchChannelData();
  }, [apiData]);

  useEffect(() => {
    const fetchCommentsData = async () => {
      const commentsListUrl = `https://youtube.googleapis.com/youtube/v3/commentThreads?part=snippet%2Creplies&videoId=${videoId}&key=${API_KEY}`;
      const response = await fetch(commentsListUrl);
      const result = await response.json();
      setCommentsData(result.items);
    };
    fetchCommentsData();
  }, [videoId]);

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
          {apiData? value_converter(apiData?.statistics.viewCount):""} vues &bull;
          {moment(apiData?.snippet.publishedAt).fromNow()}
        </>
        <div>
          <span>
            <img src={like} alt="" />
            {apiData? value_converter(apiData?.statistics.likeCount): ""}
          </span>

          <span>
            <img src={dislike} alt="" />
          </span>

          <span>
            <img src={share} alt="" />
            Share
          </span>

          <span>
            <img src={save} alt="" />
            Save
          </span>
        </div>
      </div>
      <hr />
      <div className="publisher">
        <img src={channelData?.snippet.thumbnails.default.url} alt="" />
        <div>
          <p>{apiData?.snippet.channelTitle}</p>
          <span>
            {channelData? value_converter(channelData?.statistics.subscriberCount):""} abonnées
          </span>
        </div>
        <button>S'abonner</button>
      </div>
      <div className="vid-description">
        <p>{apiData?.snippet.description}</p>
        <hr />
        <h4>{apiData? value_converter(apiData?.statistics.commentCount):""} commentaire</h4>
        {commentsData.map((comment, index) => (
          <div key={index} className="comment">
            <img
              src={comment.snippet.topLevelComment.snippet.authorProfileImageUrl}
              alt=""
            />
            <div>
              <h3>
              {comment.snippet.topLevelComment.snippet.authorDisplayName}
                <span>{moment(comment.snippet.topLevelComment.snippet.publishedAt).fromNow()}</span>
              </h3>
              <p>{comment.snippet.topLevelComment.snippet.textDisplay}</p>
              <div className="comment-action">
                <img src={like} alt="" />
                <span>{comment ? value_converter(comment.snippet.topLevelComment.snippet.likeCount):""}</span>
                <img src={dislike} alt="" />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default PlayVideo;

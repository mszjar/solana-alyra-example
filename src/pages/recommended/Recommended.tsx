import React, { useState, useEffect } from 'react';
import {useNavigate } from 'react-router-dom';
import './Recommended.css';
import { API_KEY, value_converter } from '../../data';
import moment from 'moment';
import VoteOnProposal from '../VoteOnProposal';

interface RecommendedProps {
  categoryId: string;
}

interface Snippet {
  title: string;
  channelTitle: string;
  publishedAt: string;
  thumbnails: {
    medium: {
      url: string;
    };
  };
  categoryId: string;
}

interface Statistics {
  viewCount: number;
}

interface VideoData {
  id: string;
  snippet: Snippet;
  statistics: Statistics;
}

const Recommended: React.FC<RecommendedProps> = ({ categoryId }) => {
  const [apiData, setApiData] = useState<VideoData[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchVideoData = async () => {
      const videoListUrl = `https://content-youtube.googleapis.com/youtube/v3/videos?videoCategoryId=${categoryId}&chart=mostPopular&regionCode=FR&part=snippet%2CcontentDetails%2Cstatistics&maxResults=50&key=${API_KEY}`;
      const response = await fetch(videoListUrl);
      const result = await response.json();
      setApiData(result.items);
    };
    fetchVideoData();
  }, [categoryId]);

  const handleVideoClick = (categoryId: string, videoId: string) => {
    navigate(`/video/${categoryId}/${videoId}`);
  };

  return (
    <div className="recommended">
      <div className="Voting-panel">
       <VoteOnProposal />
      </div>
      {apiData.map((card) => (
        <div key={card.id} className="side-video-list" onClick={() => handleVideoClick(card.snippet.categoryId, card.id)}>
          <div className='small-thumbnail'>
            <img src={card.snippet.thumbnails.medium.url} alt={card.snippet.title} />
          </div>
          <div className="vid-info">
            <h4>{card.snippet.title}</h4>
            <p className='recommended-channel-title'>{card.snippet.channelTitle}</p>
            <p className='recommended-views'>{card ? `${card? value_converter(card.statistics.viewCount):""} ` : ""} 
              vues
              &bull;
              {` ${moment(card?.snippet.publishedAt).fromNow()}`}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
}

export default Recommended;


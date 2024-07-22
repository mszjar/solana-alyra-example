import React, { useEffect, useState } from 'react';
import './Feed.css';
import { Link } from 'react-router-dom';
import { API_KEY, value_converter } from '../../data';
import moment from 'moment';

interface Snippet {
  categoryId: string;
  title: string;
  channelTitle: string;
  publishedAt: string;
  thumbnails: {
    medium: {
      url: string;
    };
  };
}

interface Statistics {
  viewCount: number;
}

interface CardData {
  id: string;
  snippet: Snippet;
  statistics: Statistics;
}

interface CardProps {
  card: CardData;
}

interface FeedProps {
  category: number;
}

const Card: React.FC<CardProps> = ({ card }) => (
  <Link to={`video/${card.snippet.categoryId}/${card.id}`} className='card'>
    <img src={card.snippet.thumbnails.medium.url} alt={card.snippet.title} />
    <h2>{card.snippet.title}</h2>
    <h3>{card.snippet.channelTitle}</h3>
    <p>{value_converter(card.statistics.viewCount)} vues &bull; {moment(card.snippet.publishedAt).fromNow()}</p>
  </Link>
);

const Feed: React.FC<FeedProps> = ({ category }) => {
  const [data, setData] = useState<CardData[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      const videoListUrl = `https://content-youtube.googleapis.com/youtube/v3/videos?videoCategoryId=${category}&chart=mostPopular&regionCode=FR&part=snippet%2CcontentDetails%2Cstatistics&maxResults=50&key=${API_KEY}`;
      const response = await fetch(videoListUrl);
      const result = await response.json();
      setData(result.items);
    };
    fetchData();
  }, [category]);

  return (
    <div className='feed'>
      {data.map((card) => (
        <Card key={card.id} card={card} />
      ))}
    </div>
  );
}

export default Feed;

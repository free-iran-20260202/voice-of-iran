import React from 'react';

const TweetCard = ({ id, message, isDone, onTweet }) => {
  const handleTweetClick = () => {
    const url = `https://x.com/intent/post?text=${encodeURIComponent(message)}`;
    window.open(url, '_blank');
    onTweet(id);
  };

  const renderMessage = (text) => {
    // Split text by hashtags, capturing the hashtag
    const parts = text.split(/(#[a-zA-Z0-9_]+)/g);
    return parts.map((part, index) => {
      if (part.startsWith('#')) {
        return <span key={index} className="hashtag">{part}</span>;
      }
      return part;
    });
  };

  return (
    <div className={`tweet-card ${isDone ? 'done' : ''}`}>
      <p className="tweet-content">{renderMessage(message)}</p>
      <button 
        className="tweet-btn" 
        onClick={handleTweetClick}
      >
        {isDone ? 'Posted' : 'Tweet This'}
      </button>
    </div>
  );
};

export default TweetCard;

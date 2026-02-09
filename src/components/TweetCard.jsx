import React from 'react';

const TweetCard = ({ id, message, isTweetDone, isTruthDone, onTweet, onTruth, onDelete }) => {
  const handleTweetClick = () => {
    const url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(message)}`;
    window.open(url, '_blank');
    onTweet(id);
  };

  const handleTruthClick = () => {
    const url = `https://truthsocial.com/share?text=${encodeURIComponent(message)}`;
    window.open(url, '_blank');
    onTruth(id);
  };

  const renderMessage = (text) => {
    // Split text by hashtags and mentions, capturing them
    // Match #word or @word
    const parts = text.split(/([#@][a-zA-Z0-9_]+)/g);
    return parts.map((part, index) => {
      if (part.startsWith('#') || part.startsWith('@')) {
        return <span key={index} className="hashtag">{part}</span>;
      }
      return part;
    });
  };

  return (
    <div className={`tweet-card ${isTweetDone && isTruthDone ? 'done' : ''}`}>
      {onDelete && (
        <button
          type="button"
          className="tweet-delete-btn"
          onClick={() => onDelete(id)}
          title="Delete custom tweet"
          aria-label="Delete custom tweet"
        >
          x
        </button>
      )}
      <p className="tweet-content">{renderMessage(message)}</p>
      <div className="tweet-actions">
        <button 
          className={'tweet-btn' + (isTweetDone ? ' done' : '')} 
          onClick={handleTweetClick}
        >
          {isTweetDone ? 'Posted' : 'Tweet'}
        </button>
        <button 
          className={'tweet-btn truth-btn' + (isTruthDone ? ' done' : '')} 
          onClick={handleTruthClick}
        >
          {isTruthDone ? 'Posted' : 'Truth'}
        </button>
      </div>
    </div>
  );
};

export default TweetCard;

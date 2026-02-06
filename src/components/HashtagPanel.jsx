import React, { useState } from 'react';

const HashtagPanel = ({ 
  hashtags = [], 
  mentions = [], 
  customHashtags = [],
  customMentions = [],
  selectedItems, 
  onToggleItem,
  onAddCustomHashtag,
  onRemoveCustomHashtag,
  onAddCustomMention,
  onRemoveCustomMention
}) => {
  const [newHashtag, setNewHashtag] = useState('');
  const [newMention, setNewMention] = useState('');
  const [hashtagError, setHashtagError] = useState('');
  const [mentionError, setMentionError] = useState('');

  const handleAddHashtag = (e) => {
    e.preventDefault();
    setHashtagError('');
    
    if (!newHashtag.trim()) {
      setHashtagError('Please enter a hashtag');
      return;
    }

    const formatted = newHashtag.trim().startsWith('#') ? newHashtag.trim() : `#${newHashtag.trim()}`;
    
    if (onAddCustomHashtag(formatted)) {
      setNewHashtag('');
    } else {
      setHashtagError('Hashtag already exists');
    }
  };

  const handleAddMention = (e) => {
    e.preventDefault();
    setMentionError('');
    
    if (!newMention.trim()) {
      setMentionError('Please enter a mention');
      return;
    }

    const formatted = newMention.trim().startsWith('@') ? newMention.trim() : `@${newMention.trim()}`;
    
    if (onAddCustomMention(formatted)) {
      setNewMention('');
    } else {
      setMentionError('Mention already exists');
    }
  };

  return (
    <div className="hashtag-panel">
      <h3>Customize Your Tweet</h3>
      
      <div className="hashtag-section">
        <h4>Hashtags</h4>
        <div className="tags-grid">
          {hashtags.map(tag => (
            <label key={tag} className="tag-checkbox">
              <input
                type="checkbox"
                checked={selectedItems.has(tag)}
                onChange={() => onToggleItem(tag)}
              />
              <span className="tag-label">{tag}</span>
            </label>
          ))}
          {customHashtags.map(tag => (
            <div key={tag} className="custom-tag-item">
              <label className="tag-checkbox">
                <input
                  type="checkbox"
                  checked={selectedItems.has(tag)}
                  onChange={() => onToggleItem(tag)}
                />
                <span className="tag-label">{tag}</span>
              </label>
              <button 
                className="remove-tag-btn"
                onClick={() => onRemoveCustomHashtag(tag)}
                title="Remove custom hashtag"
              >
                ×
              </button>
            </div>
          ))}
        </div>
        
        <form onSubmit={handleAddHashtag} className="add-tag-form">
          <input
            type="text"
            value={newHashtag}
            onChange={(e) => setNewHashtag(e.target.value)}
            placeholder="Add custom hashtag (e.g., #MyHashtag)"
            className="add-tag-input"
          />
          <button type="submit" className="add-tag-btn">Add</button>
        </form>
        {hashtagError && <div className="tag-error">{hashtagError}</div>}
      </div>
      
      <div className="hashtag-section">
        <h4>Mentions</h4>
        <div className="tags-grid">
          {mentions.map(mention => (
            <label key={mention} className="tag-checkbox">
              <input
                type="checkbox"
                checked={selectedItems.has(mention)}
                onChange={() => onToggleItem(mention)}
              />
              <span className="tag-label">{mention}</span>
            </label>
          ))}
          {customMentions.map(mention => (
            <div key={mention} className="custom-tag-item">
              <label className="tag-checkbox">
                <input
                  type="checkbox"
                  checked={selectedItems.has(mention)}
                  onChange={() => onToggleItem(mention)}
                />
                <span className="tag-label">{mention}</span>
              </label>
              <button 
                className="remove-tag-btn"
                onClick={() => onRemoveCustomMention(mention)}
                title="Remove custom mention"
              >
                ×
              </button>
            </div>
          ))}
        </div>
        
        <form onSubmit={handleAddMention} className="add-tag-form">
          <input
            type="text"
            value={newMention}
            onChange={(e) => setNewMention(e.target.value)}
            placeholder="Add custom mention (e.g., @username)"
            className="add-tag-input"
          />
          <button type="submit" className="add-tag-btn">Add</button>
        </form>
        {mentionError && <div className="tag-error">{mentionError}</div>}
      </div>
    </div>
  );
};

export default HashtagPanel;

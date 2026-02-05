import React from 'react';

const HashtagPanel = ({ hashtags = [], mentions = [], selectedItems, onToggleItem }) => {
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
        </div>
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
        </div>
      </div>
    </div>
  );
};

export default HashtagPanel;

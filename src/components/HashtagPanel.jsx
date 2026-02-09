import React, { useState } from 'react';

const HashtagPanel = ({ 
  hashtags = [], 
  mentions = [], 
  mentionGroups = [],
  customHashtags = [],
  customMentionGroups = [],
  selectedItems, 
  onToggleItem,
  onAddCustomHashtag,
  onRemoveCustomHashtag,
  onAddCustomMention,
  onRemoveCustomMention
}) => {
  const [newHashtag, setNewHashtag] = useState('');
  const [newMention, setNewMention] = useState('');
  const [mentionSection, setMentionSection] = useState(mentionGroups[0]?.label || 'Custom Mentions');
  const [newMentionSection, setNewMentionSection] = useState('');
  const [hashtagError, setHashtagError] = useState('');
  const [mentionError, setMentionError] = useState('');
  const [isExpanded, setIsExpanded] = useState(false);

  const baseMentionGroups = mentionGroups.length
    ? mentionGroups
    : [{ label: 'Mentions', mentions }];

  const mergedMentionGroups = baseMentionGroups.map((group) => ({
    label: group.label,
    mentions: [...group.mentions]
  }));

  customMentionGroups.forEach((customGroup) => {
    if (!customGroup?.label || !Array.isArray(customGroup.mentions)) {
      return;
    }

    const existingGroup = mergedMentionGroups.find(
      (group) => group.label.toLowerCase() === customGroup.label.toLowerCase()
    );

    if (existingGroup) {
      customGroup.mentions.forEach((mention) => {
        if (!existingGroup.mentions.includes(mention)) {
          existingGroup.mentions.push(mention);
        }
      });
      return;
    }

    mergedMentionGroups.push({
      label: customGroup.label,
      mentions: [...customGroup.mentions]
    });
  });

  const customMentionSet = new Set(
    customMentionGroups.flatMap((group) => group.mentions || [])
  );
  const sectionOptions = mergedMentionGroups.map((group) => group.label).filter(Boolean);
  const effectiveMentionSection =
    mentionSection === '__new__' || sectionOptions.includes(mentionSection)
      ? mentionSection
      : (sectionOptions[0] || '__new__');

  const selectedHashtagCount = [...selectedItems].filter(item => item.startsWith('#')).length;
  const selectedMentionCount = [...selectedItems].filter(item => item.startsWith('@')).length;

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
    const selectedSection =
      effectiveMentionSection === '__new__' ? newMentionSection.trim() : effectiveMentionSection;

    if (!selectedSection) {
      setMentionError('Please choose or enter a section');
      return;
    }
    
    if (onAddCustomMention(formatted, selectedSection)) {
      setNewMention('');
      if (effectiveMentionSection === '__new__') {
        setMentionSection(selectedSection);
        setNewMentionSection('');
      }
    } else {
      setMentionError('Mention already exists');
    }
  };

  return (
    <div className="hashtag-panel">
      <div className="hashtag-panel-header">
        <div className="hashtag-panel-title-wrap">
          <h3>Customize Your Tweet</h3>
          <p className="hashtag-panel-summary">
            {selectedHashtagCount} hashtags, {selectedMentionCount} mentions selected
          </p>
        </div>
        <button
          type="button"
          className="panel-toggle-btn"
          onClick={() => setIsExpanded((prev) => !prev)}
        >
          {isExpanded ? 'Hide Panel' : 'Show Panel'}
        </button>
      </div>

      {isExpanded && (
        <div className="hashtag-panel-body">
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
            <div className="mentions-groups">
              {mergedMentionGroups.map((group) => (
                <div key={group.label} className="mention-group">
                  <h5 className="mention-group-title">{group.label}</h5>
                  <div className="tags-grid">
                    {group.mentions.map((mention) => {
                      const isCustomMention = customMentionSet.has(mention);
                      if (isCustomMention) {
                        return (
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
                        );
                      }

                      return (
                        <label key={mention} className="tag-checkbox">
                          <input
                            type="checkbox"
                            checked={selectedItems.has(mention)}
                            onChange={() => onToggleItem(mention)}
                          />
                          <span className="tag-label">{mention}</span>
                        </label>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
            
            <form onSubmit={handleAddMention} className="add-tag-form mention-add-form">
              <input
                type="text"
                value={newMention}
                onChange={(e) => setNewMention(e.target.value)}
                placeholder="Add custom mention (e.g., @username)"
                className="add-tag-input"
              />
              <select
                value={effectiveMentionSection}
                onChange={(e) => setMentionSection(e.target.value)}
                className="add-tag-select"
              >
                {sectionOptions.map((section) => (
                  <option key={section} value={section}>
                    {section}
                  </option>
                ))}
                <option value="__new__">+ New section</option>
              </select>
              {effectiveMentionSection === '__new__' && (
                <input
                  type="text"
                  value={newMentionSection}
                  onChange={(e) => setNewMentionSection(e.target.value)}
                  placeholder="Section name"
                  className="add-tag-input add-tag-section-input"
                />
              )}
              <button type="submit" className="add-tag-btn">Add</button>
            </form>
            {mentionError && <div className="tag-error">{mentionError}</div>}
          </div>
        </div>
      )}
    </div>
  );
};

export default HashtagPanel;

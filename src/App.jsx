import { useState, useEffect } from 'react';
import { data } from './data/tweets';
import TweetCard from './components/TweetCard';
import CategoryFilter from './components/CategoryFilter';
import HashtagPanel from './components/HashtagPanel';
import './App.css';

const LOCAL_STORAGE_KEY = 'twitter_app_done_messages';
const LOCAL_STORAGE_TRUTH_KEY = 'twitter_app_done_truths';
const PREFERENCES_KEY = 'twitter_app_preferences';
const CUSTOM_HASHTAGS_KEY = 'twitter_app_custom_hashtags';
const CUSTOM_MENTIONS_KEY = 'twitter_app_custom_mentions';
const DEFAULT_CUSTOM_MENTION_GROUP = 'Custom Mentions';

const normalizeMention = (mention) => {
  if (typeof mention !== 'string') {
    return '';
  }
  const trimmed = mention.trim();
  if (!trimmed) {
    return '';
  }
  return trimmed.startsWith('@') ? trimmed : `@${trimmed}`;
};

const normalizeCustomMentionGroups = (savedValue) => {
  if (!Array.isArray(savedValue)) {
    return [];
  }

  const addUniqueMentions = (mentions, seenMentions) => {
    const normalized = [];
    mentions.forEach((mention) => {
      const formatted = normalizeMention(mention);
      if (formatted && !seenMentions.has(formatted)) {
        seenMentions.add(formatted);
        normalized.push(formatted);
      }
    });
    return normalized;
  };

  // Backward compatibility with legacy storage format: ["@name1", "@name2"]
  if (savedValue.every((item) => typeof item === 'string')) {
    const seenMentions = new Set();
    const mentions = addUniqueMentions(savedValue, seenMentions);
    if (!mentions.length) {
      return [];
    }
    return [{ label: DEFAULT_CUSTOM_MENTION_GROUP, mentions }];
  }

  const seenMentions = new Set();
  return savedValue
    .filter((group) => group && typeof group === 'object')
    .map((group) => {
      const label = typeof group.label === 'string' ? group.label.trim() : '';
      const mentions = Array.isArray(group.mentions) ? addUniqueMentions(group.mentions, seenMentions) : [];
      return { label, mentions };
    })
    .filter((group) => group.label && group.mentions.length > 0);
};

const flattenMentionGroups = (groups) => groups.flatMap((group) => group.mentions);

function App() {
  const [selectedCategory, setSelectedCategory] = useState(data.categories[0]);
  const [doneMessages, setDoneMessages] = useState(new Set());
  const [doneTruths, setDoneTruths] = useState(new Set());
  const [selectedTags, setSelectedTags] = useState(new Set());
  const [customHashtags, setCustomHashtags] = useState([]);
  const [customMentionGroups, setCustomMentionGroups] = useState([]);

  // Load state from local storage on mount
  useEffect(() => {
    const savedDone = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (savedDone) {
      try {
        setDoneMessages(new Set(JSON.parse(savedDone)));
      } catch (e) {
        console.error("Failed to parse done messages", e);
      }
    }

    const savedDoneTruths = localStorage.getItem(LOCAL_STORAGE_TRUTH_KEY);
    if (savedDoneTruths) {
      try {
        setDoneTruths(new Set(JSON.parse(savedDoneTruths)));
      } catch (e) {
        console.error("Failed to parse done truths", e);
      }
    }

    const savedPrefs = localStorage.getItem(PREFERENCES_KEY);
    if (savedPrefs) {
      try {
        setSelectedTags(new Set(JSON.parse(savedPrefs)));
      } catch (e) {
        console.error("Failed to parse preferences", e);
      }
    }

    const savedCustomHashtags = localStorage.getItem(CUSTOM_HASHTAGS_KEY);
    if (savedCustomHashtags) {
      try {
        setCustomHashtags(JSON.parse(savedCustomHashtags));
      } catch (e) {
        console.error("Failed to parse custom hashtags", e);
      }
    }

    const savedCustomMentions = localStorage.getItem(CUSTOM_MENTIONS_KEY);
    if (savedCustomMentions) {
      try {
        setCustomMentionGroups(normalizeCustomMentionGroups(JSON.parse(savedCustomMentions)));
      } catch (e) {
        console.error("Failed to parse custom mentions", e);
      }
    }
  }, []);

  const handleSelectCategory = (category) => {
    setSelectedCategory(category);
  };

  const handleToggleTag = (tag) => {
    const newTags = new Set(selectedTags);
    if (newTags.has(tag)) {
      newTags.delete(tag);
    } else {
      newTags.add(tag);
    }
    setSelectedTags(newTags);
    localStorage.setItem(PREFERENCES_KEY, JSON.stringify([...newTags]));
  };

  const handleAddCustomHashtag = (hashtag) => {
    // Ensure it starts with #
    const formatted = hashtag.startsWith('#') ? hashtag : `#${hashtag}`;
    if (!customHashtags.includes(formatted) && !data.hashtags.includes(formatted)) {
      const newHashtags = [...customHashtags, formatted];
      setCustomHashtags(newHashtags);
      localStorage.setItem(CUSTOM_HASHTAGS_KEY, JSON.stringify(newHashtags));
      return true;
    }
    return false;
  };

  const handleRemoveCustomHashtag = (hashtag) => {
    const newHashtags = customHashtags.filter(h => h !== hashtag);
    setCustomHashtags(newHashtags);
    localStorage.setItem(CUSTOM_HASHTAGS_KEY, JSON.stringify(newHashtags));
    
    // Also remove from selected tags if it was selected
    const newTags = new Set(selectedTags);
    newTags.delete(hashtag);
    setSelectedTags(newTags);
    localStorage.setItem(PREFERENCES_KEY, JSON.stringify([...newTags]));
  };

  const handleAddCustomMention = (mention, groupLabel) => {
    const formattedMention = normalizeMention(mention);
    const normalizedLabel = typeof groupLabel === 'string' ? groupLabel.trim() : '';

    if (!formattedMention || !normalizedLabel) {
      return false;
    }

    const allMentions = new Set([
      ...data.mentions,
      ...flattenMentionGroups(customMentionGroups)
    ]);
    if (allMentions.has(formattedMention)) {
      return false;
    }

    const newGroups = customMentionGroups.map((group) => ({
      label: group.label,
      mentions: [...group.mentions]
    }));

    const groupIndex = newGroups.findIndex(
      (group) => group.label.toLowerCase() === normalizedLabel.toLowerCase()
    );
    if (groupIndex >= 0) {
      newGroups[groupIndex].mentions.push(formattedMention);
    } else {
      newGroups.push({ label: normalizedLabel, mentions: [formattedMention] });
    }

    setCustomMentionGroups(newGroups);
    localStorage.setItem(CUSTOM_MENTIONS_KEY, JSON.stringify(newGroups));
    return true;
  };

  const handleRemoveCustomMention = (mention) => {
    const newGroups = customMentionGroups
      .map((group) => ({
        ...group,
        mentions: group.mentions.filter((m) => m !== mention)
      }))
      .filter((group) => group.mentions.length > 0);

    setCustomMentionGroups(newGroups);
    localStorage.setItem(CUSTOM_MENTIONS_KEY, JSON.stringify(newGroups));
    
    // Also remove from selected tags if it was selected
    const newTags = new Set(selectedTags);
    newTags.delete(mention);
    setSelectedTags(newTags);
    localStorage.setItem(PREFERENCES_KEY, JSON.stringify([...newTags]));
  };

  const handleClearHistory = () => {
    setDoneMessages(new Set());
    setDoneTruths(new Set());
    localStorage.removeItem(LOCAL_STORAGE_KEY);
    localStorage.removeItem(LOCAL_STORAGE_TRUTH_KEY);
  };

  const handleClearPreferences = () => {
    setSelectedTags(new Set());
    setCustomHashtags([]);
    setCustomMentionGroups([]);
    localStorage.removeItem(PREFERENCES_KEY);
    localStorage.removeItem(CUSTOM_HASHTAGS_KEY);
    localStorage.removeItem(CUSTOM_MENTIONS_KEY);
  };

  // Calculate counts for each category
  const categoryCounts = {};
  data.categories.forEach(cat => {
    const msgs = data.messages[cat] || [];
    const doneCount = msgs.filter(m => doneMessages.has(`${cat}-${m.id}`)).length;
    categoryCounts[cat] = { done: doneCount, total: msgs.length };
  });

  const currentMessages = data.messages[selectedCategory] || [];

  const handleTweet = (id) => {
    const key = `${selectedCategory}-${id}`;
    const newDoneMessages = new Set(doneMessages);
    newDoneMessages.add(key);
    setDoneMessages(newDoneMessages);
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify([...newDoneMessages]));
  };

  const handleTruth = (id) => {
    const key = `${selectedCategory}-${id}`;
    const newDoneTruths = new Set(doneTruths);
    newDoneTruths.add(key);
    setDoneTruths(newDoneTruths);
    localStorage.setItem(LOCAL_STORAGE_TRUTH_KEY, JSON.stringify([...newDoneTruths]));
  };

  return (
    <div className="app-container">
      <header className="app-intro">
        <div className="header-top">
          <h1>Twitter Amplification</h1>
          <div className="header-actions">
            <button className="clear-history-btn" onClick={handleClearPreferences}>
              Clear Preferences
            </button>
            <button className="clear-history-btn" onClick={handleClearHistory}>
              Clear History
            </button>
          </div>
        </div>
        <p>Select a category and tweet to support the cause.</p>
        <div className="warning-banner">
          Warning: To avoid being banned, please tweet responsibly. We recommend waiting 1-2 minutes between tweets.
        </div>
      </header>

      <section className="app-controls">
        <HashtagPanel 
          hashtags={data.hashtags || []}
          mentions={data.mentions || []}
          mentionGroups={data.mentionGroups || []}
          customHashtags={customHashtags}
          customMentionGroups={customMentionGroups}
          selectedItems={selectedTags}
          onToggleItem={handleToggleTag}
          onAddCustomHashtag={handleAddCustomHashtag}
          onRemoveCustomHashtag={handleRemoveCustomHashtag}
          onAddCustomMention={handleAddCustomMention}
          onRemoveCustomMention={handleRemoveCustomMention}
        />
        
        <CategoryFilter 
          categories={data.categories}
          selectedCategory={selectedCategory}
          onSelectCategory={handleSelectCategory}
          counts={categoryCounts}
        />
      </section>
      
      <main className="tweets-grid">
        {currentMessages.map((msg) => {
          // Append selected tags and mentions to the message
          const tagsString = Array.from(selectedTags).join(' ');
          const fullMessage = tagsString ? `${msg.text}\n\n${tagsString}` : msg.text;
          
          return (
            <TweetCard 
              key={msg.id}
              id={msg.id}
              message={fullMessage}
              isTweetDone={doneMessages.has(`${selectedCategory}-${msg.id}`)}
              isTruthDone={doneTruths.has(`${selectedCategory}-${msg.id}`)}
              onTweet={handleTweet}
              onTruth={handleTruth}
            />
          );
        })}
      </main>
    </div>
  );
}

export default App;

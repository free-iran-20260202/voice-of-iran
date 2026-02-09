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
const CUSTOM_TWEETS_KEY = 'twitter_app_custom_tweets';
const HIDDEN_TWEETS_KEY = 'twitter_app_hidden_tweets';
const DEFAULT_CUSTOM_MENTION_GROUP = 'Custom Mentions';
const CUSTOM_TWEET_MAX_LENGTH = 280;

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

const normalizeCustomTweets = (savedValue, categories) => {
  if (!savedValue || typeof savedValue !== 'object') {
    return {};
  }

  const allowedCategories = new Set(categories);
  const normalized = {};

  Object.entries(savedValue).forEach(([category, tweets]) => {
    if (!allowedCategories.has(category) || !Array.isArray(tweets)) {
      return;
    }

    const uniqueIds = new Set();
    const cleanTweets = tweets
      .filter((tweet) => tweet && typeof tweet === 'object')
      .map((tweet) => {
        const id = typeof tweet.id === 'string' ? tweet.id : '';
        const text = typeof tweet.text === 'string' ? tweet.text.trim() : '';
        return { id, text };
      })
      .filter((tweet) => tweet.id && tweet.text && !uniqueIds.has(tweet.id) && uniqueIds.add(tweet.id));

    if (cleanTweets.length) {
      normalized[category] = cleanTweets;
    }
  });

  return normalized;
};

function App() {
  const [selectedCategory, setSelectedCategory] = useState(data.categories[0]);
  const [doneMessages, setDoneMessages] = useState(new Set());
  const [doneTruths, setDoneTruths] = useState(new Set());
  const [selectedTags, setSelectedTags] = useState(new Set());
  const [customHashtags, setCustomHashtags] = useState([]);
  const [customMentionGroups, setCustomMentionGroups] = useState([]);
  const [customTweetsByCategory, setCustomTweetsByCategory] = useState({});
  const [hiddenTweetKeys, setHiddenTweetKeys] = useState(new Set());
  const [newCustomTweet, setNewCustomTweet] = useState('');
  const [customTweetCategory, setCustomTweetCategory] = useState(data.categories[0]);
  const [customTweetError, setCustomTweetError] = useState('');
  const customTweetLength = newCustomTweet.length;
  const customTweetTooLong = customTweetLength > CUSTOM_TWEET_MAX_LENGTH;

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

    const savedCustomTweets = localStorage.getItem(CUSTOM_TWEETS_KEY);
    if (savedCustomTweets) {
      try {
        setCustomTweetsByCategory(normalizeCustomTweets(JSON.parse(savedCustomTweets), data.categories));
      } catch (e) {
        console.error("Failed to parse custom tweets", e);
      }
    }

    const savedHiddenTweets = localStorage.getItem(HIDDEN_TWEETS_KEY);
    if (savedHiddenTweets) {
      try {
        const parsed = JSON.parse(savedHiddenTweets);
        if (Array.isArray(parsed)) {
          setHiddenTweetKeys(new Set(parsed));
        }
      } catch (e) {
        console.error("Failed to parse hidden tweets", e);
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

  const clearTweetDoneState = (category, id) => {
    const tweetKey = `${category}-${id}`;

    if (doneMessages.has(tweetKey)) {
      const newDoneMessages = new Set(doneMessages);
      newDoneMessages.delete(tweetKey);
      setDoneMessages(newDoneMessages);
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify([...newDoneMessages]));
    }

    if (doneTruths.has(tweetKey)) {
      const newDoneTruths = new Set(doneTruths);
      newDoneTruths.delete(tweetKey);
      setDoneTruths(newDoneTruths);
      localStorage.setItem(LOCAL_STORAGE_TRUTH_KEY, JSON.stringify([...newDoneTruths]));
    }
  };

  const handleAddCustomTweet = (e) => {
    e.preventDefault();
    setCustomTweetError('');

    const text = newCustomTweet.trim();
    if (!text) {
      setCustomTweetError('Please enter a tweet template');
      return;
    }

    if (text.length > CUSTOM_TWEET_MAX_LENGTH) {
      setCustomTweetError(`Tweet template must be ${CUSTOM_TWEET_MAX_LENGTH} characters or fewer`);
      return;
    }

    if (!data.categories.includes(customTweetCategory)) {
      setCustomTweetError('Please choose a valid category');
      return;
    }

    const newTweet = {
      id: `custom-${Date.now()}`,
      text
    };

    const existingForCategory = customTweetsByCategory[customTweetCategory] || [];
    const newCustomTweetsByCategory = {
      ...customTweetsByCategory,
      [customTweetCategory]: [...existingForCategory, newTweet]
    };

    setCustomTweetsByCategory(newCustomTweetsByCategory);
    localStorage.setItem(CUSTOM_TWEETS_KEY, JSON.stringify(newCustomTweetsByCategory));
    setNewCustomTweet('');
  };

  const handleRemoveCustomTweet = (category, id) => {
    const currentTweets = customTweetsByCategory[category] || [];
    const remainingTweets = currentTweets.filter((tweet) => tweet.id !== id);
    const nextCustomTweets = { ...customTweetsByCategory };

    if (remainingTweets.length) {
      nextCustomTweets[category] = remainingTweets;
    } else {
      delete nextCustomTweets[category];
    }

    setCustomTweetsByCategory(nextCustomTweets);
    localStorage.setItem(CUSTOM_TWEETS_KEY, JSON.stringify(nextCustomTweets));
    clearTweetDoneState(category, id);
  };

  const handleHideDefaultTweet = (category, id) => {
    const hiddenKey = `${category}-${id}`;
    const nextHidden = new Set(hiddenTweetKeys);
    nextHidden.add(hiddenKey);
    setHiddenTweetKeys(nextHidden);
    localStorage.setItem(HIDDEN_TWEETS_KEY, JSON.stringify([...nextHidden]));
    clearTweetDoneState(category, id);
  };

  // Calculate counts for each category
  const categoryCounts = {};
  data.categories.forEach(cat => {
    const baseMsgs = (data.messages[cat] || []).filter((message) => !hiddenTweetKeys.has(`${cat}-${message.id}`));
    const customMsgs = customTweetsByCategory[cat] || [];
    const msgs = [...baseMsgs, ...customMsgs];
    const doneCount = msgs.filter(m => doneMessages.has(`${cat}-${m.id}`)).length;
    categoryCounts[cat] = { done: doneCount, total: msgs.length };
  });

  const currentMessages = [
    ...(data.messages[selectedCategory] || [])
      .filter((message) => !hiddenTweetKeys.has(`${selectedCategory}-${message.id}`))
      .map((message) => ({
      ...message,
      isCustom: false
    })),
    ...(customTweetsByCategory[selectedCategory] || []).map((message) => ({
      ...message,
      isCustom: true
    }))
  ];

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
              onDelete={msg.isCustom
                ? () => handleRemoveCustomTweet(selectedCategory, msg.id)
                : () => handleHideDefaultTweet(selectedCategory, msg.id)}
            />
          );
        })}
      </main>

      <section className="custom-tweet-wrap">
        <div className="tweet-card custom-tweet-card">
          <h3>Custom Template Tweet</h3>
        <form onSubmit={handleAddCustomTweet} className="custom-tweet-form">
          <select
            value={customTweetCategory}
            onChange={(e) => setCustomTweetCategory(e.target.value)}
            className="add-tag-select"
          >
            {data.categories.map((category) => (
              <option key={category} value={category}>
                {category}
              </option>
            ))}
          </select>
          <textarea
            value={newCustomTweet}
            onChange={(e) => {
              setNewCustomTweet(e.target.value);
              if (customTweetError) {
                setCustomTweetError('');
              }
            }}
            placeholder="Write your custom tweet template..."
            className="custom-tweet-input"
            rows={2}
          />
          <div className={`char-counter ${customTweetTooLong ? 'limit' : ''}`}>
            {customTweetLength}/{CUSTOM_TWEET_MAX_LENGTH}
          </div>
          <button type="submit" className="add-tag-btn" disabled={customTweetTooLong}>
            Add Template
          </button>
        </form>
        {customTweetError && <div className="tag-error">{customTweetError}</div>}

        {(customTweetsByCategory[selectedCategory] || []).length > 0 && (
          <div className="custom-template-list">
            <h4>{selectedCategory} Custom Templates</h4>
            {(customTweetsByCategory[selectedCategory] || []).map((tweet) => (
              <div key={tweet.id} className="custom-template-item">
                <p>{tweet.text}</p>
                <button
                  className="remove-tag-btn"
                  onClick={() => handleRemoveCustomTweet(selectedCategory, tweet.id)}
                  title="Remove custom template"
                >
                  ×
                </button>
              </div>
            ))}
          </div>
        )}
        </div>
      </section>
    </div>
  );
}

export default App;

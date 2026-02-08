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

function App() {
  const [selectedCategory, setSelectedCategory] = useState(data.categories[0]);
  const [doneMessages, setDoneMessages] = useState(new Set());
  const [doneTruths, setDoneTruths] = useState(new Set());
  const [selectedTags, setSelectedTags] = useState(new Set());
  const [customHashtags, setCustomHashtags] = useState([]);
  const [customMentions, setCustomMentions] = useState([]);

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
        setCustomMentions(JSON.parse(savedCustomMentions));
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

  const handleAddCustomMention = (mention) => {
    // Ensure it starts with @
    const formatted = mention.startsWith('@') ? mention : `@${mention}`;
    if (!customMentions.includes(formatted) && !data.mentions.includes(formatted)) {
      const newMentions = [...customMentions, formatted];
      setCustomMentions(newMentions);
      localStorage.setItem(CUSTOM_MENTIONS_KEY, JSON.stringify(newMentions));
      return true;
    }
    return false;
  };

  const handleRemoveCustomMention = (mention) => {
    const newMentions = customMentions.filter(m => m !== mention);
    setCustomMentions(newMentions);
    localStorage.setItem(CUSTOM_MENTIONS_KEY, JSON.stringify(newMentions));
    
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
    setCustomMentions([]);
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
      <header className="app-header">
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
        
        <HashtagPanel 
          hashtags={data.hashtags || []}
          mentions={data.mentions || []}
          customHashtags={customHashtags}
          customMentions={customMentions}
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
      </header>
      
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

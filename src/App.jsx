import { useState, useEffect } from 'react';
import { data } from './data/tweets';
import TweetCard from './components/TweetCard';
import CategoryFilter from './components/CategoryFilter';
import './App.css';

const LOCAL_STORAGE_KEY = 'twitter_app_done_messages';

function App() {
  const [selectedCategory, setSelectedCategory] = useState(data.categories[0]);
  const [doneMessages, setDoneMessages] = useState(new Set());

  // Load done messages from local storage on mount
  useEffect(() => {
    const saved = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (saved) {
      try {
        setDoneMessages(new Set(JSON.parse(saved)));
      } catch (e) {
        console.error("Failed to parse local storage", e);
      }
    }
  }, []);

  const handleSelectCategory = (category) => {
    setSelectedCategory(category);
  };



  const handleClearHistory = () => {
    setDoneMessages(new Set());
    localStorage.removeItem(LOCAL_STORAGE_KEY);
  };

  // Calculate counts for each category
  const categoryCounts = {};
  data.categories.forEach(cat => {
    const msgs = data.messages[cat] || [];
    const doneCount = msgs.filter(m => doneMessages.has(`${cat}-${m.id}`)).length;
    categoryCounts[cat] = { done: doneCount, total: msgs.length };
  });

  const rawMessages = data.messages[selectedCategory] || [];
  // Sort: Not done first, then Done
  const currentMessages = [...rawMessages].sort((a, b) => {
    const aDone = doneMessages.has(`${selectedCategory}-${a.id}`);
    const bDone = doneMessages.has(`${selectedCategory}-${b.id}`);
    if (aDone === bDone) return 0;
    return aDone ? 1 : -1;
  });

  const handleTweet = (id) => {
    const key = `${selectedCategory}-${id}`;
    const newDoneMessages = new Set(doneMessages);
    newDoneMessages.add(key);
    setDoneMessages(newDoneMessages);
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify([...newDoneMessages]));
  };

  return (
    <div className="app-container">
      <header className="app-header">
        <div className="header-top">
          <h1>Twitter Amplification</h1>
          <button className="clear-history-btn" onClick={handleClearHistory}>
            Clear History
          </button>
        </div>
        <p>Select a category and tweet to support the cause.</p>
        <div className="warning-banner">
          Warning: To avoid being banned, please tweet responsibly. We recommend waiting 1-2 minutes between tweets.
        </div>
        <CategoryFilter 
          categories={data.categories}
          selectedCategory={selectedCategory}
          onSelectCategory={handleSelectCategory}
          counts={categoryCounts}
        />
      </header>
      
      <main className="tweets-grid">
        {currentMessages.map((msg) => (
          <TweetCard 
            key={msg.id}
            id={msg.id}
            message={msg.text}
            isDone={doneMessages.has(`${selectedCategory}-${msg.id}`)}
            onTweet={handleTweet}
          />
        ))}
      </main>
    </div>
  );
}

export default App;

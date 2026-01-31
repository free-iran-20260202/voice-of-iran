import React from 'react';

const CategoryFilter = ({ categories, selectedCategory, onSelectCategory, counts }) => {
  return (
    <div className="category-filter">
      {categories.map((category) => {
        const countInfo = counts ? counts[category] : null;
        const countText = countInfo ? ` (${countInfo.done}/${countInfo.total})` : '';
        
        return (
          <button
            key={category}
            className={`category-btn ${selectedCategory === category ? 'active' : ''}`}
            onClick={() => onSelectCategory(category)}
          >
            {category.charAt(0).toUpperCase() + category.slice(1) + countText}
          </button>
        );
      })}
    </div>
  );
};

export default CategoryFilter;

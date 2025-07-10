import React, { createContext, useContext, useState } from 'react';

const TabBarContext = createContext();

export const useTabBar = () => {
  const context = useContext(TabBarContext);
  if (!context) {
    throw new Error('useTabBar must be used within a TabBarProvider');
  }
  return context;
};

export const TabBarProvider = ({ children }) => {
  const [counts, setCounts] = useState({
    likes: 0,
    matches: 0,
    notifications: 0
  });

  const updateCounts = (newCounts) => {
    setCounts(prev => ({ ...prev, ...newCounts }));
  };

  const refreshCounts = async () => {
    // This will be implemented in the CustomTabBar component
    // and called from here
  };

  return (
    <TabBarContext.Provider value={{ counts, updateCounts, refreshCounts }}>
      {children}
    </TabBarContext.Provider>
  );
}; 
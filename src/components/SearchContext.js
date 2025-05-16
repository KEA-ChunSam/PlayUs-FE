import { createContext, useContext, useState } from 'react';

const SearchContext = createContext();

export const SearchProvider = ({ children }) => {
  const [inputValue, setInputValue] = useState(''); // 입력 중인 검색어
  const [keyword, setKeyword] = useState(''); // 실제 검색에 사용되는 검색어

  return (
    <SearchContext.Provider value={{ inputValue, setInputValue, keyword, setKeyword }}>
      {children}
    </SearchContext.Provider>
  );
};

export const useSearch = () => useContext(SearchContext);
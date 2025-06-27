import React, { useState, useEffect } from "react";

const SearchBox = ({
  value,
  onChange,
  debounce = 400,
  placeholder = "Search novels...",
}) => {
  const [input, setInput] = useState(value || "");

  useEffect(() => {
    const handler = setTimeout(() => {
      onChange(input);
    }, debounce);
    return () => clearTimeout(handler);
  }, [input, onChange, debounce]);

  return (
    <input
      type="text"
      className="border border-gray-300 rounded-lg p-2 w-full md:w-1/3"
      placeholder={placeholder}
      value={input}
      onChange={(e) => setInput(e.target.value)}
    />
  );
};

export default SearchBox;

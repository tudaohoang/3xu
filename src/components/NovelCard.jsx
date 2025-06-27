import React from "react";

const NovelCard = ({ novel, onClick }) => (
  <div
    className="bg-white rounded-lg shadow-lg p-6 mb-6 cursor-pointer"
    onClick={onClick}
  >
    <div className="flex items-center space-x-4">
      {novel.cover_image && (
        <img
          src={novel.cover_image}
          alt={novel.title}
          className="w-20 h-28 object-cover rounded"
        />
      )}
      <div>
        <h3 className="text-xl font-semibold">{novel.title}</h3>
        <p className="text-gray-500">by {novel.author}</p>
        <p className="text-sm text-gray-400 mt-1">{novel.genre}</p>
        <p className="text-sm mt-2 line-clamp-2">{novel.description}</p>
      </div>
    </div>
    <div className="flex justify-between items-center mt-2">
      <span className="text-yellow-500">★ {novel.rating}</span>
      <span>{novel.readers} readers</span>
      <span>{novel.updated}</span>
      <button className="bg-blue-500 text-white rounded-lg px-4 py-2">
        Read Now
      </button>
    </div>
  </div>
);

export default NovelCard;

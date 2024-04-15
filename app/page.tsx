'use client'

import React, { useState, useEffect } from 'react';
import Papa from 'papaparse';

interface Item {
  createdAt: string;
  filename: string;
}


export default function Home() {
  const [sortedItems, setSortedItems] = useState<Item[]>([]);
  const [sortOption, setSortOption] = useState<string>('Sort by Created At Asc');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch('/data.csv');
        const csvData = await response.text();
        const parsedData = Papa.parse(csvData, { delimiter: ';', header: false });

        if (parsedData.errors.length === 0) {
          const data: Item[] = parsedData.data.map((item: any) => {
            const [createdAt, filename] = item;
            return {
              createdAt,
              filename,
            };
          });

          setSortedItems(data);
        } else {
          console.error('CSV error:', parsedData.errors);
        }
      } catch (error) {
        console.error('Data fetching errpr:', error);
      }
    };

    fetchData();
  }, []);

  useEffect(() => {
    const handleSorting = () => {
      switch (sortOption) {
        case 'Sort by Created At Asc':
          setSortedItems([...sortedItems].sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()));
          break;
        case 'Sort by Filename Asc':
          setSortedItems([...sortedItems].sort((a, b) => compareFilenames(a.filename, b.filename)));
          break;
        case 'Sort by Filename Desc':
          setSortedItems([...sortedItems].sort((a, b) => compareFilenames(b.filename, a.filename)));
          break;
        default:
          break;
      }
    };

    handleSorting();
  }, [sortOption]);

  const compareFilenames = (filenameA: string, filenameB: string) => {
    const getNumber = (filename: string) => {
      const matches = filename.match(/\d+/g);
      return matches ? parseInt(matches.join(''), 10) : Infinity;
    };

    const getAlpha = (filename: string) => {
      return filename.replace(/\d+/g, '');
    };

    const numA = getNumber(filenameA);
    const numB = getNumber(filenameB);
    const alphaA = getAlpha(filenameA);
    const alphaB = getAlpha(filenameB);

    if (alphaA === alphaB) {
      return numA - numB;
    }

    return alphaA.localeCompare(alphaB, undefined, { numeric: true });
  };

  const removeLeadingZeros = (filename: string) => {
    const parts = filename.split('.');
    if (parts.length === 2) {
      const [name, extension] = parts;
      const numberMatch = name.match(/\d+/); 
      if (numberMatch) {
        const number = parseInt(numberMatch[0], 10); 
        return `${number}.${extension}`;
      }
    }
    return filename;
  };

  return (
    <div className="container mx-auto p-4">
      <select
        className="p-2 border border-gray-300 rounded bg-black text-white appearance-none"
        value={sortOption}
        onChange={(e) => setSortOption(e.target.value)}
      >
        <option value="Sort by Created At Asc">Sort by Created At Asc</option>
        <option value="Sort by Filename Asc">Sort by Filename Asc</option>
        <option value="Sort by Filename Desc">Sort by Filename Desc</option>
      </select>
      <div className="grid grid-cols-3 gap-4">
        {sortedItems.map((item, index) => (
          <div key={index} className="border p-4 text-white">
            <div><strong>Created At:</strong> {item.createdAt}</div>
            <div><strong>Filename:</strong> {removeLeadingZeros(item.filename)}</div>
          </div>
        ))}
      </div>
    </div>
  );
};


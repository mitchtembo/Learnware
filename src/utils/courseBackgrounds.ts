type CourseBackground = {
  bgColor: string;
  textColor: string;
  icon: string;
};

// Map of course topics (lowercase) to their background colors and icons
const backgroundMap: Record<string, CourseBackground> = {
  // Programming and Computer Science
  "web development": { bgColor: "bg-blue-500", textColor: "text-white", icon: "code" },
  "javascript": { bgColor: "bg-yellow-500", textColor: "text-black", icon: "code-json" },
  "python": { bgColor: "bg-green-600", textColor: "text-white", icon: "code-2" },
  "java": { bgColor: "bg-orange-500", textColor: "text-white", icon: "coffee" },
  "c++": { bgColor: "bg-indigo-600", textColor: "text-white", icon: "terminal" },
  "data science": { bgColor: "bg-violet-600", textColor: "text-white", icon: "bar-chart" },
  "machine learning": { bgColor: "bg-pink-600", textColor: "text-white", icon: "brain" },
  "artificial intelligence": { bgColor: "bg-red-600", textColor: "text-white", icon: "cpu" },
  "cybersecurity": { bgColor: "bg-slate-800", textColor: "text-white", icon: "shield" },
  
  // Business and Economics
  "business": { bgColor: "bg-gray-700", textColor: "text-white", icon: "briefcase" },
  "economics": { bgColor: "bg-purple-700", textColor: "text-white", icon: "trending-up" },
  "marketing": { bgColor: "bg-pink-600", textColor: "text-white", icon: "megaphone" },
  "finance": { bgColor: "bg-emerald-600", textColor: "text-white", icon: "landmark" },
  
  // Sciences
  "physics": { bgColor: "bg-gray-900", textColor: "text-white", icon: "atom" },
  "chemistry": { bgColor: "bg-red-600", textColor: "text-white", icon: "flask-conical" },
  "biology": { bgColor: "bg-emerald-700", textColor: "text-white", icon: "dna" },
  "mathematics": { bgColor: "bg-indigo-800", textColor: "text-white", icon: "calculator" },
  
  // Arts and Humanities
  "history": { bgColor: "bg-amber-700", textColor: "text-white", icon: "clock" },
  "philosophy": { bgColor: "bg-amber-800", textColor: "text-white", icon: "book" },
  "psychology": { bgColor: "bg-rose-700", textColor: "text-white", icon: "brain" },
  "literature": { bgColor: "bg-slate-700", textColor: "text-white", icon: "book-open" },
  "art": { bgColor: "bg-yellow-600", textColor: "text-white", icon: "palette" },
  "music": { bgColor: "bg-blue-700", textColor: "text-white", icon: "music" },
  
  // Languages
  "english": { bgColor: "bg-red-600", textColor: "text-white", icon: "languages" },
  "spanish": { bgColor: "bg-orange-600", textColor: "text-white", icon: "languages" },
  "french": { bgColor: "bg-blue-600", textColor: "text-white", icon: "languages" },
  "german": { bgColor: "bg-emerald-700", textColor: "text-white", icon: "languages" },
  "chinese": { bgColor: "bg-rose-700", textColor: "text-white", icon: "languages" },
  
  // Default (for any topic not in the list)
  "default": { bgColor: "bg-slate-600", textColor: "text-white", icon: "book" }
};

/**
 * Get the appropriate background style for a course based on its topic
 * @param topic Course topic or name
 * @returns Background style information (colors and icon)
 */
export function getCourseBackground(topic: string = ""): CourseBackground {
  const normalizedTopic = topic.toLowerCase().trim();
  
  // Check for exact matches
  if (backgroundMap[normalizedTopic]) {
    return backgroundMap[normalizedTopic];
  }
  
  // Check for partial matches (topic containing the key)
  for (const [key, background] of Object.entries(backgroundMap)) {
    if (normalizedTopic.includes(key) && key !== "default") {
      return background;
    }
  }
  
  // Check for the first word match
  const firstWord = normalizedTopic.split(" ")[0];
  for (const [key, background] of Object.entries(backgroundMap)) {
    if (key.includes(firstWord) && firstWord.length > 3 && key !== "default") {
      return background;
    }
  }
  
  // Return default if no match found
  return backgroundMap["default"];
}

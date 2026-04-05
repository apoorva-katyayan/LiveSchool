// Simple TF-IDF implementation for local search

// Tokenize text into words
function tokenize(text) {
  return text
    .toLowerCase()
    .replace(/[^\w\s]/g, ' ')
    .split(/\s+/)
    .filter(word => word.length > 2);
}

// Calculate Term Frequency
function calculateTF(tokens) {
  const tf = {};
  const totalWords = tokens.length;

  tokens.forEach(token => {
    tf[token] = (tf[token] || 0) + 1;
  });

  // Normalize
  Object.keys(tf).forEach(term => {
    tf[term] = tf[term] / totalWords;
  });

  return tf;
}

// Calculate Inverse Document Frequency
function calculateIDF(documents) {
  const idf = {};
  const totalDocs = documents.length;

  documents.forEach(doc => {
    const uniqueTerms = new Set(doc.tokens);
    uniqueTerms.forEach(term => {
      idf[term] = (idf[term] || 0) + 1;
    });
  });

  // Calculate IDF
  Object.keys(idf).forEach(term => {
    idf[term] = Math.log(totalDocs / idf[term]);
  });

  return idf;
}

// Calculate TF-IDF for a query against documents
export function calculateTFIDF(query, documents) {
  const queryTokens = tokenize(query);
  const queryTF = calculateTF(queryTokens);

  // Prepare document tokens
  const docTokens = documents.map(doc => ({
    id: doc.id,
    lessonId: doc.lessonId,
    tokens: tokenize(doc.title + ' ' + doc.description)
  }));

  const idf = calculateIDF(docTokens);

  // Calculate TF-IDF for query
  const queryTFIDF = {};
  queryTokens.forEach(term => {
    if (idf[term]) {
      queryTFIDF[term] = queryTF[term] * idf[term];
    }
  });

  // Calculate TF-IDF for each document
  const docScores = docTokens.map(doc => {
    const docTF = calculateTF(doc.tokens);
    const docTFIDF = {};

    Object.keys(docTF).forEach(term => {
      if (idf[term]) {
        docTFIDF[term] = docTF[term] * idf[term];
      }
    });

    return {
      id: doc.id,
      lessonId: doc.lessonId,
      tfidf: docTFIDF
    };
  });

  return { queryTFIDF, docScores };
}

// Calculate cosine similarity
export function cosineSimilarity(vec1, vec2) {
  const terms = new Set([...Object.keys(vec1), ...Object.keys(vec2)]);
  
  let dotProduct = 0;
  let magnitude1 = 0;
  let magnitude2 = 0;

  terms.forEach(term => {
    const val1 = vec1[term] || 0;
    const val2 = vec2[term] || 0;
    dotProduct += val1 * val2;
    magnitude1 += val1 * val1;
    magnitude2 += val2 * val2;
  });

  if (magnitude1 === 0 || magnitude2 === 0) return 0;
  return dotProduct / (Math.sqrt(magnitude1) * Math.sqrt(magnitude2));
}

// Find relevant content
export function findRelevantContent(query, lessons, topK = 5) {
  if (lessons.length === 0) return [];

  const documents = lessons.map(lesson => ({
    id: lesson._id.toString(),
    lessonId: lesson._id.toString(),
    title: lesson.title || '',
    description: lesson.description || ''
  }));

  const { queryTFIDF, docScores } = calculateTFIDF(query, documents);

  // Calculate similarity scores
  const scores = docScores.map(doc => ({
    lessonId: doc.lessonId,
    similarity: cosineSimilarity(queryTFIDF, doc.tfidf)
  }));

  // Sort by similarity and return top K
  return scores
    .sort((a, b) => b.similarity - a.similarity)
    .filter(item => item.similarity > 0)
    .slice(0, topK);
}

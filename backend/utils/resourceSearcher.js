import axios from 'axios';

/**
 * Validate and sanitize resource URLs
 */
function validateResource(resource) {
    if (!resource || !resource.url || !resource.title) {
        return null;
    }

    // Ensure URL is valid
    try {
        new URL(resource.url);
    } catch (error) {
        console.warn('Invalid URL found:', resource.url);
        return null;
    }

    // Clean up the resource object
    return {
        ...resource,
        title: resource.title || 'Untitled Resource',
        description: resource.description || 'No description available',
        platform: resource.platform || 'Unknown',
        url: resource.url.trim()
    };
}

/**
 * Filter and validate resources array
 */
function filterValidResources(resources) {
    if (!Array.isArray(resources)) {
        return [];
    }

    return resources
        .map(validateResource)
        .filter(resource => resource !== null);
}

/**
 * Search YouTube for educational videos
 */
export const searchYouTube = async (query, maxResults = 5) => {
    try {
        const apiKey = process.env.YOUTUBE_API_KEY;

        if (!apiKey) {
            console.warn('YouTube API key not configured');
            // Return mock data for development
            return generateMockYouTubeResults(query, maxResults);
        }

        const response = await axios.get('https://www.googleapis.com/youtube/v3/search', {
            params: {
                part: 'snippet',
                q: query + ' tutorial programming',
                type: 'video',
                maxResults,
                key: apiKey,
                videoDuration: 'medium', // 4-20 minutes
                relevanceLanguage: 'en',
                safeSearch: 'strict'
            }
        });

        const results = response.data.items.map(item => ({
            type: 'youtube',
            title: item.snippet.title,
            description: item.snippet.description,
            url: `https://www.youtube.com/watch?v=${item.id.videoId}`,
            thumbnail: item.snippet.thumbnails?.medium?.url || item.snippet.thumbnails?.default?.url,
            channel: item.snippet.channelTitle,
            publishedAt: item.snippet.publishedAt,
            platform: 'YouTube'
        }));

        return filterValidResources(results);

    } catch (error) {
        console.error('YouTube search error:', error.message);
        return filterValidResources(generateMockYouTubeResults(query, maxResults));
    }
};

/**
 * Search GeeksforGeeks articles
 */
export const searchGeeksForGeeks = async (query, maxResults = 3) => {
    try {
        // GeeksforGeeks doesn't have a public API, so we'll use a mock approach
        // For production, consider using their official API if available or Google Custom Search

        const searchUrl = `https://www.google.com/search?q=site:geeksforgeeks.org+${encodeURIComponent(query)}`;

        // Return structured results
        const results = [
            {
                type: 'article',
                title: `${query} - GeeksforGeeks`,
                description: `Learn ${query} with detailed explanations, examples, and practice problems on GeeksforGeeks`,
                url: `https://www.geeksforgeeks.org/${query.toLowerCase().replace(/\s+/g, '-')}/`,
                platform: 'GeeksforGeeks',
                icon: '📚'
            },
            {
                type: 'article',
                title: `${query} Tutorial - GeeksforGeeks`,
                description: `Comprehensive tutorial on ${query} with code examples and explanations`,
                url: `https://www.geeksforgeeks.org/?s=${encodeURIComponent(query)}`,
                platform: 'GeeksforGeeks',
                icon: '📚'
            }
        ].slice(0, maxResults);

        return filterValidResources(results);

    } catch (error) {
        console.error('GeeksforGeeks search error:', error.message);
        return [];
    }
};

/**
 * Search MDN Web Docs
 */
export const searchMDN = async (query, maxResults = 2) => {
    try {
        // Check if query is web development related
        const webKeywords = ['javascript', 'html', 'css', 'web', 'dom', 'api', 'http', 'node'];
        const isWebRelated = webKeywords.some(keyword =>
            query.toLowerCase().includes(keyword)
        );

        if (!isWebRelated) {
            return [];
        }

        const results = [
            {
                type: 'documentation',
                title: `${query} - MDN Web Docs`,
                description: `Official documentation and guides for ${query} from Mozilla Developer Network`,
                url: `https://developer.mozilla.org/en-US/search?q=${encodeURIComponent(query)}`,
                platform: 'MDN',
                icon: '🌐'
            }
        ];

        return filterValidResources(results);

    } catch (error) {
        console.error('MDN search error:', error.message);
        return [];
    }
};

/**
 * Search W3Schools tutorials
 */
export const searchW3Schools = async (query, maxResults = 2) => {
    try {
        const webKeywords = ['javascript', 'html', 'css', 'sql', 'python', 'java', 'php', 'xml', 'react', 'nodejs'];
        const isSupported = webKeywords.some(keyword =>
            query.toLowerCase().includes(keyword)
        );

        if (!isSupported) {
            return [];
        }

        const results = [
            {
                type: 'tutorial',
                title: `${query} Tutorial - W3Schools`,
                description: `Learn ${query} with interactive examples and exercises on W3Schools`,
                url: `https://www.w3schools.com/${getW3SchoolsPath(query)}`,
                platform: 'W3Schools',
                icon: '💻'
            }
        ];

        return filterValidResources(results);

    } catch (error) {
        console.error('W3Schools search error:', error.message);
        return [];
    }
};

/**
 * Search Stack Overflow for common questions
 */
export const searchStackOverflow = async (query, maxResults = 2) => {
    try {
        const results = [
            {
                type: 'forum',
                title: `${query} - Stack Overflow`,
                description: `Find answers and discussions about ${query} on Stack Overflow`,
                url: `https://stackoverflow.com/search?q=${encodeURIComponent(query)}`,
                platform: 'Stack Overflow',
                icon: '💬'
            }
        ];

        return filterValidResources(results);

    } catch (error) {
        console.error('Stack Overflow search error:', error.message);
        return [];
    }
};

/**
 * Helper function to get W3Schools path
 */
function getW3SchoolsPath(query) {
    const queryLower = query.toLowerCase();

    // Programming languages
    if (queryLower.includes('javascript') || queryLower.includes('js')) return 'js/';
    if (queryLower.includes('html')) return 'html/';
    if (queryLower.includes('css')) return 'css/';
    if (queryLower.includes('python')) return 'python/';
    if (queryLower.includes('sql')) return 'sql/';
    if (queryLower.includes('java') && !queryLower.includes('javascript')) return 'java/';
    if (queryLower.includes('php')) return 'php/';
    if (queryLower.includes('c++') || queryLower.includes('cpp')) return 'cpp/';

    // Frameworks and libraries
    if (queryLower.includes('react')) return 'react/';
    if (queryLower.includes('nodejs') || queryLower.includes('node')) return 'nodejs/';
    if (queryLower.includes('bootstrap')) return 'bootstrap/';
    if (queryLower.includes('jquery')) return 'jquery/';

    // Web technologies
    if (queryLower.includes('xml')) return 'xml/';
    if (queryLower.includes('json')) return 'js/js_json.asp';
    if (queryLower.includes('ajax')) return 'js/js_ajax_intro.asp';

    // Default to general programming section
    return 'tryit/';
}

/**
 * Generate mock YouTube results for development (when API key not available)
 */
function generateMockYouTubeResults(query, count = 5) {
    const channels = [
        'freeCodeCamp.org',
        'Traversy Media',
        'Programming with Mosh',
        'The Net Ninja',
        'Academind',
        'Web Dev Simplified'
    ];

    const mockVideoIds = [
        'dQw4w9WgXcQ',
        'kJQP7kiw5Fk',
        'fJ9rUzIMcZQ',
        'ClkQA2Lb_iE',
        'L_LUpnjgPso',
        'M7lc1UVf-VE'
    ];

    return Array.from({ length: Math.min(count, 5) }, (_, i) => ({
        type: 'youtube',
        title: `${query} - Complete Tutorial ${i + 1}`,
        description: `Learn ${query} from scratch with this comprehensive tutorial. Perfect for beginners and intermediate learners.`,
        url: `https://www.youtube.com/watch?v=${mockVideoIds[i % mockVideoIds.length]}`,
        thumbnail: `https://img.youtube.com/vi/${mockVideoIds[i % mockVideoIds.length]}/mqdefault.jpg`,
        channel: channels[i % channels.length],
        publishedAt: new Date(Date.now() - i * 86400000).toISOString(),
        platform: 'YouTube',
        isMock: true
    }));
}

/**
 * Search for resources based on PDF content analysis
 */
export const searchByPDFContent = async (contentAnalysis, maxResults = 8) => {
    try {
        if (!contentAnalysis || !contentAnalysis.keyTopics || contentAnalysis.keyTopics.length === 0) {
            return [];
        }

        const { keyTopics, subject, difficulty } = contentAnalysis;

        // Prioritize key topics for more relevant searches
        const searchQueries = keyTopics.slice(0, 3).map(topic =>
            `${topic} ${subject} tutorial ${difficulty}`
        );

        const searchPromises = [];

        // Search each topic across different platforms
        for (const query of searchQueries) {
            searchPromises.push(
                searchYouTube(query, 2),
                searchGeeksForGeeks(query, 1),
                searchMDN(query, 1),
                searchW3Schools(query, 1)
            );
        }

        const results = await Promise.all(searchPromises);
        const allResources = results.flat();

        // Remove duplicates and sort by relevance
        const uniqueResources = removeDuplicateResources(allResources);
        const sortedResources = sortResourcesByRelevance(uniqueResources, keyTopics);

        return sortedResources.slice(0, maxResults);

    } catch (error) {
        console.error('PDF content search error:', error.message);
        return [];
    }
};

/**
 * Remove duplicate resources based on URL similarity
 */
function removeDuplicateResources(resources) {
    const seen = new Set();
    return resources.filter(resource => {
        if (!resource || !resource.url) return false;

        // Create a normalized key for comparison
        const normalizedUrl = resource.url.toLowerCase().replace(/[?#].*$/, '');
        if (seen.has(normalizedUrl)) {
            return false;
        }
        seen.add(normalizedUrl);
        return true;
    });
}

/**
 * Sort resources by relevance to key topics
 */
function sortResourcesByRelevance(resources, keyTopics) {
    if (!keyTopics || keyTopics.length === 0) return resources;

    return resources.sort((a, b) => {
        const scoreA = calculateRelevanceScore(a, keyTopics);
        const scoreB = calculateRelevanceScore(b, keyTopics);
        return scoreB - scoreA;
    });
}

/**
 * Calculate relevance score based on how many key topics appear in resource metadata
 */
function calculateRelevanceScore(resource, keyTopics) {
    if (!resource) return 0;

    let score = 0;
    const searchText = `${resource.title || ''} ${resource.description || ''}`.toLowerCase();

    keyTopics.forEach((topic, index) => {
        if (searchText.includes(topic.toLowerCase())) {
            // Give higher weight to earlier topics (more important)
            score += (keyTopics.length - index) * 2;
        }
    });

    // Bonus points for high-quality platforms
    const platformBonus = {
        'YouTube': 1,
        'GeeksforGeeks': 2,
        'MDN': 3,
        'W3Schools': 1
    };

    score += platformBonus[resource.platform] || 0;

    return score;
}

/**
 * Search all platforms for comprehensive results
 */
export const searchAllPlatforms = async (query) => {
    try {
        const [youtube, geeks, mdn, w3schools, stackoverflow] = await Promise.all([
            searchYouTube(query, 3),
            searchGeeksForGeeks(query, 2),
            searchMDN(query, 1),
            searchW3Schools(query, 1),
            searchStackOverflow(query, 1)
        ]);

        return {
            youtube,
            geeksforgeeks: geeks,
            mdn,
            w3schools,
            stackoverflow,
            all: [...youtube, ...geeks, ...mdn, ...w3schools, ...stackoverflow]
        };

    } catch (error) {
        console.error('Search all platforms error:', error.message);
        return {
            youtube: [],
            geeksforgeeks: [],
            mdn: [],
            w3schools: [],
            stackoverflow: [],
            all: []
        };
    }
};

export default {
    searchYouTube,
    searchGeeksForGeeks,
    searchMDN,
    searchW3Schools,
    searchStackOverflow,
    searchAllPlatforms,
    searchByPDFContent
};
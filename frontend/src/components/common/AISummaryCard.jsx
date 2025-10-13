import React from 'react';
import { Brain, BookOpen, Clock, Target, Lightbulb, Award } from 'lucide-react';

const AISummaryCard = ({ aiSummary, onGenerateSummary, loading = false, noteId }) => {
    if (!aiSummary || !aiSummary.summary) {
        return (
            <div className="bg-gradient-to-r from-purple-50 to-blue-50 border border-purple-200 rounded-lg p-6 my-4">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <Brain className="w-6 h-6 text-purple-600" />
                        <div>
                            <h3 className="font-semibold text-gray-800">AI-Powered Summary</h3>
                            <p className="text-sm text-gray-600">Get instant insights about this resource</p>
                        </div>
                    </div>
                    {onGenerateSummary && (
                        <button
                            onClick={() => onGenerateSummary(noteId)}
                            disabled={loading}
                            className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
                        >
                            {loading ? (
                                <>
                                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                                    Analyzing...
                                </>
                            ) : (
                                <>
                                    <Brain className="w-4 h-4" />
                                    Generate AI Summary
                                </>
                            )}
                        </button>
                    )}
                </div>
            </div>
        );
    }

    const {
        summary,
        keyTopics = [],
        difficultyLevel,
        estimatedReadTime,
        mainConcepts = [],
        suggestedPrerequisites = []
    } = aiSummary;

    const getDifficultyColor = (level) => {
        const colors = {
            'Beginner': 'bg-green-100 text-green-800 border-green-300',
            'Intermediate': 'bg-yellow-100 text-yellow-800 border-yellow-300',
            'Advanced': 'bg-orange-100 text-orange-800 border-orange-300',
            'Expert': 'bg-red-100 text-red-800 border-red-300'
        };
        return colors[level] || 'bg-gray-100 text-gray-800 border-gray-300';
    };

    return (
        <div className="bg-gradient-to-r from-purple-50 to-blue-50 border border-purple-200 rounded-lg p-6 my-4 shadow-sm">
            {/* Header */}
            <div className="flex items-center gap-2 mb-4">
                <Brain className="w-6 h-6 text-purple-600" />
                <h3 className="text-lg font-bold text-gray-800">AI-Generated Insights</h3>
                <span className="ml-auto text-xs text-gray-500 bg-white px-2 py-1 rounded-full border">
                    Powered by AI
                </span>
            </div>

            {/* Summary */}
            <div className="mb-4">
                <div className="flex items-center gap-2 mb-2">
                    <BookOpen className="w-4 h-4 text-blue-600" />
                    <h4 className="font-semibold text-gray-700">Summary</h4>
                </div>
                <p className="text-gray-700 leading-relaxed pl-6">{summary}</p>
            </div>

            {/* Metadata Row */}
            <div className="flex flex-wrap gap-4 mb-4">
                {difficultyLevel && (
                    <div className="flex items-center gap-2">
                        <Award className="w-4 h-4 text-purple-600" />
                        <span className={`px-3 py-1 rounded-full text-sm font-medium border ${getDifficultyColor(difficultyLevel)}`}>
                            {difficultyLevel}
                        </span>
                    </div>
                )}
                {estimatedReadTime && (
                    <div className="flex items-center gap-2 bg-white px-3 py-1 rounded-full border border-gray-200">
                        <Clock className="w-4 h-4 text-gray-600" />
                        <span className="text-sm text-gray-700">{estimatedReadTime} min read</span>
                    </div>
                )}
            </div>

            {/* Key Topics */}
            {keyTopics.length > 0 && (
                <div className="mb-4">
                    <div className="flex items-center gap-2 mb-2">
                        <Target className="w-4 h-4 text-green-600" />
                        <h4 className="font-semibold text-gray-700">Key Topics</h4>
                    </div>
                    <div className="flex flex-wrap gap-2 pl-6">
                        {keyTopics.map((topic, index) => (
                            <span
                                key={index}
                                className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm border border-green-200"
                            >
                                {topic}
                            </span>
                        ))}
                    </div>
                </div>
            )}

            {/* Main Concepts */}
            {mainConcepts.length > 0 && (
                <div className="mb-4">
                    <div className="flex items-center gap-2 mb-2">
                        <Lightbulb className="w-4 h-4 text-yellow-600" />
                        <h4 className="font-semibold text-gray-700">Main Concepts</h4>
                    </div>
                    <ul className="list-disc list-inside pl-6 space-y-1">
                        {mainConcepts.map((concept, index) => (
                            <li key={index} className="text-gray-700 text-sm">
                                {concept}
                            </li>
                        ))}
                    </ul>
                </div>
            )}

            {/* Prerequisites */}
            {suggestedPrerequisites.length > 0 && (
                <div>
                    <div className="flex items-center gap-2 mb-2">
                        <BookOpen className="w-4 h-4 text-indigo-600" />
                        <h4 className="font-semibold text-gray-700">Suggested Prerequisites</h4>
                    </div>
                    <div className="flex flex-wrap gap-2 pl-6">
                        {suggestedPrerequisites.map((prereq, index) => (
                            <span
                                key={index}
                                className="px-3 py-1 bg-indigo-100 text-indigo-800 rounded-full text-sm border border-indigo-200"
                            >
                                {prereq}
                            </span>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

export default AISummaryCard;

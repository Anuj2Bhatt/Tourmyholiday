import React, { useState, useEffect } from 'react';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import axios from 'axios';
import './ArticleForm.css';

function slugify(text) {
  return text
    .toString()
    .toLowerCase()
    .replace(/\s+/g, '-')           // Replace spaces with -
    .replace(/[^a-z0-9-]/g, '')     // Remove all non-alphanumeric except -
    .replace(/-+/g, '-')            // Replace multiple - with single -
    .replace(/^-+|-+$/g, '');       // Trim - from start/end
}

const validateContent = (content, metaKeywords) => {
    const errors = [];
    const warnings = [];
    
    // Create a temporary div to parse HTML content
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = content;
    
    // 1. Word Count Check
    const textContent = tempDiv.textContent || tempDiv.innerText;
    const wordCount = textContent.trim().split(/\s+/).length;
    if (wordCount < 2500) {
        errors.push(`Content must be at least 2500 words. Current: ${wordCount} words`);
    }

    // 2. Link Validation
    const links = tempDiv.getElementsByTagName('a');
    const externalLinks = Array.from(links).filter(link => 
        link.href && !link.href.includes(window.location.hostname)
    );
    const internalLinks = Array.from(links).filter(link => 
        link.href && link.href.includes(window.location.hostname)
    );

    if (externalLinks.length < 1) {
        errors.push('Add at least 1 external link');
    }
    if (internalLinks.length < 1) {
        errors.push('Add at least 1 internal link');
    }

    // 3. Image Count Check
    const images = tempDiv.getElementsByTagName('img');
    if (images.length < 8) {
        errors.push(`Add at least 8 images. Current: ${images.length} images`);
    }

    // 4. Duplicate Content Check
    const paragraphs = tempDiv.getElementsByTagName('p');
    const paragraphTexts = Array.from(paragraphs).map(p => p.textContent.trim());
    const duplicateParagraphs = paragraphTexts.filter((text, index) => 
        paragraphTexts.indexOf(text) !== index
    );
    if (duplicateParagraphs.length > 0) {
        errors.push('Found duplicate paragraphs. Please make content unique');
    }

    // 5. SEO Best Practices Checks
    // Check for headings
    const headings = tempDiv.querySelectorAll('h1, h2, h3, h4, h5, h6');
    if (headings.length < 3) {
        warnings.push('Add more headings (H1-H6) for better structure');
    }

    // Check for alt text in images
    const imagesWithoutAlt = Array.from(images).filter(img => !img.alt);
    if (imagesWithoutAlt.length > 0) {
        warnings.push(`${imagesWithoutAlt.length} images are missing alt text`);
    }

    // Check for keyword density
    const keywords = Array.isArray(metaKeywords) ? metaKeywords : metaKeywords.split(',').map(k => k.trim());
    const keywordDensity = keywords.map(keyword => {
        const regex = new RegExp(keyword, 'gi');
        const count = (textContent.match(regex) || []).length;
        const density = (count / wordCount) * 100;
        return { keyword, density };
    });

    keywordDensity.forEach(({ keyword, density }) => {
        if (density < 0.5) {
            warnings.push(`Keyword "${keyword}" density is low (${density.toFixed(2)}%)`);
        } else if (density > 3) {
            warnings.push(`Keyword "${keyword}" density is too high (${density.toFixed(2)}%)`);
        }
    });

    return { errors, warnings, wordCount, externalLinks: externalLinks.length, 
             internalLinks: internalLinks.length, images: images.length };
};

// Add these new components at the top level
const OriginalContentTracker = ({ content, onScoreUpdate }) => {
    const [originalWords, setOriginalWords] = useState(0);
    const [pastedWords, setPastedWords] = useState(0);
    const [isTracking, setIsTracking] = useState(false);
    const [lastContent, setLastContent] = useState('');
    const [originalContent, setOriginalContent] = useState('');

    useEffect(() => {
        if (!content) return;

        // If content length increased significantly (likely a paste), mark as pasted
        if (content.length > lastContent.length + 50) {
            const newContent = content.slice(lastContent.length);
            setPastedWords(prev => prev + newContent.split(/\s+/).filter(Boolean).length);
        } else if (content !== lastContent) {
            // If content changed slightly, it's likely original typing
            const newContent = content.slice(lastContent.length);
            setOriginalWords(prev => prev + newContent.split(/\s+/).filter(Boolean).length);
            setOriginalContent(prev => prev + newContent);
        }

        setLastContent(content);

        // Update score based on original words
        const score = originalWords >= 100 ? 30 : 0;
        onScoreUpdate(score);
    }, [content]);

    return (
        <div className="original-content-tracker">
            <div className="tracker-header">
                <h5>Original Content Score</h5>
                <div className={`score-badge ${originalWords >= 100 ? 'complete' : 'incomplete'}`}>
                    {originalWords >= 100 ? '30/30 Points' : '0/30 Points'}
                </div>
            </div>
            <div className="word-counts">
                <div className="count-item">
                    <span className="count-label">Original Words:</span>
                    <span className={`count-value ${originalWords >= 100 ? 'complete' : ''}`}>
                        {originalWords}/100
                    </span>
                </div>
                <div className="count-item">
                    <span className="count-label">Pasted Words:</span>
                    <span className="count-value pasted">{pastedWords}</span>
                </div>
            </div>
            {originalWords < 100 && (
                <div className="progress-section">
                    <div className="progress-bar">
                        <div 
                            className="progress-fill"
                            style={{ width: `${Math.min(100, (originalWords / 100) * 100)}%` }}
                        />
                    </div>
                    <div className="progress-hint">
                        Write {100 - originalWords} more original words to earn 30 points
                    </div>
                </div>
            )}
            {originalWords >= 100 && (
                <div className="completion-message">
                    ✓ Great job! You've written enough original content
                </div>
            )}
        </div>
    );
};

// Update the ContentQualityTasks component
const ContentQualityTasks = ({ content, onTaskComplete }) => {
    const [tasks, setTasks] = useState([
        { id: 1, title: 'Original Content (100+ words)', points: 30, completed: false, current: 0, target: 100, type: 'original' },
        { id: 2, title: 'Word Count (2500+)', points: 20, completed: false, current: 0, target: 2500 },
        { id: 3, title: 'External Links (1+)', points: 10, completed: false, current: 0, target: 1 },
        { id: 4, title: 'Internal Links (1+)', points: 10, completed: false, current: 0, target: 1 },
        { id: 5, title: 'Images (8+)', points: 15, completed: false, current: 0, target: 8 },
        { id: 6, title: 'Headings Structure', points: 10, completed: false, current: 0, target: 3 },
        { id: 7, title: 'Meta Description', points: 10, completed: false, current: 0, target: 150 },
        { id: 8, title: 'Meta Title', points: 10, completed: false, current: 0, target: 60 },
        { id: 9, title: 'Image Alt Texts', points: 5, completed: false, current: 0, target: 8 }
    ]);

    const [originalContentScore, setOriginalContentScore] = useState(0);

    useEffect(() => {
        const tempDiv = document.createElement('div');
        tempDiv.innerHTML = content;
        const textContent = tempDiv.textContent || tempDiv.innerText;
        
        // Update task progress
        const updatedTasks = tasks.map(task => {
            let current = 0;
            switch(task.id) {
                case 1: // Original Content - handled separately
                    current = 0; // This will be updated by OriginalContentTracker
                    break;
                case 2: // Word Count
                    current = textContent.trim().split(/\s+/).length;
                    break;
                case 3: // External Links
                    current = Array.from(tempDiv.getElementsByTagName('a'))
                        .filter(link => link.href && !link.href.includes(window.location.hostname)).length;
                    break;
                case 4: // Internal Links
                    current = Array.from(tempDiv.getElementsByTagName('a'))
                        .filter(link => link.href && link.href.includes(window.location.hostname)).length;
                    break;
                case 5: // Images
                    current = tempDiv.getElementsByTagName('img').length;
                    break;
                case 6: // Headings
                    current = tempDiv.querySelectorAll('h1, h2, h3, h4, h5, h6').length;
                    break;
                case 7: // Meta Description
                    current = document.querySelector('meta[name="description"]')?.content.length || 0;
                    break;
                case 8: // Meta Title
                    current = document.querySelector('meta[name="title"]')?.content.length || 0;
                    break;
                case 9: // Image Alt Texts
                    current = Array.from(tempDiv.getElementsByTagName('img'))
                        .filter(img => img.alt && img.alt.trim() !== '').length;
                    break;
            }
            const completed = current >= task.target;
            return { ...task, current, completed };
        });
        
        // Update original content task with the score from OriginalContentTracker
        const originalContentTask = updatedTasks.find(task => task.type === 'original');
        if (originalContentTask) {
            originalContentTask.current = originalContentScore >= 30 ? 100 : 0;
            originalContentTask.completed = originalContentScore >= 30;
        }
        
        setTasks(updatedTasks);
        const totalPoints = updatedTasks.reduce((sum, task) => sum + (task.completed ? task.points : 0), 0);
        onTaskComplete(totalPoints);
    }, [content, originalContentScore]);

    return (
        <div className="content-quality-tasks">
            <h4>Content Quality Score: {tasks.reduce((sum, task) => sum + (task.completed ? task.points : 0), 0)}/100</h4>
            <OriginalContentTracker 
                content={content}
                onScoreUpdate={setOriginalContentScore}
            />
            <div className="tasks-grid">
                {tasks.map(task => (
                    <div key={task.id} className={`task-item ${task.completed ? 'completed' : ''}`}>
                        <div className="task-header">
                            <span className="task-title">{task.title}</span>
                            <span className="task-points">{task.points} points</span>
                        </div>
                        <div className="task-progress">
                            <div className="progress-bar">
                                <div 
                                    className="progress-fill"
                                    style={{ width: `${Math.min(100, (task.current / task.target) * 100)}%` }}
                                />
                            </div>
                            <span className="progress-text">
                                {task.current}/{task.target}
                            </span>
                        </div>
                        {task.completed && (
                            <span className="task-complete-icon">✓</span>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
};

// Update KeywordDensityChecker component
const KeywordDensityChecker = ({ content, onDensityCheck }) => {
    const [keywords, setKeywords] = useState([]);
    const [newKeyword, setNewKeyword] = useState('');
    const [error, setError] = useState('');
    const [keywordWarnings, setKeywordWarnings] = useState({});
    const [selectedKeywords, setSelectedKeywords] = useState(new Set());
    const [keywordDescription, setKeywordDescription] = useState({});

    const addKeyword = () => {
        if (!newKeyword.trim()) {
            setError('Please enter a keyword');
            return;
        }
        if (keywords.includes(newKeyword.trim())) {
            setError('Keyword already exists');
            return;
        }
        if (!keywordDescription[newKeyword.trim()] || keywordDescription[newKeyword.trim()].split(/\s+/).filter(Boolean).length < 100) {
            setError('Please write at least 100 words about how you will use this keyword');
            return;
        }

        const keyword = newKeyword.trim();
        setKeywords([...keywords, keyword]);
        setSelectedKeywords(prev => new Set([...prev, keyword]));
        setNewKeyword('');
        setError('');
        checkDensity(keyword);
    };

    const handleDescriptionChange = (keyword, description) => {
        setKeywordDescription(prev => ({
            ...prev,
            [keyword]: description
        }));
    };

    const removeKeyword = (keyword) => {
        setKeywords(keywords.filter(k => k !== keyword));
        setSelectedKeywords(prev => {
            const newSet = new Set(prev);
            newSet.delete(keyword);
            return newSet;
        });
        setKeywordWarnings(prev => {
            const newWarnings = { ...prev };
            delete newWarnings[keyword];
            return newWarnings;
        });
    };

    const toggleKeywordSelection = (keyword) => {
        setSelectedKeywords(prev => {
            const newSet = new Set(prev);
            if (newSet.has(keyword)) {
                newSet.delete(keyword);
            } else {
                newSet.add(keyword);
                checkDensity(keyword); // Check density when selecting
            }
            return newSet;
        });
    };

    const checkDensity = (keyword) => {
        const tempDiv = document.createElement('div');
        tempDiv.innerHTML = content;
        const textContent = tempDiv.textContent || tempDiv.innerText;
        const wordCount = textContent.trim().split(/\s+/).length;
        
        const regex = new RegExp(keyword, 'gi');
        const count = (textContent.match(regex) || []).length;
        const calculatedDensity = (count / wordCount) * 100;

        // Update warnings based on density
        if (calculatedDensity > 3) {
            setKeywordWarnings(prev => ({
                ...prev,
                [keyword]: {
                    type: 'high',
                    message: 'Keyword density is too high. This might be seen as keyword stuffing.',
                    suggestions: [
                        'Remove some instances of the keyword',
                        'Use synonyms or related terms',
                        'Make the content more natural',
                        'Focus on providing value rather than keyword repetition'
                    ],
                    density: calculatedDensity
                }
            }));
        } else if (calculatedDensity < 0.5) {
            setKeywordWarnings(prev => ({
                ...prev,
                [keyword]: {
                    type: 'low',
                    message: 'Keyword density is too low. Consider using it more naturally.',
                    suggestions: [
                        'Add the keyword in your headings',
                        'Include it in the first paragraph',
                        'Use it in image alt texts',
                        'Add it in meta description'
                    ],
                    density: calculatedDensity
                }
            }));
        } else {
            setKeywordWarnings(prev => ({
                ...prev,
                [keyword]: {
                    type: 'good',
                    message: 'Keyword density is good.',
                    suggestions: [
                        'Maintain this density level',
                        'Ensure natural usage throughout content',
                        'Keep keyword placement strategic'
                    ],
                    density: calculatedDensity
                }
            }));
        }
        
        onDensityCheck(keyword, calculatedDensity);
        return calculatedDensity;
    };

    const checkAllSelectedKeywords = () => {
        selectedKeywords.forEach(keyword => checkDensity(keyword));
    };

    const getKeywordSuggestions = (type, keyword) => {
        const baseSuggestions = {
            high: {
                overview: "Your keyword density is too high, which can be seen as keyword stuffing. This can negatively impact your SEO and user experience. Here's how to optimize it:",
                suggestions: [
                    {
                        title: "Content Distribution",
                        tips: [
                            "Distribute the keyword naturally across different sections",
                            "Use variations and synonyms instead of exact matches",
                            "Focus on providing value rather than keyword repetition",
                            "Consider using related terms and LSI keywords"
                        ]
                    },
                    {
                        title: "Content Structure",
                        tips: [
                            "Use the keyword in headings (H1, H2, H3) strategically",
                            "Include it in the first 100 words naturally",
                            "Place it in meta description and title",
                            "Use it in image alt texts where relevant"
                        ]
                    },
                    {
                        title: "Content Quality",
                        tips: [
                            "Ensure each keyword usage adds value to the reader",
                            "Maintain natural language flow",
                            "Focus on user intent and readability",
                            "Use the keyword in contextually relevant sections"
                        ]
                    }
                ]
            },
            low: {
                overview: "Your keyword density is too low. While you want to avoid keyword stuffing, you also need to ensure your content is optimized for search engines. Here's how to improve:",
                suggestions: [
                    {
                        title: "Strategic Placement",
                        tips: [
                            "Add the keyword in your main heading (H1)",
                            "Include it in the first paragraph",
                            "Use it in subheadings (H2, H3)",
                            "Place it in meta description and title"
                        ]
                    },
                    {
                        title: "Content Enhancement",
                        tips: [
                            "Create a dedicated section about the keyword topic",
                            "Add relevant examples and case studies",
                            "Include statistics or data related to the keyword",
                            "Use the keyword in image alt texts"
                        ]
                    },
                    {
                        title: "Content Structure",
                        tips: [
                            "Ensure the keyword appears in the first 100 words",
                            "Use it in the conclusion",
                            "Include it in internal linking anchor text",
                            "Add it to image captions where relevant"
                        ]
                    }
                ]
            },
            good: {
                overview: "Your keyword density is in the optimal range. Here's how to maintain and improve your content's SEO performance:",
                suggestions: [
                    {
                        title: "Content Optimization",
                        tips: [
                            "Maintain current keyword distribution",
                            "Ensure natural usage throughout content",
                            "Use variations and synonyms strategically",
                            "Keep keyword placement balanced"
                        ]
                    },
                    {
                        title: "Content Enhancement",
                        tips: [
                            "Add supporting keywords and LSI terms",
                            "Include relevant internal links",
                            "Enhance content with multimedia",
                            "Update content regularly with fresh information"
                        ]
                    },
                    {
                        title: "Technical SEO",
                        tips: [
                            "Optimize meta description and title",
                            "Ensure proper heading structure",
                            "Add schema markup where relevant",
                            "Improve page loading speed"
                        ]
                    }
                ]
            }
        };

        return baseSuggestions[type] || null;
    };

    return (
        <div className="keyword-density-checker">
            <div className="keyword-checker-header">
                <h5>Keyword Density Checker</h5>
                {selectedKeywords.size > 0 && (
                    <button 
                        onClick={checkAllSelectedKeywords}
                        className="check-all-btn"
                    >
                        Check Selected Keywords
                    </button>
                )}
            </div>
            
            <div className="keyword-input-section">
                <div className="keyword-input-group">
                    <input
                        type="text"
                        value={newKeyword}
                        onChange={(e) => setNewKeyword(e.target.value)}
                        placeholder="Add keyword to check"
                        className="keyword-input"
                        onKeyPress={(e) => e.key === 'Enter' && addKeyword()}
                    />
                    <button 
                        onClick={addKeyword}
                        className="add-keyword-btn"
                    >
                        Add Keyword
                    </button>
                </div>
                {newKeyword.trim() && !keywords.includes(newKeyword.trim()) && (
                    <div className="keyword-description-section">
                        <textarea
                            value={keywordDescription[newKeyword.trim()] || ''}
                            onChange={(e) => handleDescriptionChange(newKeyword.trim(), e.target.value)}
                            placeholder="Write at least 100 words about how you will use this keyword in your content..."
                            className="keyword-description-input"
                            rows={4}
                        />
                        <div className={`word-count ${keywordDescription[newKeyword.trim()]?.split(/\s+/).filter(Boolean).length < 100 ? 'warning' : ''}`}>
                            Words: {keywordDescription[newKeyword.trim()]?.split(/\s+/).filter(Boolean).length || 0}/100
                        </div>
                    </div>
                )}
                {error && <div className="density-error">{error}</div>}
            </div>
            
            <div className="keywords-list">
                {keywords.map(keyword => {
                    const warning = keywordWarnings[keyword];
                    const isSelected = selectedKeywords.has(keyword);
                    const suggestions = warning ? getKeywordSuggestions(warning.type, keyword) : null;
                    
                    return (
                        <div key={keyword} className={`keyword-item ${isSelected ? 'selected' : ''}`}>
                            <div className="keyword-header">
                                <div className="keyword-selection">
                                    <input
                                        type="checkbox"
                                        checked={isSelected}
                                        onChange={() => toggleKeywordSelection(keyword)}
                                        className="keyword-checkbox"
                                    />
                                    <span className="keyword-text">{keyword}</span>
                                </div>
                                <button 
                                    onClick={() => removeKeyword(keyword)}
                                    className="remove-keyword-btn"
                                >
                                    ×
                                </button>
                            </div>
                            
                            {isSelected && warning && suggestions && (
                                <div className="keyword-details">
                                    <div className={`density-result ${warning.type}`}>
                                        <span>Density: {warning.density.toFixed(2)}%</span>
                                        <span className="density-status">
                                            {warning.type === 'high' ? 'Too High' : 
                                             warning.type === 'low' ? 'Too Low' : 'Good'}
                                        </span>
                                    </div>
                                    <div className={`keyword-warning ${warning.type}`}>
                                        <div className="warning-overview">
                                            {warning.type === 'high' ? 
                                                "Your keyword density is too high, which can be seen as keyword stuffing. This can negatively impact your SEO and user experience." :
                                             warning.type === 'low' ?
                                                "Your keyword density is too low. While you want to avoid keyword stuffing, you also need to ensure your content is optimized for search engines." :
                                                "Your keyword density is in the optimal range. Keep maintaining this balance while focusing on natural content flow."}
                                        </div>
                                        <div className="improvement-suggestions">
                                            {warning.type === 'high' && (
                                                <>
                                                    <div className="suggestion-section">
                                                        <h6>Content Distribution</h6>
                                                        <ul>
                                                            <li>Distribute the keyword naturally across different sections</li>
                                                            <li>Use variations and synonyms instead of exact matches</li>
                                                            <li>Focus on providing value rather than keyword repetition</li>
                                                            <li>Consider using related terms and LSI keywords</li>
                                                        </ul>
                                                    </div>
                                                    <div className="suggestion-section">
                                                        <h6>Content Structure</h6>
                                                        <ul>
                                                            <li>Use the keyword in headings (H1, H2, H3) strategically</li>
                                                            <li>Include it in the first 100 words naturally</li>
                                                            <li>Place it in meta description and title</li>
                                                            <li>Use it in image alt texts where relevant</li>
                                                        </ul>
                                                    </div>
                                                </>
                                            )}
                                            {warning.type === 'low' && (
                                                <>
                                                    <div className="suggestion-section">
                                                        <h6>Strategic Placement</h6>
                                                        <ul>
                                                            <li>Add the keyword in your main heading (H1)</li>
                                                            <li>Include it in the first paragraph</li>
                                                            <li>Use it in subheadings (H2, H3)</li>
                                                            <li>Place it in meta description and title</li>
                                                        </ul>
                                                    </div>
                                                    <div className="suggestion-section">
                                                        <h6>Content Enhancement</h6>
                                                        <ul>
                                                            <li>Create a dedicated section about the keyword topic</li>
                                                            <li>Add relevant examples and case studies</li>
                                                            <li>Include statistics or data related to the keyword</li>
                                                            <li>Use the keyword in image alt texts</li>
                                                        </ul>
                                                    </div>
                                                </>
                                            )}
                                            {warning.type === 'good' && (
                                                <>
                                                    <div className="suggestion-section">
                                                        <h6>Content Optimization</h6>
                                                        <ul>
                                                            <li>Maintain current keyword distribution</li>
                                                            <li>Ensure natural usage throughout content</li>
                                                            <li>Use variations and synonyms strategically</li>
                                                            <li>Keep keyword placement balanced</li>
                                                        </ul>
                                                    </div>
                                                    <div className="suggestion-section">
                                                        <h6>Content Enhancement</h6>
                                                        <ul>
                                                            <li>Add supporting keywords and LSI terms</li>
                                                            <li>Include relevant internal links</li>
                                                            <li>Enhance content with multimedia</li>
                                                            <li>Update content regularly with fresh information</li>
                                                        </ul>
                                                    </div>
                                                </>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

// Update ContentStats component to improve SEO warnings
const ContentStats = ({ content, metaKeywords, onDensityCheck }) => {
    const [qualityScore, setQualityScore] = useState(0);
    
    if (!content || !metaKeywords) return null;
    
    const { wordCount, externalLinks, internalLinks, images, warnings } = validateContent(content, metaKeywords);

    const getSEOOverview = (warning) => {
        const seoInsights = {
            'Add more headings': {
                overview: "Proper heading structure is crucial for SEO. It helps search engines understand your content hierarchy and improves readability.",
                impact: "Good heading structure can improve your search rankings and user engagement.",
                suggestions: [
                    {
                        title: "Heading Structure Best Practices",
                        tips: [
                            "Use H1 for main title (only one per page)",
                            "Use H2 for main sections",
                            "Use H3 for subsections",
                            "Maintain logical hierarchy",
                            "Include keywords naturally in headings"
                        ]
                    },
                    {
                        title: "Content Organization",
                        tips: [
                            "Break content into digestible sections",
                            "Use descriptive heading text",
                            "Keep headings concise and clear",
                            "Ensure headings reflect content"
                        ]
                    }
                ]
            },
            'images are missing alt text': {
                overview: "Alt text is essential for both SEO and accessibility. It helps search engines understand your images and improves user experience.",
                impact: "Proper alt text can improve image search rankings and make your content more accessible.",
                suggestions: [
                    {
                        title: "Alt Text Best Practices",
                        tips: [
                            "Write descriptive, keyword-rich alt text",
                            "Keep alt text under 125 characters",
                            "Describe the image's content and function",
                            "Include relevant keywords naturally",
                            "Avoid keyword stuffing in alt text"
                        ]
                    },
                    {
                        title: "Image Optimization",
                        tips: [
                            "Use descriptive file names",
                            "Optimize image file size",
                            "Choose appropriate image formats",
                            "Ensure images are responsive"
                        ]
                    }
                ]
            },
            'Add more content': {
                overview: "Comprehensive content is key to SEO success. Longer content tends to rank better and provides more value to users.",
                impact: "In-depth content can improve your search rankings and user engagement.",
                suggestions: [
                    {
                        title: "Content Enhancement",
                        tips: [
                            "Expand on main points with examples",
                            "Include relevant statistics and data",
                            "Add expert quotes or testimonials",
                            "Create detailed case studies",
                            "Include practical tips and advice"
                        ]
                    },
                    {
                        title: "Content Structure",
                        tips: [
                            "Break content into clear sections",
                            "Use bullet points and lists",
                            "Include relevant images and media",
                            "Add internal and external links"
                        ]
                    }
                ]
            },
            'Add external link': {
                overview: "External links to authoritative sources can improve your content's credibility and SEO performance.",
                impact: "Quality external links can enhance your content's authority and trustworthiness.",
                suggestions: [
                    {
                        title: "External Linking Best Practices",
                        tips: [
                            "Link to authoritative sources",
                            "Reference industry experts",
                            "Cite research or studies",
                            "Link to relevant tools or resources",
                            "Ensure links are relevant and valuable"
                        ]
                    },
                    {
                        title: "Link Quality",
                        tips: [
                            "Check link relevance",
                            "Verify source authority",
                            "Ensure links are working",
                            "Use descriptive anchor text"
                        ]
                    }
                ]
            },
            'Add internal link': {
                overview: "Internal linking helps search engines understand your site structure and improves user navigation.",
                impact: "Strategic internal linking can improve your site's SEO and user experience.",
                suggestions: [
                    {
                        title: "Internal Linking Strategy",
                        tips: [
                            "Link to related articles",
                            "Reference product pages",
                            "Link to category pages",
                            "Connect to relevant content",
                            "Use descriptive anchor text"
                        ]
                    },
                    {
                        title: "Link Implementation",
                        tips: [
                            "Create a logical content hierarchy",
                            "Ensure links are contextual",
                            "Avoid broken links",
                            "Update internal links regularly"
                        ]
                    }
                ]
            },
            'Add more images': {
                overview: "Images enhance user engagement and can improve your content's SEO performance when properly optimized.",
                impact: "Well-optimized images can improve your content's visibility in image search and user engagement.",
                suggestions: [
                    {
                        title: "Image Optimization",
                        tips: [
                            "Include relevant, high-quality images",
                            "Add descriptive alt text",
                            "Optimize image file sizes",
                            "Use appropriate image formats",
                            "Include image captions"
                        ]
                    },
                    {
                        title: "Image Strategy",
                        tips: [
                            "Use a mix of image types",
                            "Include infographics",
                            "Add diagrams or charts",
                            "Use screenshots where relevant"
                        ]
                    }
                ]
            }
        };

        for (const [key, value] of Object.entries(seoInsights)) {
            if (warning.toLowerCase().includes(key.toLowerCase())) {
                return value;
            }
        }
        return null;
    };
    
    return (
        <div className="content-stats-container">
            <div className="content-stats">
                <ContentQualityTasks 
                    content={content}
                    onTaskComplete={setQualityScore}
                />
                
                <div className="stats-header">
                    <h4>Content Statistics</h4>
                    <div className="stats-summary">
                        <span className={`status-indicator ${qualityScore === 100 ? 'complete' : 'incomplete'}`}>
                            {qualityScore === 100 ? 'Perfect Score!' : `${qualityScore}/100 Points`}
                        </span>
                    </div>
                </div>
                
                <div className="stats-grid">
                    <div className="stat-item">
                        <div className="stat-label">Word Count</div>
                        <div className={`stat-value ${wordCount < 2500 ? 'warning' : 'success'}`}>
                            {wordCount}/2500
                            {wordCount < 2500 && <span className="stat-hint">Add more content</span>}
                        </div>
                    </div>
                    
                    <div className="stat-item">
                        <div className="stat-label">External Links</div>
                        <div className={`stat-value ${externalLinks < 1 ? 'warning' : 'success'}`}>
                            {externalLinks}/1
                            {externalLinks < 1 && <span className="stat-hint">Add external link</span>}
                        </div>
                    </div>
                    
                    <div className="stat-item">
                        <div className="stat-label">Internal Links</div>
                        <div className={`stat-value ${internalLinks < 1 ? 'warning' : 'success'}`}>
                            {internalLinks}/1
                            {internalLinks < 1 && <span className="stat-hint">Add internal link</span>}
                        </div>
                    </div>
                    
                    <div className="stat-item">
                        <div className="stat-label">Images</div>
                        <div className={`stat-value ${images < 8 ? 'warning' : 'success'}`}>
                            {images}/8
                            {images < 8 && <span className="stat-hint">Add more images</span>}
                        </div>
                    </div>
                </div>

                <KeywordDensityChecker 
                    content={content} 
                    onDensityCheck={onDensityCheck}
                />

                {warnings.length > 0 && (
                    <div className="seo-warnings">
                        <h5>SEO Warnings</h5>
                        <ul>
                            {warnings.map((warning, index) => {
                                const seoInsight = getSEOOverview(warning);
                                if (!seoInsight) return null; // Skip keyword-related warnings
                                
                                return (
                                    <li key={index} className="warning-item">
                                        <div className="warning-content">
                                            <span className="warning-icon">⚠️</span>
                                            <span className="warning-text">{warning}</span>
                                        </div>
                                        {seoInsight && (
                                            <div className="seo-insight">
                                                <div className="insight-overview">
                                                    <h6>Overview</h6>
                                                    <p>{seoInsight.overview}</p>
                                                </div>
                                                <div className="insight-impact">
                                                    <h6>Impact</h6>
                                                    <p>{seoInsight.impact}</p>
                                                </div>
                                                <div className="improvement-suggestions">
                                                    {seoInsight.suggestions.map((section, idx) => (
                                                        <div key={idx} className="suggestion-section">
                                                            <h6>{section.title}</h6>
                                                            <ul>
                                                                {section.tips.map((tip, tipIdx) => (
                                                                    <li key={tipIdx}>{tip}</li>
                                                                ))}
                                                            </ul>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        )}
                                    </li>
                                );
                            })}
                        </ul>
                    </div>
                )}
            </div>
        </div>
    );
};

const ArticleForm = ({ article, onSave, onCancel, loading }) => {
  const [formData, setFormData] = useState({
    title: '',
    slug: '',
    content: '',
    description: '',
    featuredImage: null,
    category_id: '',
    author: '',
    status: 'published',
    featured: false,
    meta_title: '',
    meta_description: '',
    meta_keywords: [],
    packages_id: null
  });
  const [imagePreview, setImagePreview] = useState(null);
  const [categories, setCategories] = useState([]);
  const [packages, setPackages] = useState([]);
  const [metaTitleCount, setMetaTitleCount] = useState(0);
  const [metaDescCount, setMetaDescCount] = useState(0);
  const [keywordInput, setKeywordInput] = useState('');

  useEffect(() => {
    (async () => {
      try {
        const res = await axios.get('http://localhost:5000/api/categories');
        setCategories(res.data);
        console.log('Categories:', res.data);
      } catch (err) {
        setCategories([]);
      }
      try {
        const res = await axios.get('http://localhost:5000/api/packages');
        setPackages(res.data);
        console.log('Packages:', res.data);
      } catch (err) {
        setPackages([]);
      }
    })();
  }, []);

  useEffect(() => {
    if (article) {
      setFormData({
        title: article.title || '',
        slug: article.slug || '',
        content: article.content || '',
        description: article.description || '',
        featuredImage: null,
        category_id: article.category_id || '',
        author: article.author || '',
        status: article.status || 'published',
        featured: article.featured || false,
        meta_title: article.meta_title || '',
        meta_description: article.meta_description || '',
        meta_keywords: Array.isArray(article.meta_keywords)
          ? article.meta_keywords
          : (article.meta_keywords ? article.meta_keywords.split(',').map(k => k.trim()) : []),
        packages_id: article.packages_id || null
      });
      setMetaTitleCount((article.meta_title || '').length);
      setMetaDescCount((article.meta_description || '').length);
      if (article.featuredImage) setImagePreview(article.featuredImage);
    }
  }, [article]);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    if (name === 'meta_title') setMetaTitleCount(value.length);
    if (name === 'meta_description') setMetaDescCount(value.length);
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : (name === 'packages_id' ? (value === '' ? null : Number(value)) : value)
    }));
    if (name === 'title') {
      setFormData(prev => ({ ...prev, slug: slugify(value) }));
    }
  };

  const handleSlugChange = (e) => {
    setFormData(prev => ({ ...prev, slug: slugify(e.target.value) }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData(prev => ({ ...prev, featuredImage: file }));
      const reader = new FileReader();
      reader.onloadend = () => setImagePreview(reader.result);
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveImage = () => {
    setFormData(prev => ({ ...prev, featuredImage: null }));
    setImagePreview(null);
  };

  const handleEditorChange = (content) => {
    setFormData(prev => ({ ...prev, content }));
  };

  // Keywords as tags
  const handleKeywordInput = (e) => {
    setKeywordInput(e.target.value);
  };
  const handleKeywordKeyDown = (e) => {
    if ((e.key === 'Enter' || e.key === ',') && keywordInput.trim()) {
      e.preventDefault();
      if (!formData.meta_keywords.includes(keywordInput.trim())) {
        setFormData(prev => ({ ...prev, meta_keywords: [...prev.meta_keywords, keywordInput.trim()] }));
      }
      setKeywordInput('');
    }
  };
  const removeKeyword = (kw) => {
    setFormData(prev => ({ ...prev, meta_keywords: prev.meta_keywords.filter(k => k !== kw) }));
  };

  const handleDensityCheck = (keyword, density) => {
    // Remove the alert - we now handle warnings in the UI
    console.log(`Keyword "${keyword}" density: ${density.toFixed(2)}%`);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Existing meta field validations
    if (formData.meta_title.length < 50 || formData.meta_title.length > 60) {
        alert('Meta title must be 50-60 characters.');
        return;
    }
    if (formData.meta_description.length < 150 || formData.meta_description.length > 160) {
        alert('Meta description must be 150-160 characters.');
        return;
    }

    // New content validation with metaKeywords
    const { errors, warnings, wordCount, externalLinks, internalLinks, images } = validateContent(formData.content, formData.meta_keywords);
    
    if (errors.length > 0) {
        alert('Please fix the following errors:\n\n' + errors.join('\n'));
        return;
    }

    // Create FormData and log each field
    const formDataToSend = new FormData();
    
    // Log the original formData
    console.log('Original formData:', formData);
    console.log('Content Stats:', {
        wordCount,
        externalLinks,
        internalLinks,
        images
    });
    
    // Rest of your existing handleSubmit code...
    Object.keys(formData).forEach(key => {
        let value = formData[key];
        
        if (key === 'featuredImage' && formData[key]) {
            formDataToSend.append('featured_image', formData[key]);
            console.log('Adding featured_image:', formData[key]);
        } else if (key === 'meta_keywords') {
            const keywords = formData.meta_keywords.join(',');
            formDataToSend.append('meta_keywords', keywords);
            console.log('Adding meta_keywords:', keywords);
        } else if (value !== null && value !== undefined) {
            formDataToSend.append(key, value);
            console.log(`Adding ${key}:`, value);
        }
    });

    onSave(formDataToSend);
  };

  return (
    <div className="article-form-container">
      <h2>{article ? 'Edit Article' : 'Add New Article'}</h2>
      <form onSubmit={handleSubmit} className="article-form">
        <div className="form-section">
          <h3 className="section-title">Basic Information</h3>
          <div className="form-group">
            <label>Title:</label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleInputChange}
              required
              className="styled-input"
            />
          </div>
          <div className="form-group">
            <label>Slug:</label>
            <input
              type="text"
              name="slug"
              value={formData.slug}
              onChange={handleSlugChange}
              required
              className="styled-input"
            />
            <small>Auto-generated from title, you can edit.</small>
          </div>
          <div className="form-group">
            <label>Category:</label>
            <select
              name="category_id"
              value={formData.category_id}
              onChange={handleInputChange}
              className="article-form-category-dropdown"
              required
            >
              <option value="">-- Select a category --</option>
              {categories.map(cat => (
                <option key={cat.id} value={cat.id}>{cat.name || cat.title || cat.category_name}</option>
              ))}
            </select>
          </div>
          <div className="form-group">
            <label>Author:</label>
            <input
              type="text"
              name="author"
              value={formData.author}
              onChange={handleInputChange}
              required
              className="styled-input"
            />
          </div>
          <div className="form-group">
            <label>Package (Optional):</label>
            <select
              name="packages_id"
              value={formData.packages_id === null ? '' : formData.packages_id}
              onChange={handleInputChange}
              className="article-form-package-dropdown"
            >
              <option value="">-- Select a package (optional) --</option>
              {packages.map(pkg => (
                <option key={pkg.id} value={pkg.id}>{pkg.name || pkg.title || pkg.package_name}</option>
              ))}
            </select>
          </div>
        </div>
        <div className="form-section">
          <h3 className="section-title">Featured Image</h3>
          <div className="form-group featured-image-group">
            <div className="featured-image-upload-container">
              <input
                type="file"
                id="featured-image-upload"
                name="featuredImage"
                onChange={handleImageChange}
                accept="image/*"
                className="featured-image-input"
              />
              <label htmlFor="featured-image-upload" className="featured-image-upload-button">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                  <polyline points="17 8 12 3 7 8"/>
                  <line x1="12" y1="3" x2="12" y2="15"/>
                  </svg>
                <span>Upload Featured Image</span>
              </label>
              <p className="upload-hint">Recommended size: 1200x800 pixels</p>
            </div>
            {imagePreview && (
              <div className="featured-image-preview-container">
                <img 
                  src={imagePreview} 
                  alt="Featured Preview" 
                  className="featured-image-preview"
                />
                <button 
                  type="button" 
                  onClick={handleRemoveImage}
                  className="remove-image-button"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="18" y1="6" x2="6" y2="18"></line>
                    <line x1="6" y1="6" x2="18" y2="18"></line>
                  </svg>
                  Remove Image
                </button>
              </div>
            )}
          </div>
        </div>
        <div className="form-section">
          <h3 className="section-title">Article Content</h3>
          <div className="form-group">
            <label>Content:</label>
            <ReactQuill
              value={formData.content}
              onChange={handleEditorChange}
              modules={{
                toolbar: [
                  [{ 'header': [1, 2, false] }],
                  ['bold', 'italic', 'underline','strike', 'blockquote'],
                  [{ 'list': 'ordered'}, { 'list': 'bullet' }],
                  ['link', 'image'],
                  [{ 'align': [] }],
                  [{ 'color': [] }, { 'background': [] }],
                  ['clean']
                ]
              }}
              formats={['header', 'bold', 'italic', 'underline', 'strike', 'blockquote', 'list', 'bullet', 'link', 'image', 'align', 'color', 'background']}
            />
            {formData.content && formData.meta_keywords && (
                <ContentStats 
                    content={formData.content} 
                    metaKeywords={formData.meta_keywords}
                    onDensityCheck={handleDensityCheck}
                />
            )}
          </div>
          <div className="form-group">
            <label>Description:</label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              className="styled-textarea"
            />
          </div>
        </div>
        <div className="form-section">
          <h3 className="section-title">Additional Settings</h3>
          <div className="form-group">
            <label>Status:</label>
            <select
              name="status"
              value={formData.status}
              onChange={handleInputChange}
              className="styled-select"
            >
              <option value="published">Published</option>
              <option value="draft">Draft</option>
            </select>
          </div>
          <div className="form-group checkbox">
            <label>
              <input
                type="checkbox"
                name="featured"
                checked={formData.featured}
                onChange={handleInputChange}
              />
              Featured Article
            </label>
          </div>
        </div>
        <div className="form-section">
          <h3 className="section-title">SEO Meta Information</h3>
          <div className="form-group">
            <label>Meta Title:</label>
            <input
              type="text"
              name="meta_title"
              value={formData.meta_title}
              onChange={handleInputChange}
              className="styled-input"
              maxLength={60}
              minLength={50}
              required
            />
            <small>{metaTitleCount} / 60 characters</small>
          </div>
          <div className="form-group">
            <label>Meta Description:</label>
            <textarea
              name="meta_description"
              value={formData.meta_description}
              onChange={handleInputChange}
              className="styled-textarea"
              maxLength={160}
              minLength={150}
              required
            />
            <small>{metaDescCount} / 160 characters</small>
          </div>
          <div className="form-group">
            <label>Meta Keywords (comma or Enter to add):</label>
            <div className="keywords-input-container">
              <input
                type="text"
                value={keywordInput}
                onChange={handleKeywordInput}
                onKeyDown={handleKeywordKeyDown}
                className="styled-input"
                placeholder="Type a keyword and press Enter or comma"
              />
              <div className="keywords-container">
                {formData.meta_keywords.map((kw, idx) => (
                  <span className="keyword-tag" key={idx}>
                    {kw}
                    <button type="button" onClick={() => removeKeyword(kw)}>&times;</button>
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
        <div className="form-buttons">
          <button type="submit" className="submit-btn" disabled={loading}>
            {loading ? 'Saving...' : article ? 'Update Article' : 'Add Article'}
          </button>
          <button type="button" onClick={onCancel} className="cancel-btn" disabled={loading}>
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
};

export default ArticleForm; 
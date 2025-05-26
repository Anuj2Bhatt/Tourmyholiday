const validateTerritoryHistory = (req, res, next) => {
    const { title, content, territory_id, slug } = req.body;

    // Check required fields
    if (!title) {
        return res.status(400).json({
            success: false,
            error: 'Title is required'
        });
    }

    if (!content) {
        return res.status(400).json({
            success: false,
            error: 'Content is required'
        });
    }

    if (!territory_id) {
        return res.status(400).json({
            success: false,
            error: 'Territory ID is required'
        });
    }

    if (!slug) {
        return res.status(400).json({
            success: false,
            error: 'Slug is required'
        });
    }

    // Validate title length
    if (title.length > 255) {
        return res.status(400).json({
            success: false,
            error: 'Title must be less than 255 characters'
        });
    }

    // Validate slug format
    const slugRegex = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
    if (!slugRegex.test(slug)) {
        return res.status(400).json({
            success: false,
            error: 'Invalid slug format. Use only lowercase letters, numbers, and hyphens'
        });
    }

    // Validate status if provided
    if (req.body.status && !['Public', 'Draft'].includes(req.body.status)) {
        return res.status(400).json({
            success: false,
            error: 'Status must be either Public or Draft'
        });
    }

    next();
};

module.exports = {
    validateTerritoryHistory
}; 
/**
 * Standard API Response Utility
 */

exports.success = (res, data, message = "Success", status = 200) => {
  return res.status(status).json({
    success: true,
    message,
    data
  });
};

exports.error = (res, message = "Internal Server Error", status = 500, debug = null) => {
  const response = {
    success: false,
    message
  };
  if (debug) response.debug = debug;
  
  return res.status(status).json(response);
};

exports.notFound = (res, message = "Resource not found", debug = null) => {
  return exports.error(res, message, 404, debug);
};

exports.badRequest = (res, message = "Bad Request") => {
  return exports.error(res, message, 400);
};

exports.unauthorized = (res, message = "Unauthorized") => {
  return exports.error(res, message, 401);
};

// Transform snake_case DB row to camelCase for frontend compatibility
exports.toCamel = (row) => {
  if (!row) return row;
  return {
    _id: row.id,
    id: row.id,
    name: row.name,
    slug: row.slug,
    tagline: row.tagline,
    description: row.description,
    whatsNew: row.whats_new,
    category: row.category,
    tags: row.tags || [],
    icon: row.icon,
    screenshots: row.screenshots || [],
    apkFile: row.apk_file,
    version: row.version,
    size: row.size,
    platform: row.platform,
    minOSVersion: row.min_os_version,
    rating: parseFloat(row.rating) || 0,
    downloads: row.downloads || 0,
    featured: row.featured,
    published: row.published,
    abTestingEnabled: row.ab_testing_enabled,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    versionHistory: row.version_history || [],
  };
};

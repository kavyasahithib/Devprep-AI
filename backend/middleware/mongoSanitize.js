/**
 * Custom Mongo Sanitization Middleware for Express 5.x
 */
const mongoSanitize = (options = {}) => {
  const { replaceWith = '_', allowDots = false } = options;

  return (req, res, next) => {
    const sanitize = (obj) => {
      if (obj instanceof Object) {
        for (const key in obj) {
          let newKey = key;
          const isMalicious = key.startsWith('$') || (!allowDots && key.includes('.'));
          
          if (isMalicious) {
            const value = obj[key];
            delete obj[key];
            if (replaceWith) {
              newKey = key.replace(/[$|.]/g, replaceWith);
              obj[newKey] = value;
            }
          }
          
          // Recursive sanitize
          if (obj[newKey] instanceof Object) {
            sanitize(obj[newKey]);
          }
        }
      }
      return obj;
    };

    if (req.body) sanitize(req.body);
    if (req.params) sanitize(req.params);
    
    try {
      if (req.query) sanitize(req.query);
    } catch (e) {
      // Ignore read-only query in Express 5
    }

    next();
  };
};

module.exports = mongoSanitize;

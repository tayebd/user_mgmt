// Custom serializer to handle circular references and special objects in tests
module.exports = {
  test: (val) => {
    return (
      val &&
      typeof val === 'object' &&
      !Array.isArray(val) &&
      (val instanceof Set || 
       val instanceof Map || 
       Object.getOwnPropertyNames(val).some(prop => 
         typeof val[prop] === 'object' && val[prop] !== null
       ))
    );
  },
  
  serialize: (val, config, indentation, depth, refs, printer) => {
    // Handle Sets and Maps
    if (val instanceof Set) {
      return `Set(${printer(Array.from(val))})`;
    }
    if (val instanceof Map) {
      return `Map(${printer(Array.from(val.entries()))})`;
    }

    // Handle Date objects
    if (val instanceof Date) {
      return `Date(${val.toISOString()})`;
    }

    // Handle objects with potential circular references
    const seen = new WeakSet();
    const safeObj = JSON.parse(JSON.stringify(val, (key, value) => {
      if (value !== null && typeof value === 'object') {
        if (seen.has(value)) {
          return '[Circular Reference]';
        }
        seen.add(value);
      }
      return value;
    }));

    return printer(safeObj);
  },
};

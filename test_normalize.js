function normalizeUppercase(payload, excludeFields = ['email']) {
  if (payload === null || payload === undefined) return payload;
  
  if (typeof payload === 'string') {
    return payload.toUpperCase();
  }
  
  if (Array.isArray(payload)) {
    return payload.map(item => normalizeUppercase(item, excludeFields));
  }
  
  // Need to handle Date, RegExp, etc.
  if (payload instanceof Date) return payload;
  
  if (typeof payload === 'object') {
    const normalized = {};
    for (const key in payload) {
      if (Object.prototype.hasOwnProperty.call(payload, key)) {
          const lowerKey = key.toLowerCase();
          if (excludeFields.includes(lowerKey)) {
            normalized[key] = payload[key];
          } else if (typeof payload[key] === 'string') {
            normalized[key] = payload[key].toUpperCase();
          } else if (typeof payload[key] === 'object' && payload[key] !== null) {
            normalized[key] = normalizeUppercase(payload[key], excludeFields);
          } else {
            normalized[key] = payload[key];
          }
      }
    }
    return normalized;
  }
  
  return payload;
}

const p = {
  name: "hello",
  created_at: new Date(),
  items: [{ part_name: "oil filter", price: 50 }],
  email: "test@email.com",
  settings: {
     theme: "dark"
  }
}
console.log(normalizeUppercase(p));

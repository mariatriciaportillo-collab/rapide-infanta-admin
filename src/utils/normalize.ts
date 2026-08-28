export function normalizeUppercase(
  payload: any, 
  excludeFields: string[] = ['email', 'password', 'notes', 'remarks', 'description', 'warranty_terms', 'status', 'id', 'created_at', 'updated_at', 'avatar_url', 'image_url', 'token', 'key', 'avatar', 'file', 'image', 'photo']
): any {
  if (payload === null || payload === undefined) return payload;
  
  if (typeof payload === 'string') {
    return payload.toUpperCase();
  }
  
  if (Array.isArray(payload)) {
    return payload.map(item => normalizeUppercase(item, excludeFields));
  }
  
  // Only traverse plain objects
  if (typeof payload === 'object') {
    // If it's a Date or other non-plain object, return as is
    if (Object.prototype.toString.call(payload) !== '[object Object]') {
      return payload;
    }
    
    const normalized: any = {};
    for (const key in payload) {
      if (Object.prototype.hasOwnProperty.call(payload, key)) {
        const lowerKey = key.toLowerCase();
        
        // Skip exclusions based on exact matches or substrings for sensitive fields
        if (
          excludeFields.includes(lowerKey) || 
          lowerKey.includes('email') || 
          lowerKey.includes('password') || 
          lowerKey.includes('url') ||
          lowerKey.includes('token') ||
          lowerKey.includes('id') ||
          lowerKey.includes('date') ||
          lowerKey.includes('time') ||
          lowerKey.includes('notes') ||
          lowerKey.includes('remarks') ||
          lowerKey.includes('description')
        ) {
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

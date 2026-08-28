import { createBrowserClient } from '@supabase/ssr'
import { normalizeUppercase } from '../normalize'

export function createClient() {
  const client = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
  
  // Proxy the 'from' method to intercept database queries and apply automatic uppercase normalization
  const originalFrom = client.from.bind(client);
  client.from = (table: string): any => {
    const queryBuilder: any = originalFrom(table);
    
    const originalInsert = queryBuilder.insert.bind(queryBuilder);
    queryBuilder.insert = (payload: any, options?: any) => {
      return originalInsert(normalizeUppercase(payload), options);
    };
    
    const originalUpdate = queryBuilder.update.bind(queryBuilder);
    queryBuilder.update = (payload: any, options?: any) => {
      return originalUpdate(normalizeUppercase(payload), options);
    };
    
    const originalUpsert = queryBuilder.upsert.bind(queryBuilder);
    queryBuilder.upsert = (payload: any, options?: any) => {
      return originalUpsert(normalizeUppercase(payload), options);
    };
    
    return queryBuilder;
  };
  
  return client;
}

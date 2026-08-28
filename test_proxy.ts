import { createBrowserClient } from '@supabase/ssr'
// Just checking if we can compile a TS file with this proxy logic

export function createClient() {
  const client = createBrowserClient(
    'https://xyz.supabase.co',
    'apikey'
  )
  
  const originalFrom = client.from.bind(client);
  client.from = (table: string): any => {
    const queryBuilder: any = originalFrom(table);
    
    const originalInsert = queryBuilder.insert.bind(queryBuilder);
    queryBuilder.insert = (payload: any, options?: any) => {
      return originalInsert(payload, options);
    };
    
    return queryBuilder;
  };
  
  return client;
}

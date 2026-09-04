import { useState, useEffect } from 'react';
import { createClient } from '@/utils/supabase/client';

export function usePartLaborAutomation(items: any[], setItems: (items: any[]) => void) {
  const [partLaborRules, setPartLaborRules] = useState<any[]>([]);
  const [dismissedLaborIds, setDismissedLaborIds] = useState<string[]>([]);
  const supabase = createClient();

  useEffect(() => {
    async function fetchRules() {
      const { data } = await supabase
        .from('part_labor_rules')
        .select(`*, labor:labor_id(*), triggers:part_labor_rule_triggers(part_id)`)
        .eq('active', true);
      if (data) setPartLaborRules(data);
    }
    fetchRules();
  }, []);

  useEffect(() => {
    if (partLaborRules.length === 0) return;
    if (!items || items.length === 0) return;

    // Only standalone parts
    const standaloneParts = items.filter(i => (i.item_type === 'PART' || i.item_type === 'part') && !i.package_id && i.part_id);
    const presentPartIds = new Set(standaloneParts.map(i => i.part_id));

    const comboRules = partLaborRules.filter(r => r.rule_type === 'COMBINATION');
    const singleRules = partLaborRules.filter(r => r.rule_type === 'SINGLE');

    const matchedLaborIds = new Set<string>();
    const consumedPartIds = new Set<string>();

    // 1. Combo Rules (Priority)
    for (const rule of comboRules) {
      if (!rule.triggers || rule.triggers.length === 0) continue;
      const allPresent = rule.triggers.every((t: any) => presentPartIds.has(t.part_id));
      if (allPresent) {
        matchedLaborIds.add(rule.labor_id);
        rule.triggers.forEach((t: any) => consumedPartIds.add(t.part_id));
      }
    }

    // 2. Single Rules
    for (const rule of singleRules) {
      if (!rule.triggers || rule.triggers.length === 0) continue;
      const partId = rule.triggers[0].part_id;
      if (presentPartIds.has(partId) && !consumedPartIds.has(partId)) {
        matchedLaborIds.add(rule.labor_id);
      }
    }

    const existingLaborIds = new Set(items.filter(i => (i.item_type === 'LABOR' || i.item_type === 'labor') && i.labor_service_id).map(i => i.labor_service_id));
    
    let newItems = [...items];
    let changed = false;

    // Remove auto-suggested labor that no longer has matching parts
    for (let i = newItems.length - 1; i >= 0; i--) {
      const item = newItems[i];
      if ((item.item_type === 'LABOR' || item.item_type === 'labor') && item.is_auto_suggested) {
        if (!matchedLaborIds.has(item.labor_service_id)) {
          newItems.splice(i, 1);
          changed = true;
        }
      }
    }

    // Add new matched labor
    for (const lid of Array.from(matchedLaborIds)) {
      if (!existingLaborIds.has(lid) && !dismissedLaborIds.includes(lid)) {
        const rule = partLaborRules.find(r => r.labor_id === lid);
        if (rule && rule.labor) {
          newItems.push({
            id: crypto.randomUUID(),
            item_type: 'LABOR', 
            labor_service_id: rule.labor.id,
            description: rule.labor.name,
            quantity: 1,
            unit_price: '', 
            is_section_header: false,
            is_auto_suggested: true
          });
          changed = true;
        }
      }
    }

    if (changed) {
      setItems(newItems);
    }
  }, [items, partLaborRules, dismissedLaborIds]);

  const handleDismissLabor = (id: string) => {
    const item = items.find(i => i.id === id);
    if (item && (item.item_type === 'LABOR' || item.item_type === 'labor') && item.is_auto_suggested && item.labor_service_id) {
      setDismissedLaborIds(prev => [...prev, item.labor_service_id]);
    }
  };

  return { handleDismissLabor };
}

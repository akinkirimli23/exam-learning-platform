import { describe, expect, it } from 'vitest';
import { buoyancyConceptMap, flattenConceptNodes } from '../shared/buoyancy-concepts';

describe('Kaldırma kuvveti kavram haritası', () => {
  const nodes = flattenConceptNodes(buoyancyConceptMap);
  const ids = new Set(nodes.map((node) => node.id));

  it('istenen altı ana dalı aynı sırada içerir', () => {
    expect(buoyancyConceptMap.title).toBe('Kaldırma Kuvveti');
    expect(buoyancyConceptMap.children.map((node) => node.title)).toEqual([
      'Temel Prensipler',
      'Matematiksel Model',
      'Sıvı İçindeki Denge Durumları',
      'Taşırma Kapları ve Ağırlaşma',
      'Önemli Kavramlar',
      'Günlük Hayat Uygulamaları',
    ]);
  });

  it('40 benzersiz ve yeniden kullanılabilir düğümün zorunlu alanlarını doğrular', () => {
    expect(nodes).toHaveLength(40);
    expect(ids.size).toBe(nodes.length);
    for (const node of nodes) {
      expect(node.id).not.toBe('');
      expect(node.title).not.toBe('');
      expect(node.shortDescription).not.toBe('');
      expect(node.detailedDescription).not.toBe('');
      expect(Array.isArray(node.relatedConceptIds)).toBe(true);
      expect(Array.isArray(node.children)).toBe(true);
    }
  });

  it('ilişki hedeflerini ve temel denge alt başlıklarını tutarlı tutar', () => {
    for (const node of nodes) {
      expect(node.relatedConceptIds).not.toContain(node.id);
      for (const relatedId of node.relatedConceptIds) expect(ids.has(relatedId)).toBe(true);
    }

    const equilibrium = nodes.find((node) => node.id === 'equilibrium-states');
    expect(equilibrium?.children.map((node) => node.title)).toEqual([
      'Yüzme Durumu',
      'Askıda Kalma Durumu',
      'Batma Durumu',
    ]);
    expect(nodes.find((node) => node.id === 'buoyancy-equation')?.formula).toBe(
      'Fᵦ = V_batan · d_sıvı · g',
    );
  });
});

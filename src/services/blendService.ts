import { Spice } from '../types/spice';
import { BlendSpice, BlendSummary } from '../types/blend';

export class BlendService {
  /**
   * Analyze a blend and generate flavor profile, uses, and similar blends
   */
  analyzeBlend(blendSpices: BlendSpice[]): BlendSummary {
    const flavorProfile = this.generateFlavorProfile(blendSpices);
    const commonUses = this.generateCommonUses(blendSpices);
    const similarBlends = this.findSimilarBlends(blendSpices);

    return {
      flavorProfile,
      commonUses,
      similarBlends
    };
  }

  private generateFlavorProfile(blendSpices: BlendSpice[]): string[] {
    const flavorMap = new Map<string, number>();

    // Weight flavors by percentage
    blendSpices.forEach(({ spice, percentage }) => {
      spice.flavorProfile.forEach(flavor => {
        const currentWeight = flavorMap.get(flavor) || 0;
        flavorMap.set(flavor, currentWeight + (percentage / 100));
      });
    });

    // Sort by weight and return top flavors
    return Array.from(flavorMap.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([flavor]) => flavor);
  }

  private generateCommonUses(blendSpices: BlendSpice[]): string[] {
    const useMap = new Map<string, number>();

    // Weight uses by percentage
    blendSpices.forEach(({ spice, percentage }) => {
      // Get common uses from spice data
      const spiceUses = this.getSpiceUses(spice.name);
      spiceUses.forEach(use => {
        const currentWeight = useMap.get(use) || 0;
        useMap.set(use, currentWeight + (percentage / 100));
      });
    });

    // Sort by weight and return top uses
    return Array.from(useMap.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 6)
      .map(([use]) => use);
  }

  private getSpiceUses(spiceName: string): string[] {
    // Map spice names to their common uses
    const spiceUsesMap: Record<string, string[]> = {
      'Cinnamon': ['Baking', 'Desserts', 'Hot beverages', 'Middle Eastern cuisine'],
      'Black Pepper': ['Seasoning', 'Marinades', 'Soups', 'Meat dishes'],
      'Turmeric': ['Curries', 'Rice dishes', 'Golden milk', 'Anti-inflammatory drinks'],
      'Cumin': ['Mexican cuisine', 'Indian dishes', 'Chili', 'Meat rubs'],
      'Paprika': ['Garnish', 'Hungarian dishes', 'Deviled eggs', 'Roasted vegetables'],
      'Cardamom': ['Indian sweets', 'Chai tea', 'Scandinavian baking', 'Rice dishes'],
      'Cloves': ['Baking', 'Mulled wine', 'Ham glazes', 'Indian cuisine'],
      'Nutmeg': ['Baking', 'Eggnog', 'Bechamel sauce', 'Indian cuisine'],
      'Ginger': ['Asian cuisine', 'Baking', 'Tea', 'Marinades'],
      'Star Anise': ['Chinese five-spice', 'Pho', 'Mulled wine', 'Braised meats'],
      'Coriander': ['Indian cuisine', 'Pickling', 'Bread', 'Meat dishes'],
      'Fennel Seeds': ['Italian sausage', 'Bread', 'Fish dishes', 'Digestive tea'],
      'Saffron': ['Paella', 'Risotto', 'Persian rice', 'French bouillabaisse'],
      'Allspice': ['Jerk seasoning', 'Pickling', 'Desserts', 'Middle Eastern cuisine'],
      'Bay Leaves': ['Soups', 'Stews', 'Braising', 'Rice dishes'],
      'Chili Powder': ['Mexican cuisine', 'Chili', 'Meat rubs', 'Roasted vegetables'],
      'Mustard Seeds': ['Pickling', 'Indian tempering', 'Mustard sauce', 'Salad dressings'],
      'Oregano': ['Pizza', 'Italian cuisine', 'Greek dishes', 'Marinades'],
      'Thyme': ['Roasted meats', 'Vegetables', 'Soups', 'French cuisine'],
      'Rosemary': ['Roasted potatoes', 'Lamb', 'Focaccia', 'Grilled vegetables'],
      'Basil': ['Italian cuisine', 'Pesto', 'Caprese salad', 'Thai dishes'],
      'Sage': ['Poultry seasoning', 'Pasta', 'Sauces', 'Thanksgiving dishes'],
      'Vanilla': ['Baking', 'Desserts', 'Ice cream', 'Perfumes'],
      'Cayenne Pepper': ['Hot sauce', 'Cajun cuisine', 'Spice blends', 'Medicine'],
      'Garlic Powder': ['Seasoning blends', 'Meat rubs', 'Roasted vegetables', 'Pasta'],
      'Parsley': ['Garnish', 'Salads', 'Soups', 'Mediterranean cuisine'],
      'Cilantro': ['Mexican cuisine', 'Asian dishes', 'Salsa', 'Garnish'],
      'Onion Powder': ['Seasoning blends', 'Meat rubs', 'Soups', 'Roasted vegetables'],
      'Dill': ['Pickles', 'Fish dishes', 'Potato salad', 'Scandinavian cuisine'],
      'Red Pepper Flakes': ['Pizza', 'Pasta', 'Italian cuisine', 'Spice blends'],
      'Thai Chili': ['Thai cuisine', 'Asian stir-fries', 'Hot sauces', 'Curry pastes'],
      'Asafoetida': ['Indian cuisine', 'Lentil dishes', 'Vegetarian cooking', 'Digestive aid'],
      'Long Pepper': ['Ancient Roman cuisine', 'Indian pickles', 'Spice blends', 'Medicinal preparations'],
      'Grains of Paradise': ['Medieval European cuisine', 'Gin flavoring', 'Spice blends', 'Meat seasoning'],
      'Pink Peppercorns': ['French cuisine', 'Seafood', 'Salads', 'Desserts']
    };

    return spiceUsesMap[spiceName] || ['Seasoning', 'Cooking', 'Flavoring'];
  }

  private findSimilarBlends(blendSpices: BlendSpice[]): string[] {
    const spiceNames = blendSpices.map(bs => bs.spice.name.toLowerCase());
    const similarBlends: string[] = [];

    // Check for common spice blend patterns
    if (spiceNames.includes('cumin') && spiceNames.includes('chili powder') && spiceNames.includes('paprika')) {
      similarBlends.push('Taco Seasoning');
    }

    if (spiceNames.includes('cinnamon') && spiceNames.includes('nutmeg') && spiceNames.includes('cloves')) {
      similarBlends.push('Pumpkin Pie Spice');
    }

    if (spiceNames.includes('coriander') && spiceNames.includes('cumin') && spiceNames.includes('turmeric')) {
      similarBlends.push('Curry Powder');
    }

    if (spiceNames.includes('oregano') && spiceNames.includes('basil') && spiceNames.includes('thyme')) {
      similarBlends.push('Italian Seasoning');
    }

    if (spiceNames.includes('thyme') && spiceNames.includes('rosemary') && spiceNames.includes('sage')) {
      similarBlends.push('Herbs de Provence');
    }

    if (spiceNames.includes('paprika') && spiceNames.includes('garlic powder') && spiceNames.includes('cayenne pepper')) {
      similarBlends.push('Cajun Seasoning');
    }

    if (spiceNames.includes('star anise') && spiceNames.includes('cinnamon') && spiceNames.includes('cloves')) {
      similarBlends.push('Chinese Five-Spice');
    }

    if (spiceNames.includes('cardamom') && spiceNames.includes('cinnamon') && spiceNames.includes('ginger')) {
      similarBlends.push('Chai Spice');
    }

    if (spiceNames.includes('allspice') && spiceNames.includes('thyme') && spiceNames.includes('cayenne pepper')) {
      similarBlends.push('Jerk Seasoning');
    }

    if (spiceNames.includes('fennel seeds') && spiceNames.includes('black pepper') && spiceNames.includes('garlic powder')) {
      similarBlends.push('Italian Sausage Seasoning');
    }

    // If no specific matches, suggest generic blends based on dominant flavors
    if (similarBlends.length === 0) {
      const hasSweet = spiceNames.some(name => ['cinnamon', 'vanilla', 'nutmeg', 'cardamom'].includes(name));
      const hasHot = spiceNames.some(name => ['cayenne pepper', 'chili powder', 'black pepper'].includes(name));
      const hasEarthy = spiceNames.some(name => ['cumin', 'turmeric', 'coriander'].includes(name));

      if (hasSweet) similarBlends.push('Baking Spice Blend');
      if (hasHot) similarBlends.push('Hot Spice Blend');
      if (hasEarthy) similarBlends.push('Savory Spice Blend');
    }

    return similarBlends.slice(0, 3);
  }

  /**
   * Generate a suggested name for the blend
   */
  generateBlendName(blendSpices: BlendSpice[]): string {
    const dominantSpice = blendSpices.reduce((prev, current) => 
      prev.percentage > current.percentage ? prev : current
    );

    const spiceCount = blendSpices.length;
    const names = [
      `${dominantSpice.spice.name} ${spiceCount}-Spice Blend`,
      `Custom ${spiceCount}-Spice Mix`,
      `${dominantSpice.spice.name} Fusion`,
      `Artisan ${spiceCount}-Spice Blend`
    ];

    return names[Math.floor(Math.random() * names.length)];
  }
}

export const blendService = new BlendService();
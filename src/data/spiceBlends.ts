export interface SpiceBlendInfo {
  id: string;
  name: string;
  description: string;
  ingredients: string[];
  flavorProfile: string[];
  commonUses: string[];
  origin: string;
  color: string;
}

export const spiceBlends: SpiceBlendInfo[] = [
  {
    id: 'taco-seasoning',
    name: 'Taco Seasoning',
    description: 'A zesty Mexican-inspired blend that brings bold, savory flavors to ground meat and vegetables. This versatile seasoning combines earthy cumin with smoky paprika and fiery chili powder to create the perfect balance of heat and flavor.',
    ingredients: ['Cumin', 'Chili Powder', 'Paprika', 'Garlic Powder', 'Oregano'],
    flavorProfile: ['Spicy', 'Earthy', 'Smoky', 'Savory'],
    commonUses: ['Tacos', 'Ground beef', 'Mexican cuisine', 'Seasoning meat'],
    origin: 'Mexican-American',
    color: '#B22222'
  },
  {
    id: 'pumpkin-pie-spice',
    name: 'Pumpkin Pie Spice',
    description: 'A warm, aromatic blend that captures the essence of autumn in every pinch. This classic American spice mix combines sweet cinnamon with the warming notes of nutmeg and the intense aromatics of cloves to create the perfect seasoning for fall desserts.',
    ingredients: ['Cinnamon', 'Nutmeg', 'Cloves', 'Ginger', 'Allspice'],
    flavorProfile: ['Sweet', 'Warm', 'Aromatic', 'Spicy'],
    commonUses: ['Pumpkin pie', 'Fall desserts', 'Baking', 'Coffee drinks'],
    origin: 'American',
    color: '#D2691E'
  },
  {
    id: 'curry-powder',
    name: 'Curry Powder',
    description: 'A complex Indian-inspired blend that delivers layers of flavor from earthy and warm to bright and aromatic. This golden mixture combines the earthiness of turmeric and cumin with the citrusy notes of coriander to create a versatile seasoning for countless dishes.',
    ingredients: ['Turmeric', 'Cumin', 'Coriander', 'Ginger', 'Mustard Seeds'],
    flavorProfile: ['Earthy', 'Warm', 'Citrusy', 'Complex'],
    commonUses: ['Indian cuisine', 'Curries', 'Rice dishes', 'Vegetable dishes'],
    origin: 'Indian',
    color: '#DAA520'
  },
  {
    id: 'italian-seasoning',
    name: 'Italian Seasoning',
    description: 'A Mediterranean herb blend that brings the flavors of Italy to your kitchen. This aromatic mixture combines the piney notes of oregano with the sweet freshness of basil and the earthy complexity of thyme to create the perfect seasoning for Italian dishes.',
    ingredients: ['Oregano', 'Basil', 'Thyme', 'Rosemary', 'Garlic Powder'],
    flavorProfile: ['Herbal', 'Aromatic', 'Earthy', 'Fresh'],
    commonUses: ['Pizza', 'Pasta', 'Italian cuisine', 'Marinades'],
    origin: 'Italian',
    color: '#228B22'
  },
  {
    id: 'herbs-de-provence',
    name: 'Herbs de Provence',
    description: 'A fragrant French herb blend that captures the essence of the Mediterranean countryside. This sophisticated mixture combines the piney aromatics of rosemary with the earthy notes of thyme and the savory complexity of sage to create an elegant seasoning for refined dishes.',
    ingredients: ['Thyme', 'Rosemary', 'Sage', 'Oregano', 'Bay Leaves'],
    flavorProfile: ['Herbal', 'Piney', 'Earthy', 'Aromatic'],
    commonUses: ['French cuisine', 'Roasted meats', 'Vegetables', 'Stews'],
    origin: 'French',
    color: '#6B8E23'
  },
  {
    id: 'cajun-seasoning',
    name: 'Cajun Seasoning',
    description: 'A bold Louisiana blend that brings the heat and soul of Creole cooking to any dish. This fiery mixture combines smoky paprika with pungent garlic and fiery cayenne to create a seasoning that delivers both flavor and heat in perfect harmony.',
    ingredients: ['Paprika', 'Garlic Powder', 'Cayenne Pepper', 'Oregano', 'Thyme'],
    flavorProfile: ['Spicy', 'Smoky', 'Savory', 'Bold'],
    commonUses: ['Cajun cuisine', 'Blackened fish', 'Gumbo', 'Jambalaya'],
    origin: 'Louisiana Creole',
    color: '#DC143C'
  },
  {
    id: 'chinese-five-spice',
    name: 'Chinese Five-Spice',
    description: 'An ancient Chinese blend that represents the five elements in traditional Chinese philosophy. This aromatic mixture combines the licorice notes of star anise with warm cinnamon and pungent cloves to create a complex seasoning that balances sweet, sour, bitter, pungent, and salty flavors.',
    ingredients: ['Star Anise', 'Cinnamon', 'Cloves', 'Fennel Seeds', 'Black Pepper'],
    flavorProfile: ['Licorice', 'Sweet', 'Aromatic', 'Complex'],
    commonUses: ['Chinese cuisine', 'Roasted meats', 'Stir-fries', 'Braised dishes'],
    origin: 'Chinese',
    color: '#8B4513'
  },
  {
    id: 'chai-spice',
    name: 'Chai Spice',
    description: 'A warming Indian blend that creates the perfect aromatic tea experience. This fragrant mixture combines the citrusy sweetness of cardamom with warming cinnamon and zesty ginger to create a comforting spice blend that soothes the soul.',
    ingredients: ['Cardamom', 'Cinnamon', 'Ginger', 'Cloves', 'Black Pepper'],
    flavorProfile: ['Sweet', 'Warming', 'Aromatic', 'Citrusy'],
    commonUses: ['Chai tea', 'Indian sweets', 'Milk-based drinks', 'Desserts'],
    origin: 'Indian',
    color: '#D2B48C'
  },
  {
    id: 'jerk-seasoning',
    name: 'Jerk Seasoning',
    description: 'A fiery Caribbean blend that brings the bold flavors of Jamaica to your table. This intense mixture combines the complex warmth of allspice with aromatic thyme and fiery cayenne to create a seasoning that delivers both heat and incredible depth of flavor.',
    ingredients: ['Allspice', 'Thyme', 'Cayenne Pepper', 'Garlic Powder', 'Ginger'],
    flavorProfile: ['Spicy', 'Aromatic', 'Complex', 'Hot'],
    commonUses: ['Jerk chicken', 'Caribbean cuisine', 'Grilled meats', 'Marinades'],
    origin: 'Jamaican',
    color: '#FF4500'
  },
  {
    id: 'italian-sausage-seasoning',
    name: 'Italian Sausage Seasoning',
    description: 'A robust Italian blend designed specifically for meat preparations. This savory mixture combines the licorice notes of fennel seeds with sharp black pepper and pungent garlic to create the authentic flavor profile of traditional Italian sausages.',
    ingredients: ['Fennel Seeds', 'Black Pepper', 'Garlic Powder', 'Paprika', 'Oregano'],
    flavorProfile: ['Savory', 'Licorice', 'Pungent', 'Aromatic'],
    commonUses: ['Italian sausage', 'Meat dishes', 'Pasta sauces', 'Pizza toppings'],
    origin: 'Italian',
    color: '#8B4513'
  },
  {
    id: 'za-atar',
    name: 'Za\'atar',
    description: 'A tangy Middle Eastern blend that combines the tartness of sumac with aromatic herbs and nutty sesame seeds. This versatile seasoning brings bright, herbaceous flavors with a distinctive lemony tang that enhances everything from flatbreads to roasted vegetables.',
    ingredients: ['Sumac', 'Thyme', 'Oregano', 'Sesame Seeds', 'Salt'],
    flavorProfile: ['Tangy', 'Herbal', 'Nutty', 'Lemony'],
    commonUses: ['Flatbread', 'Olive oil dips', 'Roasted vegetables', 'Middle Eastern cuisine'],
    origin: 'Middle Eastern',
    color: '#8FBC8F'
  },
  {
    id: 'garam-masala',
    name: 'Garam Masala',
    description: 'A warming Indian spice blend that translates to "hot spice mixture." This aromatic combination balances sweet cinnamon and cardamom with warming cloves and peppery notes, creating a complex seasoning that adds depth and warmth to curries and rice dishes.',
    ingredients: ['Cinnamon', 'Cardamom', 'Cloves', 'Black Pepper', 'Cumin'],
    flavorProfile: ['Warm', 'Sweet', 'Aromatic', 'Complex'],
    commonUses: ['Indian curries', 'Rice dishes', 'Meat marinades', 'Vegetable dishes'],
    origin: 'Indian',
    color: '#CD853F'
  },
  {
    id: 'berbere',
    name: 'Berbere',
    description: 'A fiery Ethiopian spice blend that forms the backbone of the country\'s cuisine. This complex mixture combines hot chilies with warm spices and aromatic herbs, creating a seasoning that delivers both heat and incredible depth of flavor with hints of sweetness and earthiness.',
    ingredients: ['Chili Powder', 'Paprika', 'Ginger', 'Cardamom', 'Coriander'],
    flavorProfile: ['Spicy', 'Complex', 'Earthy', 'Warm'],
    commonUses: ['Ethiopian cuisine', 'Stews', 'Meat dishes', 'Lentil dishes'],
    origin: 'Ethiopian',
    color: '#B22222'
  },
  {
    id: 'ras-el-hanout',
    name: 'Ras el Hanout',
    description: 'A luxurious Moroccan spice blend whose name means "head of the shop" - traditionally the spice merchant\'s finest mixture. This complex blend can contain dozens of spices, creating a warm, aromatic seasoning with floral notes, gentle heat, and exotic complexity perfect for tagines and couscous.',
    ingredients: ['Cinnamon', 'Cumin', 'Coriander', 'Ginger', 'Turmeric'],
    flavorProfile: ['Complex', 'Warm', 'Floral', 'Exotic'],
    commonUses: ['Moroccan cuisine', 'Tagines', 'Couscous', 'Lamb dishes'],
    origin: 'Moroccan',
    color: '#DAA520'
  },
  {
    id: 'dukkah',
    name: 'Dukkah',
    description: 'An Egyptian blend that combines toasted nuts, seeds, and spices into a crunchy, flavorful mixture. This textural seasoning offers nutty richness from hazelnuts, aromatic herbs, and warm spices, traditionally served with bread and olive oil or used as a coating for meats and vegetables.',
    ingredients: ['Coriander', 'Cumin', 'Sesame Seeds', 'Hazelnuts', 'Thyme'],
    flavorProfile: ['Nutty', 'Crunchy', 'Aromatic', 'Earthy'],
    commonUses: ['Bread dipping', 'Meat coating', 'Salad topping', 'Egyptian cuisine'],
    origin: 'Egyptian',
    color: '#D2B48C'
  }
];
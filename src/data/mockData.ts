
export interface Category {
  id: string;
  name: string;
  slug: string;
  icon: string;
}

export interface Product {
  id: string;
  title: string;
  description: string;
  price: number;
  categoryId: string;
  images: ProductImage[];
}

export interface ProductImage {
  id: string;
  url: string;
  isPrimary: boolean;
  productId: string;
}

export const mockCategories: Category[] = [
  {
    id: '1',
    name: 'Arranjos de Flores',
    slug: 'arranjos-de-flores',
    icon: 'gift'
  },
  {
    id: '2',
    name: 'Buquês',
    slug: 'buques',
    icon: 'flower'
  },
  {
    id: '3',
    name: 'Cestas',
    slug: 'cestas',
    icon: 'box'
  },
  {
    id: '4',
    name: 'Itens Adicionais',
    slug: 'itens-adicionais',
    icon: 'plus'
  }
];

export const mockProducts: Product[] = [
  {
    id: '1',
    title: 'Arranjo de Mesa Premium',
    description: 'Um lindo arranjo de flores mistas para decorar sua mesa.',
    price: 249.90,
    categoryId: '1',
    images: [
      {
        id: '101',
        url: '/lovable-uploads/e0475b43-30bb-4d7a-b2a3-6198f675addd.png',
        isPrimary: true,
        productId: '1'
      }
    ]
  },
  {
    id: '2',
    title: 'Buquê de Rosas Vermelhas',
    description: 'Um clássico buquê de rosas vermelhas para momentos especiais.',
    price: 189.90,
    categoryId: '2',
    images: [
      {
        id: '102',
        url: '/lovable-uploads/a9fd40bd-e476-4171-8a91-254bb0f4e228.png',
        isPrimary: true,
        productId: '2'
      }
    ]
  },
  {
    id: '3',
    title: 'Cesta de Flores do Campo',
    description: 'Uma cesta rústica com flores do campo, perfeita para presentear.',
    price: 159.90,
    categoryId: '3',
    images: [
      {
        id: '103',
        url: '/lovable-uploads/5601c633-2070-4943-a396-a4850439ed29.png',
        isPrimary: true,
        productId: '3'
      }
    ]
  },
  {
    id: '4',
    title: 'Vaso de Cerâmica',
    description: 'Um elegante vaso de cerâmica para compor com seus arranjos.',
    price: 89.90,
    categoryId: '4',
    images: [
      {
        id: '104',
        url: '/placeholder.svg',
        isPrimary: true,
        productId: '4'
      }
    ]
  }
];

export const getProductsByCategory = (categoryId: string): Product[] => {
  return mockProducts.filter(product => product.categoryId === categoryId);
};

export const getProductById = (productId: string): Product | undefined => {
  return mockProducts.find(product => product.id === productId);
};

export const getCategoryBySlug = (slug: string): Category | undefined => {
  return mockCategories.find(category => category.slug === slug);
};

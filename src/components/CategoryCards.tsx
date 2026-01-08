import { useState, useEffect } from 'react';
import { ArrowRight, Loader2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { propertiesAPI } from '@/lib/api';

interface Category {
  id: number;
  count: string;
  title: string;
  image: string;
  link: string;
}

const categoryImages = [
  'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=600&h=400&fit=crop&q=80',
  'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=600&h=400&fit=crop&q=80',
  'https://images.unsplash.com/photo-1613490493576-7fde63acd811?w=600&h=400&fit=crop&q=80',
  'https://images.unsplash.com/photo-1600566753086-00f18fb6b3ea?w=600&h=400&fit=crop&q=80',
];

export function CategoryCards() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadCategories();
  }, []);

  const loadCategories = async () => {
    try {
      setIsLoading(true);
      const properties = await propertiesAPI.getAll({ active: true });
      
      // Count properties by different categories
      const totalCount = properties.length;
      const saleCount = properties.filter((p: any) => p.transactionType === 'Sale').length;
      const rentCount = properties.filter((p: any) => p.transactionType === 'Rent').length;
      const featuredCount = properties.filter((p: any) => p.isFeatured).length;

      setCategories([
        {
          id: 1,
          count: totalCount.toString(),
          title: 'All Properties',
          image: categoryImages[0],
          link: '/properties',
        },
        {
          id: 2,
          count: saleCount.toString(),
          title: 'Properties for Sale',
          image: categoryImages[1],
          link: '/properties?intent=buy',
        },
        {
          id: 3,
          count: rentCount.toString(),
          title: 'Properties for Rent',
          image: categoryImages[2],
          link: '/properties?intent=rent',
        },
        {
          id: 4,
          count: featuredCount.toString(),
          title: 'Featured Properties',
          image: categoryImages[3],
          link: '/properties?featured=true',
        },
      ]);
    } catch (error) {
      console.error('Error loading categories:', error);
      setCategories([
        { id: 1, count: '0', title: 'All Properties', image: categoryImages[0], link: '/properties' },
        { id: 2, count: '0', title: 'Properties for Sale', image: categoryImages[1], link: '/properties?intent=buy' },
        { id: 3, count: '0', title: 'Properties for Rent', image: categoryImages[2], link: '/properties?intent=rent' },
        { id: 4, count: '0', title: 'Featured Properties', image: categoryImages[3], link: '/properties?featured=true' },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <section className="py-10 md:py-14 bg-background">
        <div className="container flex justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </section>
    );
  }

  return (
    <section className="py-10 md:py-14 bg-background">
      <div className="container">
        <div className="mb-section-header">
          <h2 className="mb-section-title">We've got properties for everyone</h2>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {categories.map((category) => (
            <Link
              key={category.id}
              to={category.link}
              className="mb-category-card aspect-[4/3]"
            >
              <img src={category.image} alt={category.title} />
              <div className="mb-category-overlay" />
              <div className="mb-category-content">
                <p className="text-2xl md:text-3xl font-bold">{category.count}</p>
                <p className="text-sm md:text-base font-medium">{category.title}</p>
                <span className="inline-flex items-center gap-1 text-sm mt-2 opacity-80 group-hover:opacity-100">
                  Explore <ArrowRight className="h-4 w-4" />
                </span>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}

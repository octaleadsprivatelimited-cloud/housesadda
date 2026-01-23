// Frontend-only Supabase API - replaces backend API calls
import { supabase, uploadFile } from './supabase';

// Properties API using Supabase
export const supabasePropertiesAPI = {
  // Get all properties with filters
  getAll: async (params?: {
    search?: string;
    type?: string;
    city?: string;
    area?: string;
    featured?: boolean;
    active?: boolean;
    transactionType?: string;
  }) => {
    try {
      let query = supabase
        .from('properties')
        .select(`
          *,
          locations:location_id (id, name, city),
          property_types:type_id (id, name),
          property_images (id, image_url, display_order)
        `);

      // Apply filters
      if (params?.search) {
        query = query.or(`title.ilike.%${params.search}%,description.ilike.%${params.search}%`);
      }

      if (params?.transactionType && params.transactionType !== 'All') {
        query = query.eq('transaction_type', params.transactionType);
      }

      if (params?.featured !== undefined) {
        query = query.eq('is_featured', params.featured);
      }

      if (params?.active !== undefined) {
        query = query.eq('is_active', params.active);
      }

      // Filter by type and location (need to get IDs first)
      if (params?.type) {
        const { data: typeData } = await supabase
          .from('property_types')
          .select('id')
          .eq('name', params.type)
          .single();
        if (typeData) {
          query = query.eq('type_id', typeData.id);
        }
      }

      if (params?.area || params?.city) {
        let locationQuery = supabase.from('locations').select('id');
        if (params.area) locationQuery = locationQuery.eq('name', params.area);
        if (params.city) locationQuery = locationQuery.eq('city', params.city);
        const { data: locationData } = await locationQuery.single();
        if (locationData) {
          query = query.eq('location_id', locationData.id);
        }
      }

      query = query.order('created_at', { ascending: false });

      const { data: properties, error } = await query;

      if (error) throw error;

      // Format properties
      return (properties || []).map((prop: any) => {
        const images = (prop.property_images || [])
          .sort((a: any, b: any) => a.display_order - b.display_order)
          .map((img: any) => img.image_url);

        return {
          id: prop.id,
          title: prop.title,
          type: prop.property_types?.name || '',
          area: prop.locations?.name || '',
          city: prop.city || 'Hyderabad',
          price: prop.price,
          bedrooms: prop.bedrooms,
          bathrooms: prop.bathrooms,
          sqft: prop.sqft,
          description: prop.description,
          transactionType: prop.transaction_type || 'Sale',
          image: images[0] || null,
          images: images,
          isFeatured: prop.is_featured === true || prop.is_featured === 1,
          isActive: prop.is_active === true || prop.is_active === 1,
          amenities: typeof prop.amenities === 'string' ? JSON.parse(prop.amenities) : (prop.amenities || []),
          highlights: typeof prop.highlights === 'string' ? JSON.parse(prop.highlights) : (prop.highlights || []),
          brochureUrl: prop.brochure_url,
          mapUrl: prop.map_url,
          videoUrl: prop.video_url,
          createdAt: prop.created_at
        };
      });
    } catch (error: any) {
      console.error('Get properties error:', error);
      throw new Error(error.message || 'Failed to fetch properties');
    }
  },

  // Get single property
  getById: async (id: string) => {
    try {
      const { data: prop, error } = await supabase
        .from('properties')
        .select(`
          *,
          locations:location_id (id, name, city),
          property_types:type_id (id, name),
          property_images (id, image_url, display_order)
        `)
        .eq('id', id)
        .single();

      if (error) throw error;
      if (!prop) throw new Error('Property not found');

      const images = (prop.property_images || [])
        .sort((a: any, b: any) => a.display_order - b.display_order)
        .map((img: any) => img.image_url);

      return {
        id: prop.id,
        title: prop.title,
        type: prop.property_types?.name || '',
        area: prop.locations?.name || '',
        city: prop.city || 'Hyderabad',
        price: prop.price,
        bedrooms: prop.bedrooms,
        bathrooms: prop.bathrooms,
        sqft: prop.sqft,
        description: prop.description,
        transactionType: prop.transaction_type || 'Sale',
        image: images[0] || null,
        images: images,
        isFeatured: prop.is_featured === true || prop.is_featured === 1,
        isActive: prop.is_active === true || prop.is_active === 1,
        amenities: typeof prop.amenities === 'string' ? JSON.parse(prop.amenities) : (prop.amenities || []),
        highlights: typeof prop.highlights === 'string' ? JSON.parse(prop.highlights) : (prop.highlights || []),
        brochureUrl: prop.brochure_url,
        mapUrl: prop.map_url,
        videoUrl: prop.video_url,
        createdAt: prop.created_at
      };
    } catch (error: any) {
      console.error('Get property error:', error);
      throw new Error(error.message || 'Failed to fetch property');
    }
  },

  // Create property
  create: async (property: any) => {
    try {
      // Get location and type IDs
      const { data: location } = await supabase
        .from('locations')
        .select('id')
        .eq('name', property.area)
        .eq('city', property.city || 'Hyderabad')
        .single();

      const { data: typeRow } = await supabase
        .from('property_types')
        .select('id')
        .eq('name', property.type)
        .single();

      if (!location || !typeRow) {
        throw new Error('Invalid location or type');
      }

      // Insert property
      const { data: newProperty, error: propError } = await supabase
        .from('properties')
        .insert({
          title: property.title,
          location_id: location.id,
          type_id: typeRow.id,
          city: property.city || 'Hyderabad',
          price: parseFloat(property.price) || 0,
          bedrooms: parseInt(property.bedrooms) || 0,
          bathrooms: parseInt(property.bathrooms) || 0,
          sqft: parseInt(property.sqft) || 0,
          description: property.description || '',
          transaction_type: property.transactionType || 'Sale',
          is_featured: property.isFeatured ? true : false,
          is_active: property.isActive !== false,
          amenities: property.amenities || [],
          highlights: property.highlights || [],
          brochure_url: property.brochureUrl || '',
          map_url: property.mapUrl || '',
          video_url: property.videoUrl || ''
        })
        .select()
        .single();

      if (propError) throw propError;

      // Insert images
      if (property.images && property.images.length > 0) {
        const imageRecords = property.images.map((url: string, index: number) => ({
          property_id: newProperty.id,
          image_url: url,
          display_order: index
        }));

        const { error: imagesError } = await supabase
          .from('property_images')
          .insert(imageRecords);

        if (imagesError) {
          console.error('Error inserting images:', imagesError);
        }
      }

      return { success: true, id: newProperty.id };
    } catch (error: any) {
      console.error('Create property error:', error);
      throw new Error(error.message || 'Failed to create property');
    }
  },

  // Update property
  update: async (id: string, property: any) => {
    try {
      // Get location and type IDs
      const { data: location } = await supabase
        .from('locations')
        .select('id')
        .eq('name', property.area)
        .eq('city', property.city || 'Hyderabad')
        .single();

      const { data: typeRow } = await supabase
        .from('property_types')
        .select('id')
        .eq('name', property.type)
        .single();

      if (!location || !typeRow) {
        throw new Error('Invalid location or type');
      }

      // Update property
      const { error: updateError } = await supabase
        .from('properties')
        .update({
          title: property.title,
          location_id: location.id,
          type_id: typeRow.id,
          city: property.city || 'Hyderabad',
          price: parseFloat(property.price) || 0,
          bedrooms: parseInt(property.bedrooms) || 0,
          bathrooms: parseInt(property.bathrooms) || 0,
          sqft: parseInt(property.sqft) || 0,
          description: property.description || '',
          transaction_type: property.transactionType || 'Sale',
          is_featured: property.isFeatured ? true : false,
          is_active: property.isActive !== false,
          amenities: property.amenities || [],
          highlights: property.highlights || [],
          brochure_url: property.brochureUrl || '',
          map_url: property.mapUrl || '',
          video_url: property.videoUrl || ''
        })
        .eq('id', id);

      if (updateError) throw updateError;

      // Update images
      if (property.images !== undefined) {
        // Delete existing images
        await supabase
          .from('property_images')
          .delete()
          .eq('property_id', id);

        // Insert new images
        if (property.images.length > 0) {
          const imageRecords = property.images.map((url: string, index: number) => ({
            property_id: id,
            image_url: url,
            display_order: index
          }));

          const { error: imagesError } = await supabase
            .from('property_images')
            .insert(imageRecords);

          if (imagesError) {
            console.error('Error updating images:', imagesError);
          }
        }
      }

      return { success: true };
    } catch (error: any) {
      console.error('Update property error:', error);
      throw new Error(error.message || 'Failed to update property');
    }
  },

  // Delete property
  delete: async (id: string) => {
    try {
      // Delete images first (CASCADE should handle this, but being explicit)
      await supabase
        .from('property_images')
        .delete()
        .eq('property_id', id);

      // Delete property
      const { error } = await supabase
        .from('properties')
        .delete()
        .eq('id', id);

      if (error) throw error;
      return { success: true };
    } catch (error: any) {
      console.error('Delete property error:', error);
      throw new Error(error.message || 'Failed to delete property');
    }
  },

  // Toggle featured
  toggleFeatured: async (id: string, isFeatured: boolean) => {
    try {
      const { error } = await supabase
        .from('properties')
        .update({ is_featured: isFeatured })
        .eq('id', id);

      if (error) throw error;
      return { success: true };
    } catch (error: any) {
      console.error('Toggle featured error:', error);
      throw new Error(error.message || 'Failed to update property');
    }
  },

  // Toggle active
  toggleActive: async (id: string, isActive: boolean) => {
    try {
      const { error } = await supabase
        .from('properties')
        .update({ is_active: isActive })
        .eq('id', id);

      if (error) throw error;
      return { success: true };
    } catch (error: any) {
      console.error('Toggle active error:', error);
      throw new Error(error.message || 'Failed to update property');
    }
  }
};

// Locations API using Supabase
export const supabaseLocationsAPI = {
  getAll: async (city?: string) => {
    try {
      let query = supabase.from('locations').select('*');
      if (city) {
        query = query.eq('city', city);
      }
      query = query.order('city', { ascending: true }).order('name', { ascending: true });

      const { data, error } = await query;
      if (error) throw error;
      return data || [];
    } catch (error: any) {
      console.error('Get locations error:', error);
      throw new Error(error.message || 'Failed to fetch locations');
    }
  },

  create: async (location: { name: string; city: string }) => {
    try {
      const { data, error } = await supabase
        .from('locations')
        .insert({ name: location.name, city: location.city })
        .select()
        .single();

      if (error) throw error;
      return { success: true, id: data.id };
    } catch (error: any) {
      console.error('Create location error:', error);
      throw new Error(error.message || 'Failed to create location');
    }
  },

  update: async (id: number, location: { name: string; city: string }) => {
    try {
      const { error } = await supabase
        .from('locations')
        .update({ name: location.name, city: location.city })
        .eq('id', id);

      if (error) throw error;
      return { success: true };
    } catch (error: any) {
      console.error('Update location error:', error);
      throw new Error(error.message || 'Failed to update location');
    }
  },

  delete: async (id: number) => {
    try {
      const { error } = await supabase
        .from('locations')
        .delete()
        .eq('id', id);

      if (error) throw error;
      return { success: true };
    } catch (error: any) {
      console.error('Delete location error:', error);
      throw new Error(error.message || 'Failed to delete location');
    }
  }
};

// Types API using Supabase
export const supabaseTypesAPI = {
  getAll: async () => {
    try {
      const { data, error } = await supabase
        .from('property_types')
        .select('*')
        .order('name', { ascending: true });

      if (error) throw error;
      return data || [];
    } catch (error: any) {
      console.error('Get types error:', error);
      throw new Error(error.message || 'Failed to fetch types');
    }
  },

  create: async (name: string) => {
    try {
      const { data, error } = await supabase
        .from('property_types')
        .insert({ name })
        .select()
        .single();

      if (error) throw error;
      return { success: true, id: data.id };
    } catch (error: any) {
      console.error('Create type error:', error);
      throw new Error(error.message || 'Failed to create type');
    }
  },

  update: async (id: number, name: string) => {
    try {
      const { error } = await supabase
        .from('property_types')
        .update({ name })
        .eq('id', id);

      if (error) throw error;
      return { success: true };
    } catch (error: any) {
      console.error('Update type error:', error);
      throw new Error(error.message || 'Failed to update type');
    }
  },

  delete: async (id: number) => {
    try {
      const { error } = await supabase
        .from('property_types')
        .delete()
        .eq('id', id);

      if (error) throw error;
      return { success: true };
    } catch (error: any) {
      console.error('Delete type error:', error);
      throw new Error(error.message || 'Failed to delete type');
    }
  }
};


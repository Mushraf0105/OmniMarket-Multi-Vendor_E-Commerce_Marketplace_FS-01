import { getElasticsearchClient, isElasticsearchAvailable } from '../config/elasticsearch.js';
import Product from '../models/Product.js';

export const searchProducts = async (params) => {
  const {
    q = '',
    category,
    vendorId,
    brand,
    minPrice,
    maxPrice,
    minRating,
    inStock,
    sort = 'newest',
    page = 1,
    limit = 12
  } = params;

  const skip = (Number(page) - 1) * Number(limit);

  // If Elasticsearch is available, perform search on Elasticsearch
  if (isElasticsearchAvailable()) {
    try {
      const client = getElasticsearchClient();
      const mustClauses = [];
      const filterClauses = [];

      if (q && q.trim()) {
        mustClauses.push({
          multi_match: {
            query: q.trim(),
            fields: ['name^3', 'description', 'brand^2', 'tags^2', 'vendorName'],
            fuzziness: 'AUTO'
          }
        });
      } else {
        mustClauses.push({ match_all: {} });
      }

      if (category) {
        filterClauses.push({ term: { category } });
      }

      if (vendorId) {
        filterClauses.push({ term: { vendorId } });
      }

      if (brand) {
        filterClauses.push({ term: { brand } });
      }

      if (minPrice !== undefined || maxPrice !== undefined) {
        const range = {};
        if (minPrice !== undefined && minPrice !== '') range.gte = Number(minPrice);
        if (maxPrice !== undefined && maxPrice !== '') range.lte = Number(maxPrice);
        filterClauses.push({ range: { price: range } });
      }

      if (minRating) {
        filterClauses.push({ range: { rating: { gte: Number(minRating) } } });
      }

      if (inStock === 'true' || inStock === true) {
        filterClauses.push({ range: { stock: { gt: 0 } } });
      }

      // Sorting
      const sortArray = [];
      if (sort === 'price_asc') sortArray.push({ price: 'asc' });
      else if (sort === 'price_desc') sortArray.push({ price: 'desc' });
      else if (sort === 'rating_desc') sortArray.push({ rating: 'desc' });
      else sortArray.push({ createdAt: 'desc' });

      const esResponse = await client.search({
        index: 'products',
        body: {
          from: skip,
          size: Number(limit),
          query: {
            bool: {
              must: mustClauses,
              filter: filterClauses
            }
          },
          sort: sortArray
        }
      });

      const totalHits = typeof esResponse.hits.total === 'number'
        ? esResponse.hits.total
        : esResponse.hits.total.value;

      const ids = esResponse.hits.hits.map((hit) => hit._id);

      // Hydrate with full mongoose docs to ensure image arrays and vendor data
      const hydratedProducts = await Product.find({ _id: { $in: ids } })
        .populate('vendor', 'name vendorProfile');

      // Preserve ES relevance sorting
      const productMap = new Map(hydratedProducts.map(p => [p._id.toString(), p]));
      const orderedProducts = ids.map(id => productMap.get(id)).filter(Boolean);

      return {
        success: true,
        source: 'elasticsearch',
        products: orderedProducts,
        page: Number(page),
        limit: Number(limit),
        total: totalHits,
        totalPages: Math.ceil(totalHits / Number(limit))
      };
    } catch (err) {
      console.warn('[Elasticsearch] Query failed, switching to MongoDB fallback:', err.message);
    }
  }

  // Fallback: MongoDB Search with Full-text & faceted filters
  const mongoQuery = { isPublished: true };

  if (q && q.trim()) {
    mongoQuery.$or = [
      { name: { $regex: q.trim(), $options: 'i' } },
      { description: { $regex: q.trim(), $options: 'i' } },
      { brand: { $regex: q.trim(), $options: 'i' } },
      { tags: { $in: [new RegExp(q.trim(), 'i')] } }
    ];
  }

  if (category) {
    mongoQuery.category = category;
  }

  if (vendorId) {
    mongoQuery.vendor = vendorId;
  }

  if (brand) {
    mongoQuery.brand = brand;
  }

  if (minPrice !== undefined && minPrice !== '' || maxPrice !== undefined && maxPrice !== '') {
    mongoQuery.price = {};
    if (minPrice !== undefined && minPrice !== '') mongoQuery.price.$gte = Number(minPrice);
    if (maxPrice !== undefined && maxPrice !== '') mongoQuery.price.$lte = Number(maxPrice);
  }

  if (minRating) {
    mongoQuery.rating = { $gte: Number(minRating) };
  }

  if (inStock === 'true' || inStock === true) {
    mongoQuery.stock = { $gt: 0 };
  }

  // Sort
  let sortOption = { createdAt: -1 };
  if (sort === 'price_asc') sortOption = { price: 1 };
  else if (sort === 'price_desc') sortOption = { price: -1 };
  else if (sort === 'rating_desc') sortOption = { rating: -1 };

  const total = await Product.countDocuments(mongoQuery);
  const products = await Product.find(mongoQuery)
    .populate('vendor', 'name vendorProfile')
    .sort(sortOption)
    .skip(skip)
    .limit(Number(limit));

  return {
    success: true,
    source: 'mongodb-fallback',
    products,
    page: Number(page),
    limit: Number(limit),
    total,
    totalPages: Math.ceil(total / Number(limit))
  };
};

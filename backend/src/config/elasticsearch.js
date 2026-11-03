import { Client } from '@elastic/elasticsearch';

let esClient = null;
let esAvailable = false;

export const initElasticsearch = async () => {
  const node = process.env.ELASTICSEARCH_NODE || 'http://localhost:9200';
  
  try {
    esClient = new Client({
      node,
      maxRetries: 1,
      requestTimeout: 2000,
    });

    const ping = await esClient.ping();
    if (ping) {
      esAvailable = true;
      console.log(`[Elasticsearch] Successfully connected to Elasticsearch cluster at ${node}`);
      await createProductIndexIfNotExists();
    }
  } catch (error) {
    esAvailable = false;
    console.warn(`[Elasticsearch] Elasticsearch not reachable at ${node}. Using MongoDB full-text and faceted search fallback.`);
  }

  return { esClient, esAvailable };
};

export const isElasticsearchAvailable = () => esAvailable;
export const getElasticsearchClient = () => esClient;

export const createProductIndexIfNotExists = async () => {
  if (!esAvailable || !esClient) return;

  try {
    const indexExists = await esClient.indices.exists({ index: 'products' });
    if (!indexExists) {
      await esClient.indices.create({
        index: 'products',
        body: {
          settings: {
            analysis: {
              analyzer: {
                custom_edge_ngram: {
                  tokenizer: 'standard',
                  filter: ['lowercase', 'edge_ngram_filter']
                }
              },
              filter: {
                edge_ngram_filter: {
                  type: 'edge_ngram',
                  min_gram: 2,
                  max_gram: 15
                }
              }
            }
          },
          mappings: {
            properties: {
              name: {
                type: 'text',
                analyzer: 'custom_edge_ngram',
                search_analyzer: 'standard',
                fields: {
                  keyword: { type: 'keyword' }
                }
              },
              description: { type: 'text' },
              price: { type: 'float' },
              category: { type: 'keyword' },
              brand: { type: 'keyword' },
              vendorId: { type: 'keyword' },
              vendorName: { type: 'text' },
              rating: { type: 'float' },
              numReviews: { type: 'integer' },
              stock: { type: 'integer' },
              tags: { type: 'keyword' },
              createdAt: { type: 'date' }
            }
          }
        }
      });
      console.log('[Elasticsearch] "products" index created with edge-ngram analyzer.');
    }
  } catch (err) {
    console.warn('[Elasticsearch] Index initialization error:', err.message);
  }
};

export const indexProductInES = async (product) => {
  if (!esAvailable || !esClient) return;
  try {
    await esClient.index({
      index: 'products',
      id: product._id.toString(),
      document: {
        name: product.name,
        description: product.description,
        price: product.price,
        category: product.category,
        brand: product.brand || '',
        vendorId: product.vendor?._id ? product.vendor._id.toString() : product.vendor.toString(),
        vendorName: product.vendor?.vendorProfile?.storeName || product.vendor?.name || '',
        rating: product.rating || 0,
        numReviews: product.numReviews || 0,
        stock: product.stock,
        tags: product.tags || [],
        createdAt: product.createdAt || new Date()
      }
    });
  } catch (err) {
    console.warn(`[Elasticsearch] Failed to index product ${product._id}:`, err.message);
  }
};

export const deleteProductFromES = async (productId) => {
  if (!esAvailable || !esClient) return;
  try {
    await esClient.delete({
      index: 'products',
      id: productId.toString()
    });
  } catch (err) {
    // Ignore 404
  }
};


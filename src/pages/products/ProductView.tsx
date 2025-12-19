import React, { useState, useEffect, useContext } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { productService, categoryService } from "../../api/api";
import { CartContext } from "../../context/CartContext";
import ProductDetailSkeleton from "../../components/ProductDetailSkeleton";
import type { Product, Category } from "../../types/database";

const ProductView: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { addToCart, buyNow } = useContext(CartContext);
  
  const [product, setProduct] = useState<Product | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedSize, setSelectedSize] = useState<string>("M");
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const sizes = ["XS", "S", "M", "L", "XL", "XXL"];

  const isAccessory = () => {
    if (!product || !product.category_id) return false;
    const category = categories.find(cat => cat.id === product.category_id);
    return category?.name === 'Accessories';
  };

  useEffect(() => {
    const fetchData = async () => {
      if (!id) return;
      
      setLoading(true);
      setError(null);
      try {
        // Fetch categories
        const categoriesData = await categoryService.getAll();
        setCategories(categoriesData);
        
        // Fetch products
        const productsData = await productService.getAll();
        const foundProduct = productsData.find(p => p.id === id);
        
        if (foundProduct) {
          setProduct(foundProduct);
        } else {
          setError("Product not found");
        }
      } catch (err) {
        console.error(err);
        setError("Failed to fetch product");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id]);

  const handleAddToCart = () => {
    if (product) {
      // Don't pass size for accessories
      addToCart(product, isAccessory() ? undefined : selectedSize);
    }
  };

  const handleBuyNow = () => {
    if (product) {
      buyNow(product, isAccessory() ? undefined : selectedSize);
      navigate("/checkout");
    }
  };

  if (loading) return <ProductDetailSkeleton />;

  if (error || !product) return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <div className="text-center">
        <p className="text-red-500 font-light text-sm mb-4">{error || "Product not found"}</p>
        <button
          onClick={() => navigate("/products")}
          className="bg-black hover:bg-gray-800 text-white px-6 py-2 text-xs uppercase tracking-wide transition-colors"
        >
          Back to Products
        </button>
      </div>
    </div>
  );

  return (
    <div className="container mx-auto px-6 py-16">
      <div className="grid md:grid-cols-2 gap-12 lg:gap-16">
        {/* Product Image */}
        <div className="bg-gray-50 aspect-square">
          {product.image ? (
            <img
              src={product.image}
              alt={product.title}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-gray-400">
              No Image
            </div>
          )}
        </div>

        {/* Product Details */}
        <div className="flex flex-col">
          <div className="mb-8">
            <h1 className="text-4xl font-light text-black mb-2 tracking-wide">
              {product.title}
            </h1>
            <p className="text-2xl text-black font-normal">${product.price}</p>
          </div>

          {/* Description */}
          <div className="mb-8">
            <h2 className="text-xs uppercase tracking-wide text-gray-600 mb-2">Description</h2>
            <p className="text-sm text-gray-700 font-light leading-relaxed">
              {product.description || "No description available."}
            </p>
          </div>

          {/* Size Picker - Only show for non-accessories */}
          {!isAccessory() && (
            <div className="mb-8">
              <h2 className="text-xs uppercase tracking-wide text-gray-600 mb-3">Select Size</h2>
              <div className="flex flex-wrap gap-3">
                {sizes.map((size) => (
                  <button
                    key={size}
                    onClick={() => setSelectedSize(size)}
                    className={`w-12 h-12 border text-sm font-light transition-colors ${
                      selectedSize === size
                        ? "bg-black text-white border-black"
                        : "bg-white text-black border-gray-300 hover:border-black"
                    }`}
                  >
                    {size}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-4 mb-12">
            <button
              onClick={handleAddToCart}
              className="flex-1 bg-white hover:bg-gray-50 text-black border border-black px-6 py-4 text-sm uppercase tracking-wide transition-colors"
            >
              Add to Cart
            </button>
            <button
              onClick={handleBuyNow}
              className="flex-1 bg-black hover:bg-gray-800 text-white px-6 py-4 text-sm uppercase tracking-wide transition-colors"
            >
              Buy Now
            </button>
          </div>

          {/* Reviews Section */}
          <div className="border-t border-gray-200 pt-8">
            <h2 className="text-xs uppercase tracking-wide text-gray-600 mb-4">Customer Reviews</h2>
            
            {/* Review Summary */}
            <div className="flex items-center gap-4 mb-6">
              <div className="flex items-center">
                {[1, 2, 3, 4, 5].map((star) => (
                  <svg
                    key={star}
                    className="w-5 h-5 text-yellow-400 fill-current"
                    viewBox="0 0 20 20"
                  >
                    <path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z" />
                  </svg>
                ))}
              </div>
              <span className="text-sm text-gray-600 font-light">4.5 out of 5 (24 reviews)</span>
            </div>

            {/* Individual Reviews */}
            <div className="space-y-6">
              <div className="border-b border-gray-100 pb-6">
                <div className="flex items-center gap-2 mb-2">
                  <div className="flex">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <svg
                        key={star}
                        className="w-4 h-4 text-yellow-400 fill-current"
                        viewBox="0 0 20 20"
                      >
                        <path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z" />
                      </svg>
                    ))}
                  </div>
                  <span className="text-xs text-gray-600 font-light">John D.</span>
                </div>
                <p className="text-sm text-gray-700 font-light">
                  Excellent quality and fits perfectly. The material is premium and very comfortable to wear.
                </p>
              </div>

              <div className="border-b border-gray-100 pb-6">
                <div className="flex items-center gap-2 mb-2">
                  <div className="flex">
                    {[1, 2, 3, 4].map((star) => (
                      <svg
                        key={star}
                        className="w-4 h-4 text-yellow-400 fill-current"
                        viewBox="0 0 20 20"
                      >
                        <path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z" />
                      </svg>
                    ))}
                    <svg className="w-4 h-4 text-gray-300 fill-current" viewBox="0 0 20 20">
                      <path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z" />
                    </svg>
                  </div>
                  <span className="text-xs text-gray-600 font-light">Sarah M.</span>
                </div>
                <p className="text-sm text-gray-700 font-light">
                  Great product overall. Shipping was fast and the packaging was nice. Would recommend!
                </p>
              </div>

              <div className="pb-6">
                <div className="flex items-center gap-2 mb-2">
                  <div className="flex">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <svg
                        key={star}
                        className="w-4 h-4 text-yellow-400 fill-current"
                        viewBox="0 0 20 20"
                      >
                        <path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z" />
                      </svg>
                    ))}
                  </div>
                  <span className="text-xs text-gray-600 font-light">Mike T.</span>
                </div>
                <p className="text-sm text-gray-700 font-light">
                  Love this! Exactly what I was looking for. The fit is true to size and looks amazing.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductView;

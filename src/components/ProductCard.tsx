import React, { useContext } from "react";
import { CartContext } from "../context/CartContext";
import type { Product } from "../types/database";

interface ProductCardProps {
  product: Product;
}

const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  const { addToCart } = useContext(CartContext);

  return (
    <div className="group bg-white overflow-hidden hover:shadow-sm transition-shadow">
      {product.image && (
        <div className="relative overflow-hidden aspect-square bg-gray-50">
          <img
            src={product.image}
            alt={product.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
        </div>
      )}
      <div className="p-4">
        <h2 className="text-sm font-light text-black mb-1">{product.title}</h2>
        <p className="text-xs text-gray-500 mb-3 font-light line-clamp-2">{product.description}</p>
        <div className="flex items-center justify-between">
          <p className="text-base font-normal text-black">${product.price}</p>
          <button
            onClick={() => addToCart(product)}
            className="bg-black hover:bg-gray-800 text-white px-5 py-2 text-xs font-light uppercase tracking-wide transition-colors"
          >
            Add to Cart
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;

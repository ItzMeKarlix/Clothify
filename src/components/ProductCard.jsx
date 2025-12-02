import React, { useContext } from "react";
import { CartContext } from "../context/CartContext";

const ProductCard = ({ product }) => {
  const { addToCart } = useContext(CartContext);

  return (
    <div className="border p-4 rounded shadow hover:shadow-lg">
      {product.image && (
        <img
          src={product.image}
          alt={product.title}
          className="w-full h-48 object-cover mb-2 rounded"
        />
      )}
      <h2 className="text-lg font-bold">{product.title}</h2>
      <p className="text-gray-600">{product.description}</p>
      <p className="text-blue-700 font-semibold">${product.price}</p>
      <button
        onClick={() => addToCart(product)}
        className="mt-2 bg-green-600 text-white px-4 py-1 rounded hover:bg-green-700"
      >
        Add to Cart
      </button>
    </div>
  );
};

export default ProductCard;

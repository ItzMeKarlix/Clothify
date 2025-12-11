import React from "react";
import CategoryPage from "../../layout/Collection";

const Men: React.FC = () => {
  return (
    <CategoryPage
      title="MEN'S COLLECTION"
      description="Discover our latest men's fashion"
      filterType="gender"
      filterValue="male"
    />
  );
};

export default Men;

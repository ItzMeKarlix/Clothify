import React from "react";
import CategoryPage from "../../layout/Collection";

const Women: React.FC = () => {
  return (
    <CategoryPage
      title="WOMEN'S COLLECTION"
      description="Discover our latest women's fashion"
      filterType="gender"
      filterValue="female"
    />
  );
};

export default Women;

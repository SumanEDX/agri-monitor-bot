import SchemesListPage from "./SchemesListPage";

const CentralSchemes = () => (
  <SchemesListPage
    category="central"
    title="Central Government Schemes"
    description="Flagship welfare schemes from the Government of India for every farmer."
    filters={["All", "Insurance", "Loans", "Irrigation", "Soil", "Credit"]}
  />
);

export default CentralSchemes;
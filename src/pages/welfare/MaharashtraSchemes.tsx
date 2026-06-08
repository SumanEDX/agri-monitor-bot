import SchemesListPage from "./SchemesListPage";

const MaharashtraSchemes = () => (
  <SchemesListPage
    category="maharashtra"
    title="Maharashtra Government Schemes"
    description="State-led initiatives empowering Maharashtra's farmers."
    filters={["All", "Loan Waiver", "Water", "Horticulture", "Solar", "Climate"]}
  />
);

export default MaharashtraSchemes;
const fs = require('fs');
let content = fs.readFileSync('src/App.tsx', 'utf-8');

const replacement = `
  const handleGridFilterSelect = React.useCallback((filterType: "category" | "transmission" | "fuelType" | "seats", value: string | number) => {
    setFilters({
      searchTerm: "",
      category: "All",
      maxPrice: 10000,
      transmission: "All",
      fuelType: "All",
      seats: "All",
      brand: "All",
      likedOnly: false,
      [filterType]: value
    });
    scrollToAnchor("category-filter-container");
  }, []);

  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    setCurrentPage(1);
  }, [filters, sortBy]);

  const deferredSortBy = React.useDeferredValue(sortBy);
`;

content = content.replace('  const deferredSortBy = React.useDeferredValue(sortBy);', replacement);

fs.writeFileSync('src/App.tsx', content);
console.log("Fixed missing functions");

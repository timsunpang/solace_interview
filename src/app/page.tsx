import Header from "./components/Header";
import SearchTable from "./components/SearchTable";
import { SearchProvider } from "./context/SearchContext";
import SearchBar from "./components/SearchBar";

export default function Home() {
  return (
    <main style={{ margin: "24px" }}>
      <Header />
      <SearchProvider>
        <SearchBar />
        <SearchTable />
      </SearchProvider>
    </main>
  );
}

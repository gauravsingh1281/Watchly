import { useEffect, useState } from "react";
import Search from "./components/Search";
import Spinner from "./components/Spinner";
import MovieCard from "./components/MovieCard";
import { useDebounce } from "react-use";
import { updateSearchCount } from "./appwrite";
const API_BASE_URL = "https://api.themoviedb.org/3";
const API_KEY = import.meta.env.VITE_TMDB_API_KEY;
const API_OPTIONS = {
  method: "GET",
  headers: {
    accept: "application/json",
    Authorization: `Bearer ${API_KEY}`,
  },
};
export default function App() {
  const [searchTerm, setSearchTerm] = useState("");
  const [errMsg, setErrMsg] = useState("");
  const [movieList, setMovieList] = useState([]);
  const [isloading, setIsloading] = useState(false);
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState("");
  useDebounce(() => setDebouncedSearchTerm(searchTerm), 500, [searchTerm]);
  const fetchMovies = async (query = "") => {
    setIsloading(true);
    setErrMsg("");
    try {
      const endPoint = query
        ? `${API_BASE_URL}/search/movie?query=${encodeURIComponent(query)}`
        : `${API_BASE_URL}/discover/movie?sort_by=popularity.desc`;
      const response = await fetch(endPoint, API_OPTIONS);
      if (!response.ok) {
        throw new Error("Failed to fetch movies");
      }
      const data = await response.json();
      if (data.response === "false") {
        setErrMsg(data.Error || "Failed to fetch movies.");
        setMovieList([]);
        return;
      }
      setMovieList(data.results || []);
      if (query && data.results > 0) {
        await updateSearchCount(query, data.results[0]);
      }
    } catch (error) {
      console.error(`Error fetching movies:${error}`);
      setErrMsg("Error fetching movies. Please try again later.");
    } finally {
      setIsloading(false);
    }
  };
  useEffect(() => {
    fetchMovies(debouncedSearchTerm);
  }, [debouncedSearchTerm]);
  return (
    <main>
      <div className="pattern" />
      <div className="wrapper">
        <header>
          <img src="./hero.png" alt="hero-banner" />
          <h1>
            Find <span className="text-gradient">Movies</span> you'll Enjoy
            Without the Hassle
          </h1>
          <Search searchTerm={searchTerm} onSetSearchTerm={setSearchTerm} />
        </header>
        <section className="all-movies">
          <h2 className="mt-[40px]">All Movies</h2>
          {isloading ? (
            <Spinner />
          ) : errMsg ? (
            <p className="text-red-500">{errMsg}</p>
          ) : (
            <ul>
              {movieList.map((movie) => (
                <MovieCard key={movie.id} movie={movie} />
              ))}
            </ul>
          )}
        </section>
      </div>
    </main>
  );
}

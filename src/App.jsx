import React, { useEffect, useState } from 'react'; // <- Add this import
import { useDebounce } from 'react-use';
import { updateSearchCount,getTrendingMovies } from './appwrite.js'
import Search from './components/Search.jsx'
import Spinner from './components/Spinner.jsx'
import MovieCard from './components/MovieCard.jsx'
const API_BASE_URL = 'https://api.themoviedb.org/3';
const API_KEY = import.meta.env.VITE_TMDB_API_KEY;
const API_OPTIONS = {
  method: 'GET',
  headers: {
    accept:'application/json',
    Authorization: `Bearer ${API_KEY}`
  }
}

const App = () => {
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('')
  const [searchTerm, setSearchTerm] = useState('')

  const [movieList, setMovieList] = useState([])
  const [errorMessage, setErrorMessage] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  
  const [trendingMovies, setTrendingMovies] = useState([]);


  // Debounce the search term to prevent making too many API requests
  // by waiting for the user to stop typing for 500ms

  useDebounce(() => setDebouncedSearchTerm(searchTerm), 500, [searchTerm])

  const fetchMovies = async (query = '') => {
    setIsLoading(true);
    setErrorMessage('');
    try {
      const endpoint = query
        ? `${API_BASE_URL}/search/movie?query=${encodeURIComponent(query)}`
        : `${API_BASE_URL}/discover/movie?sort_by=popularity.desc`;

      const response = await fetch(endpoint, API_OPTIONS);
      if(!response.ok) {
        throw new Error('Failed to fetch movies');
      }
      const data = await response.json();
      if(data.response === 0) {
        setErrorMessage(data.error || 'Failed to fetch movies');
        setMovieList([]);
        return; 
      }
      setMovieList(data.results || []);
      // important
      if(query && data.results.length > 0) {
        await updateSearchCount(query, data.results[0]);
      }
      
    } catch (error) {
      console.error('Error fetching movies: ${error}');
      setErrorMessage('Error fetching movies. Try again later.');
    } finally {
      setIsLoading(false);
    }
  }

  const loadTrendingMovies = async () => {
    try {
      const movies = await getTrendingMovies();

      setTrendingMovies(movies);
    } catch (error) {
      console.error(`Error fetching trending movies: ${error}`);
    }
  }

  
  useEffect(() => { 
    fetchMovies(debouncedSearchTerm);
  }, [debouncedSearchTerm]); 

  useEffect(() => {
    loadTrendingMovies();
  }, []);

  return (
    <main>
      <div className='pattern'/>
      <div className='wrapper'>
        <header> 
          <img src='./hero.png' alt='Hero Banner'/>
          <h1>Find <span className='text-gradient'>Movies</span> You'll Enjoy Without The Hasell</h1>
          <Search searchTerm = {searchTerm} setSearchTerm = {setSearchTerm}/>
        </header>

        {trendingMovies.length > 0 && (
          <section className="trending">
            <h2>Trending Movies</h2>

            <ul>
              {trendingMovies.map((movie, index) => (
                <li key={movie.$id}>
                  <p>{index + 1}</p>
                  <img src={movie.poster_url} alt={movie.title} />
                </li>
              ))}
            </ul>
          </section>
        )}
        
        <section className='all-movies'>
          <h2 >All Movies</h2>


          {isLoading ? (
            <Spinner />
          ) : errorMessage ? (
            <p className='text-red-500'>{errorMessage}</p>
          ) : (
            <ul> 
              {movieList.map((movie) => (
                <MovieCard key={movie.id} movie={movie}/>
              ))}
            </ul>
          )}

          {errorMessage && <p className='text-red-500'>{errorMessage}</p>}
        </section>

      </div>
      
    </main>
  )
}

export default App

// main ui of the app is defined here

/*
There are two ways to create a component in React:

1. **Conventional Way** - Class Component:
   - These were used in the past but are not widely used anymore.
   - Example:

      class ClassComponent extends React.Component {
        render() {
          return <h2>Class Component</h2>;
        }
      }

2. **Modern Way** - Functional Component:
   - Functional components are simpler and widely used today.
   - We can use "hooks" like `useState` to add features like state to functional components.

State:
- State holds information about the component that can change over time.
- For example, if we want to track whether someone has watched a movie, we use state.

React's rendering process relies on state and props to decide when and how to update (rerender) a component.

Here's how to use state in a functional component:

const [varName, setVarName] = useState();

- `useState` is a hook that allows us to add state to functional components.
- It returns an array with 2 elements:
  1. The current state value (`varName`).
  2. A function to update the state value (`setVarName`).

Whenever we update the state using `setVarName`, React rerenders the component to reflect the new value!

use state is a hook that hooks our special fucntions in react that let u tap into react feautes like state and lifecycle methods

like useContex, useEffect, useReducer, useMemo, useCallback, useRef, useImperativeHandle, useLayoutEffect, useDebugValue


useEffect is a hook that lets you perform side effects in your function components ex fetching data and doing some cleanup after the component is unmounted


my effect run twice because the component is mounted and unmounted and mounted again
*/



import { useReducer } from 'react';

// Define the initial state
const initialState = {
    searchTerm: '',
    isAvailable: false,
};

// Define a reducer function
const filterReducer = (state, action) => {
    switch (action.type) {
        case 'SET_SEARCH_TERM':
            return { ...state, searchTerm: action.payload };
        case 'TOGGLE_AVAILABILITY':
            return { ...state, isAvailable: !state.isAvailable };
        default:
            return state;
    }
};

export const useFilterState = () => {
    const [state, dispatch] = useReducer(filterReducer, initialState);

    const setSearchTerm = (term) => {
        dispatch({ type: 'SET_SEARCH_TERM', payload: term });
    };

    const toggleAvailability = () => {
        dispatch({ type: 'TOGGLE_AVAILABILITY' });
    };

    return { state, setSearchTerm, toggleAvailability };
};
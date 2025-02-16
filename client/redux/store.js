import { configureStore, createSlice, combineReducers } from '@reduxjs/toolkit';
import loginReducer from './reducers/loginReducer';
import likeReducer from './reducers/likeReducer';
import idReducer from './reducers/idReducer';
import accountReducer from './reducers/accountReducer';
import saveReducer from './reducers/saveReducer';
import userInfoReducer from './reducers/userInfoReducer';
import vendReducer from './reducers/vendReducer';
import tokenReducer from './reducers/tokenReducer';

// HOW REDUX STATE WORKS
// 
// In LoginScreen component, login button click = action obj created
// Login action is dispatched to store via useDispatch hook
// Store holds application state, SINGLE SOURCE OF TRUTH HERE
// To change state:
    // reducer takes in prev state and action obj that was dispatched
    // reducer returns next state
// Store updates state, which components can access vis useSelector hook
// The store is inside <Provider> in App.js

// NEED A NEW STATE?
// 1) create new action under ./redux/actions
    // EX: increment() and decrement() func names for a counter
    // action return types would be COUNT_INCREASE and COUNT_DECREASE 
// 2) create new reducer function under ./redux/reducers
    // specify initial state and all possible states
    // EX: for COUNT_INCREASE, state.count++
    // ***WARNING*** DO NOT MUTATE STATE do not directly change state
    // if adding new item to array, spread + add new data, do not push()
// 3) in store.js, add reducer to rootReducer
// 4) in your component, create dispatch and selector hooks to change and get state, respectively


const rootReducer = combineReducers({
    isLogged: loginReducer,
    liked_articles: likeReducer,
    user_id: idReducer,
    acct_type: accountReducer,
    saved_articles: saveReducer,
    userInfo: userInfoReducer,
    isInit: vendReducer,
    token: tokenReducer,
});

export const store = configureStore({
    reducer: rootReducer
  });

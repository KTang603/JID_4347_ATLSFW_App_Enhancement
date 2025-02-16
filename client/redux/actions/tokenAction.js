export const setToken = (data) => {
  return {
    type: 'SET_TOKEN',
    payload: data,
  };
};

export const clearToken = () => {
  return {
    type: 'CLEAR_TOKEN',
  };
};

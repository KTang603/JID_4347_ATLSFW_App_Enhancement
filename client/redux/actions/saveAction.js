export const save = (data) => {
    return {
      type: 'SAVE',
      payload: data,
    };
  };

export const unsave = (data) => {
    return {
      type: 'UNSAVE',
      payload: data,
    };
  };

export const get_save_list = (data) => {
  return {
    type: 'GET_SAVE_LIST',
    payload: data,
  };
};
// src/utils/alert.js
import Swal from 'sweetalert2';
import withReactContent from 'sweetalert2-react-content';

const MySwal = withReactContent(Swal);

export const showToast = (options) => {
  return MySwal.fire({
    toast: true,
    position: 'top-end',
    showConfirmButton: false,
    timer: 2500,
    timerProgressBar: true,
    icon: options.icon || 'success',
    title: options.title || '',
    ...options,
  });
};

export default MySwal;

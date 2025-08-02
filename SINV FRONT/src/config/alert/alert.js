import Swal from 'sweetalert2';
import withReactContent from 'sweetalert2-react-content';

const AlertClient = withReactContent(Swal);

export const customAlert = (title, text, icon) => {
  return AlertClient.fire({
    title,
    text,
    icon,
    confirmButtonColor: '#7c3aed',
    confirmButtonText: 'Aceptar',
  });
};

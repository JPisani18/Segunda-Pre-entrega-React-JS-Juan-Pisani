import React, { useContext } from 'react';
import Swal from 'sweetalert2';
import { VStack, Box, Text, Button, Wrap, WrapItem } from '@chakra-ui/react';
import { useNavigate } from 'react-router-dom';
import { CarritoContext } from '../Carrito/CarritoContext';
import { useCart } from '../Carrito/CarritoContext';
import './Carrito.css';
import { firestore } from '../firebase/firebase.js';
import { addDoc, collection } from 'firebase/firestore';

const Carrito = () => {
  const { cart, dispatch } = useCart();
  const navigate = useNavigate();
  const { handleCheckout } = useContext(CarritoContext);

  const handleRemoveFromCart = (itemId) => {
    dispatch({
      type: 'REMOVE_FROM_CART',
      payload: { id: itemId },
    });
  };

  const calculateTotal = () => {
    return cart.reduce((total, item) => {
      return total + item.precio * item.cantidad;
    }, 0);
  };

  const handleFinalizarCompra = async () => {
    if (cart.length === 0) {
      
      Swal.fire({
        icon: 'info',
        title: 'Carrito vacío',
        text: 'El carrito está vacío. Agrega productos antes de proceder al pago.',
      });
      return;
    }

    try {
      const docRef = await addDoc(collection(firestore, 'orders'), {
        items: cart,
        fecha: new Date(),
        estado: 'generada',
      });

      
      Swal.fire({
        icon: 'success',
        title: 'Orden creada con éxito',
        text: `ID de orden: ${docRef.id}`,
      }).then(() => {
        navigate('/checkout');
      });
    } catch (error) {
      console.error('Error al guardar la orden en la base de datos:', error);
    
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Error al guardar la orden en la base de datos',
      });
    }
  };

  return (
    <VStack spacing={4} align="center" justify="center" mt={5}>
      <Text fontSize="xl">CARRITO DE COMPRAS</Text>
      <Wrap spacing="4">
        {cart.map((item) => (
          <WrapItem key={item.id}>
            <Box
              key={item.id}
              borderWidth="1px"
              borderRadius="lg"
              overflow="hidden"
              p={4}
              style={{ width: '300px' }}
              align="center"
              justify="center"
              backgroundColor={'white'}
            >
              <img className="cartimg" src={item.imageSrc} alt={item.titulo} />
              <Text fontSize="xl">{item.titulo}</Text>
              <Text>Cantidad: {item.cantidad}</Text>
              <Text>Precio: ${item.precio * item.cantidad}</Text>
              <Button onClick={() => handleRemoveFromCart(item.id)} colorScheme="red">
                Eliminar
              </Button>
            </Box>
          </WrapItem>
        ))}
      </Wrap>
      <Box>
        <Text fontSize="xl" fontWeight="bold" mt={4}>
          Valor total: ${calculateTotal()}
        </Text>
        <Button onClick={handleFinalizarCompra}>Ir a pagar</Button>
      </Box>
    </VStack>
  );
};

export default Carrito;

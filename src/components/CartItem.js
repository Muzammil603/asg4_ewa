import React from 'react';

function CartItem({ item, removeFromCart, updateQuantity }) {
  const accessories = Array.isArray(item.accessories) ? item.accessories : [];
  const warranty = item.warranty || 'No Warranty';
  const itemPrice = Number(item.total_price) || 0;

  const handleQuantityChange = (e) => {
    const newQuantity = parseInt(e.target.value, 10);
    updateQuantity(item.id, newQuantity);
  };

  return (
    <li className="cart-item" key={item.id}>
      <div>
        <h2>{item.product_name}</h2>
        <p>Price: ${itemPrice.toFixed(2)}</p>
        <p>Accessories: {accessories.length > 0 ? accessories.map(acc => acc.name).join(', ') : 'None'}</p>
        <p>Warranty: {warranty}</p>
        <label>
          Quantity:
          <input
            type="number"
            value={item.quantity}
            min="1"
            onChange={handleQuantityChange}
          />
        </label>
        <button onClick={() => removeFromCart(item.id)}>Remove</button>
      </div>
    </li>
  );
}

export default CartItem;
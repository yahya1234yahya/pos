'use client';

const OrderCard = ({ order, onStatusChange }) => {
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleString('fr-FR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const calculateItemTotal = (item) => {
    let total = item.quantity * parseFloat(item.unit_price);
    if (item.options) {
      item.options.forEach(option => {
        if (option.option_type === 'size') {
          total += parseFloat(option.extra_cost) * item.quantity;
        } else {
          option.values.forEach(value => {
            total += parseFloat(value.extra_cost) * item.quantity;
          });
        }
      });
    }
    return total;
  };

  const calculateTotal = (items) => {
    return items.reduce((total, item) => total + calculateItemTotal(item), 0);
  };

  const renderItemOptions = (options) => {
    if (!options || options.length === 0) return null;

    return options.map((option, index) => (
      <div key={index} className="ml-4 text-sm text-gray-600">
        <span className="font-medium">
          {option.option_type === 'size' ? 'Taille' : 'Extras'}:
        </span>
        {option.option_type === 'size' ? (
          <span className="ml-1">
            {option.value}
            {option.extra_cost > 0 && ` (+${parseFloat(option.extra_cost).toFixed(2)} DH)`}
          </span>
        ) : (
          <span className="ml-1">
            {option.values.map((value, i) => (
              <span key={i}>
                {value.value}
                {value.extra_cost > 0 && ` (+${parseFloat(value.extra_cost).toFixed(2)} DH)`}
                {i < option.values.length - 1 ? ', ' : ''}
              </span>
            ))}
          </span>
        )}
      </div>
    ));
  };

  const getNextStatus = (currentStatus) => {
    const statusFlow = {
      'pending': 'preparing',
      'preparing': 'ready',
      'ready': 'completed'
    };
    return statusFlow[currentStatus] || currentStatus;
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-6 mb-4">
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="text-xl font-bold mb-2">Commande #{order.id}</h3>
          <p className="text-gray-600">Table {order.table_number}</p>
          <p className="text-gray-600">Serveur: {order.waiter_name}</p>
          <p className="text-gray-600">{formatDate(order.created_at)}</p>
        </div>
        <div className={`px-3 py-1 rounded-full text-sm font-medium ${
          order.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
          order.status === 'preparing' ? 'bg-blue-100 text-blue-800' :
          order.status === 'ready' ? 'bg-green-100 text-green-800' :
          order.status === 'completed' ? 'bg-gray-100 text-gray-800' :
          'bg-red-100 text-red-800'
        }`}>
          {order.status === 'pending' ? 'En attente' :
           order.status === 'preparing' ? 'En préparation' :
           order.status === 'ready' ? 'Prêt' :
           order.status === 'completed' ? 'Terminé' :
           'Annulé'}
        </div>
      </div>

      <div className="border-t border-b border-gray-200 py-4 my-4">
        <h4 className="font-semibold mb-2">Articles:</h4>
        <div className="space-y-3">
          {order.items.map((item, index) => (
            <div key={index}>
              <div className="flex justify-between">
                <span>{item.quantity}x {item.item_name}</span>
                <span>{calculateItemTotal(item).toFixed(2)} DH</span>
              </div>
              {renderItemOptions(item.options)}
            </div>
          ))}
        </div>
        <div className="mt-4 text-right font-bold">
          Total: {calculateTotal(order.items).toFixed(2)} DH
        </div>
      </div>

      <div className="flex justify-end space-x-4 mt-4">
        {order.status !== 'completed' && order.status !== 'cancelled' && (
          <>
            <button
              onClick={() => onStatusChange(order, 'cancelled')}
              className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 transition-colors"
            >
              Annuler
            </button>
            <button
              onClick={() => onStatusChange(order, getNextStatus(order.status))}
              className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
            >
              Étape suivante
            </button>
          </>
        )}
      </div>
    </div>
  );
};

export default OrderCard;

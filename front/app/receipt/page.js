'use client';
import { useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';

const Receipt = () => {
  const [receiptData, setReceiptData] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const searchParams = useSearchParams();
  const router = useRouter();
  const orderId = searchParams.get('orderId');

  useEffect(() => {
    // Auto-close after 1 minute
    const autoCloseTimer = setTimeout(() => {
      window.close();
    }, 60000); // 60 seconds = 1 minute

    // Cleanup timer on unmount
    return () => clearTimeout(autoCloseTimer);
  }, []);

  useEffect(() => {
    const fetchReceipt = async () => {
      if (!orderId) {
        setError('Order ID is missing');
        setLoading(false);
        return;
      }

      try {
        const response = await fetch(`http://localhost/pos/POS/api/orders.php?id=${orderId}`, {
          credentials: 'include'
        });
        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.message || `HTTP error! status: ${response.status}`);
        }

        if (!data.success) {
          throw new Error(data.message || 'Failed to fetch receipt');
        }

        setReceiptData(data.order);
      } catch (error) {
        console.error('Error fetching receipt:', error);
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchReceipt();
  }, [orderId, router]);

  const handlePrint = () => {
    window.print();
  };

  const handleReturn = () => {
    window.close();
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-gray-900 mx-auto"></div>
          <p className="mt-2">Loading receipt...</p>
        </div>
      </div>
    );
  }

  if (error || !receiptData) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center text-red-600">
          <p>{error || 'Failed to load receipt'}</p>
        </div>
      </div>
    );
  }

  const calculateTotal = (items) => {
    return items.reduce((total, item) => {
      const itemTotal = item.quantity * item.unit_price;
      const optionsTotal = item.options?.reduce((acc, opt) => acc + (opt.extra_cost || 0), 0) || 0;
      return total + (itemTotal + (optionsTotal * item.quantity));
    }, 0);
  };

  const total = calculateTotal(receiptData.items);

  return (
    <div style={{ width: '80mm', margin: '0 auto', padding: '5mm', fontFamily: 'monospace' }}>
      <style jsx global>{`
        @media screen {
          body { background: #f0f0f0; }
          .receipt-container { background: white; padding: 20px; box-shadow: 0 0 10px rgba(0,0,0,0.1); }
        }
        @media print {
          body { margin: 0; padding: 0; }
          .receipt-container { width: 80mm !important; }
          .no-print { display: none !important; }
        }
      `}</style>

      <div className="receipt-container">
        <div style={{ textAlign: 'center', marginBottom: '10px' }}>
          <div style={{ fontSize: '16px', fontWeight: 'bold' }}>COFFEE RESTAURANT</div>
          <div>123 Coffee Street</div>
          <div>Paris, France</div>
          <div>Date: {new Date().toLocaleString('fr-FR')}</div>
        </div>

        <div style={{ borderTop: '1px dashed black', borderBottom: '1px dashed black', margin: '10px 0', padding: '10px 0', textAlign: 'center' }}>
          <div style={{ fontWeight: 'bold' }}>FACTURE</div>
          <div>Commande #{receiptData.id}</div>
          <div>Table {receiptData.table_number}</div>
          <div>Serveur: {receiptData.waiter_name}</div>
        </div>

        <div style={{ margin: '10px 0' }}>
          {receiptData.items.map((item, index) => (
            <div key={index} style={{ display: 'flex', justifyContent: 'space-between', margin: '5px 0' }}>
              <span>{item.quantity}x {item.item_name}</span>
              <span>{((item.unit_price + (item.options?.reduce((acc, opt) => acc + (opt.extra_cost || 0), 0) || 0)) * item.quantity).toFixed(2)} DH</span>
            </div>
          ))}
        </div>

        <div style={{ borderTop: '1px dashed black', marginTop: '10px', paddingTop: '10px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 'bold' }}>
            <span>TOTAL</span>
            <span>{total.toFixed(2)} DH</span>
          </div>
        </div>

        <div style={{ marginTop: '20px', textAlign: 'center', borderTop: '1px dashed black', paddingTop: '10px' }}>
          <div>Merci de votre visite!</div>
          <div>A bientôt!</div>
        </div>

        <div className="no-print mt-4 flex justify-between">
          <button 
            onClick={handleReturn}
            className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
          >
            Retour
          </button>
          <button 
            onClick={handlePrint}
            className="px-4 py-2 bg-primary text-white rounded hover:bg-primary-dark"
          >
            Imprimer
          </button>
        </div>
      </div>
    </div>
  );
};

export default Receipt;

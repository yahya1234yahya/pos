'use client';

const Floor = ({ onTableSelect }) => {
  return (
    <div
      id="tableSelectionModal"
      className="fixed top-0 left-0 right-0 bottom-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
    >
      <div className="bg-white rounded-lg p-8 w-full max-w-4xl mx-4">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold">Sélectionner une Table</h2>
          <p className="text-gray-600 mt-2">Choisissez une table pour commencer la commande</p>
        </div>

        <div className="flex space-x-4 mb-6">
          <button className="px-6 py-3 bg-primary text-white rounded-lg text-lg">Étage 1</button>
          <button className="px-6 py-3 bg-white text-gray-700 border rounded-lg text-lg">Étage 2</button>
        </div>

        <div className="grid grid-cols-4 gap-4 mb-6">
          <button
            onClick={() => onTableSelect('T1')}
            className="p-6 bg-white border-2 border-gray-200 rounded-lg hover:border-primary hover:shadow-lg transition-all"
          >
            <div className="text-2xl font-bold text-center">T1</div>
            <div className="text-green-500 text-lg text-center">Disponible</div>
          </button>
          <button
            onClick={() => onTableSelect('T2')}
            className="p-6 bg-white border-2 border-gray-200 rounded-lg hover:border-primary hover:shadow-lg transition-all"
          >
            <div className="text-2xl font-bold text-center">T2</div>
            <div className="text-green-500 text-lg text-center">Disponible</div>
          </button>

          <button
            disabled
            className="p-6 bg-gray-50 border-2 border-gray-200 rounded-lg opacity-75 cursor-not-allowed"
          >
            <div className="text-2xl font-bold text-center text-gray-600">T3</div>
            <div className="text-warning text-lg text-center">Occupée</div>
          </button>

          <button
            onClick={() => onTableSelect('T4')}
            className="p-6 bg-white border-2 border-gray-200 rounded-lg hover:border-primary hover:shadow-lg transition-all"
          >
            <div className="text-2xl font-bold text-center">T4</div>
            <div className="text-green-500 text-lg text-center">Disponible</div>
          </button>
        </div>

        <div className="flex justify-between items-center text-sm text-gray-600">
          <div className="flex items-center space-x-4">
            <div className="flex items-center">
              <div className="w-4 h-4 bg-green-500 rounded-full mr-2"></div>
              <span>Disponible</span>
            </div>
            <div className="flex items-center">
              <div className="w-4 h-4 bg-warning rounded-full mr-2"></div>
              <span>Occupée</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Floor;

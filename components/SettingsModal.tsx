import React from 'react';

type ModelType = 'gemini-2.5-flash' | 'gemini-2.5-pro';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentModel: ModelType;
  onModelChange: (model: ModelType) => void;
}

const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  currentModel,
  onModelChange,
}) => {
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 animate-fade-in"
      onClick={onClose}
    >
      <div
        className="bg-slate-800 p-8 rounded-2xl shadow-2xl w-full max-w-md ring-1 ring-slate-700/50"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center mb-6">
            <h2 className="text-3xl font-bold text-amber-300">Настройки</h2>
            <button onClick={onClose} className="text-gray-400 hover:text-white text-2xl">&times;</button>
        </div>
        
        <div className="space-y-4">
            <p className="text-gray-300">Выберите модель для генерации толкований:</p>
            <div className="space-y-3">
                <label className="flex items-center p-4 bg-slate-700/50 rounded-lg cursor-pointer hover:bg-slate-700 transition-colors">
                    <input
                        type="radio"
                        name="model"
                        value="gemini-2.5-flash"
                        checked={currentModel === 'gemini-2.5-flash'}
                        onChange={() => onModelChange('gemini-2.5-flash')}
                        className="form-radio h-5 w-5 text-amber-400 bg-slate-600 border-slate-500 focus:ring-amber-500"
                    />
                    <div className="ml-4">
                        <span className="text-lg font-semibold text-gray-100">Flash</span>
                        <p className="text-sm text-gray-400">Быстрые и качественные ответы.</p>
                    </div>
                </label>
                <label className="flex items-center p-4 bg-slate-700/50 rounded-lg cursor-pointer hover:bg-slate-700 transition-colors">
                    <input
                        type="radio"
                        name="model"
                        value="gemini-2.5-pro"
                        checked={currentModel === 'gemini-2.5-pro'}
                        onChange={() => onModelChange('gemini-2.5-pro')}
                        className="form-radio h-5 w-5 text-amber-400 bg-slate-600 border-slate-500 focus:ring-amber-500"
                    />
                    <div className="ml-4">
                        <span className="text-lg font-semibold text-gray-100">Pro</span>
                        <p className="text-sm text-gray-400">Более глубокие и развернутые толкования.</p>
                    </div>
                </label>
            </div>
        </div>
        <div className="mt-8 text-right">
            <button onClick={onClose} className="px-6 py-2 bg-amber-400 text-slate-900 font-bold rounded-full hover:bg-amber-300 transition-colors duration-300">
                Закрыть
            </button>
        </div>
      </div>
    </div>
  );
};

export default SettingsModal;

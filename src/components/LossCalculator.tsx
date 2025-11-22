import { useState } from 'react';

interface CalculatorScenario {
  name: string;
  initialFee?: number; // фиксированная комиссия
  monthlyFeePercent?: number; // ежемесячная комиссия в %
  yearlyInterest?: number; // годовой процент
  withdrawalFeePercent?: number; // комиссия за вывод в %
  earlyWithdrawalPenalty?: number; // штраф за досрочный вывод в %
  lockPeriodMonths?: number; // период блокировки в месяцах
  description: string;
}

const scenarios: CalculatorScenario[] = [
  {
    name: 'Быстрый займ (300% годовых)',
    yearlyInterest: 300,
    withdrawalFeePercent: 0,
    lockPeriodMonths: 0,
    description: 'Займ с огромными процентами'
  },
  {
    name: 'Инвестиции с комиссиями',
    initialFee: 500,
    monthlyFeePercent: 5,
    withdrawalFeePercent: 3,
    earlyWithdrawalPenalty: 50,
    lockPeriodMonths: 3,
    description: 'Инвестиции с множеством скрытых платежей'
  },
  {
    name: 'MLM пирамида',
    monthlyFeePercent: 10,
    yearlyInterest: -50,
    lockPeriodMonths: 12,
    description: 'Сетевой маркетинг с гарантированными потерями'
  }
];

interface LossCalculatorProps {
  scenario?: CalculatorScenario;
}

export function LossCalculator({ scenario }: LossCalculatorProps) {
  const [amount, setAmount] = useState<string>('10000');
  const [months, setMonths] = useState<number>(12);
  const [selectedScenario, setSelectedScenario] = useState<CalculatorScenario>(
    scenario || scenarios[0]
  );
  
  const calculateLoss = () => {
    const principal = parseFloat(amount) || 0;
    let total = principal;
    let fees = 0;
    
    // Начальная комиссия
    if (selectedScenario.initialFee) {
      fees += selectedScenario.initialFee;
      total -= selectedScenario.initialFee;
    }
    
    // Ежемесячные комиссии
    if (selectedScenario.monthlyFeePercent) {
      const monthlyFee = (principal * selectedScenario.monthlyFeePercent / 100) * months;
      fees += monthlyFee;
      total -= monthlyFee;
    }
    
    // Годовой процент (может быть как прибыль, так и убыток)
    if (selectedScenario.yearlyInterest) {
      const years = months / 12;
      const interestAmount = principal * (selectedScenario.yearlyInterest / 100) * years;
      total += interestAmount;
    }
    
    // Комиссия за вывод
    if (selectedScenario.withdrawalFeePercent && total > 0) {
      const withdrawalFee = total * (selectedScenario.withdrawalFeePercent / 100);
      fees += withdrawalFee;
      total -= withdrawalFee;
    }
    
    // Штраф за досрочный вывод
    if (selectedScenario.earlyWithdrawalPenalty && months < (selectedScenario.lockPeriodMonths || 0)) {
      const penalty = principal * (selectedScenario.earlyWithdrawalPenalty / 100);
      fees += penalty;
      total -= penalty;
    }
    
    const loss = principal - total;
    const lossPercent = (loss / principal) * 100;
    
    return {
      principal,
      total: Math.max(0, total),
      loss: Math.max(0, loss),
      lossPercent: lossPercent,
      fees
    };
  };
  
  const result = calculateLoss();
  
  return (
    <div className="glass-card max-w-4xl mx-auto">
      <div className="text-center mb-6">
        <div className="text-5xl sm:text-6xl mb-3">🧮</div>
        <h3 className="text-2xl sm:text-3xl font-bold mb-2 break-words">
          Калькулятор реальных потерь
        </h3>
        <p className="text-sm sm:text-base opacity-90 break-words word-wrap">
          Посчитайте, сколько денег вы реально потеряете
        </p>
      </div>
      
      {/* Выбор сценария */}
      {!scenario && (
        <div className="mb-6">
          <label className="block text-base font-semibold mb-3">Выберите сценарий:</label>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {scenarios.map((s, index) => (
              <button
                key={index}
                onClick={() => setSelectedScenario(s)}
                className={`p-3 text-sm rounded-lg transition-all ${
                  selectedScenario.name === s.name
                    ? 'bg-danger text-white border-2 border-danger'
                    : 'bg-white/20 hover:bg-white/30 border-2 border-white/30'
                }`}
              >
                {s.name}
              </button>
            ))}
          </div>
          <p className="text-xs sm:text-sm mt-2 opacity-70 break-words">
            {selectedScenario.description}
          </p>
        </div>
      )}
      
      {/* Ввод данных */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
        <div>
          <label htmlFor="amount" className="block text-sm sm:text-base font-semibold mb-2">
            💰 Сумма вложения (₽):
          </label>
          <input
            type="number"
            id="amount"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            min="0"
            className="w-full px-4 py-3 text-base rounded-xl bg-white/10 border-2 border-white/30 focus:border-primary focus:outline-none transition-all text-white"
          />
        </div>
        
        <div>
          <label htmlFor="months" className="block text-sm sm:text-base font-semibold mb-2">
            📅 Срок (месяцев):
          </label>
          <input
            type="number"
            id="months"
            value={months}
            onChange={(e) => setMonths(parseInt(e.target.value) || 1)}
            min="1"
            max="60"
            className="w-full px-4 py-3 text-base rounded-xl bg-white/10 border-2 border-white/30 focus:border-primary focus:outline-none transition-all text-white"
          />
        </div>
      </div>
      
      {/* Визуализация */}
      <div className="bg-white/5 rounded-xl p-4 sm:p-6 mb-6">
        <div className="flex items-center justify-between mb-6">
          {/* Вложили */}
          <div className="text-center flex-1">
            <div className="text-3xl sm:text-4xl mb-2">💸</div>
            <div className="text-lg sm:text-xl font-bold text-success">
              {result.principal.toLocaleString('ru-RU')} ₽
            </div>
            <div className="text-xs sm:text-sm opacity-70">Вложили</div>
          </div>
          
          {/* Стрелка */}
          <div className="flex-shrink-0 mx-4">
            <svg className="w-12 h-12 sm:w-16 sm:h-16 text-danger" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
          </div>
          
          {/* Получили */}
          <div className="text-center flex-1">
            <div className="text-3xl sm:text-4xl mb-2">💔</div>
            <div className="text-lg sm:text-xl font-bold text-danger">
              {result.total.toLocaleString('ru-RU')} ₽
            </div>
            <div className="text-xs sm:text-sm opacity-70">Получили</div>
          </div>
        </div>
        
        {/* Статистика потерь */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-danger/20 rounded-lg p-4 text-center border-2 border-danger/40">
            <div className="text-2xl sm:text-3xl font-bold text-danger mb-1">
              -{result.loss.toLocaleString('ru-RU')} ₽
            </div>
            <div className="text-xs sm:text-sm opacity-90">Потери</div>
          </div>
          
          <div className="bg-danger/20 rounded-lg p-4 text-center border-2 border-danger/40">
            <div className="text-2xl sm:text-3xl font-bold text-danger mb-1">
              -{result.lossPercent.toFixed(1)}%
            </div>
            <div className="text-xs sm:text-sm opacity-90">Процент потерь</div>
          </div>
          
          <div className="bg-danger/20 rounded-lg p-4 text-center border-2 border-danger/40">
            <div className="text-2xl sm:text-3xl font-bold text-danger mb-1">
              {result.fees.toLocaleString('ru-RU')} ₽
            </div>
            <div className="text-xs sm:text-sm opacity-90">Комиссии</div>
          </div>
        </div>
      </div>
      
      {/* Предупреждение */}
      <div className="bg-primary/20 border-2 border-primary/40 rounded-xl p-4 sm:p-5">
        <div className="text-base sm:text-lg font-bold mb-2">⚠️ Важно понимать:</div>
        <ul className="space-y-2 text-sm sm:text-base break-words word-wrap leading-relaxed">
          <li>• Все комиссии и проценты складываются</li>
          <li>• Мошенники скрывают реальные цифры в мелком шрифте</li>
          <li>• Прежде чем вкладывать — посчитайте реальную выгоду</li>
          <li>• Если не можете посчитать — не вкладывайте!</li>
        </ul>
      </div>
    </div>
  );
}

